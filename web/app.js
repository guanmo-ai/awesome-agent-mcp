const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const safeUrl = (u) => (/^https:\/\//.test(u ?? '') ? u : '#');
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} },
};
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const ICON = {
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
  out: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>',
  x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
};
const CAT_ICON = {
  life: '<path d="M12 21s-6.5-5.6-6.5-10.5a6.5 6.5 0 1 1 13 0C18.5 15.4 12 21 12 21Z"/><circle cx="12" cy="10.5" r="2.3"/>',
  office: '<rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M8.5 7V5.5A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.5 1.5V7M3 12.5h18"/>',
  notes: '<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5v-15Z"/><path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19M9 7.5h6"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2M8.5 11h5"/>',
  design: '<path d="M12 3l2.2 5.3L20 10.5l-5.8 2.2L12 18l-2.2-5.3L4 10.5l5.8-2.2L12 3Z"/><path d="M18.5 16.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z"/>',
  finance: '<rect x="3" y="6" width="18" height="14" rx="3"/><path d="M3 10.5h18M16.5 15h.01"/>',
  cloud: '<path d="M7 18.5a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 9a4.75 4.75 0 0 1 0 9.5H7Z"/>',
};
const catIcon = (id) => `<svg viewBox="0 0 24 24" aria-hidden="true">${CAT_ICON[id] ?? '<circle cx="12" cy="12" r="4"/>'}</svg>`;
// Hero orbit (icons without seasonal artwork), in this order.
const ORBIT = ['amap', 'meituan', 'feishu', 'alipay', 'didi', 'zhihu', 'dingtalk', 'wechat-pay', 'wps', 'tencent-docs', 'kling', 'aliyun', 'baidu-netdisk', 'weread', 'netease-music', 'mcdonalds-cn', 'wecom', 'huawei-cloud', 'yuque', 'quark-drive'];
// Palette suggestions when the query is empty.
const FEATURED = ['amap', 'meituan', 'feishu', 'alipay', 'didi', 'zhihu', 'dingtalk', 'wechat-pay', 'taobao', 'luckin', 'tencent-docs', 'kling', 'aliyun', 'baidu-netdisk', 'weread', 'netease-music', 'mcdonalds-cn', 'fliggy', 'wecom', 'huawei-cloud'];

const state = { q: '', cat: 'all', types: new Set(), risks: new Set(), verified: false };
let DB, L, byId, home, PROMPT, SKILL_CMD;

init().catch((e) => {
  console.error(e);
  $('#loading').textContent = '数据载入失败，请刷新重试。';
});

async function init() {
  wireChrome();
  DB = await (await fetch('./services.json')).json();
  L = DB.labels;
  home = DB.homepage;
  byId = new Map(DB.services.map((s) => [s.id, s]));
  PROMPT = `读取 ${home}llms.txt，帮我找能点外卖的官方 MCP，告诉我需要什么 Key、配置怎么写。`;
  SKILL_CMD = `mkdir -p ~/.claude/skills/${DB.site.skill} && curl -fsSL ${DB.site.skillUrl} -o ~/.claude/skills/${DB.site.skill}/SKILL.md`;
  $('#loading').remove();
  renderStats();
  $('#groups').classList.add('intro');
  render();
  setTimeout(() => $('#groups').classList.remove('intro'), 1600);
  buildOrbit();
  buildDemo();
  renderForAi();
  openFromHash();
  addEventListener('hashchange', openFromHash);
  loadStars();
}

/* ── Chrome: nav, theme, keyboard, filters ───────────── */
function wireChrome() {
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  $('#kbar-key').textContent = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘K' : 'Ctrl K';
  $('#theme').addEventListener('click', () => {
    const root = document.documentElement;
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    store.set('theme', root.dataset.theme);
  });

  const q = $('#q');
  q.addEventListener('input', () => { state.q = q.value.trim(); render(); });
  q.addEventListener('keydown', (e) => { if (e.key === 'Escape') { q.value = ''; state.q = ''; render(); } });
  addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); togglePalette(); return; }
    const el = document.activeElement;
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(el?.tagName) || el?.isContentEditable;
    if (e.key === '/' && !typing && !document.querySelector('dialog[open]')) { e.preventDefault(); q.focus(); }
  });
  $('#open-palette').addEventListener('click', togglePalette);

  const toggleIn = (set, key) => (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const v = b.dataset[key];
    set.has(v) ? set.delete(v) : set.add(v);
    b.setAttribute('aria-pressed', set.has(v));
    render();
  };
  $('#type-filter').addEventListener('click', toggleIn(state.types, 'type'));
  $('#risk-filter').addEventListener('click', toggleIn(state.risks, 'risk'));
  $('#verified-only').addEventListener('click', (e) => {
    state.verified = !state.verified;
    e.currentTarget.setAttribute('aria-pressed', state.verified);
    render();
  });
  $('#reset').addEventListener('click', resetFilters);
  $('#chips').addEventListener('click', (e) => {
    const b = e.target.closest('.chip'); if (!b) return;
    state.cat = b.dataset.cat;
    render();
    const top = $('#filterbar').getBoundingClientRect().top + scrollY - parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'));
    if (scrollY > top + 2) scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
  });

  const groups = $('#groups');
  groups.addEventListener('click', (e) => { const c = e.target.closest('.card'); if (c) openFromCard(c); });
  let raf = 0;
  groups.addEventListener('pointermove', (e) => {
    if (raf || e.pointerType === 'touch') return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const grid = e.target.closest?.('.grid'); if (!grid) return;
      for (const c of grid.children) {
        const r = c.getBoundingClientRect();
        c.style.setProperty('--mx', `${e.clientX - r.left}px`);
        c.style.setProperty('--my', `${e.clientY - r.top}px`);
      }
    });
  });

  const sheet = $('#sheet');
  sheet.addEventListener('click', (e) => {
    if (e.target === sheet || e.target.closest('[data-close]')) sheet.close();
    const tab = e.target.closest('[data-tab]');
    if (tab) selectCodeTab(tab);
  });
  sheet.addEventListener('close', () => {
    if (location.hash.startsWith('#s-')) history.replaceState(null, '', location.pathname + location.search);
  });

  wirePalette();
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-copy]');
    if (b) copy(b.dataset.copy, b);
  });
  $('#copy-prompt').addEventListener('click', (e) => copy(PROMPT, e.currentTarget, '已复制，发给你的 Agent 吧'));
  $('#copy-prompt-2').addEventListener('click', (e) => copy(PROMPT, e.currentTarget));
  $('#copy-skill').addEventListener('click', (e) => copy(SKILL_CMD, e.currentTarget));
}

function resetFilters() {
  Object.assign(state, { q: '', cat: 'all', verified: false });
  state.types.clear(); state.risks.clear();
  $('#q').value = '';
  $$('#type-filter button, #risk-filter button, #verified-only').forEach((b) => b.setAttribute('aria-pressed', 'false'));
  render();
}

/* ── Hero stats ──────────────────────────────────────── */
function renderStats() {
  const verified = DB.services.filter((s) => s.status === 'verified').length;
  const [, m, d] = DB.updatedAt.split('-').map(Number);
  $('#eyebrow-count').textContent = DB.count;
  $('#st-cats').textContent = DB.categories.length;
  $('#st-verified').textContent = verified;
  $('#st-updated').textContent = `${m}月${d}日`;
  for (const el of $$('[data-count]')) {
    const n = DB.count;
    if (reduced) { el.textContent = n; continue; }
    const t0 = performance.now();
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / 1100);
      el.textContent = Math.round(n * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}

async function loadStars() {
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
      const r = await fetch(`https://api.github.com/repos/${DB.site.repo}`);
      if (!r.ok) return;
      n = (await r.json()).stargazers_count;
      try { sessionStorage.setItem(key, JSON.stringify({ n, t: Date.now() })); } catch {}
    } catch { return; }
  }
  if (typeof n === 'number' && n > 0) { el.textContent = fmt(n); el.hidden = false; }
}

/* ── Shared bits ─────────────────────────────────────── */
function host(url) {
  try {
    const u = new URL(url);
    const h = u.hostname.replace(/^www\./, '');
    return h === 'github.com' ? `github.com/${u.pathname.split('/')[1]}` : h;
  } catch { return ''; }
}
function mark(s) {
  if (s.mark) return s.mark;
  const ch = Array.from(s.name)[0];
  return /[a-z]/i.test(ch) ? ch.toUpperCase() : ch;
}
function logoHtml(s, extra = '') {
  if (s.logo) return `<span class="logo ${s.logoPad ? 'pad' : ''} ${extra}"><img src="./${esc(s.logo)}" alt="" loading="lazy" decoding="async"></span>`;
  return `<span class="logo mono ${extra}" style="--brand:${esc(s.color || 'var(--a2)')}" aria-hidden="true">${esc(mark(s))}</span>`;
}
const TYPE_ORDER = ['mcp', 'skill', 'cli'];
const sortedTypes = (s) => [...s.types].sort((a, b) => TYPE_ORDER.indexOf(a) - TYPE_ORDER.indexOf(b));
const typeTags = (s) => sortedTypes(s).map((t) => `<span class="tag ${esc(t)}">${esc(L.types[t])}</span>`).join('');
const riskLabel = (s) => `<span class="risk"><i class="dot ${esc(s.risk)}"></i>${esc(L.risk[s.risk])}</span>`;
const badge = (s) => (s.status === 'verified'
  ? `<span class="vbadge verified" title="已确认为厂商官方出品">${ICON.check}官方已核验</span>`
  : `<span class="vbadge unverified" title="来自公开整理，尚未逐条确认官方身份">${ICON.clock}待核验</span>`);
const catOf = (s) => DB.categories.find((c) => c.id === s.category);
const verb = (s) => s.summary.replace(/。$/, '').split(/[，,]/)[0].split('、').slice(0, 2).join('、');

/* ── Filtering & directory ───────────────────────────── */
const tokens = (q) => q.toLowerCase().split(/\s+/).filter(Boolean);
function haystack(s) {
  const c = catOf(s);
  return [s.name, s.id, s.summary, host(s.url), c?.name, c?.nameEn, ...s.types.map((t) => L.types[t]), L.risk[s.risk], ...s.access.map((a) => L.access[a])].join(' ').toLowerCase();
}
const textMatch = (s, toks) => { const h = haystack(s); return toks.every((t) => h.includes(t)); };
function matches(s, toks, ignoreCat = false) {
  if (!ignoreCat && state.cat !== 'all' && s.category !== state.cat) return false;
  if (state.types.size && !s.types.some((t) => state.types.has(t))) return false;
  if (state.risks.size && !state.risks.has(s.risk)) return false;
  if (state.verified && s.status !== 'verified') return false;
  return textMatch(s, toks);
}
function highlight(text, toks) {
  const safe = esc(text);
  if (!toks.length) return safe;
  const re = new RegExp(toks.map((t) => reEsc(esc(t))).join('|'), 'gi');
  return safe.replace(re, (m) => `<mark>${m}</mark>`);
}

function renderChips(toks) {
  const counts = Object.fromEntries(DB.categories.map((c) => [c.id, 0]));
  let all = 0;
  for (const s of DB.services) if (matches(s, toks, true)) { counts[s.category]++; all++; }
  const chip = (id, name, n, ico) => `<button class="chip" type="button" data-cat="${esc(id)}" aria-pressed="${state.cat === id}">${ico}${esc(name)}<b>${n}</b></button>`;
  $('#chips').innerHTML = chip('all', '全部', all, '') + DB.categories.map((c) => chip(c.id, c.name, counts[c.id], catIcon(c.id))).join('');
}

function card(s, toks, i) {
  return `<button class="card" type="button" data-id="${esc(s.id)}" style="--brand:${esc(s.color || '#8b7dff')};--i:${i}" aria-label="${esc(s.name)}：${esc(s.summary)}">
    <div class="card-top">${logoHtml(s)}<div class="card-title"><h4>${highlight(s.name, toks)}</h4><p class="domain">${esc(host(s.url))}</p></div>${badge(s)}</div>
    <p class="card-sum">${highlight(s.summary, toks)}</p>
    <div class="card-foot">${typeTags(s)}${riskLabel(s)}</div>
  </button>`;
}

function render() {
  const toks = tokens(state.q);
  const list = DB.services.filter((s) => matches(s, toks));
  renderChips(toks);
  let i = 0;
  $('#groups').innerHTML = DB.categories
    .filter((c) => state.cat === 'all' || c.id === state.cat)
    .map((c) => {
      const items = list.filter((s) => s.category === c.id);
      if (!items.length) return '';
      return `<section class="group" id="cat-${esc(c.id)}" aria-labelledby="h-${esc(c.id)}">
        <div class="group-head"><span class="group-icon">${catIcon(c.id)}</span><h3 id="h-${esc(c.id)}">${esc(c.name)}</h3><span class="en">${esc(c.nameEn ?? '')}</span><span class="n">${items.length}</span></div>
        <div class="grid">${items.map((s) => card(s, toks, Math.min(i++, 30))).join('')}</div>
      </section>`;
    })
    .join('');
  $('#empty').hidden = list.length > 0;
  const filtered = state.q || state.cat !== 'all' || state.types.size || state.risks.size || state.verified;
  $('#result').textContent = filtered ? `${list.length} / ${DB.count}` : `${DB.count} 个服务`;
  if (state.q) $('#suggest-link').href = `https://github.com/${DB.site.repo}/issues/new?template=submit.yml&title=${encodeURIComponent('[收录] ' + state.q)}`;
}

/* ── Detail sheet ────────────────────────────────────── */
function snippets(s) {
  const out = [];
  const mcp = s.install?.mcp;
  if (mcp) {
    if (mcp.transport === 'stdio') {
      const env = Object.entries(mcp.env ?? {});
      const cmd = [mcp.command, ...(mcp.args ?? [])].join(' ');
      out.push(['Claude Code', `claude mcp add ${s.id}${env.map(([k, v]) => ` -e ${k}=${v}`).join('')} -- ${cmd}`]);
      out.push(['JSON', JSON.stringify({ mcpServers: { [s.id]: { command: mcp.command, args: mcp.args ?? [], ...(env.length ? { env: mcp.env } : {}) } } }, null, 2)]);
      out.push(['Codex', `# ~/.codex/config.toml\n[mcp_servers.${s.id}]\ncommand = ${JSON.stringify(mcp.command)}\nargs = ${JSON.stringify(mcp.args ?? [])}` + (env.length ? `\n\n[mcp_servers.${s.id}.env]\n${env.map(([k, v]) => `${k} = ${JSON.stringify(v)}`).join('\n')}` : '')]);
    } else {
      out.push(['Claude Code', `claude mcp add --transport ${mcp.transport} ${s.id} "${mcp.url}"`]);
      out.push(['JSON', JSON.stringify({ mcpServers: { [s.id]: { type: mcp.transport, url: mcp.url } } }, null, 2)]);
      out.push(['Codex', `# ~/.codex/config.toml\n[mcp_servers.${s.id}]\nurl = ${JSON.stringify(mcp.url)}`]);
    }
  }
  if (s.install?.cli) out.push(['CLI', s.install.cli]);
  return out;
}

function selectCodeTab(tab) {
  const box = tab.closest('.code-tabs');
  $$('[data-tab]', box).forEach((b) => b.setAttribute('aria-selected', b === tab));
  const code = tab.dataset.code;
  $('code', box).textContent = code;
  $('.ct-copy', box).dataset.copy = code;
}

function openSheet(id) {
  const s = byId.get(id);
  if (!s) return;
  const snips = snippets(s);
  const deep = `${home}#s-${s.id}`;
  const report = `https://github.com/${DB.site.repo}/issues/new?template=correction.yml&title=${encodeURIComponent('[纠错] ' + s.name)}&service=${encodeURIComponent(s.id)}`;
  const access = s.access.length ? s.access.map((a) => esc(L.access[a])).join('、') : '<span style="color:var(--faint)">待整理</span>';
  const hasPlaceholder = snips.some(([, c]) => /<[^>]+>/.test(c));
  const code = snips.length
    ? `<div class="code-tabs">
        <div class="ct-bar" role="tablist" aria-label="配置格式">${snips.map(([label, c], i) => `<button type="button" role="tab" data-tab data-code="${esc(c)}" aria-selected="${i === 0}">${esc(label)}</button>`).join('')}<button type="button" class="ct-copy" data-copy="${esc(snips[0][1])}">复制</button></div>
        <pre><code>${esc(snips[0][1])}</code></pre>
      </div>${hasPlaceholder ? '<p class="code-hint">把尖括号里的内容换成你自己的 Key。</p>' : ''}`
    : '<p class="note">一键配置还在整理中，先按官方文档接入。</p>';

  const box = $('#sheet-in');
  box.style.setProperty('--brand', s.color || 'var(--a2)');
  box.innerHTML = `
    <div class="s-hero">
      <button class="s-close" type="button" data-close aria-label="关闭">${ICON.x}</button>
      <div class="s-id">${logoHtml(s, 'lg')}<div><h2 id="s-name">${esc(s.name)}</h2><p><span class="domain">${esc(host(s.url))}</span>${badge(s)}</p></div></div>
      <p class="s-sum">${esc(s.summary)}</p>
      <div class="s-actions">
        <a class="btn btn-primary btn-sm" href="${esc(safeUrl(s.url))}" target="_blank" rel="noopener">官方文档${ICON.out}</a>
        ${s.repo ? `<a class="btn btn-ghost btn-sm" href="${esc(safeUrl(s.repo))}" target="_blank" rel="noopener">代码仓库${ICON.out}</a>` : ''}
        ${s.install?.skill ? `<a class="btn btn-ghost btn-sm" href="${esc(safeUrl(s.install.skill))}" target="_blank" rel="noopener">Skill 文件${ICON.out}</a>` : ''}
        <button class="btn btn-ghost btn-sm" type="button" data-copy="${esc(deep)}">复制链接</button>
      </div>
    </div>
    <div class="s-body">
      <dl class="facts">
        <div><dt>类型</dt><dd>${typeTags(s)}</dd></div>
        <div><dt>权限</dt><dd><i class="dot ${esc(s.risk)}"></i>${esc(L.risk[s.risk])}</dd></div>
        <div><dt>接入门槛</dt><dd>${access}</dd></div>
        <div><dt>分类</dt><dd>${esc(catOf(s)?.name ?? '')}</dd></div>
      </dl>
      ${s.risk === 'payment' ? '<p class="note warn">这个服务可能下单或付款。让 Agent 执行前，请确保付款这一步由你亲自确认。</p>' : ''}
      <section class="s-sec"><h3>接入方式</h3>${code}</section>
      <section class="s-sec"><h3>核验</h3>
        ${s.status === 'verified'
          ? `<p>${esc(s.evidence.checkedAt)} 确认为官方出品，<a href="${esc(safeUrl(s.evidence.url))}" target="_blank" rel="noopener">查看依据</a>${s.evidence.note ? `。${esc(s.evidence.note)}` : ''}</p>`
          : '<p>还没逐条确认是否为官方出品，接入前请以官方文档为准。</p>'}
      </section>
      ${s.sources?.length ? `<section class="s-sec"><h3>来源</h3><p>${s.sources.map((x) => `<a href="${esc(safeUrl(x.url))}" target="_blank" rel="noopener">${esc(x.name)}</a>`).join('、')}</p></section>` : ''}
      <div class="s-foot"><span>收录于 ${esc(s.addedAt)}</span><a href="${esc(report)}" target="_blank" rel="noopener">信息有误？报告问题</a></div>
    </div>`;
  const sheet = $('#sheet');
  if (!sheet.open) sheet.showModal();
  box.scrollTop = 0;
  box.focus({ preventScroll: true });
  if (location.hash !== `#s-${s.id}`) history.replaceState(null, '', `#s-${s.id}`);
}

function openFromHash() {
  const m = location.hash.match(/^#s-([a-z0-9-]+)$/);
  if (m && byId?.has(m[1])) openSheet(m[1]);
}

// Card logo morphs into the sheet logo where View Transitions are supported.
function openFromCard(card) {
  const id = card.dataset.id;
  const from = card.querySelector('.logo');
  if (!document.startViewTransition || reduced || !from) return openSheet(id);
  from.style.viewTransitionName = 'svc-logo';
  const vt = document.startViewTransition(() => {
    from.style.viewTransitionName = '';
    openSheet(id);
    const to = $('#sheet .s-id .logo');
    if (to) to.style.viewTransitionName = 'svc-logo';
  });
  vt.finished.finally(() => { const to = $('#sheet .s-id .logo'); if (to) to.style.viewTransitionName = ''; });
}

/* ── Command palette ─────────────────────────────────── */
let palItems = [];
let palActive = 0;
function togglePalette() {
  const pal = $('#palette');
  if (pal.open) { pal.close(); return; }
  if (!DB) return;
  $('#sheet').open && $('#sheet').close();
  pal.showModal();
  const input = $('#pal-q');
  input.value = '';
  renderPalette();
  input.focus();
}
function wirePalette() {
  const pal = $('#palette');
  const input = $('#pal-q');
  input.addEventListener('input', renderPalette);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!palItems.length) return;
      palActive = (palActive + (e.key === 'ArrowDown' ? 1 : palItems.length - 1)) % palItems.length;
      paintPalette();
    } else if (e.key === 'Enter' && palItems[palActive]) {
      e.preventDefault();
      choose(palItems[palActive].id);
    }
  });
  pal.addEventListener('click', (e) => {
    if (e.target === pal) { pal.close(); return; }
    const it = e.target.closest('.pal-item');
    if (it) choose(it.dataset.id);
  });
  pal.addEventListener('mousemove', (e) => {
    const it = e.target.closest('.pal-item');
    if (!it) return;
    const i = palItems.findIndex((s) => s.id === it.dataset.id);
    if (i !== palActive) { palActive = i; paintPalette(false); }
  });
  const choose = (id) => { pal.close(); openSheet(id); };
}
function renderPalette() {
  const toks = tokens($('#pal-q').value.trim());
  palItems = toks.length ? DB.services.filter((s) => textMatch(s, toks)).slice(0, 50) : FEATURED.map((id) => byId.get(id)).filter(Boolean).slice(0, 8);
  palActive = 0;
  const list = $('#pal-list');
  if (!palItems.length) {
    list.innerHTML = `<div class="pal-empty">没有找到「${esc($('#pal-q').value)}」。<a href="https://github.com/${esc(DB.site.repo)}/issues/new?template=submit.yml" target="_blank" rel="noopener">提交给我们</a></div>`;
    return;
  }
  list.innerHTML = `<div class="pal-group">${toks.length ? `${palItems.length} 个结果` : '常用'}</div>` + palItems.map((s) => `
    <button class="pal-item" type="button" role="option" id="pal-${esc(s.id)}" data-id="${esc(s.id)}" aria-selected="false">
      ${logoHtml(s)}<span class="pal-text"><b>${highlight(s.name, toks)}</b><p class="domain">${highlight(s.summary, toks)}</p></span>
      <span class="pal-meta">${typeTags(s)}</span>
    </button>`).join('');
  paintPalette();
}
function paintPalette(scroll = true) {
  $$('.pal-item').forEach((el, i) => el.setAttribute('aria-selected', i === palActive));
  const cur = palItems[palActive];
  if (!cur) return;
  $('#pal-q').setAttribute('aria-activedescendant', `pal-${cur.id}`);
  if (scroll) document.getElementById(`pal-${cur.id}`)?.scrollIntoView({ block: 'nearest' });
}

/* ── Hero orbit: Agent → official services ───────────── */
function buildOrbit() {
  const wrap = $('#orbit');
  const canvas = $('#orbit-canvas');
  const ctx = canvas.getContext('2d');
  const label = $('#orbit-label');
  const nodes = ORBIT.map((id) => byId.get(id)).filter((s) => s?.logo).slice(0, 18);
  const RINGS = [0.29, 0.445];
  const inner = nodes.slice(0, 7);
  const outer = nodes.slice(7);
  const items = [
    ...inner.map((s, i) => ({ s, rf: RINGS[0], speed: 0.07, a: (i / inner.length) * Math.PI * 2 })),
    ...outer.map((s, i) => ({ s, rf: RINGS[1], speed: -0.04, a: 0.25 + (i / outer.length) * Math.PI * 2 })),
  ];
  for (const it of items) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'onode' + (it.s.logoPad ? ' pad' : '');
    b.tabIndex = -1;
    b.dataset.id = it.s.id;
    b.style.setProperty('--brand', it.s.color || '');
    b.setAttribute('aria-label', it.s.name);
    b.innerHTML = `<img src="./${esc(it.s.logo)}" alt="" decoding="async">`;
    wrap.append(b);
    it.el = b;
  }

  let W = 0, dpr = 1, size = 52, colors = {};
  const readColors = () => {
    const cs = getComputedStyle(document.documentElement);
    colors = { line: cs.getPropertyValue('--orbit-line').trim(), a: ['--a1', '--a2', '--a3'].map((v) => cs.getPropertyValue(v).trim()) };
  };
  const resize = () => {
    W = wrap.clientWidth;
    dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = W * dpr; canvas.height = W * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    size = W < 440 ? 40 : 52;
    for (const it of items) it.el.style.setProperty('--s', `${size}px`);
    draw(performance.now());
  };
  readColors();
  new MutationObserver(readColors).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', readColors);

  let t = 0, last = performance.now(), mul = 1, target = 1, running = false, hovered = null, labelTimer = 0;
  let pulses = [], nextPulse = performance.now() + 600, lastPick = null;

  const showLabel = (it, auto) => {
    clearTimeout(labelTimer);
    label.innerHTML = `<b>${esc(it.s.name)}</b><span> · ${esc(verb(it.s))}</span>${auto ? '<i>✓ 调用成功</i>' : ''}`;
    const above = it.y > size + 40;
    const half = label.offsetWidth / 2 + 4;
    label.style.left = `${Math.min(W - half, Math.max(half, it.x))}px`;
    label.style.top = `${above ? it.y - size / 2 - 40 : it.y + size / 2 + 8}px`;
    label.classList.add('show');
    if (auto) labelTimer = setTimeout(() => { if (!hovered) label.classList.remove('show'); }, 1500);
  };
  wrap.addEventListener('pointerover', (e) => {
    const n = e.target.closest('.onode'); if (!n) return;
    hovered = items.find((it) => it.el === n);
    target = 0;
    showLabel(hovered, false);
  });
  wrap.addEventListener('pointerout', (e) => {
    if (!e.target.closest('.onode') || e.relatedTarget?.closest?.('.onode') === e.target.closest('.onode')) return;
    hovered = null; target = 1;
    label.classList.remove('show');
  });
  wrap.addEventListener('click', (e) => { const n = e.target.closest('.onode'); if (n) openSheet(n.dataset.id); });

  function draw(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    mul += (target - mul) * Math.min(1, dt * 5);
    if (!reduced) t += dt * mul;
    const c = W / 2;
    for (const it of items) {
      const ang = it.a + t * it.speed;
      it.x = c + it.rf * W * Math.cos(ang);
      it.y = c + it.rf * W * Math.sin(ang);
      it.el.style.transform = `translate(${it.x.toFixed(1)}px, ${it.y.toFixed(1)}px)`;
    }
    ctx.clearRect(0, 0, W, W);
    ctx.lineWidth = 1;
    ctx.strokeStyle = colors.line;
    ctx.setLineDash([2, 7]);
    for (const rf of RINGS) { ctx.beginPath(); ctx.arc(c, c, rf * W, 0, Math.PI * 2); ctx.stroke(); }
    ctx.setLineDash([]);
    ctx.globalAlpha = 0.5;
    ctx.beginPath(); ctx.arc(c, c, 0.495 * W, 0, Math.PI * 2); ctx.stroke();
    for (const it of items) { ctx.beginPath(); ctx.moveTo(c, c); ctx.lineTo(it.x, it.y); ctx.stroke(); }
    ctx.globalAlpha = 1;

    if (!reduced && now > nextPulse && mul > 0.6) {
      let it;
      do it = items[(Math.random() * items.length) | 0]; while (items.length > 1 && it === lastPick);
      lastPick = it;
      pulses.push({ it, t0: now, dur: 1000 + Math.random() * 400, color: colors.a[(Math.random() * 3) | 0] });
      nextPulse = now + 700 + Math.random() * 600;
    }
    pulses = pulses.filter((p) => {
      const k = (now - p.t0) / p.dur;
      if (k >= 1) {
        p.it.el.classList.remove('ping'); void p.it.el.offsetWidth; p.it.el.classList.add('ping');
        if (!hovered) showLabel(p.it, true);
        return false;
      }
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      const tail = Math.max(0, e - 0.16);
      const x = c + (p.it.x - c) * e, y = c + (p.it.y - c) * e;
      const tx = c + (p.it.x - c) * tail, ty = c + (p.it.y - c) * tail;
      const g = ctx.createLinearGradient(tx, ty, x, y);
      g.addColorStop(0, p.color + '00'); g.addColorStop(1, p.color);
      ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y); ctx.stroke();
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 14);
      glow.addColorStop(0, p.color + 'cc'); glow.addColorStop(1, p.color + '00');
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 2.4, 0, Math.PI * 2); ctx.fill();
      return true;
    });
    ctx.lineWidth = 1;

  }
  const loop = (now) => { if (!running) return; draw(now); requestAnimationFrame(loop); };
  const setRunning = (v) => {
    if (v === running || reduced) { if (reduced) draw(performance.now()); return; }
    running = v;
    if (v) { last = performance.now(); requestAnimationFrame(loop); }
  };
  new ResizeObserver(resize).observe(wrap);
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; setRunning(visible && !document.hidden); }).observe(wrap);
  document.addEventListener('visibilitychange', () => setRunning(visible && !document.hidden));
  resize();
  setRunning(true);
}

/* ── Demo: one sentence → Agent calls official connectors ─ */
const SCENES = [
  {
    id: 'amap', title: '查路线',
    ask: '下午三点从望京去首都机场 T3，开车要多久？',
    steps: [
      { tool: 'amap', act: '路线规划', args: '起点 望京 · 终点 首都机场 T3 · 驾车' },
      { card: { svc: 'amap', title: '驾车路线', rows: [['约 38 分钟', ' · 26 公里'], ['推荐', '：机场高速，途经京密路'], ['14:20 出发', '，可避开晚高峰']] } },
    ],
    reply: '建议 14:20 出发，走机场高速大约 38 分钟。要我帮你设个出发提醒吗？',
  },
  {
    id: 'feishu', title: '写文档',
    ask: '把今天周会的要点整理成飞书文档，发到产品群。',
    steps: [
      { tool: 'feishu', act: '创建文档', args: '标题「11 月 4 日产品周会纪要」' },
      { tool: 'feishu', act: '发送消息', args: '群聊 产品组 · 附文档链接' },
      { card: { svc: 'feishu', title: '11 月 4 日产品周会纪要', rows: [['3 项', '决议'], ['5 项', '待办，已 @ 负责人'], ['已发送', '到「产品组」']] } },
    ],
    reply: '文档建好了，也发到了产品群，待办都 @ 了对应的同事。',
  },
  {
    id: 'luckin', title: '点咖啡',
    ask: '老样子，帮我点一杯生椰拿铁，送到公司。',
    steps: [
      { tool: 'luckin', act: '查询门店', args: '公司附近 · 可配送' },
      { tool: 'luckin', act: '生成订单', args: '生椰拿铁 · 大杯 · 少冰 · 配送' },
      { confirm: { svc: 'luckin', title: '等你确认付款', rows: [['生椰拿铁', ' · 大杯 · 少冰'], ['配送到', '公司 · 约 25 分钟']], price: '¥ 16.90' } },
    ],
    reply: '付好了，预计 25 分钟送到。',
  },
];

function buildDemo() {
  const tabs = $('#demo-tabs');
  const body = $('#demo-body');
  const input = $('#demo-input');
  const scenes = SCENES.filter((s) => byId.has(s.id));
  if (!scenes.length) return;
  tabs.innerHTML = scenes.map((sc, i) => {
    const s = byId.get(sc.id);
    return `<button class="dtab" type="button" role="tab" aria-selected="false" data-i="${i}" style="--brand:${esc(s.color || 'var(--a2)')}">
      ${logoHtml(s)}<span><b>${esc(sc.title)}</b><small><i class="dot ${esc(s.risk)}"></i><span>${esc(s.name)} · </span>${esc(L.risk[s.risk])}</small></span><i class="bar"></i></button>`;
  }).join('');

  let cur = 0, run = 0, visible = false, started = false;
  const ok = (id) => id === run;
  const wait = (ms, id) => new Promise((res, rej) => setTimeout(() => (ok(id) ? res() : rej(0)), reduced ? 0 : ms));
  const add = (html) => {
    body.insertAdjacentHTML('beforeend', html);
    while (body.scrollHeight > body.clientHeight && body.children.length > 1) body.firstElementChild.remove();
    return body.lastElementChild;
  };
  const toolHtml = (st) => {
    const s = byId.get(st.tool);
    return `<div class="d-tool d-in">${logoHtml(s)}<b>${esc(s.name)} · ${esc(st.act)}</b><code>${esc(st.args)}</code><span class="st"><i class="spin"></i></span></div>`;
  };
  const rowsHtml = (rows) => `<ul>${rows.map(([a, b]) => `<li><b>${esc(a)}</b>${esc(b)}</li>`).join('')}</ul>`;
  const typeInto = async (el, text, id, speed) => {
    if (reduced) { el.textContent = text; return; }
    for (let i = 1; i <= text.length; i++) {
      if (!ok(id)) throw 0;
      el.textContent = text.slice(0, i);
      await wait(speed, id);
    }
  };

  async function play(i) {
    const id = ++run;
    cur = i;
    const sc = scenes[i];
    const s = byId.get(sc.id);
    $$('.dtab', tabs).forEach((b, k) => {
      b.setAttribute('aria-selected', k === i);
      b.tabIndex = k === i ? 0 : -1;
      b.classList.toggle('static', reduced);
      const bar = $('.bar', b);
      bar.style.animation = 'none';
      void bar.offsetWidth;
      bar.style.animation = '';
    });
    body.style.setProperty('--brand', s.color || 'var(--a2)');
    body.innerHTML = '';
    input.textContent = '';
    try {
      await wait(500, id);
      await typeInto(input, sc.ask, id, 45);
      await wait(350, id);
      input.textContent = '';
      add(`<div class="d-me d-in">${esc(sc.ask)}</div>`);
      await wait(400, id);
      const think = add('<div class="d-ai d-in"><span class="ai-avatar"></span><span class="d-think"><i></i><i></i><i></i></span></div>');
      await wait(900, id);
      think.remove();
      for (const st of sc.steps) {
        if (st.tool) {
          const el = add(toolHtml(st));
          await wait(1100, id);
          $('.st', el).innerHTML = `<span class="ok">${ICON.check}</span>`;
          await wait(300, id);
        } else if (st.card) {
          const c = byId.get(st.card.svc);
          add(`<div class="d-card d-in"><h5>${logoHtml(c)}${esc(st.card.title)}</h5>${rowsHtml(st.card.rows)}</div>`);
          await wait(900, id);
        } else if (st.confirm) {
          const c = byId.get(st.confirm.svc);
          const el = add(`<div class="d-card confirm d-in"><h5>${logoHtml(c)}${esc(st.confirm.title)}</h5>${rowsHtml(st.confirm.rows)}
            <div class="pay"><span>实付</span><b>${esc(st.confirm.price)}</b></div><div class="acts"><span>取消</span><span class="yes">确认付款</span></div></div>`);
          await wait(1800, id);
          const yes = $('.yes', el);
          yes.classList.add('press');
          await wait(180, id);
          yes.classList.remove('press');
          yes.classList.add('done');
          yes.textContent = '已确认 ✓';
          await wait(600, id);
        }
      }
      const r = add('<div class="d-ai d-in"><span class="ai-avatar"></span><span></span></div>');
      await typeInto(r.lastElementChild, sc.reply, id, 30);
      if (reduced) return;
      await wait(3200, id);
      if (visible) play((i + 1) % scenes.length);
    } catch { /* superseded by a newer run */ }
  }

  tabs.addEventListener('click', (e) => { const b = e.target.closest('.dtab'); if (b) play(+b.dataset.i); });
  tabs.addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
    e.preventDefault();
    const n = (cur + (/Right|Down/.test(e.key) ? 1 : scenes.length - 1)) % scenes.length;
    $$('.dtab', tabs)[n].focus();
    play(n);
  });
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !started) { started = true; play(0); }
    else if (visible) play(cur);
    else run++;
  }, { threshold: 0.35 }).observe($('.demo-win'));
}

/* ── For AI section ──────────────────────────────────── */
function renderForAi() {
  $('#chat-me').textContent = PROMPT;
  const food = DB.services.filter((s) => /外卖|点餐|点单/.test(s.summary)).slice(0, 3);
  const answer = [
    `找到 ${food.length} 个官方接入：`,
    ...food.map((s) => `• ${s.name}（${sortedTypes(s).map((t) => L.types[t]).join(' · ')}）：${s.summary.replace(/。$/, '')}`), // 纯文本，渲染时再转义
    '',
    '这些服务会下单付款，每次付款前我都会先跟你确认。要我现在把配置写进 Claude Code 吗？',
  ].join('\n');
  const out = $('#chat-ai');
  const type = () => {
    if (reduced) { out.textContent = answer; return; }
    let i = 0;
    const caret = '<span class="caret"></span>';
    const step = () => {
      i = Math.min(answer.length, i + 2);
      out.innerHTML = esc(answer.slice(0, i)) + caret;
      if (i < answer.length) setTimeout(step, 28); else setTimeout(() => { out.innerHTML = esc(answer); }, 1600);
    };
    step();
  };
  new IntersectionObserver(([e], io) => { if (e.isIntersecting) { io.disconnect(); setTimeout(type, 500); } }, { threshold: 0.4 }).observe($('#chat'));

  const sk = DB.site.skill;
  $('#skill-cmd').innerHTML = `<span class="p">$</span> mkdir -p ~/.claude/skills/${esc(sk)} \\\n  <span class="k">&&</span> curl -fsSL ${esc(DB.site.skillUrl)} \\\n  -o ~/.claude/skills/${esc(sk)}/SKILL.md`;

  $('#files').innerHTML = [
    ['llms.txt', '纯文本索引，适合直接读', './llms.txt'],
    ['services.json', `${DB.count} 条结构化数据`, './services.json'],
    ['SKILL.md', '可安装的 Agent Skill', `./skills/${sk}/SKILL.md`],
  ].map(([n, d, h]) => `<li><a href="${esc(h)}" target="_blank" rel="noopener"><b>${esc(n)}</b><span>${esc(d)}</span><em>GET ↗</em></a></li>`).join('');

  const sample = byId.get('amap') ?? DB.services[0];
  const pick = (({ id, name, types, url, risk, access, status, install }) => ({ id, name, types, url, risk, access, status, ...(install ? { install } : {}) }))(sample);
  $('#json-sample').innerHTML = esc(JSON.stringify(pick, null, 2))
    .replace(/(&quot;[^&]*?&quot;)(\s*:)/g, '<span class="k">$1</span>$2')
    .replace(/(:\s*)(&quot;.*?&quot;)/g, '$1<span class="s">$2</span>')
    .replace(/^(\s+)(&quot;.*?&quot;)(,?)$/gm, '$1<span class="s">$2</span>$3');
}

/* ── Copy & toast ────────────────────────────────────── */
async function copy(text, btn, msg = '已复制') {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = Object.assign(document.createElement('textarea'), { value: text });
    ta.style.cssText = 'position:fixed;opacity:0';
    (btn?.closest('dialog') ?? document.body).append(ta);
    ta.select();
    try { document.execCommand('copy'); } catch {}
    ta.remove();
  }
  toast(msg);
  if (btn && (btn.classList.contains('btn') || btn.classList.contains('ct-copy'))) {
    const old = btn.innerHTML;
    btn.classList.add('done');
    btn.textContent = '已复制 ✓';
    setTimeout(() => { btn.innerHTML = old; btn.classList.remove('done'); }, 1400);
  }
}
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  (document.querySelector('dialog[open]') ?? document.body).append(t);
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 1700);
}
