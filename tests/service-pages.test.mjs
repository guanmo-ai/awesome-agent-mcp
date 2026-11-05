import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { agentPrompt, servicePrompt, renderDetails, esc, snippets } from '../web/render.mjs';
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
  const embedded = JSON.parse(home.match(/<script type="application\/json" id="catalog-data">([\s\S]*?)<\/script>/)[1]);
  const published = JSON.parse(fixture.read('services.json'));
  assert.ok(home.includes(esc(agentPrompt(`${config.siteUrl}llms.txt`))), '不开 JavaScript 也能读到完整交接提示词');
  for (const href of ['./llms.txt', './services.json', './skills/agent-mcp-finder/SKILL.md']) {
    assert.ok(home.includes(`href="${href}"`), `静态首页缺少 Agent 阅读入口 ${href}`);
  }
  assert.doesNotMatch(home, /\{\{[a-zA-Z]+\}\}/, '首页不能残留构建占位符');

  assert.ok(home.includes(`<dt>附安装配置</dt><dd id="st-install">${published.services.filter(s => s.install).length}</dd>`));
  assert.deepEqual(embedded, published, '首页的交互数据应与同次构建的公开目录一致');
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
    const types = s.types.map((type) => ({ mcp: 'MCP', skill: 'Skill', cli: 'CLI' })[type]).join(' / ');
    const expectedTitle = esc(`${s.name} ${s.status === 'verified' ? '官方 ' : ''}${types} ${s.status === 'verified' ? '接入' : '接入线索'} · ${config.title}`);
    assert.equal(html.match(/<title>(.*?)<\/title>/)[1], expectedTitle, `${s.id} 标题应符合类型和核验状态`);
    assert.equal(html.match(/<meta property="og:title" content="(.*?)">/)[1], expectedTitle, `${s.id} 分享标题应与标题一致`);
    if (s.status !== 'verified') assert.ok(!html.match(/<meta name="description" content="(.*?)">/)[1].includes('查看官方接入方式'));

    assert.ok(html.includes(`<link rel="canonical" href="${config.siteUrl}s/${s.id}/">`));
    assert.ok(html.includes(esc(servicePrompt(config.siteUrl, s))));
    assert.ok(sitemap.includes(`<loc>${config.siteUrl}s/${s.id}/</loc>`));
    const jsonLd = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    assert.equal(jsonLd['@type'], 'SoftwareApplication');
    assert.equal(jsonLd.name, s.name);
    assert.equal(jsonLd.publisher.name, s.name);
    assert.ok(fixture.read('llms.txt').includes(`${config.siteUrl}s/${s.id}.md`));
  }
  assert.deepEqual(fixture.data.services.find((s) => s.id === 'meituhub').types, ['cli']);
  assert.match(fixture.read('robots.txt'), /Sitemap: https:\/\/guanmo-ai\.github\.io\/awesome-agent-mcp\/sitemap\.xml/);
});

test('待核验服务的标题和描述不保证官方身份', (t) => {
  const fixture = buildFixture((data) => {
    data.services[0].status = 'unverified';
    delete data.services[0].evidence;
  });
  t.after(() => rmSync(fixture.dir, { recursive: true, force: true }));
  const service = fixture.data.services[0];
  const html = fixture.read(`s/${service.id}/index.html`);
  const title = html.match(/<title>(.*?)<\/title>/)[1];
  assert.match(title, /接入线索/);
  assert.doesNotMatch(title, /官方/);
  assert.equal(html.match(/<meta property="og:title" content="(.*?)">/)[1], title);
  assert.doesNotMatch(html.match(/<meta name="description" content="(.*?)">/)[1], /查看官方接入方式/);
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
  const home = fixture.read('index.html');
  assert.ok(!home.includes(`data-id="${rejectedId}"`), '首页不应残留被移出的服务');
  const embedded = JSON.parse(home.match(/<script type="application\/json" id="catalog-data">([\s\S]*?)<\/script>/)[1]);
  assert.ok(!embedded.services.some((s) => s.id === rejectedId), '首页交互数据不应带回被移出的服务');
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
  const embedded = JSON.parse(fixture.read('index.html').match(/<script type="application\/json" id="catalog-data">([\s\S]*?)<\/script>/)[1]);
  assert.equal(embedded.services[0].name, s.name, 'JSON 转义后应能完整还原原始数据');
  assert.equal(JSON.parse(raw).name, '"><script>alert(1)</script>');
});


test('两个 README 生成相同的公开目录，英文内容完整且顶部互链', (t) => {
  const fixture = buildFixture();
  t.after(() => rmSync(fixture.dir, { recursive: true, force: true }));
  const zh = readFileSync(join(fixture.dir, 'README.md'), 'utf8');
  const en = readFileSync(join(fixture.dir, 'README.en.md'), 'utf8');
  assert.ok(zh.slice(0, 300).includes('[English](README.en.md)'));
  assert.ok(en.slice(0, 300).includes('[简体中文](README.md)'));
  const rows = (text) => text.split('\n').filter((l) => l.startsWith('| [')).map((l) => l.match(/\/s\/([a-z0-9-]+)\//)[1]);
  assert.deepEqual(rows(en), rows(zh));
  assert.equal(rows(en).length, fixture.data.services.filter((s) => s.status !== 'rejected').length);
  for (const s of fixture.data.services.filter((s) => s.status !== 'rejected')) {
    assert.ok(en.includes(`[${s.nameEn}](${s.url})`), `${s.id} 缺少英文名`);
    assert.ok(en.includes(s.summaryEn), `${s.id} 缺少英文简介`);
  }
  assert.doesNotMatch(en, /undefined|\{\{\w+\}\}/);
});


test('接入指引同步到静态详情、嵌入目录和 Agent 文本', (t) => {
  const setup = { requirements: '先准备可访问的实例，费用按所选部署确认。', steps: [{ text: '按官方入口配置。', url: 'https://example.com/setup' }], verify: '执行只读查询，检查返回值。', checkedAt: '2026-11-05' };
  const fixture = buildFixture((data) => { data.services[0].setup = setup; data.services[0].access = []; });
  t.after(() => rmSync(fixture.dir, { recursive: true, force: true }));
  const id = fixture.data.services[0].id;
  const html = fixture.read(`s/${id}/index.html`);
  assert.ok(html.includes(setup.requirements));
  assert.ok(html.includes(setup.verify));
  assert.ok(html.includes('见下方接入前准备'));
  assert.ok(html.includes('href="https://example.com/setup" target="_blank" rel="noopener"'));
  const db = JSON.parse(fixture.read('services.json'));
  assert.deepEqual(db.services.find((s) => s.id === id).setup, setup);
  const llms = fixture.read(`s/${id}.md`);
  for (const text of [setup.requirements, setup.steps[0].text, setup.steps[0].url, setup.verify]) assert.ok(llms.includes(text));
});


test('短索引小于20KB，逐服务Markdown保留完整配置并排除拒绝条目', (t) => {
  const fixture = buildFixture();
  t.after(() => rmSync(fixture.dir, { recursive: true, force: true }));
  const index = fixture.read('llms.txt');
  assert.ok(Buffer.byteLength(index) <= 20000, `索引 ${Buffer.byteLength(index)} bytes`);
  assert.ok(fixture.read('llms-full.txt').includes('接入前准备'));
  for (const s of fixture.data.services) {
    if (s.status === 'rejected') {
      assert.ok(!existsSync(join(fixture.dir, 'dist/s', `${s.id}.md`)));
      continue;
    }
    assert.ok(index.includes(`/s/${s.id}.md`));
    const markdown = fixture.read(`s/${s.id}.md`);
    assert.ok(markdown.includes(s.url));
    assert.ok(markdown.includes(s.summary));
    for (const [, code] of snippets(s)) assert.ok(markdown.includes(code), `${s.id}: 完整参数`);
    if (s.install?.skill) assert.ok(markdown.includes(s.install.skill));
  }
});


test('服务提示词三行直达Markdown，并按权限提醒；详情与独立页内容相同', () => {
  const { siteUrl } = readJson('site.config.json');
  const labels = { types: { mcp: 'MCP' }, access: {}, risk: { read: '只读', write: '写入', payment: '资金' } };
  for (const risk of ['read', 'write', 'payment']) {
    const s = { id: 'example', name: '示例', summary: '测试', types: ['mcp'], url: 'https://example.com', access: [], risk, status: 'unverified' };
    const prompt = servicePrompt(siteUrl, s);
    assert.equal(prompt.split('\n').length, 3);
    assert.ok(prompt.includes(`${siteUrl}s/example.md`));
    assert.ok(!prompt.includes('llms.txt'));
    assert.equal(prompt.includes('下单、付款前先问我'), risk === 'payment');
    assert.equal(prompt.includes('修改或发送前先告诉我'), risk === 'write');
    assert.ok(renderDetails(s, { homepage: siteUrl, categories: [], labels }).actions.includes(`data-copy="${esc(prompt)}"`));
  }
});

test('官方原文与摘录日期同步到Markdown和网页，并说明不可直读的来源', (t) => {
  const quote = '<script>不执行</script> 官方配置原文';
  const fixture = buildFixture(data => { data.services[0].evidence = { url: 'https://example.com/source', checkedAt: '2026-11-05', quote, agentReadable: false }; });
  t.after(() => rmSync(fixture.dir, { recursive: true, force: true }));
  const id = fixture.data.services[0].id;
  for (const path of [`s/${id}.md`, `s/${id}/index.html`]) {
    const body = fixture.read(path);
    assert.ok(body.includes('官方原文摘录'));
    assert.ok(body.includes('2026-11-05'));
    assert.ok(body.includes(path.endsWith('.md') ? '无需再读取官方页' : '官方页需浏览器打开，Agent 可能读不到'));
    assert.ok(body.includes(path.endsWith('.md') ? quote : esc(quote)));
  }
  for (const path of ['index.html', 'skills/agent-mcp-finder/SKILL.md']) assert.ok(fixture.read(path).includes('官方页面读不到时，以索引中的官方原文摘录为依据，并告诉我这一点。'));
});

test('办公权限说明显示对应官方原文与来源', (t) => {
  const fixture = buildFixture(data => {
    data.services[0].setup.permissionEvidence = { url: 'https://example.com/access', quote: '管理员申请权限', agentReadable: true };
  });
  t.after(() => rmSync(fixture.dir, { recursive: true, force: true }));
  for (const content of [fixture.read('s/amap.md'), fixture.read('s/amap/index.html')]) {
    assert.ok(content.includes('管理员申请权限'));
    assert.ok(content.includes('https://example.com/access'));
  }
});

test('官方页不可读且没有摘录时不宣称已有依据', (t) => {
  const fixture = buildFixture(data => { data.services[0].evidence = { url: 'https://example.com/source', checkedAt: '2026-11-05', agentReadable: false }; });
  t.after(() => rmSync(fixture.dir, { recursive: true, force: true }));
  const body = fixture.read('s/amap.md');
  assert.ok(body.includes('尚无可用原文摘录'));
  assert.ok(!body.includes('无需再读取官方页'));
});
test('仅有费用信息时也在 Markdown 和网页显示来源与日期', (t) => {
  const fixture = buildFixture(data => {
    data.services[0].setup = { cost: { text: '注册赠送 500 积分', url: 'https://example.com/pricing', checkedAt: '2026-11-05', quote: '新用户注册成功即领' } };
  });
  t.after(() => rmSync(fixture.dir, { recursive: true, force: true }));
  for (const content of [fixture.read('s/amap.md'), fixture.read('s/amap/index.html')]) {
    assert.ok(content.includes('注册赠送 500 积分'));
    assert.ok(content.includes('https://example.com/pricing'));
    assert.ok(content.includes('2026-11-05'));
    assert.ok(content.includes('新用户注册成功即领'));
  }
});

test('同一服务的其他官方端点连同用途和门槛出现在 Markdown 与网页', (t) => {
  const fixture = buildFixture(data => {
    data.services[0].install.mcp.endpoints = [{ name: '风险', url: 'https://example.com/risk', note: '需开通权限' }];
  });
  t.after(() => rmSync(fixture.dir, { recursive: true, force: true }));
  for (const content of [fixture.read('s/amap.md'), fixture.read('s/amap/index.html')]) {
    for (const text of ['风险', 'https://example.com/risk', '需开通权限']) assert.ok(content.includes(text));
  }
});

test('企查查和多地域服务保留官方端点及各自接入条件', (t) => {
  const fixture = buildFixture();
  t.after(() => rmSync(fixture.dir, { recursive: true, force: true }));
  const qcc = fixture.read('s/qcc.md');
  for (const path of ['company', 'risk', 'ipr', 'operation', 'history', 'executive', 'regulation', 'case', 'tender', 'document']) assert.ok(qcc.includes(`https://agent.qcc.com/mcp/${path}/stream`), path);
  assert.ok(qcc.includes('企业认证'));
  const dms = fixture.read('s/aliyun-dms.md');
  for (const region of ['cn-hangzhou', 'cn-shanghai', 'cn-beijing', 'cn-shenzhen', 'cn-zhangjiakou', 'cn-hongkong', 'ap-southeast-1', 'ap-southeast-3', 'ap-northeast-1']) assert.ok(dms.includes(`dgate-mcp-${region}.aliyuncs.com`), region);
  assert.match(fixture.read('s/didi.md'), /mcp-servers-sandbox/);
  assert.match(fixture.read('s/cloudbase.md'), /国际站账号和环境，与国内站账户及凭据不互通/);
});

test('远程脚本执行提示同时出现在 Markdown 和网页', (t) => {
  const fixture = buildFixture();
  t.after(() => rmSync(fixture.dir, { recursive: true, force: true }));
  for (const id of ['luckin', 'dingtalk', 'youdao-note', 'iwencai']) {
    for (const path of [`s/${id}.md`, `s/${id}/index.html`]) {
      assert.ok(fixture.read(path).includes('这条命令会直接执行官方脚本，请让 Agent 先读脚本内容再运行。'), path);
    }
  }
});
