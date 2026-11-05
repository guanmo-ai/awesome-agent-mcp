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
const ENV = /^[A-Za-z_][A-Za-z0-9_]*$/;
const HEADER = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;
const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const valueLabel = (v) => typeof v === 'string' ? v : JSON.stringify(v);
const member = (labels, v) => typeof v === 'string' && Object.hasOwn(labels, v);
const isDate = (v) => typeof v === 'string' && DATE.test(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v;
function isHttps(u) {
  if (typeof u !== 'string' || !/^https:\/\/[^\s]+$/.test(u)) return false;
  try {
    const parsed = new URL(u);
    return parsed.protocol === 'https:' && !!parsed.hostname && !parsed.username && !parsed.password;
  } catch { return false; }
}

/** Returns a list of human-readable problems; empty means valid. */
export function validate(data) {
  const errors = [];
  const err = (where, msg) => errors.push(`${where}: ${msg}`);
  if (!isObject(data)) return ['root: 必须是对象'];
  if (data.schemaVersion !== 1) err('root', 'schemaVersion 必须为 1');
  if (!isDate(data.updatedAt)) err('root', 'updatedAt 必须是有效的 YYYY-MM-DD');
  for (const field of ['categories', 'services']) if (!Array.isArray(data[field])) err('root', `${field} 必须是数组`);
  const cats = new Set();
  for (const c of Array.isArray(data.categories) ? data.categories : []) {
    if (!isObject(c)) { err('category', '每项必须是对象'); continue; }
    const w = `category ${valueLabel(c.id)}`;
    if (typeof c.id !== 'string' || !ID.test(c.id)) err(w, 'id 格式不对');
    if (cats.has(c.id)) err(w, 'id 重复');
    if (typeof c.name !== 'string' || !c.name.trim()) err(w, '缺少 name');
    if (!c.nameEn || typeof c.nameEn !== 'string' || !c.nameEn.trim()) err(w, '缺少 nameEn');
    cats.add(c.id);
  }
  const ids = new Set();
  const urls = new Map();
  for (const s of Array.isArray(data.services) ? data.services : []) {
    if (!isObject(s)) { err('service', '每项必须是对象'); continue; }
    const w = `service ${valueLabel(s.id ?? '(无 id)')}`;
    if (typeof s.id !== 'string' || !ID.test(s.id)) err(w, 'id 只能用小写字母、数字和连字符');
    if (ids.has(s.id)) err(w, 'id 重复');
    ids.add(s.id);
    for (const k of ['name', 'summary']) if (!s[k] || typeof s[k] !== 'string') err(w, `缺少 ${k}`);
    if (s.status !== 'rejected') for (const k of ['nameEn', 'summaryEn']) if (typeof s[k] !== 'string' || !s[k].trim()) err(w, `缺少 ${k}`);
    if (typeof s.summary === 'string' && s.summary.length > 60) err(w, 'summary 超过 60 字');
    if (!cats.has(s.category)) err(w, `未知分类 ${valueLabel(s.category)}`);
    if (!Array.isArray(s.types) || !s.types.length) err(w, 'types 至少一项');
    if (Array.isArray(s.types)) {
      for (const t of s.types) if (!member(LABELS.types, t)) err(w, `未知类型 ${valueLabel(t)}`);
      if (new Set(s.types).size !== s.types.length) err(w, 'types 有重复');
    }
    if (!isHttps(s.url)) err(w, 'url 必须是 https 链接');
    if (s.url && s.status !== 'rejected') {
      if (urls.has(s.url)) err(w, `url 与 ${valueLabel(urls.get(s.url))} 重复`);
      urls.set(s.url, s.id);
    }
    if (s.repo !== undefined && !isHttps(s.repo)) err(w, 'repo 必须是 https 链接');
    if (s.color !== undefined && (typeof s.color !== 'string' || !HEX.test(s.color))) err(w, 'color 必须是 #RRGGBB');
    if (!member(LABELS.risk, s.risk)) err(w, `risk 必须是 ${Object.keys(LABELS.risk).join('/')}`);
    if (!Array.isArray(s.access)) err(w, 'access 必须是数组（未知时留空）');
    else for (const a of s.access) if (!member(LABELS.access, a)) err(w, `未知门槛 ${valueLabel(a)}`);
    if (!member(LABELS.status, s.status)) err(w, `status 必须是 ${Object.keys(LABELS.status).join('/')}`);
    if (s.evidence !== undefined && !isObject(s.evidence)) err(w, 'evidence 必须是对象');
    if (s.status === 'verified') {
      if (!isHttps(s.evidence?.url)) err(w, '已核验条目需要 evidence.url');
      if (!isDate(s.evidence?.checkedAt)) err(w, '已核验条目需要有效的 evidence.checkedAt');
    }
    if (s.status === 'rejected' && (typeof s.rejectedReason !== 'string' || !s.rejectedReason.trim())) err(w, '不收录条目需要 rejectedReason');
    if (!isDate(s.addedAt)) err(w, 'addedAt 必须是有效的 YYYY-MM-DD');
    if (s.homepage !== undefined && !isHttps(s.homepage)) err(w, 'homepage 必须是 https 链接');
    if (s.appStoreId !== undefined && !(Number.isInteger(s.appStoreId) && s.appStoreId > 0)) err(w, 'appStoreId 必须是正整数');
    if (s.sources !== undefined && !Array.isArray(s.sources)) err(w, 'sources 必须是数组');
    if (Array.isArray(s.sources)) for (const src of s.sources) if (!isObject(src) || typeof src.name !== 'string' || !src.name.trim() || !isHttps(src.url)) err(w, 'sources 每项需要对象、name 和 https url');
    if (s.install !== undefined && !isObject(s.install)) err(w, 'install 必须是对象');
    const install = isObject(s.install) ? s.install : {};
    const mcp = install.mcp;
    if (mcp !== undefined && !isObject(mcp)) err(w, 'install.mcp 必须是对象');
    if (isObject(mcp)) {
      if (!member(LABELS.transport, mcp.transport)) err(w, 'install.mcp.transport 必须是 http/sse/stdio');
      if (mcp.transport !== 'stdio' && !isHttps(mcp.url)) err(w, 'install.mcp 远程需 https url');
      if ((mcp.transport === 'stdio' || mcp.command !== undefined) && (typeof mcp.command !== 'string' || !mcp.command.trim())) err(w, 'install.mcp.command 必须是非空字符串');
      if (mcp.args !== undefined && (!Array.isArray(mcp.args) || mcp.args.some((a) => typeof a !== 'string'))) err(w, 'install.mcp.args 必须是字符串数组');
      for (const [field, keyPattern] of [['env', ENV], ['headers', HEADER]]) {
        const values = mcp[field];
        if (values === undefined) continue;
        const invalid = !isObject(values) || Object.entries(values).some(([k, v]) => !keyPattern.test(k) || typeof v !== 'string' || (field === 'headers' && /[\0-\x08\x0a-\x1f\x7f]/.test(v)));
        if (invalid) err(w, `install.mcp.${field} 必须是合法名称与字符串值的对象`);
      }
    }
    if (install.cli !== undefined && typeof install.cli !== 'string') err(w, 'install.cli 必须是字符串');
    if (install.skill !== undefined && !isHttps(install.skill)) err(w, 'install.skill 必须是 https 链接');
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
