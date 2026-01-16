/**
 * Public API exports for external extensions
 *
 * To use this API from another extension:
 *
 * ```typescript
 * import * as vscode from 'vscode';
 * import { HarRecorderAPI, HarEntry } from 'harvisualizer-vscode-extension';
 *
 * const harvisualizerExt = vscode.extensions.getExtension('murbani.harvisualizer-vscode-extension');
 * const api: HarRecorderAPI = harvisualizerExt?.exports;
 *
 * // Register your extension
 * const handle = api.register('my-extension-id');
 *
 * // Send HAR calls
 * handle.sendCall({
 *   startedDateTime: new Date().toISOString(),
 *   time: 100,
 *   request: { ... },
 *   response: { ... },
 *   // ... other HAR entry fields
 * });
 *
 * // Clean up when done
 * handle.dispose();
 * ```
 */

export { HarRecorderAPI, HarRecorderHandle } from './api';
export { HarEntry } from 'har-parser';
