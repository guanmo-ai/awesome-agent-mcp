import test from 'node:test';
import assert from 'node:assert/strict';

const preference = new EventTarget();
preference.matches = false;
const originalMatchMedia = globalThis.matchMedia;
globalThis.matchMedia = () => preference;
const { initFx, themeTransition, morphFromCard } = await import('../web/fx.mjs');
globalThis.matchMedia = originalMatchMedia;

function setup(t, reduced = false) {
  const element = () => {
    const classes = new Set();
    return { classList: {
      add: (c) => classes.add(c), remove: (c) => classes.delete(c), contains: (c) => classes.has(c),
      toggle(c, on) { if (on) classes.add(c); else classes.delete(c); },
    } };
  };
  const root = element(), block = element(), dialog = { open: true };
  preference.matches = reduced;
  const globals = {
    matchMedia: () => ({ matches: false }), location: { hash: '' },
    document: { documentElement: root,
      querySelector: (s) => s === 'dialog[open]' && dialog.open ? dialog : null,
      querySelectorAll: (s) => s === 'dialog' ? [dialog] : s === '.fx-reveal' || s.startsWith('.demo ') ? [block] : [],
    },
    MutationObserver: class { observe() {} },
    IntersectionObserver: class { observe() {} unobserve() {} },
  };
  for (const [key, value] of Object.entries(globals)) {
    const old = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
    t.after(() => { if (old) Object.defineProperty(globalThis, key, old); else delete globalThis[key]; });
  }
  return { root, block };
}

test('首次载入已有详情时立即暂停背景动画', (t) => {
  const { root } = setup(t, true);
  initFx();
  assert.equal(root.classList.contains('modal-open'), true);
});

test('页面打开后启用减少动态效果，立即移除景深并显示尚未进入的内容', (t) => {
  const { root, block } = setup(t);
  initFx();
  assert.equal(root.classList.contains('fx'), true);
  assert.equal(block.classList.contains('in'), false);
  preference.matches = true;
  preference.dispatchEvent(new Event('change'));
  assert.equal(root.classList.contains('fx'), false);
  assert.equal(block.classList.contains('in'), true);
});

test('没有 View Transitions 时主题和详情立即生效且不访问动画 API', (t) => {
  setup(t);
  let themes = 0, opened = 0;
  themeTransition({}, () => themes++);
  morphFromCard({ querySelector: () => ({}) }, () => opened++);
  assert.equal(themes, 1);
  assert.equal(opened, 1);
});
