const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const { outputText } = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../lib/attribution.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
});
const plain = (value) => JSON.parse(JSON.stringify(value));

function setup({ search = '', referrer = '', initial, storageBlocked = false } = {}) {
  const storage = new Map(initial === undefined ? [] : [['gb_attribution', initial]]);
  const window = {
    location: { search, host: 'growthbrain.test' },
    sessionStorage: {
      getItem: key => { if (storageBlocked) throw new Error('SecurityError'); return storage.get(key) ?? null; },
      setItem: (key, value) => { if (storageBlocked) throw new Error('SecurityError'); storage.set(key, value); },
    },
  };
  const exports = {};
  vm.runInNewContext(outputText, { exports, window, document: { referrer }, URL, URLSearchParams }, { filename: 'lib/attribution.ts' });
  return { capture: () => plain(exports.captureAttribution()), storage, window };
}

test('captures first-touch UTM and external referrer and persists them for the session', () => {
  const app = setup({ search: '?utm_source=threads&utm_medium=social&utm_campaign=beta', referrer: 'https://www.threads.net/' });
  const expected = { utmSource: 'threads', utmMedium: 'social', utmCampaign: 'beta', referrer: 'https://www.threads.net/' };
  assert.deepEqual(app.capture(), expected);
  assert.deepEqual(JSON.parse(app.storage.get('gb_attribution')), expected);
  app.window.location.search = '?utm_source=instagram';
  assert.deepEqual(app.capture(), expected);
});

test('missing UTM fields and direct/internal/invalid referrers are null', () => {
  for (const referrer of ['', 'https://growthbrain.test/privacy', 'invalid url']) {
    assert.deepEqual(setup({ referrer }).capture(), { utmSource: null, utmMedium: null, utmCampaign: null, referrer: null });
  }
});

test('blocked session storage preserves attribution from the current landing URL', () => {
  const app = setup({ search: '?utm_source=instagram&utm_campaign=beta%20launch', referrer: 'https://www.instagram.com/', storageBlocked: true });
  assert.deepEqual(app.capture(), { utmSource: 'instagram', utmMedium: null, utmCampaign: 'beta launch', referrer: 'https://www.instagram.com/' });
});

test('malformed stored JSON is recovered from the current landing URL', () => {
  const app = setup({ initial: '{broken', search: '?utm_source=threads' });
  assert.equal(app.capture().utmSource, 'threads');
  assert.equal(JSON.parse(app.storage.get('gb_attribution')).utmSource, 'threads');
});
