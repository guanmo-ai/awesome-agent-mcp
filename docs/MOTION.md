# 网站交互与动效

网站保持原生 HTML、CSS 和 JavaScript，不引入框架或境外运行时资源。

动效时间与减速曲线采用微软 [Fluent UI](https://github.com/microsoft/fluentui) 的公开 token：150ms 用于按压和退出，200ms 用于搜索与结果进入，250ms 用于详情抽屉。使用 `curveDecelerateMax` 和 `curveEasyEase`，许可为 MIT，完整声明随网站发布在 [web/licenses/fluentui.txt](../web/licenses/fluentui.txt)。动画实现由本站编写。

整体节奏参考 IBM [Carbon 动效指南](https://www.carbondesignsystem.com/building-blocks/foundations/motion/overview) 的 productive motion：反馈跟随操作，退出比进入短。没有复制或安装 Carbon 代码。

目录在构建时生成，配套交互数据随同一份 HTML 交付，首页无需另等 JSON 请求，旧页面也不会混用新数据。JavaScript 加载后复用已有卡片。筛选不替换分类按钮或整片列表；卡片本身保留真实链接，脚本未加载时仍能访问独立页。共享模块使用同一个内容版本；对尚未带内嵌数据的旧版 HTML，首次加载时重新对齐目录和统计。

详情在点击时立即打开，动画不会延后业务操作；搜索按帧合并输入。结果动画只作用于视口附近新出现的卡片。鼠标光效每帧只测量指向的卡片，触屏不运行。详情打开、轨道离屏或页面进入后台时，相关演示停止；系统的“减少动态效果”设置会即时生效。

验证覆盖桌面、390px 手机布局、键盘搜索、组合筛选、空结果、深浅色、直接详情链接、减少动态效果以及无 JavaScript 的目录入口。浏览器模拟不能替代真实手机的性能测量。
