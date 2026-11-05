# 审核清单

交给 Codex 或其他审核者用。审核结果写成清单：每条问题给出文件与行号、严重程度（必须改 / 建议改）、原因和建议的改法。明显又小的问题可以直接修，并在 PR 里说明。

审核发现由 Codex 按 `AGENTS.md`「分工」跟进，补齐证据、落实修复并验证；需要 Opus 5.5 的审美方案或第二意见时，把问题留在 PR 描述，推送后由维护者转交。

## 代码与网站

- [ ] `npm run check` 通过；`npm run build` 之后工作区没有意料之外的改动。
- [ ] **安全**：`web/app.js` 里所有来自数据的文字都经过 `esc()`，链接都经过 `safeUrl()`；没有把原始数据直接拼进 `innerHTML`。
- [ ] 外链都带 `target="_blank" rel="noopener"`。
- [ ] 手机宽度 390px 下没有横向滚动；深色和浅色模式都正常；跟随系统和手动切换都正常。
- [ ] 键盘：`⌘K` / `Ctrl K` 打开命令面板，方向键选择、回车打开；`/` 聚焦筛选框；`Esc` 关闭面板或详情；Tab 能走到每张卡片。
- [ ] 打开 `#s-<id>` 能直接弹出对应卡片，关闭后网址里的 `#s-` 被清掉。
- [ ] 详情里的配置片段，对照各客户端**当前**的官方文档确认格式正确：Claude Code 的 `claude mcp add`、通用 `mcpServers` JSON、Codex 的 `~/.codex/config.toml`。
- [ ] `skills/agent-mcp-finder/SKILL.md` 里的网址、仓库名和 `site.config.json` 一致；安装命令能用。
- [ ] `llms.txt` 符合 https://llmstxt.org 的格式。
- [ ] GitHub Actions：权限最小化；Pages 部署用的是 `dist/`。
- [ ] 不依赖国内访问不了的资源，比如 Google Fonts 或境外 CDN。字体和图标都在仓库里。
- [ ] 首页动画在「减少动态效果」系统设置下会停下；页面切到后台时动画暂停。
- [ ] 图标正确：每个图标都是该服务自己的，没有节日限定版图案混进首页轨道。

## 数据

对每一条新增或修改的条目：

- [ ] 打开 `url`，按 `docs/VERIFYING.md` 确认是官方出品；标了 `verified` 的要有可查的 `evidence`。
- [ ] `types`、`access`、`risk` 和官方文档一致。
- [ ] `summary` 准确，是自己写的话，不超过 60 字。
- [ ] 没有重复：同一个服务没有两个 id，同一个 `url` 没有出现两次。
- [ ] `sources` 写明了来源。
