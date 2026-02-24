## Context

DevKit 是一个模块化工具容器应用，基于 Tauri + React。现有架构支持：
- 工具注册表（Tool Registry）管理工具生命周期
- EventBus 作为全局事件总线，支持工具间通信
- DatabaseService 提供 SQLite 配置存储
- Zustand 用于前端状态管理

之前讨论中确认了：
1. 使用 kafkajs（纯 Node.js）作为 Kafka 客户端
2. 实现 EventSource 接口以支持工具级可替换
3. 在 DatabaseService 中添加 AES-256-GCM 加密

## Goals / Non-Goals

**Goals:**
- 实现完整的 Kafka 管理工具（P0/P1/P2 功能）
- 使 Kafka 可作为系统级事件源，其他工具可通过 EventSourceRegistry 使用
- 敏感数据（密码、证书）加密存储
- 为工具开发建立清晰的最佳实践（已通过文档完成）

**Non-Goals:**
- Schema Registry 集成（P2 功能，先不做）
- 跨设备密钥同步
- 性能优化（kafkajs 足够用于管理工具场景）
- 支持其他事件源实现（这是后续工作）

## Decisions

### D1: EventSource 接口设计
**决策**: 在 shared/types 中定义 EventSource 接口，Kafka Tool 实现该接口。
**原因**:
- 支持工具级可替换，其他工具与"某个事件源"通信，不与具体的"Kafka"耦合
- 为未来的 Redis、RabbitMQ 等事件源实现预留扩展点

**替代方案考虑**:
- A) 工具内实现事件源逻辑：灵活但工具代码重，不易复用
- B) 框架层统一实现：过度设计，不同消息队列差异大

### D2: EventSourceRegistry 的职责
**决策**: 由 core/backend 中的 EventSourceRegistry 管理当前事件源，工具在 init() 时注册自己。
**原因**:
- 工具是否作为事件源取决于配置，初始化时决定
- 其他工具通过 EventSourceRegistry.getCurrent() 获取当前事件源
- 支持同时运行多个工具，但只有一个充当事件源

**替代方案考虑**:
- A) 工具自管理注册：分散，难以管理
- B) 前端 UI 管理：跨越前后端边界，复杂

### D3: 加密实现方式
**决策**: DatabaseService 提供 `saveSecure()` / `loadSecure()` 方法，工具主动调用；主密钥存在 `~/.devkit/master.key`。
**原因**:
- 集中在 DatabaseService，工具无感且一致
- 使用 Node.js 内置 crypto 模块，无额外依赖
- AES-256-GCM 提供认证加密
- 首次启动自动生成密钥，简化使用

**替代方案考虑**:
- A) Tauri Secure Storage：跨平台支持有限，且需要 Tauri 侧支持
- B) 工具自己加密：容易遗漏或不一致
- C) 不加密：安全风险

### D4: Kafka Tool 的 UI 架构
**决策**: 分为多个 Tab/Panel：集群管理、Topic 浏览、消息生产、消息消费、监控。
**原因**:
- 清晰的功能分区
- 复用 DevKit 的 Tab 和 WorkArea 架构
- 易于分解实现任务

**替代方案考虑**:
- A) 单页面所有功能：拥挤，用户体验差
- B) 多个工具分开：复杂化，不符合需求

### D5: 消息持久化
**决策**: Kafka Tool 本身不持久化消息，仅从 Kafka Broker 读取；但记录消费位置（offset）到 DB。
**原因**:
- Kafka Broker 本身持久化消息
- 记录用户上次查看的位置，方便恢复
- 减少 Tool 复杂度

**替代方案考虑**:
- A) 导出/导入消息到本地：超出 MVP 范围（P2 功能）

## Risks / Trade-offs

| 风险 | 影响 | 缓解 |
|------|------|------|
| **密钥丢失无法恢复** | 用户无法读取加密的历史配置 | 在 UI 中添加警告提示；文档强调备份 |
| **kafkajs 单线程** | 高吞吐场景可能卡顿 | 这是管理工具，不是生产 consumer；足够用 |
| **EventSource 接口过简** | 可能不支持未来的 Redis pub/sub 的所有特性 | 设计时已考虑扩展性；需要时可升级接口 |
| **多集群连接管理** | 用户可能误操作发错集群 | UI 中明确显示当前集群；操作前需确认 |

## Open Questions

1. 消息格式的 Avro 支持：是否需要集成 Schema Registry？（目前先支持 JSON、纯文本）
2. 消费者组的重置策略：只支持 reset to earliest/latest，还是也支持时间戳？（先支持 earliest/latest）
3. 监控告警的持久化：告警规则存在 DB，但何时触发告警如何记录？（先做基础告警，记录到内存）
