# 如何让 AI 继续工作

这个文档提供了标准的提示词模板，用于让 AI 助手继续 Kafka Client 项目的开发工作。

---

## 📋 标准提示词模板

### 基础版（推荐）

```
继续 Kafka Client 项目开发。

查看 TODO.md 执行下一个任务。
参考 docs/PROJECT_STATUS.md 了解当前状态。

要求：
1. 遵循 docs/ARCHITECTURE.md 的架构设计
2. 完成后更新所有进度文档（PROJECT_STATUS.md、CHANGELOG.md、TODO.md）
3. 生成工作总结

开始工作。
```

### 完整版（详细指导）

```
你是 Kafka Client 项目的开发者。现在需要继续开发工作。

## 项目背景
- 项目名称：Kafka Client（基于 Electron + React + TypeScript 的 Kafka 桌面客户端）
- 当前版本：v0.2.0-dev
- 总体进度：20%

## 当前状态
- ✅ 已完成：项目规划、基础架构
- 🚧 进行中：连接管理功能开发
- 查看详情：docs/PROJECT_STATUS.md

## 下一步任务
按照 TODO.md 中的任务清单，继续开发：[具体任务]

## 技术要求
1. 遵循 TypeScript strict 模式
2. 遵循 docs/ARCHITECTURE.md 中的架构设计
3. 使用 docs/TECH_STACK.md 中定义的技术栈
4. 代码需通过 ESLint 检查
5. 遵循 docs/CONTRIBUTING.md 中的代码规范

## 工作流程
1. 阅读相关文档了解上下文
2. 实现具体功能
3. 测试代码（如果可能）
4. 更新进度文档：
   - docs/PROJECT_STATUS.md
   - docs/CHANGELOG.md
   - docs/DEVELOPMENT.md
   - TODO.md
5. 生成工作总结

请开始工作。
```

### 极简版（快速启动）

```
继续 Kafka Client 开发，下一步：[具体任务]
完成后更新进度文档。
```

---

## 🎯 不同场景的提示词

### 场景 1：继续上次未完成的工作

```
继续 Kafka Client 项目开发。

上次工作：基础架构搭建已完成
下一步：实现连接管理功能

参考文档：
- TODO.md - 任务清单
- docs/PROJECT_STATUS.md - 当前状态
- docs/FEATURES.md - 连接管理功能设计

要求：
1. 从 TODO.md 中的第一个未完成任务开始
2. 完成后更新所有进度文档
3. 生成本次工作总结

开始工作。
```

### 场景 2：开发特定功能模块

```
继续 Kafka Client 项目，专注于 [功能模块名称] 的开发。

功能模块：连接管理
参考设计：docs/FEATURES.md 第1章节
架构设计：docs/ARCHITECTURE.md 连接管理模块

具体任务：
1. 实现 electron-store 数据持久化
2. 实现 KafkaConnectionManager 服务
3. 实现连接 CRUD 功能
4. 实现连接测试功能

要求：
- 严格遵循架构设计
- 完整的 TypeScript 类型定义
- 完成后更新进度文档

开始工作。
```

### 场景 3：修复问题或优化

```
Kafka Client 项目 - 修复/优化任务

任务类型：[Bug修复 / 性能优化 / 代码重构]
问题描述：[具体描述]

要求：
1. 定位问题
2. 实施修复/优化
3. 测试验证
4. 更新 docs/CHANGELOG.md（在"修复"章节）

开始工作。
```

### 场景 4：添加新功能

```
Kafka Client 项目 - 新功能开发

新功能：[功能名称]
功能描述：[详细描述]

要求：
1. 检查是否与现有架构兼容
2. 实现功能
3. 更新 docs/FEATURES.md 添加功能说明
4. 更新进度文档

开始工作。
```

---

## 📝 必须更新的文档清单

每次完成工作后，**必须检查并更新**以下文档：

### 核心进度文档（每次必更新）

1. ✅ **docs/PROJECT_STATUS.md**
   - 更新总体进度百分比
   - 更新当前阶段状态
   - 添加已完成内容
   - 更新里程碑状态

2. ✅ **docs/CHANGELOG.md**
   - 在对应版本下添加变更记录
   - 使用正确的变更类型标签（新增/修复/变更等）

3. ✅ **TODO.md** 或 **TODO List**
   - 标记已完成的任务为 ✅
   - 添加新发现的任务
   - 更新任务优先级

### 可选文档（根据情况更新）

4. **docs/DEVELOPMENT.md**
   - 如果实现了新的技术方案
   - 如果添加了新的开发流程

5. **docs/FEATURES.md**
   - 如果实现了新功能
   - 如果功能设计有变更

6. **docs/ARCHITECTURE.md**
   - 如果架构有调整
   - 如果添加了新的模块

---

## 🔄 标准工作流程

```
1. 接收任务
   ↓
2. 查看文档了解上下文
   - docs/PROJECT_STATUS.md
   - TODO.md
   - 相关技术文档
   ↓
3. 开始实现功能
   - 编写代码
   - 遵循规范
   ↓
4. 完成开发
   ↓
5. 更新进度文档 ⚠️ 重要！
   - PROJECT_STATUS.md
   - CHANGELOG.md
   - TODO.md
   ↓
6. 生成工作总结
   - 列出完成的内容
   - 列出更新的文档
   - 说明下一步计划
```

---

## 💡 提示词要点

### ✅ 好的提示词特征

1. **明确任务** - 清楚说明要做什么
2. **提供上下文** - 指明相关文档位置
3. **明确要求** - 说明完成后要更新文档
4. **具体目标** - 给出具体的完成标准

### ❌ 避免的提示词

1. ❌ "继续" - 太模糊
2. ❌ "做下一个功能" - 没有具体指明
3. ❌ "开发" - 没有上下文
4. ❌ "写代码" - 没有目标

### ✅ 推荐的提示词

1. ✅ "继续 Kafka Client 项目，下一步：实现连接管理"
2. ✅ "按照 TODO.md 继续开发，完成后更新进度文档"
3. ✅ "开发连接测试功能，参考 docs/FEATURES.md"

---

## 📋 快速检查清单

每次工作完成前，请确认：

```markdown
开发完成检查清单：
- [ ] 代码已编写完成
- [ ] 遵循了架构设计
- [ ] TypeScript 类型完整
- [ ] 代码符合规范

文档更新检查清单：
- [ ] PROJECT_STATUS.md 已更新
- [ ] CHANGELOG.md 已更新
- [ ] TODO.md 已更新
- [ ] 其他相关文档已更新（如需要）

输出检查清单：
- [ ] 生成了工作总结
- [ ] 列出了完成的功能
- [ ] 列出了更新的文档
- [ ] 说明了下一步计划
```

---

## 🎯 示例对话

### 示例 1：继续开发

**你的提示**:
```
继续 Kafka Client 项目开发。
查看 TODO.md，从第一个未完成的任务开始。
完成后更新 PROJECT_STATUS.md、CHANGELOG.md 和 TODO.md。
```

**AI 会**:
1. ✅ 读取 TODO.md 查看任务
2. ✅ 读取 PROJECT_STATUS.md 了解当前状态
3. ✅ 开始实现功能
4. ✅ 更新所有进度文档
5. ✅ 生成工作总结

### 示例 2：开发特定功能

**你的提示**:
```
Kafka Client 项目 - 实现连接管理的数据存储功能。
使用 electron-store，参考 docs/ARCHITECTURE.md 第2.4节。
完成后更新进度文档。
```

**AI 会**:
1. ✅ 读取架构文档了解设计
2. ✅ 实现 electron-store 集成
3. ✅ 实现数据存储逻辑
4. ✅ 更新进度文档
5. ✅ 生成总结

---

## 📌 保存为快捷短语

建议将以下提示词保存为快捷短语或文本片段：

### 快捷短语 1: "继续开发"
```
继续 Kafka Client 开发，查看 TODO.md 执行下一个任务，完成后更新进度文档。
```

### 快捷短语 2: "开发功能"
```
Kafka Client - 开发[功能名]，参考 docs/FEATURES.md 和 ARCHITECTURE.md，完成后更新进度文档。
```

### 快捷短语 3: "修复问题"
```
Kafka Client - 修复[问题描述]，完成后更新 CHANGELOG.md。
```

---

## 🎓 最佳实践

### 1. 每次都提供上下文
- 提到项目名称：Kafka Client
- 指明参考文档：TODO.md, PROJECT_STATUS.md
- 说明期望输出：更新进度文档

### 2. 明确完成标准
- 功能实现完整
- 代码通过检查
- 文档已更新
- 生成工作总结

### 3. 分阶段进行
如果任务很大，可以分阶段：
```
Kafka Client - 连接管理开发，第一阶段：实现数据存储。
只做这一部分，完成后等待下一步指示。
```

### 4. 定期总结
每完成一个大功能后：
```
Kafka Client - 总结连接管理功能的开发进度，
更新所有文档，并规划下一步工作。
```

---

## 🔗 相关文档

- [项目状态](docs/PROJECT_STATUS.md) - 查看当前进度
- [任务清单](TODO.md) - 查看待办事项
- [架构设计](docs/ARCHITECTURE.md) - 了解系统设计
- [功能规划](docs/FEATURES.md) - 了解功能详情
- [贡献指南](docs/CONTRIBUTING.md) - 了解开发规范

---

## 📞 需要帮助？

如果不确定如何继续，可以问：
- "查看当前项目状态，告诉我下一步应该做什么"
- "我想开发[功能]，需要准备什么"
- "总结一下当前进度和待办事项"

---

<div align="center">

**将这个文档加入书签，每次继续工作时参考！** 📌

**标准提示词 = 高效协作** ⚡

</div>

---

---

## 📝 工作总结文档规范

### ⚠️ 重要：文档位置

**所有工作总结文档（WORK_SUMMARY*.md）必须保存在 `docs/summaries/` 目录下！**

#### 文件命名规范
- 格式: `WORK_SUMMARY_<序号>_<功能名称>.md`
- 示例:
  - `docs/summaries/WORK_SUMMARY_6_CONSUMER_GROUP.md`
  - `docs/summaries/WORK_SUMMARY_7_DASHBOARD.md`

#### 生成工作总结时的操作
```typescript
// ✅ 正确
write({
  file_path: 'docs/summaries/WORK_SUMMARY_10_ERROR_HANDLING.md',
  contents: '...'
})

// ❌ 错误 - 不要在根目录创建
write({
  file_path: 'WORK_SUMMARY_10_ERROR_HANDLING.md',
  contents: '...'
})
```

### 相关文档
- 详细规范请参考: [docs/AI_WORKFLOW.md](docs/AI_WORKFLOW.md)
- 工作总结目录: [docs/summaries/](docs/summaries/)

---

最后更新：2026-01-13
