import React, { useState } from 'react';

interface UsageGuideModalProps {
  onClose: () => void;
  isDarkMode?: boolean;
}

type LanguageTab = 'nodejs' | 'python' | 'java' | 'go';

/**
 * Task 12.1-12.6: Usage Guide Modal
 * Shows code examples for consumer group creation in multiple languages
 */
const UsageGuideModal: React.FC<UsageGuideModalProps> = ({ onClose, isDarkMode = false }) => {
  const [activeTab, setActiveTab] = useState<LanguageTab>('nodejs');

  const codeExamples: Record<LanguageTab, { lang: string; code: string }> = {
    nodejs: {
      lang: 'Node.js',
      code: `const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({
  groupId: 'my-consumer-group'
});

await consumer.connect();
await consumer.subscribe({ topic: 'my-topic' });

await consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    console.log({
      offset: message.offset,
      key: message.key?.toString(),
      value: message.value?.toString(),
    });
  },
});`,
    },
    python: {
      lang: 'Python',
      code: `from kafka import KafkaConsumer
import json

consumer = KafkaConsumer(
    'my-topic',
    bootstrap_servers=['localhost:9092'],
    group_id='my-consumer-group',
    value_deserializer=lambda m: json.loads(m.decode('utf-8')),
    auto_offset_reset='earliest'
)

for message in consumer:
    print(f"Offset: {message.offset}")
    print(f"Key: {message.key}")
    print(f"Value: {message.value}")
    print(f"Topic: {message.topic}")
    print(f"Partition: {message.partition}")`,
    },
    java: {
      lang: 'Java',
      code: `import org.apache.kafka.clients.consumer.*;
import org.apache.kafka.common.serialization.StringDeserializer;
import java.util.*;

Properties props = new Properties();
props.put("bootstrap.servers", "localhost:9092");
props.put("group.id", "my-consumer-group");
props.put("key.deserializer", StringDeserializer.class.getName());
props.put("value.deserializer", StringDeserializer.class.getName());

KafkaConsumer<String, String> consumer =
  new KafkaConsumer<>(props);

consumer.subscribe(Arrays.asList("my-topic"));

while (true) {
  ConsumerRecords<String, String> records =
    consumer.poll(Duration.ofMillis(100));

  for (ConsumerRecord<String, String> record : records) {
    System.out.printf(
      "offset=%d, key=%s, value=%s%n",
      record.offset(), record.key(), record.value()
    );
  }
}`,
    },
    go: {
      lang: 'Go',
      code: `package main

import (
  "fmt"
  "github.com/segmentio/kafka-go"
)

func main() {
  r := kafka.NewReader(kafka.ReaderConfig{
    Brokers: []string{"localhost:9092"},
    Topic:   "my-topic",
    GroupID: "my-consumer-group",
  })

  for {
    msg, err := r.ReadMessage(context.Background())
    if err != nil {
      break
    }

    fmt.Printf("message offset: %d\\n", msg.Offset)
    fmt.Printf("message key: %s\\n", string(msg.Key))
    fmt.Printf("message value: %s\\n", string(msg.Value))
  }

  r.Close()
}`,
    },
  };

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    maxWidth: '900px',
    maxHeight: '90vh',
    width: '90%',
    display: 'flex',
    flexDirection: 'column',
    color: isDarkMode ? '#f3f4f6' : '#111827',
  };

  const headerStyle: React.CSSProperties = {
    padding: '24px',
    borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 600,
    margin: 0,
  };

  const closeButtonStyle: React.CSSProperties = {
    padding: '4px 8px',
    backgroundColor: 'transparent',
    border: 'none',
    color: isDarkMode ? '#9ca3af' : '#6b7280',
    cursor: 'pointer',
    fontSize: '24px',
  };

  const tabsContainerStyle: React.CSSProperties = {
    padding: '0 24px',
    borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
    display: 'flex',
    gap: '8px',
  };

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '12px 16px',
    border: 'none',
    backgroundColor: 'transparent',
    color: isActive
      ? isDarkMode
        ? '#3b82f6'
        : '#2563eb'
      : isDarkMode
      ? '#9ca3af'
      : '#6b7280',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: isActive ? 600 : 500,
    borderBottom: isActive ? `2px solid ${isDarkMode ? '#3b82f6' : '#2563eb'}` : 'none',
    transition: 'all 0.2s',
  });

  const contentStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  };

  const codeBlockStyle: React.CSSProperties = {
    backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
    borderRadius: '4px',
    padding: '16px',
    overflowX: 'auto',
    fontFamily: 'monospace',
    fontSize: '12px',
    lineHeight: '1.5',
    color: isDarkMode ? '#d1d5db' : '#374151',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: '13px',
    color: isDarkMode ? '#d1d5db' : '#6b7280',
    lineHeight: '1.6',
  };

  const copyButtonStyle: React.CSSProperties = {
    padding: '8px 12px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: isDarkMode ? '#3b82f6' : '#2563eb',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 500,
    alignSelf: 'flex-start',
  };

  const footerStyle: React.CSSProperties = {
    padding: '16px 24px',
    borderTop: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
    fontSize: '12px',
    color: isDarkMode ? '#9ca3af' : '#6b7280',
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeExamples[activeTab].code);
    alert('代码已复制到剪贴板！');
  };

  const currentExample = codeExamples[activeTab];

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <h2 style={titleStyle}>📖 消费者组创建指南</h2>
          <button style={closeButtonStyle} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div style={tabsContainerStyle}>
          {(Object.keys(codeExamples) as LanguageTab[]).map((lang) => (
            <button
              key={lang}
              style={tabStyle(activeTab === lang)}
              onClick={() => setActiveTab(lang)}
            >
              {codeExamples[lang].lang}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={contentStyle}>
          <div style={descriptionStyle}>
            <strong>创建消费者组：</strong>
            <p>
              消费者组允许你跨多个进程分配消息消费。每个组有一个唯一ID，成员自动分配到分区。
            </p>
          </div>

          <div>
            <h4 style={{ margin: '8px 0 12px 0' }}>代码示例({currentExample.lang}):</h4>
            <pre style={codeBlockStyle}>{currentExample.code}</pre>
            <button style={copyButtonStyle} onClick={handleCopyCode}>
              📋 复制代码
            </button>
          </div>

          <div style={descriptionStyle}>
            <strong>关键要点：</strong>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>将 'localhost:9092' 替换为你的broker地址</li>
              <li>为消费者组使用唯一的group ID</li>
              <li>订阅一个或多个topic</li>
              <li>实现message handler来处理传入的消息</li>
              <li>Offset自动按组跟踪</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div style={footerStyle}>
          📚 了解更多：<a href="https://kafka.apache.org/documentation/#consumerconfigs"
            style={{ color: isDarkMode ? '#3b82f6' : '#2563eb' }}>
            Kafka Consumer Documentation
          </a>
        </div>
      </div>
    </div>
  );
};

export default UsageGuideModal;
