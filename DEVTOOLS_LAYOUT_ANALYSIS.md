# DevTools Layout Analysis for HarVisualizer

## Task
Analyze Chrome DevTools Network panel layout structure to redesign the HarVisualizer detail view with:
- **Main tab**: Headers + Payload
- **Additional tabs**: Other information (Preview, Response, Timing, Cookies, etc.)

## Current HarVisualizer Structure

### Component Hierarchy
```
DetailPane.tsx
├── RequestDetails.tsx
└── ResponseDetails.tsx
```

### DetailPane.tsx (packages/har-viewer/src/components/DetailPane.tsx)
- Simple container component
- Shows entry ID header
- Renders RequestDetails and ResponseDetails sequentially (no tabs)
- Lines 15-21: Sequential rendering without tab structure

### RequestDetails.tsx (packages/har-viewer/src/components/RequestDetails.tsx)
**Currently displays:**
- Request method (with color-coded badge)
- URL
- HTTP version
- Post data (if available)

**Missing:**
- Headers (line 28 comment: "More details like headers, query string etc. can be added here")
- Query string parameters
- Form data
- Cookies

### ResponseDetails.tsx (packages/har-viewer/src/components/ResponseDetails.tsx)
**Currently displays:**
- Status code + status text (with color-coded badge)
- HTTP version
- Response content/body (if available)
- MIME type

**Missing:**
- Headers (line 28 comment: "More details like headers can be added here")
- Cookies
- Timing information

## Chrome DevTools Network Panel Structure

### Request Details Tabs
When clicking a network request in Chrome DevTools, the following tabs are available:

1. **Headers** (default tab)
   - General information (Request URL, Request Method, Status Code, etc.)
   - Response Headers
   - Request Headers
   - Early Hints Headers (if applicable)

2. **Payload**
   - Query string parameters
   - Form data
   - Request body

3. **Preview**
   - Preview of response body
   - Particularly useful for images and formatted JSON

4. **Response**
   - Raw response body content

5. **Timing**
   - Timing breakdown showing:
     - Queuing
     - Stalled
     - DNS Lookup
     - Initial connection
     - SSL/TLS negotiation
     - Request sent
     - Waiting (TTFB)
     - Content Download

6. **Cookies**
   - Request cookies
   - Response cookies
   - Cookie properties (Name, Value, Domain, Path, Expires, Size, etc.)

7. **Messages** (WebSocket only)
   - Sent and received WebSocket messages

8. **EventStream** (for streaming APIs)
   - Server-sent events

## HAR Format Data Availability

Based on the HAR specification, the following data is available in HarEntry:

### request object
- method
- url
- httpVersion
- headers[] (name, value)
- queryString[] (name, value)
- cookies[] (name, value, path, domain, expires, httpOnly, secure)
- postData {mimeType, text, params[]}
- headersSize
- bodySize

### response object
- status
- statusText
- httpVersion
- headers[] (name, value)
- cookies[] (name, value, path, domain, expires, httpOnly, secure)
- content {size, mimeType, text, encoding}
- redirectURL
- headersSize
- bodySize

### timings object
- blocked
- dns
- connect
- send
- wait
- receive
- ssl

## Gap Analysis

### What's Missing in Current Implementation

1. **No tab structure** - Everything is rendered sequentially
2. **No headers display** - Neither request nor response headers are shown
3. **No query parameters** - Not extracted from URL or queryString array
4. **No cookies display** - Request/response cookies not shown
5. **No timing information** - HAR timing data not visualized
6. **No preview functionality** - No formatted preview of response content
7. **Limited payload display** - Only shows raw postData.text, not parsed form data or params

## Recommended Implementation

### Tab Structure (Following DevTools Pattern)

**Main Tab: "Headers & Payload"** (Default)
- General section:
  - Request URL
  - Request Method
  - Status Code
  - Remote Address (if available)
  - Referrer Policy
- Request Headers (from request.headers[])
- Response Headers (from response.headers[])
- Query String Parameters (from request.queryString[])
- Form Data (from request.postData.params[] or parsed postData.text)

**Tab: "Preview"**
- Formatted JSON preview (if response is JSON)
- Image preview (if response is image)
- Formatted HTML preview (if response is HTML)
- Fallback to raw text

**Tab: "Response"**
- Raw response body (response.content.text)
- Show encoding if specified
- Syntax highlighting based on mimeType

**Tab: "Timing"**
- Visual timeline bar showing timing phases
- Breakdown of:
  - Queueing
  - Stalled
  - DNS Lookup (timings.dns)
  - Initial Connection (timings.connect)
  - SSL/TLS (timings.ssl)
  - Request Sent (timings.send)
  - Waiting - TTFB (timings.wait)
  - Content Download (timings.receive)
  - Blocked (timings.blocked)
- Total time calculation

**Tab: "Cookies"**
- Request Cookies table (from request.cookies[])
- Response Cookies table (from response.cookies[])
- Columns: Name, Value, Domain, Path, Expires/Max-Age, Size, HttpOnly, Secure, SameSite

### User's Specific Requirement

The task states: "I want my detailed view to include headers and payload in its main tab, and the rest in their own tabs"

This aligns with combining the DevTools "Headers" and "Payload" tabs into a single main tab, which is a reasonable UX decision to reduce clicking for the most commonly accessed information.

## Technical Implementation Notes

### Component Structure Proposal
```
DetailPane.tsx (with tab state management)
├── MainTab.tsx (Headers & Payload)
│   ├── GeneralSection.tsx
│   ├── RequestHeadersSection.tsx
│   ├── ResponseHeadersSection.tsx
│   ├── QueryParamsSection.tsx
│   └── FormDataSection.tsx
├── PreviewTab.tsx
├── ResponseTab.tsx
├── TimingTab.tsx
└── CookiesTab.tsx
```

### Libraries to Consider
- **Tab component**: React state or a UI library (Material-UI Tabs, Radix UI Tabs, etc.)
- **JSON preview**: react-json-view or similar
- **Syntax highlighting**: Prism.js or highlight.js for code blocks
- **Timing visualization**: Custom SVG/Canvas or a charting library

### Data Already Available
All required data is already passed to DetailPane as the `entry` prop which includes the full HarEntry object with:
- `entry.request` (headers, queryString, cookies, postData)
- `entry.response` (headers, cookies, content)
- `entry.timings`

No additional data fetching is required.

## References

- [Network features reference | Chrome DevTools](https://developer.chrome.com/docs/devtools/network/reference)
- [Network panel: Analyze network load and resources | Chrome DevTools](https://developer.chrome.com/docs/devtools/network/overview)
- [HAR Specification](http://www.softwareishard.com/blog/har-12-spec/)

## Next Steps

1. Decide on tab UI component library or implement custom tabs
2. Create the tabbed layout structure in DetailPane.tsx
3. Implement the combined "Headers & Payload" main tab
4. Implement Preview tab with conditional rendering based on content type
5. Implement Response tab with syntax highlighting
6. Implement Timing tab with visual timeline
7. Implement Cookies tab with tabular display
8. Style components to match DevTools aesthetic (or custom theme)
9. Test with various HAR entries to ensure all data is displayed correctly

---
**Analysis completed**: 2026-01-16
**Assigned to**: harvisualizer/polecats/furiosa
**Bead**: harvisualizer-3oq.2
