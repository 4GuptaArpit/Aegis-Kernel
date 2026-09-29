import React, { useState } from 'react';
import { Code2, ArrowRight, Copy, Check } from 'lucide-react';
import { sound } from '../utils/audio';

export default function CodeDiffInspector({ selectedFixture, blueData }) {
  const [copied, setCopied] = useState(false);

  // Fixture code variations
  const isSwiglu = selectedFixture === 'swiglu';
  const isRmsnorm = selectedFixture === 'rmsnorm';

  const leftFileName = isSwiglu 
    ? 'ragged_swiglu_baseline.cu' 
    : (isRmsnorm ? 'unaligned_rmsnorm.cu' : 'naive_softmax_baseline.cu');

  const rightFileName = isSwiglu 
    ? 'hardened_swiglu_triton.py' 
    : (isRmsnorm ? 'hardened_rmsnorm_triton.py' : 'safe_online_softmax_triton.py');

  const leftCode = isSwiglu ? (
`// Direct unmasked raw pointer indexing
int token_idx = blockIdx.x * blockDim.x + threadIdx.x;
const half2* in_ptr = reinterpret_cast<const half2*>(input);

// CRITICAL: Out-of-bounds read at ragged edges
half2 val = in_ptr[token_idx * stride + offset];
// 💥 FAULT: threadIdx.x >= seq_len causes SIGSEGV 139`
  ) : (isRmsnorm ? (
`// Unaligned memory stride load without 16-byte boundary clamp
int col = threadIdx.x;
float x = __ldg(&input[row * hidden_dim + col]);
// 💥 SDC: Non-multiple of 128-bits corrupts floating point accumulator`
  ) : (
`// Naive exponentiation without online max subtraction
float val = expf(logits[idx]);
// 💥 OVERFLOW: logits > 88.0 triggers inf -> NaN cascading loss`
  ));

  const rightCode = isSwiglu ? (
`# Triton bounded block offsets
offs_m = pid_m * BLOCK_M + tl.arange(0, BLOCK_M)
mask_m = offs_m < total_ragged_tokens

# ZERO-PADDED LOAD: Hardware masked fallback
x_gate = tl.load(g_ptr + offs_m * str_g, mask=mask_m, other=0.0)
x_up   = tl.load(u_ptr + offs_m * str_u, mask=mask_m, other=0.0)
# 🛡️ SECURE: Mask drops invalid warps to zero registers`
  ) : (isRmsnorm ? (
`# Memory-coalesced warp tree reduction with tile masking
cols = tl.arange(0, BLOCK_SIZE)
mask = cols < N_cols
x = tl.load(row_ptr + cols, mask=mask, other=0.0)
# 🛡️ FORMAL PASS: Invariant variance calculation preserves precision`
  ) : (
`# Online max logit subtraction in SRAM registers
max_logit = tl.max(logits, axis=0)
numer = tl.exp(logits - max_logit)
# 🛡️ PROVABLE: Guarantees 0.0 NaN/Inf divergence under arbitrary range`
  ));

  const leftWarning = isSwiglu 
    ? '⚠️ Memory boundary violation on non-multiple-of-32 warps' 
    : (isRmsnorm ? '⚠️ 16-byte vector transaction alignment violated' : '⚠️ Unbounded exponentiation exceeds FP32 capacity');

  const rightSuccess = isSwiglu 
    ? '🛡️ Provable boundary immunity with zero latency penalty' 
    : (isRmsnorm ? '🛡️ Tree-reduction eliminates shared memory bank conflicts' : '🛡️ Numerically bounded softmax invariant (Milakov & Gimelshein)');

  const handleCopyRight = () => {
    sound.playClick();
    navigator.clipboard.writeText(rightCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="stitch-card code-diff-card">
      {/* Header */}
      <div className="diff-top-header">
        <div className="card-title-group">
          <Code2 size={15} className="text-violet" />
          <span className="card-title-text">Semantic AST Code Diff Inspector</span>
        </div>

        <div className="diff-format-badges">
          <span className="format-badge badge-vulnerable">CUDA C++ (Vulnerable)</span>
          <ArrowRight size={12} className="text-muted" />
          <span className="format-badge badge-safe">Triton Python (Safe & Fused)</span>
        </div>
      </div>

      {/* Side-by-Side Panes */}
      <div className="diff-panes-grid">
        {/* Left Pane: CUDA C++ Vulnerable */}
        <div className="diff-pane pane-left">
          <div className="pane-header">
            <span className="file-name text-red">{leftFileName}</span>
            <span className="status-badge badge-red">UNSAFE MEMORY</span>
          </div>

          <div className="pane-code-body">
            <pre className="font-mono text-xs leading-relaxed">
              <code>{leftCode}</code>
            </pre>
          </div>

          <div className="pane-footer text-red">
            {leftWarning}
          </div>
        </div>

        {/* Right Pane: Triton Python Safe */}
        <div className="diff-pane pane-right">
          <div className="pane-header">
            <span className="file-name text-green">{rightFileName}</span>
            <div className="flex items-center gap-2">
              <span className="status-badge badge-green">FORMALLY INVARIANT</span>
              <button 
                className="copy-code-btn" 
                onClick={handleCopyRight}
                title="Copy Triton Kernel"
              >
                {copied ? <Check size={11} className="text-green" /> : <Copy size={11} />}
              </button>
            </div>
          </div>

          <div className="pane-code-body">
            <pre className="font-mono text-xs leading-relaxed">
              <code>{rightCode}</code>
            </pre>
          </div>

          <div className="pane-footer text-green">
            {rightSuccess}
          </div>
        </div>
      </div>
    </div>
  );
}
