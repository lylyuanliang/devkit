## Why

Kafka 工具已实现了集群管理和 topic 浏览，但缺少核心的消息发送能力。开发者在调试时需要快速向 Kafka topic 发送测试消息，以验证消费者逻辑、测试端到端流程。完整的生产者功能将使 DevKit 成为自成一体的 Kafka 开发工具，提升开发效率。

## What Changes

- 在 Kafka 工具 UI 中实现"生产消息"页面，允许用户选择目标 topic 并发送消息
- 添加消息编辑器支持多种格式（JSON、纯文本）
- 实现后端生产者服务，基于 `kafkajs` 处理消息发送
- 支持可选的 message key 和 partition 指定
- 提供实时的发送状态反馈（成功/失败）

## Capabilities

### New Capabilities
- `kafka-producer-ui`: 生产消息的用户界面，包括 topic 选择、格式选择、内容编辑、发送控制
- `kafka-producer-service`: 后端消息生产者服务，调用 kafkajs Producer 发送消息到 Kafka
- `kafka-message-formatting`: 支持多种消息格式（JSON、纯文本），自动验证和转换

### Modified Capabilities
- `kafka-message-production`: 实现之前规划但未完成的消息生产能力，提供完整的用户友好的发送体验

## Impact

- 前端：KafkaToolComponent 新增 `produce` view，添加消息编辑器、格式选择器、key 输入框
- 后端：新建 KafkaProducerService，管理 kafkajs Producer 实例的生命周期
- 依赖：无新增（kafkajs 已有）
- 影响范围：仅限 Kafka 工具内部，不影响其他组件
