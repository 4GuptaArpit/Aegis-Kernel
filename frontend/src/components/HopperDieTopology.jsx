import React, { useState } from 'react';
import { Cpu, AlertTriangle, ShieldCheck, Zap, Database, Layers } from 'lucide-react';
import { sound } from '../utils/audio';

export default function HopperDieTopology({ currentStage, isRunning, onSelectSm, selectedSm }) {
  const TOTAL_SMS = 132;
  const FAULTING_SM = 14;

  const isFaultStage = currentStage === 'SANDBOX_FAIL' || currentStage === 'RED_ATTACK';
  const isHealedStage = currentStage === 'BLUE_SYNTHESIS' || currentStage === 'VERIFYING' || currentStage === 'COMPLETE';

  const handleSmClick = (idx) => {
    sound.playClick();
    if (onSelectSm) onSelectSm(idx);
  };

  return (
    <div className="holographic-die-chassis">
      {/* Top Holographic Scanline Bar */}
      <div className="die-header-strip">
        <div className="die-title-lockup">
          <div className="die-icon-halo">
            <Cpu size={16} className="text-nvidia" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="die-title font-mono font-bold">NVIDIA GH100 SILICON DIE TOPOLOGY</span>
              <span className="die-gpc-pill font-mono">132 SMs · 8 GPCs · TSMC 4N</span>
            </div>
            <span className="die-subtext text-tertiary">Real-Time Core Interconnect & Warp Dispatch Grid</span>
          </div>
        </div>

        <div className="die-status-pills font-mono">
          {isFaultStage && (
            <span className="die-pill pill-fault animate-pulse">
              <span className="pulse-dot bg-coral"></span>
              CRITICAL: SM 14 MMU PAGE TRAP
            </span>
          )}
          {isHealedStage && (
            <span className="die-pill pill-healed">
              <span className="pulse-dot bg-nvidia"></span>
              ALL 132 SMs: ZERO-PENALTY PREDICATION
            </span>
          )}
          {!isFaultStage && !isHealedStage && (
            <span className="die-pill pill-idle">
              <span className="pulse-dot bg-azure"></span>
              132 SMs DISPATCH READY
            </span>
          )}
        </div>
      </div>

      {/* Holographic Circuit Traces & HBM3e Memory Highway */}
      <div className="hbm-highway-container font-mono">
        <div className="hbm-bank bank-left">
          <div className="hbm-chip-node">
            <span className="text-azure">HBM3e #0</span>
            <span className="text-tertiary text-xs">834 GB/s</span>
          </div>
          <div className="hbm-chip-node">
            <span className="text-azure">HBM3e #1</span>
            <span className="text-tertiary text-xs">834 GB/s</span>
          </div>
        </div>

        <div className={`highway-crossbar ${isRunning ? 'highway-active' : ''}`}>
          <div className="crossbar-laser-beam"></div>
          <div className="crossbar-label-strip">
            <span className="text-azure">◄◄ 50MB HIGH-SPEED L2 CACHE CROSSBAR (3.35 TB/s HIGHWAY) ►►</span>
            <span className={`crossbar-status ${isFaultStage ? 'text-coral' : 'text-nvidia'}`}>
              {isFaultStage ? 'BUS PANIC: UNALIGNED TRANSACTION HALTED' : 'WARP STREAM: 128-BIT COALESCED'}
            </span>
          </div>
        </div>

        <div className="hbm-bank bank-right">
          <div className="hbm-chip-node">
            <span className="text-azure">HBM3e #2</span>
            <span className="text-tertiary text-xs">834 GB/s</span>
          </div>
          <div className="hbm-chip-node">
            <span className="text-azure">HBM3e #3</span>
            <span className="text-tertiary text-xs">834 GB/s</span>
          </div>
        </div>
      </div>

      {/* 3D-Styled 132-SM Physical Silicon Die Grid */}
      <div className="holographic-sm-grid">
        {Array.from({ length: TOTAL_SMS }, (_, idx) => {
          const isFaulty = idx === FAULTING_SM && isFaultStage;
          const isSelected = selectedSm === idx;
          const isHealed = isHealedStage;

          let smClass = 'sm-core-cell font-mono';
          if (isSelected) smClass += ' sm-selected';
          if (isFaulty) smClass += ' sm-fault';
          else if (isHealed) smClass += ' sm-healed';
          else smClass += ' sm-idle';

          return (
            <div
              key={idx}
              className={smClass}
              onClick={() => handleSmClick(idx)}
              title={`SM_${idx}: ${isFaulty ? 'Bus Fault - SIGSEGV 139' : (isHealed ? 'SRAM Fused - 100% Occupancy' : 'Standby Core')}`}
            >
              <span className="sm-idx">{idx}</span>
              {isFaulty && <span className="sm-alert-dot"></span>}
            </div>
          );
        })}
      </div>

      {/* Live Die Telemetry Strip */}
      <div className="die-footer-telemetry font-mono text-xs">
        <div className="legend-strip">
          <div className="legend-node">
            <span className="node-box box-idle"></span>
            <span className="text-tertiary">Active SM Core</span>
          </div>
          <div className="legend-node">
            <span className="node-box box-fault"></span>
            <span className="text-coral font-bold">SM 14 OOB Trap</span>
          </div>
          <div className="legend-node">
            <span className="node-box box-healed"></span>
            <span className="text-nvidia font-bold">Triton Predicated Shield</span>
          </div>
        </div>

        <div className="die-clock-cluster ml-auto">
          <span className="text-tertiary">Hopper Engine Clock:</span>
          <span className="text-nvidia font-bold">1,980 MHz</span>
          <span className="text-tertiary">· TMA Latency:</span>
          <span className="text-azure font-bold">18 Cycles</span>
        </div>
      </div>
    </div>
  );
}
