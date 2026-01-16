import React from 'react';
import { HarEntry } from 'har-parser';
import '@vscode-elements/elements/dist/vscode-badge';

interface ResponseDetailsProps {
  response: HarEntry['response']; // Full HAR Response object
}

const ResponseDetails: React.FC<ResponseDetailsProps> = ({ response }) => {
  if (!response) {
    return <p>No response details available.</p>;
  }
  const statusVariant: 'success' | 'note' | 'danger' = getStatusVariant(response.status);

  return (
    <div>
      <h3>Response</h3>
      <p>
        <strong>Status:</strong> <vscode-badge variant={statusVariant}>{response.status} {response.statusText}</vscode-badge>
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

const getStatusVariant = (status: number): 'success' | 'note' | 'danger' => {
  if (status >= 200 && status < 300) return 'success'; // Success / Green
  if (status >= 300 && status < 400) return 'note'; // Redirect / Blue
  return 'danger'; // Error / Red (>= 400, or < 200)
};

export default ResponseDetails;
