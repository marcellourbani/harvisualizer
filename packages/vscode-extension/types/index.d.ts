/**
 * Type definitions for harvisualizer VS Code extension API
 *
 * External extensions can use these types to interact with the HAR recorder API
 */

import { HarEntry as _HarEntry } from 'har-parser';

/**
 * HAR entry format following the HAR 1.2 specification
 * Re-exported from har-parser for convenience
 */
export type HarEntry = _HarEntry;

/**
 * Handle returned from registration that allows sending HAR calls
 */
export interface HarRecorderHandle {
  /**
   * Send a HAR call entry to be recorded
   * @param entry - HAR-formatted call data
   */
  sendCall(entry: HarEntry): void;

  /**
   * Dispose of this registration and clean up resources
   */
  dispose(): void;
}

/**
 * Public API for HAR recording that other extensions can use
 *
 * Access this API via:
 * ```typescript
 * const ext = vscode.extensions.getExtension('murbani.harvisualizer-vscode-extension');
 * const api: HarRecorderAPI = ext?.exports;
 * ```
 */
export interface HarRecorderAPI {
  /**
   * Register an extension to send HAR calls
   * @param extensionId - Unique identifier for the calling extension
   * @returns Handle for sending calls and disposing
   * @throws Error if extensionId is empty or already registered
   */
  register(extensionId: string): HarRecorderHandle;
}
