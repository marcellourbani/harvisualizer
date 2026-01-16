import React, { useEffect, useState, useMemo } from 'react';
import EntryList from './components/EntryList';
import FilterBar from './components/FilterBar';
import DetailPane from './components/DetailPane';
import { HarEntry } from 'har-parser';
import { CommunicationProvider, Theme } from './communication/CommunicationProvider';
import { useHarFilters } from './hooks/useHarFilters';
import './HarViewer.css';

interface HarViewerProps {
  communicationProvider: CommunicationProvider;
}

const HarViewer: React.FC<HarViewerProps> = ({ communicationProvider }) => {
  const [allHarEntries, setAllHarEntries] = useState<(HarEntry & { id: string })[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme['kind']>('light'); // Default to light

  const {
    filters,
    setFilters,
    filteredEntries,
    allMethods,
  } = useHarFilters(allHarEntries);

  const selectedEntry = useMemo(() => {
    return allHarEntries.find(entry => entry.id === selectedEntryId);
  }, [allHarEntries, selectedEntryId]);

  useEffect(() => {
    const unsubscribe = communicationProvider.onMessage(message => {
      if (message.command === 'loadData') {
        // Full load: replace all entries
        if ('entries' in message.data) {
          const entriesWithIds = message.data.entries.map((entry, index) => ({
            ...entry,
            id: (entry as any).id || crypto.randomUUID(), // Assign a unique ID
          }));
          setAllHarEntries(entriesWithIds);
          setSelectedEntryId(null);
        }
      } else if (message.command === 'updateData') {
        // Incremental update: append new entries, preserve selection
        if ('entries' in message.data) {
          const entriesWithIds = message.data.entries.map((entry, index) => ({
            ...entry,
            id: (entry as any).id || crypto.randomUUID(), // Assign a unique ID
          }));
          setAllHarEntries(prev => [...prev, ...entriesWithIds]);
          // Keep the current selection (don't reset selectedEntryId)
        }
      } else if (message.command === 'themeChanged') {
        // Type guard to check if message.data is Theme
        if ('kind' in message.data) {
          setTheme(message.data.kind);
        }
      }
    });

    communicationProvider.postMessage({ command: 'ready' });

    return () => unsubscribe();
  }, [communicationProvider]);

  const handleSelectEntry = (id: string) => {
    setSelectedEntryId(id);
    const entry = allHarEntries.find(e => e.id === id);
    if (entry) {
      communicationProvider.postMessage({ command: 'selectEntry', entry });
    }
  };

  const containerClassName = `har-viewer-container vscode-${theme}`;

  return (
    <div className={containerClassName}>
      <div className="har-viewer-controls">
        <h1>HAR Viewer</h1>
        <FilterBar onFiltersChange={setFilters} availableMethods={allMethods} />
      </div>
      <div className="har-viewer-content">
        <div className="har-viewer-list-pane">
          {filteredEntries.length === 0 && allHarEntries.length > 0 && (filters.method || filters.url) ? (
            <p>No entries match the current filters.</p>
          ) : filteredEntries.length === 0 && allHarEntries.length === 0 ? (
            <p>Loading HAR data or no entries found...</p>
          ) : (
            <EntryList
              entries={filteredEntries}
              onSelectEntry={handleSelectEntry}
              selectedEntryId={selectedEntryId}
            />
          )}
        </div>
        <div className="har-viewer-detail-pane">
          <DetailPane entry={selectedEntry || null} />
        </div>
      </div>
    </div>
  );
};

export default HarViewer;