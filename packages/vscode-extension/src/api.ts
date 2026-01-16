import * as vscode from 'vscode';
import { HarEntry } from 'har-parser';

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
 */
export interface HarRecorderAPI {
  /**
   * Register an extension to send HAR calls
   * @param extensionId - Unique identifier for the calling extension
   * @returns Handle for sending calls and disposing
   */
  register(extensionId: string): HarRecorderHandle;
}

/**
 * Registration information for a registered extension
 */
interface Registration {
  extensionId: string;
  outputChannel: vscode.OutputChannel;
  calls: HarEntry[];
  storageFileUri: vscode.Uri;
}

/**
 * Implementation of the HAR recorder API
 */
export class HarRecorder implements HarRecorderAPI {
  private registrations = new Map<string, Registration>();

  constructor(private context: vscode.ExtensionContext) {}

  /**
   * Get the JSONC file URI for a given extension ID
   */
  private getStorageFileUri(extensionId: string): vscode.Uri {
    // Use workspace storage if available, fallback to global storage
    const storageUri = this.context.storageUri || this.context.globalStorageUri;
    if (!storageUri) {
      throw new Error('Storage URI not available');
    }
    return vscode.Uri.joinPath(storageUri, `har-recordings-${extensionId}.jsonc`);
  }

  /**
   * Initialize JSONC storage file for a registration
   */
  private async initializeStorageFile(fileUri: vscode.Uri): Promise<void> {
    try {
      // Check if file exists
      await vscode.workspace.fs.stat(fileUri);
    } catch {
      // File doesn't exist, create it with empty array
      const initialContent = new TextEncoder().encode('[\n  // HAR call recordings\n]\n');
      await vscode.workspace.fs.writeFile(fileUri, initialContent);
    }
  }

  register(extensionId: string): HarRecorderHandle {
    if (!extensionId || extensionId.trim() === '') {
      throw new Error('Extension ID must be a non-empty string');
    }

    if (this.registrations.has(extensionId)) {
      throw new Error(`Extension "${extensionId}" is already registered`);
    }

    // Create output channel for this extension
    const outputChannel = vscode.window.createOutputChannel(
      `harvisualizer-${extensionId}`
    );

    // Get storage file URI
    const storageFileUri = this.getStorageFileUri(extensionId);

    // Initialize storage file asynchronously
    this.initializeStorageFile(storageFileUri).catch(err => {
      console.error(`Failed to initialize storage file for ${extensionId}:`, err);
    });

    // Initialize registration
    const registration: Registration = {
      extensionId,
      outputChannel,
      calls: [],
      storageFileUri,
    };

    this.registrations.set(extensionId, registration);

    // Create and return handle
    const handle: HarRecorderHandle = {
      sendCall: (entry: HarEntry) => {
        this.handleSendCall(extensionId, entry);
      },
      dispose: () => {
        this.unregister(extensionId);
      },
    };

    return handle;
  }

  private handleSendCall(extensionId: string, entry: HarEntry): void {
    const registration = this.registrations.get(extensionId);
    if (!registration) {
      throw new Error(`Extension "${extensionId}" is not registered`);
    }

    // Validate entry has required fields
    if (!entry.request || !entry.response) {
      throw new Error('HAR entry must have request and response fields');
    }

    // Store the call
    registration.calls.push(entry);

    // Log to output channel with clickable file link
    const timestamp = new Date(entry.startedDateTime).toISOString();
    const method = entry.request.method;
    const url = entry.request.url;
    const status = entry.response.status;
    const callIndex = registration.calls.length - 1;

    // Create a clickable link to the JSONC file
    // Format: [timestamp] METHOD url - status (call:index) [file path]
    const filePath = registration.storageFileUri.fsPath;

    registration.outputChannel.appendLine(
      `[${timestamp}] ${method} ${url} - ${status} (call:${callIndex}) ${filePath}`
    );

    // Persist to JSONC file asynchronously
    this.appendToStorageFile(registration.storageFileUri, entry, callIndex).catch(err => {
      console.error(`Failed to append call to storage file for ${extensionId}:`, err);
    });
  }

  /**
   * Append a HAR entry to the JSONC storage file
   * Note: This is a basic implementation. The harvisualizer-btj bead will enhance this
   * with proper file integrity, atomic writes, and metadata handling.
   */
  private async appendToStorageFile(fileUri: vscode.Uri, entry: HarEntry, callIndex: number): Promise<void> {
    try {
      // Read current file content
      const fileContent = await vscode.workspace.fs.readFile(fileUri);
      const contentStr = new TextDecoder().decode(fileContent);

      // Parse as JSON (ignoring comments for now)
      const calls = JSON.parse(contentStr) as HarEntry[];

      // Add new entry
      calls.push(entry);

      // Write back with formatting
      const newContent = JSON.stringify(calls, null, 2);
      const contentWithComment = `[\n  // HAR call recordings\n${newContent.slice(2)}`;
      await vscode.workspace.fs.writeFile(fileUri, new TextEncoder().encode(contentWithComment));
    } catch (error) {
      console.error('Error appending to storage file:', error);
      throw error;
    }
  }

  private unregister(extensionId: string): void {
    const registration = this.registrations.get(extensionId);
    if (registration) {
      registration.outputChannel.dispose();
      this.registrations.delete(extensionId);
    }
  }

  /**
   * Get all calls for a specific extension (for testing/debugging)
   */
  getCalls(extensionId: string): HarEntry[] {
    const registration = this.registrations.get(extensionId);
    return registration ? [...registration.calls] : [];
  }

  /**
   * Clean up all registrations
   */
  dispose(): void {
    for (const registration of this.registrations.values()) {
      registration.outputChannel.dispose();
    }
    this.registrations.clear();
  }
}
