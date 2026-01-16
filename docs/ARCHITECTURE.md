# Kafka Client - 架构设计文档

## 整体架构

### 架构图

```
┌─────────────────────────────────────────────────────────┐
│                   Electron App                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────┐      ┌────────────────────┐    │
│  │  Renderer Process  │      │   Main Process     │    │
│  │   (React App)      │◄────►│   (Node.js)        │    │
│  └────────────────────┘      └────────────────────┘    │
│           │                           │                 │
│           │                           │                 │
│     ┌─────▼──────┐             ┌─────▼──────┐         │
│     │ Components │             │   IPC      │         │
│     │  & Pages   │             │  Handlers  │         │
│     └─────┬──────┘             └─────┬──────┘         │
│           │                           │                 │
│     ┌─────▼──────┐             ┌─────▼──────┐         │
│     │   Zustand  │             │   Kafka    │         │
│     │   Store    │             │   Service  │         │
│     └────────────┘             └─────┬──────┘         │
│                                      │                 │
└──────────────────────────────────────┼─────────────────┘
                                       │
                                       ▼
                              ┌────────────────┐
                              │ Kafka Cluster  │
                              └────────────────┘
```

## 技术架构分层

### 1. 渲染进程（Renderer Process）

#### 1.1 视图层（View Layer）
- **框架**: React 18 + TypeScript
- **路由**: React Router v6
- **UI 组件**: Ant Design
- **样式**: CSS Modules + Less

**主要页面结构**:
```
src/renderer/
├── pages/
│   ├── Dashboard/          # 仪表盘
│   ├── Connections/        # 连接管理
│   ├── Topics/            # 主题管理
│   │   ├── TopicList/     # 主题列表
│   │   ├── TopicDetail/   # 主题详情
│   │   └── TopicCreate/   # 创建主题
│   ├── Producer/          # 生产者
│   ├── Consumer/          # 消费者
│   └── ConsumerGroups/    # 消费组管理
├── components/
│   ├── Layout/            # 布局组件
│   ├── ConnectionForm/    # 连接表单
│   ├── MessageViewer/     # 消息查看器
│   ├── TopicSelector/     # 主题选择器
│   └── ...
└── App.tsx
```

#### 1.2 状态管理层（State Management）
- **工具**: Zustand
- **特点**: 轻量、简单、TypeScript 友好

**Store 结构**:
```typescript
stores/
├── connectionStore.ts     # 连接状态
├── topicStore.ts         # 主题数据
├── messageStore.ts       # 消息数据
├── consumerGroupStore.ts # 消费组数据
└── uiStore.ts           # UI 状态（主题、语言等）
```

#### 1.3 服务层（Service Layer）
- **职责**: 封装 IPC 通信，提供统一的 API
- **特点**: Promise 化，错误处理，类型安全

```typescript
services/
├── kafkaService.ts       # Kafka 操作服务
├── connectionService.ts  # 连接管理服务
├── storageService.ts     # 本地存储服务
└── ipc.ts               # IPC 通信封装
```

### 2. 主进程（Main Process）

#### 2.1 窗口管理
- **职责**: 创建和管理应用窗口
- **功能**: 窗口大小、位置、状态持久化

#### 2.2 IPC 通信层
- **职责**: 处理渲染进程的请求
- **安全**: 验证请求来源，防止注入攻击

```typescript
main/ipc/
├── kafkaHandlers.ts      # Kafka 操作处理器
├── connectionHandlers.ts # 连接管理处理器
├── fileHandlers.ts       # 文件操作处理器
└── index.ts             # IPC 注册
```

#### 2.3 Kafka 服务层
- **库**: kafkajs
- **职责**: 
  - Kafka 连接管理
  - 主题操作（CRUD）
  - 消息生产/消费
  - 消费组管理
  - 集群信息获取

```typescript
main/services/
├── KafkaConnectionManager.ts  # 连接管理器
├── KafkaAdminService.ts       # 管理操作
├── KafkaProducerService.ts    # 生产者服务
├── KafkaConsumerService.ts    # 消费者服务
└── KafkaMetadataService.ts    # 元数据服务
```

#### 2.4 数据持久化
- **工具**: electron-store
- **存储内容**:
  - 连接配置
  - 用户偏好设置
  - 消息模板
  - 窗口状态

### 3. 共享层（Common Layer）

```typescript
common/
├── types/
│   ├── kafka.ts          # Kafka 相关类型
│   ├── connection.ts     # 连接配置类型
│   └── message.ts        # 消息类型
├── constants/
│   ├── ipcChannels.ts    # IPC 通道常量
│   └── config.ts         # 配置常量
└── utils/
    ├── validation.ts     # 验证工具
    ├── format.ts         # 格式化工具
    └── logger.ts         # 日志工具
```

## 核心模块设计

### 1. 连接管理模块

**功能**:
- 多连接配置保存
- 连接测试
- SASL/SSL 支持
- 连接池管理

**数据结构**:
```typescript
interface KafkaConnection {
  id: string;
  name: string;
  brokers: string[];
  sasl?: {
    mechanism: 'plain' | 'scram-sha-256' | 'scram-sha-512';
    username: string;
    password: string;
  };
  ssl?: boolean;
  clientId?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. 主题管理模块

**功能**:
- 主题列表获取
- 主题详细信息
- 创建/删除主题
- 配置管理

**API 设计**:
```typescript
interface TopicService {
  listTopics(connectionId: string): Promise<Topic[]>;
  getTopicDetail(connectionId: string, topicName: string): Promise<TopicDetail>;
  createTopic(connectionId: string, config: CreateTopicConfig): Promise<void>;
  deleteTopic(connectionId: string, topicName: string): Promise<void>;
  updateConfig(connectionId: string, topicName: string, configs: ConfigEntry[]): Promise<void>;
}
```

### 3. 消息生产模块

**功能**:
- 单条/批量发送
- 多种消息格式
- 消息模板
- 发送历史

**设计要点**:
- 支持 JSON、纯文本、Avro
- 自定义 Key、Headers、Partition
- 模板保存和复用

### 4. 消息消费模块

**功能**:
- 实时消费
- 历史消费（从指定 offset）
- 消息过滤
- 消息导出

**实现方式**:
```typescript
class ConsumerSession {
  private consumer: Consumer;
  private messageBuffer: Message[] = [];
  
  async start(options: ConsumeOptions): Promise<void>;
  async pause(): Promise<void>;
  async resume(): Promise<void>;
  async stop(): Promise<void>;
  
  // 消息推送到渲染进程
  private pushMessage(message: Message): void {
    mainWindow.webContents.send('message:received', message);
  }
}
```

### 5. 消费组管理模块

**功能**:
- 消费组列表
- Lag 监控
- Offset 重置
- 成员信息

## IPC 通信设计

### 通道命名规范
```
{module}:{action}
```

### 主要通道

```typescript
// 连接相关
'connection:list'
'connection:create'
'connection:update'
'connection:delete'
'connection:test'

// 主题相关
'topic:list'
'topic:detail'
'topic:create'
'topic:delete'
'topic:config:update'

// 生产者
'producer:send'
'producer:send-batch'

// 消费者
'consumer:start'
'consumer:pause'
'consumer:stop'
'consumer:seek'

// 消费组
'consumer-group:list'
'consumer-group:detail'
'consumer-group:reset-offset'
'consumer-group:delete'

// 消息推送（主进程到渲染进程）
'message:received'
'connection:status-changed'
```

### 安全考虑

1. **请求验证**: 验证所有参数
2. **错误处理**: 统一错误格式返回
3. **上下文隔离**: 使用 contextBridge
4. **最小权限**: 只暴露必要的 API

## 性能优化策略

### 1. 渲染优化
- 虚拟滚动（消息列表）
- React.memo 减少重渲染
- 懒加载路由
- Web Worker 处理大数据

### 2. 消息处理优化
- 消息分页加载
- 消息缓冲区（避免频繁更新 UI）
- 消息索引（快速搜索）

### 3. 连接优化
- 连接池复用
- 心跳保活
- 自动重连

## 安全设计

### 1. 凭证存储
- 使用 safeStorage API 加密存储密码
- 避免明文存储敏感信息

### 2. 进程隔离
- 禁用 nodeIntegration
- 启用 contextIsolation
- 使用 preload 脚本

### 3. CSP（内容安全策略）
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self'">
```

## 日志和监控

### 日志级别
- ERROR: 错误信息
- WARN: 警告信息
- INFO: 一般信息
- DEBUG: 调试信息

### 日志存储
- 主进程日志: logs/main.log
- 渲染进程日志: logs/renderer.log
- Kafka 操作日志: logs/kafka.log

## 构建和打包

### 开发环境
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:renderer\" \"npm run dev:main\"",
    "dev:renderer": "vite",
    "dev:main": "electron . --inspect"
  }
}
```

### 生产构建
- Vite 构建渲染进程
- esbuild/tsc 构建主进程
- electron-builder 打包

### 打包配置
- Windows: NSIS 安装包
- macOS: DMG
- Linux: AppImage/deb/rpm
