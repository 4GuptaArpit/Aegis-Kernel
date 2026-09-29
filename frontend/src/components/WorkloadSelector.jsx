import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { sound } from '../utils/audio';

export default function WorkloadSelector({ selectedFixture, onSelectFixture, isRunning }) {
  const workloads = [
    {
      id: 'swiglu',
      title: 'Ragged Fused SwiGLU',
      targetSpeedup: '2.35x Target',
      description: 'Transformer MLP Feed-Forward block in LLaMA-3 & Mistral.',
      tag: '🔴 CUDA 139 Crash · -42% VRAM',
      tagColor: 'text-red'
    },
    {
      id: 'rmsnorm',
      title: 'Unaligned RMSNorm',
      targetSpeedup: '2.33x Target',
      description: 'Pre-attention LayerNorm with silent non-16B stride corruption.',
      tag: '🟡 SDC Divergence · -31% Warp Penalty',
      tagColor: 'text-amber'
    },
    {
      id: 'softmax',
      title: 'Safe Scaled Softmax',
      targetSpeedup: '2.27x Target',
      description: 'FlashAttention-v3 long context with NaN/Inf numerical drift.',
      tag: '🔵 Underflow Trap · 128k Tokens',
      tagColor: 'text-cyan'
    }
  ];

  const handleSelect = (id) => {
    if (isRunning) return;
    sound.playClick();
    onSelectFixture(id);
  };

  return (
    <div className="stitch-card workload-selector-card">
      <div className="workload-header-row">
        <div className="card-title-group">
          <SlidersHorizontal size={14} className="text-cyan" />
          <span className="card-title-text">SELECT TARGET NEURAL NET WORKLOAD</span>
        </div>
        <span className="text-xs text-dim">Click card to live-switch fuzzer & AST target</span>
      </div>

      <div className="workload-cards-grid">
        {workloads.map((wl) => {
          const isActive = selectedFixture === wl.id;
          return (
            <div
              key={wl.id}
              className={`workload-item-card ${isActive ? 'active-workload' : ''}`}
              onClick={() => handleSelect(wl.id)}
            >
              <div className="workload-item-top">
                <span className={`status-pill ${isActive ? 'pill-active' : 'pill-queued'}`}>
                  {isActive ? 'ACTIVE WORKLOAD' : 'QUEUED'}
                </span>
                <span className="target-pill">{wl.targetSpeedup}</span>
              </div>

              <div className="workload-item-title">{wl.title}</div>
              <div className="workload-item-desc">{wl.description}</div>
              <div className={`workload-item-footer ${wl.tagColor}`}>{wl.tag}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
