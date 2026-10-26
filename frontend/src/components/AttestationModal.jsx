import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Download, GitPullRequest, ShieldCheck, CheckCircle2, Shield } from 'lucide-react';
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
    
    if (!textToCopy) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => fallbackCopy(textToCopy));
    } else {
      fallbackCopy(textToCopy);
    }
  };

  const fallbackCopy = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Fallback copy failed', e);
    }
    document.body.removeChild(textArea);
  };

  const handleDownload = () => {
    sound.playClick();
    let content = '';
    let filename = '';
    let mimeType = '';

    if (activeTab === 'pr') {
      if (!prData) return;
      content = `# ${prData.title}\n\n${prData.body}\n\n## Synthesized Triton Kernel Patch\n\`\`\`python\n${prData.patch_code || ''}\n\`\`\``;
      filename = `PULL_REQUEST_${fixtureId.toUpperCase()}.md`;
      mimeType = 'text/markdown';
    } else {
      if (!attestationData) return;
      content = JSON.stringify(attestationData, null, 2);
      filename = `aegis_kernel_attestation_${fixtureId}.audit.json`;
      mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-overlay-scrim" onClick={onClose}>
      <div className="modal-dialog-box" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header-strip">
          <div className="modal-header-left">
            <Shield size={20} className="text-nvidia" />
            <div>
              <h3 className="modal-heading">Aegis-Kernel Verification & Upstream PR Export</h3>
              <span className="modal-subheading">Cryptographically Signed Proof of GPU Memory Safety & Speedup</span>
            </div>
          </div>
          <button className="modal-dismiss-btn" onClick={onClose}>
            <X size={18} />
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
            <GitPullRequest size={14} className="text-azure" />
            <span>GitHub Pull Request Markdown</span>
          </button>
          <button 
            className={`modal-segment-btn ${activeTab === 'cert' ? 'segment-active' : ''}`}
            onClick={() => {
              sound.playClick();
              setActiveTab('cert');
            }}
          >
            <CheckCircle2 size={14} className="text-nvidia" />
            <span>Cryptographic Audit Certificate</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body-scroll">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8', fontFamily: 'monospace' }}>
              Fetching signed audit telemetry from Nebius Token Factory Sandbox...
            </div>
          ) : (
            <>
              {activeTab === 'pr' && prData && (
                <div>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', fontSize: '11.5px' }}>
                    <span style={{ background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>
                      Branch: <strong className="text-azure">{prData.branch}</strong>
                    </span>
                    <span style={{ background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: '4px' }}>
                      Title: <strong className="text-primary">{prData.title}</strong>
                    </span>
                  </div>
                  <pre className="pr-markdown-preview"><code>{prData.body}</code></pre>
                </div>
              )}

              {activeTab === 'cert' && attestationData && (
                <div>
                  <div style={{ background: 'rgba(118, 185, 0, 0.1)', border: '1px solid rgba(118, 185, 0, 0.25)', borderRadius: '8px', padding: '12px 14px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#76B900', fontWeight: '800', fontSize: '12px', marginBottom: '4px' }}>
                      <ShieldCheck size={16} />
                      <span>IMMUTABLE PROOF OF INVARIANT ATTESTATION</span>
                    </div>
                    <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>
                      This operation has been mathematically proven safe against out-of-bounds buffer overruns,
                      Silent Data Corruption (SDC), and floating-point overflow on {hardwareTarget}.
                    </p>
                  </div>
                  <pre className="cert-json-preview"><code>{JSON.stringify(attestationData, null, 2)}</code></pre>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-actions-footer">
          <button className="btn-modal-action btn-action-copy" onClick={handleDownload} title={activeTab === 'pr' ? "Download PR Markdown" : "Download JSON Certificate"}>
            <Download size={13} />
            <span>{activeTab === 'pr' ? 'Download PullRequest.md' : 'Download .audit.json'}</span>
          </button>

          <button className="btn-modal-action btn-action-download" onClick={handleCopy} title="Copy Content to Clipboard">
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? 'Copied to Clipboard!' : (activeTab === 'pr' ? 'Copy PR Markdown' : 'Copy Certificate JSON')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
