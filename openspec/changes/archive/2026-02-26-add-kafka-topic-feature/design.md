## Context

**Current State:**
- `KafkaAdminService` 已实现 `createTopic()`, `listTopics()`, `deleteTopic()` 等核心方法
- `TopicForm.tsx` 存在但功能不完整，缺少高级配置选项
- `TopicList.tsx` 仅是占位符，没有实现列表展示逻辑
- 缺少 UI 状态管理（加载、错误、刷新）
- 缺少用户反馈机制（Toast/Notification）

**Constraints:**
- 需要与现有的多环境架构兼容
- 需要保持与 KafkaService 的解耦
- UI 需要支持暗黑模式（现有设计要求）
- 需要处理网络延迟和错误场景

**Stakeholders:**
- 前端开发者（实现 UI 组件）
- 后端开发者（可能扩展 AdminService）
- 最终用户（Kafka 管理员）

## Goals / Non-Goals

**Goals:**
- 提供完整的 Topic 列表展示，包括分区数、副本因子、Leader 等关键信息
- 实现 Topic 创建工作流，支持基础配置（分区、副本因子）和高级配置（retention、compression 等）
- 提供 Topic 删除功能，包括确认对话框防止误操作
- 添加实时用户反馈（成功/失败提示、加载状态）
- 支持列表搜索和过滤功能
- 创建后自动刷新列表，保持 UI 与后端状态同步

**Non-Goals:**
- 不实现 Topic 配置编辑（仅在创建时配置）
- 不实现 Schema Registry 集成
- 不实现批量操作（批量创建/删除）
- 不实现 Topic 监控和指标展示（留给后续功能）
- 不实现权限控制（假设用户已认证）

## Decisions

### 1. UI 状态管理架构

**决策：** 使用 React hooks (useState) + 本地状态管理，不引入全局状态库

**理由：**
- Topic 列表是相对独立的功能模块
- 避免引入额外依赖（Redux、Zustand 等）
- 简化代码复杂度，易于维护
- 与现有 TopicForm 的状态管理方式一致

**实现：**
```typescript
// TopicList 中的状态
const [topics, setTopics] = useState<TopicInfo[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [searchQuery, setSearchQuery] = useState('');
const [showCreateForm, setShowCreateForm] = useState(false);
```

### 2. 组件交互模式

**决策：** TopicList 作为容器组件，通过模态框/抽屉式面板展示 TopicForm

**理由：**
- 保持 TopicForm 的独立性和可复用性
- 清晰的组件职责分离
- 用户体验流畅（不需要页面跳转）

**交互流程：**
```
TopicList (列表展示)
  ├─ 点击 "Create Topic" → 显示 TopicForm 模态框
  ├─ TopicForm 提交 → 调用 AdminService.createTopic()
  ├─ 创建成功 → 关闭模态框 + 刷新列表 + 显示成功提示
  └─ 创建失败 → 显示错误提示（保持模态框打开）

TopicList (列表项)
  ├─ 点击 "Delete" → 显示确认对话框
  ├─ 确认删除 → 调用 AdminService.deleteTopic()
  ├─ 删除成功 → 刷新列表 + 显示成功提示
  └─ 删除失败 → 显示错误提示
```

### 3. 高级配置选项支持

**决策：** 在 TopicForm 中添加"高级选项"折叠面板，支持 retention、compression、cleanup policy 等

**理由：**
- 不增加基础表单的复杂度
- 满足高级用户需求
- 易于扩展新配置项

**实现：**
- 基础配置：Topic 名称、分区数、副本因子（必填）
- 高级配置（可选）：
  - `retention.ms`: 消息保留时间
  - `compression.type`: 压缩算法（none, gzip, snappy, lz4, zstd）
  - `cleanup.policy`: 清理策略（delete, compact）
  - `min.insync.replicas`: 最小同步副本数

**后端扩展：**
```typescript
// AdminService.createTopic() 需要扩展参数
async createTopic(
  topicName: string,
  partitions: number = 1,
  replicationFactor: number = 1,
  config?: Record<string, string>  // 新增
): Promise<void>
```

### 4. 用户反馈机制

**决策：** 使用 Toast 通知组件（短暂显示，自动消失）+ 内联错误提示

**理由：**
- Toast 不打断用户操作流程
- 适合短期反馈（成功/失败）
- 与现代 UI 设计规范一致

**实现：**
- 成功操作：显示 2-3 秒的绿色 Toast
- 错误操作：显示 5 秒的红色 Toast（用户可手动关闭）
- 表单验证错误：内联显示在表单字段下方

### 5. 列表刷新策略

**决策：** 操作后主动刷新 + 定期轮询（可选）

**理由：**
- 主动刷新确保 UI 与后端状态同步
- 定期轮询（如 30 秒）可选，用于检测其他用户的操作
- 避免过度轮询导致性能问题

**实现：**
```typescript
// 创建/删除后主动刷新
const refreshTopics = async () => {
  setLoading(true);
  try {
    const data = await kafkaTool.getKafkaService().getAdminService().listTopics();
    setTopics(data);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to refresh topics');
  } finally {
    setLoading(false);
  }
};

// 可选：定期轮询
useEffect(() => {
  const interval = setInterval(refreshTopics, 30000);
  return () => clearInterval(interval);
}, []);
```

### 6. 搜索和过滤

**决策：** 客户端过滤（不调用后端 API），支持按 Topic 名称搜索

**理由：**
- Topic 列表通常不会很大（几百个）
- 减少网络请求
- 搜索响应快速

**实现：**
```typescript
const filteredTopics = topics.filter(topic =>
  topic.name.toLowerCase().includes(searchQuery.toLowerCase())
);
```

## Risks / Trade-offs

| 风险 | 影响 | 缓解方案 |
|------|------|--------|
| **网络延迟** - 列表加载或操作响应慢 | 用户体验差 | 添加加载状态指示，显示骨架屏或加载动画 |
| **并发操作** - 多个用户同时修改 Topic | 数据不一致 | 操作后刷新列表；可选的定期轮询 |
| **大量 Topic** - 列表性能下降 | 页面卡顿 | 实现虚拟滚动或分页（后续优化） |
| **配置验证** - 无效的配置导致创建失败 | 用户困惑 | 前端验证 + 后端错误信息清晰 |
| **权限问题** - 用户无权创建/删除 Topic | 操作失败 | 清晰的错误提示，建议用户联系管理员 |

**权衡：**
- **简单 vs 功能完整**：优先实现基础功能，高级配置作为可选项
- **实时性 vs 性能**：不使用 WebSocket 实时推送，而是定期轮询（可选）
- **客户端 vs 服务端验证**：两者都做，客户端快速反馈，服务端最终验证

## Migration Plan

**部署步骤：**

1. **第一阶段**：实现基础功能
   - 完成 TopicList 列表展示
   - 集成 TopicForm 创建工作流
   - 添加删除功能和确认对话框
   - 部署到开发环境测试

2. **第二阶段**：添加用户反馈
   - 实现 Toast 通知组件
   - 添加加载状态和错误提示
   - 测试各种错误场景

3. **第三阶段**：高级功能
   - 扩展 AdminService 支持配置参数
   - 在 TopicForm 中添加高级配置选项
   - 实现搜索和过滤

4. **第四阶段**：优化和测试
   - 性能测试（大量 Topic 场景）
   - 可访问性测试（键盘导航、屏幕阅读器）
   - 跨浏览器测试

**回滚策略：**
- 如果新 TopicList 有问题，可快速回滚到占位符版本
- 保持 AdminService 向后兼容（新参数可选）
- 使用特性开关控制新功能的启用

## Open Questions

1. **Toast 组件**：项目中是否已有 Toast/Notification 组件库？如果没有，是否需要新建或使用第三方库？
2. **定期轮询**：是否需要实现定期轮询功能，还是仅在用户操作后刷新？
3. **分页**：如果 Topic 数量很多（>100），是否需要实现分页或虚拟滚动？
4. **权限**：是否需要在 UI 层检查用户权限，还是依赖后端返回 403 错误？
5. **配置验证**：高级配置选项的验证规则是什么？是否需要在前端实现完整的验证？
