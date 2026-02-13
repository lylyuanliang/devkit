import Database from 'better-sqlite3';
import path from 'path';
import { app } from '@tauri-apps/api';

export class DatabaseService {
  private db: Database.Database;

  constructor() {
    const appDir = app.getAppDataDir();
    const dbPath = path.join(appDir, 'devkit.db');
    this.db = new Database(dbPath);
    this.initializeSchema();
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

  close(): void {
    this.db.close();
  }
}
