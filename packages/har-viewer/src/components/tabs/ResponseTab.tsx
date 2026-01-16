import React from 'react';
import { HarEntry } from 'har-parser';
import './ResponseTab.css';

interface ResponseTabProps {
  response: HarEntry['response'];
}

const ResponseTab: React.FC<ResponseTabProps> = ({ response }) => {
  if (!response || !response.content) {
    return <p>No response content available.</p>;
  }

  const { content } = response;
  const text = content.text || '';

  return (
    <div className="response-tab">
      <div className="response-info">
        <div className="info-row">
          <span className="info-label">MIME Type:</span>
          <span className="info-value">{content.mimeType || 'unknown'}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Size:</span>
          <span className="info-value">{content.size} bytes</span>
        </div>
        {content.encoding && (
          <div className="info-row">
            <span className="info-label">Encoding:</span>
            <span className="info-value">{content.encoding}</span>
          </div>
        )}
      </div>

      <h3>Response Body</h3>
      <pre className="response-body">{text || '(empty)'}</pre>
    </div>
  );
};

export default ResponseTab;
