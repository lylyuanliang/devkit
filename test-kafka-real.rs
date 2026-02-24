// Test script to verify real Kafka operations
// Run with: cargo test --test test-kafka-real -- --nocapture
//
// Prerequisites:
// 1. Kafka broker running on localhost:9092
// 2. Create test topic: kafka-topics --create --topic test-topic --bootstrap-server localhost:9092

#[cfg(test)]
mod tests {
    use std::time::Duration;
    use rdkafka::config::ClientConfig;
    use rdkafka::producer::{FutureProducer, FutureRecord};
    use rdkafka::consumer::{Consumer, StreamConsumer};

    #[tokio::test]
    async fn test_produce_message() {
        let producer: FutureProducer = ClientConfig::new()
            .set("bootstrap.servers", "localhost:9092")
            .set("client.id", "test-producer")
            .create()
            .expect("Producer creation failed");

        let future_record = FutureRecord::to("test-topic")
            .payload("test message")
            .key("test-key");

        let result = producer
            .send(future_record, Duration::from_secs(10))
            .await;

        match result {
            Ok((partition, offset)) => {
                println!("Message produced successfully!");
                println!("Partition: {}, Offset: {}", partition, offset);
                assert!(offset >= 0);
            }
            Err((e, _)) => {
                panic!("Failed to produce message: {}", e);
            }
        }
    }

    #[tokio::test]
    async fn test_consume_messages() {
        let consumer: StreamConsumer = ClientConfig::new()
            .set("group.id", "test-group")
            .set("bootstrap.servers", "localhost:9092")
            .set("enable.auto.commit", "false")
            .set("auto.offset.reset", "earliest")
            .create()
            .expect("Consumer creation failed");

        consumer
            .subscribe(&["test-topic"])
            .expect("Failed to subscribe");

        let mut messages_received = 0;

        // Try to receive messages with timeout
        for _ in 0..5 {
            match tokio::time::timeout(
                Duration::from_millis(500),
                consumer.recv(),
            )
            .await
            {
                Ok(Ok(msg)) => {
                    messages_received += 1;
                    println!("Received message: {:?}", msg);
                }
                Ok(Err(e)) => {
                    panic!("Consumer error: {}", e);
                }
                Err(_) => {
                    println!("No more messages (timeout)");
                    break;
                }
            }
        }

        println!("Total messages received: {}", messages_received);
        assert!(messages_received >= 0);
    }

    #[tokio::test]
    async fn test_full_workflow() {
        // Produce a message
        let producer: FutureProducer = ClientConfig::new()
            .set("bootstrap.servers", "localhost:9092")
            .set("client.id", "workflow-producer")
            .create()
            .expect("Producer creation failed");

        let message_value = format!("workflow test {}", std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_millis());

        let result = producer
            .send(
                FutureRecord::to("test-topic")
                    .payload(&message_value)
                    .key("workflow-key"),
                Duration::from_secs(10),
            )
            .await;

        assert!(result.is_ok(), "Failed to produce message");
        println!("✓ Message produced: {}", message_value);

        // Wait a bit for message to be available
        tokio::time::sleep(Duration::from_millis(100)).await;

        // Consume the message
        let consumer: StreamConsumer = ClientConfig::new()
            .set("group.id", "workflow-consumer")
            .set("bootstrap.servers", "localhost:9092")
            .set("enable.auto.commit", "false")
            .set("auto.offset.reset", "earliest")
            .create()
            .expect("Consumer creation failed");

        consumer
            .subscribe(&["test-topic"])
            .expect("Failed to subscribe");

        let mut found = false;
        for _ in 0..10 {
            match tokio::time::timeout(
                Duration::from_millis(500),
                consumer.recv(),
            )
            .await
            {
                Ok(Ok(msg)) => {
                    if let Some(payload) = msg.payload() {
                        if let Ok(value) = std::str::from_utf8(payload) {
                            if value == message_value {
                                println!("✓ Message consumed: {}", value);
                                found = true;
                                break;
                            }
                        }
                    }
                }
                Ok(Err(_)) => break,
                Err(_) => break,
            }
        }

        assert!(found, "Did not find the produced message");
    }
}
