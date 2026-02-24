## Why

DevKit 需要一个通用的 Kafka 管理和监控工具，用于开发调试。目前开发者需要切换到不同的 Kafka 管理工具，增加上下文切换成本。同时，我们设计的工具系统支持工具间通信，Kafka 可以作为一个中央事件源，为其他工具提供消息队列能力。

## What Changes

- 添加 Kafka 客户端工具到 packages/tools/kafka-tool
- 实现 EventSource 接口，支持工具级别的可替换事件源
- 在 DatabaseService 中添加敏感数据加密能力
- 扩展 EventBus 支持跨工具事件通信
- 补充工具开发文档（已完成）

## Capabilities

### New Capabilities
- `kafka-cluster-management`: 保存、连接、切换多个 Kafka 集群，支持认证（SASL、SSL）
- `kafka-topic-management`: 浏览、创建、删除 topic，查看分区详情
- `kafka-message-production`: 发送单条或批量消息到指定 topic，支持多种格式（JSON、Avro、纯文本）
- `kafka-message-consumption`: 实时消费消息，按 offset 导航，支持消息搜索和过滤
- `kafka-consumer-group-management`: 查看消费者组，重置 offset，管理消费进度
- `kafka-lag-monitoring`: 显示消费延迟，配置告警规则，实时监控指标
- `kafka-event-source`: 作为可替换的事件源，其他工具可以通过 EventSourceRegistry 使用
- `secure-storage`: 敏感配置数据加密存储，基于 AES-256-GCM

### Modified Capabilities
- `event-bus-cross-tool`: 扩展事件总线支持工具间事件通信的规范和最佳实践（文档已更新）

## Impact

- 新增依赖：`kafkajs`（纯 Node.js Kafka 客户端）
- 修改文件：DatabaseService（添加加密方法）、EventSourceRegistry（新增）
- 影响：所有工具可选地使用 Kafka 作为事件源；其他工具可订阅 Kafka 事件
- 未来支持：其他事件源实现（Redis、RabbitMQ 等）基于相同的 EventSource 接口
