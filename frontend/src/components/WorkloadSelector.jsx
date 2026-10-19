import React from 'react';
import { SlidersHorizontal, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';
import { sound } from '../utils/audio';

export default function WorkloadSelector({ selectedFixture, onSelectFixture, isRunning }) {
  const workloads = [
    {
      id: 'swiglu',
      name: 'Fused Ragged SwiGLU',
      modelFamily: 'LLaMA-3 · Mistral 7B · Gemma',
      faultType: 'SIGSEGV 139 (Warp OOB)',
      faultDetail: 'Ragged sequences (seq_len % 32 != 0) trigger invalid global memory loads.',
      targetSpeedup: '2.35x Speedup',
      reduction: '-42% SRAM Footprint',
      accentColor: 'nvidia'
    },
    {
      id: 'rmsnorm',
      name: 'Unaligned Vectorized RMSNorm',
      modelFamily: 'Qwen-2.5 · DeepSeek-V3',
      faultType: 'Silent Data Corruption (SDC)',
      faultDetail: 'Non-16B stride loads cause accumulator drift without hardware fault.',
      targetSpeedup: '2.33x Speedup',
      reduction: '-31% Memory Stalls',
      accentColor: 'amber'
    },
    {
      id: 'softmax',
      name: 'Safe Scaled Online Softmax',
      modelFamily: 'FlashAttention-v3 · 128k Context',
      faultType: 'NaN / Inf Underflow Trap',
      faultDetail: 'Unbounded exp(x) in FP16 causes numerical loss spikes and NaN gradients.',
      targetSpeedup: '2.27x Speedup',
      reduction: '0.0 Numerical Divergence',
      accentColor: 'azure'
    }
  ];

  const handleSelect = (id) => {
    if (isRunning) return;
    sound.playClick();
    onSelectFixture(id);
  };

  return (
    <div className="workload-rail-container">
      <div className="workload-rail-header">
        <div className="rail-title-group">
          <SlidersHorizontal size={14} className="text-nvidia" />
          <span className="rail-title">TARGET NEURAL OPERATOR BENCHMARKS</span>
        </div>
        <span className="rail-sub">Select a production PyTorch kernel to prove vulnerability and synthesize hardened Triton replacement</span>
      </div>

      <div className="workload-cards-row">
        {workloads.map((wl) => {
          const isActive = selectedFixture === wl.id;
          return (
            <div
              key={wl.id}
              className={`workload-card ${isActive ? 'card-selected' : ''} ${isRunning ? 'disabled' : ''}`}
              onClick={() => handleSelect(wl.id)}
            >
              <div className="card-top-status">
                <div className="selection-badge">
                  {isActive ? (
                    <span className="badge-active">
                      <span className="status-dot-active"></span>
                      ACTIVE TARGET
                    </span>
                  ) : (
                    <span className="badge-idle">STANDBY</span>
                  )}
                </div>
                <div className="speedup-pill">
                  <Zap size={12} className="inline mr-1" />
                  {wl.targetSpeedup}
                </div>
              </div>

              <div className="card-operator-title">{wl.name}</div>
              <div className="card-model-family">{wl.modelFamily}</div>

              <div className="card-fault-box">
                <div className="fault-title">
                  <AlertTriangle size={12} className="text-coral" />
                  <span>{wl.faultType}</span>
                </div>
                <p className="fault-desc">{wl.faultDetail}</p>
              </div>

              <div className="card-footer-metric">
                <CheckCircle2 size={12} className="text-nvidia" />
                <span>{wl.reduction}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
