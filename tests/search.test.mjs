import test from 'node:test';
import assert from 'node:assert/strict';
import { LABELS, readJson, validate } from '../scripts/lib.mjs';
import * as render from '../web/render.mjs';
const data = readJson('data/services.json');
const db = { ...data, labels: LABELS, services: data.services.filter(s => s.status !== 'rejected') };
const rank = q => db.services.map(s => ({ s, score: render.searchScore(s, render.tokens(q), db) })).filter(x => x.score > 0).sort((a, b) => b.score - a.score).map(x => x.s.id);

test('自然语言查询找到对应服务，多个候选完整保留', () => {
  const cases = { 订机票: ['fliggy', 'tuniu', 'ctrip-business', 'variflight'], 打车: ['didi'], 股票: ['ifind', 'iwencai', 'guosen', 'eastmoney-miaoxiang'], 点咖啡: ['luckin'], 发邮件: ['qq-mail'], 查天气: ['amap', 'caiyun-weather'], 飞书文档: ['feishu'] };
  for (const [q, ids] of Object.entries(cases)) {
    const found = rank(q);
    for (const id of ids) assert.ok(found.slice(0, Math.max(3, ids.length)).includes(id), `${q}: ${id} in ${found}`);
  }
});

test('原整串及空格多词命中不减少，名称完全相同仍第一', () => {
  const queries = [...db.services.flatMap(s => [s.name, s.id]), '腾讯', '机票', 'MCP key', '地图 路线', '免费'];
  for (const q of queries) {
    const toks = render.tokens(q);
    const oldText = s => [s.name, s.id, s.summary, render.host(s.url), ...Object.values(db.categories.find(c => c.id === s.category) ?? {}), ...s.types.map(t => LABELS.types[t]), LABELS.risk[s.risk], ...s.access.map(a => LABELS.access[a])].join(' ').toLowerCase();
    for (const s of db.services.filter(s => toks.every(t => oldText(s).includes(t)))) assert.ok(rank(q).includes(s.id), `${q}: ${s.id}`);
  }
  for (const s of db.services) assert.equal(rank(s.name)[0], s.id);
  assert.deepEqual(rank('完全不存在的服务xyz'), []);
});

test('keywords 限制为最多六个非空且不重复的短语', () => {
  for (const keywords of [null, '股票', [''], ['a', 'a'], Array.from({ length: 7 }, (_, i) => String(i))]) {
    const copy = structuredClone(data); copy.services[0].keywords = keywords;
    assert.match(validate(copy).join('\n'), /keywords/);
  }
});
