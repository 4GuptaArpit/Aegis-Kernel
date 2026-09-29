import React from 'react';
import { Radio, ExternalLink, ShieldCheck, Cpu, ArrowUpRight } from 'lucide-react';

export default function TavilyRadar({ tavilyData, selectedHardware, isRunning }) {
  return (
    <div className="tavily-card glass-panel">
      {/* Radar Header */}
      <div className="tavily-header">
        <div className="tavily-brand">
          <div className="radar-sweep-orb">
            <span className="sweep-beam"></span>
            <Radio size={14} className="radar-icon text-cyan" />
          </div>
          <div>
            <h3 className="tavily-title">Tavily Hardware & Compiler Oracle</h3>
            <span className="tavily-sub">Real-Time SM Memory Hierarchy Grounding</span>
          </div>
        </div>

        <div className={`oracle-pill ${tavilyData ? 'pill-grounded' : isRunning ? 'pill-searching' : 'pill-idle'}`}>
          <span className="oracle-dot"></span>
          <span>{tavilyData ? 'GROUNDED' : isRunning ? 'QUERYING...' : 'STANDBY'}</span>
        </div>
      </div>

      {/* Hardware Spec Telemetry Grid */}
      <div className="hardware-specs-grid">
        <div className="hw-stat-cell">
          <span className="hw-stat-label">GPU TARGET</span>
          <span className="hw-stat-val text-white">{selectedHardware.replace('NVIDIA ', '')}</span>
        </div>
        <div className="hw-stat-cell">
          <span className="hw-stat-label">SM COUNT</span>
          <span className="hw-stat-val text-violet">
            {tavilyData ? `${tavilyData.architecture_specs.sm_count} SMs` : '132 SMs'}
          </span>
        </div>
        <div className="hw-stat-cell">
          <span className="hw-stat-label">SRAM / SM</span>
          <span className="hw-stat-val text-cyan">
            {tavilyData ? `${tavilyData.architecture_specs.shared_memory_per_sm_kb} KB` : '228 KB'}
          </span>
        </div>
        <div className="hw-stat-cell">
          <span className="hw-stat-label">HBM BANDWIDTH</span>
          <span className="hw-stat-val text-emerald">
            {tavilyData ? `${tavilyData.architecture_specs.memory_bandwidth_tb_s} TB/s` : '3.35 TB/s'}
          </span>
        </div>
      </div>

      {/* Live Compiler Advisories */}
      <div className="advisories-deck">
        <span className="advisories-deck-title">Hardware Memory Constraints & Invariants:</span>

        {tavilyData ? (
          <div className="advisories-stream">
            {tavilyData.compiler_advisories.map((adv, idx) => (
              <div key={idx} className="advisory-entry">
                <span className="entry-bullet">›</span>
                <span className="entry-text">{adv}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="advisories-standby">
            <Radio size={20} className="standby-icon text-dim" />
            <p className="standby-text">
              Engage proving ground to query live Hopper/Ada warp layout, cache line alignment, and Triton compiler advisories via Tavily.
            </p>
          </div>
        )}
      </div>

      {/* Verified Ground Truth Links */}
      {tavilyData && tavilyData.citations && (
        <div className="citations-bar">
          <span className="citations-tag">GROUND TRUTH REFERENCES:</span>
          <div className="citation-pill-row">
            {tavilyData.citations.map((cite, idx) => {
              let domain = cite.replace('https://', '').split('/')[0];
              if (domain.includes('nvidia.com')) domain = 'docs.nvidia.com';
              else if (domain.includes('github.com')) domain = 'github.com/triton';
              else if (domain.includes('arxiv.org')) domain = 'arxiv.org (FlashAttention)';

              return (
                <a 
                  key={idx} 
                  href={cite} 
                  target="_blank" 
                  rel="noreferrer"
                  className="citation-link-badge"
                >
                  <span>{domain}</span>
                  <ExternalLink size={9} />
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
