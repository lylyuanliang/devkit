## Why

当前 Kafka 工具的 Topic 管理功能不完整。虽然后端 AdminService 已实现创建逻辑，但前端缺少完整的列表展示、创建流程集成和用户反馈机制。用户无法有效地查看、创建和管理 Topic，影响工具的可用性。

## What Changes

- **TopicList 组件完整实现**：从占位符升级为功能完整的列表组件，支持显示所有 Topic、刷新、删除、搜索过滤
- **Topic 创建工作流集成**：将 TopicForm 集成到 TopicList 中，通过模态框/抽屉式面板展示，创建后自动刷新列表
- **用户反馈机制**：添加成功/失败提示（Toast/Notification），加载状态指示，错误信息展示
- **Topic 配置支持**：创建时支持更多配置选项（retention、compression 等），而非仅限分区数和副本因子
- **删除确认对话框**：删除 Topic 前显示确认对话框，防止误操作

## Capabilities

### New Capabilities

- `topic-list-display`: 显示 Kafka 集群中的所有 Topic，包括分区数、副本因子、Leader 等信息，支持刷新和搜索过滤
- `topic-creation-workflow`: 完整的 Topic 创建工作流，包括表单验证、配置选项、成功/失败反馈和列表自动更新
- `topic-deletion`: 删除 Topic 的功能，包括确认对话框和错误处理
- `topic-configuration`: 创建 Topic 时支持高级配置选项（retention、compression、cleanup policy 等）

### Modified Capabilities

- `topic-management`: 现有的 Topic 管理规范需要扩展，定义完整的 CRUD 操作流程和用户交互规范

## Impact

**受影响的代码：**
- `packages/tools/kafka-tool/src/ui/TopicList.tsx` - 从占位符升级为完整实现
- `packages/tools/kafka-tool/src/ui/TopicForm.tsx` - 增强配置选项和验证逻辑
- `packages/tools/kafka-tool/src/ui/store.ts` - 可能需要添加 UI 状态管理（加载、错误、刷新）
- `packages/tools/kafka-tool/src/service/admin-service.ts` - 可能需要扩展以支持更多配置选项

**受影响的 API：**
- `KafkaAdminService.createTopic()` - 可能需要扩展参数以支持高级配置
- `KafkaAdminService.listTopics()` - 需要确保返回完整的 Topic 元数据

**依赖关系：**
- 依赖现有的 KafkaService 和 AdminService
- 依赖 UI 组件库（Button、Input、Modal/Dialog 等）
- 可能需要添加 Toast/Notification 组件库

**用户体验改进：**
- 用户可以在一个统一的界面中查看、创建、删除 Topic
- 实时反馈和错误提示提升操作体验
- 支持更灵活的 Topic 配置
