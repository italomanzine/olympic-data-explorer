"use client";

import React, { useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { useLanguage } from "../../contexts/LanguageContext";

// Mapa com ISO Alpha-3 codes via CDN confiável
const GEO_URL = "https://cdn.jsdelivr.net/gh/holtzy/D3-graph-gallery@master/DATA/world.geojson";

interface MapData {
  id: string; // NOC code (USA, BRA)
  total: number;
  gold: number;
  silver: number;
  bronze: number;
}

interface WorldMapProps {
  data: MapData[];
}

export default function WorldMap({ data }: WorldMapProps) {
  const { t, tCountry } = useLanguage();
  const [tooltipContent, setTooltipContent] = useState<{
    x: number;
    y: number;
    name: string;
    stats?: MapData;
  } | null>(null);

  const maxTotal = useMemo(() => {
    return data.length > 0 ? Math.max(...data.map((d) => d.total), 5) : 5;
  }, [data]);

  const colorScale = useMemo(() => {
    return scaleLinear<string>()
      .domain([0, maxTotal])
      .range(["#F1F5F9", "#FBBF24"]);
  }, [maxTotal]);

  return (
    <div className="relative w-full h-[450px] bg-slate-50 rounded-xl overflow-hidden border border-slate-100 group">
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
                // Tenta obter o ID de várias formas
                const countryId = geo.id || geo.properties?.ISO_A3 || geo.properties?.name; 
                const countryName = geo.properties?.name || countryId;
                
                const cur = data.find((s) => s.id === countryId);
                
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
                    onMouseEnter={(evt) => {}}
                    onMouseMove={(evt) => {
                      let displayName = countryName;
                      if (countryId) {
                        try {
                           const translated = tCountry(countryId);
                           if (translated) displayName = translated;
                        } catch (e) { }
                      }

                      setTooltipContent({
                        x: evt.clientX,
                        y: evt.clientY,
                        name: displayName,
                        stats: cur
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
      
      {/* Tooltip Flutuante */}
      {tooltipContent && (
        <div 
          className="fixed z-50 bg-white/95 backdrop-blur border border-slate-200 shadow-xl rounded-lg p-3 pointer-events-none text-sm transform -translate-x-1/2 -translate-y-full mt-[-10px]"
          style={{ left: tooltipContent.x, top: tooltipContent.y }}
        >
          <p className="font-bold text-slate-800 mb-1">{tooltipContent.name}</p>
          {tooltipContent.stats ? (
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                <span>{t('gold')}: {tooltipContent.stats.gold}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                <span>{t('silver')}: {tooltipContent.stats.silver}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-700"></span>
                <span>{t('bronze')}: {tooltipContent.stats.bronze}</span>
              </div>
              <div className="font-semibold mt-1 pt-1 border-t border-slate-100 text-slate-600">
                {t('total')}: {tooltipContent.stats.total}
              </div>
            </div>
          ) : (
            <span className="text-slate-400 italic">{t('no_data')}</span>
          )}
        </div>
      )}

      {/* Legenda de Gradiente Melhorada - Reposicionada */}
      <div className="absolute bottom-12 right-12 bg-white/95 backdrop-blur p-4 rounded-xl shadow-md border border-slate-100 flex flex-col gap-2 min-w-[220px] z-10">
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          <span>{t('few_medals')}</span>
          <span>{t('many_medals')}</span>
        </div>
        <div className="relative h-3 w-full">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#F1F5F9] via-[#FDE68A] to-[#FBBF24] border border-slate-100"></div>
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 font-medium px-0.5">
          <span>0</span>
          <span>{maxTotal}+</span>
        </div>
      </div>
    </div>
  );
}
