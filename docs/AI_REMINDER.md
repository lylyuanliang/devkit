# AI 助手工作提醒文档

本文档用于提醒 AI 助手在生成工作总结时的文档位置要求。

## ⚠️ 重要提醒

### 工作总结文档位置

**所有工作总结文档（WORK_SUMMARY*.md）必须保存在 `docs/summaries/` 目录下！**

#### ✅ 正确的做法

```typescript
// 生成工作总结时，使用以下路径格式
write({
  file_path: 'docs/summaries/WORK_SUMMARY_<序号>_<功能名称>.md',
  contents: '...'
})
```

#### ❌ 错误的做法

```typescript
// 不要在项目根目录创建工作总结文档
write({
  file_path: 'WORK_SUMMARY_<序号>_<功能名称>.md',  // ❌ 错误！
  contents: '...'
})
```

## 📋 文件命名规范

- 格式: `WORK_SUMMARY_<序号>_<功能名称>.md`
- 示例:
  - `docs/summaries/WORK_SUMMARY_6_CONSUMER_GROUP.md`
  - `docs/summaries/WORK_SUMMARY_7_DASHBOARD.md`
  - `docs/summaries/WORK_SUMMARY_8_SETTINGS.md`
  - `docs/summaries/WORK_SUMMARY_9_PERFORMANCE.md`
  - `docs/summaries/WORK_SUMMARY_10_ERROR_HANDLING.md` (下一个)

## 🔗 相关文档

- [AI工作流程规范](AI_WORKFLOW.md) - 详细的工作流程和规范
- [工作总结目录](summaries/README.md) - 所有工作总结文档
- [开发指南](DEVELOPMENT.md) - 包含工作总结文档规范

## 💡 如何让 AI 记住这个约定

### 方法 1: 在提示词中明确说明

在每次要求生成工作总结时，在提示词中添加：

```
生成工作总结（必须保存到 docs/summaries/ 目录，参考 docs/AI_WORKFLOW.md）
```

### 方法 2: 在 HOW_TO_CONTINUE.md 中已更新

标准提示词模板已更新，包含文档位置要求。

### 方法 3: 参考 AI_WORKFLOW.md

详细的工作流程规范已记录在 `docs/AI_WORKFLOW.md` 中，AI 助手在开始工作前应参考此文档。

---

**最后更新**: 2026-01-13
