# 更新日志

本文档记录 Kafka Client 的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [未发布]

### 规划中
- 消息模板功能
- 批量发送优化
- 虚拟滚动优化（可选）
- Schema Registry 集成
- 消息转换功能
- Webhook 集成
- 自动化任务

---

## [0.11.0] - 2026-01-13 - 错误处理

### 新增
- 🛡️ **错误处理系统** ✅
  - 全局错误边界（ErrorBoundary）
    - 捕获 React 组件错误
    - 显示友好的错误页面
    - 提供重试和恢复功能
  - 统一错误处理工具
    - 错误类型分类（网络、Kafka、IPC、验证等）
    - 用户友好的错误消息
    - 错误提示和建议
  - IPC 错误处理增强
    - 统一的错误格式化
    - Kafka 错误类型识别
    - 友好的错误消息返回
  - Kafka 错误处理
    - 错误类型解析
    - 错误分类和建议
    - 重试性判断

### 功能特性
- ✅ 全局错误边界 - 防止应用崩溃
- ✅ 错误类型分类 - 自动识别错误类型
- ✅ 用户友好提示 - 技术错误转换为友好消息
- ✅ 错误建议 - 提供解决建议
- ✅ 错误通知 - 详细错误通知组件

### 技术实现
- 使用 React ErrorBoundary 捕获组件错误
- 统一的错误处理工具函数
- 错误类型枚举和解析
- 主进程和渲染进程错误处理

### 变更
- 创建 ErrorBoundary 组件
- 创建错误处理工具（renderer 和 main）
- 增强 IPC 错误处理
- 更新关键页面使用新的错误处理
- 代码行数: 10,000 → 10,500行 (+5%)
- TypeScript文件: 40 → 42个 (+2个)

---

## [0.10.0] - 2026-01-13 - 性能优化

### 新增
- ⚡ **React 性能优化** ✅
  - 代码分割（React.lazy + Suspense）
    - 所有页面组件懒加载
    - 减少初始加载时间
    - 按需加载页面代码
  - React.memo 优化
    - MessageItem 组件使用 React.memo
    - 自定义比较函数避免不必要的重渲染
  - useMemo 优化
    - Layout 组件菜单项缓存
    - 标签页配置缓存
    - 组件映射缓存
  - useCallback 优化
    - 事件处理函数缓存
    - 避免子组件不必要的重渲染

### 功能特性
- ✅ 代码分割 - 页面组件懒加载
- ✅ 组件优化 - React.memo 减少重渲染
- ✅ 计算缓存 - useMemo 缓存计算结果
- ✅ 函数缓存 - useCallback 缓存函数引用
- ✅ 消息列表优化 - 独立的 MessageItem 组件

### 技术实现
- 使用 React.lazy 实现代码分割
- 使用 Suspense 提供加载状态
- 使用 React.memo 优化组件渲染
- 使用 useMemo 缓存计算结果
- 使用 useCallback 缓存函数引用

### 性能提升
- 初始加载时间减少（代码分割）
- 页面切换更流畅（懒加载）
- 消息列表渲染性能提升（React.memo）
- 减少不必要的组件重渲染

### 变更
- 更新 Layout 组件实现代码分割
- 创建 MessageItem 优化组件
- 优化 Consumer 页面消息列表
- 代码行数: 9,700 → 10,000行 (+3%)
- TypeScript文件: 39 → 40个 (+1个)

---

## [0.9.0] - 2026-01-13 - 设置功能

### 新增
- ⚙️ **设置功能完整实现** ✅
  - SettingsStore - 主进程设置存储
  - Settings Store - 渲染进程状态管理
  - 界面设置
    - 主题切换（亮色/暗色/跟随系统）
    - 语言切换（简体中文/English）
    - 字体大小设置
  - 行为设置
    - 默认消费策略（latest/earliest）
    - 消息格式（JSON/文本）
    - 最大消息数配置
    - 自动重连开关
  - 设置持久化
  - 设置重置功能

### 功能特性
- ✅ 设置实时保存
- ✅ 设置持久化存储
- ✅ 设置重置为默认值
- ✅ 完整的设置UI
- ✅ 设置加载和错误处理

### 技术实现
- 使用 electron-store 持久化设置
- 使用 Zustand 管理设置状态
- IPC 通信获取和保存设置
- 表单验证和错误处理

### 变更
- 完善 SettingsStore 主进程实现
- 实现设置 IPC 处理器
- 创建 Settings Store (Zustand)
- 重写 Settings 页面
- 代码行数: 9,200 → 9,700行 (+5%)
- TypeScript文件: 38 → 39个 (+1个)

---

## [0.8.0] - 2026-01-13 - 仪表盘功能

### 新增
- 📊 **仪表盘完整功能** ✅
  - Dashboard Store - 仪表盘状态管理
  - 实时统计数据展示
    - 连接数统计
    - 主题数统计
    - 消费组数统计
    - Broker数统计
  - 集群信息展示
    - 集群ID显示
    - Controller节点标识
    - Broker数量统计
  - Broker列表展示
    - Broker节点ID、主机、端口
    - Controller标识
    - Rack信息
  - 连接切换器
    - 下拉选择连接
    - 快速切换连接
    - 连接状态显示
  - 快速操作功能
    - 快速创建主题
    - 快速发送消息
    - 快速消费消息
    - 快速访问消费组管理

### 功能特性
- ✅ 实时统计数据显示
- ✅ 集群信息实时展示
- ✅ Broker列表详细展示
- ✅ 连接快速切换
- ✅ 快速操作入口
- ✅ 数据自动刷新
- ✅ 完整的错误处理

### 技术实现
- 使用 Zustand Store 管理状态
- 并行加载统计数据（Promise.all）
- 响应式布局（Ant Design Grid）
- 实时数据更新
- 连接状态同步

### 变更
- 新增 Dashboard Store 状态管理
- 重写 Dashboard 页面
- 集成连接、主题、消费组 Store
- 代码行数: 8,500 → 9,200行 (+8%)
- TypeScript文件: 37 → 38个 (+1个)

---

## [0.7.0] - 2026-01-13 - 消费组管理

### 新增
- 👥 **消费组管理完整功能** ✅
  - KafkaConsumerGroupService - 消费组服务
  - 获取消费组列表
  - 获取消费组详情
  - 获取消费组成员信息
  - 获取消费组Offset和计算Lag
  - 重置Offset功能（支持多种策略）
  - 删除消费组功能

- 🎨 **消费组管理UI**
  - 消费组列表页面 - 表格展示所有消费组
  - 状态显示 - STABLE/DEAD/EMPTY等状态标签
  - 搜索过滤 - 按消费组ID搜索
  - 消费组详情抽屉 - 详细信息展示
  - 统计信息卡片 - 总Lag、成员数、分区数、状态
  - 基本信息展示 - 消费组ID、状态、协议类型
  - 分区消费详情表格 - Offset、Lag、成员分配
  - 成员信息表格 - 成员ID、客户端ID、主机
  - Offset重置表单 - 支持多种重置策略
    - 最早（earliest）
    - 最新（latest）
    - 指定Offset
    - 指定时间戳
    - 偏移量（shift）
  - 删除消费组 - 带确认对话框
  - Zustand Store - 状态管理

### 功能特性
- ✅ 查看所有消费组列表
- ✅ 查看消费组详细信息
- ✅ 查看消费组成员信息
- ✅ 查看分区消费详情（Offset、Lag）
- ✅ 计算总Lag
- ✅ 重置消费组Offset（5种策略）
- ✅ 删除消费组
- ✅ 实时刷新消费组列表
- ✅ 完整的错误处理

### 技术实现
- 使用 kafkajs Admin API
- fetchOffsets 获取消费组Offset
- fetchTopicOffsets 获取日志结束Offset
- 计算Lag（logEndOffset - currentOffset）
- 使用consumer.seek重置Offset
- Zustand状态管理
- Ant Design UI组件

### 变更
- 新增 KafkaConsumerGroupService 服务层
- 新增消费组相关 IPC 处理器
- 新增消费组管理UI组件
- 重写 ConsumerGroups 页面
- 代码行数: 7,600 → 8,500行 (+12%)
- TypeScript文件: 35 → 37个 (+2个)

---

## 🎊 [0.6.0-MVP] - 2026-01-13 - MVP达成！

### 新增
- 📨 **消息消费完整功能** ✅
  - KafkaConsumerService - 消费者服务
  - 消费会话管理
  - 实时消息推送（主进程→渲染进程）
  - 消息接收和展示
  - 暂停/恢复/停止控制
  - Seek操作支持

- 🎨 **消息消费UI**
  - 消费控制面板 - 配置和控制界面
  - 主题选择器 - 选择要消费的主题
  - 消费策略 - 最新/最早消息
  - 消费组ID配置 - 自定义或自动生成
  - 控制按钮 - 开始/暂停/恢复/停止
  - 消息列表 - 实时展示消息
  - 消息详情 - Offset、Partition、Key、Headers、Value
  - JSON自动格式化 - 美化显示
  - 自动滚动 - 可开关
  - 导出消息 - 导出为JSON
  - 清空列表 - 一键清空
  - Zustand Store - 状态管理

### 功能特性
- ✅ 实时消费Kafka消息
- ✅ 支持消费策略（最新/最早消息）
- ✅ 消费会话管理（独立会话ID）
- ✅ 消费控制（开始/暂停/恢复/停止）
- ✅ 消息实时推送和展示
- ✅ 消息详细信息展示
  - Offset和Partition
  - Timestamp（格式化显示）
  - Key（可选）
  - Headers（多个）
  - Value（JSON自动格式化）
- ✅ 自动滚动到最新消息
- ✅ 消息数量限制（最多1000条）
- ✅ 导出消息为JSON文件
- ✅ 清空消息列表
- ✅ 完整的错误处理

### 技术实现
- 使用 kafkajs Consumer API
- IPC消息推送机制（主进程→渲染进程）
- 消费会话生命周期管理
- 消息缓冲和数量限制
- JSON自动格式化显示
- dayjs时间格式化
- Zustand状态管理

### 🎉 MVP里程碑
**所有MVP核心功能已完成！**
- ✅ 连接管理
- ✅ 主题管理
- ✅ 消息生产
- ✅ 消息消费

用户现在可以：
1. 连接到Kafka集群
2. 管理主题
3. 发送消息
4. 接收消息
5. 完整的Kafka操作流程 ✅

### 变更
- 新增 KafkaConsumerService 服务层
- 新增消费会话管理
- 新增消费者相关 IPC 处理器
- 新增消息消费UI组件
- 重写 Consumer 页面
- 主进程设置消费者窗口引用
- 代码行数: 6,700 → 7,600行 (+13%)
- TypeScript文件: 33 → 35个 (+2个)

---

## [0.5.0] - 2026-01-13

### 新增
- ✉️ **消息生产完整功能** ✅
  - KafkaProducerService - 生产者服务
  - 单条消息发送
  - 批量消息发送
  - 生产者连接管理
  - 完整的错误处理

- 🎨 **消息生产UI**
  - 消息发送表单 - 完整的发送界面
  - 主题选择器 - 下拉选择主题
  - Key输入 - 自定义消息Key
  - Headers编辑器 - 动态添加/删除Headers
  - 分区策略 - 自动分配/手动指定
  - 消息格式 - JSON/纯文本切换
  - 消息内容编辑器 - 代码风格编辑器
  - JSON格式验证 - 实时验证
  - Zustand Store - 状态管理

### 功能特性
- ✅ 发送消息到指定主题
- ✅ 支持自定义Key（用于分区和压缩）
- ✅ 支持自定义Headers（多个键值对）
- ✅ 支持分区策略
  - 自动分配（基于Key的哈希）
  - 手动指定分区号
- ✅ 支持消息格式
  - JSON格式（自动验证）
  - 纯文本格式
- ✅ 发送结果反馈
  - 显示分区号
  - 显示offset
  - 显示时间戳
- ✅ 表单验证和错误处理
- ✅ 清空表单功能
- ✅ 未连接时的友好提示

### 技术实现
- 使用 kafkajs Producer API
- Headers动态编辑组件
- JSON实时验证
- 完整的TypeScript类型
- Zustand状态管理

### 变更
- 新增 KafkaProducerService 服务层
- 新增生产者相关 IPC 处理器
- 新增消息生产UI组件
- 重写 Producer 页面
- 代码行数: 6,100 → 6,700行 (+10%)
- TypeScript文件: 31 → 33个 (+2个)

---

## [0.4.0] - 2026-01-13

### 新增
- 📋 **主题管理完整功能** ✅
  - KafkaAdminService - 主题管理服务
  - 主题列表获取和展示
  - 主题详情查看（分区信息、配置信息）
  - 创建主题功能（支持高级配置）
  - 删除主题功能（带确认对话框）
  - 主题配置更新
  - 增加分区功能
  
- 🎨 **主题管理UI**
  - 主题列表页面 - 表格展示，支持排序
  - 搜索和过滤功能 - 快速查找主题
  - 创建主题表单 - 完整的配置选项
  - 主题详情抽屉 - 分区和配置信息展示
  - Zustand Store - 状态管理
  - 刷新功能 - 一键刷新主题列表

- 🔧 **集群信息API**
  - 获取集群信息
  - 获取Broker列表

### 功能特性
- ✅ 主题列表展示（名称、分区数、副本因子）
- ✅ 内部主题标识（__开头的系统主题）
- ✅ 主题搜索功能
- ✅ 主题排序（按名称、分区数、副本因子）
- ✅ 主题详情查看（分区详情、ISR、配置信息）
- ✅ 创建主题（基本配置+高级配置）
  - retention.ms - 数据保留时间
  - retention.bytes - 数据保留大小
  - cleanup.policy - 清理策略
  - compression.type - 压缩类型
- ✅ 删除主题（带确认对话框，防止误删）
- ✅ 分页显示
- ✅ 未连接时的友好提示

### 技术实现
- 使用 kafkajs Admin API 实现主题管理
- 使用 Zustand 进行状态管理
- 使用 Ant Design Table、Drawer、Form 组件
- 完整的错误处理和用户反馈
- TypeScript 类型安全

### 变更
- 新增 KafkaAdminService 服务层
- 完善主题相关 IPC 处理器
- 新增主题管理UI组件
- 代码行数: 5,000 → 6,100行 (+22%)
- TypeScript文件: 28 → 31个 (+3个)

---

## [0.3.0] - 2026-01-13

### 新增
- 🔌 **连接管理完整功能** ✅
  - ConnectionStore - 连接配置存储服务
  - SecureStore - 密码安全存储服务（基于 safeStorage）
  - SettingsStore - 应用设置存储服务
  - KafkaConnectionManager - Kafka连接管理器
  
- ✅ **连接功能**
  - 支持多连接配置保存和管理
  - 支持SASL认证（PLAIN、SCRAM-SHA-256、SCRAM-SHA-512）
  - 支持SSL/TLS加密连接
  - 连接测试功能（获取集群信息）
  - 连接池管理和自动清理空闲连接
  - 密码加密存储（使用Electron safeStorage API）
  
- 🔄 **IPC处理器**
  - CONNECTION_LIST - 获取连接列表
  - CONNECTION_CREATE - 创建新连接
  - CONNECTION_UPDATE - 更新连接配置
  - CONNECTION_DELETE - 删除连接
  - CONNECTION_TEST - 测试连接
  - CONNECTION_CONNECT - 连接到Kafka
  - CONNECTION_DISCONNECT - 断开连接

- 🎨 **UI界面**
  - 连接列表页面 - 完整的连接管理界面
  - 连接表单组件 - 新建/编辑连接
  - 连接测试界面 - 实时测试连接状态
  - Zustand Store - 状态管理
  - 完整的用户交互和反馈

### 功能特性
- ✅ 连接列表展示（表格形式）
- ✅ 连接状态显示（已连接/未连接）
- ✅ 一键连接/断开功能
- ✅ 连接测试功能（显示详细结果）
- ✅ 连接CRUD操作（创建、编辑、删除）
- ✅ 表单验证（Broker地址、认证信息）
- ✅ SASL认证配置界面
- ✅ SSL配置界面
- ✅ 高级设置（超时时间）
- ✅ 确认对话框（删除操作）

### 技术实现
- 使用 electron-store 实现数据持久化
- 使用 safeStorage API 加密存储密码
- 使用 kafkajs 实现Kafka连接和测试
- 实现连接池管理，支持连接复用
- 实现空闲连接自动清理（30分钟）
- 添加 uuid 依赖用于生成连接ID

### 变更
- 更新 package.json 添加 uuid 依赖
- 完善 IPC 处理器实现
- 新增 Zustand Store 状态管理
- 新增连接管理UI组件
- 代码行数: 2,800 → 5,000行 (+78%)
- TypeScript文件: 22 → 28个 (+6个)

---

## [0.2.0-dev] - 2026-01-13

### 新增
- ⚙️ **完整的项目配置**
  - package.json - 30个依赖包配置
  - TypeScript配置（4个tsconfig文件）
  - ESLint + Prettier代码规范
  - Vite构建配置
  - Git配置（.gitignore, .editorconfig, husky）
  - VSCode工作区配置

- 🏗️ **Electron主进程框架**
  - main/index.ts - 主进程入口
  - main/ipc/index.ts - IPC处理器框架
  - 窗口管理和生命周期
  - 开发/生产环境支持

- 🔒 **Preload脚本**
  - 安全的API桥接（contextBridge）
  - 完整的类型定义
  - IPC通信封装

- 🎨 **React渲染进程**
  - React 18 + TypeScript
  - Vite开发服务器配置
  - Ant Design UI组件库集成
  - React Router路由配置
  - 主布局组件
  - 7个页面组件骨架

- 📦 **共享代码层**
  - IPC通道常量定义
  - 完整的TypeScript类型系统
    - 连接类型（ConnectionConfig等）
    - Kafka类型（Topic、Broker等）
    - 消息类型（ProducerMessage等）
    - 消费组类型（ConsumerGroup等）

- 📚 **补充文档**
  - INDEX.md - 文档索引
  - QUICKSTART.md - 快速开始指南
  - GETTING_STARTED.md - 开发上手指南
  - PROJECT_INIT_SUMMARY.md - 初始化总结

### 技术栈
- Electron 28.1.0
- React 18.2.0
- TypeScript 5.3.3
- Vite 5.0.10
- Ant Design 5.12.8
- KafkaJS 2.2.4
- Zustand 4.4.7

---

## [0.1.0] - 2026-01-13

### 新增
- 📝 **项目规划文档**（12个）
  - README.md - 项目介绍和导航
  - ARCHITECTURE.md - 架构设计
  - FEATURES.md - 功能规划（8大模块）
  - DEVELOPMENT.md - 开发指南
  - TECH_STACK.md - 技术栈说明
  - ROADMAP.md - 产品路线图（11周计划）
  - CONTRIBUTING.md - 贡献指南
  - PROJECT_STATUS.md - 项目状态
  - CHANGELOG.md - 更新日志
  - TODO.md - 任务清单（300+任务）

### 计划功能
- ✅ 连接管理
  - 多连接配置保存
  - SASL/SSL 认证
  - 连接测试
- ✅ 主题管理
  - 主题列表和详情
  - 创建/删除主题
  - 配置管理
- ✅ 消息生产
  - 发送单条/批量消息
  - 消息模板
- ✅ 消息消费
  - 实时消费
  - 历史消息查看
  - 消息搜索和过滤
- ✅ 消费组管理
  - 消费组列表和详情
  - Lag 监控
  - Offset 重置

---

## 版本说明

### 版本号规则
- 主版本号 (Major): 不兼容的 API 修改
- 次版本号 (Minor): 向下兼容的功能性新增
- 修订号 (Patch): 向下兼容的问题修正

### 变更类型
- `新增` (Added): 新功能
- `变更` (Changed): 对现有功能的变更
- `废弃` (Deprecated): 即将移除的功能
- `移除` (Removed): 已移除的功能
- `修复` (Fixed): Bug 修复
- `安全` (Security): 安全相关的修复

---

## 里程碑

### v0.1.0 - 项目启动 ✅
- 完成日期：2026-01-13
- 完成项目规划
- 文档编写（12个专业文档）

### v0.2.0 - 基础架构 ✅（当前）
- 完成日期：2026-01-13
- 项目初始化完成
- 开发环境配置
- Electron + React框架搭建
- TypeScript类型系统
- 基础UI布局

### v0.3.0 - 连接管理（目标: 2周后）
- 连接数据存储
- 连接CRUD功能
- 连接测试
- SASL/SSL支持

### v0.4.0 - 主题管理（目标: 3周后）
- 主题列表
- 主题详情
- 创建/删除主题

### v0.5.0 - 消息收发（目标: 1个月后）
- 消息生产
- 消息消费
- 消息模板

### v0.5.0 - 功能完善（目标: 1个月后）
- 所有核心功能
- 消费组管理
- 消息模板

### v1.0.0 - 正式版（目标: 2个月后）
- 完整功能
- 性能优化
- 全面测试
- 多平台打包

---

## 贡献指南

在提交变更时，请：
1. 在适当的版本号下添加变更说明
2. 使用正确的变更类型标签
3. 简洁清晰地描述变更内容
4. 如果相关，添加 Issue 或 PR 链接

示例：
```markdown
### 新增
- 主题管理页面 (#12)
- 支持 SASL/SCRAM-SHA-256 认证 (@username)

### 修复
- 修复连接超时问题 (#23)
- 修复消息格式化错误 (#24)
```
