## ADDED Requirements

### Requirement: Build Configuration File

The system SHALL support a configuration file that specifies which tools to include in the build.

#### Scenario: Build config file exists
- **WHEN** the build process starts
- **THEN** the system SHALL look for a tools.config.json file
- **AND** if it exists, the system SHALL use it to determine which tools to include

#### Scenario: Build config specifies included tools
- **WHEN** tools.config.json contains an "included" array
- **THEN** only the tools listed in "included" SHALL be packaged
- **AND** all other tools SHALL be excluded from the build

#### Scenario: Build config specifies excluded tools
- **WHEN** tools.config.json contains an "excluded" array
- **THEN** the tools listed in "excluded" SHALL NOT be packaged
- **AND** all other tools SHALL be included in the build

#### Scenario: Default behavior without config
- **WHEN** no tools.config.json file exists
- **THEN** all available tools SHALL be included in the build
- **AND** the build SHALL proceed normally

### Requirement: Tool Bundling

The system SHALL bundle only the selected tools into the final application package.

#### Scenario: Selected tools are bundled
- **WHEN** the build process runs with a configuration
- **THEN** only the selected tools SHALL be included in the final package
- **AND** excluded tools SHALL not be present in the package

#### Scenario: Tool dependencies are resolved
- **WHEN** a tool is selected for bundling
- **THEN** all of the tool's dependencies SHALL be included
- **AND** shared dependencies SHALL be deduplicated

#### Scenario: Package size is minimized
- **WHEN** tools are excluded from the build
- **THEN** the final package size SHALL be smaller than if all tools were included
- **AND** only necessary code and dependencies SHALL be bundled

### Requirement: Build Output

The system SHALL produce a single executable package containing the core and selected tools.

#### Scenario: Single executable is created
- **WHEN** the build process completes
- **THEN** a single executable file SHALL be created
- **AND** the executable SHALL contain the core application and all selected tools

#### Scenario: Executable is self-contained
- **WHEN** the executable is run
- **THEN** it SHALL not require any external dependencies
- **AND** it SHALL include all necessary runtime files

#### Scenario: Executable is cross-platform
- **WHEN** the build process runs on different platforms (Windows, macOS, Linux)
- **THEN** platform-specific executables SHALL be created
- **AND** each executable SHALL be optimized for its target platform
