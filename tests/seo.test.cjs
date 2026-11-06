const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Load the actual route modules without running a server or adding a test runtime.
const root = path.resolve(__dirname, '..');
const previousTsLoader = require.extensions['.ts'];
require.extensions['.ts'] = (module, filename) => {
  const originalRequire = module.require.bind(module);
  module.require = (id) => originalRequire(id.startsWith('@/') ? path.join(root, id.slice(2)) : id);
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: filename,
  });
  module._compile(outputText, filename);
};

const { FAQS, SITE_URL, SITE_NAME, CONTACT_EMAIL, HAS_CONTACT_EMAIL } = require('../lib/site.ts');
const { landingJsonLd } = require('../lib/jsonld.ts');
const { default: sitemap } = require('../app/sitemap.ts');
const { default: robots } = require('../app/robots.ts');
const { GET, dynamic } = require('../app/llms.txt/route.ts');
if (previousTsLoader) require.extensions['.ts'] = previousTsLoader;
else delete require.extensions['.ts'];

const absoluteUrl = (value) => {
  const url = new URL(value);
  assert.ok(['http:', 'https:'].includes(url.protocol));
  assert.equal(url.origin, new URL(SITE_URL).origin);
};

test('JSON-LD links organization, website and application with consistent public URLs', () => {
  const data = JSON.parse(JSON.stringify(landingJsonLd()));
  assert.equal(data['@context'], 'https://schema.org');
  const types = new Map(data['@graph'].map((entity) => [entity['@type'], entity]));
  for (const type of ['Organization', 'WebSite', 'SoftwareApplication', 'FAQPage']) {
    assert.ok(types.has(type), `Missing ${type}`);
  }
  const org = types.get('Organization');
  assert.equal(org.name, SITE_NAME);
  absoluteUrl(org.url);
  absoluteUrl(org.logo);
  assert.ok(fs.existsSync(path.join(root, 'public', new URL(org.logo).pathname)));
  for (const type of ['WebSite', 'SoftwareApplication']) {
    const entity = types.get(type);
    absoluteUrl(entity.url);
    assert.equal(entity.publisher['@id'], org['@id']);
    assert.equal(entity.inLanguage, 'ko-KR');
  }
  const app = types.get('SoftwareApplication');
  assert.equal(app.applicationCategory, 'BusinessApplication');
  assert.equal(app.operatingSystem, 'Web');
  assert.equal('offers' in app, false, 'Do not advertise a price before it is decided');
  assert.equal('sameAs' in org, false, 'Social accounts are not configured yet');
});

test('FAQ schema repeats all three visible FAQ questions and approved answers exactly', () => {
  const faq = landingJsonLd()['@graph'].find((entity) => entity['@type'] === 'FAQPage');
  assert.equal(faq.mainEntity.length, 3);
  assert.deepEqual(faq.mainEntity.map((entry) => {
    assert.equal(entry['@type'], 'Question');
    assert.equal(entry.acceptedAnswer['@type'], 'Answer');
    return { question: entry.name, answer: entry.acceptedAnswer.text };
  }), FAQS);
});

test('sitemap publishes the landing and privacy pages on the configured site', () => {
  const entries = sitemap();
  assert.deepEqual(entries.map((entry) => entry.url), [`${SITE_URL}/`, `${SITE_URL}/privacy`]);
  for (const entry of entries) absoluteUrl(entry.url);
});

test('robots permits search engines and named AI crawlers and points to the sitemap', () => {
  const result = robots();
  assert.equal(result.sitemap, `${SITE_URL}/sitemap.xml`);
  const agents = new Map();
  for (const rule of result.rules) {
    for (const agent of [rule.userAgent].flat()) agents.set(agent, rule);
  }
  for (const agent of ['*', 'GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended']) {
    assert.equal(agents.get(agent)?.allow, '/', `${agent} must be permitted`);
    assert.equal(agents.get(agent)?.disallow, undefined);
  }
});

test('llms.txt is a static UTF-8 response with factual beta information and working site links', async () => {
  assert.equal(dynamic, 'force-static');
  const response = GET();
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /text\/plain; charset=utf-8/i);
  const body = await response.text();
  for (const text of ['Growth Brain', '현재 진행 상태', '주요 결정과 그 이유', '다음 작업', '관련 작업물', 'ChatGPT', 'Claude', '베타 대기 신청 중', `${SITE_URL}/#waitlist`, `${SITE_URL}/privacy`]) {
    assert.ok(body.includes(text), `Missing ${text}`);
  }
  if (HAS_CONTACT_EMAIL) assert.ok(body.includes(CONTACT_EMAIL));
  else assert.equal(body.includes('[문의 이메일]'), false);
});
