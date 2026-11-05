import { esc, tokens, textMatch, highlight, logoHtml, typeTags } from './render.mjs';
import { openDialog, closeDialog, wireDialog } from './motion.mjs';
import { themeTransition } from './fx.mjs';
export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];
let catalog;
export function loadCatalog() {
  if (!catalog) {
    const url = new URL('./services.json', import.meta.url);
    url.search = new URL(import.meta.url).search;
    catalog = fetch(url).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    }).catch((error) => { catalog = undefined; throw error; });
  }
  return catalog;
}
const FEATURED = ['amap', 'meituan', 'feishu', 'alipay', 'didi', 'zhihu', 'dingtalk', 'wechat-pay', 'taobao', 'luckin', 'tencent-docs', 'kling', 'aliyun', 'baidu-netdisk', 'weread', 'netease-music', 'mcdonalds-cn', 'fliggy', 'wecom', 'huawei-cloud'];
export function selectCodeTab(tab) {
  const box = tab.closest('.code-tabs');
  $$('[data-tab]', box).forEach((b) => { b.setAttribute('aria-selected', b === tab); b.tabIndex = b === tab ? 0 : -1; });
  const code = tab.dataset.code;
  $('code', box).textContent = code;
  $('.ct-copy', box).dataset.copy = code;
}

export async function loadStars(DB) {
  const el = $('#star-count');
  const fmt = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n));
  const key = 'stars:' + DB.site.repo;
  let n;
  try {
    const hit = JSON.parse(sessionStorage.getItem(key) || 'null');
    if (hit && Date.now() - hit.t < 600000) n = hit.n;
  } catch {}
  if (n === undefined) {
    try {
      const r = await fetch(`https://api.github.com/repos/${DB.site.repo}`, { signal: AbortSignal.timeout(2500) });
      if (!r.ok) return;
      n = (await r.json()).stargazers_count;
      try { sessionStorage.setItem(key, JSON.stringify({ n, t: Date.now() })); } catch {}
    } catch { return; }
  }
  if (typeof n === 'number' && n > 0) { el.textContent = fmt(n); el.hidden = false; }
}

const copyFeedback = new WeakMap();
export async function copy(text, btn, msg = '已复制') {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const focused = document.activeElement;
    const ta = Object.assign(document.createElement('textarea'), { value: text });
    ta.style.cssText = 'position:fixed;opacity:0';
    (btn?.closest('dialog') ?? document.body).append(ta);
    ta.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch {}
    ta.remove();
    focused?.focus({ preventScroll: true });
    if (!copied) { toast('复制失败，请选中文字手动复制。'); return; }
  }
  toast(msg);
  if (btn && (btn.classList.contains('btn') || btn.classList.contains('ct-copy'))) {
    const previous = copyFeedback.get(btn);
    clearTimeout(previous?.timer);
    const old = previous?.html ?? btn.innerHTML;
    btn.classList.add('done');
    btn.textContent = '已复制 ✓';
    const timer = setTimeout(() => { btn.innerHTML = old; btn.classList.remove('done'); copyFeedback.delete(btn); }, 1400);
    copyFeedback.set(btn, { html: old, timer });
  }
}
let toastTimer;
export function toast(msg) {
  const t = $('#toast');
  (document.querySelector('dialog[open]') ?? document.body).append(t);
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 1700);
}

// Same nav, theme, copy, code tabs and palette behavior on the home and static pages.
export function initChrome({ getData, onChoose, beforeOpen = () => {}, prefix = './', focusSearch, loadData }) {
  const nav = $('#nav');
  const onScroll = () => nav?.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  $('#kbar-key').textContent = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘K' : 'Ctrl K';
  $('#theme').addEventListener('click', (e) => {
    const root = document.documentElement;
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    themeTransition(e.currentTarget, () => {
      root.dataset.theme = dark ? 'light' : 'dark';
      try { localStorage.setItem('theme', root.dataset.theme); } catch {}
    });
  });
  if (!$('#palette')) document.body.insertAdjacentHTML('beforeend', PALETTE_HTML);
  const pal = $('#palette');
  wireDialog(pal);
  const input = $('#pal-q');
  const list = $('#pal-list');
  let items = [], active = 0, choosing = false;
  const saveSearch = () => {
    if (pal.open && history.state?.overlay === 'search') history.replaceState({ overlay: 'search', query: input.value, active, top: list.scrollTop }, '');
  };
  const paint = (scroll = true) => {
    $$('.pal-item', pal).forEach((el, i) => el.setAttribute('aria-selected', i === active));
    const cur = items[active];
    if (!cur) { input.removeAttribute('aria-activedescendant'); saveSearch(); return; }
    input.setAttribute('aria-activedescendant', `pal-${cur.id}`);
    if (scroll) document.getElementById(`pal-${cur.id}`)?.scrollIntoView({ block: 'nearest' });
    saveSearch();
  };
  const render = () => {
    const db = getData();
    if (!db) return;
    const toks = tokens(input.value.trim());
    const byId = new Map(db.services.map((s) => [s.id, s]));
    items = toks.length ? db.services.filter((s) => textMatch(s, toks, db)).slice(0, 50) : FEATURED.map((id) => byId.get(id)).filter(Boolean).slice(0, 8);
    active = 0;
    if (!items.length) {
      list.innerHTML = `<div class="pal-empty">没有找到「${esc(input.value)}」。<a href="https://github.com/${esc(db.site.repo)}/issues/new?template=submit.yml" target="_blank" rel="noopener">提交给我们</a></div>`;
      paint(false);
      return;
    }
    list.innerHTML = `<div class="pal-group">${toks.length ? `${items.length} 个结果` : '常用'}</div>` + items.map((s) => `
      <button class="pal-item" type="button" role="option" id="pal-${esc(s.id)}" data-id="${esc(s.id)}" aria-selected="false">
        ${logoHtml(s, '', prefix)}<span class="pal-text"><b>${highlight(s.name, toks)}</b><p class="domain">${highlight(s.summary, toks)}</p></span>
        <span class="pal-meta">${typeTags(s, db.labels)}</span>
      </button>`).join('');
    paint();
  };
  const restoreSearch = () => {
    const saved = history.state;
    if (saved?.overlay !== 'search') { if (pal.open) pal.close(); return; }
    if (!getData()) return;
    choosing = false;
    beforeOpen();
    input.value = saved.query;
    openDialog(pal);
    render();
    active = Math.min(saved.active, Math.max(0, items.length - 1));
    paint(false);
    input.focus({ preventScroll: true });
    list.scrollTop = saved.top;
    saveSearch();
  };
  const choose = (id) => {
    active = items.findIndex((s) => s.id === id);
    saveSearch();
    choosing = true;
    pal.close();
    onChoose(id);
  };
  let loading = false;
  const toggle = async () => {
    if (pal.open) { closeDialog(pal); return; }
    if (!getData() && loadData) {
      if (loading) return;
      loading = true;
      try { await loadData(); }
      catch { toast('搜索载入失败，请检查网络后重试。'); return; }
      finally { loading = false; }
      if (pal.open) return;
    }
    if (!getData()) { toast('服务索引正在载入，请稍后重试。'); return; }
    const hash = location.hash.startsWith('#s-') ? '' : location.hash;
    history.pushState({ overlay: 'search', query: input.value, active, top: list.scrollTop }, '', location.pathname + location.search + hash);
    restoreSearch();
  };
  pal.addEventListener('close', () => {
    if (choosing) { choosing = false; return; }
    if (history.state?.overlay === 'search') history.back();
  });
  list.addEventListener('scroll', saveSearch, { passive: true });
  addEventListener('popstate', restoreSearch);
  addEventListener('pageshow', restoreSearch);
  input.addEventListener('input', render);
  input.addEventListener('keydown', (e) => {
    if (e.isComposing || e.keyCode === 229) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!items.length) return;
      active = (active + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length;
      paint();
    } else if (e.key === 'Enter' && items[active]) { e.preventDefault(); choose(items[active].id); }
  });
  pal.addEventListener('click', (e) => {
    if (e.target === pal) { closeDialog(pal); return; }
    const it = e.target.closest('.pal-item');
    if (it) choose(it.dataset.id);
  });
  pal.addEventListener('mousemove', (e) => {
    const it = e.target.closest('.pal-item');
    if (!it) return;
    const i = items.findIndex((s) => s.id === it.dataset.id);
    if (i !== active) { active = i; paint(false); }
  });
  $('#open-palette').addEventListener('click', toggle);
  addEventListener('keydown', (e) => {
    if (e.isComposing || e.keyCode === 229) return;
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); toggle(); return; }
    const el = document.activeElement;
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(el?.tagName) || el?.isContentEditable;
    if (e.key === '/' && !typing && !document.querySelector('dialog[open]')) {
      e.preventDefault();
      if (focusSearch) focusSearch(); else toggle();
    }
    const tab = e.target.closest?.('[data-tab]');
    if (!tab || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const tabs = $$('[data-tab]', tab.closest('.code-tabs'));
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (tabs.indexOf(tab) + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
    selectCodeTab(tabs[next]); tabs[next].focus();
  });
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-copy]');
    if (b) copy(b.dataset.copy, b);
    const tab = e.target.closest('[data-tab]');
    if (tab) selectCodeTab(tab);
  });
  const syncVisibility = () => document.documentElement.classList.toggle('page-paused', document.hidden);
  document.addEventListener('visibilitychange', syncVisibility);
  syncVisibility();
  return restoreSearch;
}

const PALETTE_HTML = `<dialog class="palette" id="palette" aria-label="搜索服务">
    <div class="pal-in">
      <label class="pal-search">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/></svg>
        <input id="pal-q" type="text" aria-label="搜索服务或能力" placeholder="搜索服务或能力，比如：外卖、文档、股票" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="true" aria-controls="pal-list" aria-autocomplete="list">
        <kbd>esc</kbd>
      </label>
      <div class="pal-list" id="pal-list" role="listbox" aria-label="搜索结果"></div>
      <div class="pal-foot" aria-hidden="true"><span><kbd>↑</kbd><kbd>↓</kbd> 选择</span><span><kbd>↵</kbd> 打开</span><span><kbd>esc</kbd> 关闭</span></div>
    </div>
  </dialog>`;
