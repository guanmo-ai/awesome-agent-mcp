# Awesome Agent MCP

国内服务厂商**官方出品**的 MCP Server、Agent Skill 与命令行工具（CLI）索引。远程仓库是 `guanmo-ai/awesome-agent-mcp`，网站通过 GitHub Pages 发布。

## 结构

- `data/services.json` 是唯一数据源，字段说明见 `docs/SCHEMA.md`。
- `README.md`、`README.en.md`、`llms.txt` 和 `dist/` 都由 `scripts/build.mjs` 生成。**不要手改 README.md、README.en.md 和 llms.txt。**
- `web/` 是网站源码，用原生 HTML、CSS、JS 写成，没有第三方依赖。
- `skills/agent-mcp-finder/SKILL.md` 是给 Agent 用的 Skill。
- `site.config.json` 存放仓库名、网址和维护者。
- `web/logos/` 是各服务的图标（128px PNG），由 `scripts/fetch-logos.mjs` 抓取；`web/og.jpg` 是分享图，由 `scripts/og-image.mjs` 生成。

## 命令

| 命令 | 作用 |
| :-- | :-- |
| `npm run build` | 校验数据，生成 README.md、README.en.md、llms.txt 和 dist/ |
| `npm run check` | 校验数据、检查生成文件是否最新、运行测试（CI 同款） |
| `npm run serve` | 构建并在 http://127.0.0.1:4179 预览 |
| `npm run links` | 检查所有链接能否打开 |
| `node scripts/fetch-logos.mjs` | 给缺图标的条目抓图标（需要 Playwright） |
| `node scripts/og-image.mjs` | 预览开着时重新生成分享图（需要 Playwright） |

## 规则

1. 改完数据运行 `npm run build`，把生成的 README.md、README.en.md、llms.txt 一起提交。`npm run check` 必须通过。
2. 只收厂商官方出品，判定标准见 `docs/VERIFYING.md`。拿不准就保持 `unverified`，不要猜。
3. 第三方清单（GitHub 上的 awesome 列表、WorkBuddy 等客户端的连接器市场）只当**线索**。每条都要回到厂商官方页面确认，`url` 指向官方页面；不复制别人的描述文字，也不复制别人的 Skill 文件。
4. `summary` 用自己的话写，不超过 60 字，说清能做什么，不用营销词。
5. 不确定的字段就留空（`access` 用空数组），不要编造 Key、端点或配置。`install.mcp` 只填官方文档里写明的内容。
6. 新增条目的 `addedAt` 用当天日期，同时更新顶层 `updatedAt`。
7. 一个 PR 只做一类事：新增一批、核验一批，或者改网站。
8. 不要把内部研究记录、私人信息或凭据写进仓库。
9. 提交身份用 `观默 <316967716+guanmo-ai@users.noreply.github.com>`。

## 保持简单（每个任务都要遵守）

1. 用最小的改动解决问题：能改一行就不改十行，能改现有文件就不新建文件。
2. 不新增依赖、框架或构建步骤。同一段逻辑没有在两处以上重复，就不抽新模块。
3. 不新增文档文件。说明写进 PR 描述；只有规则变了才改现有文档。
4. 可以采用 Fluent UI、Carbon 等顶尖设计规范，照其许可附上声明即可；不要为此另写流程或文档。
5. 一个 PR 的代码改动（不算 `data/`、图片和生成文件）超过 300 行时，先在 PR 描述里说明为什么不能更小，能拆就拆。
6. 不为假想的未来需求写兼容层、缓存方案或配置开关。需求不确定时，在 PR 描述里提问，不要先做出来。
7. 收录范围、分类方式、文案语气属于产品决定，只有维护者明确要求时才改。

## 分工

- **Codex 是最终负责人**：主导程序、数据收集与核验、排查、测试、集成和交付，负责处理审核意见并验证最终结果。
- **Opus 5.5 主导审美设计并辅助审核**：负责配色、字体、布局、动画和设计稿模板（如 `web/service.html`）；Codex 按设计方案实施并验证。需要它审核时，把具体问题、证据和验收标准留在相关 PR 描述，推送后由维护者转交、让它更新代码查看；不直接连接或调用 Opus。
- **普通问题由 Codex 处理**：先查官方来源、运行验证并完成有依据的修复；待核验清单由 Codex 跟进，能独立完成的工作继续推进。只有确需维护者决策、账户交互或新增授权的事项才提问，并说明已有证据和必须介入的原因。

## 合并

- 不需要等维护者。自己开 PR，`npm run check` 和 CI 都通过后，用 `gh pr merge --squash --delete-branch` 合并，再确认「发布网站」这个 Action 成功。
- 改网站或脚本时，合并前先按 `docs/REVIEW.md` 自查一遍。
- 由 Claude 提交的改动，由 Codex 按 `docs/REVIEW.md` 审核后合并。

收集、核验和审核的流程分别见 `docs/COLLECTING.md`、`docs/VERIFYING.md`、`docs/REVIEW.md`，现成的任务提示词见 `docs/CODEX_TASKS.md`。
