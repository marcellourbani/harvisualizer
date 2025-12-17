

import { HarEntry } from 'har-parser';

export interface HarData {
  entries: HarEntry[];
}

export interface Theme {
  kind: 'light' | 'dark';
}

export interface CommunicationProvider {
  /**
   * Posts a message to the host environment.
   * @param message The message to send to the host.
   */
  postMessage(message: { command: string; [key: string]: any }): void;

  /**
   * Registers a callback to be invoked when data is received from the host.
   * @param callback The function to call with the received data.
   * @returns A function to unsubscribe the callback.
   */
  onMessage(callback: (message: { command: 'loadData' | 'updateData' | 'themeChanged'; data: HarData | Theme }) => void): () => void;
}
