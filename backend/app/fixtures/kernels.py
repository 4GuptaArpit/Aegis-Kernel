SWIGLU_FIXTURE = """
import numpy as np

def naive_swiglu_forward(x, gate_weight, up_weight):
    # x shape: [batch_size, seq_len, hidden_dim]
    # Ragged unpadded sequences trigger unaligned pointer access or out-of-bounds indexing
    # when seq_len is not a power of 2 or unaligned with cache line boundaries
    gate = np.dot(x, gate_weight)
    up = np.dot(x, up_weight)
    # Swish: gate * sigmoid(gate)
    swish = gate * (1.0 / (1.0 + np.exp(-gate)))
    return swish * up
"""

HARDENED_SWIGLU_TRITON = """
import triton
import triton.language as tl

@triton.jit
def _swiglu_kernel(
    X_ptr, Gate_ptr, Up_ptr, Out_ptr,
    M, K,
    stride_xm, stride_xk,
    stride_gm, stride_gk,
    stride_um, stride_uk,
    stride_om, stride_ok,
    BLOCK_M: tl.constexpr, BLOCK_K: tl.constexpr
):
    pid = tl.program_id(0)
    # Boundary-safe pointer arithmetic with explicit masking
    offs_m = pid * BLOCK_M + tl.arange(0, BLOCK_M)
    offs_k = tl.arange(0, BLOCK_K)
    
    # 128-bit aligned load with zero-padding mask for ragged sequences
    mask_m = offs_m < M
    mask_k = offs_k < K
    mask = mask_m[:, None] & mask_k[None, :]
    
    x = tl.load(X_ptr + offs_m[:, None]*stride_xm + offs_k[None, :]*stride_xk, mask=mask, other=0.0)
    g = tl.load(Gate_ptr + offs_m[:, None]*stride_gm + offs_k[None, :]*stride_gk, mask=mask, other=0.0)
    u = tl.load(Up_ptr + offs_m[:, None]*stride_um + offs_k[None, :]*stride_uk, mask=mask, other=0.0)
    
    # Fused SwiGLU computation in SRAM without intermediate global roundtrips
    swish_g = g * tl.sigmoid(g)
    out = swish_g * u
    
    tl.store(Out_ptr + offs_m[:, None]*stride_om + offs_k[None, :]*stride_ok, out, mask=mask)
"""

RMSNORM_FIXTURE = """
import numpy as np

def naive_rmsnorm_forward(x, weight, eps=1e-6):
    # Fails 128-bit vector alignment on odd or non-power-of-two hidden dimensions
    # Intermediate variance calculation allocates separate temporary buffers
    variance = np.mean(x ** 2, axis=-1, keepdims=True)
    return x * (1.0 / np.sqrt(variance + eps)) * weight
"""

HARDENED_RMSNORM_TRITON = """
import triton
import triton.language as tl

@triton.jit
def _rmsnorm_kernel(
    X_ptr, W_ptr, Out_ptr,
    N_cols, eps,
    stride_row,
    BLOCK_SIZE: tl.constexpr
):
    row_idx = tl.program_id(0)
    cols = tl.arange(0, BLOCK_SIZE)
    # Masking ensures safety when N_cols is not aligned to BLOCK_SIZE
    mask = cols < N_cols
    
    row_ptr = X_ptr + row_idx * stride_row
    x = tl.load(row_ptr + cols, mask=mask, other=0.0)
    
    # Warp-level parallel reduction in shared memory
    x_sq = x * x
    sum_sq = tl.sum(x_sq, axis=0)
    rms = tl.sqrt(sum_sq / N_cols + eps)
    
    w = tl.load(W_ptr + cols, mask=mask, other=1.0)
    out = (x / rms) * w
    tl.store(Out_ptr + row_idx * stride_row + cols, out, mask=mask)
"""

SOFTMAX_FIXTURE = """
import numpy as np

def naive_softmax_forward(logits):
    # Vulnerable to catastrophic numerical overflow / NaN propagation under extreme logits
    # Non-online formulation requires multiple passes over global memory
    exp_logits = np.exp(logits) # Overflows to Inf when logits > 88 in FP32
    return exp_logits / np.sum(exp_logits, axis=-1, keepdims=True)
"""

HARDENED_SOFTMAX_TRITON = """
import triton
import triton.language as tl

@triton.jit
def _safe_online_softmax_kernel(
    Logits_ptr, Out_ptr,
    N_cols, stride_row,
    BLOCK_SIZE: tl.constexpr
):
    row_idx = tl.program_id(0)
    cols = tl.arange(0, BLOCK_SIZE)
    mask = cols < N_cols
    
    row_ptr = Logits_ptr + row_idx * stride_row
    logits = tl.load(row_ptr + cols, mask=mask, other=-float('inf'))
    
    # Online subtraction of max logit prevents floating-point overflow
    max_logit = tl.max(logits, axis=0)
    shifted_logits = logits - max_logit
    numer = tl.exp(shifted_logits)
    denom = tl.sum(numer, axis=0)
    
    out = numer / denom
    tl.store(Out_ptr + row_idx * stride_row + cols, out, mask=mask)
"""
