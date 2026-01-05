"use client";

import React, { memo, useMemo } from 'react';
import { MedalStat } from "../lib/api";
import { useLanguage } from "../contexts/LanguageContext";
import CountryFlag from "./ui/CountryFlag";
import { Maximize2 } from "lucide-react";

interface MedalTableProps {
  data: MedalStat[];
  title: string;
  onExpand?: () => void;
  isLoading?: boolean;
}

const isCountryCode = (code: string): boolean => {
  return /^[A-Z]{3}$/.test(code);
};

const MedalRow = memo(({ row, index, displayName, showFlag }: { row: MedalStat; index: number; displayName: string; showFlag: boolean }) => (
  <tr className="hover:bg-slate-50/50 transition-colors duration-150">
    <td className="px-4 py-3 text-center font-medium text-slate-400">{index + 1}</td>
    <td className="px-4 py-3 font-medium text-slate-700">
      <div className="flex items-center gap-2">
        {showFlag && <CountryFlag noc={row.code} size="sm" />}
        <span className="truncate max-w-[120px]" title={displayName}>
          {displayName}
        </span>
      </div>
    </td>
    <td className="px-2 py-3 text-center font-bold text-yellow-600 bg-yellow-50/30">{row.gold}</td>
    <td className="px-2 py-3 text-center font-bold text-slate-600 bg-slate-50/30">{row.silver}</td>
    <td className="px-2 py-3 text-center font-bold text-amber-700 bg-amber-50/30">{row.bronze}</td>
    <td className="px-4 py-3 text-center font-bold text-slate-900">{row.total}</td>
  </tr>
));

MedalRow.displayName = 'MedalRow';

function MedalTable({ data, title, onExpand, isLoading = false }: MedalTableProps) {
  const { t, tCountry, tSport } = useLanguage();

  const translatedData = useMemo(() => {
    return data.map(row => {
      let displayName = row.name;
      const isCountry = isCountryCode(row.code);
      
      if (isCountry) {
        const translatedCountry = tCountry(row.code);
        if (translatedCountry) {
          displayName = `${translatedCountry} (${row.code})`;
        }
      } else {
        const translatedSport = tSport(row.code);
        if (translatedSport !== row.code) {
          displayName = translatedSport;
        }
      }
      return { ...row, displayName, isCountry };
    });
  }, [data, tCountry, tSport]);

  const shimmerClass = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

  const renderSkeletonRows = () => (
    <>
      {[...Array(8)].map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-4 py-3 text-center">
            <div className={`w-6 h-4 bg-slate-200 rounded mx-auto ${shimmerClass}`} />
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-4 bg-slate-200 rounded ${shimmerClass}`} />
              <div className={`w-24 h-4 bg-slate-200 rounded ${shimmerClass}`} style={{ animationDelay: `${i * 50}ms` }} />
            </div>
          </td>
          <td className="px-2 py-3 text-center bg-yellow-50/30">
            <div className={`w-6 h-4 bg-yellow-100 rounded mx-auto ${shimmerClass}`} />
          </td>
          <td className="px-2 py-3 text-center bg-slate-50/30">
            <div className={`w-6 h-4 bg-slate-100 rounded mx-auto ${shimmerClass}`} />
          </td>
          <td className="px-2 py-3 text-center bg-amber-50/30">
            <div className={`w-6 h-4 bg-amber-100 rounded mx-auto ${shimmerClass}`} />
          </td>
          <td className="px-4 py-3 text-center">
            <div className={`w-8 h-4 bg-slate-200 rounded mx-auto ${shimmerClass}`} />
          </td>
        </tr>
      ))}
    </>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full transition-all duration-300">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-slate-800 text-lg">{title}</h2>
          {isLoading && (
            <div className="w-4 h-4 border-2 border-olympic-blue border-t-transparent rounded-full animate-spin" />
          )}
        </div>
        {onExpand && (
          <button
            onClick={onExpand}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-all group flex items-center gap-1.5"
            title={t('expand') || 'Expandir'}
          >
            <Maximize2 className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            <span className="text-xs text-slate-400 group-hover:text-slate-600 hidden sm:inline">
              {t('expand') || 'Expandir'}
            </span>
          </button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 shadow-sm z-10">
            <tr>
              <th className="px-4 py-3 font-medium w-10 text-center">#</th>
              <th className="px-4 py-3 font-medium">{t('name_col')}</th>
              <th className="px-2 py-3 font-bold text-yellow-600 text-center" title={t('gold')}>🥇</th>
              <th className="px-2 py-3 font-bold text-slate-500 text-center" title={t('silver')}>🥈</th>
              <th className="px-2 py-3 font-bold text-amber-700 text-center" title={t('bronze')}>🥉</th>
              <th className="px-4 py-3 font-bold text-slate-800 text-center">{t('total_col')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              renderSkeletonRows()
            ) : translatedData.length > 0 ? (
              translatedData.map((row, index) => (
                <MedalRow
                  key={row.code}
                  row={row}
                  index={index}
                  displayName={row.displayName}
                  showFlag={row.isCountry}
                />
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400 italic">
                  {t('no_medals_found')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default memo(MedalTable);
