# 动效

动效属于设计，改动由 Claude 负责。

- 时长与曲线采用微软 [Fluent UI](https://github.com/microsoft/fluentui) 的公开 motion token（MIT，声明见 [web/licenses/fluentui.txt](../web/licenses/fluentui.txt)）：按压与退出 150ms，搜索结果进入 200ms，详情抽屉 250ms。
- 节奏参考 IBM [Carbon](https://carbondesignsystem.com/elements/motion/overview/) 的 productive motion：反馈跟随操作，退出比进入短，动画不延后任何操作。
- 详情打开、轨道离屏或页面切到后台时动画暂停；系统开启「减少动态效果」时立即停止。
