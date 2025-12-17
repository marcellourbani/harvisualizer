# Communication Interface

This document defines the interface for communication between the UI component (`har-viewer`) and its host environment (e.g., the `vscode-extension`). This interface will be implemented using a dependency injection pattern.

## `CommunicationProvider` Interface

The `har-viewer` package will define and expect a `CommunicationProvider` object to be passed in as a prop. This provider must adhere to the following interface.

```typescript
interface HarEntry {
  // A simplified HAR entry object for the list view
  id: string;
  method: string;
  url: string;
  status: number;
  // ... other fields as needed for display
}

interface HarData {
  entries: HarEntry[];
}

interface Theme {
  kind: 'light' | 'dark';
}

interface CommunicationProvider {
  /**
   * Posts a message to the host environment.
   * @param message The message to send to the host.
   */
  postMessage(message: { command: string; [key: string]: any }): void;

  /**
   * Registers a callback to be invoked when data is received from the host.
   * @param callback The function to call with the received data.
   * @returns A function to unsubscribe the callback.
   */
  onMessage(callback: (message: { command: 'loadData' | 'updateData' | 'themeChanged'; data: HarData | Theme }) => void): () => void;
}
```

## Messages from Extension to Webview

### `loadData`
Sends the initial HAR data to the webview to be rendered.

- **Type**: `command`
- **Payload**:
  ```json
  {
    "command": "loadData",
    "data": {
      "entries": [
        // Array of HAR entries
      ]
    }
  }
  ```

### `updateData`
Sends updated/filtered HAR data to the webview.

- **Type**: `command`
- **Payload**:
  ```json
  {
    "command": "updateData",
    "data": {
      "entries": [
        // Array of filtered HAR entries
      ]
    }
  }
  ```

### `themeChanged`
Notifies the webview that the VSCode theme has changed.

- **Type**: `notification`
- **Payload**:
  ```json
  {
    "command": "themeChanged",
    "data": {
      "kind": "light" // or "dark"
    }
  }
  ```

## Messages from Webview to Extension

### `ready`
Sent by the webview when it has finished loading and is ready to receive data.

- **Type**: `notification`
- **Payload**:
  ```json
  {
    "command": "ready"
  }
  ```

### `filter`
Sent when the user applies a filter in the UI. The extension will process the filter and send back an `updateData` message.

- **Type**: `request`
- **Payload**:
  ```json
  {
    "command": "filter",
    "filters": {
      "method": "GET", // or "POST", "PUT", etc.
      "url": "example.com"
    }
  }
  ```

### `selectEntry`
Sent when the user clicks on an entry in the list. The extension does not need to do anything in response to this message, as the details are already available in the webview. This is for potential future use (e.g., logging).

- **Type**: `notification`
- **Payload**:
  ```json
  {
    "command": "selectEntry",
    "entry": {
      // The selected HAR entry object
    }
  }
  ```