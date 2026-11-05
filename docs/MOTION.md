# 动效

动效属于设计，改动由 Claude 负责。实现在 `web/motion.mjs`（弹窗与筛选结果）和 `web/fx.mjs`（交互反馈），样式在 `web/app.css` 末尾的「交互动效」一节。

- 时长与曲线采用微软 [Fluent UI](https://github.com/microsoft/fluentui) 的公开 motion token（MIT，声明见 [web/licenses/fluentui.txt](../web/licenses/fluentui.txt)）：按压与退出 150ms，搜索结果进入 200ms，详情 250ms；带轻微回弹的效果使用 `--spring`。
- 节奏参考 IBM [Carbon](https://carbondesignsystem.com/elements/motion/overview/) 的 productive motion：反馈跟随操作，退出比进入短，动画不延后任何操作。
- 现有动效：首页入场与图标轨道、鼠标景深、演示播放、滚动浮现、卡片光效与按压、分类底色滑动、卡片图标飞入详情、深浅色圆形展开、复制成功轻弹。
- 详情或搜索打开、轨道离屏、页面切到后台时，循环动画暂停；系统开启「减少动态效果」时，`web/fx.mjs` 不启用，内容直接显示。
- 不支持 View Transitions 的浏览器直接切换，没有过渡动画。
