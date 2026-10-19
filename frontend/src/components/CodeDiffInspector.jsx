import React, { useState } from 'react';
import { Code2, ArrowRight, Copy, Check, ShieldCheck, AlertTriangle, Binary } from 'lucide-react';
import { sound } from '../utils/audio';

export default function CodeDiffInspector({ selectedFixture, blueData }) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('source'); // 'source' or 'ptx'

  const isSwiglu = selectedFixture === 'swiglu';
  const isRmsnorm = selectedFixture === 'rmsnorm';

  const leftFileName = isSwiglu 
    ? 'vllm/csrc/ragged_swiglu_baseline.cu' 
    : (isRmsnorm ? 'flash_attn/csrc/unaligned_rmsnorm.cu' : 'transformers/csrc/naive_softmax.cu');

  const rightFileName = isSwiglu 
    ? 'aegis/kernels/hardened_swiglu_triton.py' 
    : (isRmsnorm ? 'aegis/kernels/hardened_rmsnorm_triton.py' : 'aegis/kernels/safe_softmax_triton.py');

  const leftCode = isSwiglu ? [
    { line: 1, text: '// Raw pointer indexing without boundary clamp', type: 'comment' },
    { line: 2, text: 'int token_idx = blockIdx.x * blockDim.x + threadIdx.x;', type: 'code' },
    { line: 3, text: 'const half2* in_ptr = reinterpret_cast<const half2*>(input);', type: 'code' },
    { line: 4, text: '', type: 'code' },
    { line: 5, text: '// CRITICAL VULNERABILITY: Out-of-bounds read at ragged edges', type: 'comment' },
    { line: 6, text: 'half2 val = in_ptr[token_idx * stride + offset];', type: 'vuln', note: '💥 FAULT: threadIdx.x >= seq_len causes SIGSEGV 139' },
    { line: 7, text: 'output[token_idx] = __hmul2(val, silu(val));', type: 'code' }
  ] : (isRmsnorm ? [
    { line: 1, text: '// Unaligned memory stride load without 16-byte boundary clamp', type: 'comment' },
    { line: 2, text: 'int col = threadIdx.x;', type: 'code' },
    { line: 3, text: 'float x = __ldg(&input[row * hidden_dim + col]);', type: 'vuln', note: '💥 SDC: Non-multiple of 128-bits corrupts accumulator' },
    { line: 4, text: 'float variance = warp_reduce_sum(x * x);', type: 'code' },
    { line: 5, text: 'output[row * hidden_dim + col] = x * rsqrtf(variance + eps);', type: 'code' }
  ] : [
    { line: 1, text: '// Naive exponentiation without online max subtraction', type: 'comment' },
    { line: 2, text: 'float val = expf(logits[idx]);', type: 'vuln', note: '💥 OVERFLOW: logits > 88.0 triggers inf -> NaN gradient spike' },
    { line: 3, text: 'float sum = block_reduce_sum(val);', type: 'code' },
    { line: 4, text: 'output[idx] = val / sum;', type: 'code' }
  ]);

  const rightCode = isSwiglu ? [
    { line: 1, text: '# Triton bounded block offsets with ragged boundary clamp', type: 'comment' },
    { line: 2, text: 'offs_m = pid_m * BLOCK_M + tl.arange(0, BLOCK_M)', type: 'code' },
    { line: 3, text: 'mask_m = offs_m < total_ragged_tokens', type: 'code' },
    { line: 4, text: '', type: 'code' },
    { line: 5, text: '# HARDWARE BOUNDED MASK: Drops invalid warps to zero registers', type: 'comment' },
    { line: 6, text: 'x_gate = tl.load(g_ptr + offs_m * str_g, mask=mask_m, other=0.0)', type: 'secure', note: '🛡️ ZERO-PENALTY: Hardware mask prevents illegal access' },
    { line: 7, text: 'x_up   = tl.load(u_ptr + offs_m * str_u, mask=mask_m, other=0.0)', type: 'secure' },
    { line: 8, text: 'tl.store(out_ptr + offs_m * str_o, x_gate * silu(x_up), mask=mask_m)', type: 'code' }
  ] : (isRmsnorm ? [
    { line: 1, text: '# Memory-coalesced warp tree reduction with tile masking', type: 'comment' },
    { line: 2, text: 'cols = tl.arange(0, BLOCK_SIZE)', type: 'code' },
    { line: 3, text: 'mask = cols < N_cols', type: 'code' },
    { line: 4, text: 'x = tl.load(row_ptr + cols, mask=mask, other=0.0)', type: 'secure', note: '🛡️ ALIGNED: 128-bit boundary ensures 0 SDC deviations' },
    { line: 5, text: 'var = tl.sum(x * x, axis=0) / N_cols', type: 'code' },
    { line: 6, text: 'tl.store(out_ptr + cols, x * tl.rsqrt(var + eps), mask=mask)', type: 'code' }
  ] : [
    { line: 1, text: '# Online max logit subtraction in SRAM registers (Milakov & Gimelshein)', type: 'comment' },
    { line: 2, text: 'max_logit = tl.max(logits, axis=0)', type: 'code' },
    { line: 3, text: 'numer = tl.exp(logits - max_logit)', type: 'secure', note: '🛡️ BOUNDED: Online subtraction guarantees 0.0 NaN/Inf divergence' },
    { line: 4, text: 'denom = tl.sum(numer, axis=0)', type: 'code' },
    { line: 5, text: 'tl.store(out_ptr + offs, numer / denom, mask=mask)', type: 'code' }
  ]);

  // PTX Disassembly Lines for Hopper SM_90a
  const leftPtx = [
    { line: 1, text: '// PTX ISA v8.4 - Target SM_90a (Hopper)', type: 'comment' },
    { line: 2, text: 'mad.lo.s32 %r3, %r_tid, %r_stride, %r_offset;', type: 'code' },
    { line: 3, text: '// UNPREDICATED GLOBAL MEMORY READ (CRITICAL BUG):', type: 'comment' },
    { line: 4, text: 'ld.global.v2.f16 {%r1, %r2}, [%rd_in + %r3];', type: 'vuln', note: '💥 FAULT: Memory bus panic when %r3 crosses page boundary' },
    { line: 5, text: 'fma.rn.f16x2 {%r7, %r8}, %r1, %r2, %r6;', type: 'code' },
    { line: 6, text: 'st.global.v2.f16 [%rd_out + %r3], {%r7, %r8};', type: 'code' }
  ];

  const rightPtx = [
    { line: 1, text: '// PTX ISA v8.4 - Synthesized by Nemotron on Hopper SM_90a', type: 'comment' },
    { line: 2, text: 'setp.lt.u32 %p0, %r_token_idx, %r_ragged_tokens;', type: 'secure', note: '🛡️ HARDWARE PREDICATE: Evaluates boundary in 0 clock cycles' },
    { line: 3, text: '// PREDICATED NON-COHERENT VECTOR LOAD:', type: 'comment' },
    { line: 4, text: '@p0 ld.global.nc.v2.f16 {%r1, %r2}, [%rd_in + %r3];', type: 'secure', note: '🛡️ PREDICATED: Load is suppressed if @p0 == 0' },
    { line: 5, text: 'selp.f16x2 {%r1, %r2}, {%r1, %r2}, {0.0, 0.0}, %p0;', type: 'code' },
    { line: 6, text: '@p0 st.global.v2.f16 [%rd_out + %r3], {%r7, %r8};', type: 'code' }
  ];

  const handleCopy = () => {
    sound.playClick();
    const activeLines = viewMode === 'source' ? rightCode : rightPtx;
    const rawText = activeLines.map(l => l.text).join('\n');
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentLeft = viewMode === 'source' ? leftCode : leftPtx;
  const currentRight = viewMode === 'source' ? rightCode : rightPtx;

  return (
    <div className="diff-master-card">
      <div className="diff-header-bar">
        <div className="diff-title-group">
          <Code2 size={15} className="text-nvidia" />
          <span className="diff-title">SEMANTIC AST & PTX DISASSEMBLY INSPECTOR</span>
        </div>

        {/* View Mode Toggle: Source vs PTX */}
        <div className="diff-mode-tabs font-mono">
          <button 
            className={`diff-tab-btn ${viewMode === 'source' ? 'active' : ''}`}
            onClick={() => {
              sound.playClick();
              setViewMode('source');
            }}
          >
            <Code2 size={12} className="inline mr-1" />
            C++ vs Triton Python
          </button>
          <button 
            className={`diff-tab-btn ${viewMode === 'ptx' ? 'active' : ''}`}
            onClick={() => {
              sound.playClick();
              setViewMode('ptx');
            }}
          >
            <Binary size={12} className="inline mr-1" />
            Hopper PTX Assembly ISA
          </button>
        </div>

        <div className="diff-badges-group">
          <span className="badge-lang-vulnerable">
            {viewMode === 'source' ? 'CUDA C++ (Vulnerable)' : 'Unpredicated PTX (Fault)'}
          </span>
          <ArrowRight size={13} className="text-tertiary" />
          <span className="badge-lang-hardened">
            {viewMode === 'source' ? 'Triton Python (Safe & Fused)' : 'Predicated @p0 PTX (Safe)'}
          </span>
        </div>
      </div>

      <div className="diff-panes-split">
        {/* Left Pane */}
        <div className="diff-pane pane-cuda">
          <div className="pane-filename-strip">
            <span className="pane-filename text-coral font-mono">
              {viewMode === 'source' ? leftFileName : 'compiled_ptx_baseline.ptx'}
            </span>
            <span className="pane-tag tag-coral">UNSAFE MEMORY</span>
          </div>

          <div className="code-editor-viewport">
            {currentLeft.map((item, idx) => (
              <div key={idx} className={`code-line-row ${item.type === 'vuln' ? 'line-vuln-highlight' : ''}`}>
                <span className="line-num">{item.line}</span>
                <div className="line-content">
                  <span className={`code-text ${item.type}`}>{item.text}</span>
                  {item.note && (
                    <div className="line-annotation vuln-annotation">
                      <AlertTriangle size={11} className="inline mr-1" />
                      {item.note}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Pane */}
        <div className="diff-pane pane-triton">
          <div className="pane-filename-strip">
            <span className="pane-filename text-nvidia font-mono">
              {viewMode === 'source' ? rightFileName : 'aegis_hardened_sm90.ptx'}
            </span>
            <div className="pane-right-actions">
              <span className="pane-tag tag-nvidia">PREDICATED IMMUNE</span>
              <button className="btn-copy-code" onClick={handleCopy} title="Copy Hardened Code">
                {copied ? <Check size={12} className="text-nvidia" /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="code-editor-viewport">
            {currentRight.map((item, idx) => (
              <div key={idx} className={`code-line-row ${item.type === 'secure' ? 'line-secure-highlight' : ''}`}>
                <span className="line-num">{item.line}</span>
                <div className="line-content">
                  <span className={`code-text ${item.type}`}>{item.text}</span>
                  {item.note && (
                    <div className="line-annotation secure-annotation">
                      <ShieldCheck size={11} className="inline mr-1" />
                      {item.note}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
