# 项目配置和问题解决记录

**创建时间**: 2026-01-13  
**适用版本**: v0.6.0-MVP

本文档记录了项目启动、开发和打包过程中遇到的问题及解决方案。

---

## 📋 目录

1. [开发环境配置](#开发环境配置)
2. [启动问题解决](#启动问题解决)
3. [TypeScript 路径配置](#typescript-路径配置)
4. [界面美化实现](#界面美化实现)
5. [标签页功能](#标签页功能)
6. [打包配置优化](#打包配置优化)

---

## 开发环境配置

### Node.js 版本

**要求**: >= 18.0.0  
**测试版本**: 22.11.0 ✅  
**结论**: Node.js 22.x 完全兼容

### 包管理器

**支持**:
- ✅ npm >= 9.0.0
- ✅ yarn >= 1.22.0
- ✅ pnpm >= 8.0.0

**推荐**: 使用 Yarn 1.22+ （速度更快）

---

## 启动问题解决

### 问题1：找不到 dist/main/index.js

**错误信息**:
```
Cannot find module 'C:\...\dist\main\index.js'
Please verify that the package.json has a valid "main" entry
```

**原因**: 主进程的 TypeScript 代码还没有编译

**解决方案**: 修改 `package.json` 中的 dev 脚本

```json
{
  "scripts": {
    "dev": "npm run build:main && npm run build:preload && concurrently \"npm run dev:renderer\" \"npm run dev:electron\""
  }
}
```

**说明**: 先编译主进程和 Preload，再启动 Electron

---

### 问题2：TypeScript 编译错误 - rootDir 问题

**错误信息**:
```
error TS6059: File '.../src/common/types/index.ts' is not under 'rootDir' '.../src/main'
```

**原因**: `tsconfig.main.json` 的 `rootDir` 设置为 `./src/main`，但 `include` 包含了 `src/common/**/*`

**解决方案**: 修改 `tsconfig.main.json` 和 `tsconfig.preload.json`

```json
{
  "compilerOptions": {
    "outDir": "./dist",
    // 移除 rootDir 限制
    "skipLibCheck": true
  },
  "include": ["src/main/**/*", "src/common/**/*"],
  "exclude": ["node_modules", "dist", "src/renderer", "src/preload"]
}
```

---

### 问题3：路径别名解析失败

**错误信息**:
```
Cannot find module '@common/constants/ipcChannels'
```

**原因**: 
- TypeScript 编译后，`@common/*` 别名被保留
- Node.js 运行时不认识路径别名

**解决方案**: 将主进程和 Preload 中的所有 `@common/*` 导入改为相对路径

**修改文件**:
- src/main/ipc/index.ts
- src/main/services/*.ts
- src/main/storage/*.ts
- src/preload/index.ts

**修改示例**:
```typescript
// 之前
import { IPC_CHANNELS } from '@common/constants/ipcChannels';

// 之后
import { IPC_CHANNELS } from '../../common/constants/ipcChannels';
```

**渲染进程**: 可以继续使用相对路径（Vite 会正确处理）

---

### 问题4：Sandbox 模式导致 API 不可用

**错误信息**:
```
Cannot read properties of undefined (reading 'connection')
```

**原因**: Electron 的 sandbox 模式可能导致 `window.kafkaApi` 暴露失败

**解决方案**: 在开发环境禁用 sandbox

```typescript
// src/main/index.ts
const mainWindow = new BrowserWindow({
  webPreferences: {
    preload: path.join(__dirname, '../preload/index.js'),
    nodeIntegration: false,
    contextIsolation: true,
    sandbox: false, // 开发环境禁用
  },
});
```

---

## TypeScript 路径配置

### 最终配置

**tsconfig.main.json**:
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"],
    "module": "commonjs",
    "moduleResolution": "node",
    "outDir": "./dist",
    "noEmit": false,
    "baseUrl": ".",
    "skipLibCheck": true
  },
  "include": ["src/main/**/*", "src/common/**/*"],
  "exclude": ["node_modules", "dist", "src/renderer", "src/preload"]
}
```

**tsconfig.preload.json**:
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "module": "commonjs",
    "moduleResolution": "node",
    "outDir": "./dist",
    "noEmit": false,
    "baseUrl": ".",
    "skipLibCheck": true
  },
  "include": ["src/preload/**/*", "src/common/**/*"],
  "exclude": ["node_modules", "dist", "src/renderer", "src/main"]
}
```

**关键点**:
- ✅ `outDir` 统一为 `./dist`
- ✅ 移除 `rootDir` 限制
- ✅ 添加 `skipLibCheck: true`
- ✅ 正确的 include 和 exclude

---

## 界面美化实现

### 全局样式优化

**文件**: `src/renderer/src/styles/index.css`

**主要改动**:
1. **渐变背景**
   ```css
   body {
     background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
   }
   ```

2. **美化滚动条**
   ```css
   ::-webkit-scrollbar-thumb {
     background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
     border-radius: 10px;
   }
   ```

3. **卡片悬浮效果**
   ```css
   .ant-card:hover {
     box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12) !important;
     transform: translateY(-2px);
   }
   ```

4. **按钮渐变**
   ```css
   .ant-btn-primary {
     background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
   }
   ```

---

### Logo 区域美化

**文件**: `src/renderer/src/components/Layout/index.css`

**特性**:
- 紫色渐变背景
- 脉动动画效果
- 文字渐变效果

```css
.logo {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.logo::before {
  animation: pulse 4s ease-in-out infinite;
}
```

---

### 仪表盘美化

**文件**: `src/renderer/src/pages/Dashboard/index.tsx`

**改进**:
- 4种渐变色统计卡片
- 快速开始指南
- 功能特性列表
- 卡片悬浮动画

**渐变配色**:
- 紫色（连接数）
- 粉色（主题数）
- 蓝色（消费组）
- 绿色（消息数）

---

## 标签页功能

### 实现的功能

**文件**: 
- `src/renderer/src/stores/navigationStore.ts`
- `src/renderer/src/components/Layout/index.tsx`

**功能特性**:
1. **多标签页管理**
   - 点击侧边栏菜单自动打开新标签
   - 重复点击不会重复打开
   - 标签页可以关闭（仪表盘除外）

2. **状态保持**
   - 切换标签时保持页面状态
   - 表单内容不丢失
   - 实现方式：所有打开的页面都保持挂载，用 `display` 控制显示隐藏

3. **用户体验**
   - 类似浏览器的标签页
   - 点击标签切换页面
   - 点击 × 关闭标签
   - 关闭当前标签自动切换到上一个

**核心代码**:
```typescript
// 渲染所有已打开的标签页
{tabs.map((tab) => {
  const isActive = location.pathname === tab.key;
  const Component = componentMap[tab.key];
  
  return (
    <div
      key={tab.key}
      style={{ display: isActive ? 'block' : 'none' }}
    >
      <Component />
    </div>
  );
})}
```

---

## 打包配置优化

### 遇到的问题

**问题**: electron-builder 下载代码签名工具失败

**错误信息**:
```
ERROR: Cannot create symbolic link
需要管理员权限
```

**原因**:
- electron-builder 默认需要代码签名
- 下载 winCodeSign 工具（从 GitHub）
- 解压时需要创建符号链接（需要管理员权限）
- 国内网络可能下载失败

---

### 解决方案

#### 方案1：使用简单打包（推荐）✅

**添加脚本**:
```json
{
  "scripts": {
    "package:win:simple": "npm run build && npx --yes electron-packager . KafkaClient --platform=win32 --arch=x64 --out=release --overwrite --ignore=\"(src|docs|node_modules/.cache|.git)\""
  }
}
```

**使用方式**:
```bash
yarn package:win:simple
```

**优点**:
- 不需要代码签名
- 不需要下载额外工具
- 打包速度快（1-2分钟）
- 生成文件夹形式（可直接运行）

**输出**:
```
release/
└── KafkaClient-win32-x64/
    └── Kafka Client.exe  # 双击运行
```

---

#### 方案2：配置 electron-builder

**创建文件**: `electron-builder.yml`

```yaml
appId: com.kafka-client.app
productName: Kafka Client
directories:
  output: release
files:
  - dist/**/*
  - package.json
  - '!**/*.map'
  - '!**/*.md'
win:
  target:
    - target: dir  # 文件夹形式，不需要签名
      arch:
        - x64
forceCodeSigning: false  # 禁用代码签名
```

**使用方式**:
```bash
yarn package:win
```

---

### 清理脚本

**添加的脚本**:
```json
{
  "scripts": {
    "clean": "node -e \"require('fs').rmSync('dist', {recursive:true, force:true}); require('fs').rmSync('release', {recursive:true, force:true})\"",
    "clean:dist": "node -e \"require('fs').rmSync('dist', {recursive:true, force:true})\"",
    "clean:release": "node -e \"require('fs').rmSync('release', {recursive:true, force:true})\"",
    "prebuild": "npm run clean:dist",
    "prepackage": "npm run clean"
  }
}
```

**说明**:
- `clean` - 清理 dist 和 release
- `clean:dist` - 只清理 dist
- `clean:release` - 只清理 release
- `prebuild` - 构建前自动清理 dist
- `prepackage` - 打包前自动清理所有

---

## 常用命令速查

### 开发命令

```bash
# 启动开发环境（会弹出 Electron 桌面应用窗口）
yarn dev

# 只启动渲染进程（浏览器预览）
yarn dev:renderer

# 清理编译输出
yarn clean
```

---

### 打包命令

```bash
# 方式1：简单打包（推荐，不需要签名）
yarn package:win:simple

# 方式2：使用 electron-builder（需要配置签名或网络好）
yarn package:win

# 清理后打包
yarn clean && yarn package:win:simple
```

---

## 文件路径规范

### 主进程和 Preload

**规则**: 必须使用相对路径

```typescript
// ✅ 正确
import { IPC_CHANNELS } from '../../common/constants/ipcChannels';
import type { ConnectionConfig } from '../../common/types/connection';

// ❌ 错误（运行时找不到模块）
import { IPC_CHANNELS } from '@common/constants/ipcChannels';
```

**原因**: 
- TypeScript 编译后别名不会被转换
- Node.js 不认识路径别名

---

### 渲染进程

**规则**: 可以使用相对路径（推荐）或别名

```typescript
// ✅ 推荐（稳定）
import type { Topic } from '../../../../common/types/kafka';

// ⚠️ 可用（需要配置 Vite）
import type { Topic } from '@common/types/kafka';
```

**说明**: 
- Vite 会处理路径别名
- 但为了统一，建议都用相对路径

---

## 已修改的文件清单

### 配置文件

1. **package.json**
   - 修改 dev 脚本（先编译再启动）
   - 添加 clean 脚本
   - 添加 package:win:simple 脚本
   - 优化 build 配置

2. **tsconfig.main.json**
   - 修改 outDir 为 `./dist`
   - 移除 rootDir 限制
   - 添加 skipLibCheck

3. **tsconfig.preload.json**
   - 修改 outDir 为 `./dist`
   - 移除 rootDir 限制
   - 添加 skipLibCheck

4. **electron-builder.yml** (新增)
   - 配置打包选项
   - 禁用代码签名
   - 使用 dir 目标

5. **.npmignore** (新增)
   - 打包时排除文档和源代码

6. **.yarnrc** (新增)
   - 配置 Electron 镜像

---

### 主进程文件（路径别名改为相对路径）

7. **src/main/index.ts**
   - 添加消费者服务窗口引用
   - 调整窗口配置（禁用 sandbox）

8. **src/main/ipc/index.ts**
   - `@common/*` → `../../common/*`

9. **src/main/services/KafkaConnectionManager.ts**
   - `@common/*` → `../../common/*`
   - 修复 SASL 类型问题
   - 修复 controller 类型问题

10. **src/main/services/KafkaAdminService.ts**
    - `@common/*` → `../../common/*`
    - 移除不存在的导入

11. **src/main/services/KafkaProducerService.ts**
    - `@common/*` → `../../common/*`

12. **src/main/services/KafkaConsumerService.ts**
    - `@common/*` → `../../common/*`
    - 修复异步函数返回类型

13. **src/main/storage/ConnectionStore.ts**
    - `@common/*` → `../../common/*`

14. **src/preload/index.ts**
    - `@common/*` → `../common/*`

---

### 渲染进程文件（路径别名改为相对路径）

15. **src/renderer/src/App.tsx**
    - 简化路由配置

16. **src/renderer/src/components/Layout/index.tsx**
    - 实现多标签页功能
    - 实现状态保持
    - 美化样式

17. **src/renderer/src/components/Layout/index.css**
    - 添加 Logo 渐变和动画
    - 优化样式

18. **src/renderer/src/pages/Dashboard/index.tsx**
    - 重新设计仪表盘
    - 添加渐变卡片
    - 添加快速开始指南

19. **src/renderer/src/pages/Dashboard/index.css** (新增)
    - 仪表盘动画效果

20. **src/renderer/src/pages/Consumer/index.tsx**
    - 添加缺失的 Input 导入
    - `@common/*` → `../../../../common/*`

21. **src/renderer/src/pages/Producer/index.tsx**
    - `@common/*` → `../../../../common/*`

22. **src/renderer/src/pages/Topics/index.tsx**
    - `@common/*` → `../../../../common/*`

23. **src/renderer/src/pages/Connections/index.tsx**
    - `@common/*` → `../../../../common/*`

24. **src/renderer/src/components/ConnectionForm/index.tsx**
    - `@common/*` → `../../../../common/*`

25. **src/renderer/src/components/CreateTopicForm/index.tsx**
    - `@common/*` → `../../../../common/*`

26. **src/renderer/src/components/TopicDetailDrawer/index.tsx**
    - `@common/*` → `../../../../common/*`

27. **src/renderer/src/stores/navigationStore.ts**
    - 实现标签页状态管理

28. **src/renderer/src/stores/connectionStore.ts**
    - `@common/*` → `../../../common/*`
    - 添加 API 可用性检查

29. **src/renderer/src/stores/topicStore.ts**
    - `@common/*` → `../../../common/*`

30. **src/renderer/src/stores/producerStore.ts**
    - `@common/*` → `../../../common/*`

31. **src/renderer/src/stores/consumerStore.ts**
    - `@common/*` → `../../../common/*`

32. **src/renderer/src/styles/index.css**
    - 添加全局渐变样式
    - 美化所有 Ant Design 组件

---

## 快速问题排查

### 启动问题

**症状**: 无法启动，报错找不到模块

**检查步骤**:
1. 删除 dist 目录：`yarn clean:dist`
2. 重新运行：`yarn dev`

---

### 编译问题

**症状**: TypeScript 编译错误

**检查步骤**:
1. 运行类型检查：`yarn type-check`
2. 检查 tsconfig 配置
3. 检查导入路径是否使用相对路径

---

### 打包问题

**症状**: 打包卡住或失败

**快速解决**:
```bash
# 使用简单打包方式
yarn package:win:simple
```

**完整解决**:
```bash
# 1. 清理
yarn clean

# 2. 构建测试
yarn build

# 3. 简单打包
yarn package:win:simple
```

---

## 开发建议

### 路径导入规范

**统一使用相对路径**（推荐）:
- ✅ 主进程：相对路径（必须）
- ✅ Preload：相对路径（必须）
- ✅ 渲染进程：相对路径（推荐）

**好处**:
- 不依赖构建工具配置
- 跨平台兼容性好
- 不会有路径解析问题

---

### 清理习惯

**开发时**:
```bash
# 遇到问题先清理
yarn clean:dist
yarn dev
```

**打包时**:
```bash
# 打包前清理（自动执行）
yarn package:win:simple
```

---

### 调试技巧

**主进程调试**:
- 查看终端输出
- console.log 会显示在终端

**渲染进程调试**:
- 在应用中按 F12
- 查看 Console 和 Network

**Preload 调试**:
- 在 Preload 脚本中 console.log
- 在渲染进程 DevTools 中查看

---

## 性能优化建议

### 代码分割

**当前状态**: 单个 1.1MB 的 JS 文件

**优化建议** (未来):
```typescript
// 使用动态导入
const Dashboard = lazy(() => import('./pages/Dashboard'));
```

**配置 Vite**:
```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor': ['react', 'react-dom'],
        'antd': ['antd'],
        'icons': ['@ant-design/icons'],
      }
    }
  }
}
```

---

## 总结

### 关键配置

1. ✅ **使用相对路径导入** - 避免模块找不到
2. ✅ **先编译再启动** - package.json dev 脚本顺序
3. ✅ **禁用 sandbox** - 开发环境
4. ✅ **简单打包方式** - 使用 electron-packager

### 成功标志

**开发环境**:
```bash
yarn dev
→ 编译成功
→ Vite 启动
→ Electron 窗口弹出 ✅
```

**打包**:
```bash
yarn package:win:simple
→ 清理
→ 构建
→ 打包
→ 生成 release/KafkaClient-win32-x64/ ✅
```

---

## 附录：完整启动流程

```bash
# 1. 克隆项目
git clone <repo>
cd kafka_client

# 2. 安装依赖
yarn install

# 3. 启动开发环境
yarn dev
# 等待 5-10 秒，Electron 窗口会弹出

# 4. 开发和测试
# 修改代码，自动热重载

# 5. 打包应用
yarn clean
yarn package:win:simple
# 等待 1-2 分钟，生成 release/KafkaClient-win32-x64/

# 6. 运行打包后的应用
# 进入 release/KafkaClient-win32-x64/
# 双击 Kafka Client.exe
```

---

**最后更新**: 2026-01-13  
**适用版本**: v0.6.0-MVP
