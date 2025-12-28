import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useLanguage } from '../../contexts/LanguageContext';
import { GenderStat } from '../../lib/api';

interface GenderPieChartProps {
  data: GenderStat[];
}

const COLORS = {
  M: '#0081C8', // Azul olímpico
  F: '#EE334E'  // Vermelho olímpico
};

const CustomTooltip = ({ active, payload }: any) => {
  const { t } = useLanguage();

  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-2 border border-slate-200 shadow-lg rounded text-sm">
        <p className="font-bold text-slate-800">
          {data.name === 'M' ? t('male') : t('female')}
        </p>
        <p className="text-slate-600">
          {data.value.toLocaleString()} {t('athletes')}
        </p>
        <p className="text-xs text-slate-400">
          ({data.percent.toFixed(1)}%)
        </p>
      </div>
    );
  }
  return null;
};

export default function GenderPieChart({ data }: GenderPieChartProps) {
  const { t } = useLanguage();

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const total = data.reduce((acc, curr) => acc + curr.Count, 0);
    
    return data.map(item => ({
      name: item.Sex,
      value: item.Count,
      percent: (item.Count / total) * 100
    })).sort((a, b) => b.value - a.value); // Ordenar para consistência visual
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-400">
        {t('no_data')}
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[entry.name as keyof typeof COLORS]} 
                stroke="none"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value) => value === 'M' ? t('male') : t('female')}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

