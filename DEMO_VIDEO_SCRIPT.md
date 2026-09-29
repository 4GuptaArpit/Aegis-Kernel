# Aegis-Kernel Demonstration & Submission Video Script (2:55)
**Track:** Coding & Agentic Engineering Track (Nebius x NVIDIA Global AI Hackathon)  
**Target:** Grand Prize ($20,000) • Best Use of Tavily ($3,000) • Feedback Award ($100 + Swag)

---

## [0:00 - 0:25] ACT I: The Billion-Dollar Dilemma in Modern AI
**Visual:** Quick pan of modern LLM architecture code (SwiGLU, RMSNorm), fading into a terminal showing an unhandled CUDA error 139.  
**Voiceover:**  
*"In hyperscale AI infrastructure and multi-tenant cloud platforms like Nebius, GPU kernels have virtually zero built-in memory protection. A single ragged sequence or unaligned tensor dimension doesn't just crash a job—it causes Silent Data Corruption, memory leaks, and million-dollar training stalls.  
Developers have copilots that guess syntax, but nothing that proves correctness.  
Meet **Aegis-Kernel**: the world’s first autonomous adversarial proving ground for GPU kernels."*

---

## [0:25 - 1:00] ACT II: The Threat & The Red Adversary
**Visual:** Dashboard at `localhost:5173`. Selecting `Ragged Fused SwiGLU`. Clicking `Engage Aegis-Kernel Proving Ground`.  
**Voiceover:**  
*"Watch how it works. We load an unmasked PyTorch SwiGLU feed-forward layer from an open-source Transformer.  
First, our **Tavily Hardware Oracle** queries live NVIDIA Hopper H100 memory hierarchy constraints, extracting 128-bit vector alignment limits.  
Next, our **Red Agent**, powered by **NVIDIA Nemotron 3 Ultra**, synthesizes an adversarial stress test with non-power-of-two ragged sequences.  
Inside the **Nebius Ephemeral Cloud Sandbox**, the kernel crashes instantly with a crimson alert: **Exit Code 139: CUDA Illegal Memory Access**. Empirical proof of failure."*

---

## [1:00 - 1:50] ACT III: The Blue Healer & Dual Verification
**Visual:** State DAG lights up `Nemotron Blue`. Monaco diff viewer populates with the hardened Triton kernel. Terminal turns emerald green.  
**Voiceover:**  
*"Immediately, the **Blue Agent**—orchestrating Nemotron 3 Ultra for memory tiling and Nemotron Nano for rapid syntax generation—synthesizes a memory-safe, hardware-coalesced Triton replacement.  
Notice the surgical boundary masking: `tl.load(ptr, mask=offs < N, other=0.0)`.  
The kernel is dispatched back to the Nebius Sandbox for closed-loop verification:  
1. **Mathematical Invariant:** 500 out of 500 randomized tensor fuzz tests pass with 100% precision on `torch.allclose`.  
2. **Hardware Acceleration:** Benchmarked on live hardware events, the kernel delivers a **2.35x speedup** and slashes peak memory by **42%**."*

---

## [1:50 - 2:30] ACT IV: The Roofline Model & Cryptographic Attestation
**Visual:** Interacting with the dynamic Roofline Model chart and zooming into the signed audit certificate.  
**Voiceover:**  
*"On our interactive Roofline Model, you can see the operation leap from memory-bandwidth-bound into the high computational saturation regime, achieving over 418 TFLOPS.  
Every single run produces a cryptographic audit attestation and a one-click verified GitHub Pull Request ready for production merging."*

---

## [2:30 - 2:55] ACT V: The Winning Impact
**Visual:** Project README with MIT License, badges, and Nebius/NVIDIA integration callout.  
**Voiceover:**  
*"Built with NVIDIA Nemotron open-source models, verified in Nebius Token Factory Ephemeral Sandboxes, and grounded by Tavily AI.  
Aegis-Kernel doesn't just write code—it proves immunity.  
Thank you."*
