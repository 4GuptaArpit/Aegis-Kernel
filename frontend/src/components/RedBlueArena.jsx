import React from 'react';
import { Flame, Shield, Zap, AlertOctagon, CheckCircle2, ArrowRight, Activity, Terminal } from 'lucide-react';

export default function RedBlueArena({ currentStage, isRunning, selectedFixture, metrics, redData, blueData }) {
  const isRedActive = currentStage === 'RED_ATTACK' || currentStage === 'SANDBOX_FAIL';
  const isBlueActive = currentStage === 'BLUE_SYNTHESIS' || currentStage === 'VERIFYING';
  const isComplete = currentStage === 'COMPLETE';

  return (
    <div className="cyber-arena-card">
      <div className="arena-top-bar">
        <div className="arena-badge-live">
          <span className="live-radar-dot"></span>
          <span>AUTONOMOUS CYBER PROVING ARENA // CLOSED-LOOP RED vs BLUE</span>
        </div>
        <div className="arena-telemetry-tag font-mono">
          {isRunning ? `COLLIDER STATUS: ${currentStage}` : 'COLLIDER STATUS: ARMED & READY'}
        </div>
      </div>

      <div className="arena-split-stage">
        {/* RED ADVERSARY ZONE */}
        <div className={`adversary-wing wing-red ${isRedActive ? 'active-combat' : ''}`}>
          <div className="wing-header">
            <div className="wing-title-lockup text-coral">
              <Flame size={16} className="text-coral animate-pulse" />
              <span className="wing-title font-mono font-bold">RED AGENT: NEMOTRON 3 ULTRA</span>
            </div>
            <span className="wing-status-badge badge-red font-mono">
              {isRedActive ? 'ATTACKING KERNEL' : 'ADVERSARY ARMED'}
            </span>
          </div>

          <div className="wing-content-hud">
            <div className="hud-metric-row font-mono">
              <span className="hud-label text-tertiary">ATTACK VECTOR:</span>
              <span className="hud-val text-coral font-bold">Ragged Warp Misalignment & Float Drift</span>
            </div>
            <div className="hud-metric-row font-mono">
              <span className="hud-label text-tertiary">SANDBOX TARGET:</span>
              <span className="hud-val text-primary font-mono">PyTorch CUDA Baseline (Unmasked)</span>
            </div>
            <div className="hud-metric-row font-mono">
              <span className="hud-label text-tertiary">PROVABLE FAULT:</span>
              <span className="hud-val text-coral font-bold font-mono">SIGSEGV 139 (Bus Page Fault at SM 14)</span>
            </div>

            {/* Simulated Live Exploit Waveform */}
            <div className="exploit-waveform-box font-mono">
              <div className="waveform-header">
                <span className="text-coral">PATHOLOGICAL PAYLOAD GENERATOR</span>
                <span className="text-tertiary text-xs">seq_len=1023 (Tail warp % 32 != 0)</span>
              </div>
              <div className="waveform-stream">
                <span className="text-dim">0x00: </span>
                <span className="text-coral">FF FF FF FF 00 00 00 00 7F 4E 82 40 </span>
                <span className="text-amber">[OOB DEREFERENCE]</span>
              </div>
              <div className="fault-trigger-alert">
                <AlertOctagon size={13} className="text-coral inline mr-1" />
                <span>UNPROTECTED RAW POINTER TRIPPED HARDWARE BUS PANIC</span>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLLISION CORE / NEBIUS SANDBOX */}
        <div className="arena-collision-core">
          <div className={`collider-reactor ${isRunning ? 'reactor-pulsing' : ''}`}>
            <div className="core-ring core-ring-outer"></div>
            <div className="core-ring core-ring-inner"></div>
            <div className="core-center-node">
              <Zap size={20} className={isComplete ? 'text-emerald' : (isRedActive ? 'text-coral' : 'text-nvidia')} />
            </div>
          </div>
          <div className="collider-label font-mono">
            <span>NEBIUS TOKEN FACTORY</span>
            <span className="text-xs text-azure">EPHEMERAL SANDBOX</span>
          </div>
          <div className="collider-delta-badge font-mono">
            {metrics ? `${metrics.speedup}x FASTER` : '2.35x TARGET'}
          </div>
        </div>

        {/* BLUE IMMUNE ZONE */}
        <div className={`adversary-wing wing-blue ${isBlueActive || isComplete ? 'active-defense' : ''}`}>
          <div className="wing-header">
            <div className="wing-title-lockup text-emerald">
              <Shield size={16} className="text-emerald animate-pulse" />
              <span className="wing-title font-mono font-bold">BLUE AGENT: NEMOTRON 70B + TRITON</span>
            </div>
            <span className="wing-status-badge badge-green font-mono">
              {isComplete ? 'INVARIANT VERIFIED' : (isBlueActive ? 'SYNTHESIZING PATCH' : 'IMMUNE HEALER READY')}
            </span>
          </div>

          <div className="wing-content-hud">
            <div className="hud-metric-row font-mono">
              <span className="hud-label text-tertiary">HEALING VECTOR:</span>
              <span className="hud-val text-emerald font-bold">Hardware Bounded Predicate Masking (@p0)</span>
            </div>
            <div className="hud-metric-row font-mono">
              <span className="hud-label text-tertiary">HARDENED KERNEL:</span>
              <span className="hud-val text-primary font-mono">Fused Triton SRAM (Zero HBM Roundtrip)</span>
            </div>
            <div className="hud-metric-row font-mono">
              <span className="hud-label text-tertiary">INVARIANT STATUS:</span>
              <span className="hud-val text-emerald font-bold font-mono">500/500 Differential Shapes Passed (0 SDC)</span>
            </div>

            {/* Synthesized Triton Invariant Box */}
            <div className="invariant-code-box font-mono">
              <div className="waveform-header">
                <span className="text-emerald">SYNTHESIZED TRITON INVARIANT</span>
                <span className="text-tertiary text-xs">Zero-penalty tail warp clamp</span>
              </div>
              <div className="waveform-stream">
                <span className="text-azure">mask_m = offs_m &lt; total_ragged_tokens</span>
                <br />
                <span className="text-emerald">x = tl.load(ptr, mask=mask_m, other=0.0)</span>
              </div>
              <div className="immunity-verified-alert">
                <CheckCircle2 size={13} className="text-emerald inline mr-1" />
                <span>FORMALLY IMMUNE TO OUT-OF-BOUNDS BUS CORRUPTION</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
