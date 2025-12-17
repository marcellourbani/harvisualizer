import * as vscode from 'vscode';
import { HarViewerEditorProvider } from './harViewerEditorProvider';

export function activate(context: vscode.ExtensionContext) {
  console.log('HAR Visualizer extension is active!');

  context.subscriptions.push(
    HarViewerEditorProvider.register(context)
  );
}

export function deactivate() {}