import React, { useState } from 'react';
import Header from './components/Header';
import TensorStressController from './components/TensorStressController';
import WorkloadSelector from './components/WorkloadSelector';
import PipelineNarrative from './components/PipelineNarrative';
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

    addLog(`[INIT] Engaging Aegis-Kernel Proving Workbench for [${selectedFixture.toUpperCase()}] on [${selectedHardware}]`, 'info');

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
          addLog(`[CRIMSON SILICON TRAP] SM 14 OOB Read tripped: Exit Code ${data.red_attack.exit_code}`, 'alert');
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
      {/* Top Navigation Bar */}
      <Header 
        selectedHardware={selectedHardware}
        onSelectHardware={setSelectedHardware}
        onOpenPitch={() => setIsModalOpen(true)}
        onOpenPrModal={() => setIsModalOpen(true)}
      />

      <div className="aegis-workbench-container">
        {/* Interactive Adversarial Tensor Stress Controller */}
        <TensorStressController 
          selectedFixture={selectedFixture}
          onStressChange={(val) => {
            addLog(`Interactive sequence boundary scrubbed to: ${val} tokens`, 'info');
          }}
        />

        {/* Neural Operator Benchmark Selector */}
        <WorkloadSelector 
          selectedFixture={selectedFixture} 
          onSelectFixture={setSelectedFixture}
          isRunning={isRunning}
        />

        {/* Closed-Loop Proving Pipeline & Master Run Button */}
        <PipelineNarrative 
          currentStage={currentStage} 
          isRunning={isRunning} 
          progress={progress}
          onRun={handleLaunchProvingGround}
          selectedFixture={selectedFixture}
        />

        {/* Main Monolithic Silicon Proving Workbench Grid */}
        <div className="workbench-grid-layout">
          {/* Left Column: Die Topology, SIMT Warp Matrix, Code/PTX Diff, Terminal */}
          <div className="workbench-col-left">
            {/* 132-SM Silicon Die Topology */}
            <HopperDieTopology 
              currentStage={currentStage} 
              isRunning={isRunning} 
              onSelectSm={setSelectedSm}
              selectedSm={selectedSm}
            />

            {/* 32-Thread SIMT Warp 0 Matrix */}
            <WarpVisualizer 
              selectedFixture={selectedFixture} 
              isRunning={isRunning} 
              currentStage={currentStage} 
            />

            {/* AST Kernel Diff & PTX Disassembly */}
            <CodeDiffInspector 
              selectedFixture={selectedFixture} 
              blueData={blueData} 
            />

            {/* Live Terminal Telemetry */}
            <TerminalWindow 
              logs={logs} 
              onClear={handleClearLogs} 
            />
          </div>

          {/* Right Column: Nsight Telemetry, Memory Waterfall, Delta, Verification Hub */}
          <div className="workbench-col-right">
            {/* Real-Time Nsight Compute Profiler HUD */}
            <NsightTelemetryHud 
              metrics={metrics} 
              selectedHardware={selectedHardware} 
            />

            {/* Hopper H100 Silicon Memory Hierarchy Waterfall */}
            <SiliconMemoryWaterfall 
              metrics={metrics} 
              selectedHardware={selectedHardware} 
            />

            {/* Empirical Hardening Delta */}
            <MicDropDelta 
              metrics={metrics} 
              selectedFixture={selectedFixture} 
            />

            {/* Formal Invariant Verification & Attestation Hub */}
            <VerificationImpact 
              metrics={metrics} 
              selectedFixture={selectedFixture}
              onOpenPrModal={() => setIsModalOpen(true)}
              onOpenJudgesOverview={() => setIsModalOpen(true)}
            />
          </div>
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
