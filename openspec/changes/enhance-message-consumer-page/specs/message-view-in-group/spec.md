## ADDED Requirements

### Requirement: View Messages Consumed by Consumer Group
The system SHALL allow users to view the actual message content (key, value, timestamp, headers) that a consumer group has consumed from a specific topic-partition. Users SHALL be able to navigate through consumed messages to understand what data the consumer group is processing.

#### Scenario: Open message viewer from progress table
- **WHEN** user clicks on a row in the consumption progress table
- **THEN** system opens a modal dialog titled "Messages: [topic-name] Partition [N]" showing the most recent messages consumed by the consumer group on that partition

#### Scenario: Display message list
- **WHEN** the message viewer modal is open
- **THEN** system displays a table with columns: Offset, Key, Timestamp, Message Value, and allows each row to be expanded to view full message details

#### Scenario: Show message details
- **WHEN** user expands a message row in the viewer
- **THEN** system displays: Offset, Key, Timestamp (human-readable and epoch), Headers (if present), and full Message Value (with syntax highlighting if JSON)

#### Scenario: Display current consumption position
- **WHEN** message viewer is open
- **THEN** system highlights or marks the current group offset to show which message was the last one consumed

#### Scenario: Load more messages
- **WHEN** user scrolls up to the beginning of the message list
- **THEN** system loads earlier messages (older offsets) to allow users to see what the consumer group has previously consumed

#### Scenario: Close message viewer
- **WHEN** user clicks "Close" or presses Escape
- **THEN** system closes the modal and returns to the Progress tab

#### Scenario: Handle message loading error
- **WHEN** fetching messages fails
- **THEN** system displays an error message in the modal and provides a "Retry" button

#### Scenario: Show JSON formatting
- **WHEN** a message value is valid JSON
- **THEN** system displays it with syntax highlighting and indentation for readability

#### Scenario: Show large message handling
- **WHEN** a message value is very large (>10KB)
- **THEN** system shows a truncated preview and provides an option to view the full message in a separate text editor or download it
