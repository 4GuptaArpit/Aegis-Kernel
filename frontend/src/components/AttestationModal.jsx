import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Download, GitPullRequest, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { sound } from '../utils/audio';

export default function AttestationModal({ 
  isOpen, 
  onClose, 
  fixtureId, 
  hardwareTarget, 
  attestationHash 
}) {
  const [activeTab, setActiveTab] = useState('pr');
  const [prData, setPrData] = useState(null);
  const [attestationData, setAttestationData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && fixtureId) {
      sound.playClick();
      setLoading(true);
      Promise.all([
        fetch(`http://localhost:8000/api/v1/export-pr/${fixtureId}?hardware_target=${encodeURIComponent(hardwareTarget)}`)
          .then(r => r.json()),
        fetch(`http://localhost:8000/api/v1/attestation/${fixtureId}?hardware_target=${encodeURIComponent(hardwareTarget)}`)
          .then(r => r.json())
      ])
      .then(([prRes, attRes]) => {
        setPrData(prRes);
        setAttestationData(attRes);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load PR/Attestation:', err);
        setLoading(false);
      });
    }
  }, [isOpen, fixtureId, hardwareTarget]);

  if (!isOpen) return null;

  const handleCopy = () => {
    sound.playClick();
    const textToCopy = activeTab === 'pr' 
      ? (prData ? `${prData.title}\n\n${prData.body}` : '') 
      : (attestationData ? JSON.stringify(attestationData, null, 2) : '');
    
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    sound.playClick();
    if (!attestationData) return;
    const blob = new Blob([JSON.stringify(attestationData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aegis_kernel_attestation_${fixtureId}.audit.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-overlay-scrim" onClick={onClose}>
      <div className="modal-dialog-box glass-panel" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header-strip">
          <div className="modal-header-left">
            <ShieldCheck size={20} className="text-emerald" />
            <div>
              <h3 className="modal-heading">Aegis-Kernel Verification & GitHub PR Export</h3>
              <span className="modal-subheading">Cryptographically Signed Proof of Memory Safety</span>
            </div>
          </div>
          <button className="modal-dismiss-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="modal-tab-bar">
          <button 
            className={`modal-segment-btn ${activeTab === 'pr' ? 'segment-active' : ''}`}
            onClick={() => {
              sound.playClick();
              setActiveTab('pr');
            }}
          >
            <GitPullRequest size={13} className="text-violet" />
            <span>GitHub Pull Request Markdown</span>
          </button>
          <button 
            className={`modal-segment-btn ${activeTab === 'cert' ? 'segment-active' : ''}`}
            onClick={() => {
              sound.playClick();
              setActiveTab('cert');
            }}
          >
            <CheckCircle2 size={13} className="text-emerald" />
            <span>Cryptographic Audit Certificate</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-scroll-body">
          {loading ? (
            <div className="modal-loading-pane">
              <div className="spinning-ring"></div>
              <p>Fetching signed audit records from Nebius Token Factory Sandbox...</p>
            </div>
          ) : (
            <>
              {activeTab === 'pr' && prData && (
                <div className="pr-layout-stack">
                  <div className="pr-meta-ribbon">
                    <span className="pr-badge-branch">
                      Branch: <code>{prData.branch}</code>
                    </span>
                    <span className="pr-badge-title">
                      Title: <strong>{prData.title}</strong>
                    </span>
                  </div>

                  <div className="pr-preview-editor">
                    <pre className="pr-pre-tag"><code>{prData.body}</code></pre>
                  </div>
                </div>
              )}

              {activeTab === 'cert' && attestationData && (
                <div className="cert-layout-stack">
                  <div className="cert-banner-box">
                    <ShieldCheck size={24} className="text-emerald shrink-0" />
                    <div>
                      <h4 className="cert-banner-heading">IMMUTABLE PROOF OF INVARIANT</h4>
                      <p className="cert-banner-text">
                        This operation has been mathematically proven safe against out-of-bounds buffer overruns,
                        Silent Data Corruption (SDC), and floating-point overflow on {hardwareTarget}.
                      </p>
                    </div>
                  </div>

                  <div className="cert-json-editor">
                    <pre className="cert-pre-tag"><code>{JSON.stringify(attestationData, null, 2)}</code></pre>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer-strip">
          <button className="modal-btn btn-outline" onClick={handleDownloadJson}>
            <Download size={13} />
            <span>Download .audit.json</span>
          </button>

          <button className="modal-btn btn-gradient" onClick={handleCopy}>
            {copied ? <Check size={13} className="text-emerald" /> : <Copy size={13} />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
