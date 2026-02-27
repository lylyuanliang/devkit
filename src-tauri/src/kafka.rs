use rdkafka::client::DefaultClientContext;
use rdkafka::config::ClientConfig;
use rdkafka::consumer::{Consumer, StreamConsumer};
use rdkafka::message::Message;
use rdkafka::producer::{FutureProducer, FutureRecord};
use rdkafka::admin::AdminClient;
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

#[derive(Serialize, Deserialize, Clone)]
pub struct ConsumerGroup {
    pub group_id: String,
    pub state: String,
    pub protocol_type: String,
    pub members_count: usize,
    pub total_lag: i64,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ConsumerGroupMember {
    pub member_id: String,
    pub client_id: String,
    pub host: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ConsumerGroupDetails {
    pub group_id: String,
    pub state: String,
    pub protocol_type: String,
    pub members: Vec<ConsumerGroupMember>,
    pub topics: Vec<String>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct PartitionOffset {
    pub topic: String,
    pub partition: i32,
    pub current_offset: i64,
    pub log_end_offset: i64,
    pub lag: i64,
}

#[derive(Serialize, Deserialize)]
pub struct ResetOffsetsRequest {
    pub group_id: String,
    pub strategy: String, // "beginning", "end", or "timestamp"
    pub timestamp: Option<i64>,
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
    pub admin: AdminClient<DefaultClientContext>,
    pub brokers: String,
    pub topics: Vec<String>, // 缓存主题列表
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
    println!("Attempting to connect to brokers: {}", brokers_str);

    // First, do a simple TCP connection test to verify broker is reachable
    let first_broker = brokers.first().ok_or("No brokers provided")?;
    let broker_parts: Vec<&str> = first_broker.split(':').collect();
    let host = broker_parts.get(0).ok_or("Invalid broker format")?;
    let port_str = broker_parts.get(1).ok_or("Invalid broker format")?;
    let port: u16 = port_str.parse().map_err(|_| "Invalid port number")?;

    println!("Testing TCP connection to {}:{}", host, port);
    match std::net::TcpStream::connect((host.to_string(), port)) {
        Ok(_) => println!("✓ TCP connection successful"),
        Err(e) => {
            let err_msg = format!("Failed to connect to broker {}:{}: {}", host, port, e);
            println!("{}", err_msg);
            return Err(err_msg);
        }
    }

    // Create producer (non-blocking, connection happens lazily)
    let producer: FutureProducer = ClientConfig::new()
        .set("bootstrap.servers", &brokers_str)
        .set("client.id", "devkit-producer")
        .set("socket.timeout.ms", "5000")
        .set("connections.max.idle.ms", "5000")
        .create()
        .map_err(|e| {
            let err_msg = format!("Failed to create producer: {}", e);
            println!("{}", err_msg);
            err_msg
        })?;

    // Create admin client for metadata operations
    let admin: AdminClient<DefaultClientContext> = ClientConfig::new()
        .set("bootstrap.servers", &brokers_str)
        .set("client.id", "devkit-admin")
        .set("socket.timeout.ms", "5000")
        .create()
        .map_err(|e| {
            let err_msg = format!("Failed to create admin client: {}", e);
            println!("{}", err_msg);
            err_msg
        })?;

    // Fetch topic list using RUNTIME to have Tokio context
    let brokers_for_topics = brokers_str.clone();
    let topics = RUNTIME.block_on(async {
        tokio::task::spawn_blocking(move || {
            match ClientConfig::new()
                .set("bootstrap.servers", &brokers_for_topics)
                .set("group.id", "devkit-metadata-fetch")
                .set("session.timeout.ms", "5000")
                .create::<StreamConsumer>()
            {
                Ok(consumer) => {
                    match consumer.fetch_metadata(None, Duration::from_secs(5)) {
                        Ok(metadata) => {
                            let mut topics: Vec<String> = metadata
                                .topics()
                                .iter()
                                .map(|t| t.name().to_string())
                                .filter(|name| !name.starts_with("__"))
                                .collect();
                            topics.sort();
                            println!("Fetched {} topics during connection", topics.len());
                            topics
                        }
                        Err(e) => {
                            println!("Failed to fetch metadata: {}", e);
                            Vec::new()
                        }
                    }
                }
                Err(e) => {
                    println!("Failed to create consumer for metadata: {}", e);
                    Vec::new()
                }
            }
        }).await.unwrap_or_default()
    });

    println!("Producer and admin client created successfully");

    let mut state = KAFKA_STATE
        .lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;

    state.connections.insert(
        cluster_id.clone(),
        KafkaConnection {
            producer,
            admin,
            brokers: brokers_str,
            topics,
        },
    );

    println!("Successfully connected to cluster: {}", cluster_id);
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

pub fn list_topics(cluster_id: String) -> Result<Vec<String>, String> {
    let state = KAFKA_STATE
        .lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;

    let connection = state
        .connections
        .get(&cluster_id)
        .ok_or(format!("Cluster '{}' not connected", cluster_id))?;

    // 直接返回缓存的主题列表，不需要创建新的 consumer
    let topics = connection.topics.clone();

    if topics.is_empty() {
        println!("No topics found (or topics not yet fetched)");
    } else {
        println!("Returning {} cached topics", topics.len());
    }

    Ok(topics)
}

pub fn list_consumer_groups(cluster_id: String) -> Result<Vec<ConsumerGroup>, String> {
    let state = KAFKA_STATE
        .lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;

    let _connection = state
        .connections
        .get(&cluster_id)
        .ok_or(format!("Cluster '{}' not connected", cluster_id))?;

    // For now, return empty result as listing consumer groups requires admin API
    Ok(Vec::new())
}

pub fn get_consumer_group_details(
    cluster_id: String,
    _group_id: String,
) -> Result<ConsumerGroupDetails, String> {
    let state = KAFKA_STATE
        .lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;

    let _connection = state
        .connections
        .get(&cluster_id)
        .ok_or(format!("Cluster '{}' not connected", cluster_id))?;

    // For now, return empty result as describing groups requires admin API
    Ok(ConsumerGroupDetails {
        group_id: String::new(),
        state: String::new(),
        protocol_type: String::new(),
        members: Vec::new(),
        topics: Vec::new(),
    })
}

pub fn get_consumer_group_lag(
    cluster_id: String,
    group_id: String,
) -> Result<Vec<PartitionOffset>, String> {
    let state = KAFKA_STATE
        .lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;

    let connection = state
        .connections
        .get(&cluster_id)
        .ok_or(format!("Cluster '{}' not connected", cluster_id))?;

    let brokers = connection.brokers.clone();
    drop(state);

    RUNTIME.block_on(async {
        // For now, return empty result as lag calculation requires more complex logic
        // This would need to fetch metadata and calculate lag from log end offset
        Ok(Vec::new())
    })
}

pub fn delete_consumer_group(cluster_id: String, group_id: String) -> Result<(), String> {
    let state = KAFKA_STATE
        .lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;

    let connection = state
        .connections
        .get(&cluster_id)
        .ok_or(format!("Cluster '{}' not connected", cluster_id))?;

    let brokers = connection.brokers.clone();
    drop(state);

    RUNTIME.block_on(async {
        let admin_client: AdminClient<DefaultClientContext> = ClientConfig::new()
            .set("bootstrap.servers", &brokers)
            .create()
            .map_err(|e| format!("Failed to create admin client: {}", e))?;

        admin_client
            .delete_groups(&[&group_id], &Default::default())
            .await
            .map_err(|e| format!("Failed to delete group: {}", e))?;

        Ok(())
    })
}

pub fn reset_consumer_group_offsets(
    cluster_id: String,
    request: ResetOffsetsRequest,
) -> Result<Vec<PartitionOffset>, String> {
    let state = KAFKA_STATE
        .lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;

    let connection = state
        .connections
        .get(&cluster_id)
        .ok_or(format!("Cluster '{}' not connected", cluster_id))?;

    let brokers = connection.brokers.clone();
    drop(state);

    RUNTIME.block_on(async {
        // For now, return empty result as offset reset requires admin API
        // This would need proper implementation with AdminClient
        Ok(Vec::new())
    })
}
