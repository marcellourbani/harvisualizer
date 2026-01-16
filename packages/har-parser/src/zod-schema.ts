import { z } from 'zod';

const CookieSchema = z.object({
  name: z.string(),
  value: z.string(),
  path: z.string().optional(),
  domain: z.string().optional(),
  expires: z.string().optional(),
  httpOnly: z.boolean().optional(),
  secure: z.boolean().optional(),
  sameSite: z.string().optional(),
});

const HarEntrySchema = z.object({
  startedDateTime: z.string().datetime(),
  time: z.number(),
  request: z.object({
    method: z.string(),
    url: z.string().url(),
    httpVersion: z.string(),
    headers: z.array(z.object({ name: z.string(), value: z.string() })),
    queryString: z.array(z.object({ name: z.string(), value: z.string() })),
    cookies: z.array(CookieSchema),
    headersSize: z.number(),
    bodySize: z.number(),
    postData: z.any().optional(),
  }),
  response: z.object({
    status: z.number(),
    statusText: z.string(),
    httpVersion: z.string(),
    headers: z.array(z.object({ name: z.string(), value: z.string() })),
    cookies: z.array(CookieSchema),
    content: z.object({
      size: z.number(),
      mimeType: z.string(),
      text: z.string().optional(),
      encoding: z.string().optional(),
    }),
    redirectURL: z.string(),
    headersSize: z.number(),
    bodySize: z.number(),
  }),
  cache: z.any(),
  timings: z.object({
    blocked: z.number().optional(),
    dns: z.number().optional(),
    connect: z.number().optional(),
    ssl: z.number().optional(),
    send: z.number(),
    wait: z.number(),
    receive: z.number(),
  }),
  serverIPAddress: z.string().optional(),
  connection: z.string().optional(),
  _resourceType: z.string().optional(),
});

export type HarEntry = z.infer<typeof HarEntrySchema>;

export { HarEntrySchema };

const HarSchema = z.object({
  log: z.object({
    version: z.string(),
    creator: z.object({
      name: z.string(),
      version: z.string(),
    }),
    browser: z.any().optional(),
    pages: z.array(z.any()).optional(),
    entries: z.array(HarEntrySchema),
  }),
});

export type Har = z.infer<typeof HarSchema>;
export { HarSchema };
