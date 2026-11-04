<!-- 本文件由 scripts/build.mjs 根据 data/services.json 自动生成，请改数据后运行 npm run build，不要手改。 -->

<h1 align="center">Awesome Agent MCP</h1>

<p align="center"><b>国内官方 MCP · Skill · CLI 大全</b><br>让你的 Agent 接上高德、飞书、美团、支付宝……只收厂商官方出品，人看网页，AI 读 llms.txt。</p>

<p align="center">
  <a href="https://guanmo-ai.github.io/awesome-agent-mcp/"><b>打开卡片网站 ↗</b></a> &nbsp;·&nbsp;
  <a href="#for-ai">给 AI 用</a> &nbsp;·&nbsp;
  <a href="https://github.com/guanmo-ai/awesome-agent-mcp/issues/new?template=submit.yml">提交服务</a> &nbsp;·&nbsp;
  <a href="https://x.com/guanmo_ai">关注 @guanmo_ai</a>
</p>

<p align="center"><sub>94 个服务 · 7 个分类 · 92 个已核验 · 更新于 2026-11-04</sub></p>

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

- [出行和生活](#cat-life)（14）
- [办公和协作](#cat-office)（18）
- [笔记、阅读和网盘](#cat-notes)（9）
- [搜索、内容和企业数据](#cat-search)（11）
- [设计和创作](#cat-design)（12）
- [支付和金融](#cat-finance)（8）
- [云和开发](#cat-cloud)（22）

<a id="cat-life"></a>

## 出行和生活

| 服务 | 能做什么 | 类型 | 权限 | 门槛 | 状态 |
| :-- | :-- | :-- | :-- | :-- | :-- |
| [高德地图](https://developer.amap.com/api/mcp-server/summary) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/amap/) | 地点与天气查询、路线规划、地图生成和地图开发。 | MCP · Skill · CLI | 🟢 只读查询 | 需 API Key | ✅ 已核验 |
| [百度地图](https://lbs.baidu.com/docs/ai?title=mcpserver/base) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/baidu-map/) | 地点检索、地理编码与路线规划。 | MCP | 🟢 只读查询 | 需 API Key | ✅ 已核验 |
| [腾讯地图](https://lbs.qq.com/service/MCPServer/MCPServerGuide/overview) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/tencent-map/) | 地点搜索、路线规划与位置服务。 | MCP | 🟢 只读查询 | 需 API Key | ✅ 已核验 |
| [滴滴](https://mcp.didichuxing.com/) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/didi/) | 叫车、估价与行程查询。 | MCP · Skill | 🔴 涉及资金 | 需授权账号、需 API Key | ✅ 已核验 |
| [美团](https://developer.meituan.com/ai-hub/mcp-list) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/meituan/) | 商家订单、团购核销、商品与库存管理及经营数据查询。 | MCP · Skill · CLI | 🔴 涉及资金 | 需授权账号、需申请开通 | ✅ 已核验 |
| [淘宝](https://tblifecdn.taobao.com/taobaopc/skills/taobao-native/SKILL.md) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/taobao/) | 商品搜索与购物，需安装桌面客户端。 | MCP · Skill | 🔴 涉及资金 | 需桌面客户端、需授权账号 | ✅ 已核验 |
| [麦当劳中国](https://open.mcd.cn/mcp/doc) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/mcdonalds-cn/) | 点餐、门店与优惠查询。 | MCP | 🔴 涉及资金 | 需授权账号、需 API Key | ✅ 已核验 |
| [瑞幸](https://open.lkcoffee.com/docs) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/luckin/) | 咖啡点单与门店查询。 | MCP · Skill · CLI | 🔴 涉及资金 | 需授权账号、需 API Key | ✅ 已核验 |
| [飞猪](https://github.com/alibaba-flyai/flyai-skill) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/fliggy/) | 机票、酒店和景点搜索，返回价格与预订跳转链接。 | Skill · CLI | 🟢 只读查询 | 免费可用 | ✅ 已核验 |
| [同程商旅](https://tmc.ly.com/zh/resources/updates/open-mcp-skills-cli) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/ly-tmc/) | 企业差旅资源查询、差旅政策校验与方案推荐。 | MCP · Skill · CLI | 🟢 只读查询 | 需授权账号、需申请开通 | ✅ 已核验 |
| [彩云天气](https://github.com/caiyunapp/mcp-caiyun-weather) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/caiyun-weather/) | 查询实时天气、逐小时预报、空气质量与天气预警。 | MCP | 🟢 只读查询 | 需 API Key | ✅ 已核验 |
| [飞常准](https://ai.variflight.com/zh/docs/aviation) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/variflight/) | 查询航班动态、中转方案、机票价格、机场天气与飞机位置。 | MCP | 🟢 只读查询 | 需 API Key、需授权账号、需会员或付费 | ✅ 已核验 |
| [途牛](https://open.tuniu.com/mcp/docs/guide/mcp-auth.html) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/tuniu/) | 搜索并预订酒店、机票、火车票、门票、邮轮与度假产品。 | MCP · Skill · CLI | 🔴 涉及资金 | 需授权账号、需 API Key | ✅ 已核验 |
| [快递100](https://api.kuaidi100.com/document/how-to-use-mcp-service) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/kuaidi100/) | 查询物流轨迹、预估运费与时效，并支持获授权的上门取件下单。 | MCP · Skill | 🔴 涉及资金 | 需 API Key、需授权账号、需申请开通 | ✅ 已核验 |

<sub>[↑ 回到目录](#toc)</sub>

<a id="cat-office"></a>

## 办公和协作

| 服务 | 能做什么 | 类型 | 权限 | 门槛 | 状态 |
| :-- | :-- | :-- | :-- | :-- | :-- |
| [飞书](https://github.com/larksuite/cli) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/feishu/) | 消息、文档、日历与多维表格。 | MCP · Skill · CLI | 🟡 可执行操作 | 需授权账号 | ✅ 已核验 |
| [钉钉](https://open.dingtalk.com/document/ai-dev/dingtalk-server-api-mcp-overview) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/dingtalk/) | 消息、文档、表格、日志、日历与待办的查询和操作。 | MCP | 🟡 可执行操作 | 需授权账号 | ✅ 已核验 |
| [企业微信](https://work.weixin.qq.com/nl/index/aicli) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/wecom/) | 企业消息、通讯录与办公应用。 | MCP · Skill · CLI | 🟡 可执行操作 | 需授权账号、需 API Key | ✅ 已核验 |
| [腾讯文档](https://docs.qq.com/open/document/mcp/) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/tencent-docs/) | 在线文档与表格的读取和编辑。 | MCP · Skill | 🟡 可执行操作 | 需授权账号、免费可用 | ✅ 已核验 |
| [腾讯会议](https://cloud.tencent.com/document/product/1095/133826) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/tencent-meeting/) | 预约和管理会议，读取参会信息、录制、转写与纪要。 | MCP · Skill · CLI | 🟡 可执行操作 | 需授权账号 | ✅ 已核验 |
| [WPS](https://open.wps.cn/documents/app-integration-dev/mcp-server/introduction) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/wps/) | 通过 WPS 365 API 查询和操作企业文档及协作数据。 | MCP | 🟡 可执行操作 | 需授权账号、需申请开通 | ✅ 已核验 |
| [金山文档](https://github.com/kdocs-app/kdocs-skill) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/kdocs/) | 在线文档的读取与协作。 | Skill · CLI | 🟡 可执行操作 | 需授权账号 | ⏳ 待核验 |
| [语雀](https://github.com/yuque/yuque-mcp-server) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/yuque/) | 知识库与文档的读写。 | MCP | 🟡 可执行操作 | 需授权账号、需 API Key | ✅ 已核验 |
| [Agently Mail（QQ 邮箱团队）](https://github.com/Tencent/AgentlyMail) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/qq-mail/) | 专供 Agent 的邮箱，支持邮件收发、搜索、整理和附件操作。 | Skill · CLI | 🟡 可执行操作 | 需授权账号 | ✅ 已核验 |
| [腾讯乐享](https://github.com/tencent-lexiang/lexiang-mcp-skill) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/lexiang/) | 搜索和编辑知识库文档、智能表格，管理文件并导入会议资料。 | MCP · Skill | 🟡 可执行操作 | 需授权账号、需 API Key | ✅ 已核验 |
| [TextIn](https://www.textin.com/news/20250707161156842) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/textin/) | 识别图片与文档文字，提取字段表格，并把文档转换为 Markdown。 | MCP | 🟢 只读查询 | 需 API Key | ✅ 已核验 |
| [MinerU](https://github.com/opendatalab/MinerU-Ecosystem) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/mineru/) | 将 PDF、Office、图片与网页解析为 Markdown 和结构化数据。 | MCP · Skill · CLI | 🟡 可执行操作 | 免费可用、需 API Key | ✅ 已核验 |
| [滴答清单](https://help.dida365.com/articles/7438132116019216384) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/dida/) | 查询和管理任务、清单、习惯、专注记录与纪念日。 | MCP · CLI | 🟡 可执行操作 | 需授权账号 | ✅ 已核验 |
| [飞书项目](https://project.feishu.cn/b/helpcenter/1ykiuvvj/wzb3ycsc) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/feishu-project/) | 按账号权限查询和更新项目、工作项及相关项目数据。 | MCP | 🟡 可执行操作 | 需授权账号 | ✅ 已核验 |
| [Doc2X](https://doc2x.noedgeai.com/help/en/api/doc2x-mcp.html) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/doc2x/) | 解析 PDF 和图片，提取公式表格，并导出 Markdown、Word 等文件。 | MCP · Skill | 🟡 可执行操作 | 需 API Key、需会员或付费 | ✅ 已核验 |
| [简道云](https://hc.finecloud.com/app/open/25090) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/jiandaoyun/) | 查询应用、表单数据和待办，并向获授权的表单新增数据。 | MCP | 🟡 可执行操作 | 需授权账号 | ✅ 已核验 |
| [金数据](https://open.jinshuju.net/mcp/) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/jinshuju/) | 查询、创建和修改表单，读写提交数据并上传图片与附件。 | MCP | 🟡 可执行操作 | 需授权账号 | ✅ 已核验 |
| [pushplus 推送加](https://www.pushplus.plus/doc/guide/mcp.html) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/pushplus/) | 向微信、邮箱等渠道推送消息，管理订阅设置并发起积分提现。 | MCP · Skill | 🔴 涉及资金 | 需授权账号、需 API Key | ✅ 已核验 |

<sub>[↑ 回到目录](#toc)</sub>

<a id="cat-notes"></a>

## 笔记、阅读和网盘

| 服务 | 能做什么 | 类型 | 权限 | 门槛 | 状态 |
| :-- | :-- | :-- | :-- | :-- | :-- |
| [微信读书](https://weread.qq.com/r/weread-skills) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/weread/) | 书架、笔记与划线。 | Skill | 🟢 只读查询 | 需授权账号、需 API Key | ✅ 已核验 |
| [腾讯 ima](https://ima.qq.com/agent-interface) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/ima/) | 个人知识库的搜索与读写。 | Skill | 🟡 可执行操作 | 需授权账号、需 API Key | ✅ 已核验 |
| [得到大脑（原 Get 笔记）](https://www.biji.com/openapi) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/get-biji/) | 笔记的记录与检索。 | MCP · Skill · CLI | 🟡 可执行操作 | 需授权账号、需会员或付费 | ✅ 已核验 |
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
| [博查搜索](https://github.com/BochaAI/bocha-search-mcp) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/bocha/) | 面向 AI 的中文网页搜索。 | MCP | 🟢 只读查询 | 需授权账号、需 API Key | ✅ 已核验 |
| [企查查](https://agent.qcc.com/guide) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/qcc/) | 企业工商与风险信息查询。 | MCP · CLI | 🟢 只读查询 | 需授权账号、需 API Key | ✅ 已核验 |
| [天眼查](https://github.com/tyc-tech/tyc-cli) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/tianyancha/) | 企业工商与关系信息查询。 | MCP · Skill · CLI | 🟢 只读查询 | 需授权账号 | ✅ 已核验 |
| [抖音开放平台](https://developer.open-douyin.com/docs/resource/zh-CN/dop/ability/mcp-service/mcp-service-desc) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/douyin-open/) | 接入抖音官方视频与图文搜索、跳转链接和经营任务等能力。 | MCP | 🟡 可执行操作 | 需授权账号、需申请开通 | ✅ 已核验 |
| [巨量引擎](https://open.oceanengine.com/mcp?app_id=1841425772187712) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/oceanengine/) | 查询授权的巨量广告账户、投放指标与报表数据。 | MCP | 🟢 只读查询 | 需授权账号、需 API Key | ✅ 已核验 |
| [AIHOT](https://aihot.news/agent?tab=mcp) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/aihot/) | 检索中文 AI 资讯、热点事件时间线及日报、周报和月报。 | MCP · Skill | 🟢 只读查询 | 免费可用 | ✅ 已核验 |
| [华宇元典](https://open.chineselaw.com/mcp-config/) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/yuandian/) | 检索法律法规、案例、企业和证券合规资料，并校验法律幻觉。 | MCP · Skill | 🟢 只读查询 | 需 API Key | ✅ 已核验 |
| [智慧芽](https://open.zhihuiya.com/devportal/guides/mcp-installation) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/patsnap/) | 检索专利与科技情报，并使用专利分析和研发研究工作流。 | MCP · Skill | 🟢 只读查询 | 需 API Key | ✅ 已核验 |
| [秘塔 AI 搜索](https://metaso.cn/search-api/playground) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/metaso/) | 搜索网页并读取内容，为研究和问答提供外部资料。 | MCP | 🟢 只读查询 | 需 API Key | ✅ 已核验 |
| [小牛翻译](https://github.com/NiuTrans/MCP-TextTranslation) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/niutrans/) | 翻译文本，并查询支持的语言名称与代码。 | MCP | 🟢 只读查询 | 需 API Key、免费可用 | ✅ 已核验 |

<sub>[↑ 回到目录](#toc)</sub>

<a id="cat-design"></a>

## 设计和创作

| 服务 | 能做什么 | 类型 | 权限 | 门槛 | 状态 |
| :-- | :-- | :-- | :-- | :-- | :-- |
| [MasterGo](https://mastergo.com/help/ai-features/magic-mcp.html) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/mastergo/) | 读取设计稿，辅助生成代码。 | MCP | 🟢 只读查询 | 需授权账号、需会员或付费、需 API Key | ✅ 已核验 |
| [墨刀](https://modao.cc/feature/ai-mcp.html) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/modao/) | 生成和修改原型、PRD、应用与图片，读取并导出已有原型。 | MCP | 🟡 可执行操作 | 需授权账号、需 API Key | ✅ 已核验 |
| [Pixso](https://pixso.net/developer/zh/mcp/remote-mcp.html) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/pixso/) | 读写设计稿、样式和变量，支持设计转代码与代码转设计。 | MCP · Skill | 🟡 可执行操作 | 需授权账号、需会员或付费 | ✅ 已核验 |
| [可灵](https://github.com/klingai-tech/skills) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/kling/) | AI 视频与图片生成。 | Skill · CLI | 🟡 可执行操作 | — | ⏳ 待核验 |
| [MiniMax](https://github.com/MiniMax-AI/MiniMax-MCP) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/minimax/) | 语音合成与克隆、图片和视频生成，CLI 另提供文本与搜索。 | MCP · Skill · CLI | 🟡 可执行操作 | 需授权账号、需 API Key、需会员或付费 | ✅ 已核验 |
| [网易云音乐](https://music.163.com/st/ncmcli) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/netease-music/) | 音乐搜索与播放、歌单管理、网盘上传和图文笔记发布。 | Skill · CLI | 🟡 可执行操作 | 需授权账号、需 API Key | ✅ 已核验 |
| [LibTV](https://github.com/libtv-labs/libtv-skills) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/libtv/) | 通过创作会话生成图片和视频，上传资料并查询和下载生成结果。 | Skill | 🟡 可执行操作 | 需 API Key | ✅ 已核验 |
| [Flova](https://www.flova.ai/zh-CN/docs/features/cli/) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/flova/) | 创建和续作视频项目，上传素材、推进创作、管理 Skill 并导出成片。 | MCP · Skill · CLI | 🟡 可执行操作 | 需授权账号、需会员或付费 | ✅ 已核验 |
| [Meshy](https://docs.meshy.ai/zh/webapp/plugins/deepseek-harness/introduction) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/meshy/) | 生成和编辑三维模型、纹理与动画，准备可打印的三维文件。 | MCP · Skill · CLI | 🟡 可执行操作 | 需授权账号、需 API Key、需会员或付费 | ✅ 已核验 |
| [AntV](https://github.com/antvis/mcp-server-chart) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/antv/) | 把结构化数据生成为图表，并按分析场景选择适合的可视化形式。 | MCP · Skill | 🟡 可执行操作 | 免费可用 | ✅ 已核验 |
| [AiPPT](https://open.aippt.cn/docs/zh/claw/docs.html) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/aippt/) | 从主题、文本、文档或链接生成演示文稿，并下载 PPTX 文件。 | Skill | 🟡 可执行操作 | 需申请开通、需 API Key | ✅ 已核验 |
| [美图 MeituHub](https://www.meituhub.com/zh-cn/docs?id=150) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/meituhub/) | 用命令行调用图片、视频和音频创作能力，支持本地批量处理。 | CLI | 🟡 可执行操作 | 需 API Key、需会员或付费 | ✅ 已核验 |

<sub>[↑ 回到目录](#toc)</sub>

<a id="cat-finance"></a>

## 支付和金融

| 服务 | 能做什么 | 类型 | 权限 | 门槛 | 状态 |
| :-- | :-- | :-- | :-- | :-- | :-- |
| [支付宝](https://aipay.alipay.com/merchant-guide) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/alipay/) | 支付授权、交易支付与状态查询，辅助应用收款接入。 | Skill · CLI | 🔴 涉及资金 | 需授权账号 | ✅ 已核验 |
| [微信支付](https://pay.weixin.qq.com/doc/v3/merchant/4019638116) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/wechat-pay/) | 支付接入开发指导、示例代码检索、接入评估与支付退款查单。 | Skill · CLI | 🟢 只读查询 | 需授权账号 | ✅ 已核验 |
| [银联](https://open.unionpay.com/tjweb/solution/detail?solId=613) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/unionpay/) | 让智能体通过 MCP 接入银联支付服务。 | MCP | 🔴 涉及资金 | — | ✅ 已核验 |
| [同花顺 iFinD](https://mcp.51ifind.com/) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/ifind/) | 查询行情、财务、公告、宏观等金融数据。 | MCP · Skill | 🟢 只读查询 | 需授权账号、需 API Key、需会员或付费 | ✅ 已核验 |
| [同花顺问财](https://search.10jqka.com.cn/skillhub) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/iwencai/) | 通过官方技能查询行情、公告、研报和宏观数据，进行条件筛选。 | Skill · CLI | 🟢 只读查询 | 需授权账号、需 API Key | ✅ 已核验 |
| [东方财富妙想](https://ai.eastmoney.com/skills) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/eastmoney-miaoxiang/) | 金融资讯与数据分析、选股，以及自选和模拟组合管理。 | Skill | 🟡 可执行操作 | 需授权账号、需 API Key | ✅ 已核验 |
| [熔岩](https://lava.ai-dolphin.com/subscribe/docs) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/lava/) | 查询 A 股个股与概念板块的消息热度、机构覆盖和首提线索。 | MCP · Skill | 🟢 只读查询 | 需 API Key、需授权账号、需会员或付费 | ✅ 已核验 |
| [国信证券小信](https://www.guosen.com.cn/gs/xxskills/index.html) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/guosen/) | 查询宏观、行情与财务数据，进行基金对比、选股和 ETF 筛选。 | Skill | 🟢 只读查询 | 需授权账号、需 API Key | ✅ 已核验 |

<sub>[↑ 回到目录](#toc)</sub>

<a id="cat-cloud"></a>

## 云和开发

| 服务 | 能做什么 | 类型 | 权限 | 门槛 | 状态 |
| :-- | :-- | :-- | :-- | :-- | :-- |
| [阿里云](https://help.aliyun.com/zh/openapi/user-guide/openapi-mcp-server-guide) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/aliyun/) | 云资源查询与管理。 | MCP | 🟡 可执行操作 | 需授权账号 | ✅ 已核验 |
| [腾讯云](https://cloud.tencent.com/document/product/1278/131433) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/tencent-cloud/) | 云资源查询与管理。 | Skill · CLI | 🟡 可执行操作 | 需授权账号 | ✅ 已核验 |
| [华为云](https://github.com/huaweicloud/huaweicloud-mcp) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/huawei-cloud/) | 云资源查询与管理。 | MCP · Skill | 🟡 可执行操作 | 需授权账号、需 API Key | ✅ 已核验 |
| [火山引擎](https://github.com/volcengine/mcp-server) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/volcengine/) | 云资源与 AI 能力接入。 | MCP | 🟡 可执行操作 | 需授权账号、需 API Key | ✅ 已核验 |
| [百度智能云](https://ai.baidu.com/ai-doc/REFERENCE/mm9tjwod0) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/baidu-cloud/) | 文字识别、文档解析、图像处理、人脸识别与语音能力。 | MCP | 🟡 可执行操作 | 需授权账号、需 API Key | ✅ 已核验 |
| [七牛云](https://github.com/qiniu/qiniu-mcp-server) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/qiniu/) | 对象存储读写、图片处理、CDN 刷新预取与直播管理。 | MCP | 🟡 可执行操作 | 需授权账号、需 API Key | ✅ 已核验 |
| [智谱](https://docs.bigmodel.cn/cn/coding-plan/mcp/search-mcp-server) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/zhipu/) | 联网搜索与实时信息检索，面向 GLM Coding Plan 用户。 | MCP | 🟢 只读查询 | 需授权账号、需会员或付费、需 API Key | ✅ 已核验 |
| [Gitee](https://gitee.com/oschina/mcp-gitee) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/gitee/) | 代码仓库、Issue 与 PR 管理。 | MCP | 🟡 可执行操作 | 需授权账号、需 API Key | ✅ 已核验 |
| [极狐 GitLab](https://docs.gitlab.cn/docs/jh/user/model_context_protocol/mcp_server/) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/jihulab/) | 代码仓库与 DevOps 管理。 | MCP | 🟡 可执行操作 | 需授权账号 | ✅ 已核验 |
| [腾讯 EdgeOne Makers](https://edgeone.cloud.tencent.com/pages/document/173172415568367616) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/edgeone-makers/) | 部署静态网站、全栈应用与 Agent 项目，并生成公开访问链接。 | MCP · Skill · CLI | 🟡 可执行操作 | 需授权账号 | ✅ 已核验 |
| [Apifox](https://docs.apifox.com/apifox-mcp-server) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/apifox/) | 读取接口文档，并通过命令行运行接口测试。 | MCP · CLI | 🟡 可执行操作 | 需 API Key | ✅ 已核验 |
| [百智云浏览器](https://capybrowser.app.baizhi.cloud/docs/installation.md) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/capybrowser/) | 创建和管理云端浏览器运行与存档，配合 CDP 操作网页。 | MCP · Skill | 🟡 可执行操作 | 需 API Key、需会员或付费 | ✅ 已核验 |
| [Sealos](https://sealos.io/docs/AI/mcp/) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/sealos/) | 创建开发环境，管理数据库，查询账单、性能监控与日志。 | MCP | 🟡 可执行操作 | 需授权账号 | ✅ 已核验 |
| [融云](https://github.com/rongcloud/rongcloud-server-mcp-python) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/rongcloud/) | 管理即时通讯用户与群组，发送消息并查询聊天记录。 | MCP | 🟡 可执行操作 | 需 API Key | ✅ 已核验 |
| [腾讯云开发 CloudBase](https://docs.cloudbase.net/ai/cloudbase-ai-toolkit/) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/cloudbase/) | 管理云数据库、云函数、存储和应用部署，并提供开发工作流。 | MCP · Skill · CLI | 🟡 可执行操作 | 需授权账号 | ✅ 已核验 |
| [GreptimeDB](https://docs.greptime.cn/user-guide/integrations/mcp/) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/greptimedb/) | 查询和分析时序、日志与链路数据，并可按配置管理数据流水线。 | MCP · Skill | 🟡 可执行操作 | — | ✅ 已核验 |
| [Milvus／Zilliz](https://milvus.io/docs/milvus_and_mcp.md) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/milvus/) | 检索向量数据，查询数据库结构，并管理集合和数据。 | MCP | 🟡 可执行操作 | — | ✅ 已核验 |
| [API7 APISIX](https://docs.api7.ai/apisix/reference/apisix-mcp) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/apisix/) | 查询和管理 API 网关路由、上游、插件、消费者与证书配置。 | MCP | 🟡 可执行操作 | 需 API Key | ✅ 已核验 |
| [Higress](https://github.com/higress-group/higress-ops-mcp-server) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/higress/) | 通过 MCP 查询和管理 Higress 网关的路由、服务与配置。 | MCP | 🟡 可执行操作 | — | ✅ 已核验 |
| [乐鑫 ESP RainMaker](https://mcp.espressif.com/) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/esp-rainmaker/) | 查询和控制物联网设备，设置设备参数并管理自动化日程。 | MCP | 🟡 可执行操作 | 需授权账号 | ✅ 已核验 |
| [TiDB](https://docs.pingcap.com/zh/ai/tidb-mcp-claude-desktop/) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/tidb/) | 用自然语言查询和修改数据库，管理表结构与数据库用户。 | MCP | 🟡 可执行操作 | — | ✅ 已核验 |
| [DolphinDB](https://docs.dolphindb.cn/zh/mcp/mcp_use_guide.html) · [独立页](https://guanmo-ai.github.io/awesome-agent-mcp/s/dolphindb/) | 把数据库函数接为 MCP 工具，执行数据分析、指标选股和策略回测。 | MCP | 🟡 可执行操作 | 需授权账号 | ✅ 已核验 |

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
