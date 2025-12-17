import React from 'react';
import EntryListItem from './EntryListItem';
import { HarEntry } from 'har-parser';

export interface EntryListItemData {
  id: string;
  method: string;
  url: string;
  status: number;
}

interface EntryListProps {
  entries: HarEntry[]; // Still passing full HarEntry to allow filtering on more fields
  onSelectEntry: (id: string) => void;
  selectedEntryId: string | null;
}

const EntryList: React.FC<EntryListProps> = ({ entries, onSelectEntry, selectedEntryId }) => {
  return (
    <div>
      {entries.map((entry) => (
        <EntryListItem
          key={(entry as any).id} // Ensure 'id' exists for key prop
          entry={{
            id: (entry as any).id, // Assuming 'id' is added by viewer logic
            method: entry.request.method,
            url: entry.request.url,
            status: entry.response.status,
          }}
          onClick={onSelectEntry}
          isSelected={(entry as any).id === selectedEntryId}
        />
      ))}
    </div>
  );
};

export default EntryList;
