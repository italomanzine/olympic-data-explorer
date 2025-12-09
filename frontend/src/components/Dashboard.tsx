"use client";

import React, { useEffect, useState, useRef, useMemo, useTransition } from "react";
import { fetchFilters, fetchMapStats, fetchBiometrics, fetchEvolution, fetchMedalTable, FilterState, MedalStat, AthleteSearchResult, AthleteProfile, AthleteStats, fetchAthleteProfile, fetchAthleteStats } from "../lib/api";
import WorldMap from "./charts/WorldMap";
import BiometricsChart from "./charts/BiometricsChart";
import EvolutionChart from "./charts/EvolutionChart";
import MedalTable from "./MedalTable"; 
import RangeSlider from "./ui/RangeSlider";
import SearchableSelect from "./ui/SearchableSelect";
import LanguageSelector from "./ui/LanguageSelector";
import AthleteSearch from "./ui/AthleteSearch";
import AthleteProfileCard from "./AthleteProfileCard";
import { useLanguage } from "../contexts/LanguageContext";
import { Loader2, AlertCircle, Play, Pause, Menu, Settings2, Globe, User, ChevronUp, ChevronDown } from "lucide-react";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

// Cache simples para evitar re-fetches desnecessários
const dataCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30000; // 30 segundos

function getCacheKey(filters: FilterState): string {
  return JSON.stringify(filters);
}

function getCachedData(key: string) {
  const cached = dataCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCachedData(key: string, data: any) {
  dataCache.set(key, { data, timestamp: Date.now() });
}

export default function Dashboard() {
  const { t, tSport, tCountry } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const [allYears, setAllYears] = useState<number[]>([]);
  const [availableSports, setAvailableSports] = useState<string[]>([]);
  const [availableCountries, setAvailableCountries] = useState<{ code: string, label: string }[]>([]);
  const [yearSeasonMap, setYearSeasonMap] = useState<Record<number, string[]>>({});
  
  const [filters, setFilters] = useState<FilterState>({
    season: "Both",
    sex: "Both",
    sport: "All",
    country: "All", 
    year: 2016
  });

  // Debounce reduzido para 150ms - mais responsivo
  const debouncedFilters = useDebounce(filters, 150);

  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(2000); // Velocidade da animação em ms
  const [timelineExpanded, setTimelineExpanded] = useState(true); // Estado para expandir/recolher timeline
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingRef = useRef(false); // Referência para evitar avançar durante carregamento

  // Estados para busca de atleta
  const [selectedAthlete, setSelectedAthlete] = useState<AthleteSearchResult | null>(null);
  const [athleteProfile, setAthleteProfile] = useState<AthleteProfile | null>(null);
  const [athleteStats, setAthleteStats] = useState<AthleteStats | null>(null);

  const [mapData, setMapData] = useState([]);
  const [biometricsData, setBiometricsData] = useState([]);
  const [evolutionData, setEvolutionData] = useState([]);
  const [medalTableData, setMedalTableData] = useState<MedalStat[]>([]); 
  const [error, setError] = useState<string | null>(null);

  // Carregar dados do atleta quando selecionado
  useEffect(() => {
    if (selectedAthlete) {
      setLoading(true);
      Promise.all([
        fetchAthleteProfile(selectedAthlete.id),
        fetchAthleteStats(selectedAthlete.id)
      ]).then(([profile, stats]) => {
        setAthleteProfile(profile);
        setAthleteStats(stats);
        setLoading(false);
      }).catch(err => {
        console.error('Erro ao carregar atleta:', err);
        setError('Erro ao carregar dados do atleta');
        setLoading(false);
      });
    } else {
      setAthleteProfile(null);
      setAthleteStats(null);
    }
  }, [selectedAthlete]);

  useEffect(() => {
    async function init() {
      try {
        const data = await fetchFilters();
        setAllYears(data.years || []);
        setAvailableSports(data.sports || []);
        setAvailableCountries(data.countries || []);
        setYearSeasonMap(data.year_season_map || {});
        
        if (data.years && data.years.length > 0) {
           const lastYear = data.years[data.years.length - 1];
           setFilters(prev => ({ ...prev, year: lastYear }));
        }
      } catch (e) {
        console.error(e);
        setError("Falha ao conectar com o backend.");
      }
    }
    init();
  }, []);

  const filteredYears = useMemo(() => {
    if (filters.season === "Both") return allYears;
    return allYears.filter(year => {
      const seasons = yearSeasonMap[year];
      return seasons && seasons.includes(filters.season!);
    });
  }, [allYears, filters.season, yearSeasonMap]);

  useEffect(() => {
    if (filteredYears.length > 0 && filters.year && !filteredYears.includes(filters.year)) {
      const closest = filteredYears.reduce((prev, curr) => 
        Math.abs(curr - filters.year!) < Math.abs(prev - filters.year!) ? curr : prev
      );
      setFilters(prev => ({ ...prev, year: closest }));
    }
  }, [filteredYears]);

  useEffect(() => {
    if (!debouncedFilters.year) return;

    const cacheKey = getCacheKey(debouncedFilters);
    const cached = getCachedData(cacheKey);
    
    if (cached) {
      // Usar dados do cache instantaneamente
      startTransition(() => {
        setMapData(cached.map);
        setBiometricsData(cached.bio);
        setEvolutionData(cached.evo);
        setMedalTableData(cached.table);
      });
      setLoading(false);
      return;
    }

    async function loadData() {
      setLoading(true);
      isLoadingRef.current = true;
      try {
        const [mapRes, bioRes, evoRes, tableRes] = await Promise.all([
          fetchMapStats(debouncedFilters),
          fetchBiometrics(debouncedFilters),
          fetchEvolution(debouncedFilters),
          fetchMedalTable(debouncedFilters) 
        ]);
        
        // Cache os resultados
        setCachedData(cacheKey, { map: mapRes, bio: bioRes, evo: evoRes, table: tableRes });
        
        // Prefetch do próximo ano durante animação
        if (isPlaying) {
          const currentIndex = filteredYears.indexOf(debouncedFilters.year || 2016);
          const nextIndex = currentIndex + 1;
          if (nextIndex < filteredYears.length) {
            const nextYear = filteredYears[nextIndex];
            const nextFilters = { ...debouncedFilters, year: nextYear };
            const nextCacheKey = getCacheKey(nextFilters);
            if (!getCachedData(nextCacheKey)) {
              // Prefetch silencioso do próximo ano
              Promise.all([
                fetchMapStats(nextFilters),
                fetchBiometrics(nextFilters),
                fetchEvolution(nextFilters),
                fetchMedalTable(nextFilters)
              ]).then(([mapR, bioR, evoR, tableR]) => {
                setCachedData(nextCacheKey, { map: mapR, bio: bioR, evo: evoR, table: tableR });
              }).catch(() => {}); // Silencioso
            }
          }
        }
        
        // Usar startTransition para não bloquear a UI
        startTransition(() => {
          setMapData(mapRes);
          setBiometricsData(bioRes);
          setEvolutionData(evoRes);
          setMedalTableData(tableRes);
        });
        setError(null);
      } catch (e) {
        console.error(e);
        if (!isPlaying) setError("Erro ao carregar dados.");
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
      }
    }
    
    loadData();
  }, [debouncedFilters, isPlaying, filteredYears]);

  useEffect(() => {
    if (isPlaying) {
      const advanceYear = () => {
        // Só avança se não estiver carregando
        if (isLoadingRef.current) {
          return;
        }
        
        setFilters(prev => {
          const currentIndex = filteredYears.indexOf(prev.year || 2016);
          const nextIndex = currentIndex + 1;
          
          if (nextIndex >= filteredYears.length) {
            setIsPlaying(false);
            return prev;
          }
          
          return { ...prev, year: filteredYears[nextIndex] };
        });
      };
      
      playIntervalRef.current = setInterval(advanceYear, playSpeed);
    } else {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, filteredYears, playSpeed]);

  const getYearLabel = (year: number) => {
    const seasons = yearSeasonMap[year];
    if (!seasons) return `${year}`;
    if (filters.season !== "Both") {
        return `${year} (${t('season_label') || (filters.season === "Summer" ? t('summer') : t('winter'))})`;
    }
    const ptSeasons = seasons.map(s => s === "Summer" ? t('summer') : t('winter'));
    return `${year} (${ptSeasons.join(" / ")})`;
  };
  
  const getCountryLabel = (code: string, originalLabel: string) => {
    if (code === "All") return t('all_countries');
    const translatedName = tCountry(code);
    // Se tiver tradução, formata como "Nome Traduzido (CODE)".
    // Se não, usa o label original que vem do backend "Original Name (CODE)"
    if (translatedName) {
        return `${translatedName} (${code})`;
    }
    return originalLabel;
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:translate-x-0 shadow-2xl lg:shadow-none flex flex-col`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 shrink-0">
          <div className="flex gap-1 items-center">
             <div className="flex gap-0.5">
                <span className="w-2 h-2 rounded-full bg-olympic-blue"></span>
                <span className="w-2 h-2 rounded-full bg-olympic-yellow"></span>
                <span className="w-2 h-2 rounded-full bg-olympic-black"></span>
             </div>
             <span className="font-bold text-lg tracking-tight ml-2">Olympic Data</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Temporada */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">{t('season')}</label>
            <div className="flex bg-slate-100 p-1 rounded-lg shadow-inner">
              {["Summer", "Winter", "Both"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilters(prev => ({ ...prev, season: s }))}
                  className={`flex-1 py-2 text-xs font-bold uppercase rounded-md transition-all ${
                    filters.season === s 
                      ? "bg-white text-olympic-blue shadow-sm scale-105" 
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {s === "Both" ? t('both') : s === "Summer" ? t('summer') : t('winter')}
                </button>
              ))}
            </div>
          </div>

          {/* Gênero */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">{t('gender')}</label>
            <div className="space-y-3">
              {[
                { id: "Both", label: t('all') },
                { id: "M", label: t('male') },
                { id: "F", label: t('female') }
              ].map((g) => (
                <label key={g.id} className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                    filters.sex === g.id ? "border-slate-700 bg-white" : "border-slate-300 bg-slate-50"
                  }`}>
                    {filters.sex === g.id && <div className="w-3 h-3 rounded-full bg-slate-700 shadow-sm" />}
                  </div>
                  <span className={`text-sm font-medium ${filters.sex === g.id ? "text-slate-800" : "text-slate-500"}`}>
                    {g.label}
                  </span>
                  <input 
                    type="radio" 
                    name="sex" 
                    className="hidden" 
                    checked={filters.sex === g.id} 
                    onChange={() => setFilters(prev => ({ ...prev, sex: g.id }))} 
                  />
                </label>
              ))}
            </div>
          </div>

          {/* País (NOC) */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">{t('country')}</label>
            <SearchableSelect 
              options={availableCountries.map(c => ({ 
                  value: c.code, 
                  label: getCountryLabel(c.code, c.label)
              }))}
              value={filters.country || "All"}
              onChange={(val) => setFilters(prev => ({ ...prev, country: val }))}
              placeholder={t('select_country')}
              icon={<Globe className="w-4 h-4" />}
            />
             <p className="text-[10px] text-slate-400 mt-1 px-1">{t('affects_charts')}</p>
          </div>

          {/* Modalidade */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">{t('sport')}</label>
            <SearchableSelect
              options={availableSports.map(s => ({ 
                value: s, 
                label: s === "All" ? t('all_sports') : tSport(s) // Tradução do esporte
              }))}
              value={filters.sport || "All"}
              onChange={(val) => setFilters(prev => ({ ...prev, sport: val }))}
              placeholder={t('select_sport')}
              icon={<Settings2 className="w-4 h-4" />}
            />
          </div>

          {/* Buscar Atleta */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">
              <User className="w-3 h-3 inline mr-1" />
              {t('athlete')}
            </label>
            <AthleteSearch 
              onSelect={(athlete) => setSelectedAthlete(athlete)}
              selectedAthlete={selectedAthlete}
            />
            {selectedAthlete && (
              <p className="text-[10px] text-olympic-gold mt-1 px-1">
                ✨ {t('athlete_profile')} ativo
              </p>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-4">
           {/* Language Switcher (Agora no footer) */}
           <div className="flex justify-between items-center w-full">
             <div className="text-xs text-slate-400 font-medium">{t('status')}</div>
             <LanguageSelector />
           </div>
           <div className="flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></span>
              <span className="text-sm text-slate-600">{loading ? t('loading') : t('online')}</span>
           </div>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen relative bg-slate-50/50">
        <header className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 z-40">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-slate-600">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-slate-800">Olympic Data</span>
          <div className="w-8"></div>
        </header>

        {/* Main Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-40 md:pb-32 scroll-smooth">
          
          {error && (
            <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <div className="max-w-[1800px] mx-auto flex flex-col gap-6 h-full min-h-[800px]">
            
            <div className="flex flex-col xl:flex-row gap-6 h-full">
              
              {/* Coluna Esquerda (Gráficos) - Flex Grow */}
              <div className="flex-3 flex flex-col gap-6 min-w-0">
                
                {/* Mapa */}
                <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-[450px] flex flex-col transition-all hover:shadow-md shrink-0">
                  <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
                    <h2 className="font-bold text-slate-800 text-lg">{t('map_title')}</h2>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {filters.season === 'Both' ? t('both') : filters.season === 'Summer' ? t('summer') : t('winter')}
                    </span>
                  </div>
                  <div className="flex-1 relative">
                    <div className="absolute inset-0 p-4">
                       <WorldMap data={mapData} />
                    </div>
                  </div>
                </section>

                {/* Grid Inferior */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
                   
                   {/* Biometria */}
                   <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col transition-all hover:shadow-md h-full">
                    <div className="px-6 py-4 border-b border-slate-100 shrink-0">
                      <h2 className="font-bold text-slate-800 truncate">
                         {t('biometrics_title')} {filters.sport === "All" ? t('biometrics_general') : tSport(filters.sport || '')}
                      </h2>
                    </div>
                    <div className="flex-1 p-4 min-h-0 h-full">
                      <BiometricsChart data={biometricsData} />
                    </div>
                  </section>

                  {/* Evolução */}
                  <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col transition-all hover:shadow-md h-full">
                    <div className="px-6 py-4 border-b border-slate-100 shrink-0">
                      <h2 className="font-bold text-slate-800 truncate">
                        {filters.country !== "All" 
                            ? `${t('evolution_country')} ${getCountryLabel(filters.country!, availableCountries.find(c => c.code === filters.country)?.label || '')}` 
                            : t('evolution_title')}
                      </h2>
                    </div>
                    <div className="flex-1 p-4 min-h-0 h-full">
                      <EvolutionChart data={evolutionData} />
                    </div>
                  </section>
                </div>

              </div>

              {/* Coluna Direita (Quadro de Medalhas / Perfil do Atleta) */}
              <div className="flex-1 xl:max-w-[400px] flex flex-col gap-6">
                 {/* Perfil do Atleta - aparece quando selecionado */}
                 {selectedAthlete && athleteProfile && (
                   <div className="sticky top-6">
                     <AthleteProfileCard 
                       profile={athleteProfile}
                       onClose={() => setSelectedAthlete(null)}
                     />
                   </div>
                 )}
                 
                 {/* Quadro de Medalhas - sempre aparece, mas fica abaixo do perfil se houver atleta */}
                 <div className={selectedAthlete ? '' : 'sticky top-6 h-full'}>
                    <MedalTable 
                        data={medalTableData} 
                        title={filters.country !== "All" ? t('medal_table_sport') : t('medal_table_title')} 
                    />
                 </div>
              </div>

            </div>
          </div>
        </div>

        {/* Timeline Bar */}
        <div className={`fixed bottom-0 left-0 lg:left-72 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] z-30 transition-all duration-300 ${timelineExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-32px)]'}`}>
          {/* Toggle Button */}
          <button
            onClick={() => setTimelineExpanded(!timelineExpanded)}
            className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-6 bg-white border border-slate-200 border-b-0 rounded-t-md flex items-center justify-center hover:bg-slate-50 transition-colors z-10"
            title={timelineExpanded ? 'Recolher timeline' : 'Expandir timeline'}
          >
            {timelineExpanded ? (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Timeline Content */}
          <div className="p-4">
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              {/* Play/Pause + Info */}
              <div className="flex items-center gap-4 shrink-0">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={loading && isPlaying}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 disabled:opacity-50 shrink-0 ${
                    isPlaying 
                      ? "bg-amber-400 text-white hover:bg-amber-500 ring-4 ring-amber-100" 
                      : "bg-slate-800 text-white hover:bg-slate-700 ring-4 ring-slate-100"
                  }`}
                >
                  {loading && isPlaying ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="fill-current w-5 h-5" />
                  ) : (
                    <Play className="fill-current w-5 h-5 ml-1" />
                  )}
                </button>
                
                <div className="flex flex-col min-w-[120px]">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('edition')}</span>
                   <span className="text-lg font-bold text-slate-800 leading-none whitespace-nowrap">
                      {getYearLabel(filters.year || 2016)}
                   </span>
                </div>
              </div>

              {/* Controle de velocidade */}
              <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-slate-200 shrink-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vel:</span>
                <div className="flex gap-1">
                  {[
                    { label: '0.5x', value: 4000 },
                    { label: '1x', value: 2000 },
                    { label: '2x', value: 1000 },
                  ].map(speed => (
                    <button
                      key={speed.value}
                      onClick={() => setPlaySpeed(speed.value)}
                      className={`px-2 py-1 text-xs font-medium rounded transition-all ${
                        playSpeed === speed.value
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {speed.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider */}
              <div className="flex-1 w-full min-w-0">
                 <RangeSlider 
                   min={filteredYears[0] || 1896} 
                   max={filteredYears[filteredYears.length - 1] || 2016} 
                   value={filters.year || 2016}
                   onChange={(val) => {
                     const closest = filteredYears.reduce((prev, curr) => 
                       Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev
                     , filteredYears[0]);
                     setFilters(prev => ({ ...prev, year: closest }));
                   }}
                 />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
