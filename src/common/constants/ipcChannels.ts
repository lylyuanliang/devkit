/**
 * IPC 通道常量定义
 * 统一管理所有主进程和渲染进程之间的通信通道
 */

export const IPC_CHANNELS = {
  // ==================== 连接管理 ====================
  CONNECTION_LIST: 'connection:list',
  CONNECTION_CREATE: 'connection:create',
  CONNECTION_UPDATE: 'connection:update',
  CONNECTION_DELETE: 'connection:delete',
  CONNECTION_TEST: 'connection:test',
  CONNECTION_CONNECT: 'connection:connect',
  CONNECTION_DISCONNECT: 'connection:disconnect',

  // ==================== 主题管理 ====================
  TOPIC_LIST: 'topic:list',
  TOPIC_DETAIL: 'topic:detail',
  TOPIC_CREATE: 'topic:create',
  TOPIC_DELETE: 'topic:delete',
  TOPIC_CONFIG_UPDATE: 'topic:config:update',
  TOPIC_PARTITION_ADD: 'topic:partition:add',

  // ==================== 生产者 ====================
  PRODUCER_SEND: 'producer:send',
  PRODUCER_SEND_BATCH: 'producer:send-batch',

  // ==================== 消费者 ====================
  CONSUMER_START: 'consumer:start',
  CONSUMER_PAUSE: 'consumer:pause',
  CONSUMER_RESUME: 'consumer:resume',
  CONSUMER_STOP: 'consumer:stop',
  CONSUMER_SEEK: 'consumer:seek',
  CONSUMER_MESSAGE: 'consumer:message', // 主进程 -> 渲染进程

  // ==================== 消费组管理 ====================
  CONSUMER_GROUP_LIST: 'consumer-group:list',
  CONSUMER_GROUP_DETAIL: 'consumer-group:detail',
  CONSUMER_GROUP_RESET_OFFSET: 'consumer-group:reset-offset',
  CONSUMER_GROUP_DELETE: 'consumer-group:delete',

  // ==================== 集群信息 ====================
  CLUSTER_INFO: 'cluster:info',
  BROKER_LIST: 'broker:list',

  // ==================== 窗口管理 ====================
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close',

  // ==================== 应用设置 ====================
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',

  // ==================== 文件操作 ====================
  FILE_SELECT: 'file:select',
  FILE_SAVE: 'file:save',
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];
