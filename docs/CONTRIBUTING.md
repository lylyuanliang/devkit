# 贡献指南

感谢你对 Kafka Client 项目感兴趣！我们欢迎任何形式的贡献。

---

## 贡献方式

你可以通过以下方式为项目做出贡献：

- 🐛 报告 Bug
- 💡 提出新功能建议
- 📝 改进文档
- 🔧 提交代码修复或新功能
- 🧪 编写测试
- 🌍 翻译文档

---

## 开发环境设置

### 前置要求

- Node.js >= 18.0.0
- npm >= 9.0.0 或 pnpm >= 8.0.0
- Git
- 一个本地的 Kafka 集群（用于测试）

### 克隆项目

```bash
git clone https://github.com/yourusername/kafka_client.git
cd kafka_client
```

### 安装依赖

```bash
npm install
```

### 启动开发环境

```bash
npm run dev
```

这将同时启动：
- Vite 开发服务器（渲染进程）
- Electron 主进程

### 运行测试

```bash
# 运行所有测试
npm test

# 运行特定测试
npm test -- connection

# 监听模式
npm test -- --watch
```

### 代码检查

```bash
# 检查代码规范
npm run lint

# 自动修复
npm run lint:fix

# 格式化代码
npm run format
```

---

## 代码规范

### TypeScript

- 使用 TypeScript strict 模式
- 所有函数都应该有明确的返回类型
- 避免使用 `any`，使用 `unknown` 或具体类型
- 使用接口定义数据结构

**好的示例**:
```typescript
interface Connection {
  id: string;
  name: string;
  brokers: string[];
}

function getConnection(id: string): Connection | null {
  // ...
}
```

**不好的示例**:
```typescript
function getConnection(id: any): any {
  // ...
}
```

### React

- 使用函数组件和 Hooks
- 使用 `React.memo` 优化性能
- 合理使用 `useMemo` 和 `useCallback`
- Props 和 State 使用 TypeScript 接口定义

**好的示例**:
```typescript
interface TopicListProps {
  connectionId: string;
  onTopicSelect: (topic: string) => void;
}

export const TopicList: React.FC<TopicListProps> = React.memo(({ 
  connectionId, 
  onTopicSelect 
}) => {
  // ...
});
```

### 命名规范

- **组件**: PascalCase（`TopicList.tsx`）
- **文件**: camelCase（`kafkaService.ts`）
- **常量**: UPPER_SNAKE_CASE（`IPC_CHANNELS`）
- **接口**: PascalCase，以 `I` 开头（可选）
- **类型**: PascalCase

### 文件组织

```typescript
// 1. 导入 - 按类型分组
import React, { useState, useEffect } from 'react';
import { Button, Table } from 'antd';
import { TopicService } from '@/services/kafkaService';
import type { Topic } from '@/types/kafka';

// 2. 类型定义
interface Props {
  // ...
}

// 3. 常量
const DEFAULT_PAGE_SIZE = 20;

// 4. 组件
export const Component: React.FC<Props> = ({ ... }) => {
  // 5. Hooks
  const [state, setState] = useState();
  
  // 6. 副作用
  useEffect(() => {
    // ...
  }, []);
  
  // 7. 事件处理函数
  const handleClick = () => {
    // ...
  };
  
  // 8. 渲染
  return (
    // ...
  );
};
```

### 注释规范

- 使用 JSDoc 注释复杂的函数
- 注释应该解释"为什么"而不是"是什么"
- 避免冗余注释

```typescript
/**
 * 创建 Kafka 连接
 * @param config 连接配置
 * @returns 连接 ID
 * @throws {ConnectionError} 连接失败时抛出
 */
async function createConnection(config: ConnectionConfig): Promise<string> {
  // 使用 UUID 而不是自增 ID，避免并发冲突
  const id = generateUUID();
  // ...
}
```

---

## 提交规范

### Commit Message 格式

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type 类型**:
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响代码运行的变动）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

**Scope 范围**:
- `connection`: 连接管理
- `topic`: 主题管理
- `producer`: 生产者
- `consumer`: 消费者
- `ui`: 用户界面
- `deps`: 依赖更新

**示例**:
```
feat(topic): 添加主题创建功能

- 实现主题创建表单
- 添加表单验证
- 集成 Kafka Admin API

Closes #12
```

```
fix(consumer): 修复消息重复消费问题

修复了由于 offset 提交失败导致的消息重复消费问题

Fixes #45
```

### 分支策略

- `main`: 主分支，保持稳定
- `develop`: 开发分支
- `feature/xxx`: 功能分支
- `fix/xxx`: Bug 修复分支
- `docs/xxx`: 文档分支

**工作流程**:
```bash
# 1. 从 develop 创建功能分支
git checkout develop
git pull origin develop
git checkout -b feature/topic-management

# 2. 开发和提交
git add .
git commit -m "feat(topic): 实现主题列表"

# 3. 推送到远程
git push origin feature/topic-management

# 4. 创建 Pull Request
```

---

## Pull Request 流程

### 提交 PR 前

1. ✅ 确保代码通过所有测试
2. ✅ 确保代码通过 ESLint 检查
3. ✅ 更新相关文档
4. ✅ 添加必要的测试
5. ✅ Rebase 到最新的 develop 分支

```bash
git checkout develop
git pull origin develop
git checkout feature/xxx
git rebase develop
```

### PR 描述模板

```markdown
## 变更类型
- [ ] Bug 修复
- [ ] 新功能
- [ ] 重构
- [ ] 文档更新
- [ ] 其他

## 变更说明
<!-- 简要描述你的变更 -->

## 相关 Issue
<!-- Closes #123 -->

## 测试
<!-- 描述如何测试这个变更 -->

## 截图（如果适用）
<!-- 添加截图帮助理解变更 -->

## Checklist
- [ ] 代码通过所有测试
- [ ] 代码通过 ESLint 检查
- [ ] 已更新文档
- [ ] 已添加测试
- [ ] Commit message 遵循规范
```

### Review 流程

1. 至少需要一位维护者批准
2. 所有讨论必须解决
3. 通过所有自动化检查
4. 合并到 develop 分支

---

## 报告 Bug

### Bug 报告模板

在 GitHub Issues 中使用以下模板：

```markdown
## Bug 描述
<!-- 清晰简洁地描述 Bug -->

## 复现步骤
1. 打开应用
2. 点击 '...'
3. 看到错误

## 预期行为
<!-- 描述你期望发生什么 -->

## 实际行为
<!-- 描述实际发生了什么 -->

## 截图
<!-- 如果适用，添加截图 -->

## 环境信息
- OS: [e.g. Windows 11, macOS 13]
- 应用版本: [e.g. 0.5.0]
- Kafka 版本: [e.g. 3.6.0]

## 附加信息
<!-- 其他相关信息 -->
```

---

## 提出新功能

### 功能请求模板

```markdown
## 功能描述
<!-- 清晰简洁地描述你想要的功能 -->

## 使用场景
<!-- 描述为什么需要这个功能 -->

## 期望的解决方案
<!-- 描述你期望的实现方式 -->

## 替代方案
<!-- 描述你考虑过的替代方案 -->

## 附加信息
<!-- 其他相关信息或截图 -->
```

---

## 测试指南

### 单元测试

使用 Vitest 编写单元测试：

```typescript
import { describe, it, expect } from 'vitest';
import { validateBrokerAddress } from '@/utils/validation';

describe('validateBrokerAddress', () => {
  it('应该验证正确的 broker 地址', () => {
    expect(validateBrokerAddress('localhost:9092')).toBe(true);
    expect(validateBrokerAddress('kafka.example.com:9092')).toBe(true);
  });

  it('应该拒绝错误的 broker 地址', () => {
    expect(validateBrokerAddress('invalid')).toBe(false);
    expect(validateBrokerAddress('localhost')).toBe(false);
  });
});
```

### 集成测试

测试 IPC 通信和 Kafka 操作：

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { KafkaConnectionManager } from '@/main/services/KafkaConnectionManager';

describe('KafkaConnectionManager', () => {
  let manager: KafkaConnectionManager;

  beforeAll(() => {
    manager = new KafkaConnectionManager();
  });

  afterAll(async () => {
    await manager.closeAll();
  });

  it('应该能够创建连接', async () => {
    const id = await manager.createConnection({
      name: 'Test Connection',
      brokers: ['localhost:9092'],
    });
    expect(id).toBeDefined();
  });
});
```

### E2E 测试

使用 Playwright 测试完整用户流程。

---

## 文档贡献

### 文档结构

- `README.md`: 项目概览
- `docs/ARCHITECTURE.md`: 架构设计
- `docs/FEATURES.md`: 功能详细说明
- `docs/DEVELOPMENT.md`: 开发指南
- `docs/TECH_STACK.md`: 技术栈说明
- `docs/ROADMAP.md`: 产品路线图
- `docs/CONTRIBUTING.md`: 本文档

### 文档规范

- 使用清晰的标题层级
- 提供代码示例
- 添加截图（如果需要）
- 保持简洁明了
- 检查拼写和语法

---

## 性能优化指南

### React 性能

1. 使用 `React.memo` 避免不必要的重渲染
2. 使用 `useMemo` 缓存计算结果
3. 使用 `useCallback` 缓存函数引用
4. 使用虚拟滚动处理大列表
5. 懒加载路由组件

### Kafka 操作

1. 复用连接，避免频繁创建
2. 批量操作而不是单条操作
3. 合理设置 buffer 和 batch 大小
4. 使用消息缓冲避免频繁 UI 更新

### Electron

1. 避免主进程阻塞
2. 合理使用 Web Worker
3. 及时清理资源
4. 优化 IPC 通信频率

---

## 发布流程

（仅维护者）

1. 更新版本号（`package.json`）
2. 更新 `CHANGELOG.md`
3. 运行测试
4. 创建 Git tag
5. 构建所有平台
6. 创建 GitHub Release
7. 发布公告

---

## 行为准则

### 我们的承诺

为了营造开放和友好的环境，我们承诺：
- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 专注于对社区最有利的事情
- 对其他社区成员表现出同理心

### 不可接受的行为

- 使用性化的语言或图像
- 恶意评论、侮辱或人身攻击
- 公开或私下骚扰
- 未经许可发布他人私人信息
- 其他不道德或不专业的行为

---

## 获得帮助

如果你有任何问题：

- 📖 查看[文档](../README.md)
- 💬 在 GitHub Discussions 发帖
- 🐛 在 GitHub Issues 提问
- 📧 联系维护者

---

## 致谢

感谢所有为这个项目做出贡献的人！

---

**记住**: 你的贡献，无论大小，都是有价值的。我们感谢你的时间和努力！ 🎉
