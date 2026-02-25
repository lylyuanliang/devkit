## 1. Backend API Setup

- [x] 1.1 Add consumer group Tauri commands to backend (list, get details, get lag)
- [x] 1.2 Implement KafkaJS admin client methods for consumer group operations
- [x] 1.3 Add offset reset Tauri command with timestamp/beginning/end strategies
- [x] 1.4 Add consumer group deletion Tauri command with validation
- [x] 1.5 Add error handling and validation for all consumer group commands

## 2. Frontend API Client

- [x] 2.1 Add consumer group API methods to frontend client
- [x] 2.2 Add TypeScript types for consumer group data structures
- [x] 2.3 Implement API error handling and user feedback

## 3. Consumer Groups List Page

- [x] 3.1 Create consumer groups page component with layout
- [x] 3.2 Implement consumer groups list view with table
- [x] 3.3 Add pagination support to list view
- [x] 3.4 Add search/filter functionality for consumer groups
- [x] 3.5 Add sorting by column (ID, state, members, lag)
- [x] 3.6 Add refresh button and auto-refresh toggle

## 4. Consumer Group Details View

- [x] 4.1 Create consumer group detail page component
- [x] 4.2 Display group metadata (ID, state, protocol, creation time)
- [x] 4.3 Display group members with member ID, client ID, host
- [x] 4.4 Display topic subscriptions
- [x] 4.5 Display partition assignments with offsets and lag
- [x] 4.6 Add visual indicators for high lag partitions

## 5. Offset Reset Feature

- [x] 5.1 Create offset reset dialog component
- [x] 5.2 Implement reset strategy selection (timestamp, beginning, end)
- [x] 5.3 Add date/time picker for timestamp-based reset
- [x] 5.4 Display confirmation with affected partitions and new offsets
- [x] 5.5 Implement offset reset API call and error handling
- [x] 5.6 Display success/error message after reset

## 6. Consumer Group Deletion

- [x] 6.1 Create deletion confirmation dialog
- [x] 6.2 Display warning about data loss
- [x] 6.3 Implement deletion API call
- [x] 6.4 Handle deletion errors (active groups, etc.)
- [x] 6.5 Update list view after successful deletion

## 7. Navigation & Integration

- [x] 7.1 Add consumer groups link to main navigation
- [x] 7.2 Integrate consumer groups page into routing
- [x] 7.3 Add breadcrumb navigation for detail pages
- [x] 7.4 Ensure consistent styling with existing pages

## 8. Testing & Validation

- [ ] 8.1 Test consumer group list with various group counts
- [ ] 8.2 Test pagination and filtering
- [ ] 8.3 Test lag calculation accuracy
- [ ] 8.4 Test offset reset with different strategies
- [ ] 8.5 Test consumer group deletion
- [ ] 8.6 Test error handling for Kafka connection issues
- [ ] 8.7 Performance test with large groups and many partitions
