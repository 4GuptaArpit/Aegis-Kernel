import React, { useState } from 'react';
import { Layers, ShieldCheck, AlertTriangle, Cpu, Terminal, ArrowRight } from 'lucide-react';
import { sound } from '../utils/audio';

export default function WarpVisualizer({ selectedFixture, isRunning, currentStage }) {
  const [selectedLane, setSelectedLane] = useState(17);
  const [activeMode, setActiveMode] = useState('hardened');

  const isSwiglu = selectedFixture === 'swiglu';
  const isRmsnorm = selectedFixture === 'rmsnorm';

  const boundaryLimit = isSwiglu ? 17 : (isRmsnorm ? 24 : 20);
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
    address: `0x7F4E82${(selectedLane * 4).toString(16).padStart(2, '0').toUpperCase()}`,
    vulnerableState: selectedLane < boundaryLimit 
      ? 'ACTIVE (Coalesced 32-bit Half2 Vector Load)' 
      : '💥 CRITICAL OOB FAULT: Bus Memory Address Segmentation Crash (SIGSEGV 139)',
    hardenedState: selectedLane < boundaryLimit 
      ? 'ACTIVE (@p0 == 1, Vectorized Half2 Load in SRAM)' 
      : '🛡️ PREDICATED (@p0 == 0, Hardware Suppressed, 0.0 Zero Register Invariant)',
    predicateReg: selectedLane < boundaryLimit ? '@p0 = 1 (EXECUTE)' : '@p0 = 0 (MASKED / SUPPRESSED)',
    ptxInstruction: selectedLane < boundaryLimit 
      ? 'ld.global.nc.v2.f16 {%r1, %r2}, [%rd3];' 
      : (effectiveMode === 'vulnerable' ? '💥 ld.global.v2.f16 (Bus Panic)' : '@p0 ld.global.nc.v2.f16 (0 Cycle Mask)'),
    registerValue: selectedLane < boundaryLimit ? '0.8412 + 0.4219j' : (effectiveMode === 'vulnerable' ? 'CORRUPTED MEMORY EXCEPTION' : '0.0000 (Hardware Zero Invariant)')
  };

  return (
    <div className="warp-quantum-card">
      <div className="warp-top-header">
        <div className="warp-title-lockup">
          <div className="warp-halo-icon">
            <Layers size={16} className="text-nvidia" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="warp-title font-mono font-bold">SIMT WARP 0 // 32-THREAD EXECUTION MATRIX</span>
              <span className="warp-arch-tag font-mono">Hopper SM_90a SIMT Sub-Core</span>
            </div>
            <span className="warp-subtitle text-tertiary">Real-Time Lockstep Instruction Scheduler & Hardware Predication</span>
          </div>
        </div>

        {/* Dual Mode Switcher */}
        <div className="warp-switch-cluster font-mono">
          <button
            className={`warp-switch-btn btn-vuln ${effectiveMode === 'vulnerable' ? 'active-vuln' : ''}`}
            onClick={() => handleToggleMode('vulnerable')}
          >
            <AlertTriangle size={12} className="inline mr-1" />
            Unprotected CUDA (Crash)
          </button>
          <button
            className={`warp-switch-btn btn-safe ${effectiveMode === 'hardened' ? 'active-safe' : ''}`}
            onClick={() => handleToggleMode('hardened')}
          >
            <ShieldCheck size={12} className="inline mr-1" />
            Aegis Hardened Triton (Immune)
          </button>
        </div>
      </div>

      {/* 32 Interactive Glowing Hardware Thread Lanes */}
      <div className="warp-threads-matrix">
        {Array.from({ length: 32 }, (_, i) => {
          const isValid = i < boundaryLimit;
          const isSelected = selectedLane === i;
          const isFaulty = !isValid && effectiveMode === 'vulnerable';
          const isMasked = !isValid && effectiveMode === 'hardened';

          let cellClass = 'quantum-thread-lane font-mono';
          if (isSelected) cellClass += ' lane-selected';
          if (isValid) cellClass += ' lane-active';
          else if (isFaulty) cellClass += ' lane-fault-pulse';
          else if (isMasked) cellClass += ' lane-masked-shield';

          return (
            <div
              key={i}
              className={cellClass}
              onClick={() => handleSelectLane(i)}
              title={`Thread Lane ${i}: ${isValid ? 'Active Valid Load' : (isFaulty ? 'Out-of-Bounds Memory Violation' : 'Hardware Predicated Masked')}`}
            >
              <span className="lane-index">T{i}</span>
              <div className="lane-status-icon">
                {isValid && '●'}
                {isFaulty && '▲'}
                {isMasked && '◆'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Warp Legend Bar */}
      <div className="warp-status-legend font-mono text-xs">
        <div className="legend-entry">
          <span className="swatch-quantum swatch-active"></span>
          <span className="text-secondary">Valid Tokens (Lanes 0..{boundaryLimit - 1})</span>
        </div>
        <div className="legend-entry">
          <span className={`swatch-quantum ${effectiveMode === 'vulnerable' ? 'swatch-fault' : 'swatch-masked'}`}></span>
          <span className={effectiveMode === 'vulnerable' ? 'text-coral font-bold' : 'text-nvidia font-bold'}>
            {effectiveMode === 'vulnerable' 
              ? `Illegal OOB Dereference (Lanes ${boundaryLimit}..31) [SIGSEGV 139]` 
              : `Hardware Predicate Masked @p0=0 (Lanes ${boundaryLimit}..31) [0 Clamped]`}
          </span>
        </div>
        <div className="warp-boundary-counter ml-auto">
          Ragged Boundary: Token #{boundaryLimit}
        </div>
      </div>

      {/* Selected Thread Telemetry Inspector */}
      <div className="thread-inspector-hud font-mono">
        <div className="inspector-title-row">
          <div className="lane-badge">
            <span className="text-primary font-bold">THREAD LANE T{selectedThreadInfo.laneId}</span>
            <span className="text-tertiary">/ 32</span>
            <span className={`lane-verdict-pill ${selectedThreadInfo.isValid ? 'pill-valid' : (effectiveMode === 'vulnerable' ? 'pill-fault' : 'pill-masked')}`}>
              {selectedThreadInfo.isValid 
                ? 'IN-BOUNDS LOAD' 
                : (effectiveMode === 'vulnerable' ? 'OOB PAGE FAULT' : 'HARDWARE ZERO-PADDED')}
            </span>
          </div>

          <span className="font-mono text-xs text-azure font-bold">
            Virtual Memory: {selectedThreadInfo.address}
          </span>
        </div>

        <div className="inspector-telemetry-grid">
          <div className="telemetry-item">
            <span className="item-label text-tertiary">Hardware Predicate Register</span>
            <span className={`item-value font-bold ${selectedThreadInfo.isValid ? 'text-nvidia' : (effectiveMode === 'vulnerable' ? 'text-coral' : 'text-amber')}`}>
              {selectedThreadInfo.predicateReg}
            </span>
          </div>

          <div className="telemetry-item">
            <span className="item-label text-tertiary">PTX Assembly Instruction</span>
            <span className="item-value text-primary font-bold">
              {selectedThreadInfo.ptxInstruction}
            </span>
          </div>

          <div className="telemetry-item">
            <span className="item-label text-tertiary">Register Value (SRAM)</span>
            <span className={`item-value font-bold ${selectedThreadInfo.isValid ? 'text-primary' : (effectiveMode === 'vulnerable' ? 'text-coral' : 'text-nvidia')}`}>
              {selectedThreadInfo.registerValue}
            </span>
          </div>

          <div className="telemetry-item">
            <span className="item-label text-tertiary">Memory Bus Status</span>
            <span className="item-value text-secondary text-xs">
              {effectiveMode === 'vulnerable' && !selectedThreadInfo.isValid 
                ? '❌ Unaligned load triggers memory controller bus trap' 
                : (selectedThreadInfo.isValid ? '✓ Coalesced 128-bit memory transaction' : '🛡️ Hardware drops transaction, 0 HBM overhead')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
