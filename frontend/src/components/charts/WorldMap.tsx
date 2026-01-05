"use client";

import React, { useMemo, useState, memo } from "react";
import { createPortal } from "react-dom";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { useLanguage } from "../../contexts/LanguageContext";

const GEO_URL = "https://cdn.jsdelivr.net/gh/holtzy/D3-graph-gallery@master/DATA/world.geojson";

interface MapData {
  id: string;
  total: number;
  gold: number;
  silver: number;
  bronze: number;
}

interface WorldMapProps {
  data: MapData[];
}

export function calculateTooltipPosition(
  mouseX: number, 
  mouseY: number, 
  tooltipWidth: number = 160, 
  tooltipHeight: number = 130
) {
  const padding = 10;
  const cursorOffset = 12;
  
  let left = mouseX + cursorOffset;
  let top = mouseY + cursorOffset;
  
  if (left + tooltipWidth > window.innerWidth - padding) {
    left = mouseX - tooltipWidth - cursorOffset;
  }
  
  if (top + tooltipHeight > window.innerHeight - padding) {
    top = mouseY - tooltipHeight - cursorOffset;
  }
  
  if (left < padding) {
    left = padding;
  }
  
  if (top < padding) {
    top = padding;
  }
  
  return { left, top };
}

interface TooltipProps {
  content: { name: string; stats?: MapData; x: number; y: number };
  t: (key: string) => string;
}

function TooltipPortal({ content, t }: TooltipProps) {
  const pos = calculateTooltipPosition(content.x, content.y);

  if (typeof window === 'undefined') return null;

  return createPortal(
    <div 
      className="fixed z-50 bg-white/95 backdrop-blur-sm border border-slate-200 shadow-xl rounded-lg p-2 sm:p-3 pointer-events-none text-xs sm:text-sm"
      style={{ 
        left: pos.left,
        top: pos.top,
        maxWidth: 'min(200px, calc(100vw - 24px))'
      }}
    >
      <p className="font-bold text-slate-800 mb-1 truncate">{content.name}</p>
      {content.stats ? (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500 shrink-0"></span>
            <span className="whitespace-nowrap text-slate-700">{t('gold')}: <span className="font-semibold text-slate-900">{content.stats.gold}</span></span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-400 shrink-0"></span>
            <span className="whitespace-nowrap text-slate-700">{t('silver')}: <span className="font-semibold text-slate-900">{content.stats.silver}</span></span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0"></span>
            <span className="whitespace-nowrap text-slate-700">{t('bronze')}: <span className="font-semibold text-slate-900">{content.stats.bronze}</span></span>
          </div>
          <div className="font-semibold mt-1 pt-1 border-t border-slate-200 text-slate-800">
            {t('total')}: <span className="text-slate-900">{content.stats.total}</span>
          </div>
        </div>
      ) : (
        <span className="text-slate-500 italic">{t('no_data')}</span>
      )}
    </div>,
    document.body
  );
}

function WorldMap({ data }: WorldMapProps) {
  const { t, tCountry } = useLanguage();
  const [tooltipContent, setTooltipContent] = useState<{
    name: string;
    stats?: MapData;
    x: number;
    y: number;
  } | null>(null);

  const dataMap = useMemo(() => {
    const map = new Map<string, MapData>();
    data.forEach(d => map.set(d.id, d));
    return map;
  }, [data]);

  const maxTotal = useMemo(() => {
    return data.length > 0 ? Math.max(...data.map((d) => d.total), 5) : 5;
  }, [data]);

  const colorScale = useMemo(() => {
    return scaleLinear<string>()
      .domain([0, maxTotal])
      .range(["#F1F5F9", "#FBBF24"]);
  }, [maxTotal]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (tooltipContent) {
      setTooltipContent(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
    }
  };

  return (
    <div 
      className="relative w-full h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] bg-slate-50 rounded-xl overflow-hidden border border-slate-100 group"
      onMouseMove={handleMouseMove}
    >
      <ComposableMap 
        projection="geoMercator" 
        projectionConfig={{ scale: 110, center: [0, 20] }}
        className="w-full h-full"
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup minZoom={1} maxZoom={4}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const countryId = geo.id || geo.properties?.ISO_A3 || geo.properties?.name; 
                const countryName = geo.properties?.name || countryId;
                
                const cur = dataMap.get(countryId);
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={cur ? colorScale(cur.total) : "#E2E8F0"}
                    stroke="#CBD5E1"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#3B82F6", outline: "none", cursor: "pointer" },
                      pressed: { outline: "none" },
                    }}
                    onMouseEnter={(evt) => {
                      let displayName = countryName;
                      if (countryId) {
                        try {
                           const translated = tCountry(countryId);
                           if (translated) displayName = translated;
                        } catch { }
                      }

                      const e = evt as unknown as React.MouseEvent;
                      setTooltipContent({
                        name: displayName,
                        stats: cur,
                        x: e.clientX,
                        y: e.clientY
                      });
                    }}
                    onMouseLeave={() => {
                      setTooltipContent(null);
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      
      {tooltipContent && <TooltipPortal content={tooltipContent} t={t} />}

      <div className="absolute bottom-2 sm:bottom-4 md:bottom-8 lg:bottom-12 left-2 sm:left-auto sm:right-4 md:right-8 lg:right-12 bg-white/95 backdrop-blur p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl shadow-md border border-slate-100 flex flex-col gap-1 sm:gap-2 min-w-[140px] sm:min-w-[180px] md:min-w-[220px] z-10">
        <div className="flex justify-between items-center text-[8px] sm:text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          <span>{t('few_medals')}</span>
          <span>{t('many_medals')}</span>
        </div>
        <div className="relative h-2 sm:h-3 w-full">
          <div className="absolute inset-0 rounded-full bg-linear-to-r from-[#F1F5F9] via-[#FDE68A] to-[#FBBF24] border border-slate-100"></div>
        </div>
        <div className="flex justify-between text-[8px] sm:text-[9px] md:text-[10px] text-slate-400 font-medium px-0.5">
          <span>0</span>
          <span>{maxTotal}+</span>
        </div>
      </div>
    </div>
  );
}

export default memo(WorldMap);
