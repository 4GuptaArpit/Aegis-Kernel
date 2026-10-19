import React, { useState } from 'react';
import { Shield, Sparkles, Cpu, Zap, Volume2, VolumeX, GitPullRequest, ChevronDown } from 'lucide-react';
import { sound } from '../utils/audio';

export default function Header({ 
  selectedHardware,
  onSelectHardware,
  onOpenPitch, 
  onOpenPrModal 
}) {
  const [isMuted, setIsMuted] = useState(false);
  const [hwDropdownOpen, setHwDropdownOpen] = useState(false);

  const hardwareOptions = [
    { id: 'NVIDIA Hopper H100 SXM5', label: 'Hopper H100 SXM5', spec: '80GB · SM_90a · 3.35 TB/s' },
    { id: 'NVIDIA Ada Lovelace L40S', label: 'Ada Lovelace L40S', spec: '48GB · SM_89 · 864 GB/s' },
    { id: 'NVIDIA Blackwell B200', label: 'Blackwell B200', spec: '192GB · SM_100 · 8.0 TB/s' }
  ];

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) sound.playClick();
  };

  const handleSelectHw = (hwId) => {
    sound.playClick();
    onSelectHardware(hwId);
    setHwDropdownOpen(false);
  };

  const currentHw = hardwareOptions.find(h => h.id === selectedHardware) || hardwareOptions[0];

  return (
    <header className="aegis-header">
      {/* Brand & Identity */}
      <div className="header-brand-group">
        <div className="brand-logo-gem">
          <Shield size={18} className="text-nvidia" />
        </div>
        <div className="brand-title-wrap">
          <div className="brand-name-row">
            <span className="brand-title">AEGIS // KERNEL</span>
            <span className="hackathon-tag">NEBIUS × NVIDIA GLOBAL '26</span>
          </div>
          <span className="brand-sub">Autonomous Adversarial GPU Invariant & Kernel Proving Ground</span>
        </div>
      </div>

      {/* Center: Hardware Selector & Cloud Hub */}
      <div className="header-center-hub">
        {/* Hardware Selector Dropdown */}
        <div className="hw-selector-dropdown-wrap">
          <button 
            className="hw-selector-trigger" 
            onClick={() => setHwDropdownOpen(!hwDropdownOpen)}
            title="Switch Target GPU Architecture"
          >
            <Cpu size={14} className="text-nvidia" />
            <div className="hw-info-text">
              <span className="hw-name">{currentHw.label}</span>
              <span className="hw-spec">{currentHw.spec}</span>
            </div>
            <ChevronDown size={13} className={`hw-chevron ${hwDropdownOpen ? 'open' : ''}`} />
          </button>

          {hwDropdownOpen && (
            <div className="hw-dropdown-menu">
              {hardwareOptions.map((opt) => (
                <div 
                  key={opt.id}
                  className={`hw-dropdown-item ${opt.id === selectedHardware ? 'selected' : ''}`}
                  onClick={() => handleSelectHw(opt.id)}
                >
                  <div className="hw-item-title">{opt.label}</div>
                  <div className="hw-item-spec">{opt.spec}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Cloud Status Telemetry */}
        <div className="cloud-status-strip">
          <div className="cloud-pill pill-nebius" title="Nebius Token Factory Sandbox Active">
            <span className="pulse-indicator bg-azure"></span>
            <span>Nebius Token Factory</span>
          </div>
          <div className="cloud-pill pill-nemotron" title="Nemotron 70B Ultra Dual-Brain Healer">
            <span className="pulse-indicator bg-nvidia"></span>
            <span>Nemotron 70B Ultra</span>
          </div>
          <div className="cloud-pill pill-tavily" title="Tavily Hardware & Compiler Oracle Online">
            <span className="pulse-indicator bg-amber"></span>
            <span>Tavily Oracle</span>
          </div>
        </div>
      </div>

      {/* Right: Actions & Sound Toggle */}
      <div className="header-right-actions">
        <button 
          className="audio-btn" 
          onClick={handleToggleSound}
          title={isMuted ? "Unmute Audio Synthesis" : "Mute Audio Synthesis"}
        >
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} className="text-nvidia" />}
        </button>

        <button 
          className="btn-header-secondary"
          onClick={onOpenPitch}
          title="Open Hackathon Judges Presentation"
        >
          <Sparkles size={14} className="text-amber" />
          <span>Judges Pitch</span>
        </button>

        <button 
          className="btn-header-primary"
          onClick={onOpenPrModal}
          title="Export Verified Upstream PR"
        >
          <GitPullRequest size={14} />
          <span>Export PR</span>
        </button>
      </div>
    </header>
  );
}
