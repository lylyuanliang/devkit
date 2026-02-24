use rdkafka::client::DefaultClientContext;
use rdkafka::config::ClientConfig;
use rdkafka::consumer::{Consumer, StreamConsumer};
use rdkafka::message::Message;
use rdkafka::producer::{FutureProducer, FutureRecord};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;
use std::time::Duration;

#[derive(Serialize, Deserialize, Clone)]
pub struct KafkaMessage {
    pub partition: i32,
    pub offset: i64,
    pub timestamp: i64,
    pub key: Option<String>,
    pub value: Option<String>,
    pub size: usize,
}

#[derive(Serialize, Deserialize)]
pub struct ProduceMessageRequest {
    pub topic: String,
    pub value: String,
    pub key: Option<String>,
    pub partition: Option<i32>,
}

#[derive(Serialize, Deserialize)]
pub struct ProduceMessageResponse {
    pub partition: i32,
    pub offset: String,
    pub timestamp: String,
}

#[derive(Serialize, Deserialize)]
pub struct ConsumeMessagesRequest {
    pub topic: String,
    pub partition: Option<i32>,
    pub from_beginning: Option<bool>,
    pub limit: Option<usize>,
}

#[derive(Serialize, Deserialize)]
pub struct ConsumeMessagesResponse {
    pub messages: Vec<KafkaMessage>,
    pub total_messages: usize,
    pub has_more: bool,
}

pub struct KafkaConnection {
    pub producer: FutureProducer<DefaultClientContext>,
    pub brokers: String,
}

pub struct KafkaState {
    pub connections: HashMap<String, KafkaConnection>,
}

lazy_static::lazy_static! {
    pub static ref RUNTIME: tokio::runtime::Runtime =
        tokio::runtime::Runtime::new().expect("Failed to create Tokio runtime");

    pub static ref KAFKA_STATE: Mutex<KafkaState> = Mutex::new(KafkaState {
        connections: HashMap::new(),
    });
}

pub fn connect_cluster(cluster_id: String, brokers: Vec<String>) -> Result<(), String> {
    let brokers_str = brokers.join(",");

    // Create producer
    let producer: FutureProducer = ClientConfig::new()
        .set("bootstrap.servers", &brokers_str)
        .set("client.id", "devkit-producer")
        .create()
        .map_err(|e| format!("Failed to create producer: {}", e))?;

    let mut state = KAFKA_STATE
        .lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;

    state.connections.insert(
        cluster_id,
        KafkaConnection {
            producer,
            brokers: brokers_str,
        },
    );

    Ok(())
}

pub fn disconnect_cluster(cluster_id: String) -> Result<(), String> {
    let mut state = KAFKA_STATE
        .lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;

    state.connections.remove(&cluster_id);
    Ok(())
}

pub fn produce_message(
    cluster_id: String,
    request: ProduceMessageRequest,
) -> Result<ProduceMessageResponse, String> {
    let state = KAFKA_STATE
        .lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;

    let connection = state
        .connections
        .get(&cluster_id)
        .ok_or(format!("Cluster '{}' not connected. Please connect to a cluster first.", cluster_id))?;

    let producer = connection.producer.clone();
    drop(state); // Release the lock before async operation

    // Block on async producer send
    RUNTIME.block_on(async {
        let key_ref = request.key.as_deref();

        let mut future_record = FutureRecord::to(&request.topic)
            .payload(&request.value);

        // Add key if provided
        if let Some(key) = key_ref {
            future_record = future_record.key(key);
        }

        // Add partition if provided
        if let Some(partition) = request.partition {
            future_record = future_record.partition(partition);
        }

        match producer.send(future_record, Duration::from_secs(10)).await {
            Ok((partition, offset)) => {
                Ok(ProduceMessageResponse {
                    partition,
                    offset: offset.to_string(),
                    timestamp: chrono::Local::now().to_rfc3339(),
                })
            }
            Err((e, _)) => Err(format!("Failed to produce message: {}", e)),
        }
    })
}

pub fn consume_messages(
    cluster_id: String,
    request: ConsumeMessagesRequest,
) -> Result<ConsumeMessagesResponse, String> {
    // Check if cluster is connected and get brokers
    let state = KAFKA_STATE
        .lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;

    let connection = state
        .connections
        .get(&cluster_id)
        .ok_or(format!("Cluster '{}' not connected. Please connect to a cluster first.", cluster_id))?;

    let brokers = connection.brokers.clone();

    drop(state); // Release the lock before async operation

    let topic = request.topic.clone();
    let from_beginning = request.from_beginning.unwrap_or(false);
    let limit = request.limit.unwrap_or(100);

    RUNTIME.block_on(async {
        // Create a new consumer for this operation
        let consumer: StreamConsumer = ClientConfig::new()
            .set("group.id", format!("devkit-consumer-{}", uuid::Uuid::new_v4()))
            .set("bootstrap.servers", &brokers)
            .set("enable.auto.commit", "false")
            .set("auto.offset.reset", "earliest") // Always use earliest to ensure we can seek to positions
            .set("session.timeout.ms", "10000")
            .set("heartbeat.interval.ms", "3000")
            .create()
            .map_err(|e| format!("Failed to create consumer: {}", e))?;

        // Subscribe to the topic
        let topics = vec![topic.as_str()];
        consumer
            .subscribe(&topics)
            .map_err(|e| format!("Failed to subscribe to topic: {}", e))?;

        let mut messages = Vec::new();
        let mut message_count = 0;

        // Poll for messages - allow longer timeout for consumer group rebalancing
        let max_attempts = if from_beginning { 50 } else { 20 };
        let mut attempts = 0;

        loop {
            attempts += 1;
            if attempts > max_attempts {
                break;
            }

            match tokio::time::timeout(Duration::from_millis(300), consumer.recv()).await {
                Ok(Ok(msg)) => {
                    let payload = msg.payload()
                        .and_then(|bytes: &[u8]| String::from_utf8(bytes.to_vec()).ok());
                    let key = msg.key()
                        .and_then(|bytes: &[u8]| String::from_utf8(bytes.to_vec()).ok());

                    messages.push(KafkaMessage {
                        partition: msg.partition(),
                        offset: msg.offset(),
                        timestamp: msg.timestamp().to_millis().unwrap_or(0),
                        key,
                        value: payload,
                        size: msg.payload().map(|p: &[u8]| p.len()).unwrap_or(0),
                    });
                    message_count += 1;

                    if message_count >= limit {
                        break;
                    }
                }
                Ok(Err(e)) => {
                    return Err(format!("Consumer error: {}", e));
                }
                Err(_) => {
                    // Timeout - continue trying unless we've hit max attempts
                    // This gives time for consumer group rebalancing
                    if !from_beginning && message_count > 0 {
                        break; // For latest mode, stop after first batch
                    }
                    continue;
                }
            }
        }

        Ok(ConsumeMessagesResponse {
            messages,
            total_messages: message_count,
            has_more: false,
        })
    })
}
