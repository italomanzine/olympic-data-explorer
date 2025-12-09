"use client";

import React, { useMemo, memo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ZAxis,
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
  Sex: string;
  Height: number;
  Weight: number;
  Athletes: BiometricData[];
}

const CustomTooltip = memo(({ active, payload }: any) => {
  const { t, tCountry } = useLanguage();

  if (active && payload && payload.length) {
    const data: GroupedBiometricData = payload[0].payload;

    const sortedAthletes = [...data.Athletes].sort((a, b) => {
      const medalOrder: Record<string, number> = {
        Gold: 3,
        Silver: 2,
        Bronze: 1,
        NA: 0,
        "No Medal": 0,
      };
      return medalOrder[b.Medal] - medalOrder[a.Medal];
    });

    const displayAthletes = sortedAthletes.slice(0, 10);
    const remaining = sortedAthletes.length - 10;

    return (
      <div className="bg-white p-3 border border-slate-200 shadow-xl rounded-lg text-sm z-50 max-w-[250px]">
        <div className="mb-2 border-b border-slate-100 pb-1">
          <p className="font-bold text-slate-800">
            {data.Height}cm, {data.Weight}kg
          </p>
          <p className="text-xs text-slate-500">
            {data.Athletes.length} {t("athletes_here")}
          </p>
        </div>

        <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
          {displayAthletes.map((atleta, idx) => (
            <div
              key={idx}
              className="text-xs border-b border-slate-50 last:border-0 pb-1 last:pb-0"
            >
              <p className="font-semibold text-slate-700">
                {atleta.Name} ({tCountry(atleta.NOC) || atleta.NOC})
              </p>
              <p className="text-slate-500 inline-block mr-2">
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

function BiometricsChart({ data }: BiometricsChartProps) {
  const { t } = useLanguage();

  const groupedData = useMemo(() => {
    if (!data) return { M: [], F: [] };

    const groups: Record<string, GroupedBiometricData> = {};

    data.forEach((d) => {
      const key = `${d.Weight}-${d.Height}-${d.Sex}`;
      if (!groups[key]) {
        groups[key] = {
          uniqueKey: key,
          Sex: d.Sex,
          Height: d.Height,
          Weight: d.Weight,
          Athletes: [],
        };
      }
      groups[key].Athletes.push(d);
    });

    const allGroups = Object.values(groups);
    return {
      M: allGroups.filter((g) => g.Sex === "M"),
      F: allGroups.filter((g) => g.Sex === "F"),
    };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-400">
        {t("no_data")}
      </div>
    );
  }

  return (
    <div className="w-full h-full transition-opacity duration-300">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 50, left: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis
            type="number"
            dataKey="Weight"
            name={t("weight")}
            unit="kg"
            stroke="#94A3B8"
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
            domain={["30", "auto"]}
            stroke="#94A3B8"
            label={{
              value: `${t("height")} (cm)`,
              angle: -90,
              position: "insideLeft",
              fill: "#94A3B8",
              style: { textAnchor: "middle" },
              offset: -10,
            }}
          />
          <ZAxis
            type="number"
            dataKey="Athletes.length"
            range={[60, 400]}
            name="Qtd"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={36} />
          <Scatter
            name={t("female")}
            data={groupedData.F}
            fill="#EE334E"
            fillOpacity={0.6}
            shape="circle"
            animationDuration={400}
            animationEasing="ease-out"
          />
          <Scatter
            name={t("male")}
            data={groupedData.M}
            fill="#0081C8"
            fillOpacity={0.6}
            shape="triangle"
            animationDuration={400}
            animationEasing="ease-out"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

export default memo(BiometricsChart);
