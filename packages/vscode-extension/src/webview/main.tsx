import React from "react"
import ReactDOM from "react-dom/client"
import HarViewer from "har-viewer"
import "har-viewer/dist/har-viewer.css"
import { VSCodeCommunicationProvider } from "../communication/VSCodeCommunicationProvider"

declare global {
  interface Window {
    acquireVsCodeApi: () => any
  }
}

// Get the VS Code API for communication
const vscode = window.acquireVsCodeApi()

// Create an instance of the communication provider
const communicationProvider = {
  postMessage: (message: any) => {
    vscode.postMessage(message)
  },
  onMessage: (callback: (message: any) => void) => {
    window.addEventListener("message", (event) => {
      callback(event.data)
    })
    // Return an unsubscribe function
    return () => {
      window.removeEventListener("message", (event) => {
        callback(event.data)
      })
    }
  },
}

// Render the HarViewer component
const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement)
root.render(
  <React.StrictMode>
    <HarViewer communicationProvider={communicationProvider} />
  </React.StrictMode>
)
