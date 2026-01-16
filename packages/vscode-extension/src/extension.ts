import * as vscode from 'vscode';
import { HarViewerEditorProvider } from './harViewerEditorProvider';
import { HarRecorder, HarRecorderAPI } from './api';
import { RecordingManager } from './recordingManager';

let recordingManager: RecordingManager;
let harRecorder: HarRecorder;

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Format date age in human-readable format
 */
function formatAge(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days}d ${hours}h ago`;
  if (hours > 0) return `${hours}h ago`;
  return 'Just now';
}

/**
 * Get retention period from settings
 */
function getRetentionPeriod(): number {
  const config = vscode.workspace.getConfiguration('harvisualizer');
  return config.get<number>('recordingRetentionDays', 7);
}

/**
 * Command: Manage recording files with QuickPick UI
 */
async function manageRecordingsCommand(): Promise<void> {
  const files = await recordingManager.listRecordingFiles();

  if (files.length === 0) {
    vscode.window.showInformationMessage('No recording files found.');
    return;
  }

  const items = files.map(file => ({
    label: file.extensionId,
    description: `${formatFileSize(file.size)} • ${file.callCount} calls • Modified ${formatAge(file.modified)}`,
    detail: file.filePath.fsPath,
    file
  }));

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: 'Select a recording file to delete',
    canPickMany: true
  });

  if (!selected || selected.length === 0) {
    return;
  }

  const confirm = await vscode.window.showWarningMessage(
    `Delete ${selected.length} recording file(s)?`,
    { modal: true },
    'Delete'
  );

  if (confirm === 'Delete') {
    for (const item of selected) {
      await recordingManager.deleteRecordingFile(item.file.extensionId);
    }
    vscode.window.showInformationMessage(`Deleted ${selected.length} recording file(s).`);
  }
}

/**
 * Command: Delete expired recording files
 */
async function cleanupExpiredRecordingsCommand(): Promise<void> {
  const retentionDays = getRetentionPeriod();
  const expired = await recordingManager.getExpiredRecordingFiles(retentionDays);

  if (expired.length === 0) {
    vscode.window.showInformationMessage(`No expired recording files found (retention: ${retentionDays} days).`);
    return;
  }

  const confirm = await vscode.window.showWarningMessage(
    `Delete ${expired.length} expired recording file(s)? (older than ${retentionDays} days)`,
    { modal: true },
    'Delete'
  );

  if (confirm === 'Delete') {
    const deleted = await recordingManager.deleteExpiredRecordingFiles(retentionDays);
    vscode.window.showInformationMessage(`Deleted ${deleted.length} expired recording file(s).`);
  }
}

/**
 * Perform automatic cleanup on activation (silent)
 */
async function performAutomaticCleanup(): Promise<void> {
  const retentionDays = getRetentionPeriod();
  const deleted = await recordingManager.deleteExpiredRecordingFiles(retentionDays);

  if (deleted.length > 0) {
    console.log(`Automatically deleted ${deleted.length} expired recording file(s).`);
  }
}

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

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('harvisualizer.manageRecordings', async () => {
      await manageRecordingsCommand();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('harvisualizer.cleanupExpiredRecordings', async () => {
      await cleanupExpiredRecordingsCommand();
    })
  );

  // Perform automatic cleanup on activation
  performAutomaticCleanup().catch(err => {
    console.error('Failed to perform automatic cleanup:', err);
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
