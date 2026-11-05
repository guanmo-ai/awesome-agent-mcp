// 检查展示中服务的链接、MCP 握手、包元数据与 Skill；不执行厂商功能。
// 国内不少网站会拦截海外机器访问，所以默认只出报告、不判失败；加 --strict 时，有失效链接就以非零状态退出。
import { appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { load, grouped } from './lib.mjs';

const { data, errors } = load();
if (errors.length) throw new Error(errors.join('\n'));
const strict = process.argv.includes('--strict');
const targets = [];
for (const s of grouped(data).flatMap((g) => g.services)) {
  targets.push([s.id, 'url', s.url]);
  if (s.repo) targets.push([s.id, 'repo', s.repo]);
  if (s.evidence?.url && s.evidence.url !== s.url) targets.push([s.id, 'evidence', s.evidence.url]);
  const m = s.install?.mcp;
  if (m && m.transport !== 'stdio') targets.push([s.id, `mcp-${m.transport}`, m.url, s]);
  if (s.install?.skill) targets.push([s.id, 'skill', s.install.skill, s]);
  const commands = [m?.transport === 'stdio' ? [m.command, ...(m.args ?? [])].join(' ') : '', s.install?.cli ?? ''].filter(Boolean);
  for (const cmd of commands) {
    const npm = /^(?:npx|npm (?:i|install))\s+(.+?)(?:\s*&&|$)/.exec(cmd);
    const py = /^(?:uvx|uv tool run|pip3? install)\s+(.+)/.exec(cmd);
    const args = (npm?.[1] ?? py?.[1] ?? '').split(/\s+/).filter((a) => a && !a.startsWith('-'));
    const names = npm ? (/^npm /.test(cmd) ? args : args.slice(0, 1)) : py ? args.slice(0, 1) : [];
    if (!names.length) targets.push([s.id, 'manual', s.url, s, `安装命令需人工核对：${cmd}`]);
    for (const spec of names) {
      if (spec.startsWith('git+')) { targets.push([s.id, 'source', spec.slice(4).split('#')[0].replace(/@[^/]+$/, ''), s]); continue; }
      const name = spec.replace(/\[.*?\]/, '').replace(/(?!^)@.*$|[<>=!~].*$/, '');
      targets.push([s.id, npm ? 'npm' : 'pypi', npm ? `https://registry.npmjs.org/${encodeURIComponent(name)}` : `https://pypi.org/pypi/${name}/json`, s]);
    }
  }
  const missing = s.types.filter((t) => !s.install?.[t]);
  if (missing.length) targets.push([s.id, 'manual', s.url, s, `未整理 ${missing.join('/')} 安装项，未执行可用性验证`]);
}

async function probe(url) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const r = await fetch(url, { method, redirect: 'follow', signal: AbortSignal.timeout(20000), headers: { 'user-agent': 'Mozilla/5.0 (awesome-agent-mcp link check)' } });
      await r.body?.cancel();
      if (r.ok || method === 'GET') return String(r.status);
    } catch (e) {
      if (method === 'GET') return e.name === 'TimeoutError' ? 'timeout' : 'error';
    }
  }
}

const protocolVersion = '2025-03-26';
const initialize = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion, capabilities: {}, clientInfo: { name: 'awesome-agent-mcp-check', version: '1' } } });
const auth = (r) => [401, 403].includes(r.status);
const needsAuth = (status) => `待确认：HTTP ${status}，端点需鉴权，未完成 MCP 握手`;
function streamEvents(text) {
  return text.split('\n\n').slice(0, -1).map((block) => {
    const lines = block.split('\n');
    return {
      event: lines.find((l) => l.startsWith('event:'))?.slice(6).trim() ?? 'message',
      data: lines.filter((l) => l.startsWith('data:')).map((l) => l.slice(5).replace(/^ /, '')).join('\n'),
    };
  });
}
function rpc(text) {
  for (const message of [text, ...streamEvents(text).map((e) => e.data)]) {
    let m;
    try { m = JSON.parse(message); } catch { continue; }
    if (m?.jsonrpc !== '2.0' || m.id !== 1) continue;
    if (m.error) return '失败：MCP initialize 返回错误';
    const result = m.result;
    if (result?.protocolVersion && result.protocolVersion !== protocolVersion) return '待确认：服务协商了探针不支持的协议版本';
    if (result?.protocolVersion === protocolVersion && result.capabilities && typeof result.capabilities === 'object' && !Array.isArray(result.capabilities)
      && typeof result.serverInfo?.name === 'string' && result.serverInfo.name.trim() && typeof result.serverInfo.version === 'string' && result.serverInfo.version.trim()) return '通过：收到有效 MCP initialize 响应';
    return '失败：MCP initialize 响应缺少必需字段';
  }
}
export async function mcp(url, transport) {
  const u = new URL(url);
  for (const [k, v] of [...u.searchParams]) if (/<[^>]+>/.test(v)) u.searchParams.delete(k);
  const options = { signal: AbortSignal.timeout(20000), headers: { Accept: 'application/json, text/event-stream', 'Content-Type': 'application/json' } };
  let r = await fetch(u, { ...options, method: transport === 'sse' ? 'GET' : 'POST', ...(transport === 'sse' ? {} : { body: initialize }) });
  if (auth(r)) { await r.body?.cancel(); return needsAuth(r.status); }
  if (!r.ok) { await r.body?.cancel(); return `失败：HTTP ${r.status}`; }
  const reader = r.body.getReader(), decoder = new TextDecoder();
  let raw = '', text = '', sent = transport !== 'sse';
  try {
    while (text.length < 65536) {
      const chunk = await reader.read(); if (chunk.done) break;
      raw += decoder.decode(chunk.value, { stream: true });
      text = raw.replace(/\r\n?/g, '\n');
      if (!sent) {
        const endpoint = streamEvents(text).find((e) => e.event === 'endpoint' && e.data);
        if (!endpoint) continue;
        const post = new URL(endpoint.data.trim(), u);
        if (post.origin !== u.origin) return '待确认：SSE 消息端点跨域';
        const reply = await fetch(post, { ...options, method: 'POST', body: initialize });
        const status = reply.status; await reply.body?.cancel(); sent = true;
        if (auth(reply)) return needsAuth(status);
        if (!reply.ok) return `失败：SSE initialize HTTP ${status}`;
      }
      const result = rpc(text);
      if (result) return result;
    }
    return '失败：没有 MCP initialize 响应';
  } finally { await reader.cancel().catch(() => {}); }
}
export async function inspect(field, url, s, note) {
  if (field === 'manual') return `待确认：${note}`;
  if (field.startsWith('mcp-')) return mcp(url, field.slice(4));
  const r = await fetch(url, { signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'awesome-agent-mcp-check' } });
  if (!r.ok) { await r.body?.cancel(); return `失败：HTTP ${r.status}`; }
  if (field === 'npm' || field === 'pypi') {
    const d = await r.json(); const v = field === 'npm' ? d.versions?.[d['dist-tags']?.latest] : d.info;
    if (!v) return '失败：没有可安装版本';
    if (v.deprecated || v.classifiers?.includes('Development Status :: 7 - Inactive') || (field === 'pypi' && (!d.urls?.length || d.urls.every((x) => x.yanked)))) return '失败：包已废弃或当前版本已撤回';
    const publisher = field === 'npm' ? v._npmUser?.name ?? d.maintainers?.map((x) => x.name).join(', ') : v.author || v.author_email || v.maintainer || v.maintainer_email;
    const repo = typeof v.repository === 'string' ? v.repository : v.repository?.url;
    const links = [repo, v.homepage, ...Object.values(v.project_urls ?? {})].filter(Boolean).map((x) => x.replace(/^git\+/, '').replace(/\.git$/, '').toLowerCase());
    const official = [s.url, s.repo, s.evidence?.url].filter(Boolean).filter((x) => /^https:\/\/github.com\/[^/]+/i.test(x)).map((x) => x.toLowerCase().split('/').slice(0, 4).join('/') + '/');
    const matched = links.some((x) => official.some((o) => x.startsWith(o)));
    return `待确认：包存在且未废弃；发布者 ${publisher || '未提供'}；${matched ? '包声明关联官方组织，归属仍需官方反向确认' : '厂商归属需人工核对'}；${links.join(', ')}`;
  }
  if (field === 'skill' && /\/SKILL\.md(?:[?#]|$)/i.test(url)) {
    const text = await r.text();
    const front = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text)?.[1] ?? '';
    return /^name:[ \t]*\S/m.test(front) && /^description:[ \t]*\S/m.test(front) ? '通过：SKILL.md 含 name / description' : '失败：SKILL.md 缺少 name / description 前言';
  }
  await r.body?.cancel();
  return field === 'source' ? '待确认：从官方源码安装，不经过 npm / PyPI' : '通过：链接可访问';
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const results = [];
  const queue = [...targets];
  await Promise.all(Array.from({ length: 8 }, async () => {
    while (queue.length) {
      const [id, field, url, s, note] = queue.shift();
      let status;
      try { status = s ? await inspect(field, url, s, note) : await probe(url); }
      catch (e) { status = `失败：${e.name} ${e.cause?.code ?? ''}`; }
      results.push({ id, field, url, status });
    }
  }));

  const bad = results.filter((r) => !/^[23]|^通过/.test(r.status)).sort((a, b) => a.id.localeCompare(b.id));
  const clean = (v) => String(v).replaceAll('|', '&#124;').replace(/[\r\n]+/g, ' ');
  const lines = [`## 可用性检查`, '', `共 ${results.length} 项：${results.length - bad.length} 项通过，${bad.length} 项需人工确认（包括失败、拦截和安装信息缺失）。不使用 Key，不安装包或执行厂商功能。`, '', '| 条目 | 字段 | 结果 | 地址 |', '| :-- | :-- | :-- | :-- |', ...results.sort((a, b) => a.id.localeCompare(b.id)).map((r) => `| ${r.id} | ${r.field} | ${clean(r.status)} | ${r.url} |`)];
  const report = lines.join('\n');
  console.log(report);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, report + '\n');
  if (strict && bad.length) process.exit(1);
}
