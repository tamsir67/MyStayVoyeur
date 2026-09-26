import React, { useState } from 'react';

export interface LogoMyStayVoyagerProps {
  variant?: 'horizontal' | 'badge' | 'full' | 'footer';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSubtitle?: boolean;
}

export const LogoMyStayVoyager: React.FC<LogoMyStayVoyagerProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  showSubtitle = true,
}) => {
  const [imgError, setImgError] = useState(false);

  // Dimension presets
  const badgeDimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-24 h-24',
  };

  const textSizes = {
    sm: { title: 'text-base', sub: 'text-[9px]' },
    md: { title: 'text-xl', sub: 'text-[10px]' },
    lg: { title: 'text-2xl', sub: 'text-xs' },
    xl: { title: 'text-4xl', sub: 'text-sm' },
  };

  // Pure SVG fallback faithful to the user's emblem
  const renderVectorEmblem = () => (
    <svg 
      viewBox="0 0 200 200" 
      className="w-full h-full drop-shadow-xs" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Emblème My Stay Voyager"
    >
      <defs>
        <clipPath id="circleClip">
          <circle cx="100" cy="100" r="92" />
        </clipPath>
        <linearGradient id="skyGrad" x1="100" y1="10" x2="100" y2="190" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2E6B93" />
          <stop offset="60%" stopColor="#4381A8" />
          <stop offset="100%" stopColor="#245579" />
        </linearGradient>
        <linearGradient id="waterGrad" x1="10" y1="150" x2="190" y2="190" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3C8BB6" />
          <stop offset="50%" stopColor="#4FB0C2" />
          <stop offset="100%" stopColor="#24587C" />
        </linearGradient>
      </defs>

      {/* Outer Border Ring */}
      <circle cx="100" cy="100" r="95" stroke="#3A7CA5" strokeWidth="8" fill="none" />

      <g clipPath="url(#circleClip)">
        {/* Sky Background */}
        <rect width="200" height="200" fill="url(#skyGrad)" />

        {/* Sun in top right */}
        <circle cx="150" cy="55" r="16" fill="#FFFFFF" opacity="0.95" />

        {/* Background Mountains (White & Ice Blue) */}
        <polygon points="40,150 105,45 165,150" fill="#EBF4F9" />
        <polygon points="105,45 165,150 115,150" fill="#D3E4EE" />
        <polygon points="10,150 65,70 120,150" fill="#F4F8FA" />
        <polygon points="100,150 145,65 195,150" fill="#E2EDF4" />

        {/* Mountain Shadows & Ridges */}
        <path d="M105,45 L118,90 L108,115 L125,150 L105,150 Z" fill="#B9D5E6" />
        <path d="M65,70 L75,105 L62,130 L70,150 L65,150 Z" fill="#C5DCE8" />

        {/* Layered Pine Trees (Green Forest) */}
        {/* Left Tree */}
        <g fill="#276B43">
          <polygon points="45,95 33,120 57,120" />
          <polygon points="45,110 30,135 60,135" />
          <polygon points="45,125 27,152 63,152" />
        </g>

        {/* Mid-Left Tree */}
        <g fill="#378859">
          <polygon points="75,110 65,130 85,130" />
          <polygon points="75,122 62,142 88,142" />
          <polygon points="75,135 58,155 92,155" />
        </g>

        {/* Mid-Right Tree */}
        <g fill="#2D7A4D">
          <polygon points="120,110 110,130 130,130" />
          <polygon points="120,122 107,142 133,142" />
          <polygon points="120,135 103,155 137,155" />
        </g>

        {/* Right Large Tree */}
        <g fill="#24643E">
          <polygon points="155,90 143,115 167,115" />
          <polygon points="155,105 140,132 170,132" />
          <polygon points="155,120 137,152 173,152" />
        </g>

        {/* River Water Waves at base */}
        <path 
          d="M0,150 Q50,140 100,152 T200,148 L200,200 L0,200 Z" 
          fill="url(#waterGrad)" 
        />
        <path 
          d="M0,162 Q55,152 110,165 T200,158" 
          stroke="#7AD2DF" 
          strokeWidth="4" 
          fill="none" 
          strokeLinecap="round" 
        />
        <path 
          d="M0,174 Q60,168 120,177 T200,172" 
          stroke="#FFFFFF" 
          strokeWidth="2.5" 
          opacity="0.8" 
          fill="none" 
          strokeLinecap="round" 
        />
      </g>
    </svg>
  );

  const emblemNode = (
    <div className={`relative shrink-0 rounded-full overflow-hidden ${badgeDimensions[size]} transition transform group-hover:scale-105`}>
      {!imgError ? (
        <img
          src="/logo.jpg"
          alt="My Stay Voyager"
          onError={() => setImgError(true)}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        renderVectorEmblem()
      )}
    </div>
  );

  // 1. Badge Only Variant
  if (variant === 'badge') {
    return <div className={`inline-flex items-center ${className}`}>{emblemNode}</div>;
  }

  // 2. Full Stacked Variant (Emblem above, MY STAY, VOYAGER - MSV - below)
  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center text-center select-none ${className}`}>
        {emblemNode}
        <div className="mt-3">
          <span className={`block font-serif font-black tracking-wider text-[#24587C] leading-none ${textSizes[size].title}`}>
            MY STAY
          </span>
          {showSubtitle && (
            <span className={`block mt-1 font-sans font-semibold tracking-[0.25em] text-[#3D7C9F] uppercase ${textSizes[size].sub}`}>
              VOYAGER &bull; MSV
            </span>
          )}
        </div>
      </div>
    );
  }

  // 3. Footer Variant (Optimized for dark or warm charcoal footers)
  if (variant === 'footer') {
    return (
      <div className={`flex items-center gap-3 select-none ${className}`}>
        {emblemNode}
        <div>
          <div className="flex items-center gap-2">
            <span className="font-serif font-black text-2xl tracking-tight text-[#E8EDEA]">
              MY STAY
            </span>
            <span className="text-[10px] tracking-widest font-mono uppercase bg-[#2C483F] text-[#A3E5C8] px-2 py-0.5 rounded border border-[#3E6558]">
              MSV
            </span>
          </div>
          {showSubtitle && (
            <p className="text-xs font-sans tracking-[0.2em] text-stone-400 uppercase mt-0.5">
              VOYAGER &bull; Tourisme Durable
            </p>
          )}
        </div>
      </div>
    );
  }

  // 4. Default: Horizontal Variant (for Navbar and Headers)
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {emblemNode}
      <div>
        <div className="flex items-center gap-2">
          <span className="font-serif font-black text-2xl tracking-tight text-[#1F2923]">
            MY STAY
          </span>
          <span className="hidden sm:inline-block text-[10px] tracking-wider uppercase font-semibold text-[#8C5E45] bg-[#F7EBE4] px-1.5 py-0.5 rounded border border-[#E9D5C9]">
            Rural & Durable
          </span>
        </div>
        {showSubtitle && (
          <p className="text-[11px] font-sans font-medium tracking-[0.18em] text-[#3D7C9F] uppercase">
            VOYAGER &bull; MSV
          </p>
        )}
      </div>
    </div>
  );
};
