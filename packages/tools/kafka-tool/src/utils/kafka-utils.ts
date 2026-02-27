/**
 * Check if a topic is a system topic
 * System topics in Kafka start with double underscore (__) prefix
 * Examples: __consumer_offsets, __transaction_state
 *
 * @param topicName - The name of the topic to check
 * @returns true if the topic is a system topic, false otherwise
 */
export function isSystemTopic(topicName: string): boolean {
  return topicName.startsWith('__');
}
