import React from 'react';
import { Activity, Bug, XCircle, Wrench, CheckCircle2 } from 'lucide-react';

export default function PipelineNarrative({ currentStage, isRunning }) {
  // Determine active highlights based on proving ground stage
  const isStage1Active = currentStage === 'TAVILY' || currentStage === 'INIT';
  const isStage2Active = currentStage === 'RED_ATTACK' || currentStage === 'SANDBOX_FAIL';
  const isStage3Active = currentStage === 'BLUE_SYNTHESIS';
  const isStage4Active = currentStage === 'VERIFYING' || currentStage === 'COMPLETE';

  return (
    <div className="stitch-card pipeline-narrative-card">
      <div className="card-header-row">
        <div className="card-title-group">
          <Activity size={14} className="text-cyan" />
          <span className="card-title-text">AUTONOMOUS PIPELINE NARRATIVE</span>
        </div>
        <div className="narrative-meta-pill">
          <span className="text-green font-mono">Epoch 0x82FA</span>
          <span className="text-dim">·</span>
          <span className="text-muted">Elapsed: 0.84s</span>
        </div>
      </div>

      <div className="pipeline-stages-grid">
        {/* Stage 01 */}
        <div className={`stage-step-card stage-cyan ${isStage1Active ? 'pulse-active' : ''}`}>
          <div className="stage-top-row">
            <span className="stage-id">STAGE 01</span>
            <Bug size={14} className="stage-icon text-cyan" />
          </div>
          <div className="stage-title">Adversarial Fuzzer</div>
          <div className="stage-subtitle">16k Ragged Bounds</div>
          <div className="stage-status-bullet text-cyan">
            <span className="bullet-dot dot-cyan"></span>
            <span>Synthesized</span>
          </div>
        </div>

        {/* Stage 02 */}
        <div className={`stage-step-card stage-red ${isStage2Active ? 'pulse-active' : ''}`}>
          <div className="stage-top-row">
            <span className="stage-id">STAGE 02</span>
            <XCircle size={14} className="stage-icon text-red" />
          </div>
          <div className="stage-title">Fault Triggered</div>
          <div className="stage-subtitle">SIGSEGV 139 Crash</div>
          <div className="stage-status-bullet text-red">
            <span className="bullet-dot dot-red"></span>
            <span>SM 14 OOB Read</span>
          </div>
        </div>

        {/* Stage 03 */}
        <div className={`stage-step-card stage-purple ${isStage3Active ? 'pulse-active' : ''}`}>
          <div className="stage-top-row">
            <span className="stage-id">STAGE 03</span>
            <Wrench size={14} className="stage-icon text-purple" />
          </div>
          <div className="stage-title">Nemotron-70B Patch</div>
          <div className="stage-subtitle">AST Triton Rewrite</div>
          <div className="stage-status-bullet text-purple">
            <span className="bullet-dot dot-purple"></span>
            <span>Mask Synthesized</span>
          </div>
        </div>

        {/* Stage 04 */}
        <div className={`stage-step-card stage-green ${isStage4Active ? 'pulse-active' : ''}`}>
          <div className="stage-top-row">
            <span className="stage-id">STAGE 04</span>
            <CheckCircle2 size={14} className="stage-icon text-green" />
          </div>
          <div className="stage-title">Invariant Verified</div>
          <div className="stage-subtitle">500/500 Permutations</div>
          <div className="stage-status-bullet text-green">
            <span className="bullet-dot dot-green"></span>
            <span>100% Zero-Crash</span>
          </div>
        </div>
      </div>
    </div>
  );
}
