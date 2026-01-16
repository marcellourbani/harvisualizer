import * as vscode from 'vscode';
import { HarViewerEditorProvider } from './harViewerEditorProvider';
import { RecordingManager } from './recordingManager';

let recordingManager: RecordingManager;

export function activate(context: vscode.ExtensionContext) {
  console.log('HAR Visualizer extension is active!');

  // Initialize recording manager
  recordingManager = new RecordingManager(context);
  recordingManager.initialize().catch(err => {
    console.error('Failed to initialize RecordingManager:', err);
  });

  context.subscriptions.push(
    HarViewerEditorProvider.register(context)
  );
}

export function deactivate() {}

/**
 * Get the recording manager instance for use by other modules
 */
export function getRecordingManager(): RecordingManager {
  return recordingManager;
}

// Re-export types and classes for external use
export { RecordingManager, RecordedCall, RecordingFile } from './recordingManager';