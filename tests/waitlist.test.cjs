const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Execute the real TypeScript modules with isolated configuration and fetch.
// No credentials or network calls are needed, and process.env is never mutated.
function loadModule(file, globals = {}) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const exports = {};
  vm.runInNewContext(outputText, { exports, ...globals }, { filename: file });
  return exports;
}

const { MESSAGES } = loadModule('lib/waitlist.ts');
const validInput = () => ({ email: 'person@example.com', aiTools: ['claude'], aiOther: '', consent: true });
const plain = (value) => JSON.parse(JSON.stringify(value));

function setup(env = {}, response = () => new Response(null, { status: 201 })) {
  const calls = [];
  const logs = [];
  const module = loadModule('app/actions.ts', {
    require(name) {
      assert.equal(name, '@/lib/waitlist');
      return loadModule('lib/waitlist.ts');
    },
    process: { env },
    AbortSignal,
    Error,
    console: { error: (...args) => logs.push(args) },
    fetch: async (...args) => { calls.push(args); return response(...args); },
  });
  return { submit: module.submitWaitlist, calls, logs };
}

const configured = { SUPABASE_URL: 'https://example.supabase.co///', SUPABASE_SERVICE_ROLE_KEY: 'test-only-key' };

test('missing Supabase config returns the safe error with one non-sensitive log and no request', async () => {
  for (const env of [{}, { SUPABASE_URL: configured.SUPABASE_URL }, { SUPABASE_SERVICE_ROLE_KEY: configured.SUPABASE_SERVICE_ROLE_KEY }]) {
    const app = setup(env);
    assert.deepEqual(plain(await app.submit(validInput())), { ok: false, reason: 'server', message: MESSAGES.server });
    assert.deepEqual(app.logs, [['SUPABASE env missing']]);
    assert.equal(app.calls.length, 0);
  }
});

test('dry run succeeds without persistence in development', async () => {
  const app = setup({ NODE_ENV: 'development', WAITLIST_DRY_RUN: '1' });
  assert.equal((await app.submit(validInput())).ok, true);
  assert.equal(app.calls.length, 0);
  assert.equal(app.logs.length, 0);
});

test('production ignores dry run and requires real storage configuration', async () => {
  const app = setup({ NODE_ENV: 'production', WAITLIST_DRY_RUN: '1' });
  assert.equal((await app.submit(validInput())).reason, 'server');
  assert.equal(app.calls.length, 0);
  const configuredApp = setup({ ...configured, NODE_ENV: 'production', WAITLIST_DRY_RUN: '1' });
  assert.equal((await configuredApp.submit(validInput())).ok, true);
  assert.equal(configuredApp.calls.length, 1);
});

test('invalid/missing/overlong email and missing consent are rejected before storage', async () => {
  const app = setup(configured);
  for (const input of [undefined, null, {}, { ...validInput(), email: 'invalid' }, { ...validInput(), email: 'a'.repeat(250) + '@example.com' }]) {
    assert.equal((await app.submit(input)).reason, 'invalid_email');
  }
  for (const consent of [false, undefined, 'true', 1]) {
    assert.equal((await app.submit({ ...validInput(), consent })).reason, 'consent');
  }
  assert.equal(app.calls.length, 0);
});

test('dry run still enforces input validation and explicit consent', async () => {
  const app = setup({ NODE_ENV: 'development', WAITLIST_DRY_RUN: '1' });
  assert.equal((await app.submit({ ...validInput(), email: 'invalid' })).reason, 'invalid_email');
  assert.equal((await app.submit({ ...validInput(), consent: false })).reason, 'consent');
  assert.equal(app.calls.length, 0);
});

test('honeypot submissions return success without persistence or sensitive logs', async () => {
  const app = setup(configured);
  assert.equal((await app.submit({ ...validInput(), company: 'spam' })).ok, true);
  assert.equal(app.calls.length, 0);
  assert.equal(app.logs.length, 0);
});

test('successful submission normalizes data and sends attribution plus consent timestamp', async () => {
  const app = setup(configured);
  const before = Date.now();
  const result = await app.submit({
    ...validInput(), email: '  Person@EXAMPLE.com  ', aiTools: ['claude', 'other', 'claude', 'bad', null],
    aiOther: '  Perplexity  ', utmSource: ' threads ', utmMedium: 'social', utmCampaign: 'launch',
    referrer: 'https://www.threads.net/',
  });
  assert.equal(result.ok, true);
  assert.equal(app.calls.length, 1);
  const [url, request] = app.calls[0];
  assert.equal(url, 'https://example.supabase.co/rest/v1/waitlist');
  assert.equal(request.method, 'POST');
  assert.equal(request.cache, 'no-store');
  assert.equal(request.headers.apikey, configured.SUPABASE_SERVICE_ROLE_KEY);
  assert.equal(request.headers.Authorization, `Bearer ${configured.SUPABASE_SERVICE_ROLE_KEY}`);
  assert.equal(request.headers.Prefer, 'return=minimal');
  assert.ok(request.signal instanceof AbortSignal);
  const row = JSON.parse(request.body);
  const consentTime = Date.parse(row.consent_at);
  assert.ok(consentTime >= before && consentTime <= Date.now());
  delete row.consent_at;
  assert.deepEqual(row, {
    email: 'person@example.com', ai_tools: ['claude', 'other'], ai_other: 'Perplexity',
    utm_source: 'threads', utm_medium: 'social', utm_campaign: 'launch', referrer: 'https://www.threads.net/',
  });
  assert.equal(app.logs.length, 0);
});

test('optional values are bounded and unselected other text is not stored', async () => {
  const app = setup(configured);
  await app.submit({ ...validInput(), aiTools: 'claude', aiOther: 'ignored', utmSource: 'x'.repeat(300), utmMedium: ' ', utmCampaign: 12, referrer: 'y'.repeat(700) });
  const row = JSON.parse(app.calls[0][1].body);
  assert.deepEqual(row.ai_tools, []);
  assert.equal(row.ai_other, null);
  assert.equal(row.utm_source.length, 200);
  assert.equal(row.utm_medium, null);
  assert.equal(row.utm_campaign, null);
  assert.equal(row.referrer.length, 500);
  await app.submit({ ...validInput(), aiTools: ['other'], aiOther: 'x'.repeat(200) });
  assert.equal(JSON.parse(app.calls[1][1].body).ai_other.length, 100);
});

test('duplicate status or Postgres unique violation returns the duplicate message', async () => {
  for (const [status, body] of [[409, {}], [400, { code: '23505' }]]) {
    const app = setup(configured, () => Response.json(body, { status }));
    assert.deepEqual(plain(await app.submit(validInput())), { ok: false, reason: 'duplicate', message: MESSAGES.duplicate });
    assert.equal(app.logs.length, 0);
  }
});

test('upstream errors return a safe message and never log the email-containing response body', async () => {
  const app = setup(configured, () => Response.json({ code: '42501', message: 'person@example.com cannot insert', details: 'private' }, { status: 500 }));
  assert.equal((await app.submit(validInput())).reason, 'server');
  assert.deepEqual(app.logs, [['waitlist insert failed', 500, '42501']]);
  assert.ok(!JSON.stringify(app.logs).includes('person@example.com'));
});

test('non-JSON upstream error and network timeout fail safely', async () => {
  const invalidJson = setup(configured, () => new Response('upstream failure person@example.com', { status: 502 }));
  assert.equal((await invalidJson.submit(validInput())).reason, 'server');
  assert.ok(!JSON.stringify(invalidJson.logs).includes('person@example.com'));
  const timeout = setup(configured, () => { const error = new Error('person@example.com'); error.name = 'TimeoutError'; throw error; });
  assert.equal((await timeout.submit(validInput())).reason, 'server');
  assert.deepEqual(timeout.logs, [['waitlist insert error', 'TimeoutError']]);
});

test('untrusted upstream error codes cannot put an email address into logs', async () => {
  for (const code of ['person@example.com', { email: 'person@example.com' }, ['person@example.com']]) {
    const app = setup(configured, () => Response.json({ code }, { status: 500 }));
    assert.equal((await app.submit(validInput())).reason, 'server');
    assert.deepEqual(app.logs, [['waitlist insert failed', 500, '']]);
    assert.ok(!JSON.stringify(app.logs).includes('person@example.com'));
  }
});

test('untrusted exception names cannot put an email address into logs', async () => {
  const app = setup(configured, () => {
    const error = new Error('sensitive server detail person@example.com');
    error.name = 'person@example.com';
    throw error;
  });
  assert.equal((await app.submit(validInput())).reason, 'server');
  assert.deepEqual(app.logs, [['waitlist insert error', 'Error']]);
  assert.ok(!JSON.stringify(app.logs).includes('person@example.com'));
});
