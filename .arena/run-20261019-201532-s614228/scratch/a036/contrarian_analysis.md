# Obvious Default Answer:
Build a multi-tab dashboard with glowing dark-mode cards, lots of neon charts, and separate screens for each GPU sub-component. Keep it simple with tabs and standard cards.

# Why the Obvious Default Fails (Contrarian Examination):
1. **Tabs are an eviction mechanism, not a cognitive architecture**: When you put Red vs Blue in Tab 1, SM die in Tab 2, and Memory Waterfall in Tab 4, the user never sees *why* Red's pathological ragged tensor caused SM 14's MMU trap, or how Triton's `@p0` predication prevented the memory waterfall crash. The causal chain is completely severed.
2. **Generic SaaS Card Grids ("Bento Boxes") lack physical spatial authority**: Real high-performance engineering workstations (like NVIDIA Nsight Compute, Nsight Systems, or Bloomberg Terminal / CERN control displays) don't look like generic SaaS dashboards with 12 identical rounded boxes. They look like cohesive physical-cybernetic control surfaces with a unified visual hierarchy, spatial anchoring, and deliberate breathing room.
3. **The False Dichotomy of "Dense vs Clean"**: The baseline thought the only way to avoid congestion was to hide everything behind 4 separate tabs. The contrarian truth is: You can achieve breathtaking executive clarity with a **Dual-Mode Ergonomic Workbench**: an *Integrated Holographic Cockpit* (Command & Telemetry strip + Synchronized Causal Collider) paired with *Focused Inspection Depth* (Micro-architectural deep dives with keyboard shortcuts `[1-4]` or instant spatial view switches, plus a synchronized scrubber that drives all instruments simultaneously).

# What Survives:
- A unified spatial layout that maintains physical breathing room (min 24px-32px gutters, structured hierarchy).
- A unified telemetry HUD that isn't hidden away in a secondary tab.
- Hardware-accurate representation: NVIDIA GH100 (132 SMs across 8 GPCs, 32-thread SIMT warp execution matrix with `@p0` predication, 4-tier memory hierarchy waterfall from HBM3e down to Tensor Cores, and Nsight 100KHz sampling).
- Live interactive parameter adjustment: sequence length scrubber with instant ragged-edge detection (`seqLen % 32 !== 0`), hardware selector, workload presets, and live proving run loop.
