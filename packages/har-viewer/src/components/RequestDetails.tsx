import React from 'react';
import { HarEntry } from 'har-parser';

interface RequestDetailsProps {
  request: HarEntry['request']; // Full HAR Request object
}

const RequestDetails: React.FC<RequestDetailsProps> = ({ request }) => {
  if (!request) {
    return <p>No request details available.</p>;
  }
  const methodClass = getMethodClass(request.method);

  return (
    <div>
      <h3>Request</h3>
      <p>
        <strong>Method:</strong> <span className={`method-badge ${methodClass}`}>{request.method}</span>
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

const getMethodClass = (method: string): string => {
  const m = method.toUpperCase();
  if (m === 'GET') return 'method-get';
  if (m === 'DELETE') return 'method-delete';
  return 'method-other';
};

export default RequestDetails;
