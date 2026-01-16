/**
 * 安全存储服务
 * 使用 Electron safeStorage API 加密存储敏感信息（如密码）
 */

import { safeStorage } from 'electron';
import Store from 'electron-store';

/**
 * 加密数据结构
 */
interface SecureStoreSchema {
  // 连接密码存储：{ connectionId: encryptedPassword }
  passwords: Record<string, string>;
}

/**
 * 安全存储类
 */
class SecureStore {
  private store: Store<SecureStoreSchema>;
  private isEncryptionAvailable: boolean;

  constructor() {
    // 检查加密是否可用
    this.isEncryptionAvailable = safeStorage.isEncryptionAvailable();

    this.store = new Store<SecureStoreSchema>({
      name: 'secure-store',
      defaults: {
        passwords: {},
      },
    });

    if (!this.isEncryptionAvailable) {
      console.warn('safeStorage 加密不可用，密码将以明文存储（仅开发环境）');
    }
  }

  /**
   * 保存密码（加密）
   */
  setPassword(connectionId: string, password: string): void {
    if (!password) {
      // 如果密码为空，删除存储的密码
      this.deletePassword(connectionId);
      return;
    }

    let storedValue: string;

    if (this.isEncryptionAvailable) {
      // 加密密码
      const encrypted = safeStorage.encryptString(password);
      storedValue = encrypted.toString('base64');
    } else {
      // 开发环境：明文存储（生产环境不会执行到这里）
      storedValue = Buffer.from(password).toString('base64');
    }

    const passwords = this.store.get('passwords', {});
    passwords[connectionId] = storedValue;
    this.store.set('passwords', passwords);
  }

  /**
   * 获取密码（解密）
   */
  getPassword(connectionId: string): string | null {
    const passwords = this.store.get('passwords', {});
    const storedValue = passwords[connectionId];

    if (!storedValue) {
      return null;
    }

    try {
      if (this.isEncryptionAvailable) {
        // 解密密码
        const encryptedBuffer = Buffer.from(storedValue, 'base64');
        return safeStorage.decryptString(encryptedBuffer);
      } else {
        // 开发环境：解码明文
        return Buffer.from(storedValue, 'base64').toString('utf-8');
      }
    } catch (error) {
      console.error('密码解密失败:', error);
      return null;
    }
  }

  /**
   * 删除密码
   */
  deletePassword(connectionId: string): void {
    const passwords = this.store.get('passwords', {});
    delete passwords[connectionId];
    this.store.set('passwords', passwords);
  }

  /**
   * 检查是否存在密码
   */
  hasPassword(connectionId: string): boolean {
    const passwords = this.store.get('passwords', {});
    return !!passwords[connectionId];
  }

  /**
   * 清空所有密码
   */
  clearAll(): void {
    this.store.set('passwords', {});
  }

  /**
   * 获取加密状态
   */
  isEncryptionEnabled(): boolean {
    return this.isEncryptionAvailable;
  }
}

// 导出单例
export const secureStore = new SecureStore();
