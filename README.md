<!-- 本文件由 scripts/build.mjs 根据 data/services.json 自动生成，请改数据后运行 npm run build，不要手改。 -->

<h1 align="center">Awesome Agent MCP</h1>

<p align="center"><b>国内官方 MCP · Skill · CLI 大全</b><br>让你的 Agent 接上高德、飞书、美团、支付宝……只收厂商官方出品，人看网页，AI 读 llms.txt。</p>

<p align="center">
  <a href="https://guanmo-ai.github.io/awesome-agent-mcp/"><b>打开卡片网站 ↗</b></a> &nbsp;·&nbsp;
  <a href="#for-ai">给 AI 用</a> &nbsp;·&nbsp;
  <a href="https://github.com/guanmo-ai/awesome-agent-mcp/issues/new?template=submit.yml">提交服务</a> &nbsp;·&nbsp;
  <a href="https://x.com/guanmo_ai">关注 @guanmo_ai</a>
</p>

<p align="center"><sub>55 个服务 · 7 个分类 · 24 个已核验 · 更新于 2026-11-04</sub></p>

<p align="center"><a href="https://guanmo-ai.github.io/awesome-agent-mcp/"><img src="web/og.jpg" alt="Awesome Agent MCP 网站预览" width="100%"></a></p>

> 只收**厂商官方**出品的 MCP Server、Agent Skill 与命令行工具（CLI），社区封装不收。

<a id="for-ai"></a>

## 给 AI 用

不用复制粘贴清单，直接让你的 Agent 来读：

| 方式 | 地址 |
| :-- | :-- |
| llms.txt（适合直接读） | https://guanmo-ai.github.io/awesome-agent-mcp/llms.txt |
| JSON 数据（适合程序） | https://guanmo-ai.github.io/awesome-agent-mcp/services.json |
| GitHub 原始文件 | https://raw.githubusercontent.com/guanmo-ai/awesome-agent-mcp/main/data/services.json |

也可以装上仓库自带的 Skill [`agent-mcp-finder`](skills/agent-mcp-finder/SKILL.md)。装好后说「帮我点杯瑞幸」，Agent 会先查这份索引，告诉你有没有官方接入、需要什么 Key、配置怎么写。以 Claude Code 为例：

```bash
mkdir -p ~/.claude/skills/agent-mcp-finder && curl -fsSL https://raw.githubusercontent.com/guanmo-ai/awesome-agent-mcp/main/skills/agent-mcp-finder/SKILL.md -o ~/.claude/skills/agent-mcp-finder/SKILL.md
```

<a id="toc"></a>

## 目录

- [出行和生活](#cat-life)（10）
- [办公和协作](#cat-office)（9）
- [笔记、阅读和网盘](#cat-notes)（9）
- [搜索、内容和企业数据](#cat-search)（6）
- [设计和创作](#cat-design)（6）
- [支付和金融](#cat-finance)（6）
- [云和开发](#cat-cloud)（9）

<a id="cat-life"></a>

## 出行和生活

| 服务 | 能做什么 | 类型 | 权限 | 门槛 | 状态 |
| :-- | :-- | :-- | :-- | :-- | :-- |
| [高德地图](https://developer.amap.com/api/mcp-server/summary) | 地点与天气查询、路线规划、地图生成和地图开发。 | MCP · Skill · CLI | 🟢 只读查询 | 需 API Key | ✅ 已核验 |
| [百度地图](https://lbs.baidu.com/docs/ai?title=mcpserver/base) | 地点检索、地理编码与路线规划。 | MCP | 🟢 只读查询 | 需 API Key | ✅ 已核验 |
| [腾讯地图](https://lbs.qq.com/service/MCPServer/MCPServerGuide/overview) | 地点搜索、路线规划与位置服务。 | MCP | 🟢 只读查询 | 需 API Key | ✅ 已核验 |
| [滴滴](https://mcp.didichuxing.com/) | 叫车、估价与行程查询。 | MCP · Skill | 🔴 涉及资金 | 需授权账号、需 API Key | ✅ 已核验 |
| [美团](https://developer.meituan.com/ai-hub/mcp-list) | 商家订单、团购核销、商品与库存管理及经营数据查询。 | MCP · Skill · CLI | 🔴 涉及资金 | 需授权账号、需申请开通 | ✅ 已核验 |
| [淘宝](https://tblifecdn.taobao.com/taobaopc/skills/taobao-native/SKILL.md) | 商品搜索与购物，需安装桌面客户端。 | MCP · Skill | 🔴 涉及资金 | 需桌面客户端、需授权账号 | ✅ 已核验 |
| [麦当劳中国](https://open.mcd.cn/mcp/doc) | 点餐、门店与优惠查询。 | MCP | 🔴 涉及资金 | 需授权账号、需 API Key | ✅ 已核验 |
| [瑞幸](https://open.lkcoffee.com/docs) | 咖啡点单与门店查询。 | MCP · Skill · CLI | 🔴 涉及资金 | 需授权账号、需 API Key | ✅ 已核验 |
| [飞猪](https://github.com/alibaba-flyai/flyai-skill) | 机票、酒店和景点搜索，返回价格与预订跳转链接。 | Skill · CLI | 🟢 只读查询 | 免费可用 | ✅ 已核验 |
| [同程商旅](https://tmc.ly.com/zh/resources/updates/open-mcp-skills-cli) | 企业差旅资源查询、差旅政策校验与方案推荐。 | MCP · Skill · CLI | 🟢 只读查询 | 需授权账号、需申请开通 | ✅ 已核验 |

<sub>[↑ 回到目录](#toc)</sub>

<a id="cat-office"></a>

## 办公和协作

| 服务 | 能做什么 | 类型 | 权限 | 门槛 | 状态 |
| :-- | :-- | :-- | :-- | :-- | :-- |
| [飞书](https://github.com/larksuite/cli) | 消息、文档、日历与多维表格。 | MCP · Skill · CLI | 🟡 可执行操作 | 需授权账号 | ✅ 已核验 |
| [钉钉](https://open.dingtalk.com/document/ai-dev/dingtalk-server-api-mcp-overview) | 消息、文档、表格、日志、日历与待办的查询和操作。 | MCP | 🟡 可执行操作 | 需授权账号 | ✅ 已核验 |
| [企业微信](https://work.weixin.qq.com/nl/index/aicli) | 企业消息、通讯录与办公应用。 | MCP · Skill · CLI | 🟡 可执行操作 | 需授权账号、需 API Key | ✅ 已核验 |
| [腾讯文档](https://docs.qq.com/open/document/mcp/) | 在线文档与表格的读取和编辑。 | MCP · Skill | 🟡 可执行操作 | 需授权账号、免费可用 | ✅ 已核验 |
| [腾讯会议](https://cloud.tencent.com/document/product/1095/133826) | 预约和管理会议，读取参会信息、录制、转写与纪要。 | MCP · Skill · CLI | 🟡 可执行操作 | 需授权账号 | ✅ 已核验 |
| [WPS](https://open.wps.cn/documents/app-integration-dev/mcp-server/introduction) | 通过 WPS 365 API 查询和操作企业文档及协作数据。 | MCP | 🟡 可执行操作 | 需授权账号、需申请开通 | ✅ 已核验 |
| [金山文档](https://github.com/kdocs-app/kdocs-skill) | 在线文档的读取与协作。 | Skill · CLI | 🟡 可执行操作 | 需授权账号 | ⏳ 待核验 |
| [语雀](https://github.com/yuque/yuque-mcp-server) | 知识库与文档的读写。 | MCP | 🟡 可执行操作 | 需授权账号、需 API Key | ✅ 已核验 |
| [Agently Mail（QQ 邮箱团队）](https://github.com/Tencent/AgentlyMail) | 专供 Agent 的邮箱，支持邮件收发、搜索、整理和附件操作。 | Skill · CLI | 🟡 可执行操作 | 需授权账号 | ✅ 已核验 |

<sub>[↑ 回到目录](#toc)</sub>

<a id="cat-notes"></a>

## 笔记、阅读和网盘

| 服务 | 能做什么 | 类型 | 权限 | 门槛 | 状态 |
| :-- | :-- | :-- | :-- | :-- | :-- |
| [微信读书](https://weread.qq.com/r/weread-skills) | 书架、笔记与划线。 | Skill | 🟢 只读查询 | 需授权账号、需 API Key | ✅ 已核验 |
| [腾讯 ima](https://ima.qq.com/agent-interface) | 个人知识库的搜索与读写。 | Skill | 🟡 可执行操作 | 需授权账号、需 API Key | ✅ 已核验 |
| [得到大脑（原 Get 笔记）](https://www.biji.com/openapi) | 笔记的记录与检索。 | MCP · Skill · CLI | 🟡 可执行操作 | 需授权账号、需会员或付费 | ✅ 已核验 |
| [flomo](https://help.flomoapp.com/advance/mcp/) | 卡片笔记的记录与检索。 | MCP | 🟡 可执行操作 | 需授权账号、需会员或付费 | ✅ 已核验 |
| [印象笔记](https://guide.yinxiang.com/docs/yxai/skill.html) | 笔记的创建、搜索与整理。 | Skill | 🟡 可执行操作 | 需授权账号、需会员或付费 | ✅ 已核验 |
| [有道云笔记](https://note.youdao.com/help-center/skill-guide.html) | 笔记读写与搜索、待办管理和网页剪藏。 | Skill · CLI | 🟡 可执行操作 | 需授权账号、需 API Key | ✅ 已核验 |
| [夸克网盘](https://www.quark.cn/documents/help/quark-drive-skill) | 网盘文件的搜索与管理。 | Skill | 🟡 可执行操作 | — | ⏳ 待核验 |
| [腾讯微云](https://www.weiyun.com/act/openclaw) | 网盘文件的搜索与管理。 | Skill | 🟡 可执行操作 | — | ⏳ 待核验 |
| [百度网盘](https://pan.baidu.com/union/doc/mcp-server/) | 网盘文件的搜索、上传与管理。 | MCP | 🟡 可执行操作 | — | ⏳ 待核验 |

<sub>[↑ 回到目录](#toc)</sub>

<a id="cat-search"></a>

## 搜索、内容和企业数据

| 服务 | 能做什么 | 类型 | 权限 | 门槛 | 状态 |
| :-- | :-- | :-- | :-- | :-- | :-- |
| [知乎](https://developer.zhihu.com/docs?key=zhihu_cli) | 问答与内容的搜索和读取。 | MCP · Skill | 🟢 只读查询 | — | ⏳ 待核验 |
| [博查搜索](https://github.com/BochaAI/bocha-search-mcp) | 面向 AI 的中文网页搜索。 | MCP | 🟢 只读查询 | — | ⏳ 待核验 |
| [企查查](https://agent.qcc.com/guide) | 企业工商与风险信息查询。 | MCP | 🟢 只读查询 | — | ⏳ 待核验 |
| [天眼查](https://github.com/tyc-tech/tyc-cli) | 企业工商与关系信息查询。 | MCP | 🟢 只读查询 | — | ⏳ 待核验 |
| [抖音开放平台](https://developer.open-douyin.com/docs/resource/zh-CN/dop/ability/mcp-service/mcp-service-desc) | 抖音开放能力的接入。 | MCP | 🟡 可执行操作 | — | ⏳ 待核验 |
| [巨量引擎](https://open.oceanengine.com/mcp) | 广告投放数据与管理。 | MCP | 🟡 可执行操作 | — | ⏳ 待核验 |

<sub>[↑ 回到目录](#toc)</sub>

<a id="cat-design"></a>

## 设计和创作

| 服务 | 能做什么 | 类型 | 权限 | 门槛 | 状态 |
| :-- | :-- | :-- | :-- | :-- | :-- |
| [MasterGo](https://mastergo.com/help/ai-features/magic-mcp.html) | 读取设计稿，辅助生成代码。 | MCP | 🟢 只读查询 | — | ⏳ 待核验 |
| [墨刀](https://modao.cc/feature/ai-mcp.html) | 读取原型与设计稿。 | MCP | 🟢 只读查询 | — | ⏳ 待核验 |
| [Pixso](https://pixso.net/developer/zh/mcp/remote-mcp.html) | 读取设计稿，辅助生成代码。 | MCP | 🟢 只读查询 | — | ⏳ 待核验 |
| [可灵](https://github.com/klingai-tech/skills) | AI 视频与图片生成。 | MCP · Skill | 🟡 可执行操作 | — | ⏳ 待核验 |
| [MiniMax](https://github.com/MiniMax-AI/MiniMax-MCP) | 语音、图片、视频与音乐生成。 | MCP | 🟡 可执行操作 | — | ⏳ 待核验 |
| [网易云音乐](https://music.163.com/st/ncmcli) | 音乐搜索与播放控制。 | Skill | 🟢 只读查询 | — | ⏳ 待核验 |

<sub>[↑ 回到目录](#toc)</sub>

<a id="cat-finance"></a>

## 支付和金融

| 服务 | 能做什么 | 类型 | 权限 | 门槛 | 状态 |
| :-- | :-- | :-- | :-- | :-- | :-- |
| [支付宝](https://opendocs.alipay.com/open/0h3gdq) | 支付、收款与交易查询。 | MCP · Skill | 🔴 涉及资金 | — | ⏳ 待核验 |
| [微信支付](https://pay.weixin.qq.com/doc/v3/merchant/4035576700) | 商户支付与交易查询。 | Skill | 🔴 涉及资金 | — | ⏳ 待核验 |
| [银联](https://open.unionpay.com/tjweb/solution/detail?solId=613) | 银联支付相关能力。 | MCP | 🔴 涉及资金 | — | ⏳ 待核验 |
| [同花顺 iFinD](https://mcp.51ifind.com/) | 金融行情与数据查询。 | MCP · Skill | 🟢 只读查询 | — | ⏳ 待核验 |
| [同花顺问财](https://search.10jqka.com.cn/skillhub) | 股票与金融数据问答。 | Skill | 🟢 只读查询 | — | ⏳ 待核验 |
| [东方财富妙想](https://marketing.dfcfs.com/views/finskillshub/) | 金融资讯与数据分析。 | Skill | 🟢 只读查询 | — | ⏳ 待核验 |

<sub>[↑ 回到目录](#toc)</sub>

<a id="cat-cloud"></a>

## 云和开发

| 服务 | 能做什么 | 类型 | 权限 | 门槛 | 状态 |
| :-- | :-- | :-- | :-- | :-- | :-- |
| [阿里云](https://api.aliyun.com/mcp) | 云资源查询与管理。 | MCP | 🟡 可执行操作 | — | ⏳ 待核验 |
| [腾讯云](https://cloud.tencent.com/document/product/1278/131433) | 云资源查询与管理。 | MCP · Skill | 🟡 可执行操作 | — | ⏳ 待核验 |
| [华为云](https://github.com/huaweicloud/huaweicloud-mcp) | 云资源查询与管理。 | MCP · Skill | 🟡 可执行操作 | — | ⏳ 待核验 |
| [火山引擎](https://github.com/volcengine/mcp-server) | 云资源与 AI 能力接入。 | MCP | 🟡 可执行操作 | — | ⏳ 待核验 |
| [百度智能云](https://ai.baidu.com/ai-doc/REFERENCE/mm9tjwod0) | 云服务与 AI 能力接入。 | MCP | 🟡 可执行操作 | — | ⏳ 待核验 |
| [七牛云](https://github.com/qiniu/qiniu-mcp-server) | 对象存储与 CDN 管理。 | MCP | 🟡 可执行操作 | — | ⏳ 待核验 |
| [智谱](https://docs.bigmodel.cn/cn/coding-plan/mcp/search-mcp-server) | 联网搜索等模型工具。 | MCP | 🟢 只读查询 | — | ⏳ 待核验 |
| [Gitee](https://blog.gitee.com/2026/01/22/gitee-official-mcp-server-ai-code-repo/) | 代码仓库、Issue 与 PR 管理。 | MCP | 🟡 可执行操作 | — | ⏳ 待核验 |
| [极狐 GitLab](https://gitlab.cn/news/cmvg3kvmv000nv30iuo1aifgg) | 代码仓库与 DevOps 管理。 | MCP | 🟡 可执行操作 | — | ⏳ 待核验 |

<sub>[↑ 回到目录](#toc)</sub>

## 图例

- **类型**：`MCP` 是 Agent 调用外部服务的标准接口；`Skill` 是教 Agent 使用某个服务的说明文档；`CLI` 是 Agent 可以直接调用的命令行工具。
- **权限**：🟢 只读查询，只查不改；🟡 可执行操作，会创建或修改数据；🔴 涉及资金，可能下单或付款，务必让人最后确认。
- **状态**：✅ 已核验，确认为厂商官方出品并留有证据；⏳ 待核验，来自公开整理，还没逐条确认。

## 收录标准

1. 由服务厂商官方发布：链接在厂商自己的域名，或在厂商官方的 GitHub 组织下。
2. 面向国内用户的服务，能被 Agent 通过 MCP、Skill 或 CLI 调用。
3. 第三方平台转载、社区封装、逆向接口一律不收。

详细流程见 [docs/VERIFYING.md](docs/VERIFYING.md)。发现遗漏或错误？[提交服务](https://github.com/guanmo-ai/awesome-agent-mcp/issues/new?template=submit.yml) 或 [报告问题](https://github.com/guanmo-ai/awesome-agent-mcp/issues/new?template=correction.yml)。

## 许可

代码使用 [MIT](LICENSE) 许可。各服务的名称与商标归各自厂商所有。由 [观默 @guanmo_ai](https://x.com/guanmo_ai) 发起与维护。
