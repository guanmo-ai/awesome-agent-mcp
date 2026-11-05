---
name: agent-mcp-finder
description: 查找中国服务厂商官方出品的 MCP Server、Agent Skill 和命令行工具（CLI），并告诉用户怎么接入。用户想让 Agent 操作某个国内服务（如高德地图、美团、飞书、支付宝、瑞幸），或问「某某有没有官方 MCP / Skill」「怎么让 Agent 帮我点外卖、打车、查股票、写飞书文档」时使用。
---

# 查找国内官方 Agent 连接器

这个 Skill 读取 Awesome Agent MCP 索引，帮用户找到能完成任务的**官方**接入方式。

## 数据来源

按顺序尝试，拿到一个即可：

1. `https://guanmo-ai.github.io/awesome-agent-mcp/services.json`
2. `https://raw.githubusercontent.com/guanmo-ai/awesome-agent-mcp/main/data/services.json`
3. `https://guanmo-ai.github.io/awesome-agent-mcp/llms.txt`（纯文本版本）

`services.json` 中每个服务的主要字段：

| 字段 | 含义 |
| :-- | :-- |
| `name` / `summary` | 服务名和一句话能力说明 |
| `category` | 分类 id，对应 `categories` |
| `types` | `mcp`、`skill`、`cli` 中的一个或多个 |
| `url` | 官方入口，接入以它为准 |
| `risk` | `read` 只读查询；`write` 会创建或修改数据；`payment` 可能下单或付款 |
| `access` | 接入门槛，例如 `key`（需 API Key）、`membership`（需会员）、`desktop-app`（需桌面客户端）；空数组表示尚未整理 |
| `status` | `verified` 已确认为官方出品；`unverified` 尚未逐条确认 |
| `install.mcp` | 现成的 MCP 配置：`transport`（`http` / `sse` / `stdio`）、`url` 或 `command` 加 `args` |
| `install.cli` / `install.skill` | 命令行工具的安装命令；Skill 文件的地址 |

## 步骤

1. 把用户的需求拆成要用的服务或能力，例如「点咖啡」对应瑞幸、麦当劳，「查路线」对应地图类服务。
2. 读取数据，排除 `status: rejected`，按 `name`、`summary` 和分类匹配。优先选 `status: verified` 的条目，其次是 `unverified`。回到厂商文档核对实际能力、适用对象、账号与费用门槛，区分商家接口和面向个人的服务。官方身份核验不代表已实测接入。
3. 对每个候选，告诉用户：
   - 服务名、能做什么、类型（MCP / Skill / CLI）
   - 接入门槛（`access`）；为空就说「门槛未整理，请看官方文档」
   - 官方链接 `url`
   - 有 `install.mcp` 时，给出用户所用客户端的配置。远程服务（http / sse）示例：Claude Code 用 `claude mcp add --transport <transport> <id> "<url>"`；JSON 用 `{"mcpServers": {"<id>": {"type": "<transport>", "url": "<url>"}}}`
   - 有 `install.mcp.headers` 时保留认证请求头：Claude Code 用 `--header '名称: 值'`，JSON 用 `headers`，Codex 的 HTTP 配置用 `[mcp_servers.<id>.http_headers]`。本地命令的参数、环境变量值和远程 URL 要做 shell 引用，防止空格和尖括号被误解析。Codex 支持 stdio 和 Streamable HTTP，不能把 SSE 地址直接当成 HTTP 配置。
4. 按用户已有授权帮助配置；先检查当前 Agent 的官方支持方式，保留已有配置。由用户在本地填写 Key 和完成账号授权，不要求在对话中发送密钥；未整理的安装字段不能猜测。
5. 配置后验证连接。优先列出工具或执行不产生费用的只读查询，报告实际结果、错误和剩余步骤；写入配置、安装成功与服务可用是不同状态。不能联网或不能修改配置时，明确能力限制并给出下一步。

## 必须遵守

- **涉及资金**（`risk: payment`）的服务可能下单或付款。任何会产生费用的步骤，执行前都要明确告诉用户并等他确认。
- 推荐 `unverified` 条目时，要说明「尚未确认是否为官方出品」。
- 索引里找不到，就直说没有收录，不等于没有官方接入，不要编造链接或配置。可以建议用户到 https://github.com/guanmo-ai/awesome-agent-mcp/issues/new?template=submit.yml 提交。
- 本索引不提供任何 Key、账号或付费内容。
