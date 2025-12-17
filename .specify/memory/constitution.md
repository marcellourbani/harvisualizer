<!--
Sync Impact Report:

- Version change: 1.1.4 → 1.1.5
- List of modified principles: None
- Added sections: None
- Removed sections: None
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md (will update in this iteration)
  - ✅ .specify/templates/tasks-template.md (already updated)
  - ✅ .specify/templates/spec-template.md (will update in this iteration)
  - ✅ .specify/templates/research.md (will update in this iteration)
- Follow-up TODOs: None
-->
# HAR Visualizer Constitution

## Core Principles

### I. Clarity and Simplicity
Code MUST be written to be as clear, simple, and readable as possible. Avoid cleverness for its own sake. Complex solutions REQUIRE detailed justification and comments. Rationale: Maintainability is paramount; new contributors must be able to ramp up quickly.

### II. Correctness and Robustness
The application MUST produce accurate and correct visualizations of HAR data. It MUST handle malformed or unexpected data gracefully without crashing. Error conditions SHOULD provide clear, actionable feedback to the user. Rationale: The tool's primary function is to provide accurate data representation.

### III. Testability
All new code MUST be designed with testability in mind. Unit tests are non-negotiable for all logic, parsing, and data transformation functions. End-to-end tests SHOULD cover critical user paths. Rationale: A comprehensive test suite ensures correctness and prevents regressions.

### IV. Modularity
The application SHOULD be structured into logical, decoupled modules (e.g., data parsing, UI components, state management). Modules SHOULD have well-defined APIs. Rationale: Modularity promotes reusability, simplifies testing, and makes the codebase easier to reason about.

### V. User-Centric Design
The user experience (UX) is a primary concern. Interfaces MUST be intuitive, responsive, and accessible. Performance bottlenecks that degrade the user experience MUST be addressed. Rationale: A powerful tool is useless if it is difficult or frustrating to use.

### VI. Package Independence
The project is a monorepo with multiple packages. Each package (library, component, extension) MUST be independently versioned and published (even if locally). Packages MUST define clear APIs and minimize direct dependencies on other packages' internal implementations. Rationale: This enforces separation of concerns and allows packages to be reused in other contexts.

### VII. No Minification
Build artifacts MUST NOT be minified. Rationale: Maintainability and debuggability are prioritized over minimal file size, especially for developer tools.

### VII. No Minification
Build artifacts MUST NOT be minified. Rationale: Maintainability and debuggability are prioritized over minimal file size, especially for developer tools.

## Technology Stack

The project is a monorepo composed of three main packages.
- **Monorepo Management:** npm Workspaces
- **Core Library (`har-parser`):** TypeScript, `stream-json` for efficient parsing of large HAR files.
- **UI Component (`har-viewer`):** React with TypeScript, Storybook for development, Vite for building, and Vitest for testing. Bootstrapped with Vite.
- **VSCode Extension (`vscode-extension`):** TypeScript, VSCode API, `esbuild` for bundling and minification. The UI will be rendered in a Webview using the `har-viewer` component.

Rationale: This stack is optimized for creating a modular, maintainable, and extensible developer tool.

## Development Workflow

All development MUST follow a structured workflow to ensure quality and consistency.
- **Branching:** Use a GitFlow-like model (`main`, `develop`, feature branches). Feature branches MUST be created from `develop`.
- **Commits:** Commit messages SHOULD follow the Conventional Commits specification.
- **Local Dependencies:** Use npm workspaces to manage dependencies between local packages (`har-parser`, `har-viewer`, `vscode-extension`).
- **Pull Requests (PRs):** All code changes MUST be submitted via PRs to the `develop` branch. PRs require at least one approving review from another team member.
- **Continuous Integration (CI):** A CI pipeline MUST run tests and linting for all packages on every PR. Merging is blocked if the CI pipeline fails.

## Governance

This Constitution is the supreme governing document for this project. All development practices, architectural decisions, and code contributions MUST adhere to its principles.

Amendments to this Constitution require a formal proposal, a team discussion, and majority approval. Any approved amendment must be documented, and this document must be updated, incrementing the version number according to Semantic Versioning.

**Version**: 1.1.6 | **Ratified**: 2025-11-25 | **Last Amended**: 2025-11-28