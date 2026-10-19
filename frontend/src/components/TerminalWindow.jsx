import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Copy, Trash2, Search, Check, ShieldAlert } from 'lucide-react';
import { sound } from '../utils/audio';

export default function TerminalWindow({ logs, onClear }) {
  const [filterQuery, setFilterQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [copied, setCopied] = useState(false);
  const terminalEndRef = useRef(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleCopyLogs = () => {
    sound.playClick();
    const text = logs.map(l => l.text).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredLogs = logs.filter(log => {
    const matchesQuery = filterQuery === '' || log.text.toLowerCase().includes(filterQuery.toLowerCase());
    if (!matchesQuery) return false;
    if (activeFilter === 'alert') return log.type === 'alert' || log.text.includes('SIGSEGV') || log.text.includes('Exit');
    if (activeFilter === 'success') return log.type === 'success' || log.text.includes('Verified') || log.text.includes('Hardened');
    return true;
  });

  return (
    <div className="terminal-master-card">
      {/* Terminal Title Bar */}
      <div className="terminal-header-strip">
        <div className="terminal-title-left">
          <Terminal size={14} className="text-nvidia" />
          <span className="terminal-title">LIVE SANDBOX & ADVERSARIAL TELEMETRY</span>
          <span className="terminal-host-tag">nebius-h100-node-04 (TTY)</span>
        </div>

        {/* Filter Pills */}
        <div className="terminal-filters-row">
          <button 
            className={`term-filter-pill ${activeFilter === 'all' ? 'pill-active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All Logs ({logs.length})
          </button>
          <button 
            className={`term-filter-pill ${activeFilter === 'alert' ? 'pill-active' : ''}`}
            onClick={() => setActiveFilter('alert')}
          >
            Adversary Alerts
          </button>
          <button 
            className={`term-filter-pill ${activeFilter === 'success' ? 'pill-active' : ''}`}
            onClick={() => setActiveFilter('success')}
          >
            Verification
          </button>
        </div>

        {/* Search & Actions */}
        <div className="terminal-actions-group">
          <div className="terminal-search-box">
            <Search size={12} className="text-tertiary" />
            <input 
              type="text" 
              placeholder="Filter telemetry..." 
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="term-search-input"
            />
          </div>

          <button className="term-btn" onClick={handleCopyLogs} title="Copy All Terminal Output">
            {copied ? <Check size={13} className="text-nvidia" /> : <Copy size={13} />}
          </button>
          <button className="term-btn" onClick={onClear} title="Clear Terminal Logs">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Terminal Viewport */}
      <div className="terminal-viewport">
        {filteredLogs.length === 0 ? (
          <div className="terminal-empty-state">
            <span className="text-nvidia font-mono">[READY]</span>
            <span className="text-secondary ml-2 font-mono">
              Aegis-Kernel Proving Ground initialized. Ready for execution. Click 'RUN PROVING GROUND' above to initiate red-blue loop.
            </span>
          </div>
        ) : (
          filteredLogs.map((log, idx) => {
            const isAlert = log.type === 'alert' || log.text.includes('SIGSEGV') || log.text.includes('139') || log.text.includes('CRIMSON');
            const isSuccess = log.type === 'success' || log.text.includes('Verified') || log.text.includes('100%');
            return (
              <div 
                key={idx} 
                className={`terminal-line ${isAlert ? 'line-alert' : ''} ${isSuccess ? 'line-success' : ''}`}
              >
                {isAlert && <ShieldAlert size={13} className="inline mr-1 text-coral" />}
                <span className="log-text font-mono">{log.text}</span>
              </div>
            );
          })
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}
