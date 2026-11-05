# 给 Codex 的任务

在仓库根目录打开 Codex，把提示词整段粘贴进去。先读 `AGENTS.md`，尤其是「保持简单」。每个任务的流程都是：开 PR → CI 通过 → 自己合并（`gh pr merge --squash --delete-branch`）→ 确认「发布网站」成功。

已完成：首批核验、补图标、服务独立页、WorkBuddy 与三个 GitHub 清单的补充。

---

## 上线前 1：可用性检查

```
先读 AGENTS.md 的「保持简单」。我们不测试各厂商服务本身的功能，只检查我们发布的内容是否可用。在现有的 scripts/check-links.mjs 上扩展，不要新建框架，代码改动控制在 150 行以内。
对每个展示中的服务：
1. 远程 MCP（install.mcp 的 http / sse）：不带 Key 发一次 MCP initialize 请求。服务器返回 MCP 响应，或者返回 401 / 403（说明需要鉴权，端点在线），都算通过；DNS 失败、404、5xx、超时算失败。
2. 本地 MCP 与 CLI：确认 npm / PyPI 上的包存在、没有被标记为废弃，发布者与厂商一致。
3. Skill：install.skill 能打开；是 SKILL.md 的，开头有 name 和 description。
结果只输出到命令行和 Actions 的 Job Summary，不写进 data/。失败项人工确认后再改数据：确实失效的，找到新地址或按 docs/VERIFYING.md 处理。
开 PR，附一次完整运行结果，CI 通过后自己合并。
```

## 上线前 2：性能、SEO、无障碍达到 95 分以上

```
先读 AGENTS.md 的「保持简单」。用 Lighthouse（npx lighthouse，移动端与桌面端各跑一次）检测首页和任意一个服务独立页，四项都要达到 95 分以上。
- 只做程序层面的优化：图片尺寸与格式、字体加载、懒加载、缓存、语义与 aria。
- 对比度、字号、颜色、布局等视觉问题不要自己改，列在 PR 描述里交给 Claude。
- PR 描述贴优化前后的分数，CI 通过后自己合并。
```

## 上线前 3：英文 README

```
先读 AGENTS.md 的「保持简单」。给 data/services.json 的每个条目补 nameEn 和 summaryEn（官方英文名优先，没有就用拼音名），让 scripts/build.mjs 额外生成 README.en.md，结构与 README.md 一致，两个 README 顶部互相链接。网站暂不做英文版。
开 PR，CI 通过后自己合并。
```

## 维护（每周一次）

```
先读 AGENTS.md 和 docs/VERIFYING.md。
1. 运行可用性检查，人工确认失败项：被拦截的不算失效，真正失效的要找到新地址或按规则处理。
2. evidence.checkedAt 超过 180 天的条目重新核验。
3. 处理 GitHub 上新开的「提交服务」和「报告问题」issue。
4. 活动图案过期的 App 图标，用 node scripts/fetch-logos.mjs <id> 重新抓取。
5. 服务数量有变化时，先运行 npm run serve，再运行 node scripts/og-image.mjs 更新首页分享图；新增服务用 node scripts/og-services.mjs 补分享图。
6. 开 PR，标题「维护：YYYY-MM-DD」，CI 通过后自己合并。
```
