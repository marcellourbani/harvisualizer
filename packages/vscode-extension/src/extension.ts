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

  // Register command to open a specific call from output channel
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'harvisualizer.openCall',
      async (fileUri: vscode.Uri, callIndex: number) => {
        try {
          // Create a URI with a fragment to indicate the call index
          // The fragment will be picked up by the custom editor
          const uriWithFragment = fileUri.with({ fragment: `call:${callIndex}` });

          // Open the JSONC file with the custom editor
          await vscode.commands.executeCommand('vscode.openWith', uriWithFragment, 'harvisualizer.harViewer');

          console.log(`Opened HAR file ${fileUri.toString()} for call index ${callIndex}`);
        } catch (error) {
          vscode.window.showErrorMessage(`Failed to open HAR call: ${error}`);
        }
      }
    )
  );

  // Return API for other extensions to use
  return harRecorder;
}

export function deactivate() {
  if (harRecorder) {
    harRecorder.dispose();
  }
}