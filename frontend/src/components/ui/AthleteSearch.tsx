"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, User, X, Loader2 } from 'lucide-react';
import { searchAthletes, AthleteSearchResult } from '../../lib/api';
import { useLanguage } from '../../contexts/LanguageContext';

interface AthleteSearchProps {
  onSelect: (athlete: AthleteSearchResult | null) => void;
  selectedAthlete: AthleteSearchResult | null;
}

export default function AthleteSearch({ onSelect, selectedAthlete }: AthleteSearchProps) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AthleteSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const data = await searchAthletes(searchQuery);
      setResults(data);
    } catch (error) {
      console.error('Erro ao buscar atletas:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      handleSearch(query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, handleSearch]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (athlete: AthleteSearchResult) => {
    onSelect(athlete);
    setQuery('');
    setIsOpen(false);
    setResults([]);
  };

  const handleClear = () => {
    onSelect(null);
    setQuery('');
    setResults([]);
  };

  if (selectedAthlete) {
    return (
      <div className="relative">
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <User className="w-5 h-5 text-blue-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-blue-900 text-sm truncate">{selectedAthlete.name}</p>
            <p className="text-[10px] text-blue-600">{selectedAthlete.noc} • {selectedAthlete.sport}</p>
          </div>
          <button
            onClick={handleClear}
            className="p-1 hover:bg-blue-100 rounded-full transition-colors"
            title={t('clear_athlete')}
          >
            <X className="w-4 h-4 text-blue-600" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={t('search_athlete')}
          className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-64 overflow-y-auto">
          {results.map((athlete) => (
            <button
              key={athlete.id}
              onClick={() => handleSelect(athlete)}
              className="w-full px-3 py-2 text-left hover:bg-slate-50 transition-colors flex items-center gap-3 border-b border-slate-100 last:border-b-0"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 text-sm truncate">{athlete.name}</p>
                <p className="text-[10px] text-slate-500">{athlete.noc} • {athlete.sport}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl p-4 text-center">
          <p className="text-sm text-slate-500">{t('no_athletes_found')}</p>
        </div>
      )}
    </div>
  );
}
