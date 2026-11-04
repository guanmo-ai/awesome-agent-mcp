import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { root, load, validate, readJson } from '../scripts/lib.mjs';

const base = () => structuredClone(readJson('data/services.json'));

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
  d.services[1] = { ...d.services[1], types: ['plugin'], status: 'verified', risk: 'high', url: 'http://example.com' };
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
