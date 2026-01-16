import React from 'react';
import { HarEntry } from 'har-parser';
import './CookiesTab.css';

interface CookiesTabProps {
  request: HarEntry['request'];
  response: HarEntry['response'];
}

const CookiesTab: React.FC<CookiesTabProps> = ({ request, response }) => {
  const requestCookies = request?.cookies || [];
  const responseCookies = response?.cookies || [];

  if (requestCookies.length === 0 && responseCookies.length === 0) {
    return <p>No cookies found.</p>;
  }

  return (
    <div className="cookies-tab">
      {requestCookies.length > 0 && (
        <section className="cookies-section">
          <h3>Request Cookies</h3>
          <div className="cookies-table">
            <div className="cookies-table-header">
              <div className="cookie-cell">Name</div>
              <div className="cookie-cell">Value</div>
              <div className="cookie-cell">Domain</div>
              <div className="cookie-cell">Path</div>
              <div className="cookie-cell">Expires</div>
            </div>
            {requestCookies.map((cookie, index) => (
              <div key={index} className="cookies-table-row">
                <div className="cookie-cell" title={cookie.name}>{cookie.name}</div>
                <div className="cookie-cell" title={cookie.value}>{cookie.value}</div>
                <div className="cookie-cell" title={cookie.domain || ''}>{cookie.domain || '-'}</div>
                <div className="cookie-cell" title={cookie.path || ''}>{cookie.path || '-'}</div>
                <div className="cookie-cell" title={cookie.expires || ''}>
                  {cookie.expires || '-'}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {responseCookies.length > 0 && (
        <section className="cookies-section">
          <h3>Response Cookies (Set-Cookie)</h3>
          <div className="cookies-table">
            <div className="cookies-table-header">
              <div className="cookie-cell">Name</div>
              <div className="cookie-cell">Value</div>
              <div className="cookie-cell">Domain</div>
              <div className="cookie-cell">Path</div>
              <div className="cookie-cell">Expires</div>
              <div className="cookie-cell">HttpOnly</div>
              <div className="cookie-cell">Secure</div>
            </div>
            {responseCookies.map((cookie, index) => (
              <div key={index} className="cookies-table-row">
                <div className="cookie-cell" title={cookie.name}>{cookie.name}</div>
                <div className="cookie-cell" title={cookie.value}>{cookie.value}</div>
                <div className="cookie-cell" title={cookie.domain || ''}>{cookie.domain || '-'}</div>
                <div className="cookie-cell" title={cookie.path || ''}>{cookie.path || '-'}</div>
                <div className="cookie-cell" title={cookie.expires || ''}>
                  {cookie.expires || '-'}
                </div>
                <div className="cookie-cell">{cookie.httpOnly ? 'Yes' : 'No'}</div>
                <div className="cookie-cell">{cookie.secure ? 'Yes' : 'No'}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default CookiesTab;
