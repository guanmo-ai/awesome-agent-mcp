# 收集流程

目标：找到**国内服务厂商官方出品**、能被 Agent 调用的 MCP Server、Skill 和 CLI。

## 去哪里找

下面都只是**线索**。确认要以厂商官方页面为准，规则见 `docs/VERIFYING.md`。

**客户端里的连接器和插件市场**：Agent 客户端集成的服务，基本就是已开放接入的服务。
- WorkBuddy：「专家 · 技能 · 连接器」页面。其中「连接器」对应 MCP，「技能」和「专家」对应 Skill。
- 其他客户端或平台的 MCP 市场，例如阿里云百炼、魔搭 ModelScope、火山引擎、通义灵码、Trae、CodeBuddy 等。名称和入口可能有变，以实际为准。

**GitHub 上的其他清单**
- https://github.com/LeslieLeung/awesome-mcp-server-cn
- https://github.com/zackchewa/awesome-china-mcp
- https://github.com/jalonliu/awesome-cn-official-mcp
- https://github.com/punkpeye/awesome-mcp-servers （只看中国服务）

**厂商自己的渠道**
- 各家开放平台的「AI」「MCP」「Skill」栏目和更新公告
- 厂商官方 GitHub 组织里名字带 mcp、skill、cli 的仓库
- 厂商自己办的 Skill 市场，例如同花顺问财 skillhub、东方财富 finskillshub

## 怎么做

1. **列线索**：记下服务名、在哪里看到、线索链接。
2. **查重**：在 `data/services.json` 里搜服务名和域名。已存在的，只补充 `sources`；`rejected` 的，除非情况有变，否则跳过。
3. **找官方页面**：到厂商自己的域名或官方 GitHub 组织，找到对应的文档页或仓库。找不到就不收。
4. **写条目**：按 `docs/SCHEMA.md` 填写。能当场核验的直接标 `verified` 并填 `evidence`，否则标 `unverified`。
5. **补图标**：填上 `homepage`，有官方 App 的再填 `appStoreId`，然后运行 `node scripts/fetch-logos.mjs`。
6. **生成并检查**：先 `npm run build`，再 `npm run check`。
7. **提 PR 并合并**：标题写「数据：新增 N 个（来源：XXX）」，描述里列出每条的线索和官方页面。

## 注意

- 客户端里的 Skill 文件、专家提示词属于各家产品，**不要复制进仓库**，只记录「哪个厂商开放了什么」，链接指向厂商官方页面。
- 在本机读取 WorkBuddy 等应用时，只看名称和说明，不提交任何应用内的文件。也可以让维护者截图后再整理。
- 第三方清单的描述文字不要照搬，`summary` 自己写。
- 线索来源写在 PR 描述里，不写进数据。
