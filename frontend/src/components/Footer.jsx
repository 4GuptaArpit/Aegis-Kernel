import React from 'react';

export default function Footer() {
  return (
    <footer className="stitch-footer">
      <div className="footer-left text-dim font-mono text-xs">
        <span>Nebius AI Cloud Node #04</span>
        <span className="footer-sep">·</span>
        <span>Driver 550.54.14</span>
        <span className="footer-sep">·</span>
        <span>CUDA 12.4</span>
        <span className="footer-sep">·</span>
        <span>Triton 3.0.0</span>
      </div>

      <div className="footer-right text-xs">
        <a 
          href="https://github.com/4GuptaArpit/Aegis-Kernel" 
          target="_blank" 
          rel="noreferrer" 
          className="footer-link text-muted hover:text-white"
        >
          Documentation
        </a>
        <span className="footer-sep text-dim">·</span>
        <a 
          href="https://github.com/4GuptaArpit/Aegis-Kernel" 
          target="_blank" 
          rel="noreferrer" 
          className="footer-link text-muted hover:text-white"
        >
          GitHub Repository
        </a>
        <span className="footer-sep text-dim">·</span>
        <span className="cluster-status-pill text-green font-mono">
          <span className="stitch-dot dot-green"></span>
          Live Evaluation Cluster
        </span>
      </div>
    </footer>
  );
}
