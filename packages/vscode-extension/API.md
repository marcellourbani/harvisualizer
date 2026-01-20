# HAR Visualizer Extension API

This document describes the public API provided by the HAR Visualizer extension for recording HAR calls from other VS Code extensions.

## Overview

The HAR Visualizer extension provides a public API that allows other VS Code extensions to send HAR (HTTP Archive) formatted call data for visualization and analysis.

## Installation

Add the HAR Visualizer extension as a dependency in your extension's `package.json`:

```json
{
  "extensionDependencies": [
    "murbani.harvisualizer-vscode-extension"
  ]
}
```

## Usage

### 1. Get the API

First, obtain the API from the HAR Visualizer extension:

```typescript
import * as vscode from 'vscode';
import { HarRecorderAPI, ExtHarEntry } from 'harvisualizer-vscode-extension';

const harvisualizerExt = vscode.extensions.getExtension('murbani.harvisualizer-vscode-extension');
if (!harvisualizerExt) {
  throw new Error('HAR Visualizer extension not found');
}

const api: HarRecorderAPI = harvisualizerExt.exports;
```

### 2. Register Your Extension

Register your extension with a unique identifier:

```typescript
const handle = api.register('my-extension-id');
```

The extension ID should be unique to your extension. It will be used to:
- Create an output channel named `harvisualizer-[your-extension-id]`
- Organize recorded calls in a dedicated JSONL file (one JSON entry per line)

**Note**: Registration will throw an error if:
- The extension ID is empty or invalid
- Your extension is already registered

### 3. Send HAR Calls

Once registered, you can send HAR-formatted call entries:

```typescript
const harEntry: ExtHarEntry = {
  startedDateTime: new Date().toISOString(),
  time: 150, // Total request time in milliseconds
  request: {
    method: 'GET',
    url: 'https://api.example.com/users',
    httpVersion: 'HTTP/1.1',
    headers: [
      { name: 'Content-Type', value: 'application/json' },
      { name: 'Authorization', value: 'Bearer token' }
    ],
    queryString: [
      { name: 'page', value: '1' },
      { name: 'limit', value: '10' }
    ],
    cookies: [],
    headersSize: 200,
    bodySize: 0
  },
  response: {
    status: 200,
    statusText: 'OK',
    httpVersion: 'HTTP/1.1',
    headers: [
      { name: 'Content-Type', value: 'application/json' }
    ],
    cookies: [],
    content: {
      size: 1024,
      mimeType: 'application/json',
      text: '{"users": [...]}'
    },
    redirectURL: '',
    headersSize: 150,
    bodySize: 1024
  },
  cache: {}, // Can be any cache data structure
  timings: {
    blocked: 0,
    dns: 10,
    connect: 20,
    send: 5,
    wait: 100,
    receive: 15
  }
};

handle.sendCall(harEntry);
```

### 4. Clean Up

When your extension is deactivated, dispose of the registration:

```typescript
export function deactivate() {
  handle.dispose();
}
```

## Complete Example

```typescript
import * as vscode from 'vscode';
import { HarRecorderAPI, ExtHarEntry, HarRecorderHandle } from 'harvisualizer-vscode-extension';

let harRecorderHandle: HarRecorderHandle | undefined;

export function activate(context: vscode.ExtensionContext) {
  // Get HAR Visualizer API
  const harvisualizerExt = vscode.extensions.getExtension('murbani.harvisualizer-vscode-extension');
  if (!harvisualizerExt) {
    console.warn('HAR Visualizer extension not found');
    return;
  }

  const api: HarRecorderAPI = harvisualizerExt.exports;

  // Register this extension
  harRecorderHandle = api.register('my-http-client');

  // Example: Send a HAR call when making an HTTP request
  context.subscriptions.push(
    vscode.commands.registerCommand('myExtension.makeRequest', async () => {
      const startTime = Date.now();

      // Make your HTTP request here
      const response = await fetch('https://api.example.com/data');
      const endTime = Date.now();

      // Send to HAR Visualizer
      harRecorderHandle?.sendCall({
        startedDateTime: new Date(startTime).toISOString(),
        time: endTime - startTime,
        request: {
          method: 'GET',
          url: 'https://api.example.com/data',
          httpVersion: 'HTTP/1.1',
          headers: [],
          queryString: [],
          cookies: [],
          headersSize: 0,
          bodySize: 0
        },
        response: {
          status: response.status,
          statusText: response.statusText,
          httpVersion: 'HTTP/1.1',
          headers: [],
          cookies: [],
          content: {
            size: 0,
            mimeType: response.headers.get('content-type') || ''
          },
          redirectURL: '',
          headersSize: 0,
          bodySize: 0
        },
        cache: {},
        timings: {
          send: 0,
          wait: endTime - startTime,
          receive: 0
        }
      });
    })
  );
}

export function deactivate() {
  harRecorderHandle?.dispose();
}
```

## API Reference

### `HarRecorderAPI`

The main API interface exposed by the HAR Visualizer extension.

#### Methods

##### `register(extensionId: string): HarRecorderHandle`

Register your extension to send HAR calls.

- **Parameters:**
  - `extensionId` (string): Unique identifier for your extension
- **Returns:** `HarRecorderHandle` - Handle for sending calls and cleanup
- **Throws:** Error if extensionId is empty or already registered

### `HarRecorderHandle`

Handle returned from registration.

#### Methods

##### `sendCall(entry: ExtHarEntry): void`

Send a HAR call entry to be recorded.

- **Parameters:**
  - `entry` (ExtHarEntry): HAR-formatted call data
- **Throws:** Error if the entry is invalid or missing required fields

##### `dispose(): void`

Dispose of the registration and clean up resources (output channel, etc.).

### `ExtHarEntry`

Type definition for HAR entry data following the HAR 1.2 specification. This is a plain TypeScript interface without external dependencies, designed to be used in the public API.

**Key fields:**
- All cookies support `sameSite` attribute
- `cache` field is required (can be any type)
- `postData` in request can be any type
- Optional `_resourceType` field for resource classification

See [HAR 1.2 Spec](http://www.softwareishard.com/blog/har-12-spec/) for complete field definitions.

## Features

When you send HAR calls using this API:

1. **Output Channel**: Each call is logged to a dedicated output channel named `harvisualizer-[your-extension-id]`
2. **JSONL Storage**: Calls are persisted to a JSONL file (one JSON entry per line) in workspace storage. For file:// URIs, Node.js fs append mode is used for efficient writes.
3. **Validation**: Incoming entries are validated with Zod schemas before storage
4. **Visualization**: Users can view and analyze the recorded calls using the HAR Visualizer interface

## Notes

- The HAR entry format follows the [HAR 1.2 specification](http://www.softwareishard.com/blog/har-12-spec/)
- The public API uses `ExtHarEntry` (a plain TypeScript interface) to avoid external dependencies
- Entries are validated with Zod schemas from the har-parser package before storage
- Multiple extensions can register simultaneously with different extension IDs
- Each registration gets its own isolated output channel and JSONL storage file
- For file:// URIs, efficient Node.js fs.appendFile is used; for virtual filesystems, VS Code's workspace.fs API is used
