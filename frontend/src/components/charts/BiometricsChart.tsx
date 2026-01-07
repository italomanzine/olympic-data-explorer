"use client";

import React, { useMemo, memo, useCallback } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useLanguage } from "../../contexts/LanguageContext";

interface BiometricData {
  Name: string;
  Sex: string;
  Height: number;
  Weight: number;
  Medal: string;
  NOC: string;
  Sport: string;
}

interface BiometricsChartProps {
  data: BiometricData[];
}

interface GroupedBiometricData {
  uniqueKey: string;
  Height: number;
  Weight: number;
  Athletes: BiometricData[];
  maleCount: number;
  femaleCount: number;
  dominantSex: "M" | "F" | "mixed";
}

const getMedalRank = (medal: string): number => {
  const medalOrder: Record<string, number> = {
    Gold: 3,
    Silver: 2,
    Bronze: 1,
    NA: 0,
    "No Medal": 0,
  };
  return medalOrder[medal] || 0;
};

// Cores para os diferentes casos
const COLORS = {
  male: "#0081C8",      // Azul olímpico
  female: "#EE334E",    // Rosa olímpico
  mixed: "#9333EA",     // Roxo para indicar ambos os sexos
};

export const CustomTooltip = memo(({ active, payload }: any) => {
  const { t, tCountry } = useLanguage();

  if (active && payload && payload.length) {
    const data: GroupedBiometricData = payload[0].payload;

    // Validação extra: verificar se os dados existem
    if (!data || !data.Athletes || !Array.isArray(data.Athletes)) {
      return null;
    }

    const sortedAthletes = [...data.Athletes].sort((a, b) => {
      // Ordenar por medalha primeiro, depois por sexo
      const medalDiff = getMedalRank(b.Medal) - getMedalRank(a.Medal);
      if (medalDiff !== 0) return medalDiff;
      return a.Sex.localeCompare(b.Sex);
    });

    const displayAthletes = sortedAthletes.slice(0, 10);
    const remaining = sortedAthletes.length - 10;

    return (
      <div className="bg-white p-3 border border-slate-200 shadow-xl rounded-lg text-sm z-50 max-w-[280px]">
        <div className="mb-2 border-b border-slate-100 pb-1">
          <p className="font-bold text-slate-800">
            {data.Height}cm, {data.Weight}kg
          </p>
          <p className="text-xs text-slate-500">
            {data.Athletes.length} {t("athletes_here")}
            {data.maleCount > 0 && data.femaleCount > 0 && (
              <span className="ml-1">
                ({data.femaleCount} {t("female")}, {data.maleCount} {t("male")})
              </span>
            )}
          </p>
        </div>

        <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
          {displayAthletes.map((atleta, idx) => (
            <div
              key={`${atleta.Name}-${idx}`}
              className="text-xs border-b border-slate-50 last:border-0 pb-1 last:pb-0"
            >
              <p className="font-semibold text-slate-700">
                {atleta.Name} ({tCountry(atleta.NOC) || atleta.NOC})
              </p>
              <p className={`inline-block mr-2 font-medium ${atleta.Sex === "M" ? "text-blue-600" : "text-pink-600"}`}>
                {atleta.Sex === "M" ? t("male") : t("female")}
              </p>
              {atleta.Medal !== "NA" && atleta.Medal !== "No Medal" && (
                <span
                  className={`font-bold text-[10px] px-1 rounded ${
                    atleta.Medal === "Gold"
                      ? "bg-yellow-100 text-yellow-700"
                      : atleta.Medal === "Silver"
                      ? "bg-slate-100 text-slate-600"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {t(atleta.Medal.toLowerCase()) || atleta.Medal}
                </span>
              )}
            </div>
          ))}
        </div>

        {remaining > 0 && (
          <p className="text-xs text-slate-400 mt-2 italic">
            + {remaining} {t("other_athletes")}
          </p>
        )}
      </div>
    );
  }
  return null;
});

CustomTooltip.displayName = 'CustomTooltip';

// Forma customizada SVG usando render prop
const renderCustomShape = (props: any): React.ReactElement => {
  const { cx, cy, payload } = props;
  
  if (cx === undefined || cy === undefined || !payload) {
    return <g />;
  }
  
  const data = payload as GroupedBiometricData;
  const size = Math.min(8, 4 + (data.Athletes?.length || 1) * 0.2);
  
  if (data.dominantSex === "mixed") {
    // Círculo dividido ao meio
    return (
      <g>
        <path
          d={`M ${cx} ${cy - size} A ${size} ${size} 0 0 0 ${cx} ${cy + size} Z`}
          fill={COLORS.female}
          fillOpacity={0.8}
        />
        <path
          d={`M ${cx} ${cy - size} A ${size} ${size} 0 0 1 ${cx} ${cy + size} Z`}
          fill={COLORS.male}
          fillOpacity={0.8}
        />
        <circle
          cx={cx}
          cy={cy}
          r={size}
          fill="none"
          stroke="#666"
          strokeWidth={0.5}
        />
      </g>
    );
  } else if (data.dominantSex === "F") {
    return (
      <circle
        cx={cx}
        cy={cy}
        r={size}
        fill={COLORS.female}
        fillOpacity={0.8}
      />
    );
  } else {
    const h = size * 1.2;
    const w = size * 0.87;
    return (
      <polygon
        points={`${cx},${cy - h} ${cx - w},${cy + h * 0.5} ${cx + w},${cy + h * 0.5}`}
        fill={COLORS.male}
        fillOpacity={0.8}
      />
    );
  }
};

// Legenda customizada
const CustomLegend = memo(() => {
  const { t } = useLanguage();
  
  return (
    <div className="flex justify-center gap-6 mb-2">
      <div className="flex items-center gap-1.5">
        <svg width="12" height="12">
          <circle cx="6" cy="6" r="5" fill={COLORS.female} fillOpacity={0.8} />
        </svg>
        <span className="text-sm text-slate-600">{t("female")}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <svg width="12" height="12">
          <polygon points="6,1 1,11 11,11" fill={COLORS.male} fillOpacity={0.8} />
        </svg>
        <span className="text-sm text-slate-600">{t("male")}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <svg width="12" height="12">
          <path d="M 6 1 A 5 5 0 0 0 6 11 Z" fill={COLORS.female} fillOpacity={0.8} />
          <path d="M 6 1 A 5 5 0 0 1 6 11 Z" fill={COLORS.male} fillOpacity={0.8} />
          <circle cx="6" cy="6" r="5" fill="none" stroke="#666" strokeWidth={0.5} />
        </svg>
        <span className="text-sm text-slate-600">{t("female")} + {t("male")}</span>
      </div>
    </div>
  );
});

CustomLegend.displayName = 'CustomLegend';

function BiometricsChart({ data }: BiometricsChartProps) {
  const { t } = useLanguage();

  const groupedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Agrupar por coordenadas (peso + altura)
    const groups: Record<string, {
      uniqueKey: string;
      Height: number;
      Weight: number;
      AthletesMap: Map<string, BiometricData>;
    }> = {};

    data.forEach((d) => {
      // Ignorar dados inválidos
      if (!d.Height || !d.Weight || !d.Name) return;
      
      const key = `${d.Weight}-${d.Height}`;
      if (!groups[key]) {
        groups[key] = {
          uniqueKey: key,
          Height: d.Height,
          Weight: d.Weight,
          AthletesMap: new Map(),
        };
      }
      
      // Usar Name como chave para evitar duplicatas
      const existing = groups[key].AthletesMap.get(d.Name);
      if (!existing || getMedalRank(d.Medal) > getMedalRank(existing.Medal)) {
        groups[key].AthletesMap.set(d.Name, d);
      }
    });

    const allGroups: GroupedBiometricData[] = Object.values(groups).map(g => {
      const athletes = Array.from(g.AthletesMap.values());
      const maleCount = athletes.filter(a => a.Sex === "M").length;
      const femaleCount = athletes.filter(a => a.Sex === "F").length;
      
      let dominantSex: "M" | "F" | "mixed";
      if (maleCount > 0 && femaleCount > 0) {
        dominantSex = "mixed";
      } else if (femaleCount > 0) {
        dominantSex = "F";
      } else {
        dominantSex = "M";
      }
      
      return {
        uniqueKey: g.uniqueKey,
        Height: g.Height,
        Weight: g.Weight,
        Athletes: athletes,
        maleCount,
        femaleCount,
        dominantSex,
      };
    });

    return allGroups;
  }, [data]);

  const renderShape = useCallback(renderCustomShape, []);

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-400">
        {t("no_data")}
      </div>
    );
  }

  return (
    <div className="w-full h-full transition-opacity duration-300">
      <CustomLegend />
      <ResponsiveContainer width="100%" height="95%">
        <ScatterChart margin={{ top: 10, right: 20, bottom: 50, left: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis
            type="number"
            dataKey="Weight"
            name={t("weight")}
            unit="kg"
            stroke="#94A3B8"
            domain={['dataMin - 5', 'dataMax + 5']}
            label={{
              value: `${t("weight")} (kg)`,
              position: "bottom",
              offset: 10,
              fill: "#94A3B8",
            }}
          />
          <YAxis
            type="number"
            dataKey="Height"
            name={t("height")}
            unit="cm"
            stroke="#94A3B8"
            domain={['dataMin - 5', 'dataMax + 5']}
            label={{
              value: `${t("height")} (cm)`,
              angle: -90,
              position: "insideLeft",
              fill: "#94A3B8",
              style: { textAnchor: "middle" },
              offset: -10,
            }}
          />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }}
            content={<CustomTooltip />} 
            isAnimationActive={false}
          />
          <Scatter
            name="Athletes"
            data={groupedData}
            shape={renderShape}
            isAnimationActive={false}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

export default memo(BiometricsChart);
