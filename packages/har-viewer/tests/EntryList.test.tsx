import { render, screen, fireEvent } from "@testing-library/react"
import EntryList from "../src/components/EntryList"
import React from "react"
import { HarEntry } from "har-parser"
import "@testing-library/jest-dom"
import { vi } from "vitest"
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
  };

  // Apply other top-level overrides, then set the merged request and id
  const finalEntry: HarEntry & { id: string } = {
    ...baseEntry,
    ...overrides, // This will apply all top-level overrides first
    request: mergedRequest, // Then specifically overwrite 'request' with the deeply merged one
    id: overrides?.id || "default-id", // Ensure 'id' is always present and correctly typed
  };

  return finalEntry;
}

describe("EntryList", () => {
const baseMockEntry = createFullMockHarEntry();

  const mockEntries = [
    createFullMockHarEntry({
      id: "1",
      request: {
        ...baseMockEntry.request,
        method: "GET",
        url: "http://example.com/data1",
      },
    }),
    createFullMockHarEntry({
      id: "2",
      request: {
        ...baseMockEntry.request,
        method: "POST",
        url: "http://example.com/data2",
      },
      response: { ...baseMockEntry.response, status: 201 },
    }),
  ]

  it("renders a list of entries", () => {
    render(<EntryList entries={mockEntries} onSelectEntry={() => {}} />)

    expect(screen.getByText("GET")).toBeInTheDocument()
    expect(screen.getByText("http://example.com/data1")).toBeInTheDocument()
    expect(screen.getByText("200")).toBeInTheDocument() // Still only one '200'

    expect(screen.getByText("POST")).toBeInTheDocument()
    expect(screen.getByText("http://example.com/data2")).toBeInTheDocument()
    expect(screen.getByText("201")).toBeInTheDocument() // Now expecting '201' for the second entry
  })

  it("calls onSelectEntry when an item is clicked", () => {
    const handleSelectEntry = vi.fn()
    render(
      <EntryList entries={mockEntries} onSelectEntry={handleSelectEntry} />
    )

    fireEvent.click(screen.getByText("http://example.com/data1"))
    expect(handleSelectEntry).toHaveBeenCalledTimes(1)
    expect(handleSelectEntry).toHaveBeenCalledWith("1")

    fireEvent.click(screen.getByText("http://example.com/data2"))
    expect(handleSelectEntry).toHaveBeenCalledTimes(2)
    expect(handleSelectEntry).toHaveBeenCalledWith("2")
  })

  it("renders no entries when the list is empty", () => {
    render(<EntryList entries={[]} onSelectEntry={() => {}} />)
    expect(screen.queryByText("GET")).not.toBeInTheDocument()
    expect(screen.queryByText("POST")).not.toBeInTheDocument()
  })
})
