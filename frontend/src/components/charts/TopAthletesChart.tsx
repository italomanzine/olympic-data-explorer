"use client";

import React, { memo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useLanguage } from "../../contexts/LanguageContext";

interface TopAthlete {
  id: number;
  name: string;
  noc: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
}

interface TopAthletesChartProps {
  data: TopAthlete[];
  medalType?: string;
}

const MEDAL_COLORS = {
  gold: "#FFD700",
  silver: "#C0C0C0", 
  bronze: "#CD7F32",
  total: "#3B82F6",
};

// Exported for testing
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CustomTooltip = memo(({ active, payload }: any) => {
  const { t, tCountry } = useLanguage();

  if (active && payload && payload.length) {
    const athlete = payload[0]?.payload;
    if (!athlete) return null;

    return (
      <div className="bg-white/95 backdrop-blur-sm p-3 border border-slate-200 shadow-xl rounded-lg text-sm">
        <p className="font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1">
          {athlete.name}
        </p>
        <p className="text-xs text-slate-500 mb-2">
          {tCountry(athlete.noc) || athlete.noc} ({athlete.noc})
        </p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: MEDAL_COLORS.gold }}
            />
            <span className="font-medium text-slate-600">{t("gold")}:</span>
            <span className="font-bold text-slate-800">{athlete.gold}</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: MEDAL_COLORS.silver }}
            />
            <span className="font-medium text-slate-600">{t("silver")}:</span>
            <span className="font-bold text-slate-800">{athlete.silver}</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: MEDAL_COLORS.bronze }}
            />
            <span className="font-medium text-slate-600">{t("bronze")}:</span>
            <span className="font-bold text-slate-800">{athlete.bronze}</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: MEDAL_COLORS.total }}
            />
            <span className="font-medium text-slate-600">{t("total")}:</span>
            <span className="font-bold text-slate-800">{athlete.total}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
});

CustomTooltip.displayName = "CustomTooltip";

function TopAthletesChart({ data, medalType = "Total" }: TopAthletesChartProps) {
  const { t } = useLanguage();

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 text-sm">
        {t("no_data") || "Sem dados"}
      </div>
    );
  }

  // Formatar dados para exibição (nome abreviado)
  const formattedData = data.map((athlete) => ({
    ...athlete,
    displayName:
      athlete.name.length > 20
        ? athlete.name.substring(0, 18) + "..."
        : athlete.name,
  }));

  // Determinar qual barra mostrar baseado no filtro de medalha
  const getBarConfig = () => {
    switch (medalType) {
      case "Gold":
        return { dataKey: "gold", fill: MEDAL_COLORS.gold, name: t("gold") };
      case "Silver":
        return { dataKey: "silver", fill: MEDAL_COLORS.silver, name: t("silver") };
      case "Bronze":
        return { dataKey: "bronze", fill: MEDAL_COLORS.bronze, name: t("bronze") };
      default:
        return null; // Stacked bars for total
    }
  };

  const singleBarConfig = getBarConfig();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={formattedData}
        layout="vertical"
        margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={true} vertical={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: "#64748b" }}
          axisLine={{ stroke: "#e2e8f0" }}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="displayName"
          tick={{ fontSize: 10, fill: "#475569" }}
          axisLine={false}
          tickLine={false}
          width={100}
        />
        <Tooltip content={<CustomTooltip />} />
        
        {singleBarConfig ? (
          // Single bar for specific medal type
          <Bar
            dataKey={singleBarConfig.dataKey}
            fill={singleBarConfig.fill}
            name={singleBarConfig.name}
            radius={[0, 4, 4, 0]}
          />
        ) : (
          // Stacked bars for total
          <>
            <Bar
              dataKey="gold"
              stackId="medals"
              fill={MEDAL_COLORS.gold}
              name={t("gold")}
            />
            <Bar
              dataKey="silver"
              stackId="medals"
              fill={MEDAL_COLORS.silver}
              name={t("silver")}
            />
            <Bar
              dataKey="bronze"
              stackId="medals"
              fill={MEDAL_COLORS.bronze}
              name={t("bronze")}
              radius={[0, 4, 4, 0]}
            />
          </>
        )}
        
        <Legend
          wrapperStyle={{ fontSize: "11px" }}
          formatter={(value) => <span className="text-slate-600">{value}</span>}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default memo(TopAthletesChart);
