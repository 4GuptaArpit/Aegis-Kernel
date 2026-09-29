import React, { useState } from 'react';
import { Cpu, ChevronDown, Volume2, VolumeX, Shield, Radio, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

export default function Header({ 
  hardwareTargets, 
  selectedHardware, 
  setSelectedHardware, 
  isRunning 
}) {
  const [isMuted, setIsMuted] = useState(false);

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) sound.playClick();
  };

  const handleHwChange = (e) => {
    setSelectedHardware(e.target.value);
    sound.playClick();
  };

  return (
    <header className="master-header">
      {/* Brand Identity Lockup */}
      <div className="brand-lockup">
        <div className="brand-logo-mark">
          {/* Authentic Silicon Die-Shot Geometric Shield */}
          <svg className="shield-svg" width="28" height="32" viewBox="0 0 28 32" fill="none">
            <path d="M14 0L0 5.33333V16C0 24.5867 5.97333 30.72 14 32C22.0267 30.72 28 24.5867 28 16V5.33333L14 0Z" fill="url(#shield-gradient)" />
            <path d="M14 3.5L3.5 7.5V15.5C3.5 22.3 8 27.5 14 28.5C20 27.5 24.5 22.3 24.5 15.5V7.5L14 3.5Z" fill="#040711" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
            <path d="M14 8L8 14H12V22L20 13H15L17 8H14Z" fill="#10B981" />
            <defs>
              <linearGradient id="shield-gradient" x1="0" y1="0" x2="28" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#10B981" />
                <stop offset="0.5" stopColor="#6366F1" />
                <stop offset="1" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="brand-text-col">
          <div className="brand-name-row">
            <span className="brand-title">AEGIS-KERNEL</span>
            <span className="brand-release-badge">NEBIUS × NVIDIA GLOBAL</span>
          </div>
          <p className="brand-tagline">
            Autonomous Adversarial GPU Proving Ground & Invariant Synthesis Engine
          </p>
        </div>
      </div>

      {/* Center Architecture Selector */}
      <div className="target-architecture-selector">
        <div className="selector-label-strip">
          <Cpu size={13} className="text-violet shrink-0" />
          <span className="selector-title">TARGET GPU ARCHITECTURE</span>
        </div>

        <div className="selector-dropdown-wrap">
          <select 
            value={selectedHardware}
            onChange={handleHwChange}
            disabled={isRunning}
            className="hw-select-native"
          >
            {hardwareTargets.map(hw => (
              <option key={hw} value={hw}>{hw}</option>
            ))}
          </select>
          <ChevronDown size={14} className="dropdown-chevron-icon" />
        </div>
      </div>

      {/* Cloud Connectivity Hub & Sound Control */}
      <div className="header-status-hub">
        <div className="cloud-node-pill">
          <span className="status-orb orb-emerald"></span>
          <div className="node-text-stack">
            <span className="node-label">NEBIUS CLOUD</span>
            <span className="node-detail">Ephemeral Sandbox Ready</span>
          </div>
        </div>

        <div className="cloud-node-pill">
          <span className="status-orb orb-violet"></span>
          <div className="node-text-stack">
            <span className="node-label">NEMOTRON DUAL-BRAIN</span>
            <span className="node-detail">Ultra 3 + Nano JIT</span>
          </div>
        </div>

        <div className="cloud-node-pill">
          <span className="status-orb orb-cyan"></span>
          <div className="node-text-stack">
            <span className="node-label">TAVILY ORACLE</span>
            <span className="node-detail">Live Architecture Errata</span>
          </div>
        </div>

        {/* Audio Feedback Toggle */}
        <button 
          className="audio-toggle-btn"
          onClick={handleToggleSound}
          title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
        >
          {isMuted ? <VolumeX size={15} className="text-dim" /> : <Volume2 size={15} className="text-emerald" />}
        </button>
      </div>
    </header>
  );
}
