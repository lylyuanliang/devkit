## 1. Backend Service Implementation

- [x] 1.1 Create KafkaProducerService class in packages/core/src/backend/
- [x] 1.2 Add Producer instance management (create/disconnect) to KafkaProducerService
- [x] 1.3 Implement produceMessage() method with support for plain text and JSON formats
- [x] 1.4 Add error handling for connection failures, invalid topics, invalid partitions
- [x] 1.5 Implement topic metadata fetching and caching for validation
- [x] 1.6 Add support for optional message key parameter
- [x] 1.7 Add support for optional partition targeting
- [x] 1.8 Integrate KafkaProducerService with Tauri IPC commands (invoke from frontend)
- [x] 1.9 Add Tauri command handler for produceMessage in src-tauri/src/main.rs

## 2. Frontend UI Components

- [x] 2.1 Create ProduceView component (or update existing produce view in KafkaToolComponent)
- [x] 2.2 Implement topic selector dropdown (fetching topics from current cluster)
- [x] 2.3 Implement message editor textarea with placeholder text
- [x] 2.4 Implement message format selector (JSON / Plain Text)
- [x] 2.5 Add JSON validation with real-time error display
- [x] 2.6 Implement advanced options section (collapsible)
- [x] 2.7 Add message key input field in advanced options
- [x] 2.8 Add partition selector input in advanced options
- [x] 2.9 Implement send button with disabled state management
- [x] 2.10 Add success toast notification with partition, offset, timestamp

## 3. Format Handling and Validation

- [x] 3.1 Implement JSON validation utility (JSON.parse with error handling)
- [x] 3.2 Add JSON error message display with line numbers
- [x] 3.3 Implement format-specific validation logic
- [x] 3.4 Add size warning for messages >100KB
- [x] 3.5 Add 1MB hard limit validation
- [ ] 3.6 Test format switching behavior in UI

## 4. Error Handling and User Feedback

- [x] 4.1 Implement error toast notifications for send failures
- [x] 4.2 Handle "Topic not found" error
- [x] 4.3 Handle "Invalid partition" error
- [x] 4.4 Handle "Cluster disconnected" error
- [x] 4.5 Handle "Connection timeout" error
- [x] 4.6 Add retry mechanism for failed sends
- [x] 4.7 Display empty state when no cluster connected
- [x] 4.8 Display empty state when no topics available

## 5. State Management and Integration

- [x] 5.1 Add state variables to KafkaToolComponent for produce view (topic, content, format, key, partition)
- [x] 5.2 Implement handlers for topic selection change
- [x] 5.3 Implement handlers for format selection change
- [x] 5.4 Implement handler for send button click
- [x] 5.5 Manage loading state during message transmission
- [x] 5.6 Clear editor state after successful send (or provide clear option)
- [x] 5.7 Update UI when cluster changes (reset topic selector, show disconnect message)

## 6. Testing

- [x] 6.1 Test single message send to Kafka (plain text)
- [x] 6.2 Test single message send to Kafka (JSON)
- [x] 6.3 Test message send with key
- [x] 6.4 Test message send to specific partition
- [x] 6.5 Test JSON validation (valid and invalid)
- [x] 6.6 Test error handling for disconnected cluster
- [x] 6.7 Test error handling for non-existent topic
- [x] 6.8 Test error handling for invalid partition
- [x] 6.9 Test large message warning (>100KB)
- [x] 6.10 Test format switching behavior

## 7. Polish and Documentation

- [x] 7.1 Verify UI styling matches Kafka Tool theme (dark/light mode)
- [x] 7.2 Add tooltip/help text for advanced options
- [x] 7.3 Test responsive layout on different screen sizes
- [x] 7.4 Verify accessibility (keyboard navigation, labels)
- [x] 7.5 Add code comments for complex logic
- [x] 7.6 Update Kafka Tool documentation if needed
- [x] 7.7 Performance check - message editor responsiveness for large content
- [x] 7.8 Review error messages for clarity and user-friendliness
