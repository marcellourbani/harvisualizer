import React from 'react';
import { HarEntry } from 'har-parser';
import './TimingTab.css';

interface TimingTabProps {
  timings: HarEntry['timings'];
  startedDateTime: string;
  time: number;
}

const TimingTab: React.FC<TimingTabProps> = ({ timings, startedDateTime, time }) => {
  if (!timings) {
    return <p>No timing information available.</p>;
  }

  const timingPhases = [
    { label: 'Blocked', value: timings.blocked || 0, color: '#ccc' },
    { label: 'DNS Lookup', value: timings.dns || 0, color: '#4CAF50' },
    { label: 'Connecting', value: timings.connect || 0, color: '#FFC107' },
    { label: 'SSL/TLS', value: timings.ssl || 0, color: '#9C27B0' },
    { label: 'Sending', value: timings.send, color: '#2196F3' },
    { label: 'Waiting (TTFB)', value: timings.wait, color: '#FF9800' },
    { label: 'Receiving', value: timings.receive, color: '#4CAF50' },
  ].filter(phase => phase.value > 0);

  const totalTime = time;
  const maxTime = Math.max(totalTime, 1);

  return (
    <div className="timing-tab">
      <section className="timing-info">
        <h3>Request Timing</h3>
        <div className="info-row">
          <span className="info-label">Started:</span>
          <span className="info-value">{new Date(startedDateTime).toLocaleString()}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Total Time:</span>
          <span className="info-value">{totalTime.toFixed(2)} ms</span>
        </div>
      </section>

      <section className="timing-visualization">
        <h3>Timing Breakdown</h3>
        <div className="timing-bar-container">
          {timingPhases.map((phase, index) => {
            const widthPercent = (phase.value / maxTime) * 100;
            return (
              <div key={index} className="timing-bar-wrapper">
                <div className="timing-label">{phase.label}</div>
                <div className="timing-bar-track">
                  <div
                    className="timing-bar"
                    style={{
                      width: `${widthPercent}%`,
                      backgroundColor: phase.color,
                    }}
                  />
                </div>
                <div className="timing-value">{phase.value.toFixed(2)} ms</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="timing-details">
        <h3>Detailed Timings</h3>
        <div className="timing-list">
          {timings.blocked !== undefined && timings.blocked >= 0 && (
            <div className="timing-row">
              <span className="timing-name">Blocked:</span>
              <span className="timing-val">{timings.blocked.toFixed(2)} ms</span>
            </div>
          )}
          {timings.dns !== undefined && timings.dns >= 0 && (
            <div className="timing-row">
              <span className="timing-name">DNS Lookup:</span>
              <span className="timing-val">{timings.dns.toFixed(2)} ms</span>
            </div>
          )}
          {timings.connect !== undefined && timings.connect >= 0 && (
            <div className="timing-row">
              <span className="timing-name">Connecting:</span>
              <span className="timing-val">{timings.connect.toFixed(2)} ms</span>
            </div>
          )}
          {timings.ssl !== undefined && timings.ssl >= 0 && (
            <div className="timing-row">
              <span className="timing-name">SSL/TLS:</span>
              <span className="timing-val">{timings.ssl.toFixed(2)} ms</span>
            </div>
          )}
          {timings.send >= 0 && (
            <div className="timing-row">
              <span className="timing-name">Sending:</span>
              <span className="timing-val">{timings.send.toFixed(2)} ms</span>
            </div>
          )}
          {timings.wait >= 0 && (
            <div className="timing-row">
              <span className="timing-name">Waiting (TTFB):</span>
              <span className="timing-val">{timings.wait.toFixed(2)} ms</span>
            </div>
          )}
          {timings.receive >= 0 && (
            <div className="timing-row">
              <span className="timing-name">Receiving:</span>
              <span className="timing-val">{timings.receive.toFixed(2)} ms</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default TimingTab;
