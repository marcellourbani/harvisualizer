# Feature Specification: HAR Viewer Extension

**Feature Branch**: `001-har-viewer-extension`  
**Created**: 2025-11-25
**Status**: Draft  
**Input**: "thie is a vscode extensin to display har files in a webview or a custm editor har files represent recording of http calls, most browser can import/export them I want the har processing and the ui to be reusable, so they shoud live in separate pakages with no dependencies o vscode. I don't want to publish them at the mment but I might change my mind later When I open a .har file in vscode, this xtension will be activated and show a list of the calls found in the file, highlighting the method. List must be scrollable, and will have flters by method and url. The url fter should behave like a fuzzy finder whn I click on a call the ui will plit in 2 panes, with the ight on showing all details of the curent call, with clear distinction between request and response. Payload shuld be shown as raw for now, will probably change in the future"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View HAR file contents (Priority: P1)

As a developer, when I open a `.har` file in VSCode, I want to see a list of all HTTP calls from the file so that I can quickly get an overview of the captured traffic.

**Why this priority**: This is the core functionality of the extension.

**Independent Test**: Open a `.har` file and verify that a list of calls is displayed.

**Acceptance Scenarios**:

1. **Given** I have a valid `.har` file, **When** I open it in VSCode, **Then** the extension's custom editor is activated and displays a list of HTTP calls.
2. **Given** the list of calls is displayed, **When** I scroll the list, **Then** I can see all the calls in the file.

### User Story 2 - Filter HAR calls (Priority: P2)

As a developer, I want to be able to filter the list of calls by HTTP method and URL so that I can easily find specific requests.

**Why this priority**: This is essential for working with large HAR files.

**Independent Test**: Use the filter controls and verify that the list of calls is updated accordingly.

**Acceptance Scenarios**:

1. **Given** a list of calls is displayed, **When** I filter by an HTTP method (e.g., "POST"), **Then** the list only shows calls with that method.
2. **Given** a list of calls is displayed, **When** I type in the URL filter, **Then** the list updates to show only calls with a URL matching the filter (fuzzy search).

### User Story 3 - Inspect HAR call details (Priority: P3)

As a developer, when I click on a call in the list, I want to see the full request and response details in a separate pane so that I can inspect the selected call in detail.

**Why this priority**: This allows for in-depth analysis of individual calls.

**Independent Test**: Click on a call and verify that the details are displayed correctly.

**Acceptance Scenarios**:

1. **Given** a list of calls is displayed, **When** I click on a call, **Then** the UI splits into two panes.
2. **Given** the UI is split, **Then** the right pane displays the details of the selected call.
3. **Given** the details are displayed, **Then** there is a clear distinction between the request and response sections.

### User Story 4 - Theme Synchronization (Priority: P3)

As a developer, I want the HAR viewer's theme to match my VSCode theme (light/dark) for a consistent look and feel.

**Why this priority**: This improves the user experience by integrating the viewer seamlessly into the editor's UI.

**Independent Test**: Change the VSCode theme from light to dark (or vice versa) and verify that the HAR viewer's theme updates accordingly.

**Acceptance Scenarios**:

1. **Given** the HAR viewer is open, **When** the VSCode theme is light, **Then** the viewer is displayed in a light theme.
2. **Given** the HAR viewer is open, **When** the VSCode theme is dark, **Then** the viewer is displayed in a dark theme.
3. **Given** the HAR viewer is open, **When** I change the VSCode theme, **Then** the viewer's theme updates automatically without needing to be reloaded.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST activate when a file with the `.har` extension is opened in VSCode.
- **FR-002**: The system MUST display a scrollable list of all HTTP requests found in the HAR file.
- **FR-003**: Each item in the list MUST display the HTTP method (e.g., GET, POST) and the URL.
- **FR-004**: The system MUST provide a filter for the list by HTTP method.
- **FR-005**: The system MUST provide a fuzzy-search filter for the list by URL.
- **FR-006**: When a call is selected from the list, the UI MUST split into two panes.
- **FR-007**: The right pane MUST display the details of the selected call, with a clear separation between the request and response.
- **FR-008**: Request and response payloads MUST be displayed as raw text.
- **FR-009**: The HAR parsing logic MUST be in a separate, reusable package with no VSCode dependencies.
- **FR-010**: The UI components MUST be in a separate, reusable package with no VSCode dependencies.
- **FR-011**: For HAR files larger than a configurable threshold (defaulting to 50MB), the system MUST employ a lazy-loading strategy for `log.entries` to avoid excessive memory consumption.
- **FR-012**: The system MUST detect the current VSCode theme (light/dark) and apply a corresponding theme to the HAR viewer webview.

### Key Entities

- **HAR File:** The input file containing HTTP archive data.
- **HTTP Call/Entry:** A single request/response pair within the HAR file.
- **Request:** The request part of an HTTP call.
- **Response:** The response part of an HTTP call.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of valid `.har` files generated by Chrome, Firefox, and Edge can be opened and parsed without error.
- **SC-002**: For a HAR file with 1000 entries (or up to 1GB using lazy loading), the initial list of calls renders in under 2 seconds.
- **SC-003**: Filtering the list of 1000 entries by method or URL updates the view in under 500ms.
- **SC-004**: A developer can find and open the details of a specific call from a 1000-entry HAR file in under 30 seconds.
- **SC-005**: The HAR parsing library has 0 dependencies on the VSCode API.
- **SC-006**: The UI component library has 0 dependencies on the VSCode API.
- **SC-007**: The HAR viewer theme updates within 1 second of a VSCode theme change.

## Assumptions

- The fuzzy finder for the URL filter will be a simple, case-insensitive substring match for the initial implementation.
- The extension will initially be implemented as a custom editor for `.har` files.
- "Raw" payload display means the literal content of the `content.text` field in the HAR file.