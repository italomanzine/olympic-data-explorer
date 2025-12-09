"use client";

import React, { memo, useMemo } from 'react';
import { MedalStat } from "../lib/api";
import { useLanguage } from "../contexts/LanguageContext";

interface MedalTableProps {
  data: MedalStat[];
  title: string;
}

const MedalRow = memo(({ row, index, displayName }: { row: MedalStat; index: number; displayName: string }) => (
  <tr className="hover:bg-slate-50/50 transition-colors duration-150">
    <td className="px-4 py-3 text-center font-medium text-slate-400">{index + 1}</td>
    <td className="px-4 py-3 font-medium text-slate-700 truncate max-w-[150px]" title={displayName}>
      {displayName}
    </td>
    <td className="px-2 py-3 text-center font-bold text-yellow-600 bg-yellow-50/30">{row.gold}</td>
    <td className="px-2 py-3 text-center font-bold text-slate-600 bg-slate-50/30">{row.silver}</td>
    <td className="px-2 py-3 text-center font-bold text-amber-700 bg-amber-50/30">{row.bronze}</td>
    <td className="px-4 py-3 text-center font-bold text-slate-900">{row.total}</td>
  </tr>
));

MedalRow.displayName = 'MedalRow';

function MedalTable({ data, title }: MedalTableProps) {
  const { t, tCountry, tSport } = useLanguage();

  // Pré-calcular os nomes traduzidos
  const translatedData = useMemo(() => {
    return data.map(row => {
      let displayName = row.name;
      const translatedCountry = tCountry(row.code);
      if (translatedCountry) {
        displayName = `${translatedCountry} (${row.code})`;
      } else {
        const translatedSport = tSport(row.code);
        if (translatedSport !== row.code) {
          displayName = translatedSport;
        }
      }
      return { ...row, displayName };
    });
  }, [data, tCountry, tSport]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full transition-all duration-300">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h2 className="font-bold text-slate-800 text-lg">{title}</h2>
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
            {translatedData.length > 0 ? (
              translatedData.map((row, index) => (
                <MedalRow
                  key={row.code}
                  row={row}
                  index={index}
                  displayName={row.displayName}
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
