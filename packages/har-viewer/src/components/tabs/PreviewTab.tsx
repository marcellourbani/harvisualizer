import React from 'react';
import { HarEntry } from 'har-parser';
import './PreviewTab.css';

interface PreviewTabProps {
  response: HarEntry['response'];
}

const PreviewTab: React.FC<PreviewTabProps> = ({ response }) => {
  if (!response || !response.content) {
    return <p>No preview available.</p>;
  }

  const { content } = response;
  const mimeType = content.mimeType || '';
  const text = content.text || '';

  // Try to format JSON
  if (mimeType.includes('json') && text) {
    try {
      const parsed = JSON.parse(text);
      return (
        <div className="preview-tab">
          <h3>JSON Preview</h3>
          <pre className="json-preview">{JSON.stringify(parsed, null, 2)}</pre>
        </div>
      );
    } catch (e) {
      // Fall through to raw text
    }
  }

  // For images
  if (mimeType.includes('image')) {
    const imageData = content.encoding === 'base64'
      ? `data:${mimeType};base64,${text}`
      : text;
    return (
      <div className="preview-tab">
        <h3>Image Preview</h3>
        <img src={imageData} alt="Response preview" className="image-preview" />
      </div>
    );
  }

  // For HTML
  if (mimeType.includes('html') && text) {
    return (
      <div className="preview-tab">
        <h3>HTML Preview</h3>
        <iframe
          className="html-preview"
          srcDoc={text}
          title="HTML Preview"
          sandbox="allow-same-origin"
        />
      </div>
    );
  }

  // Default: show raw text
  return (
    <div className="preview-tab">
      <h3>Text Preview</h3>
      <pre className="text-preview">{text || '(empty)'}</pre>
    </div>
  );
};

export default PreviewTab;
