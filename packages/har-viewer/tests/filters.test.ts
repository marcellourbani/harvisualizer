import { applyFilters, HarEntryFilter } from '../src/utils/filters';
import { HarEntry } from 'har-parser';

// Helper function to create a valid mock HarEntry (fully compliant with har-parser's HarEntry)
const createFullMockHarEntry = (overrides?: Partial<HarEntry> & { id?: string }): HarEntry & { id: string } => {
  const baseEntry: HarEntry = {
    startedDateTime: "2025-01-01T00:00:00.000Z", // Fixed timestamp for consistency
    time: 100,
    request: {
      method: 'GET',
      url: 'http://example.com/data',
      httpVersion: 'HTTP/1.1',
      headers: [],
      queryString: [],
      cookies: [],
      headersSize: 100,
      bodySize: 0,
    },
    response: {
      status: 200,
      statusText: 'OK',
      httpVersion: 'HTTP/1.1',
      headers: [],
      cookies: [],
      content: {
        size: 0,
        mimeType: 'text/plain',
        text: '{"key":"value"}'
      },
      redirectURL: '',
      headersSize: 100,
      bodySize: 0,
    },
    cache: {},
    timings: {
      send: 0,
      wait: 50,
      receive: 50,
    },
  };

  // Deep merge for the request object
  const mergedRequest = {
    ...baseEntry.request,
    ...(overrides?.request || {}),
  };

  // Apply other top-level overrides, then set the merged request and id
  const finalEntry: HarEntry & { id: string } = {
    ...baseEntry,
    ...overrides, // This will apply all top-level overrides first
    request: mergedRequest, // Then specifically overwrite 'request' with the deeply merged one
    id: overrides?.id || 'default-id', // Ensure 'id' is always present and correctly typed
  };

  return finalEntry;
};


describe('applyFilters', () => {
  const mockEntries = [
    createFullMockHarEntry({ id: '1', request: { method: 'GET', url: 'http://example.com/api/users' } }),
    createFullMockHarEntry({ id: '2', request: { method: 'POST', url: 'http://example.com/api/products' } }),
    createFullMockHarEntry({ id: '3', request: { method: 'GET', url: 'http://example.com/api/orders' } }),
    createFullMockHarEntry({ id: '4', request: { method: 'PUT', url: 'http://example.com/api/users/1' } }),
  ];

  it('should return all entries if no filters are provided', () => {
    const filters: HarEntryFilter = {};
    const filtered = applyFilters(mockEntries, filters);
    expect(filtered).toEqual(mockEntries);
  });

  it('should filter by method', () => {
    const filters: HarEntryFilter = { method: 'GET' };
    const filtered = applyFilters(mockEntries, filters);
    expect(filtered).toEqual([
      createFullMockHarEntry({ id: '1', request: { method: 'GET', url: 'http://example.com/api/users' } }),
      createFullMockHarEntry({ id: '3', request: { method: 'GET', url: 'http://example.com/api/orders' } }),
    ]);
  });

  it('should filter by URL (fuzzy search)', () => {
    const filters: HarEntryFilter = { url: 'users' };
    const filtered = applyFilters(mockEntries, filters);
    expect(filtered).toEqual([
      createFullMockHarEntry({ id: '1', request: { method: 'GET', url: 'http://example.com/api/users' } }),
      createFullMockHarEntry({ id: '4', request: { method: 'PUT', url: 'http://example.com/api/users/1' } }),
    ]);
  });

  it('should filter by method and URL', () => {
    const filters: HarEntryFilter = { method: 'GET', url: 'api' };
    const filtered = applyFilters(mockEntries, filters);
    expect(filtered).toEqual([
      createFullMockHarEntry({ id: '1', request: { method: 'GET', url: 'http://example.com/api/users' } }),
      createFullMockHarEntry({ id: '3', request: { method: 'GET', url: 'http://example.com/api/orders' } }),
    ]);
  });

  it('should be case-insensitive for method', () => {
    const filters: HarEntryFilter = { method: 'get' };
    const filtered = applyFilters(mockEntries, filters);
    expect(filtered).toEqual([
      createFullMockHarEntry({ id: '1', request: { method: 'GET', url: 'http://example.com/api/users' } }),
      createFullMockHarEntry({ id: '3', request: { method: 'GET', url: 'http://example.com/api/orders' } }),
    ]);
  });

  it('should be case-insensitive for URL', () => {
    const filters: HarEntryFilter = { url: 'USERS' };
    const filtered = applyFilters(mockEntries, filters);
    expect(filtered).toEqual([
      createFullMockHarEntry({ id: '1', request: { method: 'GET', url: 'http://example.com/api/users' } }),
      createFullMockHarEntry({ id: '4', request: { method: 'PUT', url: 'http://example.com/api/users/1' } }),
    ]);
  });

  it('should return empty array if no matches', () => {
    const filters: HarEntryFilter = { method: 'DELETE', url: 'nothing' };
    const filtered = applyFilters(mockEntries, filters);
    expect(filtered).toEqual([]);
  });
});
