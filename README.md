# HAR Visualizer

**Deep dive into your HTTP traces without leaving VSCode.**

This extension provides a specialized viewer for HTTP Archive (`.har`) files, making it easy to analyze network traffic captured from browsers or other tools efficiently.

## Features

- **Native Integration**: Opens `.har` files directly within VSCode using the Custom Editor API.
- **Detailed Inspection**: View headers, content, and timing for requests and responses.
- **Clean Interface**: A modern, React-based UI for navigating complex HTTP traces.

## Usage

1. Open any file with the `.har` extension in VSCode.
2. The editor will automatically switch to the HAR Viewer.
3. Alternatively, right-click a file and choose **Open With...** > **HAR Viewer**.

---

## Project Structure (Monorepo)

For contributors and developers working on this project:

### Packages

- `packages/har-parser`: A library for parsing HAR files.
- `packages/har-viewer`: A React component for viewing HAR data.
- `packages/vscode-extension`: The VSCode extension that integrates the parser and viewer.

### Development

See `specs/001-har-viewer-extension/quickstart.md` for development instructions.
