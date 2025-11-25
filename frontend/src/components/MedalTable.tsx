"use client";

import React from 'react';
import { MedalStat } from "../lib/api";
import { useLanguage } from "../contexts/LanguageContext";

interface MedalTableProps {
  data: MedalStat[];
  title: string;
}

export default function MedalTable({ data, title }: MedalTableProps) {
  const { t, tCountry, tSport } = useLanguage();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
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
            {data.length > 0 ? (
              data.map((row, index) => {
                // row.code pode ser um código NOC (USA) ou um nome de Esporte (Swimming) dependendo do contexto
                // Vamos tentar traduzir ambos.
                // Se for NOC, tCountry resolve. Se for Sport, tSport resolve.
                
                let displayName = row.name;
                // Verifica se row.code parece um NOC (3 letras maiusculas) ou se é um nome de esporte
                // Mas o row.name já vem do backend como "Nome (CODE)" ou "Esporte".
                
                // Se row.code existir na lista de países, traduz como país
                const translatedCountry = tCountry(row.code);
                if (translatedCountry) {
                    displayName = `${translatedCountry} (${row.code})`;
                } else {
                    // Tenta traduzir como esporte (row.code aqui é o nome do esporte em inglês pois usamos como chave no backend)
                    const translatedSport = tSport(row.code);
                    if (translatedSport !== row.code) {
                        displayName = translatedSport;
                    }
                }

                return (
                <tr key={row.code} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-center font-medium text-slate-400">{index + 1}</td>
                  <td className="px-4 py-3 font-medium text-slate-700 truncate max-w-[150px]" title={displayName}>
                    {displayName}
                  </td>
                  <td className="px-2 py-3 text-center font-bold text-yellow-600 bg-yellow-50/30">{row.gold}</td>
                  <td className="px-2 py-3 text-center font-bold text-slate-600 bg-slate-50/30">{row.silver}</td>
                  <td className="px-2 py-3 text-center font-bold text-amber-700 bg-amber-50/30">{row.bronze}</td>
                  <td className="px-4 py-3 text-center font-bold text-slate-900">{row.total}</td>
                </tr>
              )})
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
