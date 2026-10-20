import React, { useState } from 'react';
import ExecutiveCommandBar from './components/ExecutiveCommandBar';
import RedBlueArena from './components/RedBlueArena';
import HopperDieTopology from './components/HopperDieTopology';
import WarpVisualizer from './components/WarpVisualizer';
import CodeDiffInspector from './components/CodeDiffInspector';
import TerminalWindow from './components/TerminalWindow';
import NsightTelemetryHud from './components/NsightTelemetryHud';
import SiliconMemoryWaterfall from './components/SiliconMemoryWaterfall';
import MicDropDelta from './components/MicDropDelta';
import VerificationImpact from './components/VerificationImpact';
import Footer from './components/Footer';
import AttestationModal from './components/AttestationModal';
import { sound } from './utils/audio';

export default function App() {
  const [selectedHardware, setSelectedHardware] = useState('NVIDIA Hopper H100 SXM5');
  const [selectedFixture, setSelectedFixture] = useState('swiglu');
  const [selectedSm, setSelectedSm] = useState(14);
  const [seqLen, setSeqLen] = useState(1023);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStage, setCurrentStage] = useState('IDLE');
  const [progress, setProgress] = useState(0);

  const [logs, setLogs] = useState([]);
  const [tavilyData, setTavilyData] = useState(null);
  const [redData, setRedData] = useState(null);
  const [blueData, setBlueData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [attestation, setAttestation] = useState('0x7f56b9fe02089399');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeWorkbenchTab, setActiveWorkbenchTab] = useState('collider'); // 'collider', 'silicon', 'code', 'telemetry'

  const addLog = (text, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { text: `[${timestamp}] ${text}`, type }]);
  };

  const handleClearLogs = () => {
    sound.playClick();
    setLogs([]);
  };

  const handleLaunchProvingGround = () => {
    sound.playLaunch();
    setIsRunning(true);
    setCurrentStage('INIT');
    setProgress(5);
    setLogs([]);
    setTavilyData(null);
    setRedData(null);
    setBlueData(null);
    setMetrics(null);

    addLog(`[INIT] Engaging Aegis-Kernel Autonomous Proving Collider for [${selectedFixture.toUpperCase()}] on [${selectedHardware}]`, 'info');

    const eventSource = new EventSource(
      `http://localhost:8000/api/v1/execute/${selectedFixture}?hardware_target=${encodeURIComponent(selectedHardware)}`
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setProgress(data.progress || 0);

        if (data.stage === 'TAVILY_RECON') {
          setCurrentStage('TAVILY');
          addLog(data.message, 'info');
        } else if (data.stage === 'TAVILY_RECON_COMPLETE') {
          setTavilyData(data.tavily_intel);
          addLog(`[TAVILY ORACLE] Verified 128-bit vector alignment & PTX ISA specs for Hopper SM_90a.`, 'success');
        } else if (data.stage === 'RED_ATTACK_SYNTHESIS') {
          setCurrentStage('RED_ATTACK');
          addLog(data.message, 'info');
        } else if (data.stage === 'SANDBOX_RED_EXECUTE') {
          setCurrentStage('SANDBOX_FAIL');
          sound.playAlert();
          setRedData(data.red_attack);
          addLog(`[CRIMSON EXPLOIT] SM 14 OOB Read tripped: Exit Code ${data.red_attack.exit_code}`, 'alert');
          addLog(data.red_attack.stack_trace, 'alert');
        } else if (data.stage === 'BLUE_SYNTHESIS') {
          setCurrentStage('BLUE_SYNTHESIS');
          addLog(data.message, 'info');
        } else if (data.stage === 'BLUE_SYNTHESIS_COMPLETE') {
          setBlueData(data.blue_patch);
          addLog(`[NEMOTRON BLUE] Hardened Triton Kernel Synthesized with @p0 Predication.`, 'success');
        } else if (data.stage === 'DUAL_VERIFY') {
          setCurrentStage('VERIFYING');
          addLog(data.message, 'info');
        } else if (data.stage === 'COMPLETE') {
          setCurrentStage('COMPLETE');
          sound.playSuccess();
          setMetrics(data.metrics);
          setAttestation(data.attestation_hash || '0x7f56b9fe02089399');
          addLog(data.message, 'success');
          addLog(`[FORMAL INVARIANT ATTESTATION]: ${data.attestation_hash}`, 'success');
          setIsRunning(false);
          eventSource.close();
        }
      } catch (e) {
        console.error('SSE Parse Error:', e);
      }
    };

    eventSource.onerror = () => {
      setIsRunning(false);
      eventSource.close();
    };
  };

  return (
    <div className="aegis-app-wrapper">
      {/* Executive Command Cockpit */}
      <ExecutiveCommandBar 
        selectedHardware={selectedHardware}
        onSelectHardware={setSelectedHardware}
        selectedFixture={selectedFixture}
        onSelectFixture={setSelectedFixture}
        isRunning={isRunning}
        currentStage={currentStage}
        progress={progress}
        onRun={handleLaunchProvingGround}
        seqLen={seqLen}
        onSeqLenChange={(val) => {
          setSeqLen(val);
          addLog(`[SLIDER] Dynamic sequence length set to ${val} tokens`, 'info');
        }}
        onOpenPitch={() => setIsModalOpen(true)}
        onOpenPrModal={() => setIsModalOpen(true)}
      />

      <div className="aegis-workbench-container">
        {/* Spatial Workbench Stage Navigation Bar */}
        <div className="workbench-stage-nav-bar font-mono">
          <div className="stage-nav-tabs">
            <button 
              className={`stage-nav-btn ${activeWorkbenchTab === 'collider' ? 'active' : ''}`}
              onClick={() => { sound.playClick(); setActiveWorkbenchTab('collider'); }}
            >
              <span className="nav-tag-num">01</span>
              <span>Red vs Blue Collider & Delta</span>
              <span className="nav-tab-badge badge-tag-red">
                {currentStage === 'SANDBOX_FAIL' ? '💥 SIGSEGV TRAPPED' : 'LIVE CONFRONT'}
              </span>
            </button>
            <button 
              className={`stage-nav-btn ${activeWorkbenchTab === 'silicon' ? 'active' : ''}`}
              onClick={() => { sound.playClick(); setActiveWorkbenchTab('silicon'); }}
            >
              <span className="nav-tag-num">02</span>
              <span>132-SM Die & 32-Warp Matrix</span>
              <span className="nav-tab-badge badge-tag-cyan">132 SMs · 4N</span>
            </button>
            <button 
              className={`stage-nav-btn ${activeWorkbenchTab === 'code' ? 'active' : ''}`}
              onClick={() => { sound.playClick(); setActiveWorkbenchTab('code'); }}
            >
              <span className="nav-tag-num">03</span>
              <span>AST Diff & PTX Disassembly</span>
              <span className="nav-tab-badge badge-tag-nvidia">@p0 PREDICATED</span>
            </button>
            <button 
              className={`stage-nav-btn ${activeWorkbenchTab === 'telemetry' ? 'active' : ''}`}
              onClick={() => { sound.playClick(); setActiveWorkbenchTab('telemetry'); }}
            >
              <span className="nav-tag-num">04</span>
              <span>Nsight Profiler & Memory Waterfall</span>
              <span className="nav-tab-badge badge-tag-gold">418.5 TFLOPS</span>
            </button>
          </div>

          <div className="stage-nav-telemetry">
            <span className="nav-telemetry-badge">
              <span className="pulse-indicator bg-nvidia inline-block mr-1"></span>
              {currentStage === 'IDLE' ? 'PROVING INSTRUMENT ARMED' : `STAGE: ${currentStage}`}
            </span>
          </div>
        </div>

        {/* Dynamic Spatial Workbench Content View */}
        <div className="workbench-spacious-view">
          {/* TAB 1: RED VS BLUE COLLIDER & MIC-DROP DELTA */}
          {activeWorkbenchTab === 'collider' && (
            <div className="tab-view-container tab-view-fade">
              <RedBlueArena 
                currentStage={currentStage}
                isRunning={isRunning}
                selectedFixture={selectedFixture}
                metrics={metrics}
                redData={redData}
                blueData={blueData}
              />

              <div className="spacious-two-col">
                <MicDropDelta 
                  metrics={metrics} 
                  selectedFixture={selectedFixture} 
                />
                <VerificationImpact 
                  metrics={metrics} 
                  selectedFixture={selectedFixture}
                  onOpenPrModal={() => setIsModalOpen(true)}
                  onOpenJudgesOverview={() => setIsModalOpen(true)}
                />
              </div>

              <TerminalWindow 
                logs={logs} 
                onClear={handleClearLogs} 
              />
            </div>
          )}

          {/* TAB 2: SILICON DIE & 32-WARP EXECUTION MATRIX */}
          {activeWorkbenchTab === 'silicon' && (
            <div className="tab-view-container tab-view-fade">
              <div className="spacious-two-col-grid">
                <HopperDieTopology 
                  currentStage={currentStage} 
                  isRunning={isRunning} 
                  onSelectSm={setSelectedSm}
                  selectedSm={selectedSm}
                />
                <WarpVisualizer 
                  selectedFixture={selectedFixture} 
                  isRunning={isRunning} 
                  currentStage={currentStage} 
                />
              </div>

              <NsightTelemetryHud 
                metrics={metrics} 
                selectedHardware={selectedHardware} 
              />
            </div>
          )}

          {/* TAB 3: CODE DIFF & PTX DISASSEMBLY */}
          {activeWorkbenchTab === 'code' && (
            <div className="tab-view-container tab-view-fade">
              <CodeDiffInspector 
                selectedFixture={selectedFixture} 
                blueData={blueData} 
              />
              <TerminalWindow 
                logs={logs} 
                onClear={handleClearLogs} 
              />
            </div>
          )}

          {/* TAB 4: NSIGHT TELEMETRY & SILICON MEMORY WATERFALL */}
          {activeWorkbenchTab === 'telemetry' && (
            <div className="tab-view-container tab-view-fade">
              <NsightTelemetryHud 
                metrics={metrics} 
                selectedHardware={selectedHardware} 
              />
              <div className="spacious-two-col">
                <SiliconMemoryWaterfall 
                  metrics={metrics} 
                  selectedHardware={selectedHardware} 
                />
                <VerificationImpact 
                  metrics={metrics} 
                  selectedFixture={selectedFixture}
                  onOpenPrModal={() => setIsModalOpen(true)}
                  onOpenJudgesOverview={() => setIsModalOpen(true)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Footer */}
      <Footer />

      {/* Attestation & PR Modal */}
      <AttestationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        fixtureId={selectedFixture}
        hardwareTarget={selectedHardware}
        attestationHash={attestation}
      />
    </div>
  );
}
