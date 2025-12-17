import { HarEntry } from 'har-parser';

export interface HarEntryFilter {
  method?: string;
  url?: string; // Fuzzy search
}

export function applyFilters(entries: HarEntry[], filters: HarEntryFilter): HarEntry[] {
  if (!filters.method && !filters.url) {
    return entries;
  }

  return entries.filter(entry => {
    let methodMatch = true;
    if (filters.method) {
      methodMatch = entry.request.method.toUpperCase() === filters.method.toUpperCase();
    }

    let urlMatch = true;
    if (filters.url) {
      urlMatch = entry.request.url.toLowerCase().includes(filters.url.toLowerCase());
    }

    return methodMatch && urlMatch;
  });
}
