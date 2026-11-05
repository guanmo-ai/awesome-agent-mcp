// 由 data/services.json 生成 README.md、README.en.md、llms.txt 和 dist/ 网站。
// 用法：node scripts/build.mjs          生成全部
//       node scripts/build.mjs --check  只检查数据与生成文件是否最新（CI 用）
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { root, load, grouped, LABELS, rawUrl } from './lib.mjs';
import { agentPrompt, skillPrompt, esc, serviceUrl, disclaimerHtml } from '../web/render.mjs';
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
const access = (s) => (s.access.length ? s.access.map((a) => LABELS.access[a]).join('、') : s.setup ? '见接入前准备' : '—');
// Shared by the repository, website and machine-readable index.
const disclaimer = (english = false) => [
  ['本项目是独立的社区信息索引，仅收集整理公开资料与接入线索供参考，不提供或运营所列第三方服务。收录、排序、链接及图标展示不代表与厂商存在隶属、合作或授权关系，也不构成推荐、背书或担保。', 'This independent community index collects public information and integration references. It does not provide or operate the listed third-party services. Inclusion, ordering, links and logos do not imply affiliation, partnership, authorization, recommendation, endorsement or a guarantee.'],
  ['“官方已核验”仅表示在标注日期依据公开来源核对了发布者身份，不代表全部功能已实测、安全审计通过或厂商认可本项目。资料与示例按现状提供，可能有错误、遗漏或过时；我们尽力核对，但不保证其准确性、完整性、时效性、安全性、兼容性、持续可用性或适合特定用途。', '“Verified” means publisher identity was checked against public sources on the stated date. It does not mean every feature was tested, a security audit was passed, or the vendor approved this project. Information and examples are provided as is and may contain errors, omissions or outdated details. We make reasonable verification efforts but do not guarantee accuracy, completeness, freshness, security, compatibility, continued availability or fitness for a particular purpose.'],
  ['使用前，请自行核对厂商最新官方文档、代码及安装脚本、账号资格、权限、费用和配额，并遵守适用法律及第三方的服务条款、许可证与隐私政策。第三方网站、软件和服务由相应提供方负责，可能随时变更或停止；本项目的 MIT 许可不适用于这些第三方内容。', 'Before use, independently check current official documentation, code and installation scripts, account eligibility, permissions, charges and quotas. Follow applicable law and the provider’s terms, licenses and privacy policies. Third-party sites, software and services are the responsibility of their providers and may change or stop. This project’s MIT license does not cover that third-party content.'],
  ['提示词、配置示例和 Agent 生成结果仅为辅助，不替代你的判断与授权。请检查实际执行内容，以最小权限验证，妥善保管密钥并备份重要数据；不要向本站或公开 Issue 提交凭据、个人隐私或机密数据。下单、付款等涉及资金的操作须由你最终确认。', 'Prompts, configuration examples and agent output assist rather than replace your judgment and authorization. Review actual actions, validate with minimal permissions, protect credentials and back up important data. Do not submit credentials, personal or confidential data to this site or public issues. Give final confirmation before orders, payments or other financial actions.'],
  ['你应自行判断是否使用相关信息或服务，并承担相应使用风险。在适用法律允许的范围内，本项目维护者及贡献者不对因依赖本索引或使用第三方服务造成的损失承担责任，包括费用、数据丢失、业务中断或其他损失；本声明不排除或限制依法不得排除或限制的责任。', 'You decide whether to use this information or these services and bear the associated risks. To the extent permitted by applicable law, maintainers and contributors are not liable for losses arising from reliance on this index or use of third-party services, including charges, data loss, business interruption or other losses. Nothing here excludes or limits liability that cannot lawfully be excluded or limited.'],
  ['服务名称、图标与商标归各自权利人所有，仅用于识别。发现错误、失效链接或权利问题，请通过仓库 Issue 提供公开证据或问题链接，我们会核查并视情况更正或移除；请勿在反馈中披露敏感信息。', 'Names, logos and trademarks belong to their respective owners and are used for identification. Report errors, broken links or rights concerns through repository issues with public evidence or links. We will review and correct or remove entries as appropriate. Do not disclose sensitive information in reports.'],
].map((pair) => pair[english ? 1 : 0]);

function readme(english = false) {
  const t = (zh, en) => english ? en : zh;
  const risks = english ? { read: 'Read only', write: 'Write access', payment: 'Financial actions' } : LABELS.risk;
  const gates = english ? { free: 'Free', key: 'API key', account: 'Account authorization', membership: 'Membership or payment', 'desktop-app': 'Desktop client', apply: 'Application required' } : LABELS.access;
  const readmeAccess = (s) => s.access.length ? s.access.map((a) => gates[a]).join(t('、', ', ')) : s.setup ? t('见独立页说明', 'See details') : '—';
  const readmeStatus = (s) => s.status === 'verified' ? t('✅ 已核验', '✅ Verified') : t('⏳ 待核验', '⏳ Unverified');
  const L = [];
  L.push(
    t('<!-- 本文件由 scripts/build.mjs 根据 data/services.json 自动生成，请改数据后运行 npm run build，不要手改。 -->', '<!-- Generated by scripts/build.mjs from data/services.json. Edit the data and run npm run build; do not edit this file directly. -->'),
    '',
    t('[English](README.en.md) · **简体中文**', '**English** · [简体中文](README.md)'),
    '',
    `<h1 align="center">${config.title}</h1>`,
    '',
    `<p align="center"><b>${t(config.tagline, 'Official MCP Servers · Agent Skills · CLIs from China')}</b><br>${t(config.description, 'Connect agents to real-world services. An open-source directory of official MCP servers, skills and CLIs from Chinese vendors, with interactive visual search and native support for agent access.')}</p>`,
    '',
    '<p align="center">',
    `  <a href="${config.siteUrl}"><b>${t('浏览服务索引 ↗', 'Browse the directory ↗')}</b></a> &nbsp;·&nbsp;`,
    t('  <a href="#for-ai">给 AI 用</a> &nbsp;·&nbsp;', '  <a href="#for-ai">For AI agents</a> &nbsp;·&nbsp;'),
    `  <a href="${issueUrl('submit.yml')}">${t('提交服务', 'Submit a service')}</a> &nbsp;·&nbsp;`,
    `  <a href="https://x.com/${config.maintainer.x}">${t('关注', 'Follow')} @${config.maintainer.x}</a>`,
    '</p>',
    '',
    `<p align="center"><sub>${live.length} ${t('个服务', 'services')} · ${groups.length} ${t('个分类', 'categories')} · ${verified} ${t('个已核验', 'verified')} · ${t('更新于', 'Updated')} ${data.updatedAt}</sub></p>`,
    '',
    t('> **独立社区索引，仅供参考。** 收录不构成背书，“已核验”不等于已实测或安全保证。使用前请自行核实官方信息。[使用说明与免责声明](#disclaimer)', '> **Independent community index, for reference only.** Inclusion is not endorsement; verified does not mean tested or guaranteed safe. Check official information before use. [Usage and disclaimer](#disclaimer)'),
    '',
    '<a id="for-ai"></a>',
    '',
    t('## 给 AI 用', '## For AI Agents'),
    '',
    t('**直接复制下面整段，发给你的 Agent。** 不用改链接、填写占位符或先装 Skill；需要 Agent 能读取网页。', '**Copy this entire prompt into your agent.** No URL edits, placeholders or skill installation required; the agent needs web access.'),
    '',
    '```text',
    t(agentPrompt(`${config.siteUrl}llms.txt`), `Read ${config.siteUrl}llms.txt as a reference index for official MCP servers, skills and CLIs.
Find integrations for the service or task I mention at the end or in a later message. If I have not specified one, ask what I want to find.
Check official vendor documentation for capabilities, account permissions, costs, compatibility with this agent and setup instructions. An absent entry does not mean no integration exists; do not guess missing information.
This index is for reference; verified does not mean tested or guaranteed safe. Install or configure only within my authorization. I will enter keys and log in locally; ask before placing orders or making payments.
Provide official links. If you set up an integration, report actual verification results and remaining steps.`),
    '```',
    '',
    t('**可选：在末尾加一句，或下一条消息再说。** 例如 `帮我查飞书的 MCP`、`帮我找能查路线的官方接入`。不补也能直接发送，Agent 会先询问你的需求。', '**Optionally add one sentence at the end or send it next.** For example, `Find the official Feishu MCP` or `Find an official integration for route planning`. You can also send the prompt unchanged; the agent will ask what you need.'),
    '',
    `<p align="center"><a href="${config.siteUrl}"><img src="web/og.jpg" alt="${config.title} ${t('网站预览', 'website preview')}" width="100%"></a></p>`,
    '',
    t('> 只收**厂商官方**出品的 MCP Server、Agent Skill 与命令行工具（CLI），社区封装不收。', '> Only MCP servers, agent skills, and CLIs **published by the service vendor** are included. Community wrappers are excluded.'),
    '',
    t('不用复制粘贴清单，直接让你的 Agent 来读：', 'Let your agent read the index directly:'),
    '',
    t('| 方式 | 地址 |', '| Format | Address |'),
    '| :-- | :-- |',
    `| ${t('llms.txt（适合直接读）', 'llms.txt (readable index)')} | ${config.siteUrl}llms.txt |`,
    `| ${t('JSON 数据（适合程序）', 'JSON (structured data)')} | ${config.siteUrl}services.json |`,
    `| ${t('GitHub 原始文件', 'GitHub raw file')} | ${rawUrl(config, 'data/services.json')} |`,
    '',
    `${t('**以后也想随时查？** 可选安装', '**Want to reuse the finder?** Optionally install')} [\`${config.skill}\`](${skillPath})${t('。复制下面的提示词，让 Agent 按自己的安装方式处理；无需先学终端命令。这个 Skill 用来查找接入，不会自动接通所有服务。', '. Send the prompt below to your agent. The skill finds integrations; installing it does not connect every service.')}`,
    '',
    '```text',
    t(skillPrompt(rawUrl(config, skillPath), config.skill), `Read ${rawUrl(config, skillPath)}
Review it, then install ${config.skill} using the current agent's official instructions.
Preserve any existing skill with the same name. If skills are unsupported, read the index directly.
Test one lookup and report the result; skill installation does not establish a service connection.`),
    '```',
    '',
    t('**接下来会发生什么？** Agent 先核对适用对象、账号和费用门槛，再按你的授权接入；你完成本地登录或填写 Key 后，它应报告实际连接验证结果。已核验仅代表官方身份，缺少信息不代表免费、即装即用或没有官方接入。', '**What happens next?** Your agent checks eligibility, accounts, and costs, then configures within your authorization. After you authenticate locally, it should report actual connection results. Verified means vendor identity; missing information does not imply free access, immediate availability, or no official integration.'),
    '',
    '<a id="toc"></a>',
    '',
    t('## 目录', '## Contents'),
    '',
    ...groups.map((g) => t(`- [${g.name}](#cat-${g.id})（${g.services.length}）`, `- [${g.nameEn}](#cat-${g.id}) (${g.services.length})`)),
    '',
  );
  for (const g of groups) {
    L.push(
      `<a id="cat-${g.id}"></a>`,
      '',
      `## ${t(g.name, g.nameEn)}`,
      '',
      t('| 服务 | 能做什么 | 类型 | 权限 | 门槛 | 状态 |', '| Service | Capabilities | Type | Permissions | Requirements | Status |'),
      '| :-- | :-- | :-- | :-- | :-- | :-- |',
      ...g.services.map(
        (s) =>
          `| [${md(t(s.name, s.nameEn))}](${s.url}) · [${t('独立页', 'Details')}](${serviceUrl(config.siteUrl, s.id)}) | ${md(t(s.summary, s.summaryEn))} | ${types(s)} | ${LABELS.riskIcon[s.risk]} ${risks[s.risk]} | ${readmeAccess(s)} | ${readmeStatus(s)} |`,
      ),
      '',
      t('<sub>[↑ 回到目录](#toc)</sub>', '<sub>[↑ Back to contents](#toc)</sub>'),
      '',
    );
  }
  L.push(
    t('## 图例', '## Legend'),
    '',
    t('- **类型**：`MCP` 是 Agent 调用外部服务的标准接口；`Skill` 是教 Agent 使用某个服务的说明文档；`CLI` 是 Agent 可以直接调用的命令行工具。', '- **Type**: `MCP` is a standard interface for agents to call external services; a `Skill` teaches an agent how to use a service; a `CLI` is a command-line tool an agent can invoke.'),
    t('- **权限**：🟢 只读查询，只查不改；🟡 可执行操作，会创建或修改数据；🔴 涉及资金，可能下单或付款，务必让人最后确认。', '- **Permissions**: 🟢 Read only, without modifying data; 🟡 Write access, which can create or modify data; 🔴 Financial actions, which may place orders or make payments and require final human confirmation.'),
    t('- **状态**：✅ 已核验，确认为厂商官方出品并留有证据；⏳ 待核验，来自公开整理，还没逐条确认。', '- **Status**: ✅ Verified means vendor ownership has been confirmed with evidence; ⏳ Unverified means the entry was collected from public sources and has not yet been individually verified.'),
    '',
    t('## 收录标准', '## Inclusion Criteria'),
    '',
    t('1. 由服务厂商官方发布：链接在厂商自己的域名，或在厂商官方的 GitHub 组织下。', '1. Published by the service vendor, on its own domain or under its official GitHub organization.'),
    t('2. 面向国内用户的服务，能被 Agent 通过 MCP、Skill 或 CLI 调用。', '2. Serves users in China and can be used by agents through MCP, a skill, or a CLI.'),
    t('3. 第三方平台转载、社区封装、逆向接口一律不收。', '3. Third-party reposts, community wrappers, and reverse-engineered interfaces are excluded.'),
    t('4. 官方出品之外，满足上市公司或其控股子公司、国内官方 App 评分数 ≥ 10,000、官方开源主仓库 star ≥ 10,000，或维护者点名收录（Gitee、极狐 GitLab、Apifox）之一。', '4. In addition to vendor ownership, meets at least one criterion: a listed company or its controlled subsidiary; an official China App Store app with ≥ 10,000 ratings; an official main open-source repository with ≥ 10,000 stars; or explicit maintainer inclusion (Gitee, JiHu GitLab, Apifox).'),
    '',
    `${t('详细流程见', 'See')} [docs/VERIFYING.md](docs/VERIFYING.md)${t('。发现遗漏或错误？', '. Found an omission or error? ')}[${t('提交服务', 'Submit a service')}](${issueUrl('submit.yml')}) ${t('或', 'or')} [${t('报告问题', 'report a problem')}](${issueUrl('correction.yml')})${t('。', '.')}`,
    '',
    '<a id="disclaimer"></a>',
    '',
    t('## 使用说明与免责声明', '## Usage and Disclaimer'),
    '',
    ...disclaimer(english).flatMap((paragraph) => [paragraph, '']),
    `[${t('纠错与权利问题反馈', 'Report errors or rights concerns')}](${issueUrl('correction.yml')})`,
    '',
    t('## 许可', '## License'),
    '',
    `${t('代码使用 [MIT](LICENSE) 许可。各服务的名称与商标归各自厂商所有。由', 'Code is licensed under [MIT](LICENSE). Service names and trademarks belong to their respective vendors. Created and maintained by')} [${t(config.maintainer.name, 'Guanmo')} @${config.maintainer.x}](https://x.com/${config.maintainer.x})${t(' 发起与维护。', '.')}`,
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
    '## 使用说明与免责声明',
    '',
    ...disclaimer().flatMap((paragraph) => [paragraph, '']),
    `[纠错与权利问题反馈](${issueUrl('correction.yml')})`,
    '',
    '## 使用索引',
    '',
    '使用这份索引时请遵守：',
    '- 「涉及资金」的服务可能下单或付款，执行前必须让用户确认。',
    '- 「待核验」的条目尚未确认是否为官方出品，推荐给用户时要说明。',
    '- 已核验只表示确认官方身份，不代表已实测接入成功。未收录不代表没有官方接入。',
    '- 先确认用户要完成的任务和当前 Agent，核对厂商文档中的适用对象、账号、费用及客户端支持；区分商家接口与消费者服务。',
    '- 安装字段缺失、门槛为 — 时表示未整理，不代表无需授权或可以免费使用；需要时读取结构化数据和官方文档。',
    '- 有接入指引时先读准备、步骤和验证方法；验证方法不是本项目实测结果。指引中仍未知的门槛不能猜测。',
    '- 配置请从 services.json 的 install 读取完整 URL、args、env 和 headers，保留认证字段；接入方式以官方文档为准。本索引不提供任何 Key 或账号。',
    '- 按用户已有授权配置，由用户在本地填写密钥和完成登录；验证连接后报告实际结果及剩余步骤，不以配置写入代替成功。',
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
      if (s.setup) L.push(`  - 接入前准备：${s.setup.requirements}`, ...s.setup.steps.map((step, i) => `  - 步骤 ${i + 1}：${step.text} [官方入口](${step.url})`), `  - 如何确认成功：${s.setup.verify}（指引核对于 ${s.setup.checkedAt}，不代表已实测）`);
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
        disclaimer: { url: `${config.siteUrl}#disclaimer`, paragraphs: disclaimer(), feedbackUrl: issueUrl('correction.yml') },
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

const outputs = { 'README.md': readme(), 'README.en.md': readme(true), 'llms.txt': llms() };

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
    .update(readFileSync(join(root, 'web/fx.mjs')))
    .update(readFileSync(join(root, 'web/directory.mjs')))
    .update(publicJson())
    .digest('hex')
    .slice(0, 8);
  const vars = {
    title: config.title, tagline: config.tagline, description: config.description, siteUrl: config.siteUrl,
    repo: config.repo, x: config.maintainer.x, maintainerName: config.maintainer.name, count: live.length, v: version,
    categoryCount: groups.length, verifiedCount: verified,
    agentPrompt: agentPrompt(`${config.siteUrl}llms.txt`), skillPrompt: skillPrompt(rawUrl(config, skillPath), config.skill),
    skill: config.skill, branch: config.branch,
  };
  const db = JSON.parse(publicJson());
  const html = {
    directory: directoryHtml(db), chips: chipsHtml(db),
    disclaimer: disclaimerHtml(db),
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
  for (const file of ['app.js', 'ui.mjs', 'render.mjs', 'motion.mjs', 'fx.mjs', 'directory.mjs', 'service.js']) {
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
  console.log(`已生成 README.md、README.en.md、llms.txt 与 dist/（${live.length} 个服务）。`);
}
