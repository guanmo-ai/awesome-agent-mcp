import test from 'node:test';
import assert from 'node:assert/strict';

const originalMatchMedia = globalThis.matchMedia;
globalThis.matchMedia = () => ({ matches: false, addEventListener() {} });
const { copy } = await import('../web/ui.mjs');
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
