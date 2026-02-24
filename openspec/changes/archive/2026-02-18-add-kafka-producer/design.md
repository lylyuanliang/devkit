## Context

Kafka Tool 已实现了基础的集群管理、topic 浏览和多环境切换。现有的 UI 中已预留了 "生产消息" 的 tab，但功能尚未实现。

当前的架构基础：
- **前端**: React + Zustand，KafkaToolComponent 中已定义 `activeView === 'produce'` 的空容器
- **后端**: KafkaToolService 管理 Kafka AdminClient 和 cluster 连接，基于 kafkajs
- **存储**: localStorage 持久化 cluster 配置，消息格式偏好等可存储到 preferences
- **已有能力**: 当前连接的 cluster 信息可通过 KafkaToolService 获取

## Goals / Non-Goals

**Goals:**
- 实现消息生产的完整 UI 界面（选择 topic、输入消息、指定格式）
- 添加后端生产者服务，基于 kafkajs Producer API 发送消息
- 支持多种消息格式（JSON、纯文本）
- 提供实时的发送状态反馈（成功/失败/发送中）
- 支持可选的 message key 和 partition 指定（高级选项）
- 发送成功时显示 offset 和 partition 确认

**Non-Goals:**
- 批量导入消息（文件上传、CSV 解析）
- 事务性发送或 exactly-once 语义
- Schema Registry 集成或 Avro 支持
- 消息发送历史或发送队列管理
- 性能优化或高吞吐场景支持

## Decisions

### D1: Producer 实例管理
**决策**: 在 KafkaToolService 中添加 Producer 实例管理，每个 cluster 一个 Producer，cluster 切换时自动切换 Producer。
**原因**:
- 集中在现有的 KafkaToolService 中，避免前端直接操作 kafkajs
- cluster 切换时自动断开旧 Producer，连接新的，避免资源泄漏
- kafkajs Producer 是有状态的连接对象，应在服务层管理

**替代方案考虑**:
- A) 每次发送时创建临时 Producer：资源浪费，延迟高
- B) 前端直接调用 kafkajs：缺乏集中管理，容易出错

### D2: 消息格式管理
**决策**: UI 提供"格式选择器"（JSON/纯文本），前端负责格式验证，后端只负责发送字节流。
**原因**:
- JSON 格式可在 UI 中实时验证，给用户快速反馈
- 纯文本无需验证
- 后端保持简单，只调用 `producer.send({ messages: [{ value: buffer }] })`
- 消息本体以 string 或 Buffer 形式发送，无需复杂序列化

**替代方案考虑**:
- A) 后端处理所有格式：增加后端复杂性，且 JSON 验证结果同步困难
- B) 支持更多格式（Avro、Protobuf）：超出 MVP 范围

### D3: Key 和 Partition 配置
**决策**: 在 UI 中提供可折叠的"高级选项"，允许用户输入 key 和指定 partition（可选）。
**原因**:
- 大多数场景不需要 key，简化 UI
- 高级用户可以通过高级选项指定，支持按 key 分区的场景
- 支持直接指定 partition 便于调试

**替代方案考虑**:
- A) 总是显示 key 和 partition 字段：UI 拥挤，用户困惑
- B) 完全隐藏：无法支持需要 key 的场景

### D4: 消息发送状态反馈
**决策**: 使用 Promise 等待发送完成，显示 loading 状态 → 成功/失败 toast；成功时显示返回的 offset、partition、timestamp。
**原因**:
- 用户需要确认消息是否发送成功
- offset 和 partition 信息对调试有帮助
- toast 反馈快速且不打断用户操作

**替代方案考虑**:
- A) 后台发送，不等待确认：用户无法确认是否成功
- B) 模态框等待：打断用户体验，尤其是多条发送时

### D5: 前端状态管理
**决策**: 在 KafkaToolComponent 中使用 React State（useState）管理 produce view 的本地状态（topic、format、content、key），无需全局状态。
**原因**:
- produce view 是 KafkaToolComponent 的一个 tab，状态不需要跨组件共享
- 简化状态管理，避免 Zustand store 膨胀
- 页面切换时清空状态，符合用户预期

**替代方案考虑**:
- A) 使用 Zustand 全局状态：overkill，且 tab 切换时需要手动清空
- B) localStorage 持久化内容：消息内容可能很大，且用户可能误发

## Risks / Trade-offs

| 风险 | 影响 | 缓解 |
|------|------|------|
| **误发重要消息** | 数据混乱 | 在发送前显示确认信息（topic 和消息内容摘要）；成功时显示 offset 便于追踪 |
| **JSON 格式验证漏洞** | 用户输入非法 JSON，发送时报错 | 使用 `JSON.parse()` 严格验证；错误信息清晰提示位置 |
| **大消息性能** | 编辑或发送超大消息时卡顿 | 消息体长度限制为 1MB（kafkajs 默认）；UI 提示大小 |
| **并发发送管理** | 用户快速点击多次发送按钮 | 发送中禁用发送按钮；显示发送队列状态 |
| **Key 为空与 Partition 冲突** | 若指定 partition 但 key 为空，behavior 可能不符预期 | UI 提示用户：指定 partition 时应同时指定 key；或自动忽略 key（简化处理） |

## Open Questions

1. **大消息处理**: 是否需要分块发送？还是限制为单个消息？（先限制为 1MB）
2. **消息发送历史**: 是否需要记录已发送的消息便于重新发送？（MVP 不需要）
3. **Key 自动生成**: 若用户未指定 key，是否需要自动生成唯一 key？还是完全由 Kafka 负责轮询分配？（让 Kafka 负责，不生成）
4. **压缩算法**: 是否支持消息压缩？（暂不支持，kafkajs 可支持但不是 MVP 功能）
