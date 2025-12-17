# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [TypeScript (latest), Node.js (LTS)] 
**Primary Dependencies**: [React (latest)]  
**Storage**: [N/A for frontend, or specify backend storage]  
**Testing**: [Jest, React Testing Library]  
**Target Platform**: [Web (Modern Browsers)]
**Project Type**: [web]  
**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]  
**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]  
**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

*   [ ] **I. Clarity and Simplicity**: Is the proposed solution unnecessarily complex? Is the code understandable?
*   [ ] **II. Correctness and Robustness**: Does the plan account for error handling and edge cases?
*   [ ] **III. Testability**: Is the proposed design testable? Are unit tests planned for all new logic?
*   [ ] **IV. Modularity**: Does the design promote modularity and separation of concerns?
*   [ ] **V. User-Centric Design**: Does the plan prioritize a good user experience?

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# Monorepo Structure
packages/
├── har-parser/          # The HAR parsing library
│   ├── src/
│   └── tests/
├── har-viewer/          # The React component for viewing HAR data
│   ├── src/
│   │   ├── components/
│   │   └── hooks/
│   └── tests/
└── vscode-extension/    # The VSCode extension
    ├── src/
    ├── webviews/
    └── tests/

tests/                   # Root-level integration/e2e tests (if applicable)
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
