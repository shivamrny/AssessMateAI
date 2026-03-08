import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 256, className = "" }) => {
  const primaryBlue = "#1A4F9C";
  const tealGradientStart = "#00C8B9";
  const tealGradientEnd = "#35E0D1";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Teal gradient for the main 'A' body */}
        <linearGradient id="tealGradient" x1="50" y1="30" x2="50" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={tealGradientStart} />
          <stop offset="100%" stopColor={tealGradientEnd} />
        </linearGradient>
      </defs>

      {/* Main 'A' Shape (gradient teal) */}
      <path
        d="M50 30 
           C46 30, 42 32, 40 36 
           L25 68 
           C23 72, 25 76, 29 76 
           H71 
           C75 76, 77 72, 75 68 
           L60 36 
           C58 32, 54 30, 50 30 Z"
        fill="url(#tealGradient)"
      />

      {/* Connected Nodes Structure (on the right) */}
      <g>
        {/* Nodes (teal) */}
        <circle cx="70" cy="40" r="3" fill={tealGradientStart} />
        <circle cx="78" cy="50" r="3" fill={tealGradientStart} />
        <circle cx="70" cy="60" r="3" fill={tealGradientStart} />
        <circle cx="62" cy="50" r="3" fill={tealGradientStart} />
        
        {/* Connecting Lines (teal) */}
        <line x1="70" y1="40" x2="78" y2="50" stroke={tealGradientStart} strokeWidth="1.5" />
        <line x1="78" y1="50" x2="70" y2="60" stroke={tealGradientStart} strokeWidth="1.5" />
        <line x1="70" y1="60" x2="62" y2="50" stroke={tealGradientStart} strokeWidth="1.5" />
        <line x1="62" y1="50" x2="70" y2="40" stroke={tealGradientStart} strokeWidth="1.5" />
      </g>

      {/* Central Sparkle Icon */}
      <g transform="translate(43, 35)">
        <path
          d="M0 7 
             C0 7, 3 6, 7 6 
             C11 6, 14 7, 14 7 
             L7 14 Z"
          fill="white"
        />
        <path
          d="M7 0 
             L10 6 
             L4 6 Z"
          fill="white"
        />
      </g>
    </svg>
  );
};

export const LogoLetter: React.FC<LogoProps> = ({ size = 24, className = "" }) => {
  return (
    <div
      className={`flex items-center justify-center bg-primary text-primary-foreground font-bold rounded ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.6 }}
    >
      A
    </div>
  );
};