import { esc, ICON, host, logoHtml, sortedTypes, typeTags as renderTypeTags, badge, tokens, highlight, textMatch as renderTextMatch, renderDetails } from './render.mjs';
import { $, $$, copy, initChrome, loadStars, loadCatalog } from './ui.mjs';
import { motionReduced, onMotionChange, openDialog, closeDialog, wireDialog, revealResults } from './motion.mjs';
import { directoryHtml, chipsHtml } from './directory.mjs';
import { initFx, morphFromCard } from './fx.mjs';
let reduced = motionReduced();
onMotionChange(() => { reduced = motionReduced(); });

// Hero orbit (icons without seasonal artwork), in this order.
const ORBIT = ['amap', 'meituan', 'feishu', 'alipay', 'didi', 'zhihu', 'dingtalk', 'wechat-pay', 'wps', 'tencent-docs', 'kling', 'aliyun', 'baidu-netdisk', 'weread', 'netease-music', 'mcdonalds-cn', 'wecom', 'huawei-cloud', 'yuque', 'quark-drive'];
const state = { q: '', cat: 'all', types: new Set(), risks: new Set(), verified: false };
let DB, L, byId, home, PROMPT, SKILL_CMD;
let cards, groups, lastQuery = '';
let renderFrame = 0;
const scheduleRender = () => {
  cancelAnimationFrame(renderFrame);
  renderFrame = requestAnimationFrame(() => { renderFrame = 0; render(); });
};

async function init() {
  const restoreSearch = wireChrome();
  const embedded = $('#catalog-data');
  DB = embedded ? JSON.parse(embedded.textContent) : await loadCatalog();
  L = DB.labels;
  home = DB.homepage;
  byId = new Map(DB.services.map((s) => [s.id, s]));
  PROMPT = `读取 ${home}llms.txt，帮我找能点外卖的官方 MCP，告诉我需要什么 Key、配置怎么写。`;
  SKILL_CMD = `mkdir -p ~/.claude/skills/${DB.site.skill} && curl -fsSL ${DB.site.skillUrl} -o ~/.claude/skills/${DB.site.skill}/SKILL.md`;
  // Older cached HTML has no bundled data. Reconcile it once with the live catalog.
  if (!embedded) {
    $('#groups').innerHTML = directoryHtml(DB);
    $('#chips').innerHTML = chipsHtml(DB);
    $('#eyebrow-count').textContent = DB.count;
    $('[data-count]').textContent = DB.count;
    $('#st-cats').textContent = DB.categories.length;
    $('#st-verified').textContent = DB.services.filter((s) => s.status === 'verified').length;
    $('#st-updated').textContent = `${Number(DB.updatedAt.slice(5, 7))}月${Number(DB.updatedAt.slice(8, 10))}日`;
  }
  cards = new Map($$('#groups .card').map((el) => { el.dataset.query = ''; return [el.dataset.id, el]; }));
  groups = new Map(DB.categories.map((c) => [c.id, document.getElementById(`cat-${c.id}`)]));
  render();
  buildOrbit();
  buildDemo();
  renderForAi();
  openFromHash();
  restoreSearch();
  addEventListener('popstate', openFromHash);
  addEventListener('hashchange', openFromHash);
  loadStars(DB);
  initFx();
}

/* ── Chrome: nav, theme, keyboard, filters ───────────── */
function wireChrome() {
  const restoreSearch = initChrome({ getData: () => DB, onChoose: openSheet,
    beforeOpen: () => { if ($('#sheet').open) $('#sheet').close(); }, focusSearch: () => $('#q').focus() });
  const q = $('#q');
  q.addEventListener('input', () => { state.q = q.value.trim(); scheduleRender(); });
  q.addEventListener('keydown', (e) => { if (e.isComposing || e.keyCode === 229) return; if (e.key === 'Escape') { q.value = ''; state.q = ''; scheduleRender(); } });
  const toggleIn = (set, key) => (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const v = b.dataset[key];
    set.has(v) ? set.delete(v) : set.add(v);
    b.setAttribute('aria-pressed', set.has(v));
    scheduleRender();
  };
  $('#type-filter').addEventListener('click', toggleIn(state.types, 'type'));
  $('#risk-filter').addEventListener('click', toggleIn(state.risks, 'risk'));
  $('#verified-only').addEventListener('click', (e) => {
    state.verified = !state.verified;
    e.currentTarget.setAttribute('aria-pressed', state.verified);
    scheduleRender();
  });
  $('#reset').addEventListener('click', resetFilters);
  $('#chips').addEventListener('click', (e) => {
    const b = e.target.closest('.chip'); if (!b) return;
    state.cat = b.dataset.cat;
    scheduleRender();
    const top = $('#filterbar').getBoundingClientRect().top + scrollY - parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'));
    if (scrollY > top + 2) scrollTo({ top, behavior: motionReduced() ? 'auto' : 'smooth' });
  });

  const groups = $('#groups');
  groups.addEventListener('click', (e) => {
    const c = e.target.closest('.card');
    if (!c || !byId?.has(c.dataset.id) || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    morphFromCard(c, () => openSheet(c.dataset.id));
  });
  let raf = 0, pointer;
  const hover = matchMedia('(hover: hover) and (pointer: fine)');
  groups.addEventListener('pointermove', (e) => {
    if (!hover.matches || reduced || e.pointerType === 'touch') return;
    pointer = { card: e.target.closest('.card'), x: e.clientX, y: e.clientY };
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const { card, x, y } = pointer;
      if (!card?.isConnected) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${x - r.left}px`);
      card.style.setProperty('--my', `${y - r.top}px`);
    });
  }, { passive: true });

  const sheet = $('#sheet');
  wireDialog(sheet);
  sheet.addEventListener('click', (e) => {
    if (e.target === sheet || e.target.closest('[data-close]')) closeDialog(sheet);
  });
  sheet.addEventListener('close', () => {
    if (history.state?.overlay === 'detail') history.back();
    else if (location.hash.startsWith('#s-')) history.replaceState(null, '', location.pathname + location.search);
  });

  $('#copy-prompt').addEventListener('click', (e) => copy(PROMPT, e.currentTarget, '已复制，发给你的 Agent 吧'));
  $('#copy-prompt-2').addEventListener('click', (e) => copy(PROMPT, e.currentTarget));
  $('#copy-skill').addEventListener('click', (e) => copy(SKILL_CMD, e.currentTarget));
  return restoreSearch;
}

function resetFilters() {
  Object.assign(state, { q: '', cat: 'all', verified: false });
  state.types.clear(); state.risks.clear();
  $('#q').value = '';
  $$('#type-filter button, #risk-filter button, #verified-only').forEach((b) => b.setAttribute('aria-pressed', 'false'));
  render();
}

const verb = (s) => {
  const v = s.summary.replace(/。$/, '').split(/[，,；;]/)[0].split('、').slice(0, 2).join('、');
  return v.length > 14 ? `${v.slice(0, 13)}…` : v;
};
const typeTags = (s) => renderTypeTags(s, L);
const textMatch = (s, toks) => renderTextMatch(s, toks, DB);

/* ── Filtering & directory ───────────────────────────── */
function matches(s, toks, ignoreCat = false) {
  if (!ignoreCat && state.cat !== 'all' && s.category !== state.cat) return false;
  if (state.types.size && !s.types.some((t) => state.types.has(t))) return false;
  if (state.risks.size && !state.risks.has(s.risk)) return false;
  if (state.verified && s.status !== 'verified') return false;
  return textMatch(s, toks);
}
function render() {
  if (!DB || !cards) return;
  const toks = tokens(state.q);
  const counts = Object.fromEntries(DB.categories.map((c) => [c.id, 0]));
  const shown = new Set();
  const entering = [];
  let total = 0;
  for (const s of DB.services) {
    if (matches(s, toks, true)) { counts[s.category]++; total++; }
    const el = cards.get(s.id);
    if (!el) continue;
    const visible = matches(s, toks);
    if (visible) {
      shown.add(s.id);
      if (el.hidden || groups.get(s.category)?.hidden) entering.push(el);
      if (el.dataset.query !== state.q) {
        el.querySelector('.card-title .nm').innerHTML = highlight(s.name, toks);
        el.querySelector('.card-sum').innerHTML = highlight(s.summary, toks);
        el.dataset.query = state.q;
      }
    }
    if (el.hidden === visible) el.hidden = !visible;
  }
  for (const c of DB.categories) {
    const group = groups.get(c.id);
    if (!group) continue;
    const count = (state.cat === 'all' || state.cat === c.id) ? counts[c.id] : 0;
    group.hidden = !count;
    const label = group.querySelector('.n');
    if (label.textContent !== String(count)) label.textContent = count;
  }
  for (const b of $$('#chips .chip')) {
    b.setAttribute('aria-pressed', state.cat === b.dataset.cat);
    const count = b.dataset.cat === 'all' ? total : counts[b.dataset.cat];
    if (b.querySelector('b').textContent !== String(count)) b.querySelector('b').textContent = count;
  }
  $('#empty').hidden = shown.size > 0;
  const filtered = state.q || state.cat !== 'all' || state.types.size || state.risks.size || state.verified;
  $('#result').textContent = filtered ? `${shown.size} / ${DB.count}` : `${DB.count} 个服务`;
  if (state.q) $('#suggest-link').href = `https://github.com/${DB.site.repo}/issues/new?template=submit.yml&title=${encodeURIComponent('[收录] ' + state.q)}`;
  if (lastQuery === state.q) revealResults(entering);
  lastQuery = state.q;
}

/* ── Detail sheet ────────────────────────────────────── */
function openSheet(id, fromHistory = false) {
  const s = byId.get(id);
  if (!s) return;
  const detail = renderDetails(s, DB);
  const report = `https://github.com/${DB.site.repo}/issues/new?template=correction.yml&title=${encodeURIComponent('[纠错] ' + s.name)}&service=${encodeURIComponent(s.id)}`;
  const box = $('#sheet-in');
  box.style.setProperty('--brand', s.color || 'var(--a2)');
  box.innerHTML = `
    <div class="s-hero">
      <button class="s-close" type="button" data-close aria-label="关闭">${ICON.x}</button>
      <div class="s-id">${logoHtml(s, 'lg')}<div><h2 id="s-name">${esc(s.name)}</h2><p><span class="domain">${esc(host(s.url))}</span>${badge(s)}</p></div></div>
      <p class="s-sum">${esc(s.summary)}</p>
      <div class="s-actions">${detail.actions}</div>
    </div>
    <div class="s-body">
      ${detail.facts}
      ${detail.warn}
      <section class="s-sec"><h3>接入方式</h3>${detail.install}</section>
      <section class="s-sec"><h3>核验</h3>${detail.verify}</section>
      ${detail.sources ? `<section class="s-sec"><h3>来源</h3>${detail.sources}</section>` : ''}
      <div class="s-foot"><span>收录于 ${esc(s.addedAt)}</span><a href="${esc(report)}" target="_blank" rel="noopener">信息有误？报告问题</a></div>
    </div>`;
  const sheet = $('#sheet');
  openDialog(sheet);
  box.scrollTop = 0;
  box.focus({ preventScroll: true });
  if (!fromHistory) history.pushState({ overlay: 'detail' }, '', `#s-${s.id}`);
}

function openFromHash() {
  const m = location.hash.match(/^#s-([a-z0-9-]+)$/);
  if (m && byId?.has(m[1]) && history.state?.overlay !== 'search') openSheet(m[1], true);
  else if ($('#sheet').open) $('#sheet').close();
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
    b.innerHTML = `<img src="./${esc(it.s.logo)}" alt="" width="128" height="128" decoding="async">`;
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
  const refreshColors = () => { readColors(); if (!running) draw(performance.now()); };
  new MutationObserver(refreshColors).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', refreshColors);

  let t = 0, last = performance.now(), mul = 1, target = 1, running = false, hovered = null, labelTimer = 0;
  let pulses = [], nextPulse = performance.now() + 600, lastPick = null;

  const showLabel = (it, auto) => {
    clearTimeout(labelTimer);
    label.innerHTML = `<b>${esc(it.s.name)}</b><span> · ${esc(verb(it.s))}</span>${auto ? '<i>✓ 调用成功</i>' : ''}`;
    const above = it.y > size + 40;
    const half = label.offsetWidth / 2 + 4;
    label.style.setProperty('--label-x', `${Math.min(W - half, Math.max(half, it.x))}px`);
    label.style.setProperty('--label-y', `${above ? it.y - size / 2 - 40 : it.y + size / 2 + 8}px`);
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
  let frame = 0;
  const loop = (now) => { if (!running) return; draw(now); frame = requestAnimationFrame(loop); };
  const setRunning = (v) => {
    v = v && !reduced;
    if (v === running) { if (reduced) draw(performance.now()); return; }
    running = v;
    cancelAnimationFrame(frame);
    if (v) { last = performance.now(); frame = requestAnimationFrame(loop); }
  };
  new ResizeObserver(resize).observe(wrap);
  let visible = true;
  const sync = () => {
    const active = visible && !document.hidden && !document.querySelector('dialog[open]');
    wrap.classList.toggle('motion-paused', !active || reduced);
    setRunning(active);
  };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }).observe(wrap);
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['open'], subtree: true });
  document.addEventListener('visibilitychange', sync);
  onMotionChange(sync);
  resize();
  sync();
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

  let cur = 0, run = 0, visible = false;
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
  const syncPlayback = () => {
    const active = visible && !document.hidden && !document.querySelector('dialog[open]');
    $$('.dtab .bar', tabs).forEach((bar) => { bar.style.animationPlayState = active ? 'running' : 'paused'; });
    if (active) play(cur);
    else run++;
  };
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    syncPlayback();
  }, { threshold: 0.35 }).observe($('.demo-win'));
  document.addEventListener('visibilitychange', syncPlayback);
  onMotionChange(syncPlayback);
  new MutationObserver(syncPlayback).observe(document.body, { attributes: true, attributeFilter: ['open'], subtree: true });
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
  let i = 0, timer = 0, started = false, done = false, delay = 500, due = 0;
  const pause = () => {
    if (!timer) return;
    clearTimeout(timer);
    timer = 0;
    delay = Math.max(0, due - performance.now());
  };
  const finish = () => { pause(); out.textContent = answer; done = true; };
  const step = () => {
    timer = 0;
    if (document.hidden || reduced) { delay = 0; syncTyping(); return; }
    if (i === answer.length) { finish(); return; }
    i = Math.min(answer.length, i + 2);
    out.innerHTML = esc(answer.slice(0, i)) + '<span class="caret"></span>';
    delay = i < answer.length ? 28 : 1600;
    syncTyping();
  };
  const syncTyping = () => {
    if (!started || done) return;
    if (reduced) { finish(); return; }
    if (document.hidden) { pause(); return; }
    if (timer) return;
    due = performance.now() + delay;
    timer = setTimeout(step, delay);
  };
  document.addEventListener('visibilitychange', syncTyping);
  onMotionChange(syncTyping);
  new IntersectionObserver(([e], io) => { if (e.isIntersecting) { io.disconnect(); started = true; syncTyping(); } }, { threshold: 0.4 }).observe($('#chat'));

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

// Bundled data makes init synchronous: start after scene/search constants exist.
init().catch((e) => {
  console.error(e);
  $('#directory-status').textContent = '筛选暂时不可用，可直接点卡片查看官方接入。';
});
