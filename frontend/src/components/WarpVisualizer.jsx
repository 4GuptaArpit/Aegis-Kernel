import React, { useState } from 'react';
import { Cpu, ShieldCheck, AlertTriangle, CheckCircle2, Zap, Layers } from 'lucide-react';
import { sound } from '../utils/audio';

export default function WarpVisualizer({ selectedFixture, isRunning, currentStage }) {
  const [selectedLane, setSelectedLane] = useState(17);
  const [activeMode, setActiveMode] = useState('hardened'); // 'vulnerable' or 'hardened'

  const isSwiglu = selectedFixture === 'swiglu';
  const isRmsnorm = selectedFixture === 'rmsnorm';

  // Sequence length limit for the warp
  const boundaryLimit = isSwiglu ? 17 : (isRmsnorm ? 24 : 20);

  // Auto-switch to vulnerable during RED attack stages
  const isCrashStage = currentStage === 'SANDBOX_FAIL' || currentStage === 'RED_ATTACK';
  const effectiveMode = isCrashStage ? 'vulnerable' : activeMode;

  const handleSelectLane = (idx) => {
    sound.playClick();
    setSelectedLane(idx);
  };

  const handleToggleMode = (mode) => {
    sound.playClick();
    setActiveMode(mode);
  };

  const selectedThreadInfo = {
    laneId: selectedLane,
    isValid: selectedLane < boundaryLimit,
    address: `0x7f4e82${(selectedLane * 4).toString(16).padStart(2, '0')}`,
    vulnerableState: selectedLane < boundaryLimit 
      ? 'ACTIVE (Coalesced 32-bit Half2 Load)' 
      : '💥 FAULT: Illegal Global Memory Dereference (OOB Address)',
    hardenedState: selectedLane < boundaryLimit 
      ? 'ACTIVE (@p0 == 1, Vectorized Half2 Load)' 
      : '🛡️ PREDICATED (@p0 == 0, Hardware Masked 0.0 Register Clamp)',
    predicateReg: selectedLane < boundaryLimit ? '@p0 = 1 (TRUE)' : '@p0 = 0 (FALSE)',
    ptxInstruction: selectedLane < boundaryLimit 
      ? 'ld.global.nc.v2.f16 {%r1, %r2}, [%rd3];' 
      : (effectiveMode === 'vulnerable' ? '💥 ld.global.v2.f16 (Crash)' : '@p0 ld.global.nc (Suppressed)'),
    registerValue: selectedLane < boundaryLimit ? '0.8412 + 0.4219j' : (effectiveMode === 'vulnerable' ? 'CORRUPT / SIGSEGV' : '0.0000 (Hardware Zero)')
  };

  return (
    <div className="warp-visualizer-card">
      <div className="warp-header-row">
        <div className="warp-title-group">
          <Layers size={15} className="text-nvidia" />
          <div className="warp-title-block">
            <span className="warp-title">SIMT WARP 0 EXECUTION & PREDICATION MATRIX</span>
            <span className="warp-sub">32-Thread Hardware Warp Execution on Hopper SM_90a</span>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="warp-mode-toggle">
          <button
            className={`warp-mode-btn btn-mode-vuln ${effectiveMode === 'vulnerable' ? 'active' : ''}`}
            onClick={() => handleToggleMode('vulnerable')}
          >
            <AlertTriangle size={12} className="inline mr-1" />
            Unprotected CUDA
          </button>
          <button
            className={`warp-mode-btn btn-mode-safe ${effectiveMode === 'hardened' ? 'active' : ''}`}
            onClick={() => handleToggleMode('hardened')}
          >
            <ShieldCheck size={12} className="inline mr-1" />
            Aegis Hardened Triton
          </button>
        </div>
      </div>

      {/* Visual 32-Lane Thread Grid */}
      <div className="warp-lanes-matrix">
        {Array.from({ length: 32 }, (_, i) => {
          const isValid = i < boundaryLimit;
          const isSelected = selectedLane === i;
          const isFaulty = !isValid && effectiveMode === 'vulnerable';
          const isMasked = !isValid && effectiveMode === 'hardened';

          let cellClass = 'lane-cell';
          if (isSelected) cellClass += ' lane-selected';
          if (isValid) cellClass += ' lane-valid';
          else if (isFaulty) cellClass += ' lane-fault';
          else if (isMasked) cellClass += ' lane-masked';

          return (
            <div
              key={i}
              className={cellClass}
              onClick={() => handleSelectLane(i)}
              title={`Thread Lane ${i}: ${isValid ? 'Valid Token' : (isFaulty ? 'OOB Illegal Address Fault' : 'Hardware Predicated @p0=0')}`}
            >
              <div className="lane-id-text">T{i}</div>
              <div className="lane-status-indicator">
                {isValid && '✓'}
                {isFaulty && '💥'}
                {isMasked && '🛡️'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Warp Legend Bar */}
      <div className="warp-legend-row">
        <div className="legend-item">
          <span className="legend-swatch swatch-valid"></span>
          <span className="text-secondary text-xs">Active Threads (0..{boundaryLimit - 1})</span>
        </div>
        <div className="legend-item">
          <span className={`legend-swatch ${effectiveMode === 'vulnerable' ? 'swatch-fault' : 'swatch-masked'}`}></span>
          <span className="text-secondary text-xs">
            {effectiveMode === 'vulnerable' 
              ? `Illegal OOB Memory Dereference (${boundaryLimit}..31) [SIGSEGV 139]` 
              : `Hardware Predicate Masked (@p0=0) (${boundaryLimit}..31) [0 Clamped]`}
          </span>
        </div>
        <div className="warp-boundary-tag font-mono">
          Boundary Limit: Token #{boundaryLimit}
        </div>
      </div>

      {/* Interactive Thread Lane Inspector Details */}
      <div className="lane-inspector-panel">
        <div className="inspector-top-row">
          <div className="inspector-lane-badge">
            <span className="font-mono text-nvidia font-bold">LANE T{selectedThreadInfo.laneId}</span>
            <span className="text-tertiary">/ 32</span>
            <span className={`status-pill-lane ${selectedThreadInfo.isValid ? 'pill-valid' : (effectiveMode === 'vulnerable' ? 'pill-fault' : 'pill-masked')}`}>
              {selectedThreadInfo.isValid 
                ? 'IN-BOUNDS LOAD' 
                : (effectiveMode === 'vulnerable' ? 'OUT-OF-BOUNDS CRASH' : 'HARDWARE ZERO-PADDED')}
            </span>
          </div>

          <span className="font-mono text-xs text-azure">
            Addr: {selectedThreadInfo.address}
          </span>
        </div>

        <div className="inspector-grid">
          <div className="inspector-item">
            <span className="item-label">Hardware Predicate Register</span>
            <span className={`item-val font-mono ${selectedThreadInfo.isValid ? 'text-nvidia' : (effectiveMode === 'vulnerable' ? 'text-coral' : 'text-amber')}`}>
              {selectedThreadInfo.predicateReg}
            </span>
          </div>

          <div className="inspector-item">
            <span className="item-label">PTX Assembly Sched</span>
            <span className="item-val font-mono text-primary">
              {selectedThreadInfo.ptxInstruction}
            </span>
          </div>

          <div className="inspector-item">
            <span className="item-label">SRAM Register Value</span>
            <span className={`item-val font-mono ${selectedThreadInfo.isValid ? 'text-primary' : (effectiveMode === 'vulnerable' ? 'text-coral' : 'text-nvidia')}`}>
              {selectedThreadInfo.registerValue}
            </span>
          </div>

          <div className="inspector-item">
            <span className="item-label">Memory Transaction Action</span>
            <span className="item-val text-secondary text-xs">
              {effectiveMode === 'vulnerable' && !selectedThreadInfo.isValid 
                ? '❌ Unaligned PCIe/HBM load triggers bus error' 
                : (selectedThreadInfo.isValid ? '✓ Coalesced 128-bit memory transaction' : '🛡️ Hardware drops transaction, zero HBM traffic')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
