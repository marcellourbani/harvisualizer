import { parseHarStream } from "../src/parser"
import { HarEntry, HarEntrySchema } from "../src/zod-schema" // Import HarEntrySchema
import { Readable } from "stream"
import path from "path"
import { promises } from "fs"

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

describe("parseHarStream", () => {
  it("should emit validated HarEntry objects for a valid HAR stream", (done) => {
    const mockEntry1 = createMockHarEntry({
      request: {
        ...createMockHarEntry().request,
        url: "http://example.com/stream1",
      },
    })
    const mockEntry2 = createMockHarEntry({
      request: {
        ...createMockHarEntry().request,
        url: "http://example.com/stream2",
      },
    })

    const harContent = JSON.stringify({
      log: {
        version: "1.2",
        creator: { name: "Test Creator", version: "1.0" },
        entries: [mockEntry1, mockEntry2],
      },
    })

    const harStream = Readable.from(harContent)
    const parsedEntries: HarEntry[] = []

    const stream = parseHarStream(harStream)

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
      done(err) // Fail the test if an error occurs
    })
  })

  it("should emit an error for a HAR stream with an invalid entry (Zod validation failure)", (done) => {
    const validEntry = createMockHarEntry()
    const invalidEntry = {
      ...createMockHarEntry(),
      request: {
        ...createMockHarEntry().request,
        url: "not-a-valid-url", // This will fail Zod validation
      },
    }

    const harContent = JSON.stringify({
      log: {
        version: "1.2",
        creator: { name: "Test Creator", version: "1.0" },
        entries: [validEntry, invalidEntry],
      },
    })

    const harStream = Readable.from(harContent)
    const stream = parseHarStream(harStream, { logErrors: false })
    const parsedEntries: HarEntry[] = []

    stream.on("data", (entry: HarEntry) => {
      parsedEntries.push(entry)
    })

    stream.on("error", (err: Error) => {
      expect(err).toBeInstanceOf(Error)
      expect(err.message).toContain(
        "HAR entry failed Zod validation during streaming."
      )
      expect(parsedEntries.length).toBe(1) // Should have processed the first valid entry
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

  it("should emit an error for a malformed JSON stream", (done) => {
    const malformedJsonStream = Readable.from(
      `{ "log": { "entries": [ { "request": { "url": "invalid" } } }`
    )
    const stream = parseHarStream(malformedJsonStream, { logErrors: false })
    let doneCalled = false

    const safeDone = (err?: Error) => {
      if (!doneCalled) {
        doneCalled = true
        done(err)
      }
    }

    stream.on("data", () => {
      safeDone(new Error("No data should be emitted for malformed JSON."))
    })

    stream.on("error", (err: Error) => {
      expect(err).toBeInstanceOf(Error)
      safeDone()
    })

    stream.on("end", () => {
      safeDone(
        new Error(
          "Stream should have emitted an error, but it ended successfully."
        )
      )
    })
  })

  it("should emit no entries and end for HAR without log.entries", (done) => {
    const harContent = JSON.stringify({
      log: {
        version: "1.2",
        creator: { name: "Test Creator", version: "1.0" },
        // entries array is missing or empty
      },
    })

    const harStream = Readable.from(harContent)
    const parsedEntries: HarEntry[] = []
    const stream = parseHarStream(harStream)

    stream.on("data", (entry: HarEntry) => {
      parsedEntries.push(entry)
    })

    stream.on("end", () => {
      expect(parsedEntries.length).toBe(0)
      done()
    })

    stream.on("error", (err) => {
      done(err)
    })
  })
})

describe("HAR file stream parsing from examples", () => {
  it("should successfully stream parse example files using parseHarStream", async () => {
    const examplesDir = path.resolve(__dirname, "../../../examples") // Corrected path
    const harFiles = await promises
      .readdir(examplesDir)
      .then((files) => files.filter((f) => f.endsWith(".har")))
    for (const harFile of harFiles) {
      const harFilePath = path.join(examplesDir, harFile)
      const harContent = await promises.readFile(harFilePath, "utf-8")
      const harStream = Readable.from(harContent)
      const parsedEntries: HarEntry[] = []
      const stream = parseHarStream(harStream)

      await new Promise<void>((resolve, reject) => {
        stream.on("data", (entry: HarEntry) => {
          parsedEntries.push(entry)
        })

        stream.on("end", () => {
          expect(parsedEntries.length).toBeGreaterThan(0)
          expect(
            parsedEntries.every(
              (entry) => HarEntrySchema.safeParse(entry).success
            )
          ).toBe(true)
          resolve()
        })

        stream.on("error", (err) => {
          reject(err)
        })
      })
    }
  })
})
