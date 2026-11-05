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
    `我的需求：${need.trim() || '请先问我想完成什么任务。'}`,
    `先读取 ${url}`,
    '根据需求筛选官方接入，核对厂商文档，说明适用对象、账号或费用门槛，以及当前 Agent 是否支持。',
    '已核验仅代表官方身份，未收录不代表不存在；缺少的信息请明确说明，不要编造配置。',
    '选定服务后，按我的授权帮助配置并验证连接；Key 和账号授权由我在本地完成，不要让我把密钥发到对话里。',
    '最后报告实际验证结果和剩余步骤；下单、付款前由我确认。',
  ].join('\n');
}
export function skillPrompt(url, name) {
  return `读取 ${url}\n检查内容后，按当前 Agent 的官方安装方式安装 ${name}，保留已有同名 Skill。\n如果不支持 Skill，就直接读取索引。安装后用一个查询验证能否找到官方服务，说明结果；这不代表服务已接通。`;
}
export const tokens = (q) => q.toLowerCase().split(/\s+/).filter(Boolean);
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
// 认证章：卡片上只放图形，详情与独立页配文字
const SEAL = '<svg class="seal" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.00 1.60 L13.76 3.17 L15.98 2.39 L17.00 4.52 L19.35 4.65 L19.48 7.00 L21.61 8.02 L20.83 10.24 L22.40 12.00 L20.83 13.76 L21.61 15.98 L19.48 17.00 L19.35 19.35 L17.00 19.48 L15.98 21.61 L13.76 20.83 L12.00 22.40 L10.24 20.83 L8.02 21.61 L7.00 19.48 L4.65 19.35 L4.52 17.00 L2.39 15.98 L3.17 13.76 L1.60 12.00 L3.17 10.24 L2.39 8.02 L4.52 7.00 L4.65 4.65 L7.00 4.52 L8.02 2.39 L10.24 3.17 Z" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="m8.4 12.3 2.4 2.4 4.8-4.9" fill="none" stroke="#fff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>';
export const badge = (s) => s.status === 'verified'
  ? `<span class="vbadge verified" title="已确认为厂商官方出品">${SEAL}官方已核验</span>`
  : `<span class="vbadge unverified" title="来自公开整理，尚未逐条确认官方身份">${ICON.clock}待核验</span>`;
const searchIndexes = new WeakMap();
export function textMatch(s, toks, db) {
  if (!toks.length) return true;
  let index = searchIndexes.get(db);
  if (!index) { index = new WeakMap(); searchIndexes.set(db, index); }
  if (!index.has(s)) index.set(s, searchText(s, db));
  return toks.every((t) => index.get(s).includes(t));
}
function searchText(s, db) {
  const c = db.categories.find((c) => c.id === s.category);
  const l = db.labels;
  const text = [s.name, s.id, s.summary, host(s.url), c?.name, c?.nameEn, ...s.types.map((t) => l.types[t]), l.risk[s.risk], ...s.access.map((a) => l.access[a])].join(' ').toLowerCase();
  return text;
}
export function cardHtml(s, labels, { toks = [], index = 0, prefix = './', href, id, heading = href ? 'h3' : 'h4' } = {}) {
  return `<${href ? 'a' : 'button'} class="card" ${href ? `href="${esc(href)}"${id ? ` data-id="${esc(id)}"` : ''}` : `type="button" data-id="${esc(s.id)}"`} style="--brand:${brandColor(s)};--i:${index}">
    <div class="card-top">${logoHtml(s, '', prefix)}<div class="card-title"><${heading}><span class="nm">${highlight(s.name, toks)}</span>${s.status === 'verified' ? `<span class="vseal" title="官方已核验">${SEAL}</span>` : ''}</${heading}><p class="domain">${esc(host(s.url))}</p></div>${s.status === 'verified' ? '' : badge(s)}</div>
    <p class="card-sum">${highlight(s.summary, toks)}</p>
    <div class="card-foot">${typeTags(s, labels)}${riskLabel(s, labels)}</div>
  </${href ? 'a' : 'button'}>`;
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


export function renderDetails(s, db) {
  const snips = snippets(s);
  const access = s.access.length ? s.access.map((a) => esc(db.labels.access[a])).join('、') : s.setup ? '见下方接入前准备' : '<span style="color:var(--faint)">待整理</span>';
  const category = db.categories.find((c) => c.id === s.category);
  const hasPlaceholder = snips.some(([, c]) => /<[^>]+>/.test(c));
  const setup = s.setup ? `<div class="setup-guide"><h4>接入前准备</h4><p>${esc(s.setup.requirements)}</p>
    <h4>按这几步接入</h4><ol>${s.setup.steps.map((step) => `<li>${esc(step.text)} <a href="${esc(safeUrl(step.url))}" target="_blank" rel="noopener">官方入口 ↗</a></li>`).join('')}</ol>
    <h4>如何确认成功</h4><p>${esc(s.setup.verify)}</p><p class="code-hint">接入指引核对日期：${esc(s.setup.checkedAt)}</p></div>` : '';
  return {
    actions: `<button class="btn btn-primary btn-sm" type="button" data-copy="${esc(agentPrompt(serviceUrl(db.homepage, s.id), `帮我接入${s.name}`))}">复制接入提示词</button>
      <a class="btn btn-ghost btn-sm" href="${esc(safeUrl(s.url))}" target="_blank" rel="noopener">官方文档${ICON.out}</a>
      ${s.repo ? `<a class="btn btn-ghost btn-sm" href="${esc(safeUrl(s.repo))}" target="_blank" rel="noopener">代码仓库${ICON.out}</a>` : ''}
      ${s.install?.skill ? `<a class="btn btn-ghost btn-sm" href="${esc(safeUrl(s.install.skill))}" target="_blank" rel="noopener">Skill 文件${ICON.out}</a>` : ''}
      <button class="btn btn-ghost btn-sm" type="button" data-copy="${esc(serviceUrl(db.homepage, s.id))}">复制链接</button>`,
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
    verify: s.status === 'verified' ? `<p>${esc(s.evidence.checkedAt)} 确认为官方出品，<a href="${esc(safeUrl(s.evidence.url))}" target="_blank" rel="noopener">查看依据</a>${s.evidence.note ? `。${esc(s.evidence.note)}` : ''}</p><p class="code-hint">官方核验仅说明发布者身份，接入是否成功需在你的 Agent 中验证。</p>` : '<p>还没逐条确认是否为官方出品，接入前请以官方文档为准。</p>',
    sources: s.sources?.length ? `<p>${s.sources.map((x) => `<a href="${esc(safeUrl(x.url))}" target="_blank" rel="noopener">${esc(x.name)}</a>`).join('、')}</p>` : '',
  };
}
