import React from 'react';
import { Radio, Flame, AlertTriangle, Zap, ShieldCheck, CheckCircle2, Activity } from 'lucide-react';

export default function StateDag({ currentStage, progress }) {
  const stages = [
    {
      id: 'TAVILY',
      activeOn: ['TAVILY_RECON', 'TAVILY_RECON_COMPLETE'],
      name: 'Tavily Oracle',
      sub: 'Hopper/Ada Errata',
      icon: Radio,
      accent: 'cyan'
    },
    {
      id: 'RED_ATTACK',
      activeOn: ['RED_ATTACK_SYNTHESIS'],
      name: 'Red Adversary',
      sub: 'Nemotron 3 Ultra',
      icon: Flame,
      accent: 'amber'
    },
    {
      id: 'SANDBOX_FAIL',
      activeOn: ['SANDBOX_RED_EXECUTE'],
      name: 'Sandbox Crash',
      sub: 'Exit 139 / SDC',
      icon: AlertTriangle,
      accent: 'crimson'
    },
    {
      id: 'BLUE_SYNTHESIS',
      activeOn: ['BLUE_SYNTHESIS', 'BLUE_SYNTHESIS_COMPLETE'],
      name: 'Nemotron Blue',
      sub: 'Triton Mask Synthesizer',
      icon: Zap,
      accent: 'violet'
    },
    {
      id: 'COMPLETE',
      activeOn: ['DUAL_VERIFY', 'COMPLETE'],
      name: 'Verified Invariant',
      sub: '100% Invariant & 2.35x',
      icon: ShieldCheck,
      accent: 'emerald'
    }
  ];

  const getStageState = (stageIndex, stage) => {
    if (currentStage === 'COMPLETE') return 'completed';
    const currentIndex = stages.findIndex(s => s.id === currentStage);
    if (currentIndex === -1) {
      if (currentStage === 'INIT' && stageIndex === 0) return 'active';
      return 'pending';
    }
    if (stageIndex < currentIndex) return 'completed';
    if (stageIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="photonic-dag-card glass-panel">
      {/* Top Dag Title & Progress Tracker */}
      <div className="dag-topbar">
        <div className="dag-title-left">
          <Activity size={14} className="text-emerald" />
          <h3 className="dag-main-title">Autonomous 5-Stage Closed-Loop Proving Pipeline</h3>
        </div>

        <div className="dag-progress-group">
          <div className="progress-track-groove">
            <div 
              className="progress-track-fill" 
              style={{ width: `${progress}%` }}
            >
              <div className="progress-track-glow"></div>
            </div>
          </div>
          <span className="progress-numeric">{progress}%</span>
        </div>
      </div>

      {/* 5-Node Interactive Ribbon */}
      <div className="dag-pipeline-ribbon">
        {stages.map((stage, idx) => {
          const state = getStageState(idx, stage);
          const Icon = stage.icon;

          return (
            <React.Fragment key={stage.id}>
              {/* Individual Stage Node */}
              <div className={`pipeline-node node-${state} accent-${stage.accent}`}>
                <div className="node-icon-wrapper">
                  {state === 'completed' ? (
                    <CheckCircle2 size={16} className="text-emerald check-completed" />
                  ) : (
                    <Icon size={16} className={`stage-icon icon-${stage.accent}`} />
                  )}
                  <span className="stage-seq-num">0{idx + 1}</span>
                </div>

                <div className="stage-meta-stack">
                  <span className="stage-name">{stage.name}</span>
                  <span className="stage-sub">{stage.sub}</span>
                </div>

                {state === 'active' && (
                  <div className="stage-active-pulse"></div>
                )}
              </div>

              {/* Connecting Laser Trace Line */}
              {idx < stages.length - 1 && (
                <div className={`pipeline-laser-connector ${state === 'completed' ? 'laser-completed' : ''}`}>
                  <div className="laser-trace-bar"></div>
                  {state === 'active' && <div className="laser-photon-particle"></div>}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
