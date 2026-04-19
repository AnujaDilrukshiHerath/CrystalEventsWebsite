import React from 'react';

const Logo = ({ className = "w-10 h-10", textClassName = "text-white", hideText = false }) => {
  return (
    <div className={`flex items-center gap-3`}>
      <div className={className}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_12px_rgba(218,192,163,0.8)]">
          {/* Heavy 'C' Shape - Perfectly centered at 50,50 */}
          <path 
            d="M 76.8 23.2 A 38 38 0 1 0 76.8 76.8" 
            stroke="#DAC0A3" 
            strokeWidth="14" 
            strokeLinecap="butt" 
            fill="none"
          />
          
          {/* Detailed Diamond Crystal - Adjusted position slightly up (48) for perfect visual balance */}
          <g transform="translate(50, 48) scale(0.6) translate(-50,-50)">
            {/* Outline & Bottom Pavilion */}
            <path 
              d="M 15 40 L 85 40 L 50 90 L 15 40 Z" 
              fill="#DAC0A3" 
              fillOpacity="0.15" 
              stroke="#DAC0A3" 
              strokeWidth="2.5" 
              strokeLinejoin="round"
            />
            {/* Top Crown / Table */}
            <path 
              d="M 32 20 L 68 20 L 85 40 L 15 40 L 32 20 Z" 
              fill="#DAC0A3" 
              fillOpacity="0.3" 
              stroke="#DAC0A3" 
              strokeWidth="2.5" 
              strokeLinejoin="round"
            />
            {/* Facet Detail Lines */}
            <path d="M 32 20 L 32 40" stroke="#DAC0A3" strokeWidth="1.5" />
            <path d="M 68 20 L 68 40" stroke="#DAC0A3" strokeWidth="1.5" />
            <path d="M 15 40 L 50 60 L 85 40" stroke="#DAC0A3" strokeWidth="1.5" fill="none" />
            <path d="M 50 60 L 50 90" stroke="#DAC0A3" strokeWidth="1.5" />
            <path d="M 32 40 L 50 90 L 68 40" stroke="#DAC0A3" strokeWidth="1.5" fill="none" />
            <path d="M 15 40 L 32 20" stroke="#DAC0A3" strokeWidth="1.5" />
            <path d="M 85 40 L 68 20" stroke="#DAC0A3" strokeWidth="1.5" />
            <path d="M 50 20 L 50 40" stroke="#DAC0A3" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
      {!hideText && (
        <span className={`font-serif text-2xl font-bold tracking-[0.3em] uppercase ${textClassName}`}>
          Crystal
        </span>
      )}
    </div>
  );
};

export default Logo;
