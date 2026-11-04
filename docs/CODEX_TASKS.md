# 给 Codex 的任务

在仓库根目录打开 Codex，把下面的提示词整段粘贴进去。每个任务都是：开 PR → CI 通过 → 自己合并（`gh pr merge --squash --delete-branch`）→ 确认网站发布成功，不需要等维护者。建议按顺序做。

---

## 任务 0：审核框架

```
先读 AGENTS.md 和 docs/REVIEW.md。这个仓库的框架、网站和 Skill 是另一个 AI 写的，请按 docs/REVIEW.md 里「代码与网站」那一节逐项审核。
1. 运行 npm run check 和 npm run serve，用浏览器分别在桌面宽度和 390px 宽度、深色和浅色模式下检查网站。
2. 对照 Claude Code、Cursor、Codex 当前的官方文档，确认 web/app.js 中 snippets() 生成的配置格式正确。
3. 审核结果按 docs/REVIEW.md 开头的格式写成清单。明显又小的问题直接修；涉及设计取舍的问题只列出来，不要改。
4. 开 PR，标题「审核：框架与网站」，审核清单写进 PR 描述。CI 通过后自己合并。
```

## 任务 1：核验已导入的 55 条

```
先读 AGENTS.md、docs/SCHEMA.md 和 docs/VERIFYING.md。data/services.json 里首批 55 条全部是 unverified。
请逐条核验：
1. 打开 url，按 docs/VERIFYING.md 判断是否为官方出品。是官方的，改成 verified 并补全 evidence；确认不是的，改成 rejected 并写明 rejectedReason；暂时判断不了的，保持 unverified，并在 PR 里说明原因。
2. 对照官方文档修正 types、access、risk、summary；文档给出了 MCP 端点或启动命令的，填写 install.mcp。
3. 链接如果是跳转页或短链，换成最直接的官方页面。
4. 每 10 到 15 条提交一次。全部做完后运行 npm run build 和 npm run check。
5. 开 PR，标题「数据：核验首批 55 条」，描述里用表格列出每条的结论和证据链接。CI 通过后自己合并。
```

## 任务 2：从 WorkBuddy 补充

```
先读 AGENTS.md 和 docs/COLLECTING.md。
WorkBuddy 的「专家 · 技能 · 连接器」页面列出了已接入的服务。我会把截图或名单给你（也可以在本机查看 WorkBuddy 的界面）。
1. 整理出所有国内服务，和 data/services.json 去重。
2. 对每个新服务，到厂商官方页面找到对应的 MCP、Skill 或 CLI，按 docs/COLLECTING.md 的步骤收录。
3. 不要把 WorkBuddy 里的任何文件复制进仓库，线索来源只写在 PR 描述里。
4. 给新条目补图标：填 homepage 和 appStoreId，运行 node scripts/fetch-logos.mjs。
5. 开 PR，标题「数据：新增 N 个（来源：WorkBuddy）」。CI 通过后自己合并。
```

## 任务 3：从 GitHub 上的其他清单补充

```
先读 AGENTS.md 和 docs/COLLECTING.md。
逐个查看 docs/COLLECTING.md 里「GitHub 上的其他清单」列出的仓库，找出 data/services.json 里还没有的国内服务。
只收能在厂商官方页面确认的；社区封装一律不收。不要照搬那些仓库的描述文字。
给新条目补图标（同任务 2）。每个来源开一个 PR，标题「数据：新增 N 个（来源：仓库名）」，CI 通过后自己合并。
```

## 任务 4：定期维护（建议每周一次）

```
先读 AGENTS.md 和 docs/VERIFYING.md。
1. 运行 npm run links，逐个人工确认报告失效的链接：被拦截的不算失效，真正失效的要找到新地址或标 rejected。
2. 找出 evidence.checkedAt 超过 180 天的条目，重新核验。
3. 查看 GitHub 上新开的「提交服务」和「报告问题」issue，逐个处理。
4. 服务数量有变化时，运行 npm run serve，再运行 node scripts/og-image.mjs，更新分享图。
5. 开 PR，标题「维护：YYYY-MM-DD」。CI 通过后自己合并。
```

## 任务 5：补图标

```
先读 AGENTS.md。同程商旅（ly-tmc）、腾讯云（tencent-cloud）、七牛云（qiniu）还没有图标，网页上显示的是文字图块。
1. 在 App Store 中国区找到它们的官方 App（开发者必须是该厂商），把数字 id 填进 appStoreId；没有 App 的，确认 homepage 正确。
2. 运行 node scripts/fetch-logos.mjs ly-tmc tencent-cloud qiniu。
3. 淘宝、飞猪、瑞幸、天眼查、巨量引擎的 App 图标目前带有节日或活动图案。等活动结束后运行 node scripts/fetch-logos.mjs --force 重新抓取。
4. 开 PR，CI 通过后自己合并。
```

## 任务 6（以后再做）：英文版

```
给每个条目补 nameEn 和 summaryEn，让 scripts/build.mjs 额外生成 README.en.md，并在网页上加中英文切换。开 PR 前先把方案写在 PR 描述里给我确认。
```
