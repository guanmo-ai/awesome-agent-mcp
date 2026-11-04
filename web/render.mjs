// Pure rendering shared by Node's static build and both browser entry points.
export const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const safeUrl = (url) => {
  try { const parsed = new URL(url); return parsed.protocol === 'https:' ? parsed.href : '#'; } catch { return '#'; }
};
export const brandColor = (s) => /^#[0-9a-f]{6}$/i.test(s.color ?? '') ? s.color : '#8b7dff';
export const serviceUrl = (home, id) => `${home}s/${encodeURIComponent(id)}/`;
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
export const badge = (s) => s.status === 'verified'
  ? `<span class="vbadge verified" title="已确认为厂商官方出品">${ICON.check}官方已核验</span>`
  : `<span class="vbadge unverified" title="来自公开整理，尚未逐条确认官方身份">${ICON.clock}待核验</span>`;
export function textMatch(s, toks, db) {
  const c = db.categories.find((c) => c.id === s.category);
  const l = db.labels;
  const text = [s.name, s.id, s.summary, host(s.url), c?.name, c?.nameEn, ...s.types.map((t) => l.types[t]), l.risk[s.risk], ...s.access.map((a) => l.access[a])].join(' ').toLowerCase();
  return toks.every((t) => text.includes(t));
}
export function cardHtml(s, labels, { toks = [], index = 0, prefix = './', href } = {}) {
  return `<${href ? 'a' : 'button'} class="card" ${href ? `href="${esc(href)}"` : `type="button" data-id="${esc(s.id)}"`} style="--brand:${brandColor(s)};--i:${index}" aria-label="${esc(s.name)}：${esc(s.summary)}">
    <div class="card-top">${logoHtml(s, '', prefix)}<div class="card-title"><h4>${highlight(s.name, toks)}</h4><p class="domain">${esc(host(s.url))}</p></div>${badge(s)}</div>
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
      out.push(['Claude Code', `claude mcp add --transport ${mcp.transport}${headers.map(([k, v]) => ` --header ${shell(`${k}: ${v}`)}`).join('')} ${shell(s.id)} ${shell(mcp.url)}`]);
      out.push(['JSON', JSON.stringify({ mcpServers: { [s.id]: { type: mcp.transport, url: mcp.url, ...(headers.length ? { headers: mcp.headers } : {}) } } }, null, 2)]);
      if (mcp.transport === 'http') out.push(['Codex', `# ~/.codex/config.toml\n[mcp_servers.${s.id}]\nurl = ${JSON.stringify(mcp.url)}` + (headers.length ? `\n\n[mcp_servers.${s.id}.http_headers]\n${headers.map(([k, v]) => `${JSON.stringify(k)} = ${JSON.stringify(v)}`).join('\n')}` : '')]);
    }
  }
  if (s.install?.cli) out.push(['CLI', s.install.cli]);
  return out;
}


export function renderDetails(s, db) {
  const snips = snippets(s);
  const access = s.access.length ? s.access.map((a) => esc(db.labels.access[a])).join('、') : '<span style="color:var(--faint)">待整理</span>';
  const category = db.categories.find((c) => c.id === s.category);
  const hasPlaceholder = snips.some(([, c]) => /<[^>]+>/.test(c));
  return {
    actions: `<a class="btn btn-primary btn-sm" href="${esc(safeUrl(s.url))}" target="_blank" rel="noopener">官方文档${ICON.out}</a>
      ${s.repo ? `<a class="btn btn-ghost btn-sm" href="${esc(safeUrl(s.repo))}" target="_blank" rel="noopener">代码仓库${ICON.out}</a>` : ''}
      ${s.install?.skill ? `<a class="btn btn-ghost btn-sm" href="${esc(safeUrl(s.install.skill))}" target="_blank" rel="noopener">Skill 文件${ICON.out}</a>` : ''}
      <button class="btn btn-ghost btn-sm" type="button" data-copy="${esc(serviceUrl(db.homepage, s.id))}">复制链接</button>`,
    facts: `<dl class="facts">
      <div><dt>类型</dt><dd>${typeTags(s, db.labels)}</dd></div>
      <div><dt>权限</dt><dd><i class="dot ${esc(s.risk)}"></i>${esc(db.labels.risk[s.risk])}</dd></div>
      <div><dt>接入门槛</dt><dd>${access}</dd></div>
      <div><dt>分类</dt><dd>${esc(category?.name ?? '')}</dd></div>
    </dl>`,
    warn: s.risk === 'payment' ? '<p class="note warn">这个服务可能下单或付款。让 Agent 执行前，请确保付款这一步由你亲自确认。</p>' : '',
    install: snips.length ? `<div class="code-tabs">
      <div class="ct-bar" role="tablist" aria-label="配置格式">${snips.map(([label, c], i) => `<button type="button" role="tab" data-tab data-code="${esc(c)}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${esc(label)}</button>`).join('')}<button type="button" class="ct-copy" data-copy="${esc(snips[0][1])}">复制</button></div>
      <pre role="tabpanel" aria-label="配置内容" tabindex="0"><code>${esc(snips[0][1])}</code></pre>
    </div><noscript>${snips.slice(1).map(([label, code]) => `<h4>${esc(label)}</h4><div class="code-tabs"><pre><code>${esc(code)}</code></pre></div>`).join('')}</noscript>${hasPlaceholder ? '<p class="code-hint">把尖括号里的内容换成你自己的 Key。</p>' : ''}${s.install?.mcp?.transport === 'sse' ? '<p class="code-hint">Codex 的远程配置仅支持 Streamable HTTP；SSE 请使用上方客户端或查阅官方 HTTP 接入方式。</p>' : ''}` : '<p class="note">一键配置还在整理中，先按官方文档接入。</p>',
    verify: s.status === 'verified' ? `<p>${esc(s.evidence.checkedAt)} 确认为官方出品，<a href="${esc(safeUrl(s.evidence.url))}" target="_blank" rel="noopener">查看依据</a>${s.evidence.note ? `。${esc(s.evidence.note)}` : ''}</p>` : '<p>还没逐条确认是否为官方出品，接入前请以官方文档为准。</p>',
    sources: s.sources?.length ? `<p>${s.sources.map((x) => `<a href="${esc(safeUrl(x.url))}" target="_blank" rel="noopener">${esc(x.name)}</a>`).join('、')}</p>` : '',
  };
}
