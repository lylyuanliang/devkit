/**
 * 渲染进程全局类型定义
 */

import type { KafkaApi } from './index';

declare global {
  interface Window {
    kafkaApi: KafkaApi;
  }
}

export {};
