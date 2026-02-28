## Why

MessageConsumer 页面目前缺失核心功能：用户无法查看消费者组实际消费的消息内容，无法监控消费延迟，且当没有消费者组时界面完全空白且无法操作。这导致用户无法有效调试 Kafka 应用的消费行为，影响工具的可用性和用户体验。

## What Changes

- **消费者组详情页完整实现**：从简单列表升级为多标签详情页，显示组信息、成员分配、消费进度、Lag 监控
- **消息查看功能**：支持查看消费者组在某个 topic-partition 上消费的实际消息内容，帮助用户调试数据
- **Lag 监控和趋势**：实时显示消费延迟（条数），并展示历史趋势图表，让用户了解消费速度和瓶颈
- **冷启动优化**：当没有消费者组时，提供引导式界面包括：使用指南、创建演示消费者组功能、查看系统主题选项
- **演示消费者组功能**：允许用户快速创建临时消费者组来演示和体验功能，无需真实应用

## Capabilities

### New Capabilities

- `consumer-group-details-page`: 消费者组详情页面，通过标签页组织信息（概览、进度、监控），展示组信息、成员分配、消费进度表格
- `message-view-in-group`: 消息查看功能，从消费进度表格点击行进入消息列表，显示该 topic-partition 最近消费的消息内容（offset、key、timestamp、value）
- `lag-monitoring-dashboard`: Lag 监控面板，实时显示每个分区的 lag 数字，并提供历史趋势图表（实时更新 + 历史数据）
- `consumer-group-onboarding`: 冷启动优化，当无消费者组时显示引导界面，提供三个入口：查看使用指南、创建演示组、查看系统主题

### Modified Capabilities

- `consumer-group-management`: 现有的消费者组管理功能需要扩展，将简单列表升级为完整的详情页面和操作流程

## Impact

**受影响的代码：**
- `packages/tools/kafka-tool/src/ui/MessageConsumer.tsx` - 从占位符升级为功能完整的容器组件
- `packages/tools/kafka-tool/src/ui/ConsumerGroupsView.tsx` - 增强列表和详情展示
- `packages/tools/kafka-tool/src/ui/ConsumerGroupDetails.tsx` - 新建详情页面（多标签）
- 可能新建: `MessageViewModal.tsx`, `LagMonitoringPanel.tsx`, `ConsumerGroupOnboarding.tsx`, `DemoConsumerGroupForm.tsx`

**受影响的服务：**
- `packages/tools/kafka-tool/src/service/consumer-group-service.ts` - 现有 API 已足够
- 新增可能: Lag 历史数据存储和计算逻辑

**UI 层改进：**
- 标签页设计用于详情页组织
- 图表库集成用于 Lag 趋势展示（如 Chart.js 或 Recharts）
- 模态框用于消息查看

**用户体验改进：**
- 用户可以在一个详情页面完成 90% 操作（查看信息、监控 lag、查看消息、重置 offset）
- 新用户有清晰的入门指引，不会面对空白界面
- 支持演示功能，让新用户快速体验而无需真实应用

**向后兼容性：**
- 现有的消费者组服务 API 不变
- 仅在 UI 层扩展，不影响其他模块
