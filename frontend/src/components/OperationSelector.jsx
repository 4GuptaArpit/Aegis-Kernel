import React from 'react';
import { Zap, AlertTriangle, Layers, Flame, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import { sound } from '../utils/audio';

export default function OperationSelector({
  fixtures,
  selectedFixture,
  setSelectedFixture,
  isRunning,
  handleLaunch,
  currentStage
}) {
  const handleSelect = (id) => {
    if (isRunning) return;
    sound.playClick();
    setSelectedFixture(id);
  };

  const getThreatDetails = (id) => {
    if (id === 'swiglu') {
      return {
        vulnTitle: 'Out-Of-Bounds Buffer Overrun',
        codeSignal: 'Exit 139 (SIGSEGV)',
        colorClass: 'threat-crimson',
        tensorSpec: { batch: '7', seq: '1023 (Ragged)', hidden: '4095' },
        raggedRatio: 79.9, // 1023 out of 1024
        formula: 'SwiGLU(x) = (xW_gate · σ(xW_gate)) ⊗ xW_up'
      };
    } else if (id === 'rmsnorm') {
      return {
        vulnTitle: 'Silent Data Corruption (SDC)',
        codeSignal: 'Unaligned 16B Vector Load',
        colorClass: 'threat-amber',
        tensorSpec: { batch: '16', seq: '1', hidden: '2047 (Unaligned)' },
        raggedRatio: 99.9,
        formula: 'RMSNorm(x) = (x / √(mean(x²) + ε)) ⊙ γ'
      };
    }
    return {
      vulnTitle: 'Floating-Point NaN / Inf Overflow',
      codeSignal: 'Logit Range [-120, +102.3]',
      colorClass: 'threat-violet',
      tensorSpec: { batch: '1', seq: '5 (Extreme)', hidden: 'N/A' },
      raggedRatio: 100,
      formula: 'Softmax(x_i) = exp(x_i - max(x)) / ∑ exp(x_j - max(x))'
    };
  };

  return (
    <div className="operation-panel-card glass-panel">
      {/* Panel Top Title */}
      <div className="panel-title-bar">
        <div className="panel-title-group">
          <Layers size={16} className="text-emerald" />
          <h2 className="panel-heading">Target Transformer Operations</h2>
        </div>
        <span className="panel-count-tag">{fixtures.length} Kernels</span>
      </div>

      <p className="panel-helper-text">
        Select a mission-critical neural operation lacking built-in GPU memory boundary verification:
      </p>

      {/* Silicon Module List */}
      <div className="silicon-module-stack">
        {fixtures.map(f => {
          const isSelected = selectedFixture === f.id;
          const threat = getThreatDetails(f.id);

          return (
            <div
              key={f.id}
              className={`silicon-module ${isSelected ? 'module-active' : ''}`}
              onClick={() => handleSelect(f.id)}
            >
              {/* Header inside Module */}
              <div className="module-top">
                <div className="module-meta">
                  <span className="module-name">{f.name}</span>
                  <span className="module-category">{f.category}</span>
                </div>
                <div className="module-speedup-badge">
                  <Flame size={12} className="text-emerald shrink-0" />
                  <span>{f.speedup_target}x Target</span>
                </div>
              </div>

              {/* Mathematical Invariant Formula Box */}
              <div className="module-formula-box">
                <span className="formula-prefix">f(x) =</span>
                <code className="formula-code">{threat.formula}</code>
              </div>

              {/* Hardware Tensor Footprint */}
              <div className="tensor-footprint-grid">
                <div className="footprint-col">
                  <span className="fp-label">BATCH</span>
                  <span className="fp-val">{threat.tensorSpec.batch}</span>
                </div>
                <div className="footprint-col">
                  <span className="fp-label">SEQ LENGTH</span>
                  <span className="fp-val text-amber">{threat.tensorSpec.seq}</span>
                </div>
                <div className="footprint-col">
                  <span className="fp-label">DIMENSION</span>
                  <span className="fp-val text-crimson">{threat.tensorSpec.hidden}</span>
                </div>
              </div>

              {/* Threat Severity Bar */}
              <div className="module-bottom-bar">
                <span className={`threat-indicator-pill ${threat.colorClass}`}>
                  <AlertTriangle size={11} className="shrink-0" />
                  <span>{threat.vulnTitle}</span>
                </span>
                <span className="threat-signal-mono">{threat.codeSignal}</span>
              </div>

              {/* Active Selection Specular Glow */}
              {isSelected && <div className="module-active-highlight"></div>}
            </div>
          );
        })}
      </div>

      {/* Proving Ground Master Action Switch */}
      <div className="master-action-box">
        <button
          className={`btn-engage-master ${isRunning ? 'btn-engaged-running' : ''}`}
          disabled={isRunning}
          onClick={() => {
            sound.playEngage();
            handleLaunch();
          }}
        >
          <div className="btn-laser-sweep"></div>
          <div className="btn-inner-row">
            {isRunning ? (
              <>
                <div className="spinning-ring"></div>
                <div className="btn-label-stack">
                  <span className="btn-main-title">PROVING GROUND ENGAGED</span>
                  <span className="btn-stage-indicator">ACTIVE STAGE: {currentStage}</span>
                </div>
              </>
            ) : (
              <>
                <Zap size={18} className="bolt-icon text-emerald" />
                <div className="btn-label-stack">
                  <span className="btn-main-title">ENGAGE AEGIS PROVING GROUND</span>
                  <span className="btn-stage-indicator">Synthesize Red Stress & Invariant Triton Kernel</span>
                </div>
                <ArrowRight size={16} className="arrow-launch-icon" />
              </>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
