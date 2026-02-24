import Database from 'better-sqlite3';
import path from 'path';
import { app } from '@tauri-apps/api';
import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import { EncryptedValue } from '@devkit/shared';

export class DatabaseService {
  private db: Database.Database;
  private encryptionKey: Buffer;
  private keyInitialized: boolean = false;

  constructor() {
    const appDir = app.getAppDataDir();
    const dbPath = path.join(appDir, 'devkit.db');
    this.db = new Database(dbPath);
    this.initializeSchema();
    this.encryptionKey = this.initializeMasterKey();
    this.keyInitialized = true;
  }

  private initializeSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tool_configs (
        id TEXT PRIMARY KEY,
        tool_id TEXT NOT NULL,
        config JSON NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS connections (
        id TEXT PRIMARY KEY,
        tool_id TEXT NOT NULL,
        name TEXT NOT NULL,
        config JSON NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS recent_items (
        id TEXT PRIMARY KEY,
        tool_id TEXT NOT NULL,
        opened_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS app_state (
        key TEXT PRIMARY KEY,
        value JSON NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  getToolConfig(toolId: string): any {
    const stmt = this.db.prepare('SELECT config FROM tool_configs WHERE tool_id = ?');
    const result = stmt.get(toolId) as any;
    return result ? JSON.parse(result.config) : null;
  }

  setToolConfig(toolId: string, config: any): void {
    const id = `${toolId}-config`;
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO tool_configs (id, tool_id, config, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `);
    stmt.run(id, toolId, JSON.stringify(config));
  }

  getConnection(connectionId: string): any {
    const stmt = this.db.prepare('SELECT * FROM connections WHERE id = ?');
    const result = stmt.get(connectionId) as any;
    return result ? { ...result, config: JSON.parse(result.config) } : null;
  }

  saveConnection(connectionId: string, toolId: string, name: string, config: any): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO connections (id, tool_id, name, config, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    stmt.run(connectionId, toolId, name, JSON.stringify(config));
  }

  deleteConnection(connectionId: string): void {
    const stmt = this.db.prepare('DELETE FROM connections WHERE id = ?');
    stmt.run(connectionId);
  }

  getRecentTools(limit: number = 5): string[] {
    const stmt = this.db.prepare(`
      SELECT DISTINCT tool_id FROM recent_items
      ORDER BY opened_at DESC
      LIMIT ?
    `);
    const results = stmt.all(limit) as any[];
    return results.map((r) => r.tool_id);
  }

  addRecentTool(toolId: string): void {
    const id = `${toolId}-${Date.now()}`;
    const stmt = this.db.prepare(`
      INSERT INTO recent_items (id, tool_id, opened_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `);
    stmt.run(id, toolId);
  }

  getAppState(key: string): any {
    const stmt = this.db.prepare('SELECT value FROM app_state WHERE key = ?');
    const result = stmt.get(key) as any;
    return result ? JSON.parse(result.value) : null;
  }

  setAppState(key: string, value: any): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO app_state (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `);
    stmt.run(key, JSON.stringify(value));
  }

  /**
   * Initialize the master encryption key for secure storage
   * On first run, generates a new key and saves it to ~/.devkit/master.key
   * On subsequent runs, loads the existing key
   */
  private initializeMasterKey(): Buffer {
    const keyPath = path.join(os.homedir(), '.devkit', 'master.key');

    // Try to load existing key
    if (fs.existsSync(keyPath)) {
      try {
        const keyHex = fs.readFileSync(keyPath, 'utf8').trim();
        return Buffer.from(keyHex, 'hex');
      } catch (error) {
        console.error('Failed to read master key:', error);
        throw new Error('Failed to read master encryption key');
      }
    }

    // Generate new key on first run
    const newKey = crypto.randomBytes(32); // 256-bit key

    try {
      // Ensure directory exists
      const keyDir = path.dirname(keyPath);
      fs.mkdirSync(keyDir, { recursive: true });

      // Write key with user-only permissions (0o600)
      fs.writeFileSync(keyPath, newKey.toString('hex'), { mode: 0o600 });

      return newKey;
    } catch (error) {
      console.error('Failed to save master key:', error);
      throw new Error('Failed to initialize encryption key');
    }
  }

  /**
   * Encrypt a value using AES-256-GCM
   */
  private encryptValue(value: any): EncryptedValue {
    const data = typeof value === 'string' ? value : JSON.stringify(value);

    // Generate random IV (initialization vector)
    const iv = Buffer.alloc(16, 0); // Using zero IV for deterministic encryption (can be randomized if needed)

    const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    return {
      value: `${encrypted}:${authTag.toString('hex')}`,
      encrypted: true,
    };
  }

  /**
   * Decrypt a value encrypted with encryptValue()
   */
  private decryptValue(encrypted: string): any {
    const [encryptedData, authTagHex] = encrypted.split(':');

    if (!encryptedData || !authTagHex) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.alloc(16, 0); // Must match the IV used in encryption
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

    try {
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      // Try to parse as JSON, otherwise return as string
      try {
        return JSON.parse(decrypted);
      } catch {
        return decrypted;
      }
    } catch (error) {
      throw new Error('Failed to decrypt data - authentication failed or key is incorrect');
    }
  }

  /**
   * Save sensitive data with encryption
   * Use this for passwords, API keys, and other sensitive configuration
   */
  saveSecure(key: string, value: any): void {
    const encrypted = this.encryptValue(value);
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO app_state (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `);
    stmt.run(key, JSON.stringify(encrypted));
  }

  /**
   * Load sensitive data with decryption
   * Use this to retrieve passwords, API keys, and other sensitive configuration
   */
  loadSecure(key: string): any {
    const stmt = this.db.prepare('SELECT value FROM app_state WHERE key = ?');
    const result = stmt.get(key) as any;

    if (!result) {
      return null;
    }

    try {
      const encrypted = JSON.parse(result.value) as EncryptedValue;

      if (!encrypted.encrypted) {
        throw new Error(`Expected encrypted value at key ${key}`);
      }

      return this.decryptValue(encrypted.value);
    } catch (error) {
      console.error(`Failed to load secure value for key ${key}:`, error);
      throw error;
    }
  }

  close(): void {
    this.db.close();
  }
}
