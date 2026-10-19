import React from 'react';
import { Search, Bug, XCircle, Wrench, ShieldCheck, Play, Loader2 } from 'lucide-react';

export default function PipelineNarrative({ 
  currentStage, 
  isRunning, 
  progress, 
  onRun, 
  selectedFixture 
}) {
  const stages = [
    {
      id: 'TAVILY',
      step: '01',
      name: 'Tavily Recon',
      desc: 'SM90 Hardware Intel',
      icon: Search,
      activeIf: ['INIT', 'TAVILY', 'TAVILY_RECON', 'TAVILY_RECON_COMPLETE']
    },
    {
      id: 'RED_ATTACK',
      step: '02',
      name: 'Red Adversary',
      desc: 'Pathological Fuzzing',
      icon: Bug,
      activeIf: ['RED_ATTACK', 'RED_ATTACK_SYNTHESIS']
    },
    {
      id: 'SANDBOX_FAIL',
      step: '03',
      name: 'Nebius Sandbox',
      desc: 'Fault Provably Tripped',
      icon: XCircle,
      activeIf: ['SANDBOX_FAIL', 'SANDBOX_RED_EXECUTE']
    },
    {
      id: 'BLUE_SYNTHESIS',
      step: '04',
      name: 'Nemotron Blue',
      desc: 'Triton Mask Synthesis',
      icon: Wrench,
      activeIf: ['BLUE_SYNTHESIS', 'BLUE_SYNTHESIS_COMPLETE']
    },
    {
      id: 'VERIFYING',
      step: '05',
      name: 'Dual Invariant',
      desc: '500 Tests + 2.35x Speedup',
      icon: ShieldCheck,
      activeIf: ['VERIFYING', 'DUAL_VERIFY', 'COMPLETE']
    }
  ];

  const getStageStatus = (stage) => {
    if (!isRunning && currentStage === 'IDLE') return 'idle';
    if (stage.activeIf.includes(currentStage)) return 'active';
    const activeIndex = stages.findIndex(s => s.activeIf.includes(currentStage));
    const thisIndex = stages.findIndex(s => s.id === stage.id);
    if (activeIndex > thisIndex || currentStage === 'COMPLETE') return 'completed';
    return 'pending';
  };

  return (
    <div className="pipeline-master-card">
      <div className="pipeline-top-row">
        <div className="pipeline-title-box">
          <div className="pipeline-badge">CLOSED-LOOP PROVING TIMELINE</div>
          <h2 className="pipeline-heading">Autonomous Adversarial Hardening Pipeline</h2>
        </div>

        {/* Primary Master Execution CTA */}
        <button
          className={`master-cta-btn ${isRunning ? 'running' : ''}`}
          onClick={onRun}
          disabled={isRunning}
        >
          {isRunning ? (
            <>
              <Loader2 size={16} className="animate-spin text-white" />
              <span>Executing Proving Ground ({progress}%)...</span>
            </>
          ) : (
            <>
              <Play size={16} className="fill-current text-obsidian" />
              <span>RUN PROVING GROUND</span>
            </>
          )}
        </button>
      </div>

      {/* Progress Line */}
      {isRunning && (
        <div className="proving-progress-track">
          <div className="proving-progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
      )}

      {/* 5-Stage Stepper Grid */}
      <div className="pipeline-steps-grid">
        {stages.map((stg, idx) => {
          const status = getStageStatus(stg);
          const Icon = stg.icon;
          return (
            <div key={stg.id} className={`pipeline-step-node node-${status}`}>
              <div className="step-node-header">
                <span className="step-num">STAGE {stg.step}</span>
                <span className={`step-status-chip chip-${status}`}>
                  {status === 'active' && 'IN PROGRESS'}
                  {status === 'completed' && 'PASSED'}
                  {status === 'pending' && 'QUEUED'}
                  {status === 'idle' && 'READY'}
                </span>
              </div>

              <div className="step-body">
                <div className="step-icon-wrap">
                  <Icon size={16} />
                </div>
                <div className="step-text-wrap">
                  <div className="step-name">{stg.name}</div>
                  <div className="step-desc">{stg.desc}</div>
                </div>
              </div>

              {idx < stages.length - 1 && <div className="step-connector-line"></div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
