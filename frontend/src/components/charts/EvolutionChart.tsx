"use client";

import React, { memo, useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useLanguage } from "../../contexts/LanguageContext";

interface EvolutionData {
  Year: number;
  [key: string]: number; 
}

interface EvolutionChartProps {
  data: EvolutionData[];
}

// Paleta de 10 cores distintas e vibrantes
const COLORS = [
  "#2563EB", // blue-600
  "#DC2626", // red-600
  "#16A34A", // green-600
  "#CA8A04", // yellow-600
  "#9333EA", // purple-600
  "#EA580C", // orange-600
  "#0891B2", // cyan-600
  "#DB2777", // pink-600
  "#4F46E5", // indigo-600
  "#65A30D", // lime-600
];

// Mapeamento de países que mudaram de nome/código
const COUNTRY_NOTES: Record<string, string> = {
  'URS': 'URSS (→ RUS em 1992)',
  'RUS': 'Rússia (ex-URSS)',
  'GDR': 'Alemanha Oriental (→ GER)',
  'FRG': 'Alemanha Ocidental (→ GER)',
  'TCH': 'Tchecoslováquia (→ CZE/SVK)',
  'YUG': 'Iugoslávia',
  'EUN': 'Equipe Unificada (1992)',
  'ROC': 'Comitê Olímpico Russo',
};

// Exported for testing
export const CustomTooltip = memo(({ active, payload, label }: any) => {
  const { t } = useLanguage();
  
  if (active && payload && payload.length) {
    const sortedPayload = [...payload]
      .filter((p: any) => p.value > 0)
      .sort((a, b) => b.value - a.value);

    return (
      <div className="bg-white/95 backdrop-blur-sm p-3 border border-slate-200 shadow-xl rounded-lg text-sm max-h-[300px] overflow-y-auto">
        <p className="font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1">{t('edition')}: {label}</p>
        <div className="space-y-1">
          {sortedPayload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <span 
                className="w-3 h-3 rounded-full shrink-0" 
                style={{ backgroundColor: entry.color }}
              ></span>
              <span className="font-medium text-slate-600 min-w-10">{entry.name}:</span>
              <span className="font-bold text-slate-800">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
});

CustomTooltip.displayName = 'CustomTooltip';

// Exported for testing
export const CustomLegend = memo(({ payload, hiddenKeys, toggleKey }: any) => {
  return (
    <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 px-2 py-1">
      {payload?.map((entry: any, index: number) => {
        const isHidden = hiddenKeys.includes(entry.value);
        const note = COUNTRY_NOTES[entry.value];
        
        return (
          <button
            key={index}
            onClick={() => toggleKey(entry.value)}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium transition-all hover:scale-105 ${
              isHidden 
                ? 'opacity-40 line-through bg-slate-100' 
                : 'bg-slate-50 hover:bg-slate-100'
            }`}
            title={note || entry.value}
          >
            <span 
              className="w-2.5 h-2.5 rounded-full shrink-0" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-700">{entry.value}</span>
            {note && <span className="text-slate-400 text-[10px]">*</span>}
          </button>
        );
      })}
    </div>
  );
});

CustomLegend.displayName = 'CustomLegend';

function EvolutionChart({ data }: EvolutionChartProps) {
  const { t } = useLanguage();
  const [hiddenKeys, setHiddenKeys] = useState<string[]>([]);
  
  const keys = useMemo(() => {
    return data.length > 0 ? Object.keys(data[0]).filter(k => k !== 'Year') : [];
  }, [data]);

  const toggleKey = (key: string) => {
    setHiddenKeys(prev => 
      prev.includes(key) 
        ? prev.filter(k => k !== key) 
        : [...prev, key]
    );
  };

  // Verifica se há países com notas históricas
  const hasHistoricalNotes = useMemo(() => {
    return keys.some(key => COUNTRY_NOTES[key]);
  }, [keys]);

  return (
    <div className="w-full h-full bg-white rounded-xl transition-opacity duration-300 flex flex-col">
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis 
              dataKey="Year" 
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#CBD5E1' }}
              label={{ value: t('edition'), position: 'insideBottom', offset: -15, fill: '#64748B', fontSize: 11 }}
            />
            <YAxis 
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#CBD5E1' }}
              label={{ value: t('total'), angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' }, fill: '#64748B', fontSize: 11, offset: 5 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              content={<CustomLegend hiddenKeys={hiddenKeys} toggleKey={toggleKey} />}
              verticalAlign="top" 
              height={40}
            />
            {keys.map((key, i) => (
              <Line 
                key={key}
                type="monotone" 
                dataKey={key} 
                stroke={COLORS[i % COLORS.length]} 
                strokeWidth={2.5}
                dot={{ r: 3, strokeWidth: 2, fill: 'white' }}
                activeDot={{ r: 5, strokeWidth: 2 }}
                hide={hiddenKeys.includes(key)}
                animationDuration={400}
                animationEasing="ease-out"
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Nota sobre países históricos */}
      {hasHistoricalNotes && (
        <div className="text-[10px] text-slate-400 text-center pb-1 px-2">
          * Países com mudanças históricas de nome/código. Clique na legenda para ocultar/exibir.
        </div>
      )}
    </div>
  );
}

export default memo(EvolutionChart);
