# `har-viewer`

This package provides a reusable React component library for displaying and interacting with HAR (HTTP Archive) data. It is designed to be decoupled from specific host environments (like VSCode) through a flexible communication interface.

## Features

-   Displays a scrollable list of HAR entries.
-   Allows filtering entries by HTTP method and URL (fuzzy search).
-   Shows detailed request and response information for a selected entry.
-   Supports theme synchronization with the host environment (e.g., VSCode light/dark theme).

## Installation

This package is part of the `harvisualizer` monorepo. It is not intended for standalone use outside of this project.

## Usage

The `HarViewer` component expects a `CommunicationProvider` prop to interact with its host.

```typescript
import React from 'react';
import HarViewer from 'har-viewer';
import { CommunicationProvider } from 'har-viewer/communication'; // Assuming path

// Example of a mock CommunicationProvider for standalone testing
const mockCommunicationProvider = {
  postMessage: (message: any) => console.log('Mock Host received:', message),
  onMessage: (callback: (message: any) => void) => {
    // Simulate sending initial data after a delay
    setTimeout(() => {
      callback({
        command: 'loadData',
        data: {
          entries: [
            { id: '1', method: 'GET', url: 'http://example.com/mock1', status: 200 },
            { id: '2', method: 'POST', url: 'http://example.com/mock2', status: 201 },
          ],
        },
      });
    }, 100);
    return () => {}; // Unsubscribe
  },
};

const App = () => {
  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <HarViewer communicationProvider={mockCommunicationProvider} />
    </div>
  );
};

export default App;
```

## Development

See the root `README.md` for monorepo development instructions.

## Testing

To run tests for this package:

```bash
cd packages/har-viewer
npm test
```
