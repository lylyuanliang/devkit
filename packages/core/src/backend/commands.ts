import { ToolRegistryImpl } from './tool-registry';
import { DatabaseService } from './database';
import { EventBus, CORE_EVENTS } from './event-bus';
import { ToolStatus } from '@devkit/shared';

let registry: ToolRegistryImpl;
let db: DatabaseService;
let eventBus: EventBus;

export function initializeBackend() {
  registry = new ToolRegistryImpl();
  db = new DatabaseService();
  eventBus = EventBus.getInstance();
}

#[tauri::command]
pub async fn get_available_tools() -> Result<Vec<ToolMetadata>, String> {
  let tools = registry.list();
  Ok(tools.into_iter().map(|t| ToolMetadata {
    id: t.id,
    name: t.name,
    category: t.category,
    icon: t.icon,
    version: t.version,
    status: "disconnected".to_string(),
  }).collect())
}

#[tauri::command]
pub async fn open_tool(tool_id: String, config: Option<serde_json::Value>) -> Result<(), String> {
  // Implementation in Rust backend
  Ok(())
}

#[tauri::command]
pub async fn close_tool(tool_id: String) -> Result<(), String> {
  // Implementation in Rust backend
  Ok(())
}

#[tauri::command]
pub async fn get_tool_status(tool_id: String) -> Result<String, String> {
  // Implementation in Rust backend
  Ok("disconnected".to_string())
}

#[tauri::command]
pub async fn update_tool_config(tool_id: String, config: serde_json::Value) -> Result<(), String> {
  // Implementation in Rust backend
  Ok(())
}

#[tauri::command]
pub async fn get_app_state() -> Result<serde_json::Value, String> {
  // Implementation in Rust backend
  Ok(serde_json::json!({}))
}

#[tauri::command]
pub async fn save_app_state(state: serde_json::Value) -> Result<(), String> {
  // Implementation in Rust backend
  Ok(())
}
