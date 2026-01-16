import { HarEntry, HarSchema, HarEntrySchema } from './zod-schema';
import { parser } from 'stream-json';
import { streamArray } from 'stream-json/streamers/StreamArray';
import { Readable, Transform } from 'stream';
import { chain } from 'stream-chain';
import { pick } from 'stream-json/filters/Pick';
import * as readline from 'readline';

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

/**
 * Parses a JSONL (JSON Lines) stream where each line contains a HAR-shaped structure.
 * Each line is expected to have the shape of a HAR file with log.entries.
 *
 * @param jsonlStream The JSONL content as a Readable stream.
 * @param options Options for parsing, including whether to log errors and skip malformed lines.
 * @returns A Readable stream that emits HarEntry objects.
 */
export function parseJsonlStream(
  jsonlStream: Readable,
  options: { logErrors?: boolean; skipMalformed?: boolean } = {}
): Readable {
  const { logErrors = true, skipMalformed = true } = options;
  const outputStream = new Transform({ objectMode: true });

  let lineNumber = 0;
  let hasError = false;

  try {
    const rl = readline.createInterface({
      input: jsonlStream,
      crlfDelay: Infinity
    });

    rl.on('line', (line) => {
      lineNumber++;

      // Skip empty lines
      if (!line.trim()) {
        return;
      }

      try {
        // Parse line as JSON
        const lineObject = JSON.parse(line);

        // Validate it's a HAR structure
        const validatedHar = HarSchema.parse(lineObject);

        // Extract and emit each entry from this line
        for (const entry of validatedHar.log.entries) {
          try {
            const validatedEntry = HarEntrySchema.parse(entry);
            outputStream.push(validatedEntry);
          } catch (entryValidationError) {
            if (logErrors) {
              console.error(`[HarParser] Entry validation error on line ${lineNumber}:`, entryValidationError);
            }
            if (!skipMalformed) {
              hasError = true;
              outputStream.emit('error', new Error(`HAR entry failed validation on line ${lineNumber}`));
              rl.close();
              return;
            }
          }
        }
      } catch (lineError) {
        if (logErrors) {
          console.error(`[HarParser] Error parsing JSONL line ${lineNumber}:`, lineError);
          console.error(`[HarParser] Line content: ${line.substring(0, 100)}...`);
        }
        if (!skipMalformed) {
          hasError = true;
          outputStream.emit('error', new Error(`Invalid JSON or HAR structure on line ${lineNumber}`));
          rl.close();
          return;
        }
      }
    });

    rl.on('close', () => {
      if (!hasError) {
        outputStream.end();
      }
    });

    rl.on('error', (err) => {
      if (logErrors) {
        console.error('[HarParser] Error reading JSONL stream:', err);
      }
      outputStream.emit('error', err);
    });

    jsonlStream.on('error', (err) => {
      if (logErrors) {
        console.error('[HarParser] Input stream error:', err);
      }
      outputStream.emit('error', err);
      rl.close();
    });

  } catch (err) {
    if (logErrors) {
      console.error('[HarParser] Critical error setting up JSONL parsing:', err);
    }
    outputStream.emit('error', err);
  }

  return outputStream;
}
