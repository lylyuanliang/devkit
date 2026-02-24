## ADDED Requirements

### Requirement: Display lag metrics
The system SHALL show real-time lag metrics for consumer groups, including lag per partition and total lag.

#### Scenario: Display lag in dashboard
- **WHEN** user navigates to Monitoring view
- **THEN** system displays a table of all consumer groups with their total lag, maximum partition lag, and lag trend

#### Scenario: Display lag over time
- **WHEN** user views a consumer group in monitoring
- **THEN** system displays a chart showing lag trend over time (if historical data available)

### Requirement: Alert on high lag
The system SHALL allow users to configure lag alert thresholds and notify when exceeded.

#### Scenario: Create lag alert rule
- **WHEN** user sets a threshold (e.g., "alert if lag > 10000 messages")
- **THEN** system stores the alert rule and monitors the consumer group

#### Scenario: Trigger alert
- **WHEN** consumer group lag exceeds threshold
- **THEN** system sends a visual/audio alert and logs the alert event

### Requirement: Calculate consumption rate
The system SHALL calculate messages/second consumption rate for consumer groups.

#### Scenario: Display consumption rate
- **WHEN** user views consumer group metrics
- **THEN** system displays current consumption rate (messages per second) and average rate

### Requirement: Performance statistics
The system SHALL collect and display performance statistics including message throughput and latency.

#### Scenario: Display cluster throughput
- **WHEN** user views cluster monitoring
- **THEN** system displays total messages/second across all producers and consumers

#### Scenario: Display latency metrics
- **WHEN** user views monitoring dashboard
- **THEN** system displays end-to-end latency estimates if timestamp data available

### Requirement: Historical lag data
The system SHALL store lag snapshots to enable trend analysis.

#### Scenario: View lag history
- **WHEN** user selects a time range in monitoring
- **THEN** system displays lag values for consumer groups during that period
