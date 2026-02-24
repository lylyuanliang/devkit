#!/usr/bin/env node

/**
 * Kafka 连接测试脚本
 * 用于验证本地 Kafka 实例是否运行并可连接
 */

const { Kafka } = require('kafkajs');

async function testKafkaConnection() {
  const kafka = new Kafka({
    clientId: 'devkit-test-client',
    brokers: ['localhost:9092'],
    retry: {
      initialRetryTime: 100,
      retries: 3,
      randomizationFactor: 0.2,
    },
  });

  const admin = kafka.admin();

  try {
    console.log('🔍 正在连接到 Kafka...');
    console.log('   Broker: localhost:9092\n');

    await admin.connect();
    console.log('✅ 已连接到 Kafka\n');

    // 获取集群信息
    console.log('📊 集群信息:');
    const cluster = await admin.describeCluster();
    console.log(`   Brokers: ${cluster.brokers.length}`);
    cluster.brokers.forEach((broker) => {
      console.log(`     - ID: ${broker.nodeId}, Host: ${broker.host}:${broker.port}`);
    });
    console.log(`   Controller: ${cluster.controller}\n`);

    // 获取 topic 列表
    console.log('📋 已有的 Topics:');
    const metadata = await admin.fetchTopicMetadata();
    if (metadata.topics.length === 0) {
      console.log('   (无 topics，将在首次使用时自动创建)\n');
    } else {
      metadata.topics.forEach((topic) => {
        console.log(
          `   - ${topic.name} (${topic.partitions.length} partitions)`
        );
      });
      console.log();
    }

    // 创建一个测试 topic
    const testTopicName = 'devkit-test';
    const topicExists = metadata.topics.some((t) => t.name === testTopicName);

    if (!topicExists) {
      console.log(`🔧 创建测试 topic: ${testTopicName}...`);
      try {
        await admin.createTopics({
          topics: [
            {
              topic: testTopicName,
              numPartitions: 1,
              replicationFactor: 1,
            },
          ],
          validateOnly: false,
        });
        console.log(`✅ 已创建 topic: ${testTopicName}\n`);
      } catch (err) {
        if (err.message.includes('TOPIC_ALREADY_EXISTS')) {
          console.log(`   (topic 已存在)\n`);
        } else {
          throw err;
        }
      }
    }

    // 测试生产消息
    console.log('📤 测试消息生产...');
    const producer = kafka.producer();
    await producer.connect();

    const result = await producer.send({
      topic: testTopicName,
      messages: [
        {
          key: 'test-key',
          value: JSON.stringify({
            message: 'Hello from DevKit!',
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    });

    console.log(`✅ 消息已发送:`);
    console.log(`   Topic: ${testTopicName}`);
    console.log(`   Partition: ${result[0].partition}`);
    console.log(`   Offset: ${result[0].offset}\n`);

    // 测试消费消息
    console.log('📥 测试消息消费...');
    const consumer = kafka.consumer({ groupId: 'devkit-test-consumer' });
    await consumer.connect();
    await consumer.subscribe({ topic: testTopicName, fromBeginning: true });

    let messageReceived = false;
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log(`✅ 消息已接收:`);
        console.log(`   Topic: ${topic}`);
        console.log(`   Partition: ${partition}`);
        console.log(`   Key: ${message.key}`);
        console.log(`   Value: ${message.value?.toString()}\n`);
        messageReceived = true;
      },
    });

    // 等待消息消费
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await consumer.disconnect();
    await producer.disconnect();

    if (messageReceived) {
      console.log('🎉 Kafka 连接测试成功！\n');
      console.log('你现在可以启动 DevKit 项目了：');
      console.log('  yarn dev\n');
      console.log('访问应用后，在 Kafka Tool 中配置以下信息：');
      console.log('  集群名称: Local Dev');
      console.log('  Broker 地址: localhost:9092');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ 连接失败:', error.message);
    console.error('\n检查项：');
    console.error('  1. Docker 中的 Kafka 容器是否正在运行？');
    console.error('  2. Kafka 是否监听在 localhost:9092？');
    console.error('  3. 网络连接是否正常？\n');
    process.exit(1);
  } finally {
    await admin.disconnect();
  }
}

testKafkaConnection();
