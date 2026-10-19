import React from 'react';
import { Shield, ExternalLink, Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="aegis-footer">
      <div className="footer-left">
        <div className="footer-cluster-info font-mono">
          <span className="text-nvidia">● CLUSTER LIVE</span>
          <span className="footer-sep">/</span>
          <span>Nebius H100 Node #04</span>
          <span className="footer-sep">/</span>
          <span>Driver 550.54.14</span>
          <span className="footer-sep">/</span>
          <span>CUDA 12.4</span>
          <span className="footer-sep">/</span>
          <span>Triton 3.0.0</span>
        </div>
      </div>

      <div className="footer-right">
        <a 
          href="https://github.com/4GuptaArpit/Aegis-Kernel" 
          target="_blank" 
          rel="noreferrer" 
          className="footer-link"
        >
          <span>Architecture Whitepaper</span>
          <ExternalLink size={11} className="inline ml-1" />
        </a>
        <span className="footer-sep">·</span>
        <a 
          href="https://github.com/4GuptaArpit/Aegis-Kernel" 
          target="_blank" 
          rel="noreferrer" 
          className="footer-link"
        >
          <span>GitHub Source</span>
          <ExternalLink size={11} className="inline ml-1" />
        </a>
        <span className="footer-sep">·</span>
        <span className="footer-copyright">
          Built for Nebius × NVIDIA Global AI Hackathon '26
        </span>
      </div>
    </footer>
  );
}
