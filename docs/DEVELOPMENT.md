# Kafka Client - 开发指南和进度跟踪

## 开发进度

### 第一阶段: 项目初始化和基础架构 ✅
- [x] 项目规划文档编写（12个文档）
- [x] 架构设计文档
- [x] 功能规划文档
- [x] 项目初始化
  - [x] package.json 配置（30个依赖包）
  - [x] TypeScript 配置（4个tsconfig文件）
  - [x] ESLint + Prettier配置
  - [x] Electron 主进程搭建
  - [x] Vite + React 渲染进程搭建
  - [x] IPC通信框架
  - [x] Preload脚本
  - [x] 基础UI布局
  - [x] 7个页面组件骨架
  - [x] 开发环境配置

**完成时间**: 2026-01-13  
**代码统计**: 22个TypeScript文件，约2,800行代码

### 第二阶段: 核心功能开发 - 连接管理
- [ ] 主进程 Kafka 连接服务
  - [ ] KafkaConnectionManager 实现
  - [ ] 连接配置存储（electron-store）
  - [ ] 密码加密存储（safeStorage）
- [ ] IPC 通信
  - [ ] 连接相关通道定义
  - [ ] 请求处理器实现
- [ ] 渲染进程 UI
  - [ ] 连接列表页面
  - [ ] 连接表单组件
  - [ ] 连接状态显示
  - [ ] 连接测试功能

### 第三阶段: 主题管理
- [ ] 主进程服务
  - [ ] KafkaAdminService 实现
  - [ ] 主题 CRUD 操作
  - [ ] 主题元数据获取
- [ ] 渲染进程 UI
  - [ ] 主题列表页面
  - [ ] 主题详情页面
  - [ ] 创建主题表单
  - [ ] 主题配置编辑

### 第四阶段: 消息生产
- [ ] 主进程服务
  - [ ] KafkaProducerService 实现
  - [ ] 消息发送逻辑
  - [ ] 批量发送支持
- [ ] 渲染进程 UI
  - [ ] 消息发送表单
  - [ ] 消息格式化和验证
  - [ ] 消息模板管理
  - [ ] 批量导入功能

### 第五阶段: 消息消费
- [ ] 主进程服务
  - [ ] KafkaConsumerService 实现
  - [ ] 消费会话管理
  - [ ] 消息推送到渲染进程
- [ ] 渲染进程 UI
  - [ ] 消息消费页面
  - [ ] 消息列表展示（虚拟滚动）
  - [ ] 消息过滤和搜索
  - [ ] 消息导出功能

### 第六阶段: 消费组管理
- [ ] 主进程服务
  - [ ] 消费组元数据获取
  - [ ] Offset 重置
  - [ ] Lag 计算
- [ ] 渲染进程 UI
  - [ ] 消费组列表
  - [ ] 消费组详情
  - [ ] Offset 重置表单
  - [ ] Lag 监控展示

### 第七阶段: 仪表盘和监控
- [ ] 集群概览
- [ ] 统计图表
- [ ] 实时监控

### 第八阶段: 优化和完善
- [ ] 性能优化
- [ ] 错误处理完善
- [ ] 日志系统
- [ ] 单元测试
- [ ] E2E 测试

### 第九阶段: 打包和发布
- [ ] Windows 打包
- [ ] macOS 打包
- [ ] Linux 打包
- [ ] 自动更新功能

---

## 技术实现细节

### 项目结构

```
kafka_client/
├── .vscode/                 # VS Code 配置
├── docs/                    # 文档
│   ├── ARCHITECTURE.md
│   ├── DEVELOPMENT.md
│   └── FEATURES.md
├── resources/              # 资源文件
│   ├── icon.png           # 应用图标
│   └── installer.nsh      # NSIS 安装脚本
├── scripts/               # 构建脚本
│   ├── build-main.js     # 主进程构建
│   └── notarize.js       # macOS 公证
├── src/
│   ├── main/             # Electron 主进程
│   │   ├── index.ts     # 入口文件
│   │   ├── window.ts    # 窗口管理
│   │   ├── ipc/         # IPC 处理器
│   │   │   ├── index.ts
│   │   │   ├── kafkaHandlers.ts
│   │   │   ├── connectionHandlers.ts
│   │   │   └── fileHandlers.ts
│   │   ├── services/    # Kafka 服务
│   │   │   ├── KafkaConnectionManager.ts
│   │   │   ├── KafkaAdminService.ts
│   │   │   ├── KafkaProducerService.ts
│   │   │   ├── KafkaConsumerService.ts
│   │   │   └── KafkaMetadataService.ts
│   │   └── storage/     # 数据存储
│   │       ├── ConnectionStore.ts
│   │       └── SettingsStore.ts
│   ├── renderer/        # 渲染进程
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   ├── pages/   # 页面组件
│   │   │   │   ├── Dashboard/
│   │   │   │   ├── Connections/
│   │   │   │   ├── Topics/
│   │   │   │   ├── Producer/
│   │   │   │   ├── Consumer/
│   │   │   │   └── ConsumerGroups/
│   │   │   ├── components/ # 通用组件
│   │   │   │   ├── Layout/
│   │   │   │   ├── ConnectionForm/
│   │   │   │   ├── MessageViewer/
│   │   │   │   └── TopicSelector/
│   │   │   ├── stores/  # 状态管理
│   │   │   │   ├── connectionStore.ts
│   │   │   │   ├── topicStore.ts
│   │   │   │   ├── messageStore.ts
│   │   │   │   └── uiStore.ts
│   │   │   ├── services/ # 服务层
│   │   │   │   ├── ipc.ts
│   │   │   │   ├── kafkaService.ts
│   │   │   │   └── storageService.ts
│   │   │   ├── hooks/   # 自定义 Hooks
│   │   │   ├── utils/   # 工具函数
│   │   │   └── styles/  # 样式文件
│   │   ├── index.html
│   │   └── vite.config.ts
│   ├── preload/         # Preload 脚本
│   │   └── index.ts
│   └── common/          # 共享代码
│       ├── types/
│       │   ├── kafka.ts
│       │   ├── connection.ts
│       │   └── message.ts
│       ├── constants/
│       │   ├── ipcChannels.ts
│       │   └── config.ts
│       └── utils/
│           ├── validation.ts
│           ├── format.ts
│           └── logger.ts
├── .eslintrc.js
├── .prettierrc
├── tsconfig.json
├── package.json
└── README.md
```

---

## 核心依赖包

### 生产依赖

```json
{
  "dependencies": {
    "electron": "^28.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "antd": "^5.12.0",
    "zustand": "^4.4.7",
    "kafkajs": "^2.2.4",
    "electron-store": "^8.1.0",
    "@ant-design/icons": "^5.2.6",
    "dayjs": "^1.11.10",
    "immer": "^10.0.3",
    "lodash-es": "^4.17.21"
  }
}
```

### 开发依赖

```json
{
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@types/node": "^20.10.5",
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8",
    "electron-builder": "^24.9.1",
    "typescript": "^5.3.3",
    "eslint": "^8.55.0",
    "prettier": "^3.1.1",
    "concurrently": "^8.2.2",
    "wait-on": "^7.2.0"
  }
}
```

---

## 开发环境配置

### TypeScript 配置

**tsconfig.json** (主进程/Preload):
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/main/**/*", "src/preload/**/*", "src/common/**/*"],
  "exclude": ["node_modules"]
}
```

**tsconfig.renderer.json** (渲染进程):
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/renderer/src/*"]
    }
  },
  "include": ["src/renderer/**/*", "src/common/**/*"]
}
```

### ESLint 配置

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  plugins: ['@typescript-eslint', 'react'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react/react-in-jsx-scope': 'off'
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};
```

### Prettier 配置

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "always"
}
```

---

## NPM 脚本详解

### 开发命令

```bash
# 启动完整开发环境（推荐）
npm run dev
# 或
yarn dev
```
**说明**：
- 先编译主进程和 Preload 脚本（TypeScript → JavaScript）
- 启动 Vite 开发服务器（端口 5173）
- 启动 Electron 应用（弹出桌面窗口）
- **会看到 Electron 桌面应用，不是浏览器！** ✅

```bash
# 仅启动渲染进程（UI开发）
npm run dev:renderer
yarn dev:renderer
```
**说明**：只启动 Vite 开发服务器，可以在浏览器中预览 UI

```bash
# 监听主进程代码变化
npm run dev:main
yarn dev:main
```
**说明**：监听 src/main/ 代码变化，自动重新编译

```bash
# 监听 Preload 代码变化
npm run dev:preload
yarn dev:preload
```
**说明**：监听 src/preload/ 代码变化，自动重新编译

```bash
# 启动 Electron 应用（需要先编译）
npm run dev:electron
yarn dev:electron
```
**说明**：等待 Vite 启动后，启动 Electron 应用

---

### 构建命令

```bash
# 完整构建（渲染进程 + 主进程 + Preload）
npm run build
yarn build
```
**说明**：
- 构建渲染进程 → dist/renderer/
- 编译主进程 → dist/main/
- 编译 Preload → dist/preload/

```bash
# 单独构建渲染进程
npm run build:renderer
yarn build:renderer
```
**说明**：使用 Vite 构建 React 应用

```bash
# 单独编译主进程
npm run build:main
yarn build:main
```
**说明**：使用 TypeScript 编译主进程代码

```bash
# 单独编译 Preload
npm run build:preload
yarn build:preload
```
**说明**：使用 TypeScript 编译 Preload 脚本

---

### 打包命令

```bash
# 打包当前平台
npm run package
yarn package
```
**说明**：
- Windows 系统 → 生成 Windows 安装包
- macOS 系统 → 生成 macOS 安装包
- Linux 系统 → 生成 Linux 安装包

```bash
# 打包 Windows 版本（推荐 Windows 用户使用）
npm run package:win
yarn package:win
```
**说明**：
- 生成 NSIS 安装程序（.exe）
- 输出到 release/ 目录
- 需要准备 resources/icon.ico

```bash
# 打包 macOS 版本
npm run package:mac
yarn package:mac
```
**说明**：
- 生成 DMG 磁盘映像
- 需要在 macOS 上运行
- 需要准备 resources/icon.icns

```bash
# 打包 Linux 版本
npm run package:linux
yarn package:linux
```
**说明**：
- 生成 AppImage 和 deb 包
- 需要准备 resources/icon.png

---

### 代码质量命令

```bash
# 检查代码规范
npm run lint
yarn lint
```
**说明**：使用 ESLint 检查代码质量

```bash
# 自动修复代码问题
npm run lint:fix
yarn lint:fix
```
**说明**：自动修复可修复的 ESLint 问题

```bash
# 格式化代码
npm run format
yarn format
```
**说明**：使用 Prettier 格式化所有代码

```bash
# 检查代码格式
npm run format:check
yarn format:check
```
**说明**：检查代码格式是否符合 Prettier 规范

```bash
# TypeScript 类型检查
npm run type-check
yarn type-check
```
**说明**：检查 TypeScript 类型错误，不生成文件

---

### 测试命令

```bash
# 运行测试
npm test
yarn test
```
**说明**：使用 Vitest 运行单元测试

```bash
# 测试 UI 界面
npm run test:ui
yarn test:ui
```
**说明**：启动 Vitest UI 界面，可视化查看测试结果

---

### 其他命令

```bash
# 初始化 Git hooks
npm run prepare
yarn prepare
```
**说明**：安装 Husky Git hooks（自动运行）

---

## Electron Builder 配置

**electron-builder.json**:
```json
{
  "appId": "com.example.kafkaclient",
  "productName": "Kafka Client",
  "directories": {
    "output": "release",
    "buildResources": "resources"
  },
  "files": [
    "dist/**/*",
    "package.json"
  ],
  "win": {
    "target": ["nsis"],
    "icon": "resources/icon.ico"
  },
  "mac": {
    "target": ["dmg"],
    "icon": "resources/icon.icns",
    "category": "public.app-category.developer-tools"
  },
  "linux": {
    "target": ["AppImage", "deb"],
    "icon": "resources/icon.png",
    "category": "Development"
  }
}
```

---

## 关键实现示例

### 1. IPC 通道定义

**src/common/constants/ipcChannels.ts**:
```typescript
export const IPC_CHANNELS = {
  // 连接管理
  CONNECTION_LIST: 'connection:list',
  CONNECTION_CREATE: 'connection:create',
  CONNECTION_UPDATE: 'connection:update',
  CONNECTION_DELETE: 'connection:delete',
  CONNECTION_TEST: 'connection:test',
  
  // 主题管理
  TOPIC_LIST: 'topic:list',
  TOPIC_DETAIL: 'topic:detail',
  TOPIC_CREATE: 'topic:create',
  TOPIC_DELETE: 'topic:delete',
  
  // 生产者
  PRODUCER_SEND: 'producer:send',
  
  // 消费者
  CONSUMER_START: 'consumer:start',
  CONSUMER_STOP: 'consumer:stop',
  CONSUMER_MESSAGE: 'consumer:message', // 主进程 -> 渲染进程
} as const;
```

### 2. Preload 脚本

**src/preload/index.ts**:
```typescript
import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../common/constants/ipcChannels';

const api = {
  // 连接管理
  connection: {
    list: () => ipcRenderer.invoke(IPC_CHANNELS.CONNECTION_LIST),
    create: (config) => ipcRenderer.invoke(IPC_CHANNELS.CONNECTION_CREATE, config),
    update: (id, config) => ipcRenderer.invoke(IPC_CHANNELS.CONNECTION_UPDATE, id, config),
    delete: (id) => ipcRenderer.invoke(IPC_CHANNELS.CONNECTION_DELETE, id),
    test: (config) => ipcRenderer.invoke(IPC_CHANNELS.CONNECTION_TEST, config),
  },
  
  // 主题管理
  topic: {
    list: (connectionId) => ipcRenderer.invoke(IPC_CHANNELS.TOPIC_LIST, connectionId),
    detail: (connectionId, topicName) => 
      ipcRenderer.invoke(IPC_CHANNELS.TOPIC_DETAIL, connectionId, topicName),
    create: (connectionId, config) => 
      ipcRenderer.invoke(IPC_CHANNELS.TOPIC_CREATE, connectionId, config),
    delete: (connectionId, topicName) => 
      ipcRenderer.invoke(IPC_CHANNELS.TOPIC_DELETE, connectionId, topicName),
  },
  
  // 生产者
  producer: {
    send: (connectionId, message) => 
      ipcRenderer.invoke(IPC_CHANNELS.PRODUCER_SEND, connectionId, message),
  },
  
  // 消费者
  consumer: {
    start: (connectionId, options) => 
      ipcRenderer.invoke(IPC_CHANNELS.CONSUMER_START, connectionId, options),
    stop: (sessionId) => 
      ipcRenderer.invoke(IPC_CHANNELS.CONSUMER_STOP, sessionId),
    onMessage: (callback) => {
      ipcRenderer.on(IPC_CHANNELS.CONSUMER_MESSAGE, (_, message) => callback(message));
    },
  },
};

contextBridge.exposeInMainWorld('kafkaApi', api);
```

### 3. TypeScript 类型定义

**src/renderer/src/types/global.d.ts**:
```typescript
export interface IElectronAPI {
  connection: {
    list: () => Promise<Connection[]>;
    create: (config: ConnectionConfig) => Promise<Connection>;
    update: (id: string, config: ConnectionConfig) => Promise<void>;
    delete: (id: string) => Promise<void>;
    test: (config: ConnectionConfig) => Promise<TestResult>;
  };
  topic: {
    list: (connectionId: string) => Promise<Topic[]>;
    detail: (connectionId: string, topicName: string) => Promise<TopicDetail>;
    create: (connectionId: string, config: CreateTopicConfig) => Promise<void>;
    delete: (connectionId: string, topicName: string) => Promise<void>;
  };
  producer: {
    send: (connectionId: string, message: ProducerMessage) => Promise<void>;
  };
  consumer: {
    start: (connectionId: string, options: ConsumeOptions) => Promise<string>;
    stop: (sessionId: string) => Promise<void>;
    onMessage: (callback: (message: ConsumerMessage) => void) => void;
  };
}

declare global {
  interface Window {
    kafkaApi: IElectronAPI;
  }
}
```

---

## 开发工作流

### 1. 启动开发环境
```bash
# 安装依赖
npm install

# 启动开发模式（同时启动渲染进程和主进程）
npm run dev
```

### 2. 代码规范检查
```bash
# 检查代码
npm run lint

# 自动修复
npm run lint:fix

# 格式化代码
npm run format
```

### 3. 构建应用
```bash
# 构建（不打包）
npm run build

# 打包为可执行文件
npm run package

# 打包 Windows 版本
npm run package:win
```

---

## 调试技巧

### 主进程调试
1. 在 VS Code 中配置调试
2. 或使用 `--inspect` 标志启动
3. Chrome DevTools 连接到 `chrome://inspect`

### 渲染进程调试
1. 在应用中打开 DevTools (Ctrl+Shift+I)
2. 或在主进程中调用 `mainWindow.webContents.openDevTools()`

---

## 测试策略

### 单元测试
- 主进程服务层测试
- 工具函数测试
- React 组件测试

### 集成测试
- IPC 通信测试
- Kafka 操作测试

### E2E 测试
- 使用 Spectron 或 Playwright
- 测试完整用户流程

---

## 发布流程

1. 更新版本号（package.json）
2. 运行测试
3. 构建应用
4. 打包所有平台
5. 创建 Release 说明
6. 上传到 GitHub Releases
7. 发布更新通知

---

## 待办事项

### 立即执行
- [ ] 初始化项目结构
- [ ] 配置开发环境
- [ ] 实现基础窗口和路由

### 短期目标（1-2周）
- [ ] 完成连接管理功能
- [ ] 完成主题列表和详情

### 中期目标（1个月）
- [ ] 完成消息生产和消费
- [ ] 完成消费组管理

### 长期目标（2-3个月）
- [ ] 完善所有功能
- [ ] 性能优化
- [ ] 发布第一个正式版本

---

## 常见问题

### Q: 如何处理大量消息的性能问题？
A: 使用虚拟滚动、分页加载、消息缓冲等技术。

### Q: 如何安全存储连接密码？
A: 使用 Electron 的 safeStorage API 加密存储。

### Q: 如何处理多个消费者会话？
A: 在主进程中维护会话映射，每个会话独立管理。

### Q: 如何实现自动更新？
A: 使用 electron-updater 库。

---

## 参考资源

- [Electron 文档](https://www.electronjs.org/docs)
- [React 文档](https://react.dev)
- [KafkaJS 文档](https://kafka.js.org)
- [Ant Design 文档](https://ant.design)
- [Zustand 文档](https://zustand-demo.pmnd.rs)
