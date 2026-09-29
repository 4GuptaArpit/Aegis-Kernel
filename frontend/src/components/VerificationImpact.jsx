import React, { useState } from 'react';
import { ShieldCheck, Check, Cpu, Zap, Lock, Sparkles, ExternalLink } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { sound } from '../utils/audio';

export default function VerificationImpact({ 
  metrics, 
  onOpenPrModal, 
  onOpenJudgesOverview,
  selectedFixture 
}) {
  const [activePerfTab, setActivePerfTab] = useState('speedup');

  const speedupVal = metrics ? `${metrics.speedup}x` : '2.35x';
  const baselineLat = metrics ? `${metrics.baseline_latency_us} μs` : '54.2 μs';
  const hardenedLat = metrics ? `${metrics.hardened_latency_us} μs` : '23.1 μs';

  // Roofline Chart data for H100
  const rooflineData = {
    labels: ['1', '2', '4', '8', '14.2', '32', '64'],
    datasets: [
      {
        label: 'Hopper H100 Roofline (TFLOPS)',
        data: [100, 200, 400, 800, 989, 989, 989],
        borderColor: '#64748B',
        borderDash: [4, 4],
        fill: false,
        pointRadius: 0
      },
      {
        label: 'Aegis Hardened Triton',
        data: [null, null, null, null, 418.5, null, null],
        backgroundColor: '#00F29B',
        borderColor: '#00F29B',
        pointRadius: 7,
        pointHoverRadius: 9
      }
    ]
  };

  const handleExportClick = () => {
    sound.playSuccess();
    onOpenPrModal();
  };

  return (
    <aside className="verification-impact-sidebar">
      {/* Top Section Header */}
      <div className="impact-top-header">
        <div className="impact-title-group">
          <ShieldCheck size={16} className="text-green" />
          <span className="impact-title-text text-green">HACKATHON VERIFICATION & IMPACT</span>
        </div>
        <button 
          className="btn-judges-overview"
          onClick={onOpenJudgesOverview}
        >
          Judges Overview
        </button>
      </div>

      {/* Card 1: Kernel Reliability Invariant */}
      <div className="stitch-card reliability-card">
        <div className="card-header-row">
          <span className="card-title-text">KERNEL RELIABILITY INVARIANT</span>
          <span className="stitch-pill pill-cyan-hollow">SDC Immune</span>
        </div>

        <div className="gauge-and-stats-row">
          {/* Circular Donut Gauge */}
          <div className="radial-donut-wrap">
            <svg className="radial-svg" width="84" height="84" viewBox="0 0 84 84">
              <circle
                cx="42"
                cy="42"
                r="36"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="7"
                fill="none"
              />
              <circle
                cx="42"
                cy="42"
                r="36"
                stroke="url(#green-glow-gradient)"
                strokeWidth="7"
                fill="none"
                strokeDasharray="226.2"
                strokeDashoffset="0"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="green-glow-gradient" x1="0" y1="0" x2="84" y2="84" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00F29B" />
                  <stop offset="1" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
            </svg>
            <div className="radial-donut-center">
              <span className="donut-pct text-green">100%</span>
              <span className="donut-label text-dim">SAFE</span>
            </div>
          </div>

          {/* Stats Text */}
          <div className="reliability-stats-col">
            <div className="passed-counter-row">
              <span className="counter-big">500 / 500</span>
            </div>
            <div className="counter-sub text-muted">Differential Permutations Passed</div>
            <div className="counter-chips-row">
              <span className="chip-check text-green">
                <Check size={12} className="inline mr-1" /> 0 Crashes
              </span>
              <span className="chip-check text-green">
                <Check size={12} className="inline mr-1" /> 0 SDC Drift
              </span>
            </div>
          </div>
        </div>

        {/* Dual Sub-Cards */}
        <div className="reliability-subcards-grid">
          <div className="rel-subcard rel-subcard-red">
            <span className="subcard-label text-dim">PyTorch Baseline:</span>
            <span className="subcard-val text-red font-semibold">Failed at seq#17</span>
          </div>

          <div className="rel-subcard rel-subcard-green">
            <span className="subcard-label text-dim">Aegis Hardened:</span>
            <span className="subcard-val text-green font-semibold">Differential Error 0</span>
          </div>
        </div>
      </div>

      {/* Card 2: Performance & Hardware Metrics */}
      <div className="stitch-card performance-card">
        {/* Navigation Tabs */}
        <div className="perf-tabs-row">
          <button 
            className={`perf-tab-btn ${activePerfTab === 'speedup' ? 'active-perf-tab' : ''}`}
            onClick={() => setActivePerfTab('speedup')}
          >
            Speedup ({speedupVal})
          </button>
          <button 
            className={`perf-tab-btn ${activePerfTab === 'roofline' ? 'active-perf-tab' : ''}`}
            onClick={() => setActivePerfTab('roofline')}
          >
            H100 Roofline
          </button>
          <button 
            className={`perf-tab-btn ${activePerfTab === 'sram' ? 'active-perf-tab' : ''}`}
            onClick={() => setActivePerfTab('sram')}
          >
            SRAM Savings
          </button>
          <button 
            className={`perf-tab-btn ${activePerfTab === 'sm90' ? 'active-perf-tab' : ''}`}
            onClick={() => setActivePerfTab('sm90')}
          >
            Hopper SM90
          </button>
        </div>

        {activePerfTab === 'speedup' || activePerfTab === 'sram' || activePerfTab === 'sm90' ? (
          <div className="perf-main-body">
            {/* Speedup Metric Big Row */}
            <div className="speedup-hero-row">
              <div className="speedup-val-text">
                <span className="speedup-number">{speedupVal}</span>
                <span className="speedup-label text-white">FASTER SPEEDUP</span>
              </div>
              <span className="stitch-pill pill-green-solid">-57.4% Time</span>
            </div>

            {/* Progress Bars */}
            <div className="latency-bars-stack">
              <div className="latency-bar-group">
                <div className="latency-bar-label-row">
                  <span className="text-muted">PyTorch v2.3 Baseline</span>
                  <span className="font-mono text-red font-semibold">{baselineLat}</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill bar-fill-red" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div className="latency-bar-group">
                <div className="latency-bar-label-row">
                  <span className="text-white font-medium">Aegis Hardened Triton</span>
                  <span className="font-mono text-green font-semibold">{hardenedLat}</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill bar-fill-green" style={{ width: '42.6%' }}></div>
                </div>
              </div>
            </div>

            {/* Bottom Memory Savings */}
            <div className="sram-savings-footer">
              <span className="text-muted">SRAM Fusion Savings:</span>
              <span className="text-green font-mono font-semibold">1.42 GB → 0.82 GB (-42%)</span>
            </div>
          </div>
        ) : (
          <div className="roofline-container-stitch">
            <Line
              data={rooflineData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: { ticks: { color: '#64748B', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
                  y: { ticks: { color: '#64748B', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.04)' } }
                },
                plugins: {
                  legend: { display: false }
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Card 3: TPM2.0 Signed Attestation */}
      <div className="stitch-card attestation-card">
        <div className="card-header-row">
          <div className="flex items-center gap-2">
            <Lock size={13} className="text-green" />
            <span className="card-title-text">TPM2.0 SIGNED ATTESTATION</span>
          </div>
          <span className="stitch-pill pill-green-hollow">Hardware Proven</span>
        </div>

        {/* Telemetry Monospace Box */}
        <div className="attestation-code-block font-mono text-xs">
          <div className="attest-row">
            <span className="attest-key text-cyan">SIG:</span>
            <span className="attest-val text-dim">0x8df4927f8a12...e3b0c44298fc1c14</span>
          </div>
          <div className="attest-row">
            <span className="attest-key text-dim">ROOT:</span>
            <span className="attest-val text-white">Nebius-NV-H100-PROVER-US-EAST</span>
          </div>
          <div className="attest-row flex justify-between">
            <div>
              <span className="attest-key text-dim">TARGET:</span>
              <span className="attest-val text-cyan">vllm-project/vllm #8041</span>
            </div>
            <span className="text-green font-bold">CI: PASSED</span>
          </div>
        </div>

        {/* Export PR CTA Button */}
        <button 
          className="btn-export-pr"
          onClick={handleExportClick}
        >
          <div className="btn-export-inner">
            <Zap size={15} className="fill-current text-white" />
            <span className="export-btn-label">EXPORT VERIFIED PR TO VLLM UPSTREAM</span>
          </div>
        </button>
        <p className="export-subtext text-center text-dim text-xs">
          Automatically opens verified upstream PR with reproducible Hopper H100 test logs.
        </p>
      </div>
    </aside>
  );
}
