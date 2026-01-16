import * as vscode from 'vscode';
import { parseHar, parseJsonlStream, HarEntry } from 'har-parser';
import { VSCodeCommunicationProvider } from './communication/VSCodeCommunicationProvider';
import { Theme, HarData } from 'har-viewer/communication/CommunicationProvider';
import { Readable } from 'stream';


interface WebviewMessage {
  command: 'ready' | 'selectEntry' | 'loadData' | 'updateData' | 'themeChanged';
  data?: HarData | Theme;
  entry?: HarEntry; // Still HarEntry as it's the specific entry selected
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export class HarViewerEditorProvider implements vscode.CustomEditorProvider {
  private readonly _onDidChangeCustomDocument = new vscode.EventEmitter<vscode.CustomDocumentContentChangeEvent<vscode.CustomDocument>>();
  public readonly onDidChangeCustomDocument = this._onDidChangeCustomDocument.event;

  constructor(private readonly context: vscode.ExtensionContext) { }

  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    return vscode.window.registerCustomEditorProvider(
      'harvisualizer.harViewer',
      new HarViewerEditorProvider(context),
      {
        webviewOptions: {
          retainContextWhenHidden: true,
        },
      }
    );
  }

  public async openCustomDocument(
    uri: vscode.Uri,
    context: vscode.CustomDocumentOpenContext,
    _token: vscode.CancellationToken
  ): Promise<vscode.CustomDocument> {
    return { uri, dispose: () => { } };
  }

  public async saveCustomDocument(
    document: vscode.CustomDocument,
    cancellation: vscode.CancellationToken
  ): Promise<void> {
    console.log('saveCustomDocument called for:', document.uri.toString());
    return Promise.resolve();
  }

  public async saveCustomDocumentAs(
    document: vscode.CustomDocument,
    destination: vscode.Uri,
    cancellation: vscode.CancellationToken
  ): Promise<void> {
    console.log('saveCustomDocumentAs called for:', document.uri.toString(), 'to', destination.toString());
    return Promise.resolve();
  }

  public async revertCustomDocument(
    document: vscode.CustomDocument,
    cancellation: vscode.CancellationToken
  ): Promise<void> {
    console.log('revertCustomDocument called for:', document.uri.toString());
    return Promise.resolve();
  }

  public async backupCustomDocument(
    document: vscode.CustomDocument,
    context: vscode.CustomDocumentBackupContext,
    cancellation: vscode.CancellationToken
  ): Promise<vscode.CustomDocumentBackup> {
    console.log('backupCustomDocument called for:', document.uri.toString());
    return {
      id: context.destination.fsPath,
      delete: () => { console.log('backup deleted:', context.destination.fsPath); }
    };
  }

  public async resolveCustomEditor(
    document: vscode.CustomDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    webviewPanel.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, 'out')],
    };

    const communicationProvider = new VSCodeCommunicationProvider(webviewPanel.webview);

    webviewPanel.webview.html = await this.getHtmlForWebview(webviewPanel.webview);

    // Track the number of entries we've already sent to detect incremental updates
    let lastEntryCount = 0;

    const sendHarDataToWebview = async () => {
      const fileExtension = document.uri.fsPath.split('.').pop()?.toLowerCase();

      if (fileExtension === 'jsonl') {
        // Use streaming parser for JSONL files
        const fileContent = await vscode.workspace.fs.readFile(document.uri);
        const stream = Readable.from(Buffer.from(fileContent));
        const entryStream = parseJsonlStream(stream, { logErrors: true, skipMalformed: true });

        const batchSize = 100;
        let batch: HarEntry[] = [];
        let isFirstBatch = true;

        entryStream.on('data', (entry: HarEntry) => {
          batch.push(entry);

          if (batch.length >= batchSize) {
            communicationProvider.postMessage({
              command: isFirstBatch ? 'loadData' : 'updateData',
              data: { entries: batch }
            });
            batch = [];
            isFirstBatch = false;
          }
        });

        entryStream.on('end', () => {
          // Send any remaining entries in the batch
          if (batch.length > 0) {
            communicationProvider.postMessage({
              command: isFirstBatch ? 'loadData' : 'updateData',
              data: { entries: batch }
            });
          }
        });

        entryStream.on('error', (error) => {
          console.error('[HarViewer] Error parsing JSONL file:', error);
          vscode.window.showErrorMessage(`Error parsing JSONL file: ${error.message}`);
        });
      } else {
        // Use regular parser for HAR files
        const harContent = (await vscode.workspace.fs.readFile(document.uri)).toString();
        const entries = await parseHar(harContent);
        communicationProvider.postMessage({
          command: 'loadData',
          data: { entries: entries }
        });
        lastEntryCount = entries.length;
      }
    };

    const checkForNewEntries = async () => {
      try {
        const harContent = (await vscode.workspace.fs.readFile(document.uri)).toString();
        const entries = await parseHar(harContent);

        // If we have new entries, send only the incremental ones
        if (entries.length > lastEntryCount) {
          const newEntries = entries.slice(lastEntryCount);
          communicationProvider.postMessage({
            command: 'updateData',
            data: { entries: newEntries }
          });
          lastEntryCount = entries.length;
        }
      } catch (error) {
        console.error('Error checking for new HAR entries:', error);
      }
    };

    const sendThemeToWebview = () => {
      const themeKind: Theme['kind'] = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark ? 'dark' : 'light';
      communicationProvider.postMessage({
        command: 'themeChanged',
        data: { kind: themeKind }
      });
    };

    sendThemeToWebview();

    // Set up file watcher for live updates
    const fileWatcher = vscode.workspace.createFileSystemWatcher(
      document.uri.fsPath
    );

    fileWatcher.onDidChange(() => {
      console.log('HAR file changed, checking for new entries:', document.uri.toString());
      checkForNewEntries();
    });

    // Clean up watcher when panel is disposed
    webviewPanel.onDidDispose(() => {
      fileWatcher.dispose();
    });

    this.context.subscriptions.push(
      vscode.window.onDidChangeActiveColorTheme(() => {
        sendThemeToWebview();
      }),
      fileWatcher
    );

    communicationProvider.onMessageFromWebview((message: WebviewMessage) => {
      if (message.command === 'ready') {
        console.log('Webview ready, sending initial HAR data and theme.');
        sendHarDataToWebview();
        sendThemeToWebview();
      } else if (message.command === 'selectEntry') {
        console.log('Entry selected:', message.entry);
      }
    });
  }

  private async getHtmlForWebview(webview: vscode.Webview): Promise<string> {
    const webviewUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'out', 'webview.js')
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'out', 'webview.css')
    );
    const nonce = getNonce();

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>HAR Viewer</title>
          <link rel="stylesheet" type="text/css" href="${styleUri}">
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}'; style-src ${webview.cspSource};">
      </head>
      <body>
          <div id="root"></div>
          <script nonce="${nonce}" src="${webviewUri}"></script>
      </body>
      </html>`;
  }
}
