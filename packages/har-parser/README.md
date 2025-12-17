# `har-parser`

This package provides a robust and efficient parser for HAR (HTTP Archive) files. It is designed to extract HTTP request/response entries from HAR files, with a focus on handling large files efficiently through a streaming approach using `stream-json`.

## Features

-   Parses HAR 1.2 specification compliant files.
-   Efficiently extracts `log.entries` using `stream-json`, suitable for large files.
-   Returns an array of parsed HAR entries.

## Installation

This package is part of the `harvisualizer` monorepo. It is not intended for standalone use outside of this project.

## Usage

```typescript
import { parseHar } from 'har-parser';
import * as fs from 'fs';

async function processHarFile(filePath: string) {
  try {
    const harContent = await fs.promises.readFile(filePath, 'utf-8');
    const entries = await parseHar(harContent);
    console.log(`Parsed ${entries.length} entries.`);
    // Further process entries
  } catch (error) {
    console.error('Failed to process HAR file:', error);
  }
}

// Example:
// processHarFile('./path/to/your/file.har');
```

## Development

See the root `README.md` for monorepo development instructions.

## Testing

To run tests for this package:

```bash
cd packages/har-parser
npm test
```
