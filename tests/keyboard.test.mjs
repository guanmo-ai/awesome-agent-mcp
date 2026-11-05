import test from 'node:test';
import assert from 'node:assert/strict';

test('输入法组合态的方向键和确认键不改变搜索选择，普通按键仍可选择', async (t) => {
  class Element extends EventTarget {
    open = false; value = ''; scrollTop = 0; innerHTML = ''; dataset = {};
    classList = { toggle() {}, add() {}, remove() {} };
    querySelectorAll() { return []; }
    setAttribute() {} removeAttribute() {} focus() {}
    showModal() { this.open = true; } close() { this.open = false; }
  }
  const elements = Object.fromEntries(['#nav', '#kbar-key', '#theme', '#palette', '#pal-q', '#pal-list', '#open-palette'].map((s) => [s, new Element()]));
  const globals = {
    matchMedia: () => ({ matches: true, addEventListener() {} }), scrollY: 0, addEventListener() {},
    location: { pathname: '/', search: '', hash: '' }, navigator: { platform: 'MacIntel' },
    history: { state: { overlay: 'search', query: '', active: 0, top: 0 }, replaceState(state) { this.state = state; }, back() {} },
    document: { hidden: false, body: new Element(), documentElement: new Element(), querySelector: (s) => elements[s] ?? null, getElementById: () => null, addEventListener() {} },
  };
  for (const [key, value] of Object.entries(globals)) {
    const old = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
    t.after(() => { if (old) Object.defineProperty(globalThis, key, old); else delete globalThis[key]; });
  }
  const { initChrome } = await import('../web/ui.mjs');
  const db = {
    services: ['amap', 'meituan'].map((id) => ({ id, name: id, summary: '示例服务', types: ['mcp'] })),
    labels: { types: { mcp: 'MCP' } },
  };
  let chosen;
  initChrome({ getData: () => db, onChoose: (id) => { chosen = id; } })();
  const key = (name, isComposing, keyCode) => {
    const event = Object.assign(new Event('keydown', { cancelable: true }), { key: name, isComposing, keyCode });
    elements['#pal-q'].dispatchEvent(event);
    return event;
  };
  for (const legacy of [false, true]) {
    assert.equal(key('ArrowDown', !legacy, legacy ? 229 : 40).defaultPrevented, false);
    assert.equal(key('Enter', !legacy, legacy ? 229 : 13).defaultPrevented, false);
    assert.equal(history.state.active, 0);
    assert.equal(chosen, undefined);
    assert.equal(elements['#palette'].open, true);
  }
  key('ArrowDown', false, 40); key('Enter', false, 13);
  assert.equal(chosen, 'meituan');
  assert.equal(elements['#palette'].open, false);
});
