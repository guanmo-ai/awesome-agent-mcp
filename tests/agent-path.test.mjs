import test from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { root } from '../scripts/lib.mjs';

function buildWith(t, edit) {
  const dir = mkdtempSync(join(tmpdir(), 'agent-path-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  for (const p of ['scripts', 'web', 'skills', 'data', 'site.config.json']) cpSync(join(root, p), join(dir, p), { recursive: true });
  const path = join(dir, 'data/services.json');
  const data = JSON.parse(readFileSync(path));
  edit(data);
  writeFileSync(path, JSON.stringify(data));
  return { ...spawnSync(process.execPath, [join(dir, 'scripts/build.mjs')], { encoding: 'utf8' }), dir };
}

test('有安装信息的 Agent 页面缺少费用或摘录原因时构建失败', (t) => {
  for (const [edit, message] of [
    [s => { delete s.setup.cost; }, /费用/],
    [s => { delete s.evidence.quote; }, /摘录/],
  ]) {
    const result = buildWith(t, data => edit(data.services.find(s => s.id === 'amap')));
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, message);
  }
});

test('未能摘录时可以说明原因，办公条目缺少权限说明时构建失败', (t) => {
  const allowed = buildWith(t, data => {
    const evidence = data.services.find(s => s.id === 'amap').evidence;
    delete evidence.quote;
    evidence.quoteMissingReason = '官方页面需登录，无法逐字摘录。';
  });
  assert.equal(allowed.status, 0, allowed.stderr);
  assert.match(readFileSync(join(allowed.dir, 'dist/s/amap.md'), 'utf8'), /官方页面需登录/);
  const rejected = buildWith(t, data => { delete data.services.find(s => s.id === 'feishu').setup; });
  assert.notEqual(rejected.status, 0);
  assert.match(rejected.stderr, /权限/);
});
