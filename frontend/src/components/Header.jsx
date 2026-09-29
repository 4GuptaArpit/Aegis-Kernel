import React, { useState } from 'react';
import { Sparkles, Search, Zap, Volume2, VolumeX } from 'lucide-react';
import { sound } from '../utils/audio';

export default function Header({ 
  onRun, 
  isRunning, 
  onOpenPitch, 
  onOpenInspector 
}) {
  const [isMuted, setIsMuted] = useState(false);

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) sound.playClick();
  };

  return (
    <header className="stitch-header">
      {/* Left: Brand & Subtitle */}
      <div className="header-left">
        <div className="stitch-logo-lockup">
          <div className="logo-shield-icon">
            <svg width="22" height="24" viewBox="0 0 24 28" fill="none">
              <path d="M12 0L0 4.5V14C0 21.5 5.1 26.8 12 28C18.9 26.8 24 21.5 24 14V4.5L12 0Z" fill="url(#stitch-logo-grad)" />
              <path d="M12 3L2.5 6.5V13.5C2.5 19.5 6.5 24 12 25C17.5 24 21.5 19.5 21.5 13.5V6.5L12 3Z" fill="#090D16" />
              <path d="M12 7L7 12H10.5V19L17 11H13.5L15 7H12Z" fill="#00F29B" />
              <defs>
                <linearGradient id="stitch-logo-grad" x1="0" y1="0" x2="24" y2="28" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#8B5CF6" />
                  <stop offset="1" stopColor="#00F29B" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="logo-text-block">
            <div className="logo-title-row">
              <span className="logo-title">AEGIS · KERNEL</span>
              <span className="stitch-pill pill-purple-sm">v2.5 LIVE</span>
            </div>
            <p className="logo-subtitle">
              Autonomous GPU Invariant Proving Ground · Nebius AI × NVIDIA Hackathon
            </p>
          </div>
        </div>

        {/* Center-Left Action Buttons */}
        <div className="header-actions">
          <button 
            className="stitch-btn btn-pitch" 
            onClick={onOpenPitch}
            title="Pitch Mode Presentation"
          >
            <Sparkles size={13} className="text-white" />
            <span>Pitch Mode</span>
          </button>

          <button 
            className="stitch-btn btn-glass"
            onClick={onOpenInspector}
            title="Systems & Memory Inspector"
          >
            <Search size={13} className="text-muted" />
            <span>Systems Inspector</span>
          </button>
        </div>
      </div>

      {/* Center-Right Hardware & Cloud Status Chips */}
      <div className="header-center-chips">
        <div className="hw-chip">
          <span className="hw-chip-title">NVIDIA Hopper H100 SXM5</span>
          <span className="hw-chip-sub text-cyan">80GB · SM_90a</span>
        </div>

        <div className="hw-chip">
          <span className="hw-chip-title">NVLink 4 900 GB/s</span>
          <span className="hw-chip-sub text-muted">· 1.2ms</span>
        </div>

        <div className="status-chip chip-green">
          <span className="stitch-dot dot-green"></span>
          <span>Nebius: Ready</span>
        </div>

        <div className="status-chip chip-purple">
          <span className="stitch-dot dot-purple"></span>
          <span>Nemotron 70B: Active</span>
        </div>

        <button 
          className="sound-toggle-btn"
          onClick={handleToggleSound}
          title={isMuted ? "Unmute Sound" : "Mute Sound"}
        >
          {isMuted ? <VolumeX size={14} className="text-dim" /> : <Volume2 size={14} className="text-green" />}
        </button>
      </div>

      {/* Far Right: Huge Primary Run Button */}
      <div className="header-right">
        <button 
          className={`stitch-run-btn ${isRunning ? 'running' : ''}`}
          onClick={onRun}
          disabled={isRunning}
        >
          <Zap size={16} className="text-white fill-current" />
          <div className="run-btn-text">
            <span>{isRunning ? 'Running Proving Ground...' : 'Run Autonomous Proving Ground'}</span>
          </div>
          <span className="kbd-shortcut">⌘R</span>
        </button>
      </div>
    </header>
  );
}
