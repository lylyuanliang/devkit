# Elasticsearch 工具多环境支持 - 技术设计

## Context

Elasticsearch Tool 目前支持单一集群连接，用户无法保存和快速切换多个 ES 集群配置。在多环境开发场景（开发、测试、生产集群）中，用户需要频繁手动修改配置来切换集群，导致效率低下且容易出错。

Kafka Tool 已成功实现了多环境支持（57 个任务，已完成），提供了成熟的架构模式：
- 数据库层：elasticsearch_environments 表存储多个集群配置
- 服务层：ElasticsearchService 管理多连接（Map<name, client>）
- 工具层：ElasticsearchTool 协调生命周期和状态管理
- UI 层：EnvironmentPanel 提供集群选择和管理界面
- 状态管理：Zustand store 隔离每个环境的 UI 状态

该设计复用 Kafka 的架构模式，确保一致性和可维护性。

## Goals / Non-Goals

**Goals:**
- 支持多个 ES 集群配置的保存和管理
- 实现 < 2 秒的一键集群切换（响应时间包括连接建立）
- 每个集群独立保存工作区状态（打开的索引、过滤条件、查询历史等）
- 使用 AES-256-GCM 加密存储凭证和敏感配置
- 集成完整的事件系统（elasticsearch:environment:switching/switched）
- 保留所有现有 ES 查询功能和工作流
- 向后兼容现有的单集群配置（自动迁移为"default"环境）
- 在左侧菜单栏中与 Kafka Tool 并列展示

**Non-Goals:**
- 修改或增强 ES 基础查询功能
- 支持新的查询语言或查询 DSL
- 实现高级可视化功能
- 支持跨集群查询或数据同步
- 修改现有的索引管理、数据导出等功能

## Decisions

### 1. 架构模式 - 复用 Kafka 实现的五层模式

**决策：** 采用与 Kafka Tool 相同的五层架构
- **数据库层**：elasticsearch_environments 表 + elasticsearch_active_environment 表
- **服务层**：ElasticsearchService（单例）管理多连接
- **工具层**：ElasticsearchTool 初始化、销毁、状态转换
- **UI 层**：EnvironmentPanel（EnvironmentSelector + EnvironmentManager）
- **状态管理**：Zustand store 实现环境隔离状态

**为什么：** Kafka 实现已验证可靠性（57 个任务完成），复用模式降低学习成本、减少 Bug、提高一致性

**备选方案考虑：**
- 独立设计：提供更多灵活性但增加维护成本
- 部分复用：选择性复用组件但导致不一致
- 采用选定方案：成熟模式 + 代码复用 + 团队熟悉度

---

### 2. 多连接管理 - Map<string, ElasticsearchClient>

**决策：** ElasticsearchService 维护一个 Map 存储所有连接
```
connectionsMap: Map<environmentName, {client, config, timestamp}>
activeEnvironmentName: string
```

连接按需创建，在环境切换时管理生命周期。

**为什么：**
- 支持快速切换（O(1) 查找）
- 避免重复连接开销
- 内存占用可控（通常 5-10 个连接）

**状态转换：**
1. 初始化：加载所有环境配置，设置 active environment
2. 连接请求：从 Map 获取或新建连接
3. 环境切换：断开旧连接，激活新连接，发送事件
4. 销毁：关闭所有连接

---

### 3. 环境切换生命周期 - 四阶段流程

**决策：** 环境切换遵循严格的四阶段生命周期

```
用户选择新环境
    ↓
1. VALIDATE 阶段
   - 验证新环境配置有效性
   - 检查网络连接
   ↓
2. SWITCHING 事件（发送）
   - 发送 elasticsearch:environment:switching 事件
   - UI 显示加载状态
   ↓
3. CONNECT 阶段
   - 断开旧环境连接
   - 建立新环境连接
   - 加载新环境的工作区状态
   ↓
4. SWITCHED 事件（发送）
   - 发送 elasticsearch:environment:switched 事件
   - UI 更新为新环境的状态
   - 操作完成
```

**为什么：**
- 清晰的错误处理点
- 防止状态不一致
- 允许 UI 在每个阶段提供反馈

---

### 4. 工作区状态隔离 - 环境命名空间

**决策：** Zustand store 为每个环境维护独立的 workspace 状态

```typescript
interface WorkspaceStatePerEnv {
  openedIndices: string[];
  selectedIndex: string | null;
  filters: FilterConfig;
  queryHistory: Query[];
  scrollPositions: Map<string, number>;
  uiPreferences: UIPrefs;
  timestamp: number;
}

useWorkspaceStore().environmentStates: Map<envName, WorkspaceStatePerEnv>
```

**为什么：**
- 环境之间完全隔离，无冲突
- 切换时能完整恢复之前的工作状态
- 状态持久化到 localStorage 或 database

**状态恢复流程：**
1. 环境切换完成 → SWITCHED 事件
2. UI 监听事件 → 查询 store 获取该环境的状态
3. 状态不存在 → 使用默认状态
4. 状态存在 → 完全恢复（打开的索引、过滤条件、滚动位置等）

---

### 5. 凭证加密 - AES-256-GCM

**决策：** 敏感字段（密码、认证令牌）使用 AES-256-GCM 加密存储

```
Master Key: ~/.devkit/master.key (用户初始化时生成)
加密字段：
- elasticsearch_environments.auth.password
- elasticsearch_environments.ssl.key (如果需要)
- elasticsearch_environments.ssl.cert (如果需要)
```

**为什么：**
- AES-256-GCM 提供认证和加密
- Master Key 不存储在 SQLite 中（减少暴露面）
- 与 Kafka 实现一致

---

### 6. 数据库schema - 两表结构

**决策：**
- `elasticsearch_environments` 表：存储所有集群配置
- `elasticsearch_active_environment` 表：跟踪当前活跃环境

**elasticsearch_environments 结构：**
```
id (UUID)
name (string, unique)
host (string)
port (number)
auth {
  type: 'none' | 'basic' | 'apikey'
  username?: string (encrypted)
  password?: string (encrypted)
  apiKey?: string (encrypted)
}
tls {
  enabled: boolean
  rejectUnauthorized: boolean
  ca?: string (encrypted)
  cert?: string (encrypted)
  key?: string (encrypted)
}
description (string)
tags (string[])
createdAt (timestamp)
updatedAt (timestamp)
```

**elasticsearch_active_environment 结构：**
```
id: '1' (唯一)
environmentName (string, foreign key)
switchedAt (timestamp)
```

**为什么：**
- 环境配置独立管理
- 活跃环境指针清晰
- 支持快速查询和更新

---

### 7. 事件系统 - 异步通知

**决策：** 环境切换过程中发送两个事件

```
事件 1: elasticsearch:environment:switching
时机：切换开始，验证后、连接前
数据：{
  from: previousEnvName,
  to: newEnvName,
  timestamp: number
}

事件 2: elasticsearch:environment:switched
时机：切换完成，新连接激活后
数据：{
  environment: newEnvName,
  client: ElasticsearchClient,
  state: WorkspaceState,
  timestamp: number
}
```

**为什么：**
- UI 可在 switching 时显示加载状态
- UI 可在 switched 时更新界面
- 其他工具可监听事件做联动

---

### 8. UI 集成 - 复用 Kafka 组件结构

**决策：** 复用或参数化 Kafka Tool 的 UI 组件

- **EnvironmentSelector**：下拉菜单，展示所有环境 + 活跃指示
- **EnvironmentManager**：CRUD 表单（新增、编辑、删除、复制）
- **EnvironmentPanel**：集成上述两个组件 + 加载状态 + 错误提示

**参数化考虑：**
```typescript
<EnvironmentPanel
  toolName="elasticsearch"
  environments={environments}
  activeEnvironment={activeEnv}
  onSwitch={handleSwitch}
  onError={handleError}
/>
```

**为什么：**
- 代码重用，减少维护
- 用户体验一致
- 快速实现

---

### 9. 向后兼容性 - 迁移现有配置

**决策：** 检测旧格式配置，自动迁移为"default"环境

**迁移策略：**
1. 检查是否存在 `elasticsearch_config` 表（旧格式）
2. 如果存在，读取配置
3. 创建 `elasticsearch_environments` 表
4. 将旧配置作为"default"环境插入
5. 删除 `elasticsearch_config` 表（或标记为已迁移）
6. 设置"default"为活跃环境

**为什么：**
- 用户无感知升级
- 保护现有工作流
- 数据不丢失

---

### 10. 左侧菜单集成 - 与 Kafka 并列

**决策：** 在左侧菜单中为 ES Tool 创建独立条目，与 Kafka Tool 并列

```
菜单结构：
- [Kafka] 🔗 kafka-cluster-1  (active indicator)
- [Elasticsearch] 🔗 prod-cluster (active indicator)
- [Other Tools]
```

**为什么：**
- 用户能快速访问 ES Tool
- 活跃环境一目了然
- UI 一致性

---

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| 多连接内存占用增加 | 限制同时保持的连接数（最多 20），非活跃连接延迟关闭 |
| 状态切换时延迟 > 2秒 | 使用异步连接池、连接复用、状态预加载 |
| 凭证加密 key 泄露 | Master Key 放在用户主目录，权限 600，从不上传 |
| 数据库迁移失败 | 实现回滚逻辑，保留旧表作为备份 3 天后删除 |
| 并发环境切换冲突 | 使用互斥锁保护切换过程，debounce UI 事件（200ms） |
| 大量连接导致资源泄漏 | 实现连接健康检查、超时检测、自动清理 |
| 环境配置不一致 | 通过验证步骤确保配置有效，缓存配置版本号 |

---

## Migration Plan

**部署步骤：**

1. **数据库迁移（零停机）**
   - 创建 elasticsearch_environments 表
   - 创建 elasticsearch_active_environment 表
   - 执行迁移脚本（旧配置 → 新表）
   - 验证数据完整性

2. **代码发布**
   - 发布 ElasticsearchService 新版本
   - 发布 ElasticsearchTool 新版本
   - 发布 UI 组件

3. **验证**
   - 单环境切换测试
   - 多环境并发测试
   - 状态恢复测试
   - 凭证加密验证

4. **用户通知**
   - 发布迁移指南
   - 展示新功能演示
   - 提供反馈渠道

**回滚策略：**
- 保留旧配置表 72 小时
- 如遇紧急问题，快速回滚到旧版本
- 恢复指向旧表的代码路径

---

## Open Questions

1. **连接池管理策略：** 是否需要实现动态连接池？何时关闭非活跃连接？
   - 建议：实现超时自动关闭（30 分钟无使用则关闭）

2. **状态持久化位置：** Workspace 状态存储在 localStorage 还是数据库？
   - 建议：localStorage 用于快速恢复，数据库用于备份

3. **大规模环境管理：** 支持的最大环境数量？是否需要分页？
   - 建议：先实现无限制，监控性能，必要时分页（>100 环境）

4. **跨工具状态同步：** 当同时打开 Kafka 和 ES Tools 时，是否需要同步它们的活跃环境？
   - 建议：独立管理，但在事件中提供足够信息供其他工具决定

5. **连接失败降级策略：** 环境切换失败时如何处理？是否保留旧环境连接？
   - 建议：保留旧环境连接，显示详细错误信息，允许用户重试或切换其他环境
