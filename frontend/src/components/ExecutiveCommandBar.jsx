import React, { useState } from 'react';
import { Shield, Cpu, ChevronDown, Volume2, VolumeX, Sparkles, GitPullRequest, Play, Loader2, Sliders, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { sound } from '../utils/audio';

export default function ExecutiveCommandBar({
  selectedHardware,
  onSelectHardware,
  selectedFixture,
  onSelectFixture,
  isRunning,
  currentStage,
  progress,
  onRun,
  seqLen,
  onSeqLenChange,
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

  const currentHw = hardwareOptions.find(h => h.id === selectedHardware) || hardwareOptions[0];

  const workloads = [
    { id: 'swiglu', name: 'Fused SwiGLU', model: 'LLaMA-3 · Mistral', fault: 'SIGSEGV 139', speedup: '2.35x' },
    { id: 'rmsnorm', name: 'Vector RMSNorm', model: 'Qwen-2.5 · DeepSeek', fault: 'Silent SDC', speedup: '2.33x' },
    { id: 'softmax', name: 'Online Softmax', model: 'FlashAttention-v3', fault: 'NaN Overflow', speedup: '2.27x' }
  ];

  const stages = [
    { id: 'TAVILY', label: '01 Tavily Recon', active: ['INIT', 'TAVILY', 'TAVILY_RECON', 'TAVILY_RECON_COMPLETE'] },
    { id: 'RED_ATTACK', label: '02 Red Fuzzer', active: ['RED_ATTACK', 'RED_ATTACK_SYNTHESIS'] },
    { id: 'SANDBOX_FAIL', label: '03 Sandbox Crash', active: ['SANDBOX_FAIL', 'SANDBOX_RED_EXECUTE'] },
    { id: 'BLUE_SYNTHESIS', label: '04 Nemotron Blue', active: ['BLUE_SYNTHESIS', 'BLUE_SYNTHESIS_COMPLETE'] },
    { id: 'VERIFYING', label: '05 Dual Invariant', active: ['VERIFYING', 'DUAL_VERIFY', 'COMPLETE'] }
  ];

  const isRagged = seqLen % 32 !== 0;
  const tailThreads = seqLen % 32;

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

  const handleSelectWl = (wlId) => {
    if (isRunning) return;
    sound.playClick();
    onSelectFixture(wlId);
  };

  const getStageStatus = (stg) => {
    if (!isRunning && currentStage === 'IDLE') return 'idle';
    if (stg.active.includes(currentStage)) return 'active';
    const activeIdx = stages.findIndex(s => s.active.includes(currentStage));
    const thisIdx = stages.findIndex(s => s.id === stg.id);
    if (activeIdx > thisIdx || currentStage === 'COMPLETE') return 'completed';
    return 'pending';
  };

  return (
    <header className="exec-cockpit-header">
      {/* ROW 1: TOP GLOBAL HEADER */}
      <div className="exec-top-strip">
        {/* Brand Identity */}
        <div className="exec-brand-lockup">
          <div className="exec-brand-shield">
            <Shield size={18} className="text-nvidia" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="exec-brand-title">AEGIS-KERNEL</h1>
            <span className="exec-brand-badge font-mono">NEBIUS × NVIDIA GLOBAL '26</span>
          </div>
        </div>

        {/* Center: Target GPU Hardware */}
        <div className="exec-hw-dropdown-container">
          <button 
            className="exec-hw-btn font-mono"
            onClick={() => setHwDropdownOpen(!hwDropdownOpen)}
            title="Switch GPU Architecture"
          >
            <Cpu size={14} className="text-nvidia flex-shrink-0" />
            <div className="exec-hw-text-col">
              <span className="text-primary font-bold">{currentHw.label}</span>
              <span className="text-azure text-xs">({currentHw.spec})</span>
            </div>
            <div className="exec-hw-chevron-box">
              <ChevronDown size={14} className={`chevron-icon ${hwDropdownOpen ? 'open' : ''}`} />
            </div>
          </button>

          {hwDropdownOpen && (
            <div className="exec-hw-menu">
              {hardwareOptions.map((opt) => (
                <div 
                  key={opt.id}
                  className={`exec-hw-menu-item ${opt.id === selectedHardware ? 'selected' : ''}`}
                  onClick={() => handleSelectHw(opt.id)}
                >
                  <div className="font-bold text-xs text-primary">{opt.label}</div>
                  <div className="font-mono text-tertiary text-xs">{opt.spec}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Global Utilities */}
        <div className="exec-action-strip">
          <button className="exec-icon-btn" onClick={handleToggleSound} title="Toggle Audio">
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} className="text-nvidia" />}
          </button>

          <button className="exec-btn-ghost font-mono" onClick={onOpenPitch}>
            <Sparkles size={13} className="text-amber inline mr-1" />
            Judges Pitch
          </button>

          <button className="exec-btn-ghost font-mono" onClick={onOpenPrModal}>
            <GitPullRequest size={13} className="text-azure inline mr-1" />
            Export PR
          </button>
        </div>
      </div>

      {/* ROW 2: WORKLOAD SELECTION & RUN TRIGGER BAR */}
      <div className="exec-workbench-action-bar">
        {/* Left: Workload Tabs */}
        <div className="exec-workload-cluster">
          <span className="exec-bar-section-title font-mono text-tertiary text-xs">TARGET KERNEL:</span>
          <div className="exec-workload-tabs font-mono">
            {workloads.map((wl) => {
              const isActive = selectedFixture === wl.id;
              return (
                <button
                  key={wl.id}
                  className={`exec-tab-btn ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelectWl(wl.id)}
                  disabled={isRunning}
                >
                  <div className="flex items-center gap-1.5">
                    <span className={`tab-dot ${isActive ? 'dot-active' : ''}`}></span>
                    <span className="tab-name">{wl.name}</span>
                    <span className="tab-speedup text-nvidia font-bold">{wl.speedup}</span>
                  </div>
                  <div className="tab-fault-sub text-tertiary">{wl.fault}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Master Proving Ground Run Button */}
        <div className="exec-run-cta-wrap">
          <button 
            className={`exec-run-cta ${isRunning ? 'running' : ''}`}
            onClick={onRun}
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <Loader2 size={16} className="animate-spin text-white" />
                <span>PROVING ({progress}%)...</span>
              </>
            ) : (
              <>
                <Play size={16} className="fill-current text-obsidian" />
                <span>RUN PROVING GROUND</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ROW 3: Integrated Tensor Stress Slider + 5-Stage Laser Stepper */}
      <div className="exec-control-ribbon font-mono">
        {/* Left: Sequence Length Slider Control */}
        <div className="ribbon-slider-section">
          <div className="slider-meta-row">
            <span className="slider-title-label text-tertiary text-xs whitespace-nowrap">DYNAMIC SEQUENCE LENGTH:</span>
            <span className="slider-value-tokens text-primary font-bold text-xs whitespace-nowrap font-mono">{seqLen} TOKENS</span>
            <span className={`badge-boundary-alert ${isRagged ? 'alert-ragged' : 'alert-clean'} whitespace-nowrap`}>
              {isRagged ? (
                <>
                  <AlertTriangle size={11} className="inline mr-1 text-coral" />
                  RAGGED BOUNDARY (Tail: {tailThreads}/32 Lanes)
                </>
              ) : (
                <>
                  <ShieldCheck size={11} className="inline mr-1 text-nvidia" />
                  WARP ALIGNED (128-bit Clean)
                </>
              )}
            </span>
          </div>

          <div className="slider-track-wrap">
            <input 
              type="range" 
              min="128" 
              max="2048" 
              step="1"
              value={seqLen} 
              onChange={(e) => onSeqLenChange(parseInt(e.target.value, 10))}
              className="exec-hardware-slider"
              aria-label="Dynamic Sequence Length Slider"
            />
          </div>

          <div className="slider-explanation-bar text-2xs text-secondary flex items-center justify-between">
            <span className="text-azure flex items-center gap-1">
              <span className="pulse-indicator bg-azure inline-block"></span>
              <span><strong>Hardware SIMT Invariant:</strong> GPU warps process tensors in 32-thread chunks.</span>
            </span>
            <span className="text-tertiary">
              Drag slider to inject unaligned ragged tokens & stress test boundary predication in real-time
            </span>
          </div>
        </div>

        {/* Right: 5-Stage Live Stepper Pipeline */}
        <div className="ribbon-stepper-section">
          {stages.map((stg, idx) => {
            const status = getStageStatus(stg);
            return (
              <div key={stg.id} className={`ribbon-step-pill step-${status}`}>
                <span className="step-badge">{stg.label}</span>
                {idx < stages.length - 1 && <span className="step-laser-arrow">►</span>}
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
}
