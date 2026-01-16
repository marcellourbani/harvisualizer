import { parseJsonlStream } from "../src/parser"
import { HarEntry, HarEntrySchema } from "../src/zod-schema"
import { Readable } from "stream"

// Helper function to create a valid mock HarEntry
const createMockHarEntry = (overrides?: Partial<HarEntry>): HarEntry => {
  return {
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
    ...overrides,
  }
}

describe("parseJsonlStream", () => {
  it("should emit validated HarEntry objects for a valid JSONL stream", (done) => {
    const mockEntry1 = createMockHarEntry({
      request: {
        ...createMockHarEntry().request,
        url: "http://example.com/jsonl1",
      },
    })
    const mockEntry2 = createMockHarEntry({
      request: {
        ...createMockHarEntry().request,
        url: "http://example.com/jsonl2",
      },
    })

    // Create JSONL content - each line is a HAR-shaped structure
    const line1 = JSON.stringify({
      log: {
        version: "1.2",
        creator: { name: "Test Creator", version: "1.0" },
        entries: [mockEntry1],
      },
    })
    const line2 = JSON.stringify({
      log: {
        version: "1.2",
        creator: { name: "Test Creator", version: "1.0" },
        entries: [mockEntry2],
      },
    })

    const jsonlContent = `${line1}\n${line2}`
    const jsonlStream = Readable.from(jsonlContent)
    const parsedEntries: HarEntry[] = []

    const stream = parseJsonlStream(jsonlStream)

    stream.on("data", (entry: HarEntry) => {
      parsedEntries.push(entry)
    })

    stream.on("end", () => {
      expect(parsedEntries.length).toBe(2)
      expect(parsedEntries[0]).toEqual(mockEntry1)
      expect(parsedEntries[1]).toEqual(mockEntry2)
      done()
    })

    stream.on("error", (err) => {
      done(err)
    })
  })

  it("should handle multiple entries per line", (done) => {
    const mockEntry1 = createMockHarEntry({
      request: {
        ...createMockHarEntry().request,
        url: "http://example.com/multi1",
      },
    })
    const mockEntry2 = createMockHarEntry({
      request: {
        ...createMockHarEntry().request,
        url: "http://example.com/multi2",
      },
    })
    const mockEntry3 = createMockHarEntry({
      request: {
        ...createMockHarEntry().request,
        url: "http://example.com/multi3",
      },
    })

    // One line with two entries
    const line1 = JSON.stringify({
      log: {
        version: "1.2",
        creator: { name: "Test Creator", version: "1.0" },
        entries: [mockEntry1, mockEntry2],
      },
    })
    // Another line with one entry
    const line2 = JSON.stringify({
      log: {
        version: "1.2",
        creator: { name: "Test Creator", version: "1.0" },
        entries: [mockEntry3],
      },
    })

    const jsonlContent = `${line1}\n${line2}`
    const jsonlStream = Readable.from(jsonlContent)
    const parsedEntries: HarEntry[] = []

    const stream = parseJsonlStream(jsonlStream)

    stream.on("data", (entry: HarEntry) => {
      parsedEntries.push(entry)
    })

    stream.on("end", () => {
      expect(parsedEntries.length).toBe(3)
      expect(parsedEntries[0]).toEqual(mockEntry1)
      expect(parsedEntries[1]).toEqual(mockEntry2)
      expect(parsedEntries[2]).toEqual(mockEntry3)
      done()
    })

    stream.on("error", (err) => {
      done(err)
    })
  })

  it("should skip empty lines", (done) => {
    const mockEntry1 = createMockHarEntry()

    const line1 = JSON.stringify({
      log: {
        version: "1.2",
        creator: { name: "Test Creator", version: "1.0" },
        entries: [mockEntry1],
      },
    })

    const jsonlContent = `${line1}\n\n\n${line1}\n`
    const jsonlStream = Readable.from(jsonlContent)
    const parsedEntries: HarEntry[] = []

    const stream = parseJsonlStream(jsonlStream)

    stream.on("data", (entry: HarEntry) => {
      parsedEntries.push(entry)
    })

    stream.on("end", () => {
      expect(parsedEntries.length).toBe(2)
      done()
    })

    stream.on("error", (err) => {
      done(err)
    })
  })

  it("should skip malformed lines when skipMalformed is true (default)", (done) => {
    const mockEntry1 = createMockHarEntry({
      request: {
        ...createMockHarEntry().request,
        url: "http://example.com/valid1",
      },
    })
    const mockEntry2 = createMockHarEntry({
      request: {
        ...createMockHarEntry().request,
        url: "http://example.com/valid2",
      },
    })

    const validLine1 = JSON.stringify({
      log: {
        version: "1.2",
        creator: { name: "Test Creator", version: "1.0" },
        entries: [mockEntry1],
      },
    })
    const invalidLine = `{ "invalid": "json" }`
    const validLine2 = JSON.stringify({
      log: {
        version: "1.2",
        creator: { name: "Test Creator", version: "1.0" },
        entries: [mockEntry2],
      },
    })

    const jsonlContent = `${validLine1}\n${invalidLine}\n${validLine2}`
    const jsonlStream = Readable.from(jsonlContent)
    const parsedEntries: HarEntry[] = []

    const stream = parseJsonlStream(jsonlStream, {
      logErrors: false,
      skipMalformed: true,
    })

    stream.on("data", (entry: HarEntry) => {
      parsedEntries.push(entry)
    })

    stream.on("end", () => {
      expect(parsedEntries.length).toBe(2)
      expect(parsedEntries[0]).toEqual(mockEntry1)
      expect(parsedEntries[1]).toEqual(mockEntry2)
      done()
    })

    stream.on("error", (err) => {
      done(err)
    })
  })

  it("should emit error for malformed line when skipMalformed is false", (done) => {
    const mockEntry1 = createMockHarEntry()

    const validLine = JSON.stringify({
      log: {
        version: "1.2",
        creator: { name: "Test Creator", version: "1.0" },
        entries: [mockEntry1],
      },
    })
    const invalidLine = `{ "invalid": "json" }`

    const jsonlContent = `${validLine}\n${invalidLine}`
    const jsonlStream = Readable.from(jsonlContent)
    const parsedEntries: HarEntry[] = []

    const stream = parseJsonlStream(jsonlStream, {
      logErrors: false,
      skipMalformed: false,
    })

    stream.on("data", (entry: HarEntry) => {
      parsedEntries.push(entry)
    })

    stream.on("error", (err: Error) => {
      expect(err).toBeInstanceOf(Error)
      expect(err.message).toContain("Invalid JSON or HAR structure on line 2")
      expect(parsedEntries.length).toBe(1)
      done()
    })

    stream.on("end", () => {
      done(
        new Error(
          "Stream should have emitted an error, but it ended successfully."
        )
      )
    })
  })

  it("should emit error for entry validation failure when skipMalformed is false", (done) => {
    const validEntry = createMockHarEntry()
    const invalidEntry = {
      ...createMockHarEntry(),
      request: {
        ...createMockHarEntry().request,
        url: "not-a-valid-url",
      },
    }

    const line1 = JSON.stringify({
      log: {
        version: "1.2",
        creator: { name: "Test Creator", version: "1.0" },
        entries: [validEntry],
      },
    })
    const line2 = JSON.stringify({
      log: {
        version: "1.2",
        creator: { name: "Test Creator", version: "1.0" },
        entries: [invalidEntry],
      },
    })

    const jsonlContent = `${line1}\n${line2}`
    const jsonlStream = Readable.from(jsonlContent)
    const parsedEntries: HarEntry[] = []

    const stream = parseJsonlStream(jsonlStream, {
      logErrors: false,
      skipMalformed: false,
    })

    stream.on("data", (entry: HarEntry) => {
      parsedEntries.push(entry)
    })

    stream.on("error", (err: Error) => {
      expect(err).toBeInstanceOf(Error)
      expect(err.message).toContain("Invalid JSON or HAR structure on line 2")
      expect(parsedEntries.length).toBe(1)
      done()
    })

    stream.on("end", () => {
      done(
        new Error(
          "Stream should have emitted an error, but it ended successfully."
        )
      )
    })
  })

  it("should skip entry validation failures when skipMalformed is true", (done) => {
    const validEntry = createMockHarEntry({
      request: {
        ...createMockHarEntry().request,
        url: "http://example.com/valid",
      },
    })
    const invalidEntry = {
      ...createMockHarEntry(),
      request: {
        ...createMockHarEntry().request,
        url: "not-a-valid-url",
      },
    }
    const validEntry2 = createMockHarEntry({
      request: {
        ...createMockHarEntry().request,
        url: "http://example.com/valid2",
      },
    })

    const line1 = JSON.stringify({
      log: {
        version: "1.2",
        creator: { name: "Test Creator", version: "1.0" },
        entries: [validEntry],
      },
    })
    const line2 = JSON.stringify({
      log: {
        version: "1.2",
        creator: { name: "Test Creator", version: "1.0" },
        entries: [invalidEntry],
      },
    })
    const line3 = JSON.stringify({
      log: {
        version: "1.2",
        creator: { name: "Test Creator", version: "1.0" },
        entries: [validEntry2],
      },
    })

    const jsonlContent = `${line1}\n${line2}\n${line3}`
    const jsonlStream = Readable.from(jsonlContent)
    const parsedEntries: HarEntry[] = []

    const stream = parseJsonlStream(jsonlStream, {
      logErrors: false,
      skipMalformed: true,
    })

    stream.on("data", (entry: HarEntry) => {
      parsedEntries.push(entry)
    })

    stream.on("end", () => {
      expect(parsedEntries.length).toBe(2)
      expect(parsedEntries[0]).toEqual(validEntry)
      expect(parsedEntries[1]).toEqual(validEntry2)
      done()
    })

    stream.on("error", (err) => {
      done(err)
    })
  })
})
