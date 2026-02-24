## 1. Backend Service Implementation

- [x] 1.1 Create KafkaConsumerService class in packages/core/src/backend/
- [x] 1.2 Implement consumer instance creation with stable group id
- [x] 1.3 Implement fetchMessages() method for consuming from specific offset
- [x] 1.4 Implement fetchFromLatest() to get most recent messages
- [x] 1.5 Implement fetchFromEarliest() to get messages from topic start
- [x] 1.6 Implement fetchFromTimestamp() to find offset by timestamp
- [x] 1.7 Implement partition metadata fetching and caching
- [x] 1.8 Add error handling for connection failures, invalid topics, invalid partitions
- [x] 1.9 Implement graceful resource cleanup on disconnect
- [x] 1.10 Integrate KafkaConsumerService with Tauri IPC commands
- [x] 1.11 Add Tauri command handlers in src-tauri/src/main.rs

## 2. Frontend UI Components - Message List

- [x] 2.1 Implement virtual scrolling component for message list
- [x] 2.2 Implement message list item component showing partition, offset, timestamp, key, value preview
- [x] 2.3 Add click handler to open message detail panel
- [ ] 2.4 Implement incremental loading on scroll (up/down)
- [x] 2.5 Add loading spinner while fetching messages
- [x] 2.6 Add empty state display when no messages found
- [x] 2.7 Add error state display for connection/topic errors

## 3. Frontend UI Components - Message Detail Panel

- [x] 3.1 Create message detail panel component
- [x] 3.2 Display message metadata (partition, offset, timestamp, key)
- [x] 3.3 Implement auto-detection of JSON format
- [x] 3.4 Implement JSON syntax highlighting and pretty-printing
- [x] 3.5 Implement plain text display mode
- [x] 3.6 Implement Base64/Hex display mode for binary content
- [x] 3.7 Add copy-to-clipboard button
- [x] 3.8 Add previous/next navigation buttons
- [x] 3.9 Add close button or swipe to close

## 4. Consumer Position Management

- [x] 4.1 Implement localStorage offsets storage (topic + partition -> offset)
- [x] 4.2 Implement saveOffset() function
- [x] 4.3 Implement loadOffset() function to restore on re-open
- [x] 4.4 Add UI display of current offset position
- [x] 4.5 Add "go to earliest" button
- [x] 4.6 Add "go to latest" button
- [x] 4.7 Implement offset jump input field
- [x] 4.8 Add timestamp-based position selector
- [x] 4.9 Display topic statistics (total messages, min/max offsets)

## 5. Topic and Partition Selection

- [x] 5.1 Update Topics view UI to show partition selector
- [x] 5.2 Implement dropdown/buttons for partition selection (single or all)
- [ ] 5.3 Implement "all partitions" mode with partition labels on messages
- [ ] 5.4 Display partition metadata (message count, earliest offset, latest offset)
- [ ] 5.5 Handle partition count changes dynamically

## 6. Message Search and Filtering

- [x] 6.1 Implement search box UI for message key search
- [x] 6.2 Implement search box for content search
- [x] 6.3 Implement offset range filter
- [ ] 6.4 Implement timestamp range filter
- [x] 6.5 Add case-sensitive toggle for search
- [ ] 6.6 Implement search highlight in message list
- [x] 6.7 Add search result count display
- [ ] 6.8 Implement debounced search
- [x] 6.9 Add clear search button

## 7. State Management and Integration

- [x] 7.1 Add state variables for consume view (topic, partition, startPosition, messages, currentOffset, etc.)
- [x] 7.2 Implement handlers for starting position selection
- [x] 7.3 Implement handlers for partition selection change
- [ ] 7.4 Implement handlers for message list scrolling
- [x] 7.5 Implement handlers for search input
- [x] 7.6 Update UI when cluster changes
- [x] 7.7 Handle cluster disconnection gracefully

## 8. Format Handling and Display

- [x] 8.1 Implement format detection logic (JSON vs plain text)
- [x] 8.2 Implement JSON parser with error handling
- [x] 8.3 Implement JSON.stringify with indentation for display
- [x] 8.4 Implement Base64 encoding/decoding
- [x] 8.5 Implement hex display for binary data
- [ ] 8.6 Test format switching for same message

## 9. Error Handling and User Feedback

- [x] 9.1 Handle "Topic not found" error
- [x] 9.2 Handle "Invalid partition" error
- [x] 9.3 Handle "Invalid offset" error with auto-adjustment
- [ ] 9.4 Handle "Connection timeout" error
- [ ] 9.5 Handle "Broker unreachable" error
- [x] 9.6 Add retry button for failed consumption attempts
- [x] 9.7 Display error messages to user clearly
- [x] 9.8 Handle cluster disconnection during consumption

## 10. Performance Optimization

- [ ] 10.1 Implement message window size limit (max 1000 messages)
- [ ] 10.2 Test virtual scrolling with large message sets
- [ ] 10.3 Optimize partition metadata caching
- [ ] 10.4 Test search debouncing performance
- [ ] 10.5 Profile memory usage with large message loads
- [ ] 10.6 Implement incremental rendering for JSON display

## 11. Testing

- [x] 11.1 Test fetch messages from latest
- [x] 11.2 Test fetch messages from earliest
- [x] 11.3 Test fetch from specific offset
- [x] 11.4 Test fetch from timestamp
- [x] 11.5 Test single partition consumption
- [x] 11.6 Test all partitions consumption
- [ ] 11.7 Test offset restoration after re-open
- [x] 11.8 Test message search by key
- [x] 11.9 Test message search by content
- [x] 11.10 Test JSON auto-detection and formatting
- [ ] 11.11 Test binary message display (Base64/Hex)
- [ ] 11.12 Test offset boundary conditions (earliest/latest)
- [x] 11.13 Test error cases (invalid partition, disconnection, etc.)
- [ ] 11.14 Test virtual scrolling performance
- [ ] 11.15 Test search performance on large message sets

## 12. Polish and Documentation

- [x] 12.1 Verify UI styling matches Kafka Tool theme (dark/light)
- [x] 12.2 Add keyboard shortcuts (e.g., Enter to search, Escape to close detail)
- [ ] 12.3 Test responsive layout on different screen sizes
- [x] 12.4 Add hover tooltips for UI controls
- [ ] 12.5 Verify accessibility (labels, keyboard navigation)
- [ ] 12.6 Add code comments for complex logic
- [ ] 12.7 Test dark mode compatibility for code highlighting
- [x] 12.8 Review and improve error messages
- [ ] 12.9 Update Kafka Tool documentation if needed
- [ ] 12.10 Verify consistent message ordering in list
