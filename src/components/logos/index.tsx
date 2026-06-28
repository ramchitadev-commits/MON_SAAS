import React from 'react';

export const WaveLogo: React.FC<{ className?: string }> = ({ className = 'h-6 w-auto' }) => {
  return (
    <svg
      viewBox="0 0 200 60"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="200" height="60" rx="12" fill="#00A3E0" />
      {/* Stylized Penguin / Wave symbol */}
      <path
        d="M35 18C28.3726 18 23 23.3726 23 30C23 36.6274 28.3726 42 35 42C41.6274 42 47 36.6274 47 30C47 23.3726 41.6274 18 35 18Z"
        fill="white"
      />
      <path
        d="M35 23C32.7909 23 31 24.7909 31 27C31 29.2091 32.7909 31 35 31C37.2091 31 39 29.2091 39 27C39 24.7909 37.2091 23 35 23Z"
        fill="#00A3E0"
      />
      <path
        d="M32 37C32 37 33.5 35 35 35C36.5 35 38 37 38 37C38 37 36.5 39 35 39C33.5 39 32 37 32 37Z"
        fill="#FF6600"
      />
      {/* Wave Text */}
      <text
        x="65"
        y="40"
        fill="white"
        fontSize="28"
        fontWeight="800"
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.05em"
      >
        wave
      </text>
    </svg>
  );
};

export const OrangeMoneyLogo: React.FC<{ className?: string }> = ({ className = 'h-6 w-auto' }) => {
  return (
    <svg
      viewBox="0 0 200 60"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Orange Money square-based layout */}
      <rect width="200" height="60" rx="12" fill="#000000" />
      {/* Orange square */}
      <rect x="15" y="15" width="30" height="30" fill="#FF6600" />
      {/* Text */}
      <text
        x="60"
        y="32"
        fill="#FFFFFF"
        fontSize="16"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        orange
      </text>
      <text
        x="60"
        y="48"
        fill="#FF6600"
        fontSize="16"
        fontWeight="800"
        fontFamily="system-ui, sans-serif"
      >
        money
      </text>
    </svg>
  );
};

export const DooleLogo: React.FC<{ className?: string; dark?: boolean }> = ({
  className = 'h-8 w-auto',
  dark = false,
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Icon representing strength / commerce */}
      <div className={`flex items-center justify-center h-8 w-8 rounded-lg ${dark ? 'bg-white text-emerald-600' : 'bg-emerald-600 text-white'} font-bold shadow-sm`}>
        D
      </div>
      <span className={`text-xl font-black tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>
        doolé
      </span>
    </div>
  );
};
