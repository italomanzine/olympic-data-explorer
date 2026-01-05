"use client";

import React from 'react';

type SkeletonVariant = 'map' | 'chart' | 'table' | 'pie' | 'bar';

interface ChartSkeletonProps {
  variant?: SkeletonVariant;
  message?: string;
}

const shimmerClass = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

function MapSkeleton() {
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div className="w-full max-w-lg aspect-[2/1] relative">
        {/* Continentes simulados */}
        <div className={`absolute top-[10%] left-[10%] w-[25%] h-[35%] bg-slate-200 rounded-lg ${shimmerClass}`} />
        <div className={`absolute top-[15%] left-[40%] w-[20%] h-[30%] bg-slate-200 rounded-lg ${shimmerClass}`} />
        <div className={`absolute top-[20%] right-[10%] w-[22%] h-[40%] bg-slate-200 rounded-lg ${shimmerClass}`} />
        <div className={`absolute bottom-[15%] left-[15%] w-[15%] h-[25%] bg-slate-200 rounded-lg ${shimmerClass}`} />
        <div className={`absolute bottom-[10%] right-[25%] w-[18%] h-[20%] bg-slate-200 rounded-lg ${shimmerClass}`} />
        
        {/* Legenda */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <div className={`w-16 h-2 bg-slate-200 rounded ${shimmerClass}`} />
          <div className={`w-8 h-3 bg-slate-200 rounded ${shimmerClass}`} />
        </div>
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="w-full h-full flex items-end justify-center gap-2 p-6 pb-10">
      {/* Eixo Y simulado */}
      <div className="absolute left-4 top-4 bottom-10 w-8 flex flex-col justify-between">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`w-6 h-2 bg-slate-200 rounded ${shimmerClass}`} />
        ))}
      </div>
      
      {/* Linhas do gráfico */}
      <div className="flex-1 h-full flex items-end justify-center gap-1 px-10">
        {[65, 45, 80, 55, 70, 40, 90, 60, 75, 50, 85, 45].map((h, i) => (
          <div
            key={i}
            className={`flex-1 bg-slate-200 rounded-t ${shimmerClass}`}
            style={{ height: `${h}%`, animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
      
      {/* Eixo X simulado */}
      <div className="absolute bottom-4 left-12 right-4 flex justify-between">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`w-8 h-2 bg-slate-200 rounded ${shimmerClass}`} />
        ))}
      </div>
    </div>
  );
}

function PieSkeleton() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      {/* Círculo do pie chart */}
      <div className="relative w-40 h-40">
        <div className={`w-full h-full rounded-full bg-slate-200 ${shimmerClass}`} />
        <div className="absolute inset-[25%] rounded-full bg-white" />
      </div>
      
      {/* Legenda */}
      <div className="flex gap-6 mt-6">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full bg-slate-200 ${shimmerClass}`} />
          <div className={`w-16 h-3 bg-slate-200 rounded ${shimmerClass}`} />
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full bg-slate-200 ${shimmerClass}`} />
          <div className={`w-16 h-3 bg-slate-200 rounded ${shimmerClass}`} />
        </div>
      </div>
    </div>
  );
}

function BarSkeleton() {
  return (
    <div className="w-full h-full flex flex-col gap-3 p-4">
      {[85, 70, 60, 50, 45, 40, 35, 30, 25, 20].map((w, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className={`w-20 h-4 bg-slate-200 rounded ${shimmerClass}`} />
          <div 
            className={`h-6 bg-slate-200 rounded ${shimmerClass}`}
            style={{ width: `${w}%`, animationDelay: `${i * 50}ms` }}
          />
        </div>
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="w-full h-full p-4">
      {/* Cabeçalho */}
      <div className="flex gap-4 mb-4 pb-3 border-b border-slate-100">
        <div className={`w-8 h-4 bg-slate-200 rounded ${shimmerClass}`} />
        <div className={`flex-1 h-4 bg-slate-200 rounded ${shimmerClass}`} />
        <div className={`w-8 h-4 bg-slate-200 rounded ${shimmerClass}`} />
        <div className={`w-8 h-4 bg-slate-200 rounded ${shimmerClass}`} />
        <div className={`w-8 h-4 bg-slate-200 rounded ${shimmerClass}`} />
        <div className={`w-12 h-4 bg-slate-200 rounded ${shimmerClass}`} />
      </div>
      
      {/* Linhas */}
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex gap-4 py-3" style={{ animationDelay: `${i * 50}ms` }}>
          <div className={`w-8 h-4 bg-slate-100 rounded ${shimmerClass}`} />
          <div className={`flex-1 h-4 bg-slate-100 rounded ${shimmerClass}`} />
          <div className={`w-8 h-4 bg-yellow-50 rounded ${shimmerClass}`} />
          <div className={`w-8 h-4 bg-slate-50 rounded ${shimmerClass}`} />
          <div className={`w-8 h-4 bg-amber-50 rounded ${shimmerClass}`} />
          <div className={`w-12 h-4 bg-slate-100 rounded ${shimmerClass}`} />
        </div>
      ))}
    </div>
  );
}

export default function ChartSkeletonLoader({ variant = 'chart', message }: ChartSkeletonProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case 'map':
        return <MapSkeleton />;
      case 'pie':
        return <PieSkeleton />;
      case 'bar':
        return <BarSkeleton />;
      case 'table':
        return <TableSkeleton />;
      default:
        return <ChartSkeleton />;
    }
  };

  return (
    <div className="w-full h-full relative">
      {renderSkeleton()}
      
      {message && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-olympic-blue border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-slate-600 font-medium animate-pulse">
              {message}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Exportar variantes individuais para uso direto
export { MapSkeleton, ChartSkeleton as LineSkeleton, PieSkeleton, BarSkeleton, TableSkeleton };

