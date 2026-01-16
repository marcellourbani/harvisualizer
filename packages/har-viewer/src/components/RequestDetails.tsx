import React from 'react';
import { HarEntry } from 'har-parser';
import '@vscode-elements/elements/dist/vscode-badge';

interface RequestDetailsProps {
  request: HarEntry['request']; // Full HAR Request object
}

const RequestDetails: React.FC<RequestDetailsProps> = ({ request }) => {
  if (!request) {
    return <p>No request details available.</p>;
  }
  const methodVariant: 'success' | 'danger' | 'note' | 'default' = getMethodVariant(request.method);

  return (
    <div>
      <h3>Request</h3>
      <p>
        <strong>Method:</strong> <vscode-badge variant={methodVariant}>{request.method}</vscode-badge>
      </p>
      <p>URL: {request.url}</p>
      <p>HTTP Version: {request.httpVersion}</p>
      {request.postData && request.postData.text && (
        <>
          <h4>Post Data</h4>
          <pre>{request.postData.text}</pre>
        </>
      )}
      {/* More details like headers, query string etc. can be added here */}
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

export default RequestDetails;
