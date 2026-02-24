# Elasticsearch 工具多环境实现参考

基于 Kafka Tool 的多环境实现，Elasticsearch 工具应该采用完全相同的模式。本文档提供详细的代码参考和实现检查清单。

## 核心架构模式

```
┌─────────────────┐
│  ES Tool        │  相同的生命周期
├─────────────────┤
│  ESService      │  多连接管理（参考 KafkaService）
├─────────────────┤
│  DatabaseService│  相同的环保存和加密
├─────────────────┤
│ Environment UI  │  相同的选择器和管理器
└─────────────────┘
```

## 实现步骤和代码参考

### 1. 数据库层 (参考 packages/core/src/backend/database.ts)

**参考代码行**：
- `saveKafkaEnvironment()` → 创建 `saveESEnvironment()`
- `getKafkaEnvironment()` → 创建 `getESEnvironment()`
- `listKafkaEnvironments()` → 创建 `listESEnvironments()`
- `migrateKafkaConfigToEnvironments()` → 创建 `migrateESConfigToEnvironments()`

**实现清单**：
- [ ] 创建 `es_environments` 数据库表（与 `kafka_environments` 相同结构）
- [ ] 创建 `es_active_environment` 追踪表
- [ ] 实现 CRUD 操作
- [ ] 实现迁移脚本处理旧配置

### 2. 服务层 (参考 packages/tools/kafka-tool/src/service/kafka-service.ts)

**关键方法对应**：

| Kafka | Elasticsearch | 说明 |
|-------|---------------|------|
| `loadEnvironments()` | `loadEnvironments()` | 完全相同实现 |
| `getEnvironment()` | `getEnvironment()` | 完全相同实现 |
| `switchEnvironment()` | `switchEnvironment()` | 相同逻辑，连接到 ES 而非 Kafka |
| `createConnection()` | `createESConnection()` | 使用 `@elastic/elasticsearch` SDK |
| `disconnectEnvironment()` | `disconnectESEnvironment()` | 相同的清理逻辑 |

**实现代码骨架**：

```typescript
// packages/tools/elasticsearch-tool/src/service/elasticsearch-service.ts

import { Client } from '@elastic/elasticsearch';

interface ESEnvironmentConfig {
  name: string;
  host: string;
  port: number; // 与 Kafka 的 brokers 对应
  // ... 其他字段
}

export class ElasticsearchService {
  private environments: Map<string, ESEnvironmentConfig> = new Map();
  private activeClient: Client | null = null;
  private activeEnvironment: string | null = null;

  async loadEnvironments(envConfigs: ESEnvironmentConfig[]): Promise<void> {
    // 参考 KafkaService.loadEnvironments()
    this.environments.clear();
    for (const env of envConfigs) {
      this.environments.set(env.name, env);
    }
  }

  async switchEnvironment(name: string): Promise<{ success: boolean; error?: string }> {
    // 参考 KafkaService.switchEnvironment()
    try {
      const env = this.environments.get(name);
      if (!env) return { success: false, error: 'Not found' };

      // 1. 断开旧连接
      if (this.activeClient) {
        await this.activeClient.close();
      }

      // 2. 创建新连接
      this.activeClient = new Client({
        node: `http://${env.host}:${env.port}`,
        // ... 认证配置（参考加密存储）
      });

      // 3. 验证连接
      await this.activeClient.info();

      this.activeEnvironment = name;
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async disconnect(): Promise<void> {
    if (this.activeClient) {
      await this.activeClient.close();
      this.activeClient = null;
      this.activeEnvironment = null;
    }
  }
}
```

**关键差异**：
- Kafka 使用 `brokers` 数组 → ES 使用单个 `host:port`
- Kafka 的 `KafkaAdminClient` → ES 的 `@elastic/elasticsearch` Client
- 其他逻辑完全相同

### 3. 工具类 (参考 packages/tools/kafka-tool/src/kafka-tool.ts)

**对应关系**：
- `KafkaTool` → `ElasticsearchTool`
- `init()` 签名完全相同
- `switchEnvironment()` 完全相同
- `destroy()` 完全相同

**实现要点**：
```typescript
export class ElasticsearchTool {
  private esService: ElasticsearchService;
  private database: DatabaseService;
  private workspaceState: Map<string, any> = new Map();

  async init(config: ElasticsearchToolConfig): Promise<void> {
    // 参考 KafkaTool.init()
    await this.esService.loadEnvironments(config.environments);
    const result = await this.esService.switchEnvironment(config.activeEnvironment);
    // ... 同样的工作区状态管理
  }

  async switchEnvironment(name: string): Promise<{ success: boolean; error?: string }> {
    // 参考 KafkaTool.switchEnvironment()
    this.preserveWorkspaceState();
    const result = await this.esService.switchEnvironment(name);
    if (result.success) {
      this.restoreWorkspaceState(name);
    }
    return result;
  }
}
```

### 4. 事件系统 (参考 kafka-tool.ts 第 80-95 行)

**事件命名约定**：
```typescript
// Kafka
this.eventEmitter.emit('kafka:environment:switching', { from, to });
this.eventEmitter.emit('kafka:environment:switched', { environment, success, error });

// Elasticsearch（应用相同模式）
this.eventEmitter.emit('es:environment:switching', { from, to });
this.eventEmitter.emit('es:environment:switched', { environment, success, error });
```

### 5. UI 组件 (参考 packages/tools/kafka-tool/src/ui/)

**重用组件**（需要参数化）：
- `EnvironmentSelector` → 重用（传入环境列表）
- `EnvironmentManager` → 重用（传入环保存回调）
- `EnvironmentPanel` → 重用（传入环境和回调）

**区别**：
- 文案改为 ES 相关（如"连接到 Elasticsearch 集群"）
- 主机和端口的验证逻辑

### 6. 安全存储 (参考 database.ts 第 214-247 行)

**加密凭证字段**：
```typescript
// Kafka
if (env.connectionConfig?.auth) {
  database.saveSecure(`${toolId}-env-${env.name}-auth`, ...);
}

// Elasticsearch（完全相同）
if (env.connectionConfig?.auth) {
  database.saveSecure(`${toolId}-env-${env.name}-auth`, ...);
}
if (env.connectionConfig?.apiKey) {
  database.saveSecure(`${toolId}-env-${env.name}-apikey`, ...);
}
```

### 7. 工作区状态 (参考 packages/tools/kafka-tool/src/ui/store.ts)

**工作区状态结构**（ES 适用）：
```typescript
interface WorkspaceStatePerEnv {
  environment: string;
  openedIndices: string[];      // 对应 openedTopics
  selectedIndex: string | null; // 对应 selectedTopic
  queryHistory: Array<...>;     // 完全相同
  filters: Record<string, any>; // 完全相同
  // ... 其他字段相同
}

// 使用相同的 Zustand store 模式
```

## 实现检查清单

### 数据库（2-3 小时）
- [ ] 创建 `es_environments` 表（参考第 33-48 行 database.ts）
- [ ] 创建 `es_active_environment` 表
- [ ] 实现 CRUD 操作（参考第 282-365 行 database.ts）
- [ ] 实现迁移脚本（参考第 377-420 行 database.ts）
- [ ] 测试数据库操作

### 服务层（3-4 小时）
- [ ] 创建 `ElasticsearchService` 类
- [ ] 实现 `loadEnvironments()` 方法
- [ ] 实现 `switchEnvironment()` 方法
- [ ] 实现连接管理和清理
- [ ] 单元测试服务层

### 工具层（2-3 小时）
- [ ] 创建 `ElasticsearchTool` 类（参考 kafka-tool.ts）
- [ ] 实现初始化和销毁
- [ ] 实现状态管理
- [ ] 集成事件系统
- [ ] 集成测试

### UI（2-3 小时）
- [ ] 参数化 `EnvironmentSelector` 和 `EnvironmentManager`
- [ ] 创建 ES 工具的 UI 集成点
- [ ] 添加加载和错误状态
- [ ] 测试 UI 流程

### 文档和测试（2-3 小时）
- [ ] 编写 ES 工具的迁移指南
- [ ] 单元测试（参考 kafka-service.test.ts）
- [ ] 集成测试
- [ ] 更新工具文档

## 关键代码行号参考

**数据库**：
- 表创建：`database.ts:23-53`
- CRUD：`database.ts:282-375`
- 迁移：`database.ts:377-420`
- 加密：`database.ts:214-247`

**服务**：
- 多连接管理：`kafka-service.ts:30-37`
- 环境切换：`kafka-service.ts:56-88`
- 连接/断开：`kafka-service.ts:90-125`

**工具**：
- 初始化：`kafka-tool.ts:36-63`
- 环境切换：`kafka-tool.ts:65-101`
- 状态管理：`kafka-tool.ts:103-140`

**UI**：
- 选择器：`EnvironmentSelector.tsx`
- 管理器：`EnvironmentManager.tsx`
- 面板：`EnvironmentPanel.tsx`

**状态**：
- Store 定义：`store.ts:7-33`
- 实现：`store.ts:35-100`

## 验证步骤

实现完成后，验证以下功能：

```typescript
// 1. 环境加载
const tool = new ElasticsearchTool();
await tool.init({
  environments: [...],
  activeEnvironment: 'prod'
});

// 2. 环境切换
const result = await tool.switchEnvironment('staging');
assert(result.success === true);

// 3. 工作区状态保留
// 在 prod 打开某些索引
// 切换到 staging
// 切换回 prod
// 验证索引列表恢复

// 4. 事件发射
tool.on('es:environment:switched', (data) => {
  console.log(`Switched to ${data.environment}`);
});
```

## 常见陷阱

1. ❌ **不同的连接 SDK**：ES 使用 `@elastic/elasticsearch`，不是 Kafka 的 `kafkajs`
2. ❌ **事件名称**：使用 `es:` 前缀而非 `kafka:`
3. ❌ **凭证格式**：ES 可能使用 API Key 或基本认证，与 SASL 不同
4. ❌ **主机配置**：ES 使用 `host:port`，Kafka 使用 `brokers` 数组

## 时间估计

| 部分 | 时间 |
|------|------|
| 数据库 | 2-3h |
| 服务层 | 3-4h |
| 工具层 | 2-3h |
| UI 集成 | 2-3h |
| 测试和文档 | 2-3h |
| **总计** | **11-16h** |

---

**提示**：使用此参考实现指南，多环境支持应该可以在 2-3 天内添加到 Elasticsearch 工具中。
