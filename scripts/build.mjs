// 由 data/services.json 生成 README.md、llms.txt 和 dist/ 网站。
// 用法：node scripts/build.mjs          生成全部
//       node scripts/build.mjs --check  只检查数据与生成文件是否最新（CI 用）
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { root, load, grouped, LABELS, rawUrl } from './lib.mjs';
import { esc, serviceUrl } from '../web/render.mjs';
import { renderServicePage, sitemap } from './service-pages.mjs';
import { directoryHtml, chipsHtml } from '../web/directory.mjs';

const { config, data, errors } = load();
if (errors.length) {
  console.error(`数据校验失败（${errors.length} 处）：\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

const groups = grouped(data);
const live = groups.flatMap((g) => g.services);
const verified = live.filter((s) => s.status === 'verified').length;
const issueUrl = (tpl) => `https://github.com/${config.repo}/issues/new?template=${tpl}`;
const skillPath = `skills/${config.skill}/SKILL.md`;
const md = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
const ORDER = Object.keys(LABELS.types);
const types = (s) => [...s.types].sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b)).map((t) => LABELS.types[t]).join(' · ');
const access = (s) => (s.access.length ? s.access.map((a) => LABELS.access[a]).join('、') : '—');
const status = (s) => (s.status === 'verified' ? '✅ 已核验' : '⏳ 待核验');

function readme() {
  const L = [];
  L.push(
    '<!-- 本文件由 scripts/build.mjs 根据 data/services.json 自动生成，请改数据后运行 npm run build，不要手改。 -->',
    '',
    `<h1 align="center">${config.title}</h1>`,
    '',
    `<p align="center"><b>${config.tagline}</b><br>${config.description}</p>`,
    '',
    '<p align="center">',
    `  <a href="${config.siteUrl}"><b>打开卡片网站 ↗</b></a> &nbsp;·&nbsp;`,
    '  <a href="#for-ai">给 AI 用</a> &nbsp;·&nbsp;',
    `  <a href="${issueUrl('submit.yml')}">提交服务</a> &nbsp;·&nbsp;`,
    `  <a href="https://x.com/${config.maintainer.x}">关注 @${config.maintainer.x}</a>`,
    '</p>',
    '',
    `<p align="center"><sub>${live.length} 个服务 · ${groups.length} 个分类 · ${verified} 个已核验 · 更新于 ${data.updatedAt}</sub></p>`,
    '',
    `<p align="center"><a href="${config.siteUrl}"><img src="web/og.jpg" alt="${config.title} 网站预览" width="100%"></a></p>`,
    '',
    '> 只收**厂商官方**出品的 MCP Server、Agent Skill 与命令行工具（CLI），社区封装不收。',
    '',
    '<a id="for-ai"></a>',
    '',
    '## 给 AI 用',
    '',
    '不用复制粘贴清单，直接让你的 Agent 来读：',
    '',
    '| 方式 | 地址 |',
    '| :-- | :-- |',
    `| llms.txt（适合直接读） | ${config.siteUrl}llms.txt |`,
    `| JSON 数据（适合程序） | ${config.siteUrl}services.json |`,
    `| GitHub 原始文件 | ${rawUrl(config, 'data/services.json')} |`,
    '',
    `也可以装上仓库自带的 Skill [\`${config.skill}\`](${skillPath})。装好后说「帮我点杯瑞幸」，Agent 会先查这份索引，告诉你有没有官方接入、需要什么 Key、配置怎么写。以 Claude Code 为例：`,
    '',
    '```bash',
    `mkdir -p ~/.claude/skills/${config.skill} && curl -fsSL ${rawUrl(config, skillPath)} -o ~/.claude/skills/${config.skill}/SKILL.md`,
    '```',
    '',
    '<a id="toc"></a>',
    '',
    '## 目录',
    '',
    ...groups.map((g) => `- [${g.name}](#cat-${g.id})（${g.services.length}）`),
    '',
  );
  for (const g of groups) {
    L.push(
      `<a id="cat-${g.id}"></a>`,
      '',
      `## ${g.name}`,
      '',
      '| 服务 | 能做什么 | 类型 | 权限 | 门槛 | 状态 |',
      '| :-- | :-- | :-- | :-- | :-- | :-- |',
      ...g.services.map(
        (s) =>
          `| [${md(s.name)}](${s.url}) · [独立页](${serviceUrl(config.siteUrl, s.id)}) | ${md(s.summary)} | ${types(s)} | ${LABELS.riskIcon[s.risk]} ${LABELS.risk[s.risk]} | ${access(s)} | ${status(s)} |`,
      ),
      '',
      '<sub>[↑ 回到目录](#toc)</sub>',
      '',
    );
  }
  L.push(
    '## 图例',
    '',
    '- **类型**：`MCP` 是 Agent 调用外部服务的标准接口；`Skill` 是教 Agent 使用某个服务的说明文档；`CLI` 是 Agent 可以直接调用的命令行工具。',
    '- **权限**：🟢 只读查询，只查不改；🟡 可执行操作，会创建或修改数据；🔴 涉及资金，可能下单或付款，务必让人最后确认。',
    '- **状态**：✅ 已核验，确认为厂商官方出品并留有证据；⏳ 待核验，来自公开整理，还没逐条确认。',
    '',
    '## 收录标准',
    '',
    '1. 由服务厂商官方发布：链接在厂商自己的域名，或在厂商官方的 GitHub 组织下。',
    '2. 面向国内用户的服务，能被 Agent 通过 MCP、Skill 或 CLI 调用。',
    '3. 第三方平台转载、社区封装、逆向接口一律不收。',
    '4. 优先上市集团旗下服务；未上市厂商只保留少数头部企业或公众熟知品牌。',
    '',
    `详细流程见 [docs/VERIFYING.md](docs/VERIFYING.md)。发现遗漏或错误？[提交服务](${issueUrl('submit.yml')}) 或 [报告问题](${issueUrl('correction.yml')})。`,
    '',
    '## 许可',
    '',
    `代码使用 [MIT](LICENSE) 许可。各服务的名称与商标归各自厂商所有。由 [${config.maintainer.name} @${config.maintainer.x}](https://x.com/${config.maintainer.x}) 发起与维护。`,
    '',
  );
  return L.join('\n');
}

function llms() {
  const L = [
    `# ${config.title}`,
    '',
    `> ${config.tagline}。只收中国服务厂商官方出品的 MCP Server、Agent Skill 与命令行工具（CLI），共 ${live.length} 个，更新于 ${data.updatedAt}。`,
    '',
    `结构化数据：${config.siteUrl}services.json（字段说明见 https://github.com/${config.repo}/blob/${config.branch}/docs/SCHEMA.md）`,
    '',
    '使用这份索引时请遵守：',
    '- 「涉及资金」的服务可能下单或付款，执行前必须让用户确认。',
    '- 「待核验」的条目尚未确认是否为官方出品，推荐给用户时要说明。',
    '- 接入方式以每条的官方链接为准；本索引不提供任何 Key 或账号。',
    '',
  ];
  for (const g of groups) {
    L.push(`## ${g.name}`, '');
    for (const s of g.services) {
      const parts = [`类型 ${types(s)}`, `权限 ${LABELS.risk[s.risk]}`, `门槛 ${access(s)}`, LABELS.status[s.status]];
      const mcp = s.install?.mcp;
      if (mcp) parts.push(`MCP ${LABELS.transport[mcp.transport]} ${mcp.url ?? [mcp.command, ...(mcp.args ?? [])].join(' ')}`);
      if (s.install?.cli) parts.push(`CLI \`${s.install.cli}\``);
      if (s.install?.skill) parts.push(`Skill ${s.install.skill}`);
      L.push(`- [${s.name}](${s.url}): ${s.summary} ${parts.join('；')}；[独立页](${serviceUrl(config.siteUrl, s.id)})`);
    }
    L.push('');
  }
  return L.join('\n');
}

const manifestPath = join(root, 'web/logos/manifest.json');
const logos = existsSync(manifestPath)
  ? Object.fromEntries(Object.entries(JSON.parse(readFileSync(manifestPath, 'utf8'))).filter(([id]) => existsSync(join(root, `web/logos/${id}.png`))))
  : {};

function publicJson() {
  return (
    JSON.stringify(
      {
        name: config.title,
        description: config.tagline,
        homepage: config.siteUrl,
        repository: `https://github.com/${config.repo}`,
        updatedAt: data.updatedAt,
        count: live.length,
        labels: LABELS,
        site: { repo: config.repo, maintainer: config.maintainer, skill: config.skill, skillUrl: rawUrl(config, skillPath) },
        categories: groups.map(({ services, ...c }) => ({ ...c, count: services.length })),
        services: live.map((s) => (logos[s.id] ? { ...s, logo: `logos/${s.id}.png`, logoPad: logos[s.id].pad } : s)),
      },
      null,
      2,
    ) + '\n'
  );
}

const outputs = { 'README.md': readme(), 'llms.txt': llms() };

if (process.argv.includes('--check')) {
  const stale = Object.entries(outputs).filter(([f, text]) => {
    const p = join(root, f);
    return !existsSync(p) || readFileSync(p, 'utf8') !== text;
  });
  if (stale.length) {
    console.error(`生成文件已过期：${stale.map(([f]) => f).join('、')}。请运行 npm run build 后提交。`);
    process.exit(1);
  }
  console.log(`数据有效：${live.length} 个服务，生成文件是最新的。`);
} else {
  for (const [f, text] of Object.entries(outputs)) writeFileSync(join(root, f), text);
  const dist = join(root, 'dist');
  rmSync(dist, { recursive: true, force: true });
  mkdirSync(dist, { recursive: true });
  // service.html 是服务独立页的模板，不直接发布
  cpSync(join(root, 'web'), dist, { recursive: true, filter: (src) => !src.endsWith('service.html') });
  const version = createHash('sha1')
    .update(readFileSync(join(root, 'web/app.js')))
    .update(readFileSync(join(root, 'web/app.css')))
    .update(readFileSync(join(root, 'web/render.mjs')))
    .update(readFileSync(join(root, 'web/ui.mjs')))
    .update(readFileSync(join(root, 'web/service.js')))
    .update(readFileSync(join(root, 'web/motion.mjs')))
    .update(readFileSync(join(root, 'web/directory.mjs')))
    .update(publicJson())
    .digest('hex')
    .slice(0, 8);
  const vars = {
    title: config.title, tagline: config.tagline, description: config.description, siteUrl: config.siteUrl,
    repo: config.repo, x: config.maintainer.x, maintainerName: config.maintainer.name, count: live.length, v: version,
    categoryCount: groups.length, verifiedCount: verified,
    updatedLabel: `${Number(data.updatedAt.slice(5, 7))}月${Number(data.updatedAt.slice(8, 10))}日`,
  };
  const db = JSON.parse(publicJson());
  const html = {
    directory: directoryHtml(db), chips: chipsHtml(db),
    // Keep the rendered directory and its interactive data in one cache unit.
    // A data string must never terminate its application/json script element.
    catalog: publicJson().replaceAll('<', '\\u003c').replaceAll('>', '\\u003e').replaceAll('&', '\\u0026'),
  };
  const fill = (text) => text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (key in html) return html[key];
    if (!(key in vars)) throw new Error(`未知首页占位符：${key}`);
    return esc(vars[key]);
  });
  writeFileSync(join(dist, 'index.html'), fill(readFileSync(join(root, 'web/index.html'), 'utf8')));
  // Version transitive module imports too; otherwise browsers can reuse old shared code.
  for (const file of ['app.js', 'ui.mjs', 'render.mjs', 'motion.mjs', 'directory.mjs', 'service.js']) {
    const source = readFileSync(join(dist, file), 'utf8');
    writeFileSync(join(dist, file), source.replace(/(from\s+['"]\.\/[^'"]+\.(?:mjs|js))(['"])/g, `$1?v=${version}$2`));
  }
  const template = readFileSync(join(root, 'web/service.html'), 'utf8');
  for (const service of db.services) {
    const dir = join(dist, 's', service.id);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.html'), renderServicePage(service, db, config, template, version));
  }
  writeFileSync(join(dist, 'sitemap.xml'), sitemap(db));
  writeFileSync(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${config.siteUrl}sitemap.xml\n`);
  writeFileSync(join(dist, 'services.json'), publicJson());
  writeFileSync(join(dist, 'llms.txt'), outputs['llms.txt']);
  mkdirSync(join(dist, 'skills', config.skill), { recursive: true });
  cpSync(join(root, skillPath), join(dist, skillPath));
  writeFileSync(join(dist, '.nojekyll'), '');
  console.log(`已生成 README.md、llms.txt 与 dist/（${live.length} 个服务）。`);
}
