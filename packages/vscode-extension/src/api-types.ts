/**
 * Plain TypeScript version of HarEntry for API definitions
 * This avoids dependency on har-parser in the public API types
 */
export interface ExtHarEntry {
  startedDateTime: string
  time: number
  request: {
    method: string
    url: string
    httpVersion: string
    cookies: Array<{
      name: string
      value: string
      path?: string
      domain?: string
      expires?: string
      httpOnly?: boolean
      secure?: boolean
      sameSite?: string
    }>
    headers: Array<{
      name: string
      value: string
    }>
    queryString: Array<{
      name: string
      value: string
    }>
    postData?: any
    headersSize: number
    bodySize: number
  }
  response: {
    status: number
    statusText: string
    httpVersion: string
    cookies: Array<{
      name: string
      value: string
      path?: string
      domain?: string
      expires?: string
      httpOnly?: boolean
      secure?: boolean
      sameSite?: string
    }>
    headers: Array<{
      name: string
      value: string
    }>
    content: {
      size: number
      mimeType: string
      text?: string
      encoding?: string
    }
    redirectURL: string
    headersSize: number
    bodySize: number
  }
  cache: any
  timings: {
    blocked?: number
    dns?: number
    connect?: number
    send: number
    wait: number
    receive: number
    ssl?: number
  }
  serverIPAddress?: string
  connection?: string
  _resourceType?: string
}

/**
 * Handle returned from registration that allows sending HAR calls
 */
export interface HarRecorderHandle {
  /**
   * Send a HAR call entry to be recorded
   * @param entry - HAR-formatted call data
   */
  sendCall(entry: ExtHarEntry): void

  /**
   * Dispose of this registration and clean up resources
   */
  dispose(): void
}

/**
 * Public API for HAR recording that other extensions can use
 */
export interface HarRecorderAPI {
  /**
   * Register an extension to send HAR calls
   * @param extensionId - Unique identifier for the calling extension
   * @returns Handle for sending calls and disposing
   */
  register(extensionId: string): HarRecorderHandle
}
