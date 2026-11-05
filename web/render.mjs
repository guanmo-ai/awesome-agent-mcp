// Pure rendering shared by Node's static build and both browser entry points.
export const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const safeUrl = (url) => {
  try { const parsed = new URL(url); return parsed.protocol === 'https:' ? parsed.href : '#'; } catch { return '#'; }
};
export const brandColor = (s) => /^#[0-9a-f]{6}$/i.test(s.color ?? '') ? s.color : '#8b7dff';
export const serviceUrl = (home, id) => `${home}s/${encodeURIComponent(id)}/`;
export function disclaimerHtml(db) {
  if (!db.disclaimer) return '';
  return `<section class="disclaimer" id="disclaimer" aria-labelledby="disclaimer-title"><h2 id="disclaimer-title">使用说明与免责声明</h2>${db.disclaimer.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}<p><a href="${esc(safeUrl(db.disclaimer.feedbackUrl))}" target="_blank" rel="noopener">纠错与权利问题反馈 ↗</a></p></section>`;
}
export function agentPrompt(url, need = '') {
  return [
    `读取 ${url}，作为查找官方 MCP、Skill 和 CLI 的参考索引；找到服务后读取它链接的 Markdown，获取完整配置与步骤。`,
    '根据我在末尾或后续消息中提供的服务名或需求查找；如果我还没说，先问我想找什么。',
    '核对厂商官方文档，告诉我能做什么、账号权限、费用，以及当前 Agent 是否支持和如何接入。未收录不代表不存在，不确定的信息不要猜。',
    '官方页面读不到时，以索引中的官方原文摘录为依据，并告诉我这一点。没有对应摘录的内容仍须核实，不要猜测。',
    '本索引仅供参考，已核验不等于实测或安全保证。需要安装或配置时按我的授权执行，密钥和登录由我在本地完成；下单、付款前让我确认。',
    '给出官方链接；如进行了接入，报告实际验证结果和剩余步骤。',
    ...(need.trim() ? ['', `我的需求：${need.trim()}`] : []),
  ].join('\n');
}
export function servicePrompt(home, s) {
  const types = sortedTypes(s).map((t) => ({ mcp: 'MCP', skill: 'Skill', cli: 'CLI' })[t]).join(' / ');
  const reminder = s.risk === 'payment' ? '下单、付款前先问我。' : s.risk === 'write' ? '修改或发送前先告诉我。' : '';
  return `帮我接入${s.name}的官方 ${types}。\n参考 ${home}s/${encodeURIComponent(s.id)}.md，以官方文档为准。\nKey 和登录由我在本地完成；接好后用一次只读查询验证，告诉我结果。${reminder}`;
}
export function skillPrompt(url, name) {
  return `读取 ${url}\n检查内容后，按当前 Agent 的官方安装方式安装 ${name}，保留已有同名 Skill。\n如果不支持 Skill，就直接读取索引。安装后用一个查询验证能否找到官方服务，说明结果；这不代表服务已接通。`;
}
export const tokens = (q) => q.toLowerCase().match(/[\p{Script=Han}]+|[a-z0-9]+(?:[._-][a-z0-9]+)*/gu) ?? [];
const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export function highlight(text, toks = []) {
  const safe = esc(text);
  if (!toks.length) return safe;
  return safe.replace(new RegExp(toks.map((t) => reEsc(esc(t))).join('|'), 'gi'), (m) => `<mark>${m}</mark>`);
}
export const ICON = {
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
  out: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>',
  x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
};
export function host(url) {
  try {
    const u = new URL(url);
    const h = u.hostname.replace(/^www\./, '');
    return h === 'github.com' ? `github.com/${u.pathname.split('/')[1]}` : h;
  } catch { return ''; }
}
export function mark(s) {
  if (s.mark) return s.mark;
  const ch = Array.from(s.name)[0];
  return /[a-z]/i.test(ch) ? ch.toUpperCase() : ch;
}

export function logoHtml(s, extra = '', prefix = './') {
  if (/^logos\/[a-z0-9-]+\.png$/.test(s.logo ?? '')) return `<span class="logo ${s.logoPad ? 'pad' : ''} ${esc(extra)}"><img src="${esc(prefix + s.logo)}" alt="" width="128" height="128" loading="lazy" decoding="async"></span>`;
  return `<span class="logo mono ${esc(extra)}" style="--brand:${brandColor(s)}" aria-hidden="true">${esc(mark(s))}</span>`;
}
const TYPE_ORDER = ['mcp', 'skill', 'cli'];
export const sortedTypes = (s) => [...s.types].sort((a, b) => TYPE_ORDER.indexOf(a) - TYPE_ORDER.indexOf(b));
export const typeTags = (s, labels) => sortedTypes(s).map((t) => `<span class="tag ${esc(t)}">${esc(labels.types[t])}</span>`).join('');
export const riskLabel = (s, labels) => `<span class="risk"><i class="dot ${esc(s.risk)}"></i>${esc(labels.risk[s.risk])}</span>`;
// 认证章仅用于详情与独立页；卡片只保留待核验提示。
const SEAL = '<svg class="seal" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.00 1.60 L13.76 3.17 L15.98 2.39 L17.00 4.52 L19.35 4.65 L19.48 7.00 L21.61 8.02 L20.83 10.24 L22.40 12.00 L20.83 13.76 L21.61 15.98 L19.48 17.00 L19.35 19.35 L17.00 19.48 L15.98 21.61 L13.76 20.83 L12.00 22.40 L10.24 20.83 L8.02 21.61 L7.00 19.48 L4.65 19.35 L4.52 17.00 L2.39 15.98 L3.17 13.76 L1.60 12.00 L3.17 10.24 L2.39 8.02 L4.52 7.00 L4.65 4.65 L7.00 4.52 L8.02 2.39 L10.24 3.17 Z" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="m8.4 12.3 2.4 2.4 4.8-4.9" fill="none" stroke="#fff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>';
export const badge = (s) => s.status === 'verified'
  ? `<span class="vbadge verified" title="已确认为厂商官方出品">${SEAL}官方已核验</span>`
  : `<span class="vbadge unverified" title="来自公开整理，尚未逐条确认官方身份">${ICON.clock}待核验</span>`;
const searchIndexes = new WeakMap();
export function searchScore(s, toks, db) {
  if (!toks.length) return 1;
  let index = searchIndexes.get(db);
  if (!index) { index = new WeakMap(); searchIndexes.set(db, index); }
  if (!index.has(s)) {
    const category = db.categories.find(c => c.id === s.category);
    index.set(s, [
      [s.name, s.nameEn], s.keywords ?? [], [s.summary, s.summaryEn],
      [category?.name, category?.nameEn, ...s.types.map(t => db.labels.types[t]), db.labels.risk[s.risk], ...s.access.map(a => db.labels.access[a])],
    ].map(field => field.filter(Boolean).map(text => text.toLowerCase())));
  }
  const fields = index.get(s);
  if (fields[0].includes(toks.join(' '))) return 1e9;
  const weights = [10000, 1000, 100, 1];
  const includes = (text, term) => /^[a-z0-9]/.test(term) ? new RegExp(`(?:^|[^a-z0-9])${reEsc(term)}`).test(text) : text.includes(term);
  let score = 0;
  for (const t of toks) {
    let best = 0;
    for (let i = 0; i < fields.length; i++) {
      if (fields[i].some(text => includes(text, t))) best = Math.max(best, weights[i]);
      else if (i < 3 && /^[\p{Script=Han}]{3,}$/u.test(t)) {
        const chars = Array.from(t);
        const pairs = [...new Set(chars.slice(1).map((char, j) => chars[j] + char))];
        const hits = pairs.filter(pair => fields[i].some(text => text.includes(pair))).length;
        if (hits >= Math.ceil(pairs.length / 2)) best = Math.max(best, weights[i] * hits / pairs.length / 2);
      }
    }
    if (!best) return 0;
    score += best;
  }
  return score;
}
export const textMatch = (s, toks, db) => searchScore(s, toks, db) > 0;
export function cardHtml(s, labels, { toks = [], index = 0, prefix = './', href, id, heading = href ? 'h3' : 'h4' } = {}) {
  return `<${href ? 'a' : 'button'} class="card" ${href ? `href="${esc(href)}"${id ? ` data-id="${esc(id)}"` : ''}` : `type="button" data-id="${esc(s.id)}"`} style="--brand:${brandColor(s)};--i:${index}">
    <div class="card-top">${logoHtml(s, '', prefix)}<div class="card-title"><${heading}><span class="nm">${highlight(s.name, toks)}</span></${heading}><p class="domain">${esc(host(s.url))}</p></div>${s.status === 'verified' ? '' : badge(s)}</div>
    <p class="card-sum">${highlight(s.summary, toks)}</p>
    <div class="card-foot">${typeTags(s, labels)}${riskLabel(s, labels)}</div>
  </${href ? 'a' : 'button'}>`;
}
// Coordinates use the label's horizontal center and top edge.
export function orbitLabelPosition({ x, y, size, width, labelWidth, labelHeight }) {
  const c = width / 2, half = labelWidth / 2, gap = 8;
  const clampX = (value) => Math.min(width - half - 4, Math.max(half + 4, value));
  const hitsCore = (p) => {
    const dx = Math.max(p.x - half - c, 0, c - p.x - half);
    const dy = Math.max(p.y - c, 0, c - p.y - labelHeight);
    return Math.hypot(dx, dy) < 74; // 56px core + 12px space + 6px entry motion.
  };
  const above = { x: clampX(x), y: y - size / 2 - gap - labelHeight };
  const below = { x: clampX(x), y: y + size / 2 + gap };
  if (above.y >= 4 && !hitsCore(above)) return above;
  if (below.y + labelHeight <= width - 4 && !hitsCore(below)) return below;
  const side = { x: clampX(x + (x >= c ? 1 : -1) * (size / 2 + gap + half)), y: y - labelHeight / 2 };
  // At the horizontal edge a wide label cannot fit beside the icon.
  // Keep the outward x shift and move it beyond both the icon and core.
  const hitsNode = side.x + half > x - size / 2 && side.x - half < x + size / 2;
  if (hitsCore(side) || hitsNode) side.y = y >= c
    ? Math.max(below.y, c + 74 + gap)
    : Math.min(above.y, c - 74 - gap - labelHeight);
  return side;
}

export function snippets(s) {
  const out = [];
  const shell = (value) => `'${String(value).replaceAll("'", "'\\''")}'`;
  const mcp = s.install?.mcp;
  if (mcp) {
    if (mcp.transport === 'stdio') {
      const env = Object.entries(mcp.env ?? {});
      const cmd = [mcp.command, ...(mcp.args ?? [])].map(shell).join(' ');
      out.push(['Claude Code', `claude mcp add${env.map(([k, v]) => ` --env ${shell(`${k}=${v}`)}`).join('')} --transport stdio ${shell(s.id)} -- ${cmd}`]);
      out.push(['JSON', JSON.stringify({ mcpServers: { [s.id]: { command: mcp.command, args: mcp.args ?? [], ...(env.length ? { env: mcp.env } : {}) } } }, null, 2)]);
      out.push(['Codex', `# ~/.codex/config.toml\n[mcp_servers.${s.id}]\ncommand = ${JSON.stringify(mcp.command)}\nargs = ${JSON.stringify(mcp.args ?? [])}` + (env.length ? `\n\n[mcp_servers.${s.id}.env]\n${env.map(([k, v]) => `${k} = ${JSON.stringify(v)}`).join('\n')}` : '')]);
    } else {
      const headers = Object.entries(mcp.headers ?? {});
      out.push(['Claude Code', `claude mcp add${headers.map(([k, v]) => ` --header ${shell(`${k}: ${v}`)}`).join('')} --transport ${mcp.transport} ${shell(s.id)} ${shell(mcp.url)}`]);
      out.push(['JSON', JSON.stringify({ mcpServers: { [s.id]: { type: mcp.transport, url: mcp.url, ...(headers.length ? { headers: mcp.headers } : {}) } } }, null, 2)]);
      if (mcp.transport === 'http') out.push(['Codex', `# ~/.codex/config.toml\n[mcp_servers.${s.id}]\nurl = ${JSON.stringify(mcp.url)}` + (headers.length ? `\n\n[mcp_servers.${s.id}.http_headers]\n${headers.map(([k, v]) => `${JSON.stringify(k)} = ${JSON.stringify(v)}`).join('\n')}` : '')]);
    }
  }
  if (s.install?.cli) out.push(['CLI', s.install.cli]);
  return out;
}


export function renderDetails(s, db, { detailPage = false } = {}) {
  const snips = snippets(s);
  const access = s.access.length ? s.access.map((a) => esc(db.labels.access[a])).join('、') : s.setup ? '见下方接入前准备' : '<span style="color:var(--faint)">待整理</span>';
  const category = db.categories.find((c) => c.id === s.category);
  const hasPlaceholder = snips.some(([, c]) => /<[^>]+>/.test(c));
  const setup = s.setup ? `<div class="setup-guide"><h4>接入前准备</h4><p>${esc(s.setup.requirements)}</p>
    <h4>按这几步接入</h4><ol>${s.setup.steps.map((step) => `<li>${esc(step.text)} <a href="${esc(safeUrl(step.url))}" target="_blank" rel="noopener">官方入口 ↗</a></li>`).join('')}</ol>
    <h4>如何确认成功</h4><p>${esc(s.setup.verify)}</p><p class="code-hint">接入指引核对日期：${esc(s.setup.checkedAt)}</p></div>` : '';
  return {
    actions: `<button class="btn btn-primary btn-sm" type="button" data-copy="${esc(servicePrompt(db.homepage, s))}">复制接入提示词</button>
      <a class="btn btn-ghost btn-sm" href="${esc(safeUrl(s.url))}" target="_blank" rel="noopener">官方文档${ICON.out}</a>
      ${s.repo ? `<a class="btn btn-ghost btn-sm" href="${esc(safeUrl(s.repo))}" target="_blank" rel="noopener">代码仓库${ICON.out}</a>` : ''}
      ${s.install?.skill ? `<a class="btn btn-ghost btn-sm" href="${esc(safeUrl(s.install.skill))}" target="_blank" rel="noopener">Skill 文件${ICON.out}</a>` : ''}
      ${detailPage ? '' : `<a class="btn btn-ghost btn-sm" href="${esc(serviceUrl(db.homepage, s.id))}" target="_blank" rel="noopener">查看完整详情${ICON.out}</a>`}`,
    facts: `<dl class="facts">
      <div><dt>类型</dt><dd>${typeTags(s, db.labels)}</dd></div>
      <div><dt>权限</dt><dd><i class="dot ${esc(s.risk)}"></i>${esc(db.labels.risk[s.risk])}</dd></div>
      <div><dt>接入门槛</dt><dd>${access}</dd></div>
      <div><dt>分类</dt><dd>${esc(category?.name ?? '')}</dd></div>
    </dl>`,
    warn: `<p class="code-hint">本站仅作信息索引，收录不构成背书；使用前请自行核实。<a href="${esc(safeUrl(`${db.homepage}#disclaimer`))}" target="_blank" rel="noopener">使用说明与免责声明</a></p>` + (s.risk === 'payment' ? '<p class="note warn">这个服务可能下单或付款。让 Agent 执行前，请确保付款这一步由你亲自确认。</p>' : ''),
    install: setup + (snips.length ? `<div class="code-tabs">
      <div class="ct-bar"><div class="ct-formats" role="tablist" aria-label="配置格式">${snips.map(([label, c], i) => `<button type="button" role="tab" data-tab data-code="${esc(c)}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${esc(label)}</button>`).join('')}</div><button type="button" class="ct-copy" data-copy="${esc(snips[0][1])}">复制</button></div>
      <pre role="tabpanel" aria-label="配置内容" tabindex="0"><code>${esc(snips[0][1])}</code></pre>
    </div><noscript>${snips.slice(1).map(([label, code]) => `<h4>${esc(label)}</h4><div class="code-tabs"><pre><code>${esc(code)}</code></pre></div>`).join('')}</noscript>${hasPlaceholder ? '<p class="code-hint">把尖括号里的内容换成你自己的 Key。</p>' : ''}${s.install?.mcp?.transport === 'sse' ? '<p class="code-hint">Codex 的远程配置仅支持 Streamable HTTP；SSE 请使用上方客户端或查阅官方 HTTP 接入方式。</p>' : ''}` : '<p class="note">配置片段尚未整理。复制接入提示词，让 Agent 继续核对官方文档。</p>'),
    verify: s.status === 'verified' ? `<p>${esc(s.evidence.checkedAt)} 确认为官方出品，<a href="${esc(safeUrl(s.evidence.url))}" target="_blank" rel="noopener">查看依据</a>${s.evidence.note ? `。${esc(s.evidence.note)}` : ''}</p>${s.evidence.quote ? `<p>官方原文摘录（${esc(s.evidence.checkedAt)}）</p><blockquote>${esc(s.evidence.quote)}</blockquote>` : ''}${s.evidence.agentReadable === false ? '<p class="code-hint">官方页需浏览器打开，Agent 可能读不到。</p>' : ''}<p class="code-hint">官方核验仅说明发布者身份，接入是否成功需在你的 Agent 中验证。</p>` : '<p>还没逐条确认是否为官方出品，接入前请以官方文档为准。</p>',
    sources: s.sources?.length ? `<p>${s.sources.map((x) => `<a href="${esc(safeUrl(x.url))}" target="_blank" rel="noopener">${esc(x.name)}</a>`).join('、')}</p>` : '',
  };
}
