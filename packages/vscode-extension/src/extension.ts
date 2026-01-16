import * as vscode from 'vscode';
import { HarViewerEditorProvider } from './harViewerEditorProvider';
import { HarRecorder, HarRecorderAPI } from './api';
import { RecordingManager } from './recordingManager';

let recordingManager: RecordingManager;
let harRecorder: HarRecorder;

export function activate(context: vscode.ExtensionContext): HarRecorderAPI {
  console.log('HAR Visualizer extension is active!');

  // Initialize recording manager
  recordingManager = new RecordingManager(context);
  recordingManager.initialize().catch(err => {
    console.error('Failed to initialize RecordingManager:', err);
  });

  // Register custom editor
  context.subscriptions.push(
    HarViewerEditorProvider.register(context)
  );

  // Create and register HAR recorder API
  harRecorder = new HarRecorder(context);
  context.subscriptions.push({
    dispose: () => harRecorder.dispose()
  });

  // Return API for other extensions to use
  return harRecorder;
}

export function deactivate() {
  if (harRecorder) {
    harRecorder.dispose();
  }
}

/**
 * Get the recording manager instance for use by other modules
 */
export function getRecordingManager(): RecordingManager {
  return recordingManager;
}

// Re-export types and classes for external use
export { RecordingManager, RecordedCall, RecordingFile } from './recordingManager';
