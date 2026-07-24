import React from "react";

export default function TaskflowLogo({ className = "", style = {} }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 800 800" 
      className={className} 
      style={{ width: '28px', height: '28px', display: 'block', ...style }}
    >
      <defs>
        <linearGradient id="tf-topGradient" x1="0%" y1="10%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--accent-primary)" />
          <stop offset="100%" stopColor="var(--teal-400)" />
        </linearGradient>

        <linearGradient id="tf-stemGradient" x1="90%" y1="0%" x2="10%" y2="100%">
          <stop offset="0%" stopColor="var(--ink-900)" />
          <stop offset="100%" stopColor="var(--accent-primary)" />
        </linearGradient>
      </defs>

      {/* Dynamic background adapting to light/dark mode */}
      <rect width="800" height="800" rx="160" fill="var(--ink-900)" />

      {/* Stem (Background Fold) */}
      <path d="M 380 292 
               L 280 552 
               C 280 607, 390 607, 390 552 
               L 490 292 Z" 
            fill="url(#tf-stemGradient)" />

      {/* Top Bar (Foreground) */}
      <path d="M 300 192 
               L 580 192 
               C 635 192, 555 302, 500 302 
               L 220 302 
               C 165 302, 245 192, 300 192 Z" 
            fill="url(#tf-topGradient)" />
    </svg>
  );
}
