import React, { useState } from 'react';
import { HarEntry } from 'har-parser';
import HeadersPayloadTab from './tabs/HeadersPayloadTab';
import PreviewTab from './tabs/PreviewTab';
import ResponseTab from './tabs/ResponseTab';
import TimingTab from './tabs/TimingTab';
import CookiesTab from './tabs/CookiesTab';
import './DetailPane.css';

interface DetailPaneProps {
  entry: HarEntry & { id: string } | null; // Full HAR Entry object with an ID
}

type TabType = 'headers-payload' | 'preview' | 'response' | 'timing' | 'cookies';

const DetailPane: React.FC<DetailPaneProps> = ({ entry }) => {
  const [activeTab, setActiveTab] = useState<TabType>('headers-payload');

  if (!entry) {
    return <p>Select an entry to view details.</p>;
  }

  const tabs: { id: TabType; label: string }[] = [
    { id: 'headers-payload', label: 'Headers & Payload' },
    { id: 'preview', label: 'Preview' },
    { id: 'response', label: 'Response' },
    { id: 'timing', label: 'Timing' },
    { id: 'cookies', label: 'Cookies' },
  ];

  return (
    <div className="detail-pane">
      <h2>Entry Details (ID: {entry.id})</h2>

      <div className="tabs">
        <div className="tab-headers">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-header ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="tab-content">
          {activeTab === 'headers-payload' && <HeadersPayloadTab entry={entry} />}
          {activeTab === 'preview' && <PreviewTab response={entry.response} />}
          {activeTab === 'response' && <ResponseTab response={entry.response} />}
          {activeTab === 'timing' && <TimingTab timings={entry.timings} startedDateTime={entry.startedDateTime} time={entry.time} />}
          {activeTab === 'cookies' && <CookiesTab request={entry.request} response={entry.response} />}
        </div>
      </div>
    </div>
  );
};

export default DetailPane;
