import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { root, load, validate, readJson } from '../scripts/lib.mjs';

const base = () => structuredClone(readJson('data/services.json'));
const initializeReply = { jsonrpc: '2.0', id: 1, result: { protocolVersion: '2025-03-26', capabilities: {}, serverInfo: { name: 'example', version: '1' } } };

test('数据通过校验', () => {
  assert.deepEqual(load().errors, []);
});

test('生成文件是最新的', () => {
  const r = spawnSync(process.execPath, [join(root, 'scripts/build.mjs'), '--check'], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
});

test('能发现常见的数据错误', () => {
  const d = base();
  const [a] = d.services;
  d.services.push({ ...a });
  d.services[1] = { ...d.services[1], types: ['plugin'], status: 'verified', evidence: undefined, risk: 'high', url: 'http://example.com' };
  const errors = validate(d).join('\n');
  for (const want of ['id 重复', '未知类型 plugin', 'evidence.url', 'risk 必须是', 'url 必须是 https']) {
    assert.match(errors, new RegExp(want.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('Skill 与站点配置一致', () => {
  const config = readJson('site.config.json');
  const skill = readFileSync(join(root, 'skills', config.skill, 'SKILL.md'), 'utf8');
  assert.match(skill, new RegExp(`^---\\nname: ${config.skill}\\n`));
  assert.ok(skill.includes(config.siteUrl), 'SKILL.md 应包含 siteUrl');
  assert.ok(skill.includes(`github.com/${config.repo}`) || skill.includes(`githubusercontent.com/${config.repo}`), 'SKILL.md 应包含仓库地址');
});

test('网页渲染数据时都做了转义', () => {
  // 标了「纯文本，渲染时再转义」的行拼的是纯文本，不直接进 HTML
  const js = readFileSync(join(root, 'web/app.js'), 'utf8').split('\n').filter((l) => !l.includes('纯文本，渲染时再转义')).join('\n');
  for (const field of ['s.name', 's.summary', 's.url', 'x.name']) {
    const raw = new RegExp(`\\$\\{${field.replace('.', '\\.')}\\}`);
    assert.doesNotMatch(js, raw, `${field} 未经 esc() 直接插入`);
  }
});


test('可用性检查拒绝伪 MCP 响应并移除 Key，占位符不发送到服务器', async () => {
  const { mcp, inspect } = await import('../scripts/check-links.mjs');
  const original = globalThis.fetch;
  try {
    for (const [status, body, pass] of [[401, '', false], [403, '', false], [404, '', false], [503, '', false], [200, '<html>login</html>', false], [200, JSON.stringify({ ...initializeReply, id: 2 }), false], [200, JSON.stringify(initializeReply), true]]) {
      globalThis.fetch = async (url, options) => { assert.equal(new URL(url).searchParams.has('key'), false); assert.equal(options.headers.Authorization, undefined); assert.equal(JSON.parse(options.body).method, 'initialize'); return new Response(body, { status }); };
      assert.equal((await mcp('https://example.com/mcp?key=<你的Key>', 'http')).startsWith('通过'), pass);
    }
    let stream, sent = 0;
    globalThis.fetch = async (url, options) => options.method === 'GET' ? new Response(new ReadableStream({ start(c) { stream = c; c.enqueue(new TextEncoder().encode('event: endpoint\ndata: /messages?session=1\n\n')); } })) : (sent++, stream.enqueue(new TextEncoder().encode(`event: message\ndata: ${JSON.stringify(initializeReply)}\n\n`)), new Response(null, { status: 202 }));
    assert.match(await mcp('https://example.com/sse', 'sse'), /^通过/); assert.equal(sent, 1);
    globalThis.fetch = async () => new Response('<html>---\nname: forged\ndescription: forged\n---</html>');
    assert.match(await inspect('skill', 'https://example.com/SKILL.md', {}), /^失败/);
    globalThis.fetch = async () => new Response('---\ndescription: skill\nname: example\n---\n');
    assert.match(await inspect('skill', 'https://example.com/SKILL.md', {}), /^通过/);
    globalThis.fetch = async () => new Response(JSON.stringify({ 'dist-tags': { latest: '1' }, versions: { 1: { deprecated: 'removed' } } }));
    assert.match(await inspect('npm', 'https://registry.npmjs.org/example', {}), /^失败/);
  } finally { globalThis.fetch = original; }
});

test('MCP 初始化错误、缺失必需字段和未知版本不能报告握手成功', async (t) => {
  const { mcp } = await import('../scripts/check-links.mjs');
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  const replies = [
    { jsonrpc: '2.0', id: 1, error: { code: -32601, message: 'Method not found' } },
    { ...initializeReply, result: { protocolVersion: 'bogus' } },
    { ...initializeReply, result: { ...initializeReply.result, capabilities: undefined } },
    { ...initializeReply, result: { ...initializeReply.result, serverInfo: {} } },
  ];
  for (const reply of replies) {
    globalThis.fetch = async () => new Response(JSON.stringify(reply));
    assert.doesNotMatch(await mcp('https://example.com/mcp', 'http'), /^通过/);
  }
  for (const status of [401, 403]) {
    globalThis.fetch = async () => new Response(null, { status });
    assert.match(await mcp('https://example.com/mcp', 'http'), /^待确认.*鉴权/);
  }
});

test('SSE 分片的 CRLF、CR 和多行 data 均能完成初始化', async (t) => {
  const { mcp } = await import('../scripts/check-links.mjs');
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  for (const separator of ['\r\n', '\r']) {
    let sent = 0;
    const data = JSON.stringify(initializeReply, null, 2).split('\n').map((line) => `data: ${line}`).join(separator);
    const chunks = ['event: endpoint\r', separator === '\r\n' ? '\ndata: /messages\r\n\r\n' : 'data: /messages\r\r', `event: message${separator}${data}${separator}${separator}`];
    globalThis.fetch = async (url, options) => options.method === 'GET'
      ? new Response(new ReadableStream({ start(c) { for (const chunk of chunks) c.enqueue(new TextEncoder().encode(chunk)); c.close(); } }))
      : (sent++, new Response(null, { status: 202 }));
    assert.match(await mcp('https://example.com/sse', 'sse'), /^通过/);
    assert.equal(sent, 1);
  }
});

test('安装包自报关联官方组织不能单独证明厂商归属', async (t) => {
  const { inspect } = await import('../scripts/check-links.mjs');
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = async () => new Response(JSON.stringify({ 'dist-tags': { latest: '1' }, versions: { 1: {
    _npmUser: { name: 'untrusted-publisher' }, repository: 'https://github.com/vendor/unverified-package',
  } } }));
  assert.match(await inspect('npm', 'https://registry.npmjs.org/example', { url: 'https://github.com/vendor/official' }), /^待确认/);
});

test('展示条目必须提供英文名称和简介，rejected 条目允许不填', () => {
  const d = base();
  const s = d.services.find((s) => s.status !== 'rejected');
  delete s.nameEn;
  s.summaryEn = ' ';
  assert.match(validate(d).join('\n'), /缺少 nameEn/);
  assert.match(validate(d).join('\n'), /缺少 summaryEn/);
  s.status = 'rejected'; s.rejectedReason = 'test';
  assert.deepEqual(validate(d), []);
});
