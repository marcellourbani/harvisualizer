import { render, screen } from "@testing-library/react"
import DetailPane from "../src/components/DetailPane"
import React from "react"
import { HarEntry } from "har-parser"

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

describe("DetailPane", () => {
  const baseMockEntry = createFullMockHarEntry()
  const mockHarEntry = createFullMockHarEntry({
    id: "123",
    request: {
      ...baseMockEntry.request,
      method: "GET",
      url: "http://example.com/api/data",
      postData: {
        mimeType: "application/json",
        text: '{"param":"value"}',
      },
    },
    response: {
      ...baseMockEntry.response,
      status: 200,
      statusText: "OK",
      content: {
        size: 100,
        mimeType: "application/json",
        text: '{"key":"value"}',
      },
    },
  })

  it('renders "Select an entry to view details" if no entry is provided', () => {
    render(<DetailPane entry={null as any} />) // Cast to any because entry can be null
    expect(
      screen.getByText("Select an entry to view details.")
    ).toBeInTheDocument()
  })

  it("renders request and response details when an entry is provided", () => {
    render(<DetailPane entry={mockHarEntry} />)

    expect(screen.getByText("Entry Details (ID: 123)")).toBeInTheDocument()

    // Request Details
    expect(screen.getByText("Request")).toBeInTheDocument()
    expect(screen.getByText(/Method: GET/i)).toBeInTheDocument()
    expect(
      screen.getByText(/URL: http:\/\/example.com\/api\/data/i)
    ).toBeInTheDocument()
    // Use getAllByText for non-unique elements
    const requestHttpVersion = screen.getAllByText(
      /HTTP Version: HTTP\/1\.1/i
    )[0]
    expect(requestHttpVersion).toBeInTheDocument()
    expect(screen.getByText(/Post Data/i)).toBeInTheDocument()
    expect(screen.getByText('{"param":"value"}')).toBeInTheDocument()

    // Response Details
    expect(screen.getByText("Response")).toBeInTheDocument()
    expect(screen.getByText(/Status: 200 OK/i)).toBeInTheDocument()
    // Use getAllByText for non-unique elements
    const responseHttpVersion = screen.getAllByText(
      /HTTP Version: HTTP\/1\.1/i
    )[1]
    expect(responseHttpVersion).toBeInTheDocument()
    expect(screen.getByText(/Content/i)).toBeInTheDocument()
    expect(screen.getByText('{"key":"value"}')).toBeInTheDocument()
    expect(
      screen.getByText(/MIME Type: application\/json/i)
    ).toBeInTheDocument()
  })

  it("renders empty post data section if postData is missing or empty", () => {
    const entryWithoutPostData = createFullMockHarEntry({
      id: "456",
      request: { ...mockHarEntry.request, postData: undefined },
    })
    render(<DetailPane entry={entryWithoutPostData} />)
    expect(screen.queryByText(/Post Data/i)).not.toBeInTheDocument()
  })

  it("renders empty content section if response content is missing or empty", () => {
    const entryWithoutContent = createFullMockHarEntry({
      id: "789",
      response: {
        ...mockHarEntry.response,
        content: { mimeType: "", size: 0 },
      },
    })
    render(<DetailPane entry={entryWithoutContent} />)
    expect(screen.queryByText(/Content/i)).not.toBeInTheDocument()
  })
})
