import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { root, readJson } from '../scripts/lib.mjs';

// Run the real build in an isolated fixture; never mutate the working catalog.
function buildFixture(edit = () => {}) {
  const dir = mkdtempSync(join(tmpdir(), 'agent-mcp-pages-'));
  for (const path of ['scripts', 'web', 'skills', 'data', 'site.config.json']) cpSync(join(root, path), join(dir, path), { recursive: true });
  const data = readJson('data/services.json');
  edit(data);
  writeFileSync(join(dir, 'data/services.json'), JSON.stringify(data));
  const build = spawnSync(process.execPath, [join(dir, 'scripts/build.mjs')], { encoding: 'utf8' });
  assert.equal(build.status, 0, build.stderr);
  return { dir, data, read: (path) => readFileSync(join(dir, 'dist', path), 'utf8') };
}

test('真实构建为所有公开服务生成可直接阅读的页面和完整 sitemap', (t) => {
  const fixture = buildFixture();
  t.after(() => rmSync(fixture.dir, { recursive: true, force: true }));
  const config = readJson('site.config.json');
  const home = fixture.read('index.html');
  const version = home.match(/app\.js\?v=([a-f0-9]+)/)[1];
  assert.ok(home.includes(`services.json?v=${version}`), '预加载数据必须与脚本请求的版本一致');
  for (const file of ['app.js', 'ui.mjs', 'service.js']) {
    const imports = [...fixture.read(file).matchAll(/from\s+['"]\.\/([^'"]+)['"]/g)].map((m) => m[1]);
    assert.ok(imports.length, `${file} 应有共享模块`);
    for (const dependency of imports) assert.ok(dependency.endsWith(`?v=${version}`), `${file} 的 ${dependency} 未更新缓存版本`);
  }
  const sitemapPath = join(fixture.dir, 'dist/sitemap.xml');
  assert.ok(existsSync(sitemapPath), '构建必须输出 sitemap');
  const sitemap = fixture.read('sitemap.xml');
  for (const s of fixture.data.services.filter((s) => s.status !== 'rejected')) {
    assert.ok(home.includes(`href="./s/${s.id}/" data-id="${s.id}"`), `${s.id} 在无 JavaScript 时也应有可用入口`);
    const html = fixture.read(`s/${s.id}/index.html`);
    assert.ok(existsSync(join(fixture.dir, 'dist/og', `${s.id}.jpg`)), `${s.id} 缺少服务分享图`);
    assert.doesNotMatch(html, /\{\{[a-zA-Z]+\}\}/, `${s.id} 有残留占位符`);
    assert.match(html, /<h1>[^<]+<\/h1>/);
    assert.ok(html.includes(`<link rel="canonical" href="${config.siteUrl}s/${s.id}/">`));
    assert.ok(html.includes(`读取 ${config.siteUrl}s/${s.id}/ ，帮我把${s.name}的官方接入配置进我的 Agent，Key 我自己填。`));
    assert.ok(sitemap.includes(`<loc>${config.siteUrl}s/${s.id}/</loc>`));
    const jsonLd = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    assert.equal(jsonLd['@type'], 'SoftwareApplication');
    assert.equal(jsonLd.name, s.name);
    assert.equal(jsonLd.publisher.name, s.name);
    assert.ok(fixture.read('llms.txt').includes(`${config.siteUrl}s/${s.id}/`));
  }
  assert.match(fixture.read('robots.txt'), /Sitemap: https:\/\/guanmo-ai\.github\.io\/awesome-agent-mcp\/sitemap\.xml/);
});

test('rejected 服务不会生成页面、同类推荐或 sitemap 地址', (t) => {
  let rejectedId;
  const fixture = buildFixture((data) => {
    const service = data.services[0];
    rejectedId = service.id;
    service.status = 'rejected';
    service.rejectedReason = '测试：明确排除';
  });
  t.after(() => rmSync(fixture.dir, { recursive: true, force: true }));
  assert.ok(!existsSync(join(fixture.dir, 'dist/s', rejectedId)), '不应生成 rejected 页面');
  assert.ok(existsSync(join(fixture.dir, 'dist/sitemap.xml')), '构建必须输出 sitemap');
  assert.ok(!fixture.read('sitemap.xml').includes(`/s/${rejectedId}/`));
  for (const s of fixture.data.services.filter((s) => s.status !== 'rejected')) assert.ok(!fixture.read(`s/${s.id}/index.html`).includes(`href="../${rejectedId}/"`));
});

test('静态详情转义恶意文字、属性、配置与 JSON-LD 的 script 结束符', (t) => {
  const fixture = buildFixture((data) => {
    const s = data.services[0];
    s.name = '"><script>alert(1)</script>';
    s.summary = '<img src=x onerror=alert(2)>';
    s.status = 'verified';
    s.evidence = { url: 'https://example.com/evidence', checkedAt: '2026-11-04', note: '<img src=x onerror=alert(3)>' };
    s.sources = [{ name: '<img src=x onerror=alert(4)>', url: 'https://example.com/source' }];
    s.install = { mcp: { transport: 'stdio', command: 'node', args: ['</script><script>alert(5)</script>'] } };
  });
  t.after(() => rmSync(fixture.dir, { recursive: true, force: true }));
  const s = fixture.data.services[0];
  const path = `s/${s.id}/index.html`;
  assert.ok(existsSync(join(fixture.dir, 'dist', path)), '必须生成静态详情页');
  const html = fixture.read(path);
  assert.doesNotMatch(fixture.read('index.html'), /<script>alert\([15]\)<\/script>|<img src=x/);
  assert.doesNotMatch(html, /<script>alert\([15]\)<\/script>|<img src=x/);
  assert.ok(html.includes('&lt;img src=x onerror=alert(2)&gt;'));
  assert.ok(html.includes('&lt;img src=x onerror=alert(3)&gt;'));
  assert.ok(html.includes('&lt;img src=x onerror=alert(4)&gt;'));
  const raw = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
  assert.ok(!raw.includes('</script>'));
  assert.equal(JSON.parse(raw).name, '"><script>alert(1)</script>');
});
