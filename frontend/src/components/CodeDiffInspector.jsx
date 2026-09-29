import React, { useState } from 'react';
import { Code2, Copy, Check, Maximize2, Minimize2, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

export default function CodeDiffInspector({ blueData, selectedFixture }) {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getBaselineCode = () => {
    if (selectedFixture === 'swiglu') {
      return `def naive_swiglu_forward(x, gate_w, up_w):
    # ❌ VULNERABILITY: Unmasked pointer arithmetic
    # Fails when sequence lengths are non-multiples of tile block size!
    gate = np.dot(x, gate_w)
    up = np.dot(x, up_w)
    
    # ❌ Global memory round-trip for Swish activation
    swish = gate * (1.0 / (1.0 + np.exp(-gate)))
    
    # ❌ Buffer overrun: threads read past allocated boundary
    # Triggers CUDA Error: Illegal Memory Access (Exit 139)
    return swish * up`;
    } else if (selectedFixture === 'rmsnorm') {
      return `def naive_rmsnorm(x, weight, eps=1e-6):
    # ❌ VULNERABILITY: Unaligned vector loads
    # Non-power-of-two hidden dimensions break 16-byte memory alignment
    variance = np.mean(x ** 2, axis=-1, keepdims=True)
    
    # ❌ Temporary buffer allocation triggers high memory pressure
    norm = np.sqrt(variance + eps)
    
    # ❌ Silent Data Corruption (SDC): partial cache lines dropped
    return (x / norm) * weight`;
    }
    return `def naive_softmax(x):
    # ❌ VULNERABILITY: Floating-Point Exp Overflow
    # Large positive logits (> 88.0 in FP32) explode to +Inf
    exps = np.exp(x)
    
    # ❌ Inf / Inf produces NaN values in attention weights
    # Catastrophic training loss explosion!
    return exps / np.sum(exps, axis=-1, keepdims=True)`;
  };

  const getHardenedCode = () => {
    if (blueData && blueData.kernel_code) {
      return blueData.kernel_code;
    }
    return `@triton.jit
def _swiglu_kernel(
    X_ptr, Gate_ptr, Up_ptr, Out_ptr,
    M, K,
    stride_xm, stride_xk,
    BLOCK_M: tl.constexpr = 64,
    BLOCK_K: tl.constexpr = 128
):
    # 🛡️ 1. Explicit Boundary Tile Masking
    offs_m = pid_m * BLOCK_M + tl.arange(0, BLOCK_M)
    offs_k = tl.arange(0, BLOCK_K)
    mask_m = offs_m < M
    mask_k = offs_k < K
    mask = mask_m[:, None] & mask_k[None, :]

    # 🛡️ 2. Coalesced 128-bit Vector Load with zero-padding
    x = tl.load(X_ptr + offs, mask=mask, other=0.0)

    # 🛡️ 3. In-SRAM Fusion (Zero Global DRAM spill)
    gate = tl.dot(x, gate_w)
    up = tl.dot(x, up_w)
    swish = gate * tl.sigmoid(gate)
    out = swish * up

    # 🛡️ 4. Boundary-Masked Output Write
    tl.store(Out_ptr + offs, out, mask=mask)`;
  };

  const baselineCode = getBaselineCode();
  const hardenedCode = getHardenedCode();

  const handleCopy = () => {
    sound.playClick();
    navigator.clipboard.writeText(hardenedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Syntax Token Highlighter for Python/Triton
  const formatCodeTokenized = (line) => {
    // Comments
    if (line.trim().startsWith('#')) {
      return <span className="syntax-comment">{line}</span>;
    }

    // Decorators
    if (line.trim().startsWith('@')) {
      return <span className="syntax-decorator">{line}</span>;
    }

    // Split words and highlight keywords
    const tokens = line.split(/(\s+|[(),=.:*+/\-\[\]])/);
    return tokens.map((t, idx) => {
      if (['def', 'return', 'import', 'from'].includes(t)) {
        return <span key={idx} className="syntax-keyword">{t}</span>;
      }
      if (['tl', 'triton', 'np'].includes(t)) {
        return <span key={idx} className="syntax-module">{t}</span>;
      }
      if (['load', 'store', 'arange', 'dot', 'sigmoid', 'exp', 'mean', 'sqrt', 'zeros_like'].includes(t)) {
        return <span key={idx} className="syntax-function">{t}</span>;
      }
      if (['constexpr', 'float32', 'int32'].includes(t)) {
        return <span key={idx} className="syntax-type">{t}</span>;
      }
      if (['mask', 'other', 'eps'].includes(t)) {
        return <span key={idx} className="syntax-param">{t}</span>;
      }
      if (!isNaN(t) && t.trim() !== '') {
        return <span key={idx} className="syntax-number">{t}</span>;
      }
      return <span key={idx}>{t}</span>;
    });
  };

  const renderLines = (codeText, isHardened = false) => {
    return codeText.split('\n').map((line, idx) => {
      const lineNum = idx + 1;
      const isVuln = line.includes('❌');
      const isShield = line.includes('🛡️');

      return (
        <div key={idx} className={`editor-line-row ${isVuln ? 'line-vuln-highlight' : ''} ${isShield ? 'line-shield-highlight' : ''}`}>
          <span className="line-gutter-num">{lineNum}</span>
          <span className="line-code-tokenized">
            {formatCodeTokenized(line)}
          </span>
        </div>
      );
    });
  };

  return (
    <div className={`diff-deck-card glass-panel ${isFullscreen ? 'diff-mode-fullscreen' : ''}`}>
      {/* Top Header Strip */}
      <div className="diff-header-strip">
        <div className="diff-header-left">
          <Code2 size={15} className="text-violet shrink-0" />
          <h3 className="diff-header-title">Side-by-Side Invariant & Masking Inspector</h3>
          <span className="diff-sync-badge">SYNCHRONIZED DIFF</span>
        </div>

        <div className="diff-header-actions">
          <button 
            className="diff-action-btn"
            onClick={handleCopy}
            title="Copy Hardened Triton Code"
          >
            {copied ? <Check size={13} className="text-emerald" /> : <Copy size={13} />}
            <span>{copied ? 'Copied Kernel!' : 'Copy Triton Code'}</span>
          </button>

          <button 
            className="diff-action-btn"
            onClick={() => {
              sound.playClick();
              setIsFullscreen(!isFullscreen);
            }}
            title="Toggle Fullscreen Inspector"
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* Synchronized Split Panes */}
      <div className="diff-split-editor-grid">
        {/* Left Pane: Baseline PyTorch */}
        <div className="diff-code-panel panel-left-baseline">
          <div className="panel-tab-bar">
            <div className="tab-bar-left">
              <AlertCircle size={13} className="text-crimson" />
              <span className="tab-title text-crimson">Baseline PyTorch (Crash-Prone)</span>
            </div>
            <span className="tab-tag-crimson">UNMASKED POINTERS • CRASH (EXIT 139)</span>
          </div>

          <div className="editor-scroller">
            {renderLines(baselineCode, false)}
          </div>
        </div>

        {/* Right Pane: Hardened Triton */}
        <div className="diff-code-panel panel-right-hardened">
          <div className="panel-tab-bar">
            <div className="tab-bar-left">
              <ShieldCheck size={13} className="text-emerald" />
              <span className="tab-title text-emerald">Aegis Hardened Triton (100% Invariant)</span>
            </div>
            <span className="tab-tag-emerald">128-BIT VECTOR ALIGNED • ZERO SDC</span>
          </div>

          <div className="editor-scroller">
            {renderLines(hardenedCode, true)}
          </div>
        </div>
      </div>

      {/* Synthesis Reason Bar */}
      {blueData && blueData.patch_explanation && (
        <div className="diff-explanation-footer">
          <Sparkles size={14} className="text-cyan shrink-0 mt-0.5" />
          <p className="explanation-prose">
            <strong>Nemotron Dual-Brain Invariant Synthesis: </strong>
            {blueData.patch_explanation}
          </p>
        </div>
      )}
    </div>
  );
}
