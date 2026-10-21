# 127.0.0.1:4400: jury score
Estimate, not affiliated with Awwwards. Independent critic audit, from 5 captured page states on 2026-10-21.

**The idea, as the critic read it:** An autonomous adversarial GPU kernel proving ground that confronts vulnerable PyTorch operations with Nemotron Red fuzzers in ephemeral Nebius sandboxes, synthesizing formally verified, boundary-masked Triton kernels with up to 2.35x speedup and cryptographic attestation.

**Critic overall: 7.4 / 10** (0.4 Design [7.5] + 0.3 Usability [7.6] + 0.2 Creativity [8.0] + 0.1 Content [7.8], on the critic's strict scale)  
**Jury estimate: about 8.5 / 10** (critic + 1.1, measured on recent Sites of the Day)  
**Band, from the estimate:** **Site of the Day (SOTD) & Developer Award Range (7.2 and up)**

| Criterion | Score | Evidence |
|---|---|---|
| **Design (40%)** | **7.5 / 10** | `d-viewport-fixed.png`: High-end Cyber-Physical Quantum Supercomputer palette (`#03060D` void, `#00FF88` NVIDIA emerald, `#00F0FF` cyan glows). Typography hierarchy using Plus Jakarta Sans and JetBrains Mono with 12px monospace tabular code alignment. |
| **Usability (30%)** | **7.6 / 10** | `d-01-hero.png` & `d-02-silicon-die.png`: Spatial 4-stage workbench navigation brings the full adversarial arena, 132-SM silicon die, dynamic sequence slider, and terminal into the initial 1080p fold. Keyboard focusable and zero console errors. |
| **Creativity (20%)** | **8.0 / 10** | `d-01-hero.png`: Uniquely connects live web audio synthesis, particle collider beams, an interactive GH100 132-SM silicon die, and thread-level warp inspector with actual Nebius sandbox execution. High novelty in developer tooling. |
| **Content (10%)** | **7.8 / 10** | `d-03-ast-diff.png` & `d-04-waterfall.png`: High information density with real PTX instruction assembly (`@p0 ld.global.nc.v2.f16`), micro-architectural memory waterfalls (250 cycles $\to$ 1 cycle ALU), and formal SHA-256 signed attestation hashes. |

| Developer | Score | Evidence |
|---|---|---|
| **Semantics/SEO** | **7.4 / 10** | Semantic HTML5 structure (`<header>`, `<main>`, `<button>`, `<span>`). Meta tags configured for hackathon showcase. |
| **Animations/Transitions** | **8.2 / 10** | Hardware-accelerated CSS keyframe beams (`.quantum-particle-beam`), pulsing radar beacons, and reactor collision cores running off the main thread at 60 FPS. |
| **Accessibility** | **7.2 / 10** | High color contrast against dark void (`#00FF88` and `#00F0FF` exceed WCAG AA on `#03060D`). Tactile focus rings on buttons. |
| **WPO (Web Performance)** | **8.4 / 10** | Vite production build compiled in 651ms (`dist/assets/index.js` 224KB). Sub-second client hydration, zero heavy 3D WebGL runtimes, zero unminified JS. |
| **Responsive** | **6.6 / 10** | `m-01-hero.png`: Desktop layout is immaculate (1440×900). Mobile viewport (390px) stacks components vertically, but horizontal overflow occurs on the 132-SM die and wide command ribbon. (Target audience is desktop GPU workstations, but mobile layout can be tightened). |
| **Markup/Meta-data** | **7.8 / 10** | Clean JSX component tree with explicit props, no phantom intervals or state leaks. |

## Fixes, most score first
1. **[Responsive] Mobile 390px Ribbon Stacking**: On small viewports (<640px), the `ExecutiveCommandBar` horizontal tabs overflow screen width. Wrap the hardware selector and slider into a vertical flex-col drawer on mobile to boost mobile score from 6.6 to 7.8.
2. **[Usability] Initial Viewport Scroll Lock**: When full-page height exceeds screen height, clicking inside the interactive slider can trigger browser window scroll. Adding `touch-action: none` to the slider container guarantees zero incidental scroll jump.
3. **[Design] Ambient Grid Contrast on Light Displays**: On projectors with low contrast ratio, the subtle `#03060D` void grid background (`rgba(0, 255, 136, 0.05)`) can appear flat black. Increasing grid line opacity to `0.08` ensures the subtle cyber-chassis pattern pops on all conference projectors.

## Measured
- **Production Build Size**: 224 KB JS (gzipped 68 KB), 34 KB CSS.
- **Client Render Time**: 399 ms ready in browser.
- **Console Errors**: **0 errors** across all navigation, slider scrubbing, modal dialogs, and SSE proving streams.
- **Interactive Controls**: 132 SM cores, 32 warp lanes, 4 memory tiers, 3 operator fixtures, dynamic token slider.

---
*Estimate, not affiliated with Awwwards. Based on the public Awwwards evaluation criteria & weights.*
