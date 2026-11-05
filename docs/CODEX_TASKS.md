# 给 Codex 的任务

在仓库根目录打开 Codex，把提示词整段粘贴进去。先读 `AGENTS.md`，尤其是「保持简单」。每个任务的流程都是：开 PR → CI 通过 → 自己合并（`gh pr merge --squash --delete-branch`）→ 确认「发布网站」成功。

已完成：首批核验、补图标、服务独立页、WorkBuddy 与三个 GitHub 清单的补充。

## 一次做完上线任务

```
先读 AGENTS.md（尤其是「保持简单」）和 docs/CODEX_TASKS.md。按顺序完成 docs/CODEX_TASKS.md 里的「上线 0」到「上线 5」，每个任务单独开一个 PR，CI 通过后自己合并，确认「发布网站」成功后再做下一个。遇到需要维护者决定的问题，写在对应 PR 描述里，继续做下一个任务，不要停下来等。全部做完后，用一段话汇报每个任务的结果和遗留问题。
```

---

## 上线 0：审核合并 Claude 的设计改动

```
按 docs/REVIEW.md 审核 Claude 开的 PR（分支 claude/prelaunch-design）。代码有问题的直接在该分支修；纯视觉取舍只在 PR 里留言，不要改。CI 通过后合并。
```

## 上线 1：收录范围调整（维护者要求）

```
维护者决定：收录范围从「上市集团或少数头部厂商」放宽为「官方出品 + 有一定知名度」。新规则，官方出品之外满足任意一条即可：
1. 上市公司或其控股子公司的服务；
2. 大众熟知：App Store 中国区官方 App 的评分数（iTunes lookup 接口的 userRatingCount）≥ 10,000；
3. 开发者熟知：官方开源主仓库 GitHub star ≥ 10,000；
4. 维护者点名收录：Gitee、极狐 GitLab、Apifox。
步骤：
- 把 docs/VERIFYING.md「先核对收录范围」一节改成上面的规则，删掉原来的例外名单，不要另写判定流程。
- 用上面的规则重新检查 data/services.json 里所有 rejected 条目：符合规则、而且当初只是因为范围被拒的，改回 verified（官方核验记录仍有效就沿用，过期的重新核验），删掉 rejectedReason；不符合的保持 rejected。每条的判断依据（评分数、star 数或上市信息）写在 PR 描述的表格里，不写进数据。
- 重新收录的条目要补齐图标（node scripts/fetch-logos.mjs <id>）和服务分享图（node scripts/og-services.mjs <id>）；服务数量变了，就先 npm run serve，再运行 node scripts/og-image.mjs 更新首页分享图。
开 PR，CI 通过后自己合并。
```

## 上线 2：GitHub 仓库首页信息

```
用 gh 设置仓库首页右上角的 About，内容照抄，不要改写：
gh repo edit guanmo-ai/awesome-agent-mcp \
  --description "国内官方 MCP · Skill · CLI 大全：让你的 Agent 接上高德、飞书、美团、支付宝……只收厂商官方出品，人看网页，AI 读 llms.txt。" \
  --homepage "https://guanmo-ai.github.io/awesome-agent-mcp/" \
  --add-topic mcp,model-context-protocol,mcp-server,agent-skills,ai-agent,claude-code,codex,llms-txt,awesome,awesome-list,china,chinese
社交预览图：GitHub 没有设置它的公开 API。如果你能操作浏览器，在仓库 Settings → General → Social preview 上传 web/og.jpg；不能操作就跳过，在最后的汇报里说明。
这个任务不改代码，不需要开 PR。
```

## 上线 3：可用性检查

```
我们不测试各厂商服务本身的功能，只检查我们发布的内容是否可用。在现有的 scripts/check-links.mjs 上扩展，不要新建框架，代码改动控制在 150 行以内。
对每个展示中的服务：
1. 远程 MCP（install.mcp 的 http / sse）：不带 Key 发一次 MCP initialize 请求。服务器返回 MCP 响应，或者返回 401 / 403（说明需要鉴权，端点在线），都算通过；DNS 失败、404、5xx、超时算失败。
2. 本地 MCP 与 CLI：确认 npm / PyPI 上的包存在、没有被标记为废弃，发布者与厂商一致。
3. Skill：install.skill 能打开；是 SKILL.md 的，开头有 name 和 description。
结果只输出到命令行和 Actions 的 Job Summary，不写进 data/。失败项人工确认后再改数据：确实失效的，找到新地址或按 docs/VERIFYING.md 处理。
开 PR，附一次完整运行结果，CI 通过后自己合并。
```

## 上线 4：性能、SEO、无障碍达到 95 分以上

```
用 Lighthouse（npx lighthouse，移动端与桌面端各跑一次）检测首页和任意一个服务独立页，四项都要达到 95 分以上。
- 只做程序层面的优化：图片尺寸与格式、字体加载、懒加载、缓存、语义与 aria。
- 对比度、字号、颜色、布局等视觉问题不要自己改，列在 PR 描述里交给 Claude。
- PR 描述贴优化前后的分数，CI 通过后自己合并。
```

## 上线 5：英文 README

```
给 data/services.json 的每个展示中的条目补 nameEn 和 summaryEn（官方英文名优先，没有就用拼音名），让 scripts/build.mjs 额外生成 README.en.md，结构与 README.md 一致，两个 README 顶部互相链接。网站暂不做英文版。
开 PR，CI 通过后自己合并。
```

---

## 维护（上线后每周一次）

```
先读 AGENTS.md 和 docs/VERIFYING.md。
1. 运行可用性检查，人工确认失败项：被拦截的不算失效，真正失效的要找到新地址或按规则处理。
2. evidence.checkedAt 超过 180 天的条目重新核验。
3. 处理 GitHub 上新开的「提交服务」和「报告问题」issue。
4. 活动图案过期的 App 图标，用 node scripts/fetch-logos.mjs <id> 重新抓取。
5. 服务数量有变化时，先运行 npm run serve，再运行 node scripts/og-image.mjs 更新首页分享图；新增服务用 node scripts/og-services.mjs 补分享图。
6. 开 PR，标题「维护：YYYY-MM-DD」，CI 通过后自己合并。
```
