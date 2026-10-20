# Arena Task: Aegis-Kernel UI-UX Architecture & Design System

## Goal & Mission
Design and implement an extraordinary, visually stunning, non-congested UI-UX architecture for **Aegis-Kernel** (Nebius x NVIDIA Global AI Hackathon '26). The project is an autonomous GPU invariant and kernel proving workbench that demonstrates closed-loop Nemotron Red Adversary fuzzer vs Nemotron Blue Triton healer on NVIDIA Hopper H100 and Blackwell B200 hardware.

## User's Explicit Requirements & Criticisms:
1. **No generic cards or basic hackathon themes**: The user wants an interface that makes NVIDIA and Nebius judges go "GA-GA", competing with the very best UI/UX on the modern web.
2. **Not a simple white-to-black or black-to-white palette swap**: The interface must feature rich visual energy, glowing indicators, animated particle/reactor motion, and supercomputer aesthetics.
3. **Not congested or crowded**: The layout must NOT feel like components are cramped together fighting for space. Elements must have breathing room, clear hierarchy, and spacious layout structure.
4. **Hardware Authenticity**: Must authentically represent NVIDIA Hopper GH100 architecture (132 Streaming Multiprocessors, SIMT 32-thread warps, @p0 hardware predication, 4-tier memory hierarchy, Nsight 100KHz telemetry).
5. **Interactive Proving Ground**: Must allow interactive parameter adjustment (dynamic sequence length scrubber, hardware target switcher, workload presets) and live execution proving loops.

## Current Baseline to Beat:
The current implementation in `frontend/src/` features:
- Cyber-physical quantum supercomputer theme (`#03060D` obsidian void with NVIDIA emerald `#00FF88`, plasma coral `#FF0055`, cyan `#00F0FF`).
- 4-tab Spatial Workbench Stage Navigator (`01 Red vs Blue Collider`, `02 132-SM Die & 32-Warp Matrix`, `03 AST Diff & PTX Disassembly`, `04 Nsight Profiler & Memory Waterfall`).
- Files located at:
  - `frontend/src/App.jsx`
  - `frontend/src/components/ExecutiveCommandBar.jsx`
  - `frontend/src/components/RedBlueArena.jsx`
  - `frontend/src/components/HopperDieTopology.jsx`
  - `frontend/src/components/WarpVisualizer.jsx`
  - `frontend/src/components/CodeDiffInspector.jsx`
  - `frontend/src/components/TerminalWindow.jsx`
  - `frontend/src/components/NsightTelemetryHud.jsx`
  - `frontend/src/components/SiliconMemoryWaterfall.jsx`
  - `frontend/src/components/MicDropDelta.jsx`
  - `frontend/src/components/VerificationImpact.jsx`
  - `frontend/src/index.css`

## Evaluation Criteria:
1. **Aesthetic Impact ("GA-GA" Factor)**: Does it look like an elite NVIDIA/Nebius HPC tool rather than a generic SaaS dashboard?
2. **Spatial Balance & Breathing Room**: Is the layout clean, uncluttered, and easy to navigate without visual congestion?
3. **Hardware Technical Depth**: Are GPU architecture concepts (SMs, warps, predicates, memory waterfall, Nsight profiler) intuitively visualized?
4. **Feasibility & Production Polish**: Is the code clean, responsive, robust React + Tailwind/CSS with zero compile warnings?
