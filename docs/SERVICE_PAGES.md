# 服务独立页

`npm run build` 会为每个非 `rejected` 服务生成 `dist/s/<id>/index.html`，同时生成 `sitemap.xml` 和 `robots.txt`。它只读取仓库文件，不请求在线服务。独立页使用 `web/service.html` 的现有设计和 `web/app.css`，服务详情、官方链接、核验说明和首个配置都写进 HTML，关闭 JavaScript 后仍可阅读；备用配置通过 `noscript` 展示。

`web/render.mjs` 同时供 Node 构建器和浏览器使用，负责卡片、图标、徽章、配置和详情内容。`web/ui.mjs` 负责首页与独立页共用的复制、主题、配置标签页及命令面板。`web/service.js` 只启动独立页交互并读取本地 `services.json` 供跨服务搜索使用。

首页卡片、命令面板与旧的 `#s-<id>` 地址继续打开详情抽屉。抽屉的「复制链接」会复制 `/s/<id>/`，README 和 llms.txt 也附有独立页地址。同类推荐最多展示 6 个公开服务。

页面数据按 HTML 文本或属性转义；JSON-LD 中的尖括号和 `&` 使用 Unicode 转义。`publisher` 使用条目的厂商品牌名及其 homepage（未填则使用官方入口），不推测法定公司主体。

## 服务分享图

分享图保存在 `web/og/<id>.jpg`，构建时复制到 `dist/og/`。新增服务或修改名称、简介、类型、图标后，先本地生成对应分享图并一起提交；图片生成不放进 CI，也不增加前端依赖。

需要本机已有 Playwright 和专用测试 Chromium：

```sh
node scripts/og-services.mjs             # 只补缺失图片
node scripts/og-services.mjs amap feishu # 重新生成指定服务
node scripts/og-services.mjs --force     # 重新生成全部公开服务
```

脚本直接读取本地图标、字体与数据，以 1200×630 渲染 JPEG，不需要预览服务器或网络。缺少图标时使用同样的文字图块作为回退。可通过 `NODE_PATH` 选择已有 Playwright 安装，通过 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` 选择已有专用 Chromium；不需要修改脚本或使用个人浏览器配置。

## 验证

`npm run check` 会在临时目录运行真实构建，检查所有公开服务的独立页、canonical、JSON-LD、提示词、索引链接和 sitemap，确认 rejected 服务不出现在页面和推荐中，并验证恶意文字、属性和配置不会突破 HTML 或 JSON-LD 边界。现有配置回归直接导入共享模块，继续检查 shell 参数边界、请求头与 SSE 的客户端差异。

发布前仍需按 `docs/REVIEW.md` 检查实际桌面与手机页面、深浅主题、复制、配置标签页和搜索跳转。
