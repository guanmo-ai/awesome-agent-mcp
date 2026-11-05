import test from 'node:test';
import assert from 'node:assert/strict';

const originalMatchMedia = globalThis.matchMedia;
globalThis.matchMedia = () => ({ matches: false, addEventListener() {} });
const { copy, loadCatalog } = await import('../web/ui.mjs');
globalThis.matchMedia = originalMatchMedia;

function setup(t, { clipboardFails = false, fallback = false } = {}) {
  const oldDocument = globalThis.document;
  const oldNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  const classes = new Set();
  const toast = { textContent: '', classList: { add() {}, remove() {} } };
  let contents = '复制', written, removed = false, focused = false;
  const button = {
    classList: { contains: (c) => c === 'btn', add: (c) => classes.add(c), remove: (c) => classes.delete(c) },
    closest: () => null,
    get innerHTML() { return contents; }, set innerHTML(v) { contents = v; },
    set textContent(v) { contents = v; },
    focus() { focused = true; },
  };
  globalThis.document = {
    activeElement: button,
    body: { append() {} },
    querySelector: (s) => s === '#toast' ? toast : null,
    createElement: () => ({ style: {}, select() {}, remove() { removed = true; } }),
    execCommand: () => fallback,
  };
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: {
    clipboard: { async writeText(text) { if (clipboardFails) throw Error('denied'); written = text; } },
  } });
  t.after(() => {
    globalThis.document = oldDocument;
    if (oldNavigator) Object.defineProperty(globalThis, 'navigator', oldNavigator);
    else delete globalThis.navigator;
  });
  return { toast, button, classes, get written() { return written; }, get removed() { return removed; }, get focused() { return focused; } };
}

test('复制被浏览器拒绝且备用复制失败时，不显示成功状态', async (t) => {
  const ui = setup(t, { clipboardFails: true });
  await copy('配置', ui.button);
  assert.match(ui.toast.textContent, /复制失败/);
  assert.equal(ui.button.innerHTML, '复制');
  assert.equal(ui.classes.has('done'), false);
  assert.equal(ui.removed, true);
});

test('备用复制成功后，恢复原按钮焦点', async (t) => {
  const ui = setup(t, { clipboardFails: true, fallback: true });
  await copy('配置', ui.button);
  assert.equal(ui.toast.textContent, '已复制');
  assert.equal(ui.focused, true);
});

test('快速连续复制后，按钮仍恢复原始文字', async (t) => {
  const ui = setup(t);
  await copy('第一段', ui.button);
  await copy('第二段', ui.button);
  assert.equal(ui.written, '第二段');
  await new Promise((resolve) => setTimeout(resolve, 1500));
  assert.equal(ui.button.innerHTML, '复制');
  assert.equal(ui.classes.has('done'), false);
});

test('目录请求失败后可以重试，成功请求仍复用结果', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let requests = 0;
  globalThis.fetch = async () => {
    if (++requests === 1) throw new Error('网络中断');
    return new Response('{"count":93}', { headers: { 'Content-Type': 'application/json' } });
  };
  await assert.rejects(loadCatalog(), /网络中断/);
  const retry = loadCatalog();
  assert.equal(loadCatalog(), retry);
  assert.deepEqual(await retry, { count: 93 });
  assert.equal(requests, 2);
});

test('搜索显示全部匹配项，关闭按钮通过历史记录返回', async (t) => {
  class Element extends EventTarget {
    open = false; value = ''; scrollTop = 0; innerHTML = ''; dataset = {};
    classList = { toggle() {}, add() {}, remove() {} };
    querySelectorAll() { return []; }
    setAttribute() {} removeAttribute() {} focus() {}
    showModal() { this.open = true; }
    close() { this.open = false; this.dispatchEvent(new Event('close')); }
  }
  const elements = Object.fromEntries(['#nav', '#kbar-key', '#theme', '#palette', '#pal-q', '#pal-list', '#open-palette'].map((s) => [s, new Element()]));
  let backCalls = 0;
  const globals = {
    matchMedia: () => ({ matches: true, addEventListener() {} }), scrollY: 0, addEventListener() {},
    location: { pathname: '/', search: '', hash: '' }, navigator: { platform: 'MacIntel' },
    history: { state: { overlay: 'search', query: '服务', active: 0, top: 0 }, replaceState(state) { this.state = state; }, back() { backCalls++; } },
    document: { hidden: false, body: new Element(), documentElement: new Element(), querySelector: (s) => elements[s] ?? null, getElementById: () => null, addEventListener() {} },
  };
  for (const [key, value] of Object.entries(globals)) {
    const old = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
    t.after(() => { if (old) Object.defineProperty(globalThis, key, old); else delete globalThis[key]; });
  }
  const { initChrome } = await import('../web/ui.mjs');
  const db = {
    site: { repo: 'guanmo-ai/awesome-agent-mcp' },
    services: Array.from({ length: 60 }, (_, i) => ({ id: `service-${i}`, name: `服务 ${i}`, summary: '示例', url: 'https://example.com', types: ['mcp'], access: [], risk: 'low' })),
    categories: [], labels: { types: { mcp: 'MCP' }, access: {}, risk: { low: '低' } },
  };
  initChrome({ getData: () => db, onChoose() {} })();
  assert.match(elements['#pal-list'].innerHTML, /60 个结果/);
  assert.match(elements['#pal-list'].innerHTML, /id="pal-service-59"/);
  const query = '不存在 & <中文> # ?';
  elements['#pal-q'].value = query;
  elements['#pal-q'].dispatchEvent(new Event('input'));
  const href = elements['#pal-list'].innerHTML.match(/href="([^"]+)"/)[1].replaceAll('&amp;', '&');
  assert.equal(new URL(href).searchParams.get('title'), '[收录] ' + query);
  assert.equal(new URL(href).searchParams.get('template'), 'submit.yml');
  assert.ok(elements['#pal-list'].innerHTML.includes('&lt;中文&gt;'));
  const click = new Event('click');
  Object.defineProperty(click, 'target', { value: { closest: (selector) => selector === '[data-close-palette]' ? {} : null } });
  elements['#palette'].dispatchEvent(click);
  assert.equal(elements['#palette'].open, false);
  assert.equal(backCalls, 1);
});
