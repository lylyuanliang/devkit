## ADDED Requirements

### Requirement: Monitor Lag with Real-Time Metrics
The system SHALL display current lag (in message count) for each partition of each topic in a consumer group. Lag SHALL be updated in real-time at regular intervals (every 10 seconds) to reflect current consumption state.

#### Scenario: Display lag metrics
- **WHEN** user views the Monitoring tab
- **THEN** system displays a table showing: Topic, Partition, Current Lag (in messages), Current Offset, Log End Offset

#### Scenario: Auto-update lag metrics
- **WHEN** user views the Monitoring tab
- **THEN** system automatically fetches and updates lag metrics every 10 seconds without user interaction

#### Scenario: Show update timestamp
- **WHEN** lag metrics are displayed
- **THEN** system shows "Last updated: [time]" to indicate when metrics were last refreshed

#### Scenario: Color code lag severity
- **WHEN** lag values are displayed
- **THEN** system uses color coding: Green (<50 messages), Yellow (50-200), Red (>200) to indicate lag severity

#### Scenario: Stop monitoring when tab inactive
- **WHEN** user switches away from the Monitoring tab
- **THEN** system stops fetching lag metrics to conserve resources

#### Scenario: Resume monitoring when tab active
- **WHEN** user returns to the Monitoring tab
- **THEN** system resumes fetching lag metrics from current state

### Requirement: Display Lag Trend Chart
The system SHALL display a line chart showing lag history over time to help users understand consumption trends and identify bottlenecks.

#### Scenario: Display lag trend chart
- **WHEN** user views the Monitoring tab
- **THEN** system displays a line chart with: X-axis showing time (last 30 minutes), Y-axis showing lag count, and a line for each partition showing lag changes over time

#### Scenario: Aggregate topics in chart
- **WHEN** a consumer group subscribes to multiple topics
- **THEN** system can display either: individual partition trends or aggregated topic trends based on user preference (toggle)

#### Scenario: Show lag statistics
- **WHEN** lag trend chart is displayed
- **THEN** system shows statistics: Current Lag, Average Lag (last 30 min), Max Lag (last 30 min), Min Lag (last 30 min)

#### Scenario: Chart updates as data arrives
- **WHEN** new lag data is fetched (every 10 seconds)
- **THEN** the chart updates to include the new data point, and older data points shift left

#### Scenario: Hover to see details
- **WHEN** user hovers over a data point on the chart
- **THEN** system displays a tooltip showing: Timestamp, Lag count, Topic, Partition

#### Scenario: Store lag history
- **WHEN** lag metrics are updated
- **THEN** system stores up to 180 historical data points (30 minutes of 10-second intervals) in memory

#### Scenario: Clear history on page close
- **WHEN** user navigates away from the consumer group details page
- **THEN** system clears the stored lag history for that group

#### Scenario: Handle chart rendering error
- **WHEN** chart library fails to render
- **THEN** system displays a fallback view showing lag metrics in table format instead
