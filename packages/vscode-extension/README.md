# `harvisualizer-vscode-extension`

This is a Visual Studio Code extension that provides a custom editor for viewing and analyzing HAR (HTTP Archive) files. It integrates the `har-parser` and `har-viewer` packages to offer a seamless experience for developers working with network traffic captures.

## Features

- **Custom Editor**: Open `.har` files directly in VSCode with a dedicated viewer.
- **HAR Entry List**: Displays all HTTP request/response entries in a scrollable list.
- **Filtering**: Filter entries by HTTP method and a fuzzy search on URLs.
- **Detail Pane**: Inspect comprehensive details of selected HAR entries, including request, response, and payloads.
- **Theme Synchronization**: Automatically adapts to your VSCode light/dark theme.

## Installation

This extension is built as part of the `harvisualizer` monorepo.

## Development

1. **Clone the repository**:

    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

2. **Install dependencies**:

    ```bash
    npm install
    ```

3. **Start the development build**:

    ```bash
    npm run dev
    ```

    This command will build all packages in watch mode.

4. **Run the Extension in VSCode**:
    - Open the project in VSCode (`code .`).
    - Go to the "Run and Debug" view (Ctrl+Shift+D).
    - Select the "Run Extension" launch configuration.
    - Press F5 to start a new Extension Development Host window.

5. **Test the Extension**:
    - In the Extension Development Host window, open any `.har` file.
    - The HAR Viewer custom editor should activate and display the file's contents.

## Dependencies

- `har-parser`: For parsing HAR file content.
- `har-viewer`: The React-based UI component for rendering HAR data.

## Testing

To run tests for this package:

```bash
cd packages/vscode-extension
npm test
```
