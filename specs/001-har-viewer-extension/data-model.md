# Data Model: HAR Viewer

This document defines the core data entities for the HAR Viewer extension, based on the HAR 1.2 Specification.

## Main Entities

### HAR
The root object of a HAR file.

- `log`: `Log` - The main log object.

### Log
The log object contains the list of all captured HTTP requests.

- `version`: `string` - The HAR version.
- `creator`: `Creator` - Information about the tool that created the log.
- `browser`: `Browser` (optional) - Information about the browser that created the log.
- `pages`: `Page[]` (optional) - A list of all pages that were loaded.
- `entries`: `Entry[]` - A list of all captured HTTP requests.

### Entry
Represents a single HTTP request/response pair.

- `pageref`: `string` (optional) - The ID of the page this request belongs to.
- `startedDateTime`: `string` - The start time of the request.
- `time`: `number` - The total time of the request in milliseconds.
- `request`: `Request` - The request object.
- `response`: `Response` - The response object.
- `cache`: `Cache` - Information about the cache state.
- `timings`: `Timings` - Detailed timing information for the request.

### Request
Contains detailed information about the request.

- `method`: `string` - The request method (e.g., GET, POST).
- `url`: `string` - The URL of the request.
- `httpVersion`: `string` - The HTTP version.
- `cookies`: `Cookie[]` - A list of cookies sent with the request.
- `headers`: `Header[]` - A list of headers sent with the request.
- `queryString`: `QueryString[]` - A list of query string parameters.
- `postData`: `PostData` (optional) - Information about the POST data.
- `headersSize`: `number` - The size of the request headers in bytes.
- `bodySize`: `number` - The size of the request body in bytes.

### Response
Contains detailed information about the response.

- `status`: `number` - The response status code.
- `statusText`: `string` - The response status text.
- `httpVersion`: `string` - The HTTP version.
- `cookies`: `Cookie[]` - A list of cookies received with the response.
- `headers`: `Header[]` - A list of headers received with the response.
- `content`: `Content` - The response content.
- `redirectURL`: `string` - The URL of the redirected request.
- `headersSize`: `number` - The size of the response headers in bytes.
- `bodySize`: `number` - The size of the response body in bytes.

### Content
Represents the content of the response.

- `size`: `number` - The size of the content in bytes.
- `mimeType`: `string` - The MIME type of the content.
- `text`: `string` (optional) - The content text.
- `encoding`: `string` (optional) - The encoding of the content.
