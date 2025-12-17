import { parseHar } from "../src/parser"
import { HarEntry } from "../src/zod-schema"
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

describe("parseHar", () => {
  it("should parse a valid HAR string and return an array of entries", async () => {
    const mockEntry1 = createMockHarEntry({
      request: {
        ...createMockHarEntry().request,
        url: "http://example.com/data1",
      },
    })
    const mockEntry2 = createMockHarEntry({
      request: {
        ...createMockHarEntry().request,
        url: "http://example.com/data2",
        method: "POST",
      },
    })

    const harString = JSON.stringify({
      log: {
        version: "1.2",
        creator: { name: "Test Creator", version: "1.0" },
        entries: [mockEntry1, mockEntry2],
      },
    })

    const entries = await parseHar(harString)
    expect(entries).toBeInstanceOf(Array)
    expect(entries.length).toBe(2)
    expect(entries[0]).toEqual(mockEntry1)
    expect(entries[1]).toEqual(mockEntry2)
  })

  it("should throw an error for malformed JSON", async () => {
    const malformedJson = `{ "log": { "entries": [ { "request": { "url": "invalid" } } }`
    await expect(
      parseHar(malformedJson, { logErrors: false })
    ).rejects.toThrow()
  })

  it("should throw an error if HAR object is malformed (e.g., entries not an array)", async () => {
    const invalidHarString = `{"log": {"version": "1.2", "creator": {}, "entries": "not an array"}}`
    await expect(
      parseHar(invalidHarString, { logErrors: false })
    ).rejects.toThrow()
  })

  it("should throw an error if log or entries are missing", async () => {
    const harMissingLog = `{}`
    const harMissingEntries = `{"log": {}}`
    await expect(
      parseHar(harMissingLog, { logErrors: false })
    ).rejects.toThrow()
    await expect(
      parseHar(harMissingEntries, { logErrors: false })
    ).rejects.toThrow()
  })

  it("should throw an error for Zod validation failure (e.g., missing required field)", async () => {
    const invalidEntry = {
      ...createMockHarEntry(),
      request: {
        ...createMockHarEntry().request,
        url: "not-a-valid-url", // Invalid URL
      },
    }
    const harString = JSON.stringify({
      log: {
        version: "1.2",
        creator: { name: "Test Creator", version: "1.0" },
        entries: [invalidEntry],
      },
    })
    await expect(parseHar(harString, { logErrors: false })).rejects.toThrow()
  })
})

describe("HAR file parsing from examples", () => {
  const examplesDir = path.resolve(__dirname, "../../../examples") // Corrected path

  it(`should successfully parse sample files using parseHar`, async () => {
    const examplesDir = path.resolve(__dirname, "../../../examples") // Corrected path
    const harFiles = await promises
      .readdir(examplesDir)
      .then((files) => files.filter((f) => f.endsWith(".har")))
    for (const harFile of harFiles) {
      const harFilePath = path.join(examplesDir, harFile)
      const harContent = await promises.readFile(harFilePath, "utf-8")
      const entries = await parseHar(harContent)

      expect(entries).toBeInstanceOf(Array)
      expect(entries.length).toBeGreaterThan(0)
    }
  })
})
