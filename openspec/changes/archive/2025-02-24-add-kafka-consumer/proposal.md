## Why

Kafka 工具已实现了生产者功能，但缺少消息消费能力。开发者调试 Kafka 应用时需要查看 topic 中的消息内容、验证消费逻辑。完整的消费者功能将使 DevKit 成为完整的 Kafka 开发调试工具，提高开发效率。

## What Changes

- 在 Kafka 工具 UI 中完全实现"Topics"页面的消息消费功能
- 实现后端消费者服务，基于 `kafkajs` 消费消息
- 支持按 offset 导航和搜索消息
- 提供消息内容查看、格式化显示（JSON、纯文本）
- 支持自定义消费起始位置（earliest、latest、指定 offset）

## Capabilities

### New Capabilities
- `kafka-consumer-ui`: 消费消息的用户界面，包括 topic 选择、消息列表、消息详情、offset 导航
- `kafka-consumer-service`: 后端消息消费者服务，基于 kafkajs Consumer 消费消息
- `kafka-message-search`: 支持按消息内容、key、offset 搜索和过滤消息
- `kafka-consumer-offset-management`: 管理消费位置，支持 earliest/latest/指定 offset

### Modified Capabilities
- `kafka-message-consumption`: 实现之前规划但未完成的消息消费能力，提供完整的用户友好的查看体验

## Impact

- 前端：KafkaToolComponent 中的 `topics` view 完整实现，添加消息列表、详情面板、offset 导航
- 后端：新建 KafkaConsumerService，管理 kafkajs Consumer 实例的生命周期
- 依赖：无新增（kafkajs 已有）
- 影响范围：仅限 Kafka 工具内部，不影响其他组件
