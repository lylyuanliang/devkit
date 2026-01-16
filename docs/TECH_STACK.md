# Kafka Client - 技术栈详细说明

## 技术选型理由

### 核心框架

#### Electron
**版本**: ^28.0.0

**选择理由**:
- 跨平台支持（Windows、macOS、Linux）
- 可以使用 Node.js 生态系统（kafkajs）
- 成熟的桌面应用框架
- 丰富的社区资源

**替代方案对比**:
- Tauri: 更轻量，但 Node.js 集成不如 Electron 方便
- NW.js: 功能相似，但社区和生态不如 Electron

#### Node.js
**版本**: >= 18.0.0

**选择理由**:
- kafkajs 是纯 JavaScript 实现，兼容性好
- 异步 I/O 适合处理 Kafka 连接
- 丰富的 npm 包生态

---

### 前端技术栈

#### React 18
**版本**: ^18.2.0

**选择理由**:
- 组件化开发，代码复用性好
- 虚拟 DOM，性能优秀
- Hooks 提供优雅的状态管理
- 生态系统成熟

**核心特性使用**:
- Hooks (useState, useEffect, useMemo, useCallback)
- React.memo 优化性能
- Suspense & Lazy 路由懒加载
- Error Boundaries 错误处理

#### TypeScript
**版本**: ^5.3.3

**选择理由**:
- 类型安全，减少运行时错误
- IDE 智能提示，开发效率高
- 代码可维护性强
- 重构更安全

**配置策略**:
- strict 模式开启
- 主进程和渲染进程分离配置
- 共享类型定义

#### Vite
**版本**: ^5.0.8

**选择理由**:
- 开发服务器启动快
- HMR（热模块替换）体验好
- 原生 ESM 支持
- 构建速度快

**替代方案对比**:
- Webpack: 配置复杂，构建速度慢
- Rollup: 适合库开发，不适合应用开发

---

### UI 组件库

#### Ant Design
**版本**: ^5.12.0

**选择理由**:
- 企业级 UI 设计语言
- 组件丰富（Table, Form, Modal 等）
- TypeScript 支持好
- 文档详细
- 中文社区活跃

**主要使用的组件**:
- Layout: 应用布局
- Menu: 导航菜单
- Table: 主题列表、消费组列表
- Form: 连接表单、主题创建表单
- Input, Select: 表单控件
- Modal: 对话框
- Message, Notification: 提示信息
- Button, Icon: 基础组件
- Tree: 主题树形结构
- Tabs: 标签页切换
- Spin: 加载状态

**替代方案对比**:
- Material-UI: 设计风格不符合国内习惯
- Element Plus: Vue 生态，不适合 React

---

### 状态管理

#### Zustand
**版本**: ^4.4.7

**选择理由**:
- API 简单，学习成本低
- 性能优秀（基于 hooks）
- TypeScript 支持好
- 包体积小（~1KB）
- 不需要 Provider 包裹

**Store 设计**:
```typescript
// 连接状态
const useConnectionStore = create<ConnectionStore>((set, get) => ({
  connections: [],
  currentConnection: null,
  setConnections: (connections) => set({ connections }),
  setCurrentConnection: (id) => set({ currentConnection: id }),
}));

// 主题状态
const useTopicStore = create<TopicStore>((set) => ({
  topics: [],
  loading: false,
  setTopics: (topics) => set({ topics }),
  setLoading: (loading) => set({ loading }),
}));
```

**替代方案对比**:
- Redux Toolkit: 更强大，但较复杂，对于本项目过度设计
- MobX: 响应式编程，学习曲线较陡
- Jotai/Recoil: 原子化状态，适合大型应用

---

### Kafka 客户端

#### kafkajs
**版本**: ^2.2.4

**选择理由**:
- 纯 JavaScript 实现，无需编译
- API 友好，易于使用
- 文档完善
- 活跃维护
- 支持所有 Kafka 核心功能

**核心功能**:
- Admin API（主题管理）
- Producer API（消息发送）
- Consumer API（消息消费）
- SASL/SSL 认证
- 消费组管理

**使用示例**:
```typescript
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'kafka-client',
  brokers: ['localhost:9092'],
  ssl: true,
  sasl: {
    mechanism: 'plain',
    username: 'user',
    password: 'pass'
  }
});

const admin = kafka.admin();
const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'test-group' });
```

**替代方案对比**:
- node-rdkafka: 基于 librdkafka，性能更好，但编译复杂
- kafka-node: 已不再维护

---

### 路由管理

#### React Router v6
**版本**: ^6.20.0

**选择理由**:
- React 官方推荐
- v6 版本 API 更简洁
- 支持嵌套路由
- 代码分割友好

**路由结构**:
```typescript
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: '/', element: <Dashboard /> },
      { path: '/connections', element: <Connections /> },
      { path: '/topics', element: <TopicList /> },
      { path: '/topics/:name', element: <TopicDetail /> },
      { path: '/producer', element: <Producer /> },
      { path: '/consumer', element: <Consumer /> },
      { path: '/consumer-groups', element: <ConsumerGroups /> },
      { path: '/settings', element: <Settings /> },
    ],
  },
]);
```

---

### 数据持久化

#### electron-store
**版本**: ^8.1.0

**选择理由**:
- 专为 Electron 设计
- JSON 格式存储
- 类型安全（TypeScript）
- 自动加密支持
- 简单易用

**存储内容**:
```typescript
interface StoreSchema {
  connections: Connection[];
  settings: {
    theme: 'light' | 'dark' | 'auto';
    language: 'zh-CN' | 'en-US';
    fontSize: number;
  };
  messageTemplates: MessageTemplate[];
  windowState: {
    width: number;
    height: number;
    x: number;
    y: number;
  };
}

const store = new Store<StoreSchema>({
  defaults: {
    connections: [],
    settings: {
      theme: 'auto',
      language: 'zh-CN',
      fontSize: 14,
    },
    messageTemplates: [],
  },
});
```

---

### 日期处理

#### Day.js
**版本**: ^1.11.10

**选择理由**:
- 轻量（2KB）
- API 与 Moment.js 类似
- 支持插件扩展
- 国际化支持

**使用场景**:
- 消息时间戳格式化
- 相对时间显示
- 时间范围选择

```typescript
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

// 使用
const timestamp = dayjs(message.timestamp).format('YYYY-MM-DD HH:mm:ss');
const relative = dayjs(message.timestamp).fromNow(); // "3分钟前"
```

---

### 工具库

#### Lodash-ES
**版本**: ^4.17.21

**选择理由**:
- 丰富的工具函数
- Tree-shaking 友好
- 稳定可靠

**主要使用**:
- debounce: 搜索防抖
- throttle: 滚动节流
- groupBy: 数据分组
- sortBy: 数据排序
- cloneDeep: 深拷贝

#### Immer
**版本**: ^10.0.3

**选择理由**:
- 不可变数据更新
- 语法简洁
- 与 Zustand 配合好

```typescript
import produce from 'immer';

const nextState = produce(currentState, (draft) => {
  draft.topics.push(newTopic);
  draft.loading = false;
});
```

---

### 开发工具

#### ESLint
**版本**: ^8.55.0

**配置**:
- @typescript-eslint/parser
- @typescript-eslint/eslint-plugin
- eslint-plugin-react
- eslint-plugin-react-hooks
- eslint-config-prettier

#### Prettier
**版本**: ^3.1.1

**配置**:
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

#### Concurrently
**版本**: ^8.2.2

**用途**: 同时运行多个 npm 脚本（渲染进程和主进程）

```json
{
  "dev": "concurrently \"npm run dev:renderer\" \"npm run dev:main\""
}
```

---

### 构建和打包

#### electron-builder
**版本**: ^24.9.1

**选择理由**:
- 功能全面
- 支持多平台打包
- 自动更新支持
- 配置灵活

**打包目标**:
- Windows: NSIS 安装包
- macOS: DMG 磁盘映像
- Linux: AppImage, deb, rpm

**配置要点**:
```json
{
  "appId": "com.example.kafkaclient",
  "productName": "Kafka Client",
  "compression": "maximum",
  "asar": true,
  "win": {
    "target": "nsis",
    "icon": "resources/icon.ico"
  },
  "mac": {
    "target": "dmg",
    "icon": "resources/icon.icns",
    "hardenedRuntime": true,
    "gatekeeperAssess": false
  },
  "linux": {
    "target": ["AppImage", "deb"],
    "category": "Development"
  }
}
```

---

## 可选/扩展技术

### Schema Registry 支持

#### avsc
**版本**: ^5.7.7

**用途**: Avro 序列化/反序列化

```typescript
import avro from 'avsc';

const schema = avro.Type.forSchema({
  type: 'record',
  fields: [
    { name: 'userId', type: 'string' },
    { name: 'action', type: 'string' },
  ],
});

const buffer = schema.toBuffer({ userId: '123', action: 'login' });
const object = schema.fromBuffer(buffer);
```

### 数据可视化

#### Chart.js / Recharts
**用途**: Lag 监控图表、统计图表

### 虚拟滚动

#### react-window / react-virtualized
**用途**: 大量消息列表性能优化

```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={messages.length}
  itemSize={80}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <Message data={messages[index]} />
    </div>
  )}
</FixedSizeList>
```

### 代码编辑器

#### Monaco Editor / CodeMirror
**用途**: JSON 消息编辑器

### 国际化

#### react-i18next
**用途**: 多语言支持

---

## 性能优化技术

### 1. React 性能优化
- React.memo: 避免不必要的重渲染
- useMemo: 缓存计算结果
- useCallback: 缓存函数引用
- 虚拟滚动: 处理大列表
- 代码分割: React.lazy + Suspense

### 2. 数据处理优化
- Web Worker: 处理大量数据
- IndexedDB: 缓存消息数据
- 分页加载: 避免一次加载过多数据

### 3. Electron 优化
- 进程隔离: 提高安全性
- 懒加载: 按需加载模块
- 内存管理: 及时释放资源

---

## 安全考虑

### 1. Electron 安全最佳实践
```typescript
// 主进程窗口配置
const mainWindow = new BrowserWindow({
  webPreferences: {
    nodeIntegration: false,        // 禁用 Node 集成
    contextIsolation: true,         // 启用上下文隔离
    preload: path.join(__dirname, 'preload.js'),
    sandbox: true,                  // 启用沙箱
  },
});

// CSP 设置
mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      'Content-Security-Policy': ["default-src 'self'"]
    }
  });
});
```

### 2. 凭证加密存储
```typescript
import { safeStorage } from 'electron';

// 加密
const encrypted = safeStorage.encryptString(password);
store.set('connection.password', encrypted.toString('base64'));

// 解密
const encryptedBuffer = Buffer.from(store.get('connection.password'), 'base64');
const password = safeStorage.decryptString(encryptedBuffer);
```

### 3. 输入验证
- Broker 地址格式验证
- 主题名称格式验证
- JSON 格式验证
- SQL 注入防护（如果使用本地数据库）

---

## 开发环境要求

### 必需环境
- Node.js >= 18.0.0
- npm >= 9.0.0 或 pnpm >= 8.0.0
- Git

### 推荐 IDE
- Visual Studio Code
  - 扩展: ESLint, Prettier, TypeScript, React

### 操作系统
- Windows 10/11
- macOS 12+
- Ubuntu 20.04+

---

## 依赖版本策略

### 锁定主要版本
- 使用 `^` 允许小版本更新
- 使用 `~` 只允许补丁更新
- 关键依赖锁定精确版本

### 定期更新
- 每月检查依赖更新
- 及时修复安全漏洞
- 主要版本升级需充分测试

---

## 总结

本项目采用的技术栈经过精心选择，兼顾了：
- **开发效率**: TypeScript + React + Vite
- **用户体验**: Electron + Ant Design
- **性能**: Zustand + 虚拟滚动
- **可维护性**: ESLint + Prettier + 清晰的架构
- **安全性**: 进程隔离 + 凭证加密

这套技术栈既能满足当前需求，也为未来扩展留有空间。
