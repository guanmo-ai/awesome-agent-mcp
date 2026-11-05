import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const readJson = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));

export const LABELS = {
  types: { mcp: 'MCP', skill: 'Skill', cli: 'CLI' },
  risk: { read: '只读查询', write: '可执行操作', payment: '涉及资金' },
  riskIcon: { read: '🟢', write: '🟡', payment: '🔴' },
  access: {
    free: '免费可用',
    key: '需 API Key',
    account: '需授权账号',
    membership: '需会员或付费',
    'desktop-app': '需桌面客户端',
    apply: '需申请开通',
  },
  status: { verified: '已核验', unverified: '待核验', rejected: '不收录' },
  transport: { http: 'Streamable HTTP', sse: 'SSE', stdio: 'stdio' },
};

const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const HEX = /^#[0-9a-fA-F]{6}$/;
const isHttps = (u) => typeof u === 'string' && /^https:\/\/[^\s]+$/.test(u);

/** Returns a list of human-readable problems; empty means valid. */
export function validate(data) {
  const errors = [];
  const err = (where, msg) => errors.push(`${where}: ${msg}`);
  if (data.schemaVersion !== 1) err('root', 'schemaVersion 必须为 1');
  if (!DATE.test(data.updatedAt ?? '')) err('root', 'updatedAt 必须是 YYYY-MM-DD');
  const cats = new Set();
  for (const c of data.categories ?? []) {
    if (!ID.test(c.id ?? '')) err(`category ${c.id}`, 'id 格式不对');
    if (cats.has(c.id)) err(`category ${c.id}`, 'id 重复');
    if (!c.name) err(`category ${c.id}`, '缺少 name');
    if (!c.nameEn || typeof c.nameEn !== 'string' || !c.nameEn.trim()) err(`category ${c.id}`, '缺少 nameEn');
    cats.add(c.id);
  }
  const ids = new Set();
  const urls = new Map();
  for (const s of data.services ?? []) {
    const w = `service ${s.id ?? '(无 id)'}`;
    if (!ID.test(s.id ?? '')) err(w, 'id 只能用小写字母、数字和连字符');
    if (ids.has(s.id)) err(w, 'id 重复');
    ids.add(s.id);
    for (const k of ['name', 'summary']) if (!s[k] || typeof s[k] !== 'string') err(w, `缺少 ${k}`);
    if (s.status !== 'rejected') for (const k of ['nameEn', 'summaryEn']) if (typeof s[k] !== 'string' || !s[k].trim()) err(w, `缺少 ${k}`);
    if (s.summary && s.summary.length > 60) err(w, 'summary 超过 60 字');
    if (!cats.has(s.category)) err(w, `未知分类 ${s.category}`);
    if (!Array.isArray(s.types) || !s.types.length) err(w, 'types 至少一项');
    for (const t of s.types ?? []) if (!LABELS.types[t]) err(w, `未知类型 ${t}`);
    if (new Set(s.types).size !== s.types?.length) err(w, 'types 有重复');
    if (!isHttps(s.url)) err(w, 'url 必须是 https 链接');
    if (s.url && s.status !== 'rejected') {
      if (urls.has(s.url)) err(w, `url 与 ${urls.get(s.url)} 重复`);
      urls.set(s.url, s.id);
    }
    if (s.repo !== undefined && !isHttps(s.repo)) err(w, 'repo 必须是 https 链接');
    if (s.color !== undefined && !HEX.test(s.color)) err(w, 'color 必须是 #RRGGBB');
    if (!LABELS.risk[s.risk]) err(w, `risk 必须是 ${Object.keys(LABELS.risk).join('/')}`);
    if (!Array.isArray(s.access)) err(w, 'access 必须是数组（未知时留空）');
    for (const a of s.access ?? []) if (!LABELS.access[a]) err(w, `未知门槛 ${a}`);
    if (!LABELS.status[s.status]) err(w, `status 必须是 ${Object.keys(LABELS.status).join('/')}`);
    if (s.status === 'verified') {
      if (!isHttps(s.evidence?.url)) err(w, '已核验条目需要 evidence.url');
      if (!DATE.test(s.evidence?.checkedAt ?? '')) err(w, '已核验条目需要 evidence.checkedAt');
    }
    if (s.status === 'rejected' && !s.rejectedReason) err(w, '不收录条目需要 rejectedReason');
    if (!DATE.test(s.addedAt ?? '')) err(w, 'addedAt 必须是 YYYY-MM-DD');
    if (s.homepage !== undefined && !isHttps(s.homepage)) err(w, 'homepage 必须是 https 链接');
    if (s.appStoreId !== undefined && !(Number.isInteger(s.appStoreId) && s.appStoreId > 0)) err(w, 'appStoreId 必须是正整数');
    if (s.sources !== undefined && !Array.isArray(s.sources)) err(w, 'sources 必须是数组');
    for (const src of s.sources ?? []) if (!src.name || !isHttps(src.url)) err(w, 'sources 每项需要 name 和 https url');
    const mcp = s.install?.mcp;
    if (mcp) {
      if (!LABELS.transport[mcp.transport]) err(w, 'install.mcp.transport 必须是 http/sse/stdio');
      if (mcp.transport === 'stdio' ? !mcp.command : !isHttps(mcp.url)) err(w, 'install.mcp 远程需 url，stdio 需 command');
    }
    if (s.install?.cli !== undefined && typeof s.install.cli !== 'string') err(w, 'install.cli 必须是字符串');
    if (s.install?.skill !== undefined && !isHttps(s.install.skill)) err(w, 'install.skill 必须是 https 链接');
  }
  return errors;
}

export function load() {
  const config = readJson('site.config.json');
  const data = readJson('data/services.json');
  const errors = validate(data);
  return { config, data, errors };
}

/** Services that are shown publicly, grouped in category order. */
export function grouped(data) {
  const live = data.services.filter((s) => s.status !== 'rejected');
  return data.categories
    .map((c) => ({ ...c, services: live.filter((s) => s.category === c.id) }))
    .filter((c) => c.services.length);
}

export const rawUrl = (config, path) => `https://raw.githubusercontent.com/${config.repo}/${config.branch}/${path}`;
