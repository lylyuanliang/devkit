/**
 * 连接配置存储服务
 * 使用 electron-store 实现数据持久化
 */

import Store from 'electron-store';
import type { ConnectionConfig } from '../../common/types/connection';

/**
 * 存储数据结构
 */
interface StoreSchema {
  connections: ConnectionConfig[];
  activeConnectionId: string | null;
}

/**
 * 连接存储类
 */
class ConnectionStore {
  private store: Store<StoreSchema>;

  constructor() {
    this.store = new Store<StoreSchema>({
      name: 'connections',
      defaults: {
        connections: [],
        activeConnectionId: null,
      },
      // 加密敏感数据（密码将单独处理）
      encryptionKey: 'kafka-client-secure-key',
    });
  }

  /**
   * 获取所有连接配置
   */
  getAllConnections(): ConnectionConfig[] {
    return this.store.get('connections', []);
  }

  /**
   * 根据ID获取连接配置
   */
  getConnectionById(id: string): ConnectionConfig | undefined {
    const connections = this.getAllConnections();
    return connections.find((conn) => conn.id === id);
  }

  /**
   * 添加新连接
   */
  addConnection(connection: ConnectionConfig): void {
    const connections = this.getAllConnections();
    connections.push(connection);
    this.store.set('connections', connections);
  }

  /**
   * 更新连接配置
   */
  updateConnection(id: string, updates: Partial<ConnectionConfig>): boolean {
    const connections = this.getAllConnections();
    const index = connections.findIndex((conn) => conn.id === id);

    if (index === -1) {
      return false;
    }

    connections[index] = {
      ...connections[index],
      ...updates,
      updatedAt: new Date(),
    };

    this.store.set('connections', connections);
    return true;
  }

  /**
   * 删除连接
   */
  deleteConnection(id: string): boolean {
    const connections = this.getAllConnections();
    const filteredConnections = connections.filter((conn) => conn.id !== id);

    if (filteredConnections.length === connections.length) {
      return false; // 没有找到要删除的连接
    }

    this.store.set('connections', filteredConnections);

    // 如果删除的是活跃连接，清除活跃连接ID
    if (this.getActiveConnectionId() === id) {
      this.setActiveConnectionId(null);
    }

    return true;
  }

  /**
   * 获取活跃连接ID
   */
  getActiveConnectionId(): string | null {
    return this.store.get('activeConnectionId', null);
  }

  /**
   * 设置活跃连接
   */
  setActiveConnectionId(id: string | null): void {
    this.store.set('activeConnectionId', id);
  }

  /**
   * 获取活跃连接配置
   */
  getActiveConnection(): ConnectionConfig | null {
    const activeId = this.getActiveConnectionId();
    if (!activeId) {
      return null;
    }
    return this.getConnectionById(activeId) || null;
  }

  /**
   * 清空所有连接
   */
  clearAll(): void {
    this.store.set('connections', []);
    this.store.set('activeConnectionId', null);
  }

  /**
   * 检查连接名称是否已存在
   */
  isConnectionNameExists(name: string, excludeId?: string): boolean {
    const connections = this.getAllConnections();
    return connections.some((conn) => conn.name === name && conn.id !== excludeId);
  }
}

// 导出单例
export const connectionStore = new ConnectionStore();
