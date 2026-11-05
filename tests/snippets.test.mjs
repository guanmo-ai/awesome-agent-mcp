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
    'mcp', 'add', '--env', 'API_KEY=${API_KEY} with spaces $UNSET', '--transport', 'stdio', 'example', '--',
    'node', "a file's name.mjs", '--token', '${EXAMPLE_ARG_2}', '$UNSET',
  ]);
});

test('远程 Claude Code URL 不展开 shell 变量', () => {
  const command = snippets({ id: 'remote', install: { mcp: { transport: 'http', url: 'https://example.com/mcp?key=<你的Key>&literal=$UNSET' } } }).find(([label]) => label === 'Claude Code')[1];
  const result = spawnSync('sh', ['-c', 'claude() { printf "%s\\0" "$@"; };\n' + command], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.split('\0').at(-2), 'https://example.com/mcp?key=${REMOTE_KEY}&literal=$UNSET');
});

test('旧式 SSE 不冒充 Codex 的 Streamable HTTP 配置', () => {
  const result = snippets({ id: 'legacy', install: { mcp: { transport: 'sse', url: 'https://example.com/sse' } } });
  assert.ok(result.some(([label]) => label === 'Claude Code'));
  assert.ok(result.some(([label]) => label === 'JSON'));
  assert.ok(!result.some(([label]) => label === 'Codex'));
});

test('远程认证请求头出现在三个客户端的配置中', () => {
  const result = Object.fromEntries(snippets({ id: 'remote', install: { mcp: {
    transport: 'http', url: 'https://example.com/mcp', headers: { Authorization: 'Bearer <你的Token>', 'X-Test': 'a b' },
  } } }));
  const command = spawnSync('sh', ['-c', 'claude() { printf "%s\\0" "$@"; };\n' + result['Claude Code']], { encoding: 'utf8' });
  assert.equal(command.status, 0, command.stderr);
  // --header 接收多个值，后面必须先用另一个选项结束它，才能保留 name/url 位置参数。
  assert.deepEqual(command.stdout.split('\0').slice(0, -1), [
    'mcp', 'add', '--header', 'Authorization: Bearer ${REMOTE_TOKEN}', '--header', 'X-Test: a b',
    '--transport', 'http', 'remote', 'https://example.com/mcp',
  ]);
  assert.deepEqual(JSON.parse(result.JSON).mcpServers.remote.headers, { Authorization: 'Bearer ${REMOTE_TOKEN}', 'X-Test': 'a b' });
  assert.match(result.Codex, /bearer_token_env_var = "REMOTE_TOKEN"/);
  assert.match(result.Codex, /\[mcp_servers.remote.http_headers\]\n"X-Test" = "a b"/);
  assert.doesNotMatch(result.Codex, /Bearer|你的Token/);
});

test('JSON优先使用客户端环境变量，Codex区分继承变量、动态头和静态值', () => {
  const s = { id: 'example', install: { mcp: { transport: 'http', url: 'https://example.com/mcp?key=<你的Key>', headers: { 'X-API-Key': '<你的Key>', 'X-Mode': 'read' } } } };
  const result = snippets(s);
  assert.equal(result[0][0], 'JSON');
  const json = JSON.parse(result[0][1]).mcpServers.example;
  assert.equal(json.url, 'https://example.com/mcp?key=${EXAMPLE_KEY}');
  assert.equal(json.headers['X-API-Key'], '${EXAMPLE_X_API_KEY}');
  const codex = Object.fromEntries(result).Codex;
  assert.match(codex, /\[mcp_servers.example.env_http_headers\]\n"X-API-Key" = "EXAMPLE_X_API_KEY"/);
  assert.match(codex, /\[mcp_servers.example.http_headers\]\n"X-Mode" = "read"/);
  const local = Object.fromEntries(snippets({ id: 'local', install: { mcp: { transport: 'stdio', command: 'node', env: { API_KEY: '<你的Key>', MODE: 'read' } } } }));
  assert.match(local.Codex, /env_vars = \["API_KEY"\]/);
  assert.doesNotMatch(local.Codex, /API_KEY =|你的Key/);
  assert.equal(JSON.parse(local.JSON).mcpServers.local.env.API_KEY, '${API_KEY}');
});
