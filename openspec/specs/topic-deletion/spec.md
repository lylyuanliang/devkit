## ADDED Requirements

### Requirement: Delete Topic with Confirmation
The system SHALL allow users to delete a topic from the Kafka cluster. Before deletion, the system SHALL display a confirmation dialog to prevent accidental deletion.

#### Scenario: Open delete confirmation dialog
- **WHEN** user clicks the "Delete" button for a topic in the list
- **THEN** system displays a confirmation dialog showing the topic name and asking for confirmation

#### Scenario: Confirm topic deletion
- **WHEN** user clicks "Confirm" in the deletion confirmation dialog
- **THEN** system deletes the topic from Kafka and displays a success notification

#### Scenario: Auto-refresh list after deletion
- **WHEN** topic deletion succeeds
- **THEN** system automatically closes the confirmation dialog and refreshes the topic list to remove the deleted topic

#### Scenario: Cancel topic deletion
- **WHEN** user clicks "Cancel" in the confirmation dialog
- **WHEN** system closes the dialog without deleting the topic and returns to the topic list

#### Scenario: Handle deletion failure
- **WHEN** topic deletion fails (e.g., topic does not exist, insufficient permissions)
- **THEN** system displays an error message with the reason and allows user to retry or dismiss

#### Scenario: Handle connection error during deletion
- **WHEN** the system loses connection to Kafka during topic deletion
- **THEN** system displays an error message "Connection lost" and allows user to retry

#### Scenario: Disable delete button during operation
- **WHEN** a topic deletion is in progress
- **THEN** system disables the delete button and displays a loading indicator to prevent duplicate requests
