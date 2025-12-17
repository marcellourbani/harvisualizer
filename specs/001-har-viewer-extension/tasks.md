# Tasks: HAR Viewer Extension

**Input**: Design documents from `specs/001-har-viewer-extension/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/

**Tests**: Test tasks are included as this project requires high reliability.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

## Path Conventions

- Paths are relative to the specific package directory (e.g., `packages/har-parser/src/`).

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Monorepo initialization and basic project structure.

- [X] T001 Create a global `README.md` for the monorepo at the project root.
- [X] T002 Initialize npm monorepo using `npm init` and configure workspaces in `package.json`
- [X] T003 [P] Create base directory structure for `packages/har-parser`
- [X] T004 [P] Create base directory structure for `packages/har-viewer`
- [X] T005 [P] Create base directory structure for `packages/vscode-extension`

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

- [X] T005 Initialize npm project in `packages/har-parser` and install dependencies (`stream-json`)
- [X] T006 Initialize npm project in `packages/har-viewer` and install dependencies (`react`, `react-dom`, `vite`, `vitest`, `storybook`)
- [X] T007 Initialize npm project in `packages/vscode-extension` and install dependencies (`@types/vscode`, `esbuild`)
- [X] T008 [P] Create root `tsconfig.base.json` for shared TypeScript settings
- [X] T009 [P] Create `tsconfig.json` in `packages/har-parser` extending the base config
- [X] T010 [P] Create `tsconfig.json` and `vite.config.ts` in `packages/har-viewer`
- [X] T011 [P] Create `tsconfig.json` and `esbuild.config.js` in `packages/vscode-extension`
- [X] T012 Define the `CommunicationProvider` interface in `packages/har-viewer/src/communication/CommunicationProvider.ts`

## Phase 3: User Story 1 - View HAR file contents (Priority: P1) 🎯 MVP

**Goal**: Open a `.har` file and see a scrollable list of its HTTP calls.

**Independent Test**: Can open a valid `.har` file (both small and large) and see the list of entries render correctly.

### Tests for User Story 1
- [X] T013 [P] [US1] Write unit tests for the HAR parser in `packages/har-parser/tests/parser.test.ts`
- [X] T014 [P] [US1] Write unit tests for the list view component in `packages/har-viewer/tests/EntryList.test.tsx`

### Implementation for User Story 1
- [X] T015 [P] [US1] Implement HAR parsing logic in `packages/har-parser/src/parser.ts`, including conditional lazy-loading using `stream-json`
- [X] T016 [P] [US1] Create the `EntryList` and `EntryListItem` React components in `packages/har-viewer/src/components/`
- [X] T017 [US1] Implement the `VSCodeCommunicationProvider` in `packages/vscode-extension/src/communication/`
- [X] T018 [US1] Implement the main webview UI in `packages/har-viewer/src/HarViewer.tsx`, using the `CommunicationProvider` prop
- [X] T019 [US1] Implement the VSCode Custom Editor logic in `packages/vscode-extension/src/extension.ts` to open a webview for `.har` files
- [X] T020 [US1] In `extension.ts`, use the `har-parser` to read the file and send `loadData` messages to the webview

## Phase 4: User Story 2 - Filter HAR calls (Priority: P2)

**Goal**: Filter the list of calls by method and a fuzzy URL search.

**Independent Test**: The list of entries correctly filters when using the method and URL filter inputs.

### Tests for User Story 2
- [X] T021 [P] [US2] Write unit tests for the filtering logic in `packages/har-viewer/tests/filters.test.ts`

### Implementation for User Story 2
- [X] T022 [P] [US2] Add `FilterBar` component with method dropdown and URL text input to `packages/har-viewer/src/components/`
- [X] T023 [US2] Implement client-side filtering state management (e.g., React hook) in `packages/har-viewer/src/hooks/`
- [X] T024 [US2] Integrate the filtering logic into the `HarViewer.tsx` component

## Phase 5: User Story 3 - Inspect HAR call details (Priority: P3)

**Goal**: Click a call to see its full request/response details in a new pane.

**Independent Test**: Clicking an entry in the list correctly displays its details in a separate, clearly organized view.

### Tests for User Story 3
- [X] T025 [P] [US3] Write unit tests for the detail pane components in `packages/har-viewer/tests/DetailPane.test.tsx`

### Implementation for User Story 3
- [X] T026 [P] [US3] Create `DetailPane`, `RequestDetails`, and `ResponseDetails` components in `packages/har-viewer/src/components/`
- [X] T027 [US3] Implement state management for the selected entry in `packages/har-viewer/`
- [X] T028 [US3] Update `HarViewer.tsx` to display the `DetailPane` when an entry is selected, creating the split-pane layout

## Phase 6: User Story 4 - Theme Synchronization (Priority: P3)

**Goal**: The webview's theme should match the VSCode theme (light/dark).

**Independent Test**: Changing the VSCode theme from light to dark and back updates the webview's theme accordingly.

### Tests for User Story 4
- [X] T029 [P] [US4] Write unit tests for the theme handling logic in `packages/har-viewer/tests/theme.test.ts`

### Implementation for User Story 4
- [X] T030 [P] [US4] In `packages/vscode-extension/src/extension.ts`, detect the initial theme and listen for `window.onDidChangeActiveColorTheme` events.
- [X] T031 [US4] In `packages/vscode-extension/src/extension.ts`, send `themeChanged` messages to the webview with the current theme.
- [X] T032 [US4] In `packages/har-viewer/src/HarViewer.tsx`, listen for `themeChanged` messages and apply a `light` or `dark` class to the root component.
- [X] T033 [US4] Create basic light and dark theme stylesheets in `packages/har-viewer/src/styles/`.

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final documentation and improvements.

- [X] T034 [P] Write `README.md` for `packages/har-parser`
- [X] T035 [P] Write `README.md` for `packages/har-viewer`
- [X] T036 [P] Write `README.md` for `packages/vscode-extension`
- [X] T037 Add comprehensive error handling for malformed files in `packages/har-parser/src/parser.ts`
- [X] T038 Refine UI styling and layout for a polished look and feel.
