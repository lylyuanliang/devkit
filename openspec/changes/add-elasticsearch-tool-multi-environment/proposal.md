# Elasticsearch 工具 - 多环境支持提案

## 概述

为 Elasticsearch 工具添加完整的多环境支持，允许用户保存和快速切换多个 Elasticsearch 集群配置。该实现将完全复用 Kafka Tool 多环境支持的模式和架构。

## 目标

1. **多集群管理** - 用户可保存多个 ES 集群配置
2. **一键切换** - 快速切换集群，< 2 秒响应时间
3. **工作区隔离** - 每个集群独立保存 UI 状态
4. **安全存储** - 使用 AES-256-GCM 加密凭证
5. **完整功能** - 指标查询、索引管理等工作流保留

## 基本原则

- **复用 Kafka 模式** - 采用相同的数据库、服务、UI 架构
- **类似生命周期** - 环境加载 → 连接 → 状态恢复
- **相同的事件模式** - elasticsearch:environment:switching/switched 事件

## 核心模块

### 1. 数据库层（DatabaseService）
- `elasticsearch_environments` 表
- `elasticsearch_active_environment` 表
- CRUD 操作
- 迁移脚本处理旧配置

### 2. 服务层（ElasticsearchService）
- 多连接管理（Map<name, client>）
- 环境切换生命周期
- 连接/断开管理
- 事件发射

### 3. 工具层（ElasticsearchTool）
- 初始化和销毁
- 状态管理
- 工作区状态保留

### 4. UI 组件
- EnvironmentSelector（复用或参数化）
- EnvironmentManager（复用或参数化）
- EnvironmentPanel（集成）

### 5. 状态管理
- Zustand store（每个环境隔离状态）

## 实现范围

### 包含
- ✅ 多环境配置保存和管理
- ✅ 环境切换和连接管理
- ✅ 工作区状态保留
- ✅ 安全的凭证存储
- ✅ 完整的事件系统
- ✅ UI 组件集成
- ✅ 文档和参考指南

### 不包含
- ❌ ES 工具的基础查询功能（假设已存在）
- ❌ 新的查询语言支持
- ❌ 高级可视化功能

## 参考

- **Kafka Tool 多环境实现** - 已完成的参考实现
- **ES_IMPLEMENTATION_REFERENCE.md** - 详细的实现指南
- **MIGRATION_GUIDE.md** - 用户迁移指南模板

## 估计工作量

- **数据库层** - 2-3 小时
- **服务层** - 3-4 小时
- **工具层** - 2-3 小时
- **UI 集成** - 2-3 小时
- **测试和文档** - 2-3 小时

**总计** - 11-16 小时

## 成功标准

- ✅ 所有任务完成
- ✅ 功能与 Kafka Tool 一致
- ✅ 完整的测试覆盖
- ✅ 用户文档完整
- ✅ 代码质量达到生产标准
