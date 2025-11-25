"use client";

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useLanguage } from "../../contexts/LanguageContext";

interface EvolutionData {
  Year: number;
  [key: string]: number; 
}

interface EvolutionChartProps {
  data: EvolutionData[];
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088FE", "#00C49F"];

const CustomTooltip = ({ active, payload, label }: any) => {
  const { t } = useLanguage();
  
  if (active && payload && payload.length) {
    // Ordenar payload por valor (decrescente)
    const sortedPayload = [...payload].sort((a, b) => b.value - a.value);

    return (
      <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-sm z-50">
        <p className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-1">{t('edition')}: {label}</p>
        <div className="space-y-1">
          {sortedPayload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <span 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              ></span>
              <span className="font-medium text-slate-600 w-10">{entry.name}:</span>
              <span className="font-bold text-slate-800">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function EvolutionChart({ data }: EvolutionChartProps) {
  const { t } = useLanguage();
  const keys = data.length > 0 ? Object.keys(data[0]).filter(k => k !== 'Year') : [];

  return (
    <div className="w-full h-full bg-white rounded-xl">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
          <defs>
            {keys.map((key, i) => (
              <linearGradient key={key} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.6}/>
                <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.1}/>
              </linearGradient>
            ))}
          </defs>
          <XAxis 
            dataKey="Year" 
            stroke="#94A3B8"
            label={{ value: t('edition'), position: 'insideBottom', offset: -10, fill: '#94A3B8' }}
          />
          <YAxis 
            stroke="#94A3B8"
            label={{ value: t('total'), angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' }, fill: '#94A3B8', offset: 0 }}
          />
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={36} />
          {keys.map((key, i) => (
            <Area 
              key={key}
              type="monotone" 
              dataKey={key} 
              // stackId removido para mostrar valores reais (overlapping)
              stroke={COLORS[i % COLORS.length]} 
              fill={`url(#color${key})`} 
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
