import * as vscode from 'vscode';
import { HarViewerEditorProvider } from './harViewerEditorProvider';
import { HarRecorder, HarRecorderAPI } from './api';

let harRecorder: HarRecorder;

export function activate(context: vscode.ExtensionContext): HarRecorderAPI {
  console.log('HAR Visualizer extension is active!');

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