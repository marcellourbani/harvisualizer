import React from 'react';
import RequestDetails from './RequestDetails';
import ResponseDetails from './ResponseDetails';
import { HarEntry } from 'har-parser';

interface DetailPaneProps {
  entry: HarEntry & { id: string } | null; // Full HAR Entry object with an ID
}

const DetailPane: React.FC<DetailPaneProps> = ({ entry }) => {
  if (!entry) {
    return <p>Select an entry to view details.</p>;
  }

  return (
    <div>
      <h2>Entry Details (ID: {entry.id})</h2>
      <RequestDetails request={entry.request} />
      <ResponseDetails response={entry.response} />
    </div>
  );
};

export default DetailPane;
