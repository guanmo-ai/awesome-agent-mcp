import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

import { snippets } from '../web/render.mjs';

test('Claude Code 本地配置保留参数和 Key 的边界，不执行 shell 元字符', () => {
  const command = snippets({ id: 'example', install: { mcp: {
    transport: 'stdio', command: 'node', args: ["a file's name.mjs", '--token', '<你的Key>', '$UNSET'],
    env: { API_KEY: '<你的Key> with spaces $UNSET' },
  } } }).find(([label]) => label === 'Claude Code')[1];
  const result = spawnSync('sh', ['-c', 'claude() { printf "%s\\0" "$@"; };\n' + command], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.stdout.split('\0').slice(0, -1), [
    'mcp', 'add', '--env', 'API_KEY=<你的Key> with spaces $UNSET', '--transport', 'stdio', 'example', '--',
    'node', "a file's name.mjs", '--token', '<你的Key>', '$UNSET',
  ]);
});

test('远程 Claude Code URL 不展开 shell 变量', () => {
  const command = snippets({ id: 'remote', install: { mcp: { transport: 'http', url: 'https://example.com/mcp?key=<你的Key>&literal=$UNSET' } } }).find(([label]) => label === 'Claude Code')[1];
  const result = spawnSync('sh', ['-c', 'claude() { printf "%s\\0" "$@"; };\n' + command], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.split('\0').at(-2), 'https://example.com/mcp?key=<你的Key>&literal=$UNSET');
});

test('旧式 SSE 不冒充 Codex 的 Streamable HTTP 配置', () => {
  const result = snippets({ id: 'legacy', install: { mcp: { transport: 'sse', url: 'https://example.com/sse' } } });
  assert.ok(result.some(([label]) => label === 'Claude Code'));
  assert.ok(result.some(([label]) => label === 'JSON'));
  assert.ok(!result.some(([label]) => label === 'Codex'));
});

test('远程认证请求头出现在三个客户端的配置中', () => {
  const result = Object.fromEntries(snippets({ id: 'remote', install: { mcp: {
    transport: 'http', url: 'https://example.com/mcp', headers: { Authorization: 'Bearer <你的Token>' },
  } } }));
  const command = spawnSync('sh', ['-c', 'claude() { printf "%s\\0" "$@"; };\n' + result['Claude Code']], { encoding: 'utf8' });
  assert.equal(command.status, 0, command.stderr);
  assert.ok(command.stdout.split('\0').includes('Authorization: Bearer <你的Token>'));
  assert.deepEqual(JSON.parse(result.JSON).mcpServers.remote.headers, { Authorization: 'Bearer <你的Token>' });
  assert.match(result.Codex, /\[mcp_servers.remote.http_headers\]\n"Authorization" = "Bearer <你的Token>"/);
});
