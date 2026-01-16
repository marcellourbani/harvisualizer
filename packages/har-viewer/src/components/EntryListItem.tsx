import React from 'react';
import { EntryListItemData } from './EntryList';
import '@vscode-elements/elements/dist/vscode-badge';

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

  const methodVariant: 'success' | 'danger' | 'note' | 'default' = getMethodVariant(entry.method);

  return (
    <div
      className={`har-entry-row ${isSelected ? 'selected' : ''} ${rowClass}`}
      onClick={() => onClick(entry.id)}
    >
      <vscode-badge variant={methodVariant}>{entry.method}</vscode-badge>
      <span className="url-col">{entry.url}</span>
      <span className="status-col">{entry.status}</span>
    </div>
  );
};

const getMethodVariant = (method: string): 'success' | 'danger' | 'note' | 'default' => {
  const m = method.toUpperCase();
  if (m === 'GET') return 'success';
  if (m === 'DELETE') return 'danger';
  if (m === 'POST' || m === 'PUT' || m === 'PATCH') return 'note';
  return 'default';
};

export default EntryListItem;
