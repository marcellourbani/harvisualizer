import React from 'react';
import { HarEntry } from 'har-parser';
import './HeadersPayloadTab.css';

interface HeadersPayloadTabProps {
  entry: HarEntry & { id: string };
}

const HeadersPayloadTab: React.FC<HeadersPayloadTabProps> = ({ entry }) => {
  const { request, response } = entry;

  return (
    <div className="headers-payload-tab">
      {/* General Section */}
      <section className="info-section">
        <h3>General</h3>
        <div className="info-grid">
          <div className="info-row">
            <span className="info-label">Request URL:</span>
            <span className="info-value">{request.url}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Request Method:</span>
            <span className="info-value method-badge method-{getMethodClass(request.method)}">{request.method}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Status Code:</span>
            <span className="info-value">
              {response.status} {response.statusText}
            </span>
          </div>
          {request.httpVersion && (
            <div className="info-row">
              <span className="info-label">HTTP Version:</span>
              <span className="info-value">{request.httpVersion}</span>
            </div>
          )}
        </div>
      </section>

      {/* Response Headers */}
      {response.headers && response.headers.length > 0 && (
        <section className="info-section">
          <h3>Response Headers</h3>
          <div className="headers-list">
            {response.headers.map((header, index) => (
              <div key={index} className="header-row">
                <span className="header-name">{header.name}:</span>
                <span className="header-value">{header.value}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Request Headers */}
      {request.headers && request.headers.length > 0 && (
        <section className="info-section">
          <h3>Request Headers</h3>
          <div className="headers-list">
            {request.headers.map((header, index) => (
              <div key={index} className="header-row">
                <span className="header-name">{header.name}:</span>
                <span className="header-value">{header.value}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Query String Parameters */}
      {request.queryString && request.queryString.length > 0 && (
        <section className="info-section">
          <h3>Query String Parameters</h3>
          <div className="params-list">
            {request.queryString.map((param, index) => (
              <div key={index} className="param-row">
                <span className="param-name">{param.name}:</span>
                <span className="param-value">{param.value}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Form Data / Post Data */}
      {request.postData && (
        <section className="info-section">
          <h3>Request Payload</h3>
          {request.postData.params && request.postData.params.length > 0 ? (
            <div className="params-list">
              {request.postData.params.map((param: any, index: number) => (
                <div key={index} className="param-row">
                  <span className="param-name">{param.name}:</span>
                  <span className="param-value">{param.value || '(file)'}</span>
                </div>
              ))}
            </div>
          ) : request.postData.text ? (
            <pre className="payload-text">{request.postData.text}</pre>
          ) : null}
          {request.postData.mimeType && (
            <div className="info-row">
              <span className="info-label">Content-Type:</span>
              <span className="info-value">{request.postData.mimeType}</span>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

const getMethodClass = (method: string): string => {
  const m = method.toUpperCase();
  if (m === 'GET') return 'get';
  if (m === 'POST') return 'post';
  if (m === 'PUT') return 'put';
  if (m === 'DELETE') return 'delete';
  if (m === 'PATCH') return 'patch';
  return 'other';
};

export default HeadersPayloadTab;
