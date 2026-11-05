<!-- 本文件由 scripts/build.mjs 根据 data/services.json 自动生成，请改数据后运行 npm run build，不要手改。 -->

[English](README.en.md) · **简体中文**

<h1 align="center">Awesome Agent MCP</h1>

<p align="center"><b>国内官方 MCP · Skill · CLI 大全</b><br>让 Agent 接上真实世界的服务。国内厂商官方 MCP / Skill / CLI 开源全景索引：交互式可视化检索，原生支持 Agent 读取。</p>

<p align="center">
  <a href="https://guanmo-ai.github.io/awesome-agent-mcp/"><b>浏览服务索引 ↗</b></a> &nbsp;·&nbsp;
  <a href="#for-ai">给 AI 用</a> &nbsp;·&nbsp;
  <a href="https://github.com/guanmo-ai/awesome-agent-mcp/issues/new?template=submit.yml">提交服务</a> &nbsp;·&nbsp;
  <a href="https://x.com/guanmo_ai">关注 @guanmo_ai</a>
</p>

<p align="center"><sub>105 个服务 · 7 个分类 · 附安装配置 88 · 更新于 2026-11-05</sub></p>

> **独立社区索引，仅供参考。** 收录不构成背书，“已核验”不等于已实测或安全保证。使用前请自行核实官方信息。[使用说明与免责声明](#disclaimer)

<a id="for-ai"></a>

## 给 AI 用

**直接复制下面整段，发给你的 Agent。** 不用改链接、填写占位符或先装 Skill；需要 Agent 能读取网页。

```text
读取 https://guanmo-ai.github.io/awesome-agent-mcp/llms.txt，作为查找官方 MCP、Skill 和 CLI 的参考索引；找到服务后读取它链接的 Markdown，获取完整配置与步骤。
根据我在末尾或后续消息中提供的服务名或需求查找；如果我还没说，先问我想找什么。
核对厂商官方文档，告诉我能做什么、账号权限、费用，以及当前 Agent 是否支持和如何接入。未收录不代表不存在，不确定的信息不要猜。
官方页面读不到时，以索引中的官方原文摘录为依据，并告诉我这一点。没有对应摘录的内容仍须核实，不要猜测。
本索引仅供参考，已核验不等于实测或安全保证。需要安装或配置时按我的授权执行，密钥和登录由我在本地完成；下单、付款前让我确认。
给出官方链接；如进行了接入，报告实际验证结果和剩余步骤。
```

**可选：在末尾加一句，或下一条消息再说。** 例如 `帮我查飞书的 MCP`、`帮我找能查路线的官方接入`。不补也能直接发送，Agent 会先询问你的需求。

<p align="center"><a href="https://guanmo-ai.github.io/awesome-agent-mcp/"><img src="web/og.jpg" alt="Awesome Agent MCP 网站预览" width="100%"></a></p>

> 只收**厂商官方**出品的 MCP Server、Agent Skill 与命令行工具（CLI），社区封装不收。

不用复制粘贴清单，直接让你的 Agent 来读：

| 方式 | 地址 |
| :-- | :-- |
| llms.txt（适合直接读） | https://guanmo-ai.github.io/awesome-agent-mcp/llms.txt |
| 全文（按需） | https://guanmo-ai.github.io/awesome-agent-mcp/llms-full.txt |
| JSON 数据（适合程序） | https://guanmo-ai.github.io/awesome-agent-mcp/services.json |
| GitHub 原始文件 | https://raw.githubusercontent.com/guanmo-ai/awesome-agent-mcp/main/data/services.json |

**以后也想随时查？** 可选安装 [`agent-mcp-finder`](skills/agent-mcp-finder/SKILL.md)。复制下面的提示词，让 Agent 按自己的安装方式处理；无需先学终端命令。这个 Skill 用来查找接入，不会自动接通所有服务。

```text
读取 https://raw.githubusercontent.com/guanmo-ai/awesome-agent-mcp/main/skills/agent-mcp-finder/SKILL.md
检查内容后，按当前 Agent 的官方安装方式安装 agent-mcp-finder，保留已有同名 Skill。
如果不支持 Skill，就直接读取索引。安装后用一个查询验证能否找到官方服务，说明结果；这不代表服务已接通。
```

**接下来会发生什么？** Agent 先核对适用对象、账号和费用门槛，再按你的授权接入；你完成本地登录或填写 Key 后，它应报告实际连接验证结果。已核验仅代表官方身份，缺少信息不代表免费、即装即用或没有官方接入。

<a id="toc"></a>

## 目录

- [出行和生活](#cat-life)（15）
- [办公和协作](#cat-office)（15）
- [笔记、阅读和网盘](#cat-notes)（8）
- [搜索、内容和企业数据](#cat-search)（9）
- [设计和创作](#cat-design)（10）
- [支付和金融](#cat-finance)（7）
- [云和开发](#cat-cloud)（41）

<a id="cat-life"></a>

## 出行和生活

| 服务 | 能做什么 | 类型 | 权限 | 门槛 | 状态 |
| :-- | :-- | :-- | :-- | :-- | :-- |
| [高德地图](https://developer.amap.com/api/mcp-server/summary) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/amap/) | 地点与天气查询、路线规划、地图生成和地图开发。 | MCP · Skill · CLI | 🟢 只读查询 | 需授权账号、需 API Key | ✅ 已核验 |
| [百度地图](https://lbs.baidu.com/docs/ai?title=mcpserver/base) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/baidu-map/) | 地点检索、地理编码与路线规划。 | MCP | 🟢 只读查询 | 需 API Key | ✅ 已核验 |
| [腾讯地图](https://lbs.qq.com/service/MCPServer/MCPServerGuide/overview) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/tencent-map/) | 地点搜索、路线规划与位置服务。 | MCP | 🟢 只读查询 | 需 API Key | ✅ 已核验 |
| [滴滴](https://mcp.didichuxing.com/) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/didi/) | 叫车、估价与行程查询。 | MCP · Skill | 🔴 涉及资金 | 需授权账号、需 API Key | ✅ 已核验 |
| [美团](https://developer.meituan.com/ai-hub/mcp-list) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/meituan/) | 商家订单、团购核销、商品与库存管理及经营数据查询。 | MCP · Skill · CLI | 🔴 涉及资金 | 需授权账号、需 API Key、需申请开通 | ✅ 已核验 |
| [淘宝](https://tblifecdn.taobao.com/taobaopc/skills/taobao-native/SKILL.md) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/taobao/) | 商品搜索与购物，需安装桌面客户端。 | MCP · Skill | 🔴 涉及资金 | 需桌面客户端、需授权账号 | ✅ 已核验 |
| [麦当劳中国](https://open.mcd.cn/mcp/doc) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/mcdonalds-cn/) | 点餐、门店与优惠查询。 | MCP | 🔴 涉及资金 | 需授权账号、需 API Key | ✅ 已核验 |
| [瑞幸](https://open.lkcoffee.com/docs) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/luckin/) | 咖啡点单与门店查询。 | MCP · Skill · CLI | 🔴 涉及资金 | 需授权账号、需 API Key | ✅ 已核验 |
| [飞猪](https://github.com/alibaba-flyai/flyai-skill) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/fliggy/) | 机票、酒店和景点搜索，返回价格与预订跳转链接。 | Skill · CLI | 🟢 只读查询 | 免费可用 | ✅ 已核验 |
| [同程商旅](https://tmc.ly.com/zh/resources/updates/open-mcp-skills-cli) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/ly-tmc/) | 企业差旅资源查询、差旅政策校验与方案推荐。 | MCP · Skill · CLI | 🟢 只读查询 | 需授权账号、需申请开通 | ✅ 已核验 |
| [彩云天气](https://github.com/caiyunapp/mcp-caiyun-weather) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/caiyun-weather/) | 查询实时天气、逐小时预报、空气质量与天气预警。 | MCP | 🟢 只读查询 | 需 API Key | ✅ 已核验 |
| [飞常准](https://ai.variflight.com/zh/docs/aviation) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/variflight/) | 查询航班动态、中转方案、机票价格、机场天气与飞机位置。 | MCP | 🟢 只读查询 | 需 API Key、需授权账号、需会员或付费 | ✅ 已核验 |
| [途牛](https://open.tuniu.com/mcp/docs/guide/mcp-auth.html) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/tuniu/) | 搜索并预订酒店、机票、火车票、门票、邮轮与度假产品。 | MCP · Skill · CLI | 🔴 涉及资金 | 需授权账号、需 API Key | ✅ 已核验 |
| [快递100](https://api.kuaidi100.com/document/how-to-use-mcp-service) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/kuaidi100/) | 查询物流轨迹、预估运费与时效，并支持获授权的上门取件下单。 | MCP · Skill | 🔴 涉及资金 | 需 API Key、需授权账号、需申请开通 | ✅ 已核验 |
| [携程商旅](https://openapi.ctripbiz.com/#/advertise/mcp) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/ctrip-business/) | 查询差旅政策、机票酒店与行程方案，读取差旅和合规数据。 | MCP | 🟢 只读查询 | 需授权账号、需申请开通 | ✅ 已核验 |

<sub>[↑ 回到目录](#toc)</sub>

<a id="cat-office"></a>

## 办公和协作

| 服务 | 能做什么 | 类型 | 权限 | 门槛 | 状态 |
| :-- | :-- | :-- | :-- | :-- | :-- |
| [飞书](https://github.com/larksuite/cli) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/feishu/) | 消息、文档、日历与多维表格。 | MCP · Skill · CLI | 🟡 可执行操作 | 需授权账号 | ✅ 已核验 |
| [钉钉](https://open.dingtalk.com/document/ai-dev/dingtalk-server-api-mcp-overview) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/dingtalk/) | 消息、文档、表格、日志、日历与待办的查询和操作。 | MCP · CLI | 🟡 可执行操作 | 需授权账号、需 API Key | ✅ 已核验 |
| [企业微信](https://work.weixin.qq.com/nl/index/aicli) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/wecom/) | 企业消息、通讯录与办公应用。 | MCP · Skill · CLI | 🟡 可执行操作 | 需授权账号、需 API Key | ✅ 已核验 |
| [腾讯文档](https://docs.qq.com/open/document/mcp/) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/tencent-docs/) | 在线文档与表格的读取和编辑。 | MCP · Skill | 🟡 可执行操作 | 需授权账号、免费可用 | ✅ 已核验 |
| [腾讯会议](https://cloud.tencent.com/document/product/1095/133826) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/tencent-meeting/) | 预约和管理会议，读取参会信息、录制、转写与纪要。 | MCP · Skill · CLI | 🟡 可执行操作 | 需授权账号 | ✅ 已核验 |
| [WPS](https://open.wps.cn/documents/app-integration-dev/mcp-server/introduction) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/wps/) | 通过 WPS 365 API 查询和操作企业文档及协作数据。 | MCP | 🟡 可执行操作 | 需授权账号、需申请开通 | ✅ 已核验 |
| [金山文档](https://mp.weixin.qq.com/s/7-u1JnWMiChmjiSFu-zlaA) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/kdocs/) | 搜索、读取和整理云文档，生成文档内容。 | Skill | 🟡 可执行操作 | 需授权账号 | ✅ 已核验 |
| [语雀](https://github.com/yuque/yuque-mcp-server) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/yuque/) | 知识库与文档的读写。 | MCP | 🟡 可执行操作 | 需授权账号、需 API Key | ✅ 已核验 |
| [Agently Mail（QQ 邮箱团队）](https://github.com/Tencent/AgentlyMail) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/qq-mail/) | 专供 Agent 的邮箱，支持邮件收发、搜索、整理和附件操作。 | Skill · CLI | 🟡 可执行操作 | 需授权账号 | ✅ 已核验 |
| [腾讯乐享](https://github.com/tencent-lexiang/lexiang-mcp-skill) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/lexiang/) | 搜索和编辑知识库文档、智能表格，管理文件并导入会议资料。 | MCP · Skill | 🟡 可执行操作 | 需授权账号、需 API Key | ✅ 已核验 |
| [TextIn](https://www.textin.com/news/20250707161156842) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/textin/) | 识别图片与文档文字，提取字段表格，并把文档转换为 Markdown。 | MCP | 🟢 只读查询 | 需 API Key | ✅ 已核验 |
| [MinerU](https://github.com/opendatalab/MinerU-Ecosystem) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/mineru/) | 将 PDF、Office、图片与网页解析为 Markdown 和结构化数据。 | MCP · Skill · CLI | 🟡 可执行操作 | 免费可用、需 API Key | ✅ 已核验 |
| [滴答清单](https://help.dida365.com/articles/7438132116019216384) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/dida/) | 查询和管理任务、清单、习惯、专注记录与纪念日。 | MCP · CLI | 🟡 可执行操作 | 需授权账号 | ✅ 已核验 |
| [飞书项目](https://project.feishu.cn/b/helpcenter/1ykiuvvj/wzb3ycsc) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/feishu-project/) | 按账号权限查询和更新项目、工作项及相关项目数据。 | MCP | 🟡 可执行操作 | 需授权账号 | ✅ 已核验 |
| [腾讯 TAPD](https://cloud.tencent.com/developer/mcp/server/11474) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/tapd/) | 查询和管理需求、任务、缺陷、迭代及评论。 | MCP | 🟡 可执行操作 | 需授权账号、需 API Key | ✅ 已核验 |

<sub>[↑ 回到目录](#toc)</sub>

<a id="cat-notes"></a>

## 笔记、阅读和网盘

| 服务 | 能做什么 | 类型 | 权限 | 门槛 | 状态 |
| :-- | :-- | :-- | :-- | :-- | :-- |
| [微信读书](https://weread.qq.com/r/weread-skills) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/weread/) | 书架、笔记与划线。 | Skill | 🟢 只读查询 | 需授权账号、需 API Key | ✅ 已核验 |
| [腾讯 ima](https://ima.qq.com/agent-interface) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/ima/) | 个人知识库的搜索与读写。 | Skill | 🟡 可执行操作 | 需授权账号、需 API Key | ✅ 已核验 |
| [flomo](https://help.flomoapp.com/advance/mcp/) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/flomo/) | 卡片笔记的记录与检索。 | MCP | 🟡 可执行操作 | 需授权账号、需会员或付费 | ✅ 已核验 |
| [印象笔记](https://guide.yinxiang.com/docs/yxai/skill.html) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/yinxiang/) | 笔记的创建、搜索与整理。 | Skill | 🟡 可执行操作 | 需授权账号、需会员或付费 | ✅ 已核验 |
| [有道云笔记](https://note.youdao.com/help-center/skill-guide.html) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/youdao-note/) | 笔记读写与搜索、待办管理和网页剪藏。 | Skill · CLI | 🟡 可执行操作 | 需授权账号、需 API Key | ✅ 已核验 |
| [夸克网盘](https://www.quark.cn/documents/help/quark-drive-skill) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/quark-drive/) | 网盘文件的搜索与管理。 | Skill | 🟡 可执行操作 | 需授权账号 | ✅ 已核验 |
| [腾讯微云](https://www.weiyun.com/act/openclaw) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/weiyun/) | 网盘文件的搜索与管理。 | Skill | 🟡 可执行操作 | 需授权账号、需 API Key | ✅ 已核验 |
| [百度网盘](https://pan.baidu.com/union/doc/mcp-server/使用概述/) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/baidu-netdisk/) | 网盘文件的搜索、上传与管理。 | MCP | 🟡 可执行操作 | 需授权账号 | ✅ 已核验 |

<sub>[↑ 回到目录](#toc)</sub>

<a id="cat-search"></a>

## 搜索、内容和企业数据

| 服务 | 能做什么 | 类型 | 权限 | 门槛 | 状态 |
| :-- | :-- | :-- | :-- | :-- | :-- |
| [知乎](https://developer.zhihu.com/docs?key=zhihu_cli) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/zhihu/) | 搜索知乎与全网、读取热榜和个人内容，检索与上传知识库文件。 | MCP · Skill · CLI | 🟡 可执行操作 | 需授权账号、需 API Key | ✅ 已核验 |
| [企查查](https://agent.qcc.com/guide) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/qcc/) | 企业工商与风险信息查询。 | MCP · CLI | 🟢 只读查询 | 需授权账号、需 API Key | ✅ 已核验 |
| [天眼查](https://github.com/tyc-tech/tyc-cli) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/tianyancha/) | 企业工商与关系信息查询。 | MCP · Skill · CLI | 🟢 只读查询 | 需授权账号 | ✅ 已核验 |
| [抖音开放平台](https://developer.open-douyin.com/docs/resource/zh-CN/dop/ability/mcp-service/mcp-service-desc) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/douyin-open/) | 接入抖音官方视频与图文搜索、跳转链接和经营任务等能力。 | MCP | 🟡 可执行操作 | 需授权账号、需申请开通 | ✅ 已核验 |
| [巨量引擎](https://open.oceanengine.com/mcp?app_id=1841425772187712) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/oceanengine/) | 查询授权的巨量广告账户、投放指标与报表数据。 | MCP | 🟢 只读查询 | 需授权账号、需 API Key | ✅ 已核验 |
| [华宇元典](https://open.chineselaw.com/mcp-config/) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/yuandian/) | 检索法律法规、案例、企业和证券合规资料，并校验法律幻觉。 | MCP · Skill | 🟢 只读查询 | 需 API Key | ✅ 已核验 |
| [腾讯元宝搜索](https://cloud.tencent.com/developer/mcp/server/11764) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/yuanbao-search/) | 检索实时网页与垂直信息，可限定站点、时效和结果数量。 | MCP | 🟢 只读查询 | 需授权账号、需 API Key | ✅ 已核验 |
| [百度 AI 搜索](https://cloud.baidu.com/doc/BAIDU_AI_SEARCH/index.html) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/baidu-search/) | 搜索实时网页、图片和视频，并按站点或结果类型筛选。 | MCP | 🟢 只读查询 | 需授权账号 | ✅ 已核验 |
| [百度百科](https://cloud.baidu.com/product-s/qianfan_home) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/baidu-baike/) | 查询百科词条义项、详情和秒懂百科视频。 | MCP | 🟢 只读查询 | 见独立页说明 | ✅ 已核验 |

<sub>[↑ 回到目录](#toc)</sub>

<a id="cat-design"></a>

## 设计和创作

| 服务 | 能做什么 | 类型 | 权限 | 门槛 | 状态 |
| :-- | :-- | :-- | :-- | :-- | :-- |
| [墨刀](https://modao.cc/feature/ai-mcp.html) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/modao/) | 生成和修改原型、PRD、应用与图片，读取并导出已有原型。 | MCP | 🟡 可执行操作 | 需授权账号、需 API Key | ✅ 已核验 |
| [可灵](https://github.com/klingai-tech/skills) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/kling/) | AI 视频与图片生成。 | Skill · CLI | 🟡 可执行操作 | 需授权账号 | ✅ 已核验 |
| [MiniMax](https://github.com/MiniMax-AI/MiniMax-MCP) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/minimax/) | 语音合成与克隆、图片和视频生成，CLI 另提供文本与搜索。 | MCP · Skill · CLI | 🟡 可执行操作 | 需授权账号、需 API Key、需会员或付费 | ✅ 已核验 |
| [网易云音乐](https://music.163.com/st/ncmcli) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/netease-music/) | 音乐搜索与播放、歌单管理、网盘上传和图文笔记发布。 | Skill · CLI | 🟡 可执行操作 | 需授权账号、需 API Key | ✅ 已核验 |
| [AntV](https://github.com/antvis/mcp-server-chart) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/antv/) | 把结构化数据生成为图表，并按分析场景选择适合的可视化形式。 | MCP · Skill | 🟡 可执行操作 | 免费可用 | ✅ 已核验 |
| [美图 MeituHub](https://www.meituhub.com/zh-cn/docs?id=150) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/meituhub/) | 用命令行调用图片、视频和音频创作能力，支持本地批量处理。 | CLI | 🟡 可执行操作 | 需 API Key、需会员或付费 | ✅ 已核验 |
| [腾讯混元生图](https://cloud.tencent.com/developer/mcp/server/11765) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/hunyuan-image/) | 生成图片、图生图、扩图与清晰度增强。 | MCP | 🟡 可执行操作 | 需授权账号、需 API Key | ✅ 已核验 |
| [火山引擎 veImageX](https://github.com/volcengine/mcp-server/tree/main/server/mcp_server_veimagex) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/volc-veimagex/) | 查询和上传图片资产，生成图片、增强画质、扩图与文字识别。 | MCP | 🟡 可执行操作 | 需授权账号、需 API Key | ✅ 已核验 |
| [阿里云智能媒体服务 IMS](https://skills.aliyun.com/skills/alibabacloud-video-translation) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/aliyun-ims/) | 提取视频字幕并翻译，支持语音合成和配音替换。 | Skill | 🟡 可执行操作 | 需授权账号 | ✅ 已核验 |
| [火山引擎视频点播](https://docs.volcengine.com/docs/video_on_demand/VODMCPAccessGuide) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/volcengine-vod/) | 通过 MCP 裁剪、拼接视频，添加字幕并处理媒资。 | MCP | 🟡 可执行操作 | 需授权账号、需 API Key | ✅ 已核验 |

<sub>[↑ 回到目录](#toc)</sub>

<a id="cat-finance"></a>

## 支付和金融

| 服务 | 能做什么 | 类型 | 权限 | 门槛 | 状态 |
| :-- | :-- | :-- | :-- | :-- | :-- |
| [支付宝](https://aipay.alipay.com/merchant-guide) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/alipay/) | 支付授权、交易支付与状态查询，辅助应用收款接入。 | Skill · CLI | 🔴 涉及资金 | 需授权账号 | ✅ 已核验 |
| [微信支付](https://pay.weixin.qq.com/doc/v3/merchant/4019638116) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/wechat-pay/) | 提供支付接入指导、工程编码与查单排障；读资料无需商户凭据，真实查单需授权。 | Skill · CLI | 🟡 可执行操作 | 见独立页说明 | ✅ 已核验 |
| [银联](https://open.unionpay.com/tjweb/solution/detail?solId=613) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/unionpay/) | 让智能体通过 MCP 接入银联支付服务。 | MCP | 🔴 涉及资金 | 需授权账号、需申请开通 | ✅ 已核验 |
| [同花顺 iFinD](https://mcp.51ifind.com/) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/ifind/) | 查询行情、财务、公告、宏观等金融数据。 | MCP · Skill | 🟢 只读查询 | 需授权账号、需 API Key、需会员或付费 | ✅ 已核验 |
| [同花顺问财](https://search.10jqka.com.cn/skillhub) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/iwencai/) | 通过官方技能查询行情、公告、研报和宏观数据，进行条件筛选。 | Skill · CLI | 🟢 只读查询 | 需授权账号、需 API Key | ✅ 已核验 |
| [东方财富妙想](https://ai.eastmoney.com/skills) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/eastmoney-miaoxiang/) | 金融资讯与数据分析、选股，以及自选和模拟组合管理。 | Skill | 🟡 可执行操作 | 需授权账号、需 API Key | ✅ 已核验 |
| [国信证券小信](https://www.guosen.com.cn/gs/xxskills/index.html) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/guosen/) | 查询宏观、行情与财务数据，进行基金对比、选股和 ETF 筛选。 | Skill | 🟢 只读查询 | 需授权账号、需 API Key | ✅ 已核验 |

<sub>[↑ 回到目录](#toc)</sub>

<a id="cat-cloud"></a>

## 云和开发

| 服务 | 能做什么 | 类型 | 权限 | 门槛 | 状态 |
| :-- | :-- | :-- | :-- | :-- | :-- |
| [阿里云](https://help.aliyun.com/zh/openapi/user-guide/openapi-mcp-server-guide) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/aliyun/) | 通过 MCP 与官方 Skill 查询、诊断和管理云资源。 | MCP · Skill | 🔴 涉及资金 | 需授权账号 | ✅ 已核验 |
| [腾讯云](https://cloud.tencent.com/document/product/1278/131433) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/tencent-cloud/) | 云资源查询与管理。 | Skill · CLI | 🟡 可执行操作 | 需授权账号 | ✅ 已核验 |
| [华为云](https://github.com/huaweicloud/huaweicloud-mcp) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/huawei-cloud/) | 云资源查询与管理。 | MCP · Skill | 🔴 涉及资金 | 需授权账号、需 API Key | ✅ 已核验 |
| [火山引擎](https://github.com/volcengine/mcp-server) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/volcengine/) | 通过 MCP、ve CLI 与产品 Skill 查询、诊断、部署和管理云资源。 | MCP · Skill · CLI | 🔴 涉及资金 | 需授权账号、需 API Key | ✅ 已核验 |
| [百度智能云](https://ai.baidu.com/ai-doc/REFERENCE/mm9tjwod0) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/baidu-cloud/) | 通过 MCP 与 Skill 使用文字识别、文档解析、搜索、图像和语音能力。 | MCP · Skill | 🟡 可执行操作 | 需授权账号、需 API Key | ✅ 已核验 |
| [七牛云](https://github.com/qiniu/qiniu-mcp-server) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/qiniu/) | 对象存储读写、图片处理、CDN 刷新预取与直播管理。 | MCP | 🟡 可执行操作 | 需授权账号、需 API Key | ✅ 已核验 |
| [智谱](https://docs.bigmodel.cn/cn/coding-plan/mcp/search-mcp-server) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/zhipu/) | 联网搜索与实时信息检索，面向 GLM Coding Plan 用户。 | MCP | 🟢 只读查询 | 需授权账号、需会员或付费、需 API Key | ✅ 已核验 |
| [Gitee](https://gitee.com/oschina/mcp-gitee) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/gitee/) | 代码仓库、Issue 与 PR 管理。 | MCP | 🟡 可执行操作 | 需授权账号、需 API Key | ✅ 已核验 |
| [极狐 GitLab](https://docs.gitlab.cn/docs/jh/user/model_context_protocol/mcp_server/) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/jihulab/) | 代码仓库与 DevOps 管理。 | MCP | 🟡 可执行操作 | 需授权账号 | ✅ 已核验 |
| [腾讯 EdgeOne Makers](https://edgeone.cloud.tencent.com/pages/document/173172415568367616) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/edgeone-makers/) | 部署静态网站、全栈应用与 Agent 项目，并生成公开访问链接。 | MCP · Skill · CLI | 🟡 可执行操作 | 需授权账号 | ✅ 已核验 |
| [Apifox](https://docs.apifox.com/apifox-mcp-server) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/apifox/) | 读取接口文档，并通过命令行运行接口测试。 | MCP · CLI | 🟡 可执行操作 | 见独立页说明 | ✅ 已核验 |
| [Sealos](https://sealos.io/docs/AI/mcp/) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/sealos/) | 创建开发环境，管理数据库，查询账单、性能监控与日志。 | MCP | 🟡 可执行操作 | 需授权账号 | ✅ 已核验 |
| [腾讯云开发 CloudBase](https://docs.cloudbase.net/ai/cloudbase-ai-toolkit/) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/cloudbase/) | 管理云数据库、云函数、存储和应用部署，并提供开发工作流。 | MCP · Skill · CLI | 🟡 可执行操作 | 需授权账号 | ✅ 已核验 |
| [Milvus／Zilliz](https://milvus.io/docs/milvus_and_mcp.md) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/milvus/) | 检索向量数据，查询数据库结构，并管理集合和数据。 | MCP | 🟡 可执行操作 | 见独立页说明 | ✅ 已核验 |
| [API7 APISIX](https://docs.api7.ai/apisix/reference/apisix-mcp) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/apisix/) | 查询和管理 API 网关路由、上游、插件、消费者与证书配置。 | MCP | 🟡 可执行操作 | 需 API Key | ✅ 已核验 |
| [Higress](https://github.com/higress-group/higress-ops-mcp-server) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/higress/) | 通过 MCP 查询和管理 Higress 网关的路由、服务与配置。 | MCP | 🟡 可执行操作 | 需授权账号 | ✅ 已核验 |
| [乐鑫 ESP RainMaker](https://mcp.espressif.com/) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/esp-rainmaker/) | 查询和控制物联网设备，设置设备参数并管理自动化日程。 | MCP | 🟡 可执行操作 | 需授权账号 | ✅ 已核验 |
| [TiDB](https://docs.pingcap.com/zh/ai/tidb-mcp-claude-desktop/) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/tidb/) | 用自然语言查询和修改数据库，管理表结构与数据库用户。 | MCP | 🟡 可执行操作 | 见独立页说明 | ✅ 已核验 |
| [腾讯云代码分析 TCA](https://cloud.tencent.com/developer/mcp/server/11709) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/tencent-tca/) | 发起代码分析，查询代码质量、安全缺陷与分析报告。 | MCP | 🟡 可执行操作 | 需授权账号、需 API Key、需申请开通 | ✅ 已核验 |
| [腾讯 TDesign](https://cloud.tencent.com/developer/mcp/server/11721) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/tdesign/) | 检索组件列表、文档、DOM 结构和版本变更，辅助界面开发。 | MCP | 🟢 只读查询 | 免费可用 | ✅ 已核验 |
| [腾讯 CODING DevOps](https://cloud.tencent.com/developer/mcp/server/11722) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/coding/) | 管理研发项目、工作项、代码仓库与合并请求。 | MCP | 🟡 可执行操作 | 需授权账号、需 API Key | ✅ 已核验 |
| [腾讯 DNSPod](https://cloud.tencent.com/developer/mcp/server/11743) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/dnspod/) | 查询与管理 DNS 域名，读取解析记录和解析用量。 | MCP | 🟡 可执行操作 | 需授权账号、需 API Key | ✅ 已核验 |
| [腾讯 WeData 指标语义层](https://cloud.tencent.com/developer/mcp/server/11763) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/tencent-wedata/) | 通过企业元数据与语义层检索数据资产和查询业务数据。 | MCP | 🟢 只读查询 | 需授权账号、需 API Key、需申请开通 | ✅ 已核验 |
| [腾讯云对象存储 COS](https://github.com/Tencent/cos-mcp) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/tencent-cos/) | 上传、下载和检索云端文件，处理图片、视频与文档。 | MCP | 🟡 可执行操作 | 需授权账号、需 API Key | ✅ 已核验 |
| [腾讯云日志服务 CLS](https://cloud.tencent.com/document/product/614/118699) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/tencent-cls/) | 搜索和分析日志、查询监控指标与告警记录。 | MCP | 🟢 只读查询 | 需授权账号、需 API Key | ✅ 已核验 |
| [火山引擎 ByteHouse](https://github.com/volcengine/mcp-server/tree/main/server/mcp_server_bytehouse) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/volc-bytehouse/) | 查询数据库与表结构，执行数据查询及 DML、DDL 语句。 | MCP | 🟡 可执行操作 | 需授权账号、需 API Key | ✅ 已核验 |
| [火山引擎 veFaaS Browser-Use](https://github.com/volcengine/mcp-server/tree/main/server/mcp_server_vefaas_browser_use) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/volc-browser-use/) | 发起云端浏览器操作任务，查询任务状态和结果。 | MCP | 🟡 可执行操作 | 需授权账号 | ✅ 已核验 |
| [讯飞云](https://www.xfyun.cn/xfyun-cli/doc) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/xfyun/) | 管理讯飞应用与用量，调用语音、OCR、翻译、图片和数字人等能力。 | Skill · CLI | 🟡 可执行操作 | 需授权账号 | ✅ 已核验 |
| [阿里云百炼](https://docs.agent.bailian.aliyun.com/en/bailian-cli/getting-started/installation) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/aliyun-bailian/) | 调用图像、视频等模型能力，管理百炼应用、任务和平台资源。 | Skill · CLI | 🟡 可执行操作 | 需授权账号 | ✅ 已核验 |
| [阿里云日志服务 SLS](https://help.aliyun.com/en/sls/sls-mcp-server) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/aliyun-sls/) | 检索日志项目与 LogStore，查询分析日志并诊断告警。 | MCP | 🟢 只读查询 | 需授权账号 | ✅ 已核验 |
| [阿里云 DMS Agent 数据网关](https://help.aliyun.com/zh/dms/use-cases/migrate-from-dms-mcp-to-agent-data-gateway-mcp) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/aliyun-dms/) | 发现数据库资产、查询权限与知识，按授权执行 SQL。 | MCP | 🟡 可执行操作 | 需授权账号 | ✅ 已核验 |
| [阿里云对象存储 OSS](https://help.aliyun.com/zh/oss/developer-reference/oss-mcp-server-alpha) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/aliyun-oss/) | 通过 MCP 查询 OSS 存储空间列表、属性、容量与文件数量。 | MCP | 🟢 只读查询 | 需授权账号、需 API Key | ✅ 已核验 |
| [OceanBase](https://github.com/oceanbase/awesome-oceanbase-mcp/tree/main/src/oceanbase_mcp_server) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/oceanbase/) | 执行数据库 SQL，查询租户与诊断信息，并支持全文、向量检索及可选记忆管理。 | MCP | 🟡 可执行操作 | 见独立页说明 | ✅ 已核验 |
| [腾讯云数据库 PostgreSQL](https://developer.cloud.tencent.com/mcp/server/11830) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/tencent-postgresql/) | 查询与管理 PostgreSQL 云实例、数据库、备份及监控，并提供运维诊断 Skill。 | MCP · Skill | 🔴 涉及资金 | 需授权账号、需 API Key | ✅ 已核验 |
| [腾讯云向量数据库 VectorDB](https://cloud.tencent.com/developer/mcp/server/11771) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/tencent-vectordb/) | 查询向量数据库实例列表、安全组和维护时间窗。 | MCP | 🟢 只读查询 | 需授权账号、需 API Key | ✅ 已核验 |
| [腾讯云消息队列 CKafka](https://cloud.tencent.com/developer/mcp/server/11776) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/tencent-ckafka/) | 查询 CKafka 主题、消息、消费分组及实例信息。 | MCP | 🟢 只读查询 | 需授权账号、需 API Key | ✅ 已核验 |
| [腾讯云数据库 Redis](https://cloud.tencent.com/developer/mcp/server/11755) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/tencent-redis/) | 查询 Redis 实例、备份和慢日志，创建实例及管理参数与安全组。 | MCP | 🔴 涉及资金 | 需授权账号、需 API Key | ✅ 已核验 |
| [阿里云 RDS Copilot](https://skills.aliyun.com/skills/alibabacloud-rds-copilot) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/aliyun-rds-copilot/) | 查询 RDS 运维知识、SQL 优化建议和故障诊断结果。 | Skill | 🟢 只读查询 | 需授权账号 | ✅ 已核验 |
| [阿里云 PAI-DLC](https://skills.aliyun.com/skills/alibabacloud-pai-dlc-job) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/aliyun-pai-dlc/) | 创建、查询、更新和停止分布式训练任务，查看日志、事件与计算健康检查。 | Skill | 🔴 涉及资金 | 需授权账号 | ✅ 已核验 |
| [阿里云 DataWorks](https://skills.aliyun.com/skills/alibabacloud-dataworks-datastudio-develop) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/aliyun-dataworks/) | 创建、配置和发布数据开发节点与工作流，管理资源和 UDF。 | Skill | 🟡 可执行操作 | 需授权账号 | ✅ 已核验 |
| [阿里云 Lindorm](https://skills.aliyun.com/skills/alibabacloud-lindorm-agent-skill) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/aliyun-lindorm/) | 管理多模数据库实例，分析监控、性能和连接问题，辅助 SQL 与检索开发。 | Skill | 🔴 涉及资金 | 需授权账号 | ✅ 已核验 |

<sub>[↑ 回到目录](#toc)</sub>

## 图例

- **类型**：`MCP` 是 Agent 调用外部服务的标准接口；`Skill` 是教 Agent 使用某个服务的说明文档；`CLI` 是 Agent 可以直接调用的命令行工具。
- **权限**：🟢 只读查询，只查不改；🟡 可执行操作，会创建或修改数据；🔴 涉及资金，可能下单或付款，务必让人最后确认。
- **状态**：✅ 已核验，确认为厂商官方出品并留有证据；⏳ 待核验，来自公开整理，还没逐条确认。

## 收录标准

1. 由服务厂商官方发布：链接在厂商自己的域名，或在厂商官方的 GitHub 组织下。
2. 面向国内用户的服务，能被 Agent 通过 MCP、Skill 或 CLI 调用。
3. 第三方平台转载、社区封装、逆向接口一律不收。
4. 官方出品之外，满足上市公司或其控股子公司、国内官方 App 评分数 ≥ 10,000、官方开源主仓库 star ≥ 10,000，或维护者点名收录（Gitee、极狐 GitLab、Apifox）之一。

详细流程见 [docs/VERIFYING.md](docs/VERIFYING.md)。发现遗漏或错误？[提交服务](https://github.com/guanmo-ai/awesome-agent-mcp/issues/new?template=submit.yml) 或 [报告问题](https://github.com/guanmo-ai/awesome-agent-mcp/issues/new?template=correction.yml)。

<a id="disclaimer"></a>

## 使用说明与免责声明

本项目是独立的社区信息索引，仅收集整理公开资料与接入线索供参考，不提供或运营所列第三方服务。收录、排序、链接及图标展示不代表与厂商存在隶属、合作或授权关系，也不构成推荐、背书或担保。

“官方已核验”仅表示在标注日期依据公开来源核对了发布者身份，不代表全部功能已实测、安全审计通过或厂商认可本项目。资料与示例按现状提供，可能有错误、遗漏或过时；我们尽力核对，但不保证其准确性、完整性、时效性、安全性、兼容性、持续可用性或适合特定用途。

使用前，请自行核对厂商最新官方文档、代码及安装脚本、账号资格、权限、费用和配额，并遵守适用法律及第三方的服务条款、许可证与隐私政策。第三方网站、软件和服务由相应提供方负责，可能随时变更或停止；本项目的 MIT 许可不适用于这些第三方内容。

提示词、配置示例和 Agent 生成结果仅为辅助，不替代你的判断与授权。请检查实际执行内容，以最小权限验证，妥善保管密钥并备份重要数据；不要向本站或公开 Issue 提交凭据、个人隐私或机密数据。下单、付款等涉及资金的操作须由你最终确认。

你应自行判断是否使用相关信息或服务，并承担相应使用风险。在适用法律允许的范围内，本项目维护者及贡献者不对因依赖本索引或使用第三方服务造成的损失承担责任，包括费用、数据丢失、业务中断或其他损失；本声明不排除或限制依法不得排除或限制的责任。

服务名称、图标与商标归各自权利人所有，仅用于识别。发现错误、失效链接或权利问题，请通过仓库 Issue 提供公开证据或问题链接，我们会核查并视情况更正或移除；请勿在反馈中披露敏感信息。

[纠错与权利问题反馈](https://github.com/guanmo-ai/awesome-agent-mcp/issues/new?template=correction.yml)

## 许可

代码使用 [MIT](LICENSE) 许可。各服务的名称与商标归各自厂商所有。由 [观默 @guanmo_ai](https://x.com/guanmo_ai) 发起与维护。
