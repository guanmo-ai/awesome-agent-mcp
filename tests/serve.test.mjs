import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('错误 URL 返回 400，后续正常预览仍可访问', async (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'agent-mcp-serve-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  mkdirSync(join(dir, 'scripts'));
  mkdirSync(join(dir, 'dist'));
  for (const name of ['serve.mjs', 'lib.mjs']) cpSync(new URL(`../scripts/${name}`, import.meta.url), join(dir, 'scripts', name));
  const html = '<!doctype html><title>预览测试</title>';
  writeFileSync(join(dir, 'dist/index.html'), html);
  const reservation = createServer().listen(0, '127.0.0.1');
  await once(reservation, 'listening');
  const port = reservation.address().port;
  await new Promise((resolve) => reservation.close(resolve));
  const child = spawn(process.execPath, ['scripts/serve.mjs'], {
    cwd: dir, env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  t.after(() => child.kill());
  let stderr = '';
  child.stderr.on('data', (chunk) => { stderr += chunk; });
  const [output] = await Promise.race([
    once(child.stdout, 'data'),
    once(child, 'exit').then(() => { throw Error(stderr || '预览进程提前退出'); }),
  ]);
  const address = String(output).match(/http:\/\/127\.0\.0\.1:\d+/)?.[0];
  assert.ok(address, String(output));
  for (const path of ['/%E0%A4%A', '/%00']) {
    const response = await fetch(address + path);
    assert.equal(response.status, 400);
    await response.body.cancel();
  }
  const response = await fetch(address + '/');
  assert.equal(response.status, 200);
  assert.equal(await response.text(), html);
});
