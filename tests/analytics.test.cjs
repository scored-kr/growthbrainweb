const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function evaluate(file, globals, requires = {}) {
  const source = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports, ...globals,
    require(name) {
      if (!(name in requires)) throw new Error(`Unexpected import: ${name}`);
      return requires[name];
    },
  }, { filename: file });
  return exports;
}

function analytics(env = {}, window = {}) {
  return evaluate('lib/analytics.ts', { process: { env }, window });
}

test('missing or blank keys leave PostHog and Pixel disabled', () => {
  const calls = [];
  const lib = analytics({ NEXT_PUBLIC_POSTHOG_KEY: ' ', NEXT_PUBLIC_META_PIXEL_ID: ' ' }, {
    fbq: (...args) => calls.push(args),
  });
  lib.track('form_start');
  lib.trackPixel('Lead');
  lib.setAnalyticsClient({ capture: (...args) => calls.push(args) });
  assert.equal(lib.posthogEnabled, false);
  assert.deepEqual(calls, []);
});

test('queued custom events flush once, preserve allowed properties, and queue is bounded', () => {
  const calls = [];
  const lib = analytics({ NEXT_PUBLIC_POSTHOG_KEY: 'test' });
  for (let i = 0; i < 55; i++) lib.track('section_view', { section: `section-${i}` });
  lib.setAnalyticsClient({ capture: (...args) => calls.push(args) });
  assert.equal(calls.length, 50);
  lib.setAnalyticsClient({ capture: (...args) => calls.push(args) });
  assert.equal(calls.length, 50);
  lib.track('form_submit', { ai_tools: ['claude'], has_other: false });
  assert.deepEqual(calls.at(-1), ['form_submit', { ai_tools: ['claude'], has_other: false }]);
});

test('SDK capture or Pixel failures cannot turn a successful form into an error', () => {
  const lib = analytics({ NEXT_PUBLIC_POSTHOG_KEY: 'test', NEXT_PUBLIC_META_PIXEL_ID: '123' }, {
    fbq() { throw new Error('Pixel blocked'); },
  });
  lib.track('form_start');
  assert.doesNotThrow(() => lib.setAnalyticsClient({ capture() { throw new Error('PostHog blocked'); } }));
  assert.doesNotThrow(() => lib.track('form_submit', { ai_tools: [], has_other: false }));
  assert.doesNotThrow(() => lib.trackPixel('Lead'));
});

test('Pixel sends only the required Lead event with no input data', () => {
  const calls = [];
  const lib = analytics({ NEXT_PUBLIC_META_PIXEL_ID: '123' }, { fbq: (...args) => calls.push(args) });
  lib.trackPixel('Lead');
  assert.deepEqual(calls, [['track', 'Lead']]);
});

function component(enabled = true, sdkFails = false) {
  const effects = [];
  const events = [];
  const initializations = [];
  const observers = [];
  const listeners = new Map();
  const target = { getAttribute: () => 'hero' };
  class Observer {
    constructor(callback, options) {
      this.callback = callback;
      this.options = options;
      observers.push(this);
    }
    observe() {}
    unobserve() {}
    disconnect() { this.disconnected = true; }
  }
  const lib = {
    POSTHOG_KEY: enabled ? 'test' : '', POSTHOG_HOST: 'https://example.com', META_PIXEL_ID: '',
    posthogEnabled: enabled,
    setAnalyticsClient() {},
    track: (...args) => events.push(JSON.parse(JSON.stringify(args))),
  };
  const sdk = {
    init(key, options) {
      if (sdkFails) throw new Error('SDK blocked');
      initializations.push({ key, options });
    },
  };
  const result = evaluate('components/Analytics.tsx', {
    IntersectionObserver: Observer,
    window: { IntersectionObserver: Observer },
    document: {
      addEventListener: (name, fn) => listeners.set(name, fn),
      removeEventListener: (name) => listeners.delete(name),
      querySelectorAll: () => [target],
    },
  }, {
    '@/lib/analytics': lib, 'posthog-js': sdk, 'next/script': () => null,
    'react': { useEffect: fn => effects.push(fn), useRef: current => ({ current }) },
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }) },
  });
  return { ...result, effects, events, initializations, observers, listeners, target };
}

test('component with no keys mounts no SDK, observers, listeners or Pixel script', async () => {
  const c = component(false);
  assert.equal(c.default(), null);
  c.effects.forEach(fn => fn());
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(c.initializations.length, 0);
  assert.equal(c.observers.length, 0);
  assert.equal(c.listeners.size, 0);
});

test('Strict Mode effect replay initializes once and section_view requires 50% once', async () => {
  const c = component();
  c.default();
  let cleanups = c.effects.map(fn => fn());
  let observer = c.observers.at(-1);
  const emit = ratio => observer.callback([{ target: c.target, isIntersecting: true,
    intersectionRatio: ratio, intersectionRect: { height: 1000 } }]);
  emit(0.49);
  assert.equal(c.events.length, 0, 'a tall section is not counted before 50%');
  emit(0.5);
  emit(1);
  cleanups.forEach(fn => fn?.());
  assert.equal(observer.disconnected, true);
  cleanups = c.effects.map(fn => fn());
  observer = c.observers.at(-1);
  emit(0.5);
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(c.events, [['section_view', { section: 'hero' }]]);
  assert.equal(c.initializations.length, 1);
  assert.equal(c.initializations[0].options.session_recording.maskAllInputs, true);
  assert.equal(c.initializations[0].options.autocapture, false);
  assert.equal(c.initializations[0].options.capture_pageview, true);
  assert.equal(c.initializations[0].options.disable_session_recording, false);
  c.listeners.get('click')({ target: { closest: () => ({ getAttribute: () => 'header' }) } });
  assert.deepEqual(c.events.at(-1), ['cta_click', { location: 'header' }]);
  cleanups.forEach(fn => fn?.());
  assert.equal(c.listeners.size, 0);
});

test('blocked SDK initialization resolves without an unhandled rejection', async () => {
  const c = component(true, true);
  c.default();
  c.effects.forEach(fn => fn());
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(c.initializations.length, 0);
});
