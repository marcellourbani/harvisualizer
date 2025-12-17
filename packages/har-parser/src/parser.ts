import { HarEntry, HarSchema, HarEntrySchema } from './zod-schema';
import { parser } from 'stream-json';
import { streamArray } from 'stream-json/streamers/StreamArray';
import { Readable, Transform } from 'stream';
import { chain } from 'stream-chain';
import { pick } from 'stream-json/filters/Pick';

/**
 * Parses a HAR content string and extracts log.entries using Zod for validation.
 * Throws an error if parsing or validation fails.
 *
 * @param harContent The HAR file content as a string.
 * @returns A Promise that resolves to an array of HAR entries.
 */
export async function parseHar(
  harContent: string,
  options: { logErrors?: boolean } = {}
): Promise<HarEntry[]> {
  const { logErrors = true } = options;

  try {
    const harObject = JSON.parse(harContent);
    const validatedHar = HarSchema.parse(harObject);
    return validatedHar.log.entries;
  } catch (err) {
    if (logErrors) {
      console.error("[HarParser] Error parsing or validating HAR content:", err);
      console.error("[HarParser] Input may be malformed JSON or fail HAR schema validation.");
    }
    throw err; // Re-throw the error for the caller to handle
  }
}

/**
 * Parses a HAR stream and emits validated HarEntry objects.
 *
 * @param harStream The HAR content as a Readable stream.
 * @param options Options for parsing, including whether to log errors.
 * @returns A Readable stream that emits HarEntry objects.
 */
export function parseHarStream(
  harStream: Readable,
  options: { logErrors?: boolean } = {}
): Readable {
  const { logErrors = true } = options;
  const outputStream = new Transform({ objectMode: true });

  try {
    const pipeline = chain([
      harStream,
      parser(),
      pick({ filter: 'log.entries' }),
      streamArray()
    ]);

    pipeline.on('data', (chunk) => {
      try {
        const validatedEntry = HarEntrySchema.parse(chunk.value);
        outputStream.push(validatedEntry);
      } catch (validationError) {
        if (logErrors) {
          console.error("[HarParser] Zod validation error during stream parsing for an entry:", validationError);
        }
        outputStream.emit('error', new Error("HAR entry failed Zod validation during streaming."));
        pipeline.destroy(); // Stop processing on first validation error
      }
    });

    pipeline.on('end', () => {
      outputStream.end();
    });

    pipeline.on('error', (err) => {
      if (logErrors) {
        console.error("[HarParser] Error during stream-json pipeline:", err);
        console.error("[HarParser] Input stream may be malformed or invalid JSON structure.");
      }
      outputStream.emit('error', err);
    });

    // Ensure pipeline errors are propagated to the output stream
    harStream.on('error', (err) => {
      outputStream.emit('error', err);
    });

  } catch (err) {
    if (logErrors) {
      console.error("[HarParser] Critical error setting up stream parsing pipeline:", err);
    }
    outputStream.emit('error', err);
  }

  return outputStream;
}
