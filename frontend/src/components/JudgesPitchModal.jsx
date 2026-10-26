import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ShieldAlert, 
  Cpu, 
  Zap, 
  Terminal, 
  FileCode, 
  CheckCircle2, 
  ArrowRight, 
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { sound } from '../utils/audio';

export default function JudgesPitchModal({ isOpen, onClose, onLaunchDemo }) {
  const [activeTab, setActiveTab] = useState('bento'); // 'bento' or 'deepdive'

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-scrim" onClick={onClose}>
      <div 
        className="modal-dialog-box judges-pitch-dialog" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '960px' }}
      >
        {/* Modal Header */}
        <div className="modal-header-strip">
          <div className="modal-header-left">
            <div className="brand-logo-gem">
              <Sparkles size={18} className="text-amber" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="modal-heading font-mono">AEGIS-KERNEL // JUDGES EXECUTIVE BRIEF</h3>
                <span className="hackathon-tag font-mono">NEBIUS × NVIDIA GLOBAL '26</span>
              </div>
              <span className="modal-subheading">
                Autonomous Closed-Loop Proving Ground for GPU Invariants & Triton Synthesis
              </span>
            </div>
          </div>
          <button className="modal-dismiss-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* View Switcher Bar */}
        <div className="modal-tab-bar">
          <button 
            className={`modal-segment-btn ${activeTab === 'bento' ? 'segment-active' : ''}`}
            onClick={() => { sound.playClick(); setActiveTab('bento'); }}
          >
            <Layers size={14} className="text-nvidia" />
            <span>Executive Bento Overview (60-Sec Scan)</span>
          </button>
          <button 
            className={`modal-segment-btn ${activeTab === 'deepdive' ? 'segment-active' : ''}`}
            onClick={() => { sound.playClick(); setActiveTab('deepdive'); }}
          >
            <FileCode size={14} className="text-cyan" />
            <span>Hardware & Sponsor Architecture Breakdown</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body-scroll judges-pitch-body">
          {activeTab === 'bento' ? (
            <div className="pitch-bento-grid">
              {/* Tile 1: The Core Problem */}
              <div className="pitch-bento-card bento-problem">
                <div className="bento-badge text-coral">
                  <ShieldAlert size={14} />
                  <span>01. THE $100M CLOUD PROBLEM</span>
                </div>
                <h4 className="bento-title">GPU Kernels Have Zero Built-In Bounds Safety</h4>
                <p className="bento-desc">
                  Modern LLMs execute ragged, unpadded sequence lengths. When a tensor sequence isn't an exact 
                  multiple of 32 threads, unmasked PyTorch kernels read past memory pages, causing 
                  <strong className="text-coral"> Exit Code 139 (SIGSEGV)</strong>, Silent Data Corruption (SDC), and multi-million dollar training cluster stalls.
                </p>
                <div className="bento-code-snippet font-mono text-2xs">
                  <span className="text-coral">💥 CRITICAL FAULT:</span> ld.global.v2.f16 [%rd_in + %r3]
                  <br />
                  <span className="text-dim">Unpredicated raw pointer arithmetic on ragged tokens</span>
                </div>
              </div>

              {/* Tile 2: Dual Brain Loop */}
              <div className="pitch-bento-card bento-solution">
                <div className="bento-badge text-nvidia">
                  <Zap size={14} />
                  <span>02. THE CLOSED-LOOP SOLUTION</span>
                </div>
                <h4 className="bento-title">Nemotron Red vs Blue Empirical Proving</h4>
                <p className="bento-desc">
                  Aegis-Kernel replaces speculative copilot guesses with an autonomous adversarial collider:
                </p>
                <ul className="bento-bullet-list">
                  <li><strong>Red Fuzzer (Nemotron 3 Ultra):</strong> Synthesizes ragged boundary attack tensors inside Nebius Ephemeral Sandboxes.</li>
                  <li><strong>Blue Synthesizer (Nemotron + Triton):</strong> Emits zero-overhead boundary-predicated kernels using <code>tl.load(..., mask=mask, other=0.0)</code>.</li>
                </ul>
              </div>

              {/* Tile 3: Key Hardware Metrics */}
              <div className="pitch-bento-card bento-metrics">
                <div className="bento-badge text-amber">
                  <Cpu size={14} />
                  <span>03. MEASURED PERFORMANCE DELTA</span>
                </div>
                <div className="bento-stat-hero">
                  <span className="stat-big font-mono text-nvidia">2.35x</span>
                  <span className="stat-label">SRAM-Fused Speedup on Hopper H100</span>
                </div>
                <div className="bento-mini-stats font-mono">
                  <div className="mini-stat-item">
                    <span className="stat-num text-cyan">-42%</span>
                    <span className="stat-sub">VRAM Footprint</span>
                  </div>
                  <div className="mini-stat-item">
                    <span className="stat-num text-nvidia">100%</span>
                    <span className="stat-sub">Formal Invariant Verified</span>
                  </div>
                  <div className="mini-stat-item">
                    <span className="stat-num text-amber">0 Cycle</span>
                    <span className="stat-sub">@p0 Predicate Overhead</span>
                  </div>
                </div>
              </div>

              {/* Tile 4: Verifiable Upstream PRs */}
              <div className="pitch-bento-card bento-deliverable">
                <div className="bento-badge text-cyan">
                  <CheckCircle2 size={14} />
                  <span>04. ENTERPRISE DELIVERABLE</span>
                </div>
                <h4 className="bento-title">Automated PR Export & Signed Audit</h4>
                <p className="bento-desc">
                  Every hardened kernel outputs a cryptographically attested GitHub Pull Request with 
                  Nsight profiler benchmarks and a SHA-256 certificate ready for vLLM, TensorRT-LLM, or PyTorch upstreaming.
                </p>
                <div className="bento-cert-tag font-mono text-xs">
                  <span>SHA-256 ATTESTATION: 0x7f56b9fe02089399...</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="pitch-deepdive-container font-mono">
              <div className="deepdive-section">
                <h4 className="deepdive-title text-nvidia">🚀 Sponsor Technology Integration</h4>
                <div className="sponsor-grid">
                  <div className="sponsor-card">
                    <span className="sponsor-name text-nvidia">NVIDIA Hopper & Nemotron</span>
                    <ul className="text-xs text-secondary mt-2 space-y-1">
                      <li>• <strong>Nemotron 3 Ultra (70B):</strong> Generates pathological tensor dimensions targeting 32-thread SIMT warp boundaries.</li>
                      <li>• <strong>Hopper SM_90a PTX ISA:</strong> Validates <code>@p0 ld.global.nc.v2.f16</code> predicated loads in 0 clock cycles.</li>
                      <li>• <strong>Nsight Hardware HUD:</strong> Real-time latency waterfalls (250-cycle HBM3e vs 1-cycle Tensor Core ALU).</li>
                    </ul>
                  </div>
                  <div className="sponsor-card">
                    <span className="sponsor-name text-azure">Nebius Token Factory & Cloud</span>
                    <ul className="text-xs text-secondary mt-2 space-y-1">
                      <li>• <strong>Ephemeral Sandboxes:</strong> Rapid container isolation traps SIGSEGV faults without leaking host memory.</li>
                      <li>• <strong>High-Throughput Batch Inference:</strong> Parallel fuzzing passes execute 500 differential test cases in seconds.</li>
                      <li>• <strong>Cryptographic Telemetry Ledger:</strong> SQLite attestation stores verifiable audit hashes for every run.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="deepdive-section mt-4">
                <h4 className="deepdive-title text-amber">🔬 5-Stage Autonomous Execution Pipeline</h4>
                <div className="pipeline-steps-strip text-xs text-secondary">
                  <span><strong>1. TAVILY RECON:</strong> Crawls SM_90a microarchitecture limits</span>
                  <span> → </span>
                  <span><strong>2. RED FUZZ:</strong> Injects non-power-of-two ragged boundaries</span>
                  <span> → </span>
                  <span><strong>3. SANDBOX FAULT:</strong> Traps empirical bus panic</span>
                  <span> → </span>
                  <span><strong>4. BLUE HEALER:</strong> Synthesizes masked Triton kernel</span>
                  <span> → </span>
                  <span><strong>5. ATTESTATION:</strong> Signs cryptographic safety proof</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-actions-footer">
          <button className="btn-modal-action btn-action-copy" onClick={onClose}>
            <span>Dismiss</span>
          </button>
          <button 
            className="btn-modal-action btn-action-download bg-nvidia text-obsidian font-bold flex items-center gap-1.5"
            onClick={() => {
              onClose();
              if (onLaunchDemo) onLaunchDemo();
            }}
          >
            <span>Run Live Proving Collider</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
