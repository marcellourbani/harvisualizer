import * as vscode from "vscode"
import { z } from "zod"
import { promises as fs } from "fs"
import { HarEntry, HarEntrySchema } from "har-parser"
import { HarRecorderAPI, HarRecorderHandle, ExtHarEntry } from "./api-types"

// Re-export public API types
export { HarRecorderAPI, HarRecorderHandle, ExtHarEntry } from "./api-types"

/**
 * Registration information for a registered extension
 */
interface Registration {
  extensionId: string
  outputChannel: vscode.OutputChannel
  calls: HarEntry[]
  storageFileUri: vscode.Uri
}

/**
 * Implementation of the HAR recorder API
 */
export class HarRecorder implements HarRecorderAPI {
  private registrations = new Map<string, Registration>()

  constructor(private context: vscode.ExtensionContext) {}

  /**
   * Get the JSONC file URI for a given extension ID
   */
  private getStorageFileUri(extensionId: string): vscode.Uri {
    // Use workspace storage if available, fallback to global storage
    const storageUri = this.context.storageUri || this.context.globalStorageUri
    if (!storageUri) {
      throw new Error("Storage URI not available")
    }
    return vscode.Uri.joinPath(
      storageUri,
      `har-recordings-${extensionId}.jsonl`,
    )
  }

  /**
   * Initialize JSONL storage file for a registration
   */
  private async initializeStorageFile(fileUri: vscode.Uri): Promise<void> {
    try {
      // Check if file exists
      await vscode.workspace.fs.stat(fileUri)
    } catch {
      // File doesn't exist, create empty JSONL file
      const initialContent = new TextEncoder().encode("")
      await vscode.workspace.fs.writeFile(fileUri, initialContent)
    }
  }

  register(extensionId: string): HarRecorderHandle {
    if (!extensionId || extensionId.trim() === "") {
      throw new Error("Extension ID must be a non-empty string")
    }

    if (this.registrations.has(extensionId)) {
      throw new Error(`Extension "${extensionId}" is already registered`)
    }

    // Create output channel for this extension
    const outputChannel = vscode.window.createOutputChannel(
      `harvisualizer-${extensionId}`,
    )

    // Get storage file URI
    const storageFileUri = this.getStorageFileUri(extensionId)

    // Initialize storage file asynchronously
    this.initializeStorageFile(storageFileUri).catch((err) => {
      console.error(
        `Failed to initialize storage file for ${extensionId}:`,
        err,
      )
    })

    // Initialize registration
    const registration: Registration = {
      extensionId,
      outputChannel,
      calls: [],
      storageFileUri,
    }

    this.registrations.set(extensionId, registration)

    // Create and return handle
    const handle: HarRecorderHandle = {
      sendCall: (entry: ExtHarEntry) => {
        // Cast ExtHarEntry to HarEntry for internal processing
        this.handleSendCall(extensionId, entry)
      },
      dispose: () => {
        this.unregister(extensionId)
      },
    }

    return handle
  }

  private handleSendCall(extensionId: string, entry: HarEntry): void {
    const registration = this.registrations.get(extensionId)
    if (!registration) {
      throw new Error(`Extension "${extensionId}" is not registered`)
    }

    // Validate entry has required fields
    if (!entry.request || !entry.response) {
      throw new Error("HAR entry must have request and response fields")
    }

    // Store the call
    registration.calls.push(entry)

    // Log to output channel
    const timestamp = new Date(entry.startedDateTime).toISOString()
    const method = entry.request.method
    const url = entry.request.url
    const status = entry.response.status
    const callIndex = registration.calls.length - 1

    registration.outputChannel.appendLine(
      `[${timestamp}] ${method} ${url} - ${status} (call:${callIndex})`,
    )

    // Persist to JSONC file asynchronously
    this.appendToStorageFile(
      registration.storageFileUri,
      entry,
      callIndex,
    ).catch((err) => {
      console.error(
        `Failed to append call to storage file for ${extensionId}:`,
        err,
      )
    })
  }

  /**
   * Check if a URI can be accessed with Node.js fs APIs
   */
  private canUseNodeFs(uri: vscode.Uri): boolean {
    return uri.scheme === "file"
  }

  /**
   * Append a HAR entry to the JSONL storage file
   * Each line in the file is a separate JSON document containing a HarEntry
   * Note: This is a basic implementation. The harvisualizer-btj bead will enhance this
   * with proper file integrity, atomic writes, and metadata handling.
   */
  private async appendToStorageFile(
    fileUri: vscode.Uri,
    entry: HarEntry,
    callIndex: number,
  ): Promise<void> {
    try {
      // Validate entry with Zod before appending
      const validatedEntry = HarEntrySchema.parse(entry)

      // Serialize entry as a single line
      const newLine = JSON.stringify(validatedEntry) + "\n"

      if (this.canUseNodeFs(fileUri)) {
        // Use Node.js fs API for efficient append
        await fs.appendFile(fileUri.fsPath, newLine, "utf8")
        return
      }

      // Fallback to VS Code API (for non-file schemes like virtual filesystems)
      const content = new TextEncoder().encode(newLine)
      const existingContent = await vscode.workspace.fs.readFile(fileUri)
      const combined = new Uint8Array(existingContent.length + content.length)
      combined.set(existingContent)
      combined.set(content, existingContent.length)

      await vscode.workspace.fs.writeFile(fileUri, combined)
    } catch (error) {
      console.error("Error appending to storage file:", error)
      throw error
    }
  }

  private unregister(extensionId: string): void {
    const registration = this.registrations.get(extensionId)
    if (registration) {
      registration.outputChannel.dispose()
      this.registrations.delete(extensionId)
    }
  }

  /**
   * Get all calls for a specific extension (for testing/debugging)
   */
  getCalls(extensionId: string): HarEntry[] {
    const registration = this.registrations.get(extensionId)
    return registration ? [...registration.calls] : []
  }

  /**
   * Clean up all registrations
   */
  dispose(): void {
    for (const registration of this.registrations.values()) {
      registration.outputChannel.dispose()
    }
    this.registrations.clear()
  }
}
