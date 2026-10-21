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
        <div className="brand-logo-gem" aria-hidden="true">
          <Shield size={18} className="text-nvidia" />
        </div>
        <div className="brand-title-wrap">
          <div className="brand-name-row">
            <h1 className="brand-title text-base font-bold tracking-wider m-0 p-0">AEGIS // KERNEL</h1>
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
            aria-haspopup="listbox"
            aria-expanded={hwDropdownOpen}
            aria-label="Target GPU Architecture Selector"
            title="Switch Target GPU Architecture"
          >
            <Cpu size={14} className="text-nvidia" aria-hidden="true" />
            <div className="hw-info-text">
              <span className="hw-name">{currentHw.label}</span>
              <span className="hw-spec">{currentHw.spec}</span>
            </div>
            <ChevronDown size={13} className={`hw-chevron ${hwDropdownOpen ? 'open' : ''}`} aria-hidden="true" />
          </button>

          {hwDropdownOpen && (
            <div className="hw-dropdown-menu" role="listbox" aria-label="Available GPU Architectures">
              {hardwareOptions.map((opt) => (
                <div 
                  key={opt.id}
                  role="option"
                  aria-selected={opt.id === selectedHardware}
                  tabIndex={0}
                  className={`hw-dropdown-item ${opt.id === selectedHardware ? 'selected' : ''}`}
                  onClick={() => handleSelectHw(opt.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelectHw(opt.id); } }}
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
          aria-label={isMuted ? "Unmute Audio Synthesis" : "Mute Audio Synthesis"}
          title={isMuted ? "Unmute Audio Synthesis" : "Mute Audio Synthesis"}
        >
          {isMuted ? <VolumeX size={15} aria-hidden="true" /> : <Volume2 size={15} className="text-nvidia" aria-hidden="true" />}
        </button>

        <button 
          className="btn-header-secondary"
          onClick={onOpenPitch}
          aria-label="Open Hackathon Judges Presentation"
          title="Open Hackathon Judges Presentation"
        >
          <Sparkles size={14} className="text-amber" aria-hidden="true" />
          <span>Judges Pitch</span>
        </button>

        <button 
          className="btn-header-primary"
          onClick={onOpenPrModal}
          aria-label="Export Verified Upstream Pull Request"
          title="Export Verified Upstream PR"
        >
          <GitPullRequest size={14} aria-hidden="true" />
          <span>Export PR</span>
        </button>
      </div>
    </header>
  );
}
