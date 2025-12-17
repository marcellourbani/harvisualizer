import { useState, useMemo } from 'react';
import { applyFilters, HarEntryFilter } from '../utils/filters';
import { HarEntry } from 'har-parser';

export const useHarFilters = (initialEntries: HarEntry[]) => {
  const [filters, setFilters] = useState<HarEntryFilter>({});

  const filteredEntries = useMemo(() => {
    return applyFilters(initialEntries, filters);
  }, [initialEntries, filters]);

  const allMethods = useMemo(() => {
    const methods = new Set<string>();
    initialEntries.forEach(entry => methods.add(entry.request.method.toUpperCase()));
    return Array.from(methods).sort();
  }, [initialEntries]);

  return {
    filters,
    setFilters,
    filteredEntries,
    allMethods,
  };
};
