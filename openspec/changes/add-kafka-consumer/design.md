## Context

Kafka Tool 已实现了基础的集群管理、topic 浏览（列表）和生产者功能。现有的 UI 中已预留了 "Topics" 的 tab，目前仅显示 topic 列表，点击 topic 可以看到基础信息（partitions、replication factor、message count）。

消费者需要在这个基础上实现真正的消息查看和导航能力。

当前的架构基础：
- **前端**: React + Zustand，KafkaToolComponent 中的 `topics` view 已有 UI 框架
- **后端**: KafkaToolService 管理 Kafka AdminClient，消费需要单独的 Consumer 实例
- **存储**: localStorage 可存储消费位置（consumer offset）
- **已有能力**: 当前连接的 cluster 信息、topic 列表已获取

## Goals / Non-Goals

**Goals:**
- 实现消息列表视图，分页或虚拟滚动展示 topic 中的消息
- 提供消息详情页面，显示完整的消息内容、key、offset、partition、timestamp
- 支持多种消费起始位置（earliest、latest、指定 offset）
- 实现消息搜索和过滤（按 key、按内容）
- 格式化显示消息（JSON 高亮、纯文本、二进制）
- 记录上次消费位置到 localStorage，恢复时可从上次位置继续

**Non-Goals:**
- Consumer Group 管理和 offset 提交到 Broker（只在本地记录）
- 消息导出或下载
- 消息延迟监控和告警
- 跨多个 partition 的并发消费（暂时顺序消费）

## Decisions

### D1: Consumer 实例管理
**决策**: 在 KafkaToolService 中添加 Consumer 实例管理，但不自动连接；只在用户打开消费视图时按需创建。
**原因**:
- Consumer 会长期持有连接和资源，需要显式管理
- 消费是对话式的（用户交互），不是后台自动的
- cluster 切换时自动断开旧 Consumer，创建新的

**替代方案考虑**:
- A) 总是保持 Consumer 连接：浪费资源，用户可能不需要消费
- B) 完全在前端管理：缺乏集中控制，难以清理资源

### D2: 消费位置管理
**决策**: 使用 localStorage 存储消费位置（topic + partition -> offset），用户刷新或重新打开时恢复位置；不向 Broker 提交 offset。
**原因**:
- 这是调试工具，不是生产消费者，不需要 broker 侧同步
- 本地存储简单快速，避免网络往返
- 每个用户的消费位置独立，不影响其他消费者
- MVP 不需要 consumer group 的复杂性

**替代方案考虑**:
- A) 向 broker 提交 offset：增加复杂性，且影响真实 consumer group
- B) 总是从 latest 开始：用户无法浏览历史消息

### D3: 消息分页与虚拟滚动
**决策**: 使用虚拟滚动（Virtual Scroller）显示消息列表，每屏加载 50 条消息，向上/向下滚动时增量加载。
**原因**:
- Topic 可能有百万级消息，一次性加载不现实
- 虚拟滚动高效，用户体验流畅
- 向上/向下滚动时按需加载前后消息

**替代方案考虑**:
- A) 传统分页（第 1 页、第 2 页）：跳页时需要重新消费，慢
- B) 无限滚动，一次性加载所有：内存爆炸

### D4: 消息搜索和过滤
**决策**: 提供搜索功能，支持按 key 前缀、按消息内容（JSON path 或全文）搜索，但不支持正则表达式（MVP）。
**原因**:
- 用户通常知道要找的关键字或 key
- 全文搜索比正则容易实现和理解
- JSON path 搜索可选（高级功能）

**替代方案考虑**:
- A) 正则表达式：功能强大但学习曲线陡，大多数用户用不到
- B) 完全不提供搜索：不切实际

### D5: 消息格式化显示
**决策**: 前端检测消息 value 内容，自动识别 JSON；若是 JSON 则高亮显示；纯文本直接显示。
**原因**:
- 大多数 Kafka 消息是 JSON
- 自动识别，用户无需手动选择
- 高亮显示提升可读性

**替代方案考虑**:
- A) 用户手动选择格式：繁琐
- B) 只显示原始字节：可读性差

### D6: 前端状态管理
**决策**: 在 KafkaToolComponent 中使用 React State（useState）管理消费视图的本地状态（消费位置、搜索条件、展开的消息详情），无需全局状态。
**原因**:
- 消费状态不需要跨组件共享
- 页面切换时清空状态，符合用户预期

**替代方案考虑**:
- A) 使用 Zustand 全局状态：overkill
- B) localStorage 完全持久化：会让状态管理变复杂

## Risks / Trade-offs

| 风险 | 影响 | 缓解 |
|------|------|------|
| **消息消费性能** | Topic 有百万级消息，遍历很慢 | 虚拟滚动和增量加载；可设置消费窗口大小 |
| **大消息显示** | JSON 很大时，编辑器卡顿 | 限制单条消息显示大小（超过可下载）；使用 readonly textarea |
| **搜索性能** | 搜索需要遍历消息 | 搜索仅在本窗口的已加载消息中进行（不是全 topic 搜索） |
| **Offset 不同步** | 本地 offset 与 broker 不同步 | 文档说明这是调试工具，不影响生产消费者 |
| **消息乱码** | 非 UTF-8 二进制消息显示乱码 | 提供 Base64 或 Hex 查看模式 |
| **误解消费位置** | 用户以为提交了 offset 到 broker | UI 提示"本地位置记录"；确认不影响消费者组 |

## Open Questions

1. **Consumer Group 名称**: 使用什么 group id？固定还是随机？（先用固定 "devkit-consumer"）
2. **批量操作**: 是否需要选中多条消息进行操作（如导出）？（MVP 不需要）
3. **消息 Key 的可视化**: 如果 key 也是 JSON，是否也要高亮？（可选，后续版本）
4. **实时消费**: 是否支持"跟随最新"模式，自动刷新新消息？（MVP 不支持）
