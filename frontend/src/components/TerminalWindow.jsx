import React, { useState, useRef, useEffect } from 'react';
import { Terminal, FileCode, Copy, Trash2, ArrowDownCircle } from 'lucide-react';
import { sound } from '../utils/audio';

export default function TerminalWindow({ logs, onClear }) {
  const [activeTab, setActiveTab] = useState('live');
  const [autoScroll, setAutoScroll] = useState(true);
  const terminalEndRef = useRef(null);

  useEffect(() => {
    if (autoScroll) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const handleCopyLogs = () => {
    sound.playClick();
    const text = logs.map(l => l.text).join('\n');
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="stitch-card terminal-card">
      {/* Terminal Title Bar */}
      <div className="terminal-top-bar">
        <div className="terminal-controls-group">
          {/* macOS window control dots */}
          <div className="mac-dots">
            <span className="mac-dot dot-close"></span>
            <span className="mac-dot dot-min"></span>
            <span className="mac-dot dot-max"></span>
          </div>

          {/* Terminal Tabs */}
          <div className="terminal-tabs">
            <button 
              className={`terminal-tab ${activeTab === 'live' ? 'active' : ''}`}
              onClick={() => setActiveTab('live')}
            >
              <FileCode size={12} className="tab-icon" />
              <span>live_run.sh</span>
            </button>

            <button 
              className={`terminal-tab ${activeTab === 'crash' ? 'active' : ''}`}
              onClick={() => setActiveTab('crash')}
            >
              <span>crash_dump.log</span>
            </button>
          </div>
        </div>

        {/* Right Status Indicator */}
        <div className="terminal-status-strip">
          <span className="tty-indicator">
            <span className="stitch-dot dot-green"></span>
            nebius-h100-node-04 (LIVE TTY)
          </span>

          <div className="terminal-btn-group">
            <button 
              className="term-mini-btn" 
              onClick={handleCopyLogs} 
              title="Copy Output"
            >
              <Copy size={12} />
            </button>
            <button 
              className="term-mini-btn" 
              onClick={onClear} 
              title="Clear Terminal"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Terminal Viewport */}
      <div className="terminal-viewport">
        {activeTab === 'live' ? (
          <>
            <div className="term-line line-info">
              <span className="term-ts">[00:00.012]</span> <span className="term-tag text-cyan">[PROVING-GROUND]</span> Initializing isolated Nebius Container Pod on NVIDIA H100 SXM5 80GB...
            </div>
            <div className="term-line line-info">
              <span className="term-ts">[00:00.180]</span> <span className="term-tag text-purple">[ADVERSARY-FUZZ]</span> Generating jagged token stream: <span className="text-amber">tokens=[17, 3, 4099, 1]</span> (Warp size 32 misalignment)
            </div>

            {/* Glowing Crimson Exception Box from Stitch */}
            <div className="term-crimson-box">
              <span className="term-ts">[00:00.412]</span> <span className="text-red font-bold">❌ CUDA EXCEPTION</span> <span className="text-white font-bold">SIGSEGV (139):</span> Invalid Global Memory Address at offset +128B (SM 14, Warp 4)
            </div>

            <div className="term-line line-info">
              <span className="term-ts">[00:00.640]</span> <span className="term-tag text-violet">[NEMOTRON-70B]</span> Fault localized: Tail warp execution lacks bounds
            </div>

            {/* Dynamic Real-Time Appended Logs */}
            {logs.map((log, idx) => (
              <div key={idx} className={`term-line line-${log.type}`}>
                {log.text}
              </div>
            ))}
          </>
        ) : (
          <div className="term-crash-view">
            <div className="term-line text-red">*** HARDWARE CORE DUMP (NVIDIA H100 SXM5 - CUDA 12.4) ***</div>
            <div className="term-line text-dim">Thread 31 in Warp 4 of Block 127 faulted on address 0x7f8b4a200000</div>
            <div className="term-line text-dim">MMU Translation Fault: Address not mapped in active virtual memory tables.</div>
            <div className="term-line text-dim">Active Registers: R0=0x00000011 R1=0x7f8b4a1fffc0 R2=0x00000040</div>
          </div>
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}
