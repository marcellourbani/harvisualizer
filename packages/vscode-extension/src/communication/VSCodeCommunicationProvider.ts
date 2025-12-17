import * as vscode from 'vscode';
import { CommunicationProvider, HarData, Theme } from 'har-viewer/communication/CommunicationProvider';
import { HarEntry } from 'har-parser'; // Import HarEntry directly from har-parser

interface WebviewMessage {
  command: 'ready' | 'selectEntry' | 'loadData' | 'updateData' | 'themeChanged';
  data?: HarData | Theme; // Updated to reflect HarData/Theme as data
  entry?: HarEntry; // Still HarEntry as it's the specific entry selected
}

export class VSCodeCommunicationProvider implements CommunicationProvider {
  private readonly webview: vscode.Webview;
  private hostMessageCallbacks: ((message: { command: 'loadData' | 'updateData' | 'themeChanged'; data: HarData | Theme }) => void)[] = [];
  private webviewMessageCallbacks: ((message: WebviewMessage) => void)[] = []; // Using 'any' for messages from webview initially

  constructor(webview: vscode.Webview) {
    this.webview = webview;
    this.webview.onDidReceiveMessage(message => {
      // Forward messages from the webview to registered callbacks in the extension
      for (const callback of this.webviewMessageCallbacks) {
        callback(message);
      }
    });
  }

  postMessage(message: { command: string; [key: string]: any }): void {
    this.webview.postMessage(message);
  }

  // This is the implementation of CommunicationProvider's onMessage
  onMessage(callback: (message: { command: 'loadData' | 'updateData' | 'themeChanged'; data: HarData | Theme }) => void): () => void {
    this.hostMessageCallbacks.push(callback);
    return () => {
      this.hostMessageCallbacks = this.hostMessageCallbacks.filter(cb => cb !== callback);
    };
  }

  onMessageFromWebview(callback: (message: WebviewMessage) => void): () => void {
    this.webviewMessageCallbacks.push(callback);
    return () => {
      this.webviewMessageCallbacks = this.webviewMessageCallbacks.filter(cb => cb !== callback);
    };
  }
}
