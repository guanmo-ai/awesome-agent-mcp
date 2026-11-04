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

## 任务 6：服务独立页（设计稿已就绪）

```
先读 AGENTS.md 和 web/service.html 顶部的注释。web/service.html 是服务独立页的设计稿模板，样式已写在 web/app.css 的「Service page」一节，不要改动视觉设计。
1. 在 scripts/build.mjs 中为每个展示中的服务生成 dist/s/<id>/index.html：按模板注释填充占位符。把 web/app.js 里 openSheet() 用到的标签、徽章、配置片段等拼装逻辑抽成一个可在 Node 和浏览器共用的模块（例如 web/render.mjs），两边用同一份，保证独立页与详情抽屉的内容一致。所有数据都必须转义。
2. {{prompt}} 写成：读取 <siteUrl>s/<id>/ ，帮我把<服务名>的官方接入配置进我的 Agent，Key 我自己填。
3. {{jsonLd}} 输出 schema.org SoftwareApplication（name、description、url、applicationCategory、publisher=厂商），注意 JSON 中的 </script> 需转义。
4. 新增 web/service.js：负责独立页上的复制、配置标签页切换、主题切换和 ⌘K 面板。尽量从 app.js 复用，不要复制粘贴两份逻辑。
5. 首页卡片和命令面板保持当前抽屉交互，抽屉里的「复制链接」改为复制独立页地址；README 和 llms.txt 中每个服务额外附上独立页链接。
6. 生成 dist/sitemap.xml 和 dist/robots.txt。
7. 为每个服务生成分享图 dist/og/<id>.jpg（1200×630）：参考 web/og.jpg 的深色风格，左侧大图标 + 服务名 + 一句话 + 类型标签，右下角品牌标。用 Playwright 渲染，脚本放 scripts/og-services.mjs；它在本机运行，生成的图片提交到 web/og/，构建时复制到 dist/og/。
8. 加测试：每个服务都有独立页、页面里没有残留 {{ 占位符、sitemap 覆盖所有服务。
9. 开 PR，附桌面与手机截图，CI 通过后自己合并。
```

## 任务 7：性能、SEO、无障碍达到 95 分以上

```
先读 AGENTS.md。用 Lighthouse（npx lighthouse，移动端与桌面端各跑一次）检测首页和任意一个服务独立页，四项（Performance、Accessibility、Best Practices、SEO）都要达到 95 分以上。
- 只做程序层面的优化：图片尺寸与格式（图标可转 WebP 并保留 PNG 回退）、字体加载、关键 CSS、懒加载、缓存、语义与 aria、对比度。
- 涉及视觉变化（颜色、字号、布局）的问题，不要自己改，在 PR 里列出来交给 Claude 设计处理。
- PR 描述里贴优化前后的分数，CI 通过后自己合并。
```

## 任务 8（以后再做）：英文版

```
给每个条目补 nameEn 和 summaryEn，让 scripts/build.mjs 额外生成 README.en.md，并在网页上加中英文切换。开 PR 前先把方案写在 PR 描述里给我确认。
```
