import React, { useState } from 'react';
import { Cpu, AlertTriangle, ShieldCheck, Zap, Database } from 'lucide-react';
import { sound } from '../utils/audio';

export default function HopperDieTopology({ currentStage, isRunning, onSelectSm, selectedSm }) {
  // Hopper GH100 has 132 active SMs across 8 GPCs
  const TOTAL_SMS = 132;
  const FAULTING_SM = 14;

  const isFaultStage = currentStage === 'SANDBOX_FAIL' || currentStage === 'RED_ATTACK';
  const isHealedStage = currentStage === 'BLUE_SYNTHESIS' || currentStage === 'VERIFYING' || currentStage === 'COMPLETE';

  const handleSmClick = (idx) => {
    sound.playClick();
    if (onSelectSm) onSelectSm(idx);
  };

  return (
    <div className="die-topology-chassis">
      <div className="die-header-strip">
        <div className="die-title-lockup">
          <Cpu size={14} className="text-nvidia" />
          <span className="die-title font-mono">NVIDIA GH100 SILICON DIE TOPOLOGY // 132 SMs</span>
          <span className="die-gpc-tag font-mono">8 GPCs · 4nm TSMC 4N · 80B Transistors</span>
        </div>

        <div className="die-status-pills font-mono">
          {isFaultStage && (
            <span className="die-pill pill-fault">
              <span className="pulse-dot bg-coral"></span>
              SM 14: MEMORY PAGE TRAP
            </span>
          )}
          {isHealedStage && (
            <span className="die-pill pill-healed">
              <span className="pulse-dot bg-nvidia"></span>
              132/132 SMs: COALESCED PASS
            </span>
          )}
          {!isFaultStage && !isHealedStage && (
            <span className="die-pill pill-idle">
              <span className="pulse-dot bg-azure"></span>
              132 SMs ARMED
            </span>
          )}
        </div>
      </div>

      {/* Memory Bus Ribbon: HBM3e Interconnects */}
      <div className="hbm-bus-interconnect font-mono">
        <div className="hbm-stack">HBM3e STACK 0 [417 GB/s]</div>
        <div className="hbm-stack">HBM3e STACK 1 [417 GB/s]</div>
        <div className="hbm-crossbar">
          <span className={`bus-flow-text ${isFaultStage ? 'text-coral' : 'text-nvidia'}`}>
            ◄ 50MB L2 CROSSBAR INTERCONNECT (3.35 TB/s HIGHWAY) ►
          </span>
        </div>
        <div className="hbm-stack">HBM3e STACK 2 [417 GB/s]</div>
        <div className="hbm-stack">HBM3e STACK 3 [417 GB/s]</div>
      </div>

      {/* Physical 132 SM Die Matrix (11 columns x 12 rows) */}
      <div className="sm-die-grid">
        {Array.from({ length: TOTAL_SMS }, (_, idx) => {
          const isFaulty = idx === FAULTING_SM && isFaultStage;
          const isSelected = selectedSm === idx;
          const isHealed = isHealedStage;

          let smClass = 'sm-die-unit font-mono';
          if (isSelected) smClass += ' sm-selected';
          if (isFaulty) smClass += ' sm-fault';
          else if (isHealed) smClass += ' sm-healed';
          else smClass += ' sm-idle';

          return (
            <div
              key={idx}
              className={smClass}
              onClick={() => handleSmClick(idx)}
              title={`Streaming Multiprocessor SM_${idx}: ${isFaulty ? 'Bus Fault - SIGSEGV 139' : (isHealed ? 'SRAM Fused - 100% Occupancy' : 'Standby')}`}
            >
              <span className="sm-label">{idx}</span>
            </div>
          );
        })}
      </div>

      {/* Live Die Telemetry Strip */}
      <div className="die-footer-strip font-mono text-xs">
        <div className="die-legend-item">
          <span className="die-box-sample bg-die-idle"></span>
          <span className="text-secondary">Standby SM</span>
        </div>
        <div className="die-legend-item">
          <span className="die-box-sample bg-die-fault"></span>
          <span className="text-coral">SM 14 Illegal Access Crash</span>
        </div>
        <div className="die-legend-item">
          <span className="die-box-sample bg-die-healed"></span>
          <span className="text-nvidia">Hardware Predicated Fused Invariant</span>
        </div>
        <div className="die-clock-readout ml-auto text-azure">
          Core Clock: 1,980 MHz · Voltage: 0.85V
        </div>
      </div>
    </div>
  );
}
