## 1. 基础设施准备

- [x] 1.1 在 shared/types/index.ts 中定义 EventSource 接口
- [x] 1.2 在 shared/types/index.ts 中定义加密数据类型 (EncryptedValue)
- [x] 1.3 在 core/backend 中创建 EventSourceRegistry 类
- [x] 1.4 在 DatabaseService 中实现 saveSecure() 和 loadSecure() 方法
- [x] 1.5 在 DatabaseService 中实现 initializeMasterKey() 方法和密钥生成逻辑
- [x] 1.6 为 EventSourceRegistry 在 package.json 中的 core 添加依赖

## 2. Kafka Tool 项目结构和配置

- [x] 2.1 创建 packages/tools/kafka-tool/src 目录结构 (service/, ui/, types/)
- [x] 2.2 创建 packages/tools/kafka-tool/package.json 并添加 kafkajs 依赖
- [x] 2.3 创建 packages/tools/kafka-tool/tsconfig.json
- [x] 2.4 创建 packages/tools/kafka-tool/src/types.ts 定义 Kafka 相关类型

## 3. Kafka 服务层 (Service 层)

- [x] 3.1 实现 KafkaConnectionManager 类管理连接生命周期
- [x] 3.2 实现 KafkaAdminService 封装 AdminClient 操作 (创建/删除 topic、获取元数据)
- [x] 3.3 实现 KafkaProducerService 封装消息生产
- [x] 3.4 实现 KafkaConsumerService 封装消息消费和位置管理
- [x] 3.5 实现 ConsumerGroupService 管理消费者组和 offset
- [x] 3.6 实现 LagMonitorService 计算和监控消费延迟
- [x] 3.7 在 KafkaService 中汇总所有子服务

## 4. Kafka Tool 核心实现

- [x] 4.1 实现 KafkaTool 类实现 ToolInstance 接口的生命周期方法
- [x] 4.2 实现 KafkaTool 的 getComponent() 返回 React 组件
- [x] 4.3 实现 KafkaTool 的 EventSource 接口 (publish/subscribe/unsubscribe)
- [x] 4.4 实现 KafkaTool 在 init() 时注册到 EventSourceRegistry
- [x] 4.5 在 KafkaTool 中实现敏感数据的加密存储和加载

## 5. Kafka Tool UI 组件 (基础)

- [x] 5.1 创建 KafkaToolComponent 主容器
- [x] 5.2 创建 ClusterSelector 组件用于选择和管理集群
- [x] 5.3 创建 ClusterForm 组件用于添加/编辑集群配置
- [x] 5.4 创建 TopicList 组件显示 topic 列表
- [x] 5.5 创建 TopicForm 组件用于创建/修改 topic
- [x] 5.6 创建 MessageProducer 组件用于发送消息
- [x] 5.7 创建 MessageConsumer 组件用于消费消息

## 6. Kafka Tool UI 组件 (进阶)

- [x] 6.1 创建 ConsumerGroupList 组件显示消费者组
- [x] 6.2 创建 ConsumerGroupDetails 组件显示组详情和 offset
- [x] 6.3 创建 OffsetResetForm 组件用于重置 offset
- [x] 6.4 创建 MonitoringDashboard 组件用于监控 lag 和性能
- [x] 6.5 创建 LagAlertConfig 组件用于配置告警规则
- [x] 6.6 创建 MessageSearch 组件用于过滤和搜索消息

## 7. UI 样式和集成

- [x] 7.1 为 Kafka Tool 创建 css 文件，使用 CSS 变量适配主题
- [x] 7.2 集成 Zustand store 管理 Kafka Tool 的 UI 状态
- [x] 7.3 实现消息实时更新的 UI 刷新机制
- [x] 7.4 为各个组件添加加载状态和错误提示

## 8. EventBus 事件发送

- [x] 8.1 在 KafkaTool 中发送 kafka:registered-as-event-source 事件
- [x] 8.2 在消息发送成功时发送 kafka:message-sent 事件
- [x] 8.3 在消费者组创建时发送 kafka:consumer-created 事件
- [x] 8.4 在 Kafka 操作失败时发送 kafka:error 事件
- [x] 8.5 在消费延迟超过阈值时发送 kafka:lag-alert 事件

## 9. 工具注册和配置

- [x] 9.1 在 core/backend/tool-registry.ts 中注册 KafkaTool
- [x] 9.2 在 tools.config.json 中将 kafka-tool 添加到 included 列表
- [x] 9.3 创建 Kafka Tool 的工具配置 (metadata, icon, version)
- [x] 9.4 确保工具在应用启动时被正确发现和注册

## 10. 测试

- [x] 10.1 为 EventSourceRegistry 编写单元测试
- [x] 10.2 为 DatabaseService 的加密方法编写单元测试
- [x] 10.3 为 KafkaService 的各子服务编写集成测试
- [x] 10.4 为 KafkaTool 的 EventSource 接口编写测试
- [x] 10.5 为 UI 组件编写基础的渲染测试

## 11. 文档和清理

- [x] 11.1 在 docs/tool-development.md 中补充 Kafka Tool 使用示例
- [x] 11.2 为 packages/tools/kafka-tool 创建 README.md
- [x] 11.3 补充 docs/architecture.md 关于 EventSourceRegistry 的说明
- [x] 11.4 代码审查和清理，删除调试代码和注释
- [x] 11.5 运行 lint 和 type-check，修复任何问题

## 12. 验证和打包

- [x] 12.1 本地开发环境完整测试 Kafka Tool 的所有功能
- [x] 12.2 测试与其他工具的事件通信
- [x] 12.3 测试密钥生成和加密逻辑
- [x] 12.4 验证 yarn build 能正确打包应用
- [x] 12.5 在最终打包中验证 Kafka Tool 被正确包含
