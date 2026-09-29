import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import OperationSelector from './components/OperationSelector';
import TavilyRadar from './components/TavilyRadar';
import StateDag from './components/StateDag';
import TerminalWindow from './components/TerminalWindow';
import CodeDiffInspector from './components/CodeDiffInspector';
import TelemetryHud from './components/TelemetryHud';
import AttestationModal from './components/AttestationModal';
import { sound } from './utils/audio';

export default function App() {
  const [hardwareTargets, setHardwareTargets] = useState([
    'NVIDIA Hopper H100 SXM5',
    'NVIDIA Ada Lovelace L40S',
    'NVIDIA Blackwell B200'
  ]);
  const [selectedHardware, setSelectedHardware] = useState('NVIDIA Hopper H100 SXM5');
  const [fixtures, setFixtures] = useState([]);
  const [selectedFixture, setSelectedFixture] = useState('swiglu');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStage, setCurrentStage] = useState('IDLE');
  const [progress, setProgress] = useState(0);

  const [logs, setLogs] = useState([
    { type: 'dim', text: 'Aegis-Kernel Mission Control Initialized.' },
    { type: 'dim', text: 'Nebius Token Factory Sandbox Connected [NVIDIA Hopper H100 Target].' },
    { type: 'dim', text: 'Tavily Hardware & Compiler Oracle Online.' }
  ]);

  const [tavilyData, setTavilyData] = useState(null);
  const [redData, setRedData] = useState(null);
  const [blueData, setBlueData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [attestation, setAttestation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch initial fixtures and hardware targets from backend
  useEffect(() => {
    fetch('http://localhost:8000/api/v1/fixtures')
      .then(res => res.json())
      .then(data => setFixtures(data))
      .catch(() => {
        // Fallback default
        setFixtures([
          { 
            id: 'swiglu', 
            name: 'Ragged Fused SwiGLU', 
            category: 'Transformer MLP', 
            speedup_target: 2.35,
            vulnerability_type: 'CUDA Illegal Memory Access / Buffer Overrun'
          },
          { 
            id: 'rmsnorm', 
            name: 'Unaligned RMSNorm', 
            category: 'Normalization', 
            speedup_target: 2.33,
            vulnerability_type: 'Silent Data Corruption (SDC) / Misaligned Loads'
          },
          { 
            id: 'softmax', 
            name: 'Safe Scaled Online Softmax', 
            category: 'Attention Mechanism', 
            speedup_target: 2.27,
            vulnerability_type: 'Floating-Point NaN / Inf Overflow'
          }
        ]);
      });

    fetch('http://localhost:8000/api/v1/hardware-targets')
      .then(res => res.json())
      .then(targets => {
        if (targets && targets.length > 0) setHardwareTargets(targets);
      })
      .catch(() => {});
  }, []);

  const addLog = (text, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { text: `[${timestamp}] ${text}`, type }]);
  };

  const handleClearLogs = () => {
    sound.playClick();
    setLogs([{ type: 'dim', text: 'Terminal output cleared by operator.' }]);
  };

  const handleLaunchProvingGround = () => {
    setIsRunning(true);
    setCurrentStage('INIT');
    setProgress(5);
    setLogs([]);
    setTavilyData(null);
    setRedData(null);
    setBlueData(null);
    setMetrics(null);
    setAttestation(null);

    addLog(`Initiating Aegis-Kernel Proving Ground for target: [${selectedFixture}] on [${selectedHardware}]`, 'info');

    const sseUrl = `http://localhost:8000/api/v1/execute/${selectedFixture}?hardware_target=${encodeURIComponent(selectedHardware)}`;
    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setProgress(data.progress || 0);

        if (data.stage === 'TAVILY_RECON') {
          setCurrentStage('TAVILY');
          addLog(data.message, 'info');
        } else if (data.stage === 'TAVILY_RECON_COMPLETE') {
          setTavilyData(data.tavily_intel);
          addLog(`[TAVILY ORACLE] Verified 128-bit vector alignment specs for ${selectedHardware}.`, 'success');
        } else if (data.stage === 'RED_ATTACK_SYNTHESIS') {
          setCurrentStage('RED_ATTACK');
          addLog(data.message, 'info');
        } else if (data.stage === 'SANDBOX_RED_EXECUTE') {
          setCurrentStage('SANDBOX_FAIL');
          sound.playCrashAlert();
          setRedData(data.red_attack);
          addLog(`[CRIMSON ALERT] Sandbox Exit Code: ${data.red_attack.exit_code}`, 'alert');
          addLog(data.red_attack.stack_trace, 'alert');
        } else if (data.stage === 'BLUE_SYNTHESIS') {
          setCurrentStage('BLUE_SYNTHESIS');
          addLog(data.message, 'info');
        } else if (data.stage === 'BLUE_SYNTHESIS_COMPLETE') {
          setBlueData(data.blue_patch);
          addLog(`[NEMOTRON BLUE] Hardened Triton Kernel Synthesized with Boundary Masking.`, 'success');
        } else if (data.stage === 'DUAL_VERIFY') {
          setCurrentStage('COMPLETE');
          addLog(data.message, 'info');
        } else if (data.stage === 'COMPLETE') {
          setCurrentStage('COMPLETE');
          sound.playVictory();
          setMetrics(data.metrics);
          setAttestation(data.attestation_hash);
          addLog(data.message, 'success');
          addLog(`Cryptographic Audit Attestation: ${data.attestation_hash}`, 'success');
          setIsRunning(false);
          eventSource.close();
        }
      } catch (e) {
        console.error('SSE Parsing error:', e);
      }
    };

    eventSource.onerror = () => {
      setIsRunning(false);
      eventSource.close();
    };
  };

  return (
    <div className="aegis-app-wrapper">
      {/* 1. Master Header */}
      <Header 
        hardwareTargets={hardwareTargets}
        selectedHardware={selectedHardware}
        setSelectedHardware={setSelectedHardware}
        isRunning={isRunning}
      />

      {/* 2. Main 3-Column Responsive Grid */}
      <main className="master-grid-container">
        {/* Left Column: Operation Module Selector & Tavily Grounding */}
        <div className="grid-col-left">
          <OperationSelector 
            fixtures={fixtures}
            selectedFixture={selectedFixture}
            setSelectedFixture={setSelectedFixture}
            isRunning={isRunning}
            handleLaunch={handleLaunchProvingGround}
            currentStage={currentStage}
          />

          <TavilyRadar 
            tavilyData={tavilyData}
            selectedHardware={selectedHardware}
            isRunning={isRunning}
          />
        </div>

        {/* Center Column: Pipeline DAG, Terminal & Invariant Diff */}
        <div className="grid-col-center">
          <StateDag 
            currentStage={currentStage}
            progress={progress}
          />

          <TerminalWindow 
            logs={logs}
            redData={redData}
            tavilyData={tavilyData}
            metrics={metrics}
            isRunning={isRunning}
            onClearLogs={handleClearLogs}
          />

          <CodeDiffInspector 
            blueData={blueData}
            selectedFixture={selectedFixture}
          />
        </div>

        {/* Right Column: Telemetry HUD, Dynamic Roofline & Attestation */}
        <div className="grid-col-right">
          <TelemetryHud 
            metrics={metrics}
            attestation={attestation}
            selectedFixture={selectedFixture}
            selectedHardware={selectedHardware}
            onOpenAttestation={() => setIsModalOpen(true)}
          />
        </div>
      </main>

      {/* 3. Cryptographic Attestation & GitHub PR Modal */}
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
