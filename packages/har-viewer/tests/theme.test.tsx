import { render, screen, waitFor, act } from "@testing-library/react"
import React from "react"
import HarViewer from "../src/HarViewer"
import { CommunicationProvider } from "../src/communication/CommunicationProvider"
import { HarEntry } from "har-parser"
import { vi, expect } from "vitest"
import "@testing-library/jest-dom"
// Helper function to create a valid mock HarEntry (fully compliant with har-parser's HarEntry)
const createFullMockHarEntry = (
  overrides?: Partial<HarEntry> & { id?: string }
): HarEntry & { id: string } => {
  const baseEntry: HarEntry = {
    startedDateTime: new Date().toISOString(),
    time: 100,
    request: {
      method: "GET",
      url: "http://example.com/data",
      httpVersion: "HTTP/1.1",
      headers: [],
      queryString: [],
      cookies: [],
      headersSize: 100,
      bodySize: 0,
    },
    response: {
      status: 200,
      statusText: "OK",
      httpVersion: "HTTP/1.1",
      headers: [],
      cookies: [],
      content: {
        size: 0,
        mimeType: "text/plain",
        text: '{"key":"value"}',
      },
      redirectURL: "",
      headersSize: 100,
      bodySize: 0,
    },
    cache: {},
    timings: {
      send: 0,
      wait: 50,
      receive: 50,
    },
  }

  // Deep merge for the request object
  const mergedRequest = {
    ...baseEntry.request,
    ...(overrides?.request || {}),
  }

  // Apply other top-level overrides, then set the merged request and id
  const finalEntry: HarEntry & { id: string } = {
    ...baseEntry,
    ...overrides, // This will apply all top-level overrides first
    request: mergedRequest, // Then specifically overwrite 'request' with the deeply merged one
    id: overrides?.id || "default-id", // Ensure 'id' is always present and correctly typed
  }

  return finalEntry
}

describe("HarViewer theme handling", () => {
  let mockCommunicationProvider: CommunicationProvider
  let onMessageCallback: (message: any) => void = () => {}

  beforeEach(() => {
    mockCommunicationProvider = {
      postMessage: vi.fn(),
      onMessage: vi.fn((callback) => {
        onMessageCallback = callback
        // Simulate sending initial data after a delay to fulfill HarViewer's expectation
        setTimeout(() => {
          callback({
            command: "loadData",
            data: {
              entries: [
                createFullMockHarEntry({
                  id: "1",
                  request: {
                    ...createFullMockHarEntry().request,
                    url: "http://example.com/mock1",
                    method: "GET",
                  },
                  response: {
                    ...createFullMockHarEntry().response,
                    status: 200,
                  },
                }),
                createFullMockHarEntry({
                  id: "2",
                  request: {
                    ...createFullMockHarEntry().request,
                    url: "http://example.com/mock2",
                    method: "POST",
                  },
                  response: {
                    ...createFullMockHarEntry().response,
                    status: 201,
                  },
                }),
              ],
            },
          })
        }, 100) // Simulate network delay
        return vi.fn() // Return an unsubscribe function
      }),
    }
  })

  it("applies the vscode-light class by default", () => {
    render(<HarViewer communicationProvider={mockCommunicationProvider} />)
    const container = screen
      .getByText("HAR Viewer")
      .closest(".har-viewer-container")
    expect(container).toHaveClass("vscode-light")
  })

  it("applies the vscode-dark class when a dark themeChanged message is received", async () => {
    render(<HarViewer communicationProvider={mockCommunicationProvider} />)
    const container = screen
      .getByText("HAR Viewer")
      .closest(".har-viewer-container")

    // Simulate a theme change message
    act(() => {
      onMessageCallback({ command: "themeChanged", data: { kind: "dark" } })
    })

    await waitFor(() => {
      expect(container).toHaveClass("vscode-dark")
      expect(container).not.toHaveClass("vscode-light")
    })
  })

  it("applies the vscode-light class when a light themeChanged message is received", async () => {
    render(<HarViewer communicationProvider={mockCommunicationProvider} />)
    const container = screen
      .getByText("HAR Viewer")
      .closest(".har-viewer-container")

    // First, change to dark, then to light
    act(() => {
      onMessageCallback({ command: "themeChanged", data: { kind: "dark" } })
    })
    await waitFor(() => expect(container).toHaveClass("vscode-dark"))

    act(() => {
      onMessageCallback({ command: "themeChanged", data: { kind: "light" } })
    })
    await waitFor(() => {
      expect(container).toHaveClass("vscode-light")
      expect(container).not.toHaveClass("vscode-dark")
    })
  })
})
