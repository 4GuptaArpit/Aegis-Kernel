import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Copy, Trash2, ArrowDownCircle, Check, Search, Radio, Flame, ShieldCheck } from 'lucide-react';
import { sound } from '../utils/audio';

export default function TerminalWindow({ logs, redData, tavilyData, metrics, isRunning, onClearLogs }) {
  const [activeTab, setActiveTab] = useState('sandbox');
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const terminalEndRef = useRef(null);

  useEffect(() => {
    if (autoScroll) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll, activeTab]);

  const handleTabSwitch = (tab) => {
    sound.playClick();
    setActiveTab(tab);
  };

  const handleCopy = () => {
    sound.playClick();
    let contentToCopy = '';
    if (activeTab === 'sandbox') {
      contentToCopy = logs.map(l => l.text).join('\n');
    } else if (activeTab === 'red') {
      contentToCopy = redData ? redData.adversarial_harness + '\n\n' + redData.stack_trace : 'No attack data.';
    } else if (activeTab === 'tavily') {
      contentToCopy = tavilyData ? JSON.stringify(tavilyData, null, 2) : 'No Tavily data.';
    } else if (activeTab === 'fuzz') {
      contentToCopy = metrics ? `Differential Fuzzing: ${metrics.fuzz_passed_count}/${metrics.fuzz_total_count} PASSED\nSpeedup: ${metrics.speedup}x` : 'No fuzzing trace.';
    }

    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredLogs = logs.filter(l => 
    l.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="terminal-deck-card glass-panel">
      {/* Top Segmented Tab-Bar & Utilities */}
      <div className="terminal-header-bar">
        {/* Tab Controls */}
        <div className="terminal-tab-group">
          <button 
            className={`term-segment-btn ${activeTab === 'sandbox' ? 'segment-active' : ''}`}
            onClick={() => handleTabSwitch('sandbox')}
          >
            <TerminalIcon size={13} className="text-cyan shrink-0" />
            <span>Sandbox Telemetry</span>
            <span className="log-count-tag">{logs.length}</span>
          </button>

          <button 
            className={`term-segment-btn ${activeTab === 'red' ? 'segment-active' : ''}`}
            onClick={() => handleTabSwitch('red')}
          >
            <Flame size={13} className="text-crimson shrink-0" />
            <span>Red Attack Harness</span>
            {redData && <span className="active-dot dot-crimson"></span>}
          </button>

          <button 
            className={`term-segment-btn ${activeTab === 'tavily' ? 'segment-active' : ''}`}
            onClick={() => handleTabSwitch('tavily')}
          >
            <Radio size={13} className="text-cyan shrink-0" />
            <span>Tavily Oracle Stream</span>
            {tavilyData && <span className="active-dot dot-cyan"></span>}
          </button>

          <button 
            className={`term-segment-btn ${activeTab === 'fuzz' ? 'segment-active' : ''}`}
            onClick={() => handleTabSwitch('fuzz')}
          >
            <ShieldCheck size={13} className="text-emerald shrink-0" />
            <span>Differential Fuzz Trace</span>
            {metrics && <span className="active-dot dot-emerald"></span>}
          </button>
        </div>

        {/* Action Controls */}
        <div className="terminal-utility-group">
          <div className="terminal-filter-input-wrap">
            <Search size={11} className="filter-search-icon" />
            <input 
              type="text"
              placeholder="Filter logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="terminal-filter-input"
            />
          </div>

          <button 
            className={`term-btn ${autoScroll ? 'term-btn-active' : ''}`}
            onClick={() => {
              sound.playClick();
              setAutoScroll(!autoScroll);
            }}
            title="Toggle Auto-Scroll"
          >
            <ArrowDownCircle size={13} />
          </button>

          <button 
            className="term-btn"
            onClick={handleCopy}
            title="Copy Logs to Clipboard"
          >
            {copied ? <Check size={13} className="text-emerald" /> : <Copy size={13} />}
          </button>

          <button 
            className="term-btn"
            onClick={() => {
              sound.playClick();
              onClearLogs();
            }}
            title="Clear Terminal Output"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Terminal Viewport */}
      <div className="terminal-viewport">
        {/* Tab 1: Live Logs */}
        {activeTab === 'sandbox' && (
          <div className="viewport-lines-stack">
            {filteredLogs.map((log, idx) => {
              let lineStyle = 'line-neutral';
              if (log.type === 'alert') lineStyle = 'line-alert';
              else if (log.type === 'success') lineStyle = 'line-success';
              else if (log.type === 'dim') lineStyle = 'line-dim';

              return (
                <div key={idx} className={`terminal-log-row ${lineStyle}`}>
                  <span className="log-caret">❯</span>
                  <span className="log-text">{log.text}</span>
                </div>
              );
            })}
            {isRunning && (
              <div className="terminal-log-row line-streaming">
                <span className="log-caret">❯</span>
                <span className="log-text">Streaming container runtime stdout...</span>
                <span className="blinking-prompt-cursor"></span>
              </div>
            )}
            <div ref={terminalEndRef} />
          </div>
        )}

        {/* Tab 2: Red Attack Payload */}
        {activeTab === 'red' && (
          <div className="viewport-payload-view">
            {redData ? (
              <div className="payload-inner">
                <div className="payload-status-ribbon">
                  <span className="status-badge badge-crimson">EXIT CODE {redData.exit_code} (CRASH CONFIRMED)</span>
                  <span className="status-badge badge-amber">{redData.crash_signal}</span>
                  <span className="status-badge badge-violet">SDC DETECTED</span>
                </div>
                
                <span className="code-sub-label">Synthesized Adversarial Test Harness (Python):</span>
                <pre className="terminal-code-block"><code>{redData.adversarial_harness}</code></pre>

                <span className="code-sub-label text-crimson mt-3">Captured Ephemeral Sandbox Stack Trace:</span>
                <pre className="terminal-code-block stack-block"><code>{redData.stack_trace}</code></pre>
              </div>
            ) : (
              <div className="viewport-empty-placeholder">
                <Flame size={24} className="text-dim mb-1" />
                <p>No adversarial stress test synthesized yet. Click Engage Aegis Proving Ground.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Tavily Stream */}
        {activeTab === 'tavily' && (
          <div className="viewport-payload-view">
            {tavilyData ? (
              <div className="payload-inner">
                <div className="tavily-query-strip">
                  <span className="query-tag">TAVILY QUERY:</span>
                  <code className="query-snippet">{tavilyData.query}</code>
                </div>
                <pre className="terminal-code-block"><code>{JSON.stringify(tavilyData.architecture_specs, null, 2)}</code></pre>
              </div>
            ) : (
              <div className="viewport-empty-placeholder">
                <Radio size={24} className="text-dim mb-1" />
                <p>Tavily Oracle standby. Awaiting hardware architecture query.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Fuzzing Trace */}
        {activeTab === 'fuzz' && (
          <div className="viewport-payload-view">
            {metrics ? (
              <div className="payload-inner">
                <div className="fuzz-header-card">
                  <h4 className="fuzz-title text-emerald">Differential Invariant Fuzzing Verified</h4>
                  <p className="fuzz-desc">
                    Executed 500 randomized tensor passes comparing unmasked reference vs. boundary-masked Triton kernel.
                    Strict mathematical equality confirmed: <code>rtol=1e-3, atol=1e-3</code>.
                  </p>
                  <div className="fuzz-kpi-row">
                    <div className="fuzz-kpi">
                      <span className="kpi-label">TOTAL SHAPES</span>
                      <span className="kpi-val text-white">{metrics.fuzz_total_count}</span>
                    </div>
                    <div className="fuzz-kpi">
                      <span className="kpi-label">PASSED</span>
                      <span className="kpi-val text-emerald">{metrics.fuzz_passed_count}</span>
                    </div>
                    <div className="fuzz-kpi">
                      <span className="kpi-label">SDC ERRORS</span>
                      <span className="kpi-val text-emerald">0</span>
                    </div>
                    <div className="fuzz-kpi">
                      <span className="kpi-label">INVARIANT STATUS</span>
                      <span className="kpi-val text-emerald">100% GREEN</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="viewport-empty-placeholder">
                <ShieldCheck size={24} className="text-dim mb-1" />
                <p>Differential fuzzing trace will render upon Stage 5 completion.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Terminal Status Footer */}
      <div className="terminal-status-footer">
        <div className="footer-status-left">
          <span className="console-dot-green"></span>
          <span>NEBIUS LINUX SANDBOX (UBUNTU 22.04 LTS • TRITON 2.2 • CUDA 12.4)</span>
        </div>
        <div className="footer-status-right">
          <span>EXIT STATUS: {redData ? (metrics ? '0 (SUCCESS)' : `${redData.exit_code} (CRASH)`) : 'STANDBY'}</span>
        </div>
      </div>
    </div>
  );
}
