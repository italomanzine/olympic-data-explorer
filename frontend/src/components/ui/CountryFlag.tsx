"use client";

import React, { useState, memo } from 'react';
import { getFlagWithSrcSet } from '../../lib/flags';

interface CountryFlagProps {
  noc: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showFallback?: boolean;
}

const SIZE_MAP = {
  xs: { width: 16, height: 12 },
  sm: { width: 20, height: 15 },
  md: { width: 32, height: 24 },
  lg: { width: 48, height: 36 },
  xl: { width: 64, height: 48 },
};

/**
 * Componente de bandeira de país baseado no código NOC
 * Usa flagcdn.com como fonte das imagens
 */
function CountryFlag({ 
  noc, 
  size = 'sm', 
  className = '',
  showFallback = true 
}: CountryFlagProps) {
  const [hasError, setHasError] = useState(false);
  const dimensions = SIZE_MAP[size];
  const { src, srcSet } = getFlagWithSrcSet(noc);

  if (hasError && showFallback) {
    // Fallback: mostrar código do país em um badge
    return (
      <span 
        className={`inline-flex items-center justify-center bg-slate-200 text-slate-600 text-[10px] font-bold rounded ${className}`}
        style={{ 
          width: dimensions.width, 
          height: dimensions.height,
          fontSize: size === 'xs' ? '8px' : '10px'
        }}
        title={noc}
      >
        {noc.substring(0, 3)}
      </span>
    );
  }

  return (
    <img
      src={src}
      srcSet={srcSet}
      alt={`Bandeira ${noc}`}
      title={noc}
      width={dimensions.width}
      height={dimensions.height}
      className={`inline-block object-cover rounded-sm shadow-sm ${className}`}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
}

export default memo(CountryFlag);
