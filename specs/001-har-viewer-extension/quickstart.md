# Quickstart: HAR Viewer Extension Development

This guide provides instructions for setting up the development environment and running the HAR Viewer extension.

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS version)
- [npm](https://www.npmjs.com/)
- [Visual Studio Code](https://code.visualstudio.com/)

## Setup

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

2.  **Install dependencies**:
    This project uses npm workspaces. The `npm install` command at the root of the project will install dependencies for all packages and link them together.
    ```bash
    npm install
    ```

## Development Workflow

### Running the Extension

1.  **Open the project in VSCode**:
    ```bash
    code .
    ```

2.  **Start the development build**:
    Each package has its own build process. To build all packages in watch mode, you can use a script in the root `package.json`.
    ```bash
    npm run dev
    ```
    This command should concurrently run the build process for `har-parser`, `har-viewer`, and `vscode-extension`.

3.  **Start debugging in VSCode**:
    - Open the "Run and Debug" view in VSCode (Ctrl+Shift+D).
    - Select the "Run Extension" launch configuration.
    - Press F5 to start the Extension Development Host.

4.  **Testing the extension**:
    - In the Extension Development Host window, open a `.har` file.
    - The HAR Viewer custom editor should open and display the contents of the file.

### Package-specific development

You can also work on each package individually.

-   **`har-parser`**:
    This is a standard TypeScript library. You can run tests with:
    ```bash
    cd packages/har-parser
    npm test
    ```

-   **`har-viewer`**:
    This is a React component library. You can set up a new project using Vite.
    ```bash
    cd packages/har-viewer
    npm create vite@latest . -- --template react-ts
    npm install
    ```
    You can run tests with Vitest:
    ```bash
    npm test
    ```
    Then, you can run it in isolation using Storybook:
    ```bash
    npm run storybook
    ```

-   **`vscode-extension`**:
    This is a standard VSCode extension, bundled with `esbuild`. Development is done through the main "Run and Debug" workflow.
