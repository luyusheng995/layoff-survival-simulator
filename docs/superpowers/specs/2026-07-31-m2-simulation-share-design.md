# 大厂裁员生存模拟器 M2 模拟与分享设计

## Decision

M2 目标是补上两个产品闭环：

- 自动跑局模拟器：用数据判断当前数值曲线是否合理。
- 结局分享卡：让玩家在结局后能截图或复制报告，形成传播素材。

继续保持零依赖静态网页架构，不引入构建工具或第三方截图库。

## Simulation

新增可复现模拟器：

- 使用 seed 随机数，保证同一 seed 下结果稳定。
- 每局按 90 天规则自动选择行动和事件选项。
- 简单策略优先保命：低绩效时加班，低发量/尊严时摸鱼，低存款时副业，否则混合向上管理和抱团站队。
- 危机事件默认选择伤害较小的选项。
- Game Over 时模拟一次广告复活，并统计复活触发率。

输出指标：

- runs：总局数。
- averageDays：平均存活天数。
- reviveRate：复活触发率。
- endingCounts：结局分布。
- failureCounts：失败原因分布。
- averageFinalStats：最终数值均值。

提供 CLI：`npm run simulate -- --runs 1000 --seed 20260731`。

## Share Report

新增结局报告：

- 结局标题和描述。
- 存活天数。
- 最高绩效。
- 掉发总量。
- 最终存款。
- 复活次数。
- 职场诊断短句。
- 可复制分享文案。

状态层新增 `metrics`，用于记录：

- maxPerformance
- minHair
- actionsTaken
- eventsResolved
- adsWatched

## UI

结局弹窗中新增“打工人报告”卡片：

- 使用紧凑卡片布局，适合截图。
- 提供“复制报告文案”按钮。
- 复制失败时降级为日志提示，不阻塞游戏。

## Testing

新增测试：

- 同一 seed 的模拟结果稳定。
- 模拟摘要包含 runs、averageDays、endingCounts 和 reviveRate。
- 分享报告能从状态和结局生成稳定字段。
- 行动、事件、广告会更新 metrics。

保留现有 `npm test`、`node --check` 和 HTTP 冒烟验证。
