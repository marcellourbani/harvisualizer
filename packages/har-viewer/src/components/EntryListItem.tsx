import React from 'react';
import { EntryListItemData } from './EntryList';

interface EntryListItemProps {
  entry: EntryListItemData;
  onClick: (id: string) => void;
  isSelected?: boolean;
}

const EntryListItem: React.FC<EntryListItemProps> = ({ entry, onClick, isSelected }) => {
  let rowClass = '';
  if (entry.status >= 400) {
    rowClass = 'error';
  } else if (entry.status >= 300) {
    rowClass = 'redirect';
  }

  const methodClass = getMethodClass(entry.method);

  return (
    <div
      className={`har-entry-row ${isSelected ? 'selected' : ''} ${rowClass}`}
      onClick={() => onClick(entry.id)}
    >
      <span className={`method-badge ${methodClass}`}>{entry.method}</span>
      <span className="url-col">{entry.url}</span>
      <span className="status-col">{entry.status}</span>
    </div>
  );
};

const getMethodClass = (method: string): string => {
  const m = method.toUpperCase();
  if (m === 'GET') return 'method-get';
  if (m === 'DELETE') return 'method-delete';
  return 'method-other';
};

export default EntryListItem;
