## 1. Infrastructure & Store Setup

- [x] 1.1 Create consumer group store (Zustand) for managing details page state
- [x] 1.2 Add state for selected consumer group, loading, error, and current tab
- [x] 1.3 Add state for lag history data with size limit (180 entries)
- [x] 1.4 Add actions to store: setSelectedGroup, setLoading, setError, setCurrentTab, addLagHistory
- [x] 1.5 Create Lag data types and interfaces (LagHistoryEntry, LagMetrics)
- [x] 1.6 Verify ConsumerGroupService API methods are accessible from components

## 2. MessageConsumer Container & Layout

- [x] 2.1 Implement MessageConsumer.tsx as main container component
- [x] 2.2 Add conditional rendering: show onboarding if no groups, else show group list or details
- [x] 2.3 Implement main layout with sidebar (group list) and main panel (group details)
- [x] 2.4 Add navigation logic between list view and details view
- [x] 2.5 Implement "Back to Groups" navigation from details page

## 3. Consumer Group List View

- [x] 3.1 Implement group list display with search/filter functionality
- [x] 3.2 Add refresh button to reload group list
- [x] 3.3 Display group name, state badge, and member count for each group
- [x] 3.4 Add click handler to select group and navigate to details
- [x] 3.5 Handle loading, error, and empty states for list
- [x] 3.6 Add demo group visual indicator (badge)

## 4. Consumer Group Details Page - Container

- [x] 4.1 Create ConsumerGroupDetailsPage.tsx component
- [x] 4.2 Implement Tab navigation (Overview, Progress, Monitoring)
- [x] 4.3 Add tab state management and switching logic
- [x] 4.4 Implement header with group name, state badge, refresh button
- [x] 4.5 Ensure tabs maintain state when switching (lazy loading, caching)

## 5. Overview Tab - Group Information

- [x] 5.1 Create OverviewTab.tsx component
- [x] 5.2 Fetch and display group info: Group ID, State, Created Date, Topics list
- [x] 5.3 Implement member list with expandable tree view
- [x] 5.4 Display member details: Member ID, Client ID, Host, Assigned Partitions
- [x] 5.5 Add "Last updated" timestamp
- [x] 5.6 Handle loading and error states

## 6. Progress Tab - Consumption Progress

- [x] 6.1 Create ProgressTab.tsx component
- [x] 6.2 Fetch consumption offsets using ConsumerGroupService.getConsumerGroupOffsets()
- [x] 6.3 Build progress table with columns: Topic, Partition, Current Offset, Lag, LEO
- [x] 6.4 Implement sorting functionality (click column headers)
- [x] 6.5 Implement search/filter for topic and partition
- [x] 6.6 Add click handler on table rows to open message viewer
- [x] 6.7 Handle loading, error, and empty partition states

## 7. Message Viewer Modal

- [x] 7.1 Create MessageViewerModal.tsx component
- [x] 7.2 Accept topic, partition, and current offset as props
- [x] 7.3 Fetch messages using KafkaConsumerService for the selected partition
- [x] 7.4 Display message table: Offset, Key, Timestamp, Value preview
- [x] 7.5 Implement row expansion to show full message details
- [x] 7.6 Add JSON syntax highlighting for message values
- [x] 7.7 Handle large messages (>10KB) with truncation and expand option
- [x] 7.8 Implement pagination/load more for scrolling through older messages
- [x] 7.9 Highlight current offset (group's last consumed message)
- [x] 7.10 Implement close modal functionality
- [x] 7.11 Handle loading, error, and empty message states

## 8. Monitoring Tab - Lag Metrics

- [x] 8.1 Create MonitoringTab.tsx component
- [x] 8.2 Display lag metrics table: Topic, Partition, Current Lag, Offset, LEO
- [x] 8.3 Implement color coding for lag severity (Green: <50, Yellow: 50-200, Red: >200)
- [x] 8.4 Add "Last updated" timestamp
- [x] 8.5 Implement 10-second polling interval for lag metrics
- [x] 8.6 Handle polling pause when tab is inactive
- [x] 8.7 Handle loading and error states

## 9. Lag Trend Chart

- [x] 9.1 Choose and integrate chart library (Recharts or simple SVG)
- [x] 9.2 Create LagTrendChart.tsx component
- [x] 9.3 Implement line chart showing lag history over time (X: time, Y: lag count)
- [x] 9.4 Add partition selector/toggle for single partition or aggregated view
- [x] 9.5 Implement chart data point updates as new lag data arrives
- [x] 9.6 Add hover tooltip showing timestamp, lag, topic, partition
- [x] 9.7 Display lag statistics: Current, Average, Max, Min
- [x] 9.8 Implement fallback to table view if chart rendering fails
- [x] 9.9 Handle chart responsiveness for different screen sizes

## 10. Lag History Management

- [x] 10.1 Implement lag history storage in store (max 180 entries)
- [x] 10.2 Add logic to fetch lag metrics periodically (every 10 seconds)
- [x] 10.3 Implement history cleanup when navigating away from group
- [x] 10.4 Handle lag data aggregation by partition and topic
- [x] 10.5 Ensure lag history is cleared on page close/reload

## 11. Onboarding Interface - No Groups State

- [x] 11.1 Create ConsumerGroupOnboarding.tsx component
- [x] 11.2 Display onboarding title and description
- [x] 11.3 Implement three main action sections: Guide, Demo, System Topic
- [x] 11.4 Add styling and layout (centered, easy to scan)
- [x] 11.5 Add "Skip" button to dismiss onboarding temporarily

## 12. Usage Guide

- [x] 12.1 Create UsageGuideModal.tsx component
- [x] 12.2 Implement tab interface for different languages (Node.js, Python, Java, etc.)
- [x] 12.3 Create code examples for each language showing consumer group creation
- [x] 12.4 Add comments explaining groupId, topic subscription, message handler
- [x] 12.5 Implement "Copy Code" button for each example
- [x] 12.6 Add links to official Kafka documentation and tool docs

## 13. Demo Consumer Group Feature

- [x] 13.1 Create DemoConsumerGroupForm.tsx component
- [x] 13.2 Implement topic selector dropdown (excluding system topics)
- [x] 13.3 Implement "Create Demo Consumer Group" button
- [x] 13.4 Add backend logic to create consumer group with auto-generated ID
- [x] 13.5 Implement auto-start consumption for demo group
- [x] 13.6 Add visual indicator (badge) for demo groups in list
- [x] 13.7 Implement 5-minute inactivity timer for demo groups
- [x] 13.8 Add UI to resume or delete stopped demo groups
- [x] 13.9 Handle creation error scenarios (topic not found, permission denied)

## 14. Onboarding Integration

- [x] 14.1 Detect when no consumer groups exist
- [x] 14.2 Show onboarding interface instead of empty list
- [x] 14.3 Auto-hide onboarding when first group appears/is created
- [x] 14.4 Add navigation from each onboarding option to corresponding feature
- [x] 14.5 Implement "View System Topic" link to navigate to Topic list (__consumer_offsets)

## 15. Offset Reset Integration

- [x] 15.1 Add "Reset Offset" button to Overview or Details page header
- [x] 15.2 Integrate existing OffsetResetForm component
- [x] 15.3 Allow users to reset offsets from the details page
- [x] 15.4 Refresh progress table after offset reset

## 16. Styling & Responsive Design

- [x] 16.1 Apply consistent styling to details page (dark mode support)
- [x] 16.2 Implement responsive layout for mobile/tablet views
- [x] 16.3 Style tabs, tables, modals, and forms
- [x] 16.4 Add loading spinners and skeleton placeholders
- [x] 16.5 Implement error state styling with helpful messages

## 17. Error Handling & Edge Cases

- [x] 17.1 Handle group deleted while viewing details
- [x] 17.2 Handle network errors during lag polling
- [x] 17.3 Handle empty message history scenario
- [x] 17.4 Handle permission errors (user lacks authorization)
- [x] 17.5 Implement retry mechanisms for failed operations
- [x] 17.6 Add timeout handling for long-running requests

## 18. Performance Optimization

- [x] 18.1 Implement virtual scrolling for large message lists
- [x] 18.2 Optimize lag polling to avoid excessive API calls
- [x] 18.3 Implement memoization for expensive computations
- [x] 18.4 Lazy load chart library only when Monitoring tab is viewed
- [x] 18.5 Cleanup lag history and listeners on component unmount

## 19. State Persistence

- [x] 19.1 Save current tab preference per group
- [x] 19.2 Persist lag history during session (not page reload)
- [x] 19.3 Restore scroll positions in tables/modals
- [x] 19.4 Handle workspace state preservation (existing functionality)

## 20. Testing & Quality Assurance

- [x] 20.1 Write unit tests for consumer group details page
- [x] 20.2 Write unit tests for message viewer modal
- [x] 20.3 Write unit tests for lag monitoring dashboard
- [x] 20.4 Write unit tests for onboarding interface
- [x] 20.5 Write integration tests for group selection flow
- [x] 20.6 Write integration tests for message viewing flow
- [x] 20.7 Test lag polling behavior (10-second intervals, pause/resume)
- [x] 20.8 Test demo group creation and lifecycle
- [x] 20.9 Accessibility testing (keyboard navigation, screen readers)
- [x] 20.10 Performance testing (lag polling, large message lists, chart rendering)
- [x] 20.11 Cross-browser testing (Chrome, Firefox, Safari)
- [x] 20.12 Mobile/tablet responsive testing
- [x] 20.13 Manual testing of complete workflows in dev environment
- [x] 20.14 Test with different consumer group configurations

## 21. Documentation & Updates

- [x] 21.1 Update COMPONENTS.md with MessageConsumer component documentation
- [x] 21.2 Add JSDoc comments to all new components and functions
- [x] 21.3 Document the lag monitoring polling strategy
- [x] 21.4 Document demo group feature and lifecycle
- [x] 21.5 Update README.md with MessageConsumer feature overview
- [x] 21.6 Add inline code comments for complex logic
- [x] 21.7 Document chart library usage and configuration

## 22. Code Review & Refinement

- [x] 22.1 Review code for consistency with existing codebase
- [x] 22.2 Verify no breaking changes to existing APIs
- [x] 22.3 Refactor repeated code into reusable utilities
- [x] 22.4 Verify TypeScript type safety throughout
- [x] 22.5 Clean up console logs and temporary debug code
- [x] 22.6 Ensure proper error boundary implementation
