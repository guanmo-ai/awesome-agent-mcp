// 检查所有展示中条目的链接能否打开。
// 国内不少网站会拦截海外机器访问，所以默认只出报告、不判失败；加 --strict 时，有失效链接就以非零状态退出。
import { appendFileSync } from 'node:fs';
import { load, grouped } from './lib.mjs';

const { data } = load();
const strict = process.argv.includes('--strict');
const targets = [];
for (const s of grouped(data).flatMap((g) => g.services)) {
  targets.push([s.id, 'url', s.url]);
  if (s.repo) targets.push([s.id, 'repo', s.repo]);
  if (s.evidence?.url && s.evidence.url !== s.url) targets.push([s.id, 'evidence', s.evidence.url]);
}

async function probe(url) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const r = await fetch(url, { method, redirect: 'follow', signal: AbortSignal.timeout(20000), headers: { 'user-agent': 'Mozilla/5.0 (awesome-agent-mcp link check)' } });
      if (r.ok || method === 'GET') return String(r.status);
    } catch (e) {
      if (method === 'GET') return e.name === 'TimeoutError' ? 'timeout' : 'error';
    }
  }
}

const results = [];
const queue = [...targets];
await Promise.all(Array.from({ length: 8 }, async () => {
  while (queue.length) {
    const [id, field, url] = queue.shift();
    results.push({ id, field, url, status: await probe(url) });
  }
}));

const bad = results.filter((r) => !/^[23]/.test(r.status)).sort((a, b) => a.id.localeCompare(b.id));
const lines = [`## 链接检查`, '', `共 ${results.length} 个链接，${bad.length} 个需要人工确认。`, ''];
if (bad.length) lines.push('| 条目 | 字段 | 状态 | 链接 |', '| :-- | :-- | :-- | :-- |', ...bad.map((r) => `| ${r.id} | ${r.field} | ${r.status} | ${r.url} |`));
const report = lines.join('\n');
console.log(report);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, report + '\n');
if (strict && bad.length) process.exit(1);
