# AI 工作流程规范

本文档定义了 AI 助手在开发 Kafka Client 项目时应遵循的工作流程和规范。

## 📋 文档管理规范

### 工作总结文档位置

**重要**: 所有工作总结文档（WORK_SUMMARY*.md）必须保存在 `docs/summaries/` 目录下。

#### 文件命名规范
- 格式: `WORK_SUMMARY_<序号>_<功能名称>.md`
- 示例:
  - `WORK_SUMMARY_6_CONSUMER_GROUP.md`
  - `WORK_SUMMARY_7_DASHBOARD.md`
  - `WORK_SUMMARY_8_SETTINGS.md`
  - `WORK_SUMMARY_9_PERFORMANCE.md`

#### 文件路径
- ✅ 正确: `docs/summaries/WORK_SUMMARY_10_ERROR_HANDLING.md`
- ❌ 错误: `WORK_SUMMARY_10_ERROR_HANDLING.md` (根目录)

### 生成工作总结时的操作步骤

1. **创建文档时**:
   ```typescript
   write({
     file_path: 'docs/summaries/WORK_SUMMARY_<序号>_<功能名称>.md',
     contents: '...'
   })
   ```

2. **不要**在项目根目录创建工作总结文档

3. **更新文档索引**:
   - 更新 `docs/summaries/README.md` 添加新文档链接
   - 可选：更新 `docs/INDEX.md` 中的相关说明

## 🔄 工作流程

### 完成功能开发后的标准流程

1. **实现功能代码**
   - 遵循 `docs/ARCHITECTURE.md` 的架构设计
   - 遵循 `docs/DEVELOPMENT.md` 的开发规范

2. **更新进度文档**
   - 更新 `docs/PROJECT_STATUS.md`
   - 更新 `docs/CHANGELOG.md`
   - 更新 `TODO.md`

3. **生成工作总结**
   - 在 `docs/summaries/` 目录下创建工作总结文档
   - 文档命名遵循规范
   - 包含完整的任务概述、完成内容、代码统计等

4. **验证**
   - 检查文档位置是否正确
   - 检查文档内容是否完整
   - 检查相关文档索引是否更新

## 📝 工作总结文档模板

```markdown
# 工作总结 - <功能名称>

**日期**: YYYY-MM-DD  
**版本**: vX.X.X  
**功能模块**: <模块名称>

---

## 📋 任务概述

...

## ✅ 完成内容

...

## 📊 代码统计

...

## 🎯 功能特性

...

## 🔧 技术实现

...

## 📝 文档更新

...

## 🎉 成果总结

...

---

**开发完成时间**: YYYY-MM-DD  
**版本**: vX.X.X  
**状态**: ✅ 已完成
```

## ⚠️ 重要提醒

### 对于 AI 助手

每次生成工作总结文档时，请：

1. ✅ **必须**使用 `docs/summaries/` 作为文件路径前缀
2. ✅ **必须**遵循文件命名规范
3. ✅ **必须**包含完整的文档内容
4. ❌ **不要**在项目根目录创建工作总结文档
5. ❌ **不要**使用简化的文件名

### 检查清单

生成工作总结前，确认：
- [ ] 文件路径包含 `docs/summaries/`
- [ ] 文件名遵循命名规范
- [ ] 文档内容完整
- [ ] 已更新相关文档索引（如需要）

## 🔗 相关文档

- [开发指南](DEVELOPMENT.md) - 开发规范和流程
- [工作总结目录](summaries/README.md) - 所有工作总结文档
- [项目状态](PROJECT_STATUS.md) - 当前项目状态

---

**最后更新**: 2026-01-13
