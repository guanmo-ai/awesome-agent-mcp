import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LABELS, readJson, validate } from '../scripts/lib.mjs';
import { renderDetails } from '../web/render.mjs';

const base = () => structuredClone(readJson('data/services.json'));
function rejects(edit, message) {
  const data = base();
  edit(data, data.services[0]);
  let errors;
  assert.doesNotThrow(() => { errors = validate(data); });
  assert.match(errors.join('\n'), message);
}

test('HTTPS 地址必须可解析，且不能夹带用户名或密码', () => {
  const fields = [
    (s, url) => { s.url = url; }, (s, url) => { s.repo = url; },
    (s, url) => { s.homepage = url; }, (s, url) => { s.evidence.url = url; },
    (s, url) => { s.sources = [{ name: '来源', url }]; },
    (s, url) => { s.install = { skill: url }; },
    (s, url) => { s.install = { mcp: { transport: 'http', url } }; },
  ];
  for (const set of fields) for (const url of ['https://%invalid', 'https://', 'https://user:secret@example.com/']) {
    rejects((_, s) => set(s, url), /https|evidence.url|install.mcp/i);
  }
});

test('枚举不会接受 Object 原型上的属性', () => {
  for (const value of ['constructor', 'toString', '__proto__']) {
    for (const [field, expected] of [['risk', /risk 必须是/], ['status', /status 必须是/]]) {
      rejects((_, s) => { s[field] = value; }, expected);
    }
    rejects((_, s) => { s.types = [value]; }, /未知类型/);
    rejects((_, s) => { s.access = [value]; }, /未知门槛/);
    rejects((_, s) => { s.install = { mcp: { transport: value, url: 'https://example.com/mcp' } }; }, /transport 必须是/);
  }
});

test('本地命令、参数、环境变量和请求头保持客户端需要的类型', () => {
  const cases = [
    ['command', '', /command/], ['command', [], /command/], ['command', 1, /command/],
    ['args', '-y example', /args/], ['args', null, /args/], ['args', {}, /args/], ['args', [1], /args/],
    ['env', null, /env/], ['env', [], /env/], ['env', 'KEY=value', /env/],
    ['env', { 'BAD KEY': 'x' }, /env/], ['env', { KEY: 1 }, /env/],
    ['headers', null, /headers/], ['headers', [], /headers/], ['headers', 'X-Test: x', /headers/],
    ['headers', { 'Bad Name': 'x' }, /headers/], ['headers', { Authorization: false }, /headers/],
    ['headers', { 'X-Test': 'x\r\ny' }, /headers/],
  ];
  for (const [field, value, expected] of cases) rejects((_, s) => {
    s.install = { mcp: { transport: 'stdio', command: 'node', [field]: value } };
  }, expected);
});

test('错误容器返回字段错误，不意外抛出异常', () => {
  for (const data of [null, [], 'data', 1]) assert.match(validate(data).join('\n'), /root/);
  for (const field of ['categories', 'services']) {
    for (const value of [undefined, null, {}, 'items']) rejects((data) => { data[field] = value; }, new RegExp(field));
    for (const value of [null, [], 'item']) rejects((data) => { data[field][0] = value; }, /对象/);
  }
  for (const value of [null, [], 'item']) {
    rejects((_, s) => { s.install = value; }, /install/);
    rejects((_, s) => { s.install = { mcp: value }; }, /install.mcp/);
    rejects((_, s) => { s.evidence = value; }, /evidence/);
    rejects((_, s) => { s.sources = [value]; }, /sources/);
  }
  for (const field of ['types', 'access', 'sources']) {
    for (const value of [null, {}, 'items']) rejects((_, s) => { s[field] = value; }, new RegExp(field));
  }
  const badValue = { toString: null };
  rejects((data) => { data.categories[0].id = badValue; }, /id/);
  rejects((_, s) => { s.id = badValue; }, /id/);
  rejects((_, s) => { s.id = 123; }, /id/);
  rejects((_, s) => { s.category = badValue; }, /分类/);
  rejects((_, s) => { s.types = [badValue]; }, /类型/);
  rejects((_, s) => { s.access = [badValue]; }, /门槛/);
  rejects((_, s) => { s.summary = { length: badValue }; }, /summary/);
});

test('日期必须是日历中存在的 YYYY-MM-DD', () => {
  for (const date of ['2026-02-29', '2026-04-31', '2026-13-01']) {
    rejects((data) => { data.updatedAt = date; }, /updatedAt/);
    rejects((_, s) => { s.addedAt = date; }, /addedAt/);
    rejects((_, s) => { s.evidence.checkedAt = date; }, /evidence.checkedAt/);
  }
});

test('现有数据和官方文档中的字符串占位配置仍然有效', () => {
  const data = base();
  const service = data.services[0];
  data.updatedAt = '2024-02-29';
  service.install = { mcp: {
    transport: 'http', url: 'https://example.com/mcp?key=<你的Key>&format=0',
    headers: { Authorization: 'Bearer <你的Token>', 'X-Request-Id': 'value' },
  } };
  assert.deepEqual(validate(data), []);
  service.install.mcp = { transport: 'stdio', command: 'node', args: ['a file.mjs', '<你的Key>'], env: { _TOKEN_2: '<你的Key>' } };
  assert.deepEqual(validate(data), []);
});

test('接入指引验证容器、文本、链接和日期', () => {
  const setup = () => ({ requirements: '需要账号', steps: [{ text: '登录', url: 'https://example.com/' }], verify: '查看结果', checkedAt: '2026-11-05' });
  for (const value of [null, [], 'setup']) rejects((_, s) => { s.setup = value; }, /setup/);
  for (const [field, values] of Object.entries({ requirements: ['', '  ', null], verify: ['', 1], steps: [[], null, {}, [null], [{ text: '', url: 'https://example.com' }], [{ text: '登录', url: 'javascript:alert(1)' }], [{ text: '登录', url: 'https://user:pass@example.com' }]], checkedAt: ['2026-02-29', null] })) {
    for (const value of values) rejects((_, s) => { s.setup = setup(); s.setup[field] = value; }, new RegExp(`setup\\.${field}`));
  }
  const data = base();
  data.services[0].setup = setup();
  assert.deepEqual(validate(data), []);
});

test('接入指引渲染时转义文本并限制链接协议', () => {
  const data = base();
  const service = data.services[0];
  service.setup = { requirements: '<img src=x onerror=alert(1)>', steps: [{ text: '<script>alert(1)</script>', url: 'javascript:alert(1)' }], verify: '<b>完成</b>', checkedAt: '2026-11-05' };
  const html = renderDetails(service, { ...data, labels: LABELS, homepage: 'https://example.com/' }).install;
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(html, /href="#" target="_blank" rel="noopener"/);
  assert.doesNotMatch(html, /<script>|href="javascript:/);
  assert.match(html, /&lt;b&gt;完成&lt;\/b&gt;/);
});

test('官方摘录必须是80字内原文字符串，可读性必须是布尔值', () => {
  for (const quote of ['', ' ', 12, '字'.repeat(81)]) rejects((_, s) => { s.evidence.quote = quote; }, /evidence.quote/);
  for (const agentReadable of ['false', 0, null]) rejects((_, s) => { s.evidence.agentReadable = agentReadable; }, /evidence.agentReadable/);
  const data = base(); data.services[0].evidence.quote = '字'.repeat(80); data.services[0].evidence.agentReadable = false;
  assert.deepEqual(validate(data), []);
});

test('办公权限来源必须是安全地址及布尔可读性', () => {
  for (const value of [null, {}, { url: 'javascript:alert(1)', agentReadable: true }, { url: 'https://example.com', agentReadable: 'false' }, { url: 'https://example.com', agentReadable: true, quote: 'x'.repeat(81) }]) {
    rejects((_, s) => { s.setup.permissionEvidence = value; }, /setup.permissionEvidence/);
  }
});
