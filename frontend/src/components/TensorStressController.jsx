import React, { useState } from 'react';
import { Sliders, AlertTriangle, ShieldCheck, Gauge, Zap, Binary } from 'lucide-react';
import { sound } from '../utils/audio';

export default function TensorStressController({ onStressChange, selectedFixture }) {
  const [seqLen, setSeqLen] = useState(1023);
  const [batchSize, setBatchSize] = useState(4);
  const [hiddenDim, setHiddenDim] = useState(4096);

  const isRagged = seqLen % 32 !== 0;
  const tailThreads = seqLen % 32;
  const unmaskedOOB = isRagged ? 32 - tailThreads : 0;
  const activeWarps = Math.ceil((seqLen * batchSize) / 32);

  const handleSliderChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setSeqLen(val);
    if (val % 32 === 0) sound.playClick();
    if (onStressChange) onStressChange(val);
  };

  return (
    <div className="tensor-stress-chassis">
      <div className="stress-top-header">
        <div className="stress-title-group">
          <Sliders size={14} className="text-nvidia" />
          <span className="stress-title font-mono">LIVE ADVERSARIAL TENSOR STRESS & RAGGED BOUNDARY CONTROLLER</span>
        </div>
        <div className="stress-status-pills font-mono">
          {isRagged ? (
            <span className="stress-pill pill-ragged">
              <AlertTriangle size={11} className="inline mr-1 text-coral" />
              RAGGED BOUNDARY (seq_len % 32 = {tailThreads})
            </span>
          ) : (
            <span className="stress-pill pill-aligned">
              <ShieldCheck size={11} className="inline mr-1 text-nvidia" />
              COALESCED 32-WARP ALIGNED
            </span>
          )}
        </div>
      </div>

      {/* Main Interactive Controls Row */}
      <div className="stress-controls-grid">
        {/* Slider Box */}
        <div className="slider-control-box">
          <div className="slider-label-row font-mono">
            <span className="text-secondary text-xs">DYNAMIC SEQUENCE LENGTH:</span>
            <span className="font-bold text-sm font-mono text-primary">
              {seqLen} <span className="text-tertiary text-xs">tokens</span>
            </span>
            <span className="ml-auto font-mono text-xs text-azure">
              {isRagged ? `⚠️ ${unmaskedOOB} OOB Lanes Trapped` : '✓ 128-bit Clean'}
            </span>
          </div>

          <input 
            type="range" 
            min="128" 
            max="2048" 
            step="1"
            value={seqLen} 
            onChange={handleSliderChange}
            className="hardware-slider"
          />

          <div className="slider-ticks font-mono text-xs text-tertiary">
            <span>128 (Aligned)</span>
            <span>512</span>
            <span className="text-coral">1023 (Adversarial Target)</span>
            <span>1024</span>
            <span>2048</span>
          </div>
        </div>

        {/* Quick Microarchitectural Quick Stats */}
        <div className="stress-stats-strip font-mono">
          <div className="stress-stat-item">
            <span className="stat-k text-tertiary">WARP DISPATCH:</span>
            <span className="stat-v text-primary">{activeWarps} Active Warps</span>
          </div>
          <div className="stress-stat-item">
            <span className="stat-k text-tertiary">TAIL OCCUPANCY:</span>
            <span className={`stat-v ${isRagged ? 'text-amber' : 'text-nvidia'}`}>
              {tailThreads}/32 Threads ({((tailThreads / 32) * 100).toFixed(0)}%)
            </span>
          </div>
          <div className="stress-stat-item">
            <span className="stat-k text-tertiary">PYTORCH RAW CUDA:</span>
            <span className={`stat-v ${isRagged ? 'text-coral font-bold' : 'text-nvidia'}`}>
              {isRagged ? '💥 SIGSEGV 139 (Bus Crash)' : 'Passing (Accidental)'}
            </span>
          </div>
          <div className="stress-stat-item">
            <span className="stat-k text-tertiary">AEGIS TRITON:</span>
            <span className="stat-v text-nvidia font-bold">
              🛡️ Hardware Predicated (@p0 Masked)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
