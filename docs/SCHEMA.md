# 数据字段

`data/services.json` 顶层结构：

```jsonc
{
  "schemaVersion": 1,
  "updatedAt": "2026-11-04",            // 最近一次数据变更
  "categories": [{ "id": "life", "name": "出行和生活", "nameEn": "Travel & Life" }],
  "services": [ /* 见下表 */ ]
}
```

## 服务条目

| 字段 | 必填 | 说明 |
| :-- | :-: | :-- |
| `id` | ✓ | 小写字母、数字和连字符，全局唯一，例如 `amap`、`tencent-docs`。网页用它做卡片链接 `#s-<id>`，定下后不要改 |
| `name` | ✓ | 服务的中文常用名 |
| `category` | ✓ | 分类 id，对应 `categories` |
| `nameEn` | 展示时必填 | 官方英文名优先；无官方英文名时使用拼音名，rejected 条目可不填 |
| `summaryEn` | 展示时必填 | 与 summary 能力范围一致的英文简介，rejected 条目可不填 |
| `keywords` |  | 展示条目的日常能力说法，最多 6 个、非空且不重复；依实际能力填写，不添加未提供的功能 |
| `summary` | ✓ | 一句话能力说明，不超过 60 字，用自己的话写 |
| `types` | ✓ | `mcp`、`skill`、`cli` 中的一个或多个 |
| `url` | ✓ | 官方入口（文档页或官方仓库），必须是 https |
| `repo` |  | 官方代码仓库，和 `url` 不同时才填 |
| `homepage` |  | 产品官网首页，用来抓图标 |
| `appStoreId` |  | App Store 上该产品官方 App 的数字 id，图标优先从这里取；只填开发者是该厂商的 App |
| `color` |  | 品牌主色 `#RRGGBB`，用作卡片图标底色 |
| `mark` |  | 卡片图标上的字，默认取名称的第一个字 |
| `risk` | ✓ | `read` 只读查询；`write` 可执行操作（创建或修改数据）；`payment` 涉及资金（可能下单或付款）。能力跨多级时取最高一级 |
| `access` | ✓ | 接入门槛，可多选：`free` 免费可用、`key` 需 API Key、`account` 需授权账号、`membership` 需会员或付费、`desktop-app` 需桌面客户端、`apply` 需申请开通。尚未整理时填 `[]`；门槛因场景或部署方式不同、无法统一标注时也填 `[]`，并在 `setup.requirements` 写明具体条件 |
| `status` | ✓ | `unverified` 待核验；`verified` 已核验；`rejected` 不收录（不展示，留着是为了防止被重复提交） |
| `evidence` | 已核验时必填 | `{ "url": "证明官方身份的页面", "checkedAt": "YYYY-MM-DD", "note": "可选，一句话说明" }` |
| `evidence.quote` |  | 从 `evidence.url` 逐字摘录的官方原文或配置片段，不超过 80 字；只摘能证明端点、安装命令或能力的内容，不改写。无法确认时省略，摘录日期沿用 `checkedAt` |
| `evidence.agentReadable` |  | 布尔值：核对时可不借助浏览器读取该依据正文则为 `true`，只有页面外壳、导航或受限则为 `false`；有其他可读官方来源时可将 `url` 更新为该来源。可读性是当次记录 |
| `rejectedReason` | 不收录时必填 | 为什么不收录 |
| `install.mcp` |  | 远程服务填 `{ "transport": "http" 或 "sse", "url": "..." }`；本地服务填 `{ "transport": "stdio", "command": "npx", "args": [...], "env": { "KEY": "<你的Key>" } }`。用户要替换的部分写成 `<说明>`，不要有空格 |
| `install.cli` |  | 命令行工具的安装命令 |
| `install.mcp.headers` |  | 远程 MCP 官方要求的请求头，字符串键值对象；认证值只写 `<你的Token>` 等占位符 |
| `install.skill` |  | Skill 文件或 Skill 仓库的地址 |
| `setup.cost` |  | 费用对象：`text` 为官方费用说明或「官方未说明」，`url` 为核对的官方来源，`checkedAt` 为核对日期，`quote` 为可选的 80 字以内官方原文。可单独存在，不代表其他接入步骤已整理。 |
| `setup` |  | 可选接入指引对象：`requirements` 为适用对象、前提及费用限制；`steps` 为非空数组，每项含非空 `text` 和官方 HTTPS `url`；`verify` 说明用户如何检查接入成功，并非本项目实测状态；`checkedAt` 为核对日期（有效的 YYYY-MM-DD）。所有文本均为非空字符串 |
| `addedAt` | ✓ | 收录日期 |
| `sources` |  | 由社区提交时，记录提交者：`[{ "name": "...", "url": "..." }]` |

图标不写在数据里：`scripts/fetch-logos.mjs` 会把图标存到 `web/logos/<id>.png`，构建时自动带上。

`scripts/lib.mjs` 中的 `validate()` 会检查以上规则，`npm run check` 不通过时不能合并。

`setup.permissionEvidence` 可选记录办公权限依据，包含官方 HTTPS `url`、布尔 `agentReadable` 和可选的 80 字内逐字 `quote`。原文未覆盖的权限条件不可推断。
