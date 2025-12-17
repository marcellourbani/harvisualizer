import React from 'react';
import { HarEntry } from 'har-parser';

interface ResponseDetailsProps {
  response: HarEntry['response']; // Full HAR Response object
}

const ResponseDetails: React.FC<ResponseDetailsProps> = ({ response }) => {
  if (!response) {
    return <p>No response details available.</p>;
  }
  const statusClass = getStatusClass(response.status);

  return (
    <div>
      <h3>Response</h3>
      <p>
        <strong>Status:</strong> <span className={`method-badge ${statusClass}`}>{response.status} {response.statusText}</span>
      </p>
      <p>HTTP Version: {response.httpVersion}</p>
      {response.content && response.content.text && (
        <>
          <h4>Content</h4>
          <pre>{response.content.text}</pre>
        </>
      )}
      <p>MIME Type: {response.content?.mimeType}</p>
      {/* More details like headers can be added here */}
    </div>
  );
};

const getStatusClass = (status: number): string => {
  if (status >= 200 && status < 300) return 'method-get'; // Success / Green
  if (status >= 300 && status < 400) return 'method-other'; // Redirect / Yellow
  return 'method-delete'; // Error / Red (>= 400, or < 200)
};

export default ResponseDetails;
