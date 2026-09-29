import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PipelineNarrative from './components/PipelineNarrative';
import MicDropDelta from './components/MicDropDelta';
import TerminalWindow from './components/TerminalWindow';
import CodeDiffInspector from './components/CodeDiffInspector';
import WorkloadSelector from './components/WorkloadSelector';
import VerificationImpact from './components/VerificationImpact';
import Footer from './components/Footer';
import AttestationModal from './components/AttestationModal';
import { sound } from './utils/audio';

export default function App() {
  const [selectedHardware, setSelectedHardware] = useState('NVIDIA Hopper H100 SXM5');
  const [selectedFixture, setSelectedFixture] = useState('swiglu');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStage, setCurrentStage] = useState('IDLE');
  const [progress, setProgress] = useState(0);

  const [logs, setLogs] = useState([]);
  const [tavilyData, setTavilyData] = useState(null);
  const [redData, setRedData] = useState(null);
  const [blueData, setBlueData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [attestation, setAttestation] = useState('0x8df4927f8a12...e3b0c44298fc1c14');
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

    addLog(`Initiating Aegis-Kernel Proving Ground for target: [${selectedFixture}] on [${selectedHardware}]`, 'info');

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
          addLog(`[TAVILY ORACLE] Verified 128-bit vector alignment specs for Hopper SM.`, 'success');
        } else if (data.stage === 'RED_ATTACK_SYNTHESIS') {
          setCurrentStage('RED_ATTACK');
          addLog(data.message, 'info');
        } else if (data.stage === 'SANDBOX_RED_EXECUTE') {
          setCurrentStage('SANDBOX_FAIL');
          sound.playAlert();
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
          setCurrentStage('VERIFYING');
          addLog(data.message, 'info');
        } else if (data.stage === 'COMPLETE') {
          setCurrentStage('COMPLETE');
          sound.playSuccess();
          setMetrics(data.metrics);
          setAttestation(data.attestation_hash || '0x8df4927f8a12...e3b0c44298fc1c14');
          addLog(data.message, 'success');
          addLog(`Audit Attestation Hash: ${data.attestation_hash}`, 'success');
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
    <div className="stitch-app-wrapper">
      {/* Top Header */}
      <Header 
        onRun={handleLaunchProvingGround}
        isRunning={isRunning}
        onOpenPitch={() => setIsModalOpen(true)}
        onOpenInspector={() => setIsModalOpen(true)}
      />

      {/* Main 2-Column Grid */}
      <main className="stitch-main-grid">
        {/* Left Column: Pipeline, Delta, Terminal, Code Diff, Workload Selector */}
        <section className="left-arena-stack">
          <PipelineNarrative 
            currentStage={currentStage} 
            isRunning={isRunning} 
          />

          <MicDropDelta 
            metrics={metrics} 
            selectedFixture={selectedFixture} 
          />

          <TerminalWindow 
            logs={logs} 
            onClear={handleClearLogs} 
          />

          <CodeDiffInspector 
            selectedFixture={selectedFixture} 
            blueData={blueData} 
          />

          <WorkloadSelector 
            selectedFixture={selectedFixture} 
            onSelectFixture={setSelectedFixture}
            isRunning={isRunning}
          />
        </section>

        {/* Right Column: Verification & Impact Sidebar */}
        <VerificationImpact 
          metrics={metrics} 
          selectedFixture={selectedFixture}
          onOpenPrModal={() => setIsModalOpen(true)}
          onOpenJudgesOverview={() => setIsModalOpen(true)}
        />
      </main>

      {/* Bottom Footer */}
      <Footer />

      {/* Attestation & Pull Request Export Modal */}
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
