## ADDED Requirements

### Requirement: JSON format validation
The system SHALL validate and parse JSON format messages before sending.

#### Scenario: Validate JSON syntax
- **WHEN** user selects JSON format and edits the message
- **THEN** system performs `JSON.parse()` to validate syntax in real-time

#### Scenario: Report JSON errors with location
- **WHEN** JSON syntax is invalid
- **THEN** system displays error message including line number and specific parse error (e.g., "Unexpected token on line 5")

#### Scenario: Accept valid JSON
- **WHEN** JSON is valid
- **THEN** system displays a success indicator (green checkmark) and allows sending

#### Scenario: Minify JSON for transmission
- **WHEN** sending JSON message
- **THEN** system optionally sends minified JSON (no extra whitespace) to reduce message size

### Requirement: Plain text format support
The system SHALL accept any plain text as message content without validation.

#### Scenario: Accept any plain text
- **WHEN** user selects Plain Text format
- **THEN** system accepts any character input including special characters, newlines, and unicode

#### Scenario: No format validation for plain text
- **WHEN** user inputs plain text
- **THEN** system skips all validation and allows immediate sending

#### Scenario: Preserve whitespace in plain text
- **WHEN** user inputs plain text with newlines and indentation
- **THEN** system preserves exact formatting when sending

### Requirement: Format indication in editor
The system SHALL display the current message format in the UI to prevent user confusion.

#### Scenario: Display selected format
- **WHEN** user is editing a message
- **THEN** system displays "Format: JSON" or "Format: Plain Text" near the editor

#### Scenario: Format-specific editor hints
- **WHEN** user has JSON format selected
- **THEN** system displays placeholder text like "Enter valid JSON..."

#### Scenario: Format-specific editor hints for plain text
- **WHEN** user has Plain Text format selected
- **THEN** system displays placeholder text like "Enter message content..."

### Requirement: Format conversion or switching
The system SHALL handle format changes gracefully when user switches format selector.

#### Scenario: Switch from JSON to plain text
- **WHEN** user changes format from JSON to Plain Text
- **THEN** system clears any validation errors and accepts the content as-is

#### Scenario: Switch from plain text to JSON
- **WHEN** user changes format from Plain Text to JSON
- **THEN** system re-validates the content as JSON; if invalid, shows error

#### Scenario: Warn on lossy conversion
- **WHEN** user switches formats and might lose validation
- **THEN** system provides visual indication (validation state changes)
