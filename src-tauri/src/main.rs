#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod kafka;

use serde::{Deserialize, Serialize};
use kafka::{
    connect_cluster, disconnect_cluster, produce_message, consume_messages,
    list_topics, list_consumer_groups, get_consumer_group_details, get_consumer_group_lag,
    delete_consumer_group, reset_consumer_group_offsets,
    ProduceMessageRequest, ConsumeMessagesRequest, ResetOffsetsRequest,
};

#[derive(Serialize, Deserialize)]
struct ToolMetadata {
    id: String,
    name: String,
    category: String,
    icon: String,
    version: String,
}

#[tauri::command]
fn get_available_tools() -> Vec<ToolMetadata> {
    vec![
        ToolMetadata {
            id: "kafka-tool".to_string(),
            name: "Kafka Client".to_string(),
            category: "Data Streaming".to_string(),
            icon: "🔄".to_string(),
            version: "0.1.0".to_string(),
        },
    ]
}

#[tauri::command]
fn open_tool(tool_id: String, _config: Option<serde_json::Value>) -> Result<(), String> {
    println!("Opening tool: {}", tool_id);
    Ok(())
}

#[tauri::command]
fn close_tool(tool_id: String) -> Result<(), String> {
    println!("Closing tool: {}", tool_id);
    Ok(())
}

#[tauri::command]
fn get_tool_status(tool_id: String) -> String {
    println!("Getting status for tool: {}", tool_id);
    "disconnected".to_string()
}

#[tauri::command]
fn kafka_connect(cluster_id: String, brokers: Vec<String>) -> Result<(), String> {
    connect_cluster(cluster_id, brokers)
}

#[tauri::command]
fn kafka_disconnect(cluster_id: String) -> Result<(), String> {
    disconnect_cluster(cluster_id)
}

#[tauri::command]
fn kafka_produce_message(
    cluster_id: String,
    request: ProduceMessageRequest,
) -> Result<kafka::ProduceMessageResponse, String> {
    produce_message(cluster_id, request)
}

#[tauri::command]
fn kafka_consume_messages(
    cluster_id: String,
    request: ConsumeMessagesRequest,
) -> Result<kafka::ConsumeMessagesResponse, String> {
    consume_messages(cluster_id, request)
}

#[tauri::command]
fn kafka_list_topics(cluster_id: String) -> Result<Vec<String>, String> {
    list_topics(cluster_id)
}

#[tauri::command]

#[tauri::command]
fn kafka_get_consumer_group_details(
    cluster_id: String,
    group_id: String,
) -> Result<kafka::ConsumerGroupDetails, String> {
    get_consumer_group_details(cluster_id, group_id)
}

#[tauri::command]
fn kafka_get_consumer_group_lag(
    cluster_id: String,
    group_id: String,
) -> Result<Vec<kafka::PartitionOffset>, String> {
    get_consumer_group_lag(cluster_id, group_id)
}

#[tauri::command]
fn kafka_delete_consumer_group(cluster_id: String, group_id: String) -> Result<(), String> {
    delete_consumer_group(cluster_id, group_id)
}

#[tauri::command]
fn kafka_reset_consumer_group_offsets(
    cluster_id: String,
    request: ResetOffsetsRequest,
) -> Result<Vec<kafka::PartitionOffset>, String> {
    reset_consumer_group_offsets(cluster_id, request)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_available_tools,
            open_tool,
            close_tool,
            get_tool_status,
            kafka_connect,
            kafka_disconnect,
            kafka_produce_message,
            kafka_consume_messages,
            kafka_list_topics,
            kafka_list_consumer_groups,
            kafka_get_consumer_group_details,
            kafka_get_consumer_group_lag,
            kafka_delete_consumer_group,
            kafka_reset_consumer_group_offsets,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
