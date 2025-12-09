const API_BASE_URL = "http://localhost:8000/api";

export interface FilterState {
  year?: number;
  start_year?: number;
  end_year?: number;
  season?: string; 
  sex?: string;    
  sport?: string;
  country?: string; 
}

function buildParams(filters: FilterState) {
  const params = new URLSearchParams();
  if (filters.year) params.append("year", filters.year.toString());
  if (filters.start_year) params.append("start_year", filters.start_year.toString());
  if (filters.end_year) params.append("end_year", filters.end_year.toString());
  if (filters.season && filters.season !== "Both") params.append("season", filters.season);
  if (filters.sex && filters.sex !== "Both") params.append("sex", filters.sex);
  if (filters.sport && filters.sport !== "All") params.append("sport", filters.sport);
  if (filters.country && filters.country !== "All") params.append("country", filters.country);
  return params;
}

export interface FilterResponse {
  years: number[];
  sports: string[];
  countries: { code: string; label: string }[];
  year_season_map: Record<number, string[]>;
}

export interface MedalStat {
  name: string;
  code: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
}

export async function fetchFilters(): Promise<FilterResponse> {
  const res = await fetch(`${API_BASE_URL}/filters`);
  if (!res.ok) throw new Error("Failed to fetch filters");
  return res.json();
}

export async function fetchMapStats(filters: FilterState) {
  const params = buildParams(filters);
  const res = await fetch(`${API_BASE_URL}/stats/map?${params}`);
  if (!res.ok) throw new Error("Failed to fetch map stats");
  return res.json();
}

export async function fetchBiometrics(filters: FilterState) {
  const params = buildParams(filters);
  const res = await fetch(`${API_BASE_URL}/stats/biometrics?${params}`);
  if (!res.ok) throw new Error("Failed to fetch biometrics");
  return res.json();
}

export async function fetchEvolution(filters: FilterState, countries?: string[]) {
  const params = buildParams(filters);
  if (countries) {
    countries.forEach(c => params.append("countries", c));
  }

  const res = await fetch(`${API_BASE_URL}/stats/evolution?${params}`);
  if (!res.ok) throw new Error("Failed to fetch evolution stats");
  return res.json();
}

export async function fetchMedalTable(filters: FilterState): Promise<MedalStat[]> {
  const params = buildParams(filters);
  const res = await fetch(`${API_BASE_URL}/stats/medals?${params}`);
  if (!res.ok) throw new Error("Failed to fetch medal table");
  return res.json();
}

// ===== Athlete Search & Profile =====

export interface AthleteSearchResult {
  id: number;
  name: string;
  noc: string;
  sport: string;
}

export interface AthleteProfile {
  id: number;
  name: string;
  sex: string;
  noc: string;
  team: string;
  height: number | null;
  weight: number | null;
  age_range: { min: number | null; max: number | null };
  sports: string[];
  years: number[];
  medals: {
    gold: number;
    silver: number;
    bronze: number;
    total: number;
  };
  participations: {
    year: number;
    season: string;
    city: string | null;
    sport: string;
    event: string;
    medal: string | null;
  }[];
}

export interface AthleteStats {
  evolution: {
    Year: number;
    Gold: number;
    Silver: number;
    Bronze: number;
    Total: number;
    Events: number;
  }[];
  biometrics: {
    height: number | null;
    weight: number | null;
    sex: string;
  };
  medals_by_sport: MedalStat[];
}

export async function searchAthletes(query: string): Promise<AthleteSearchResult[]> {
  if (query.length < 2) return [];
  const res = await fetch(`${API_BASE_URL}/athletes/search?query=${encodeURIComponent(query)}&limit=20`);
  if (!res.ok) throw new Error("Failed to search athletes");
  return res.json();
}

export async function fetchAthleteProfile(athleteId: number): Promise<AthleteProfile> {
  const res = await fetch(`${API_BASE_URL}/athletes/${athleteId}`);
  if (!res.ok) throw new Error("Failed to fetch athlete profile");
  return res.json();
}

export async function fetchAthleteStats(athleteId: number): Promise<AthleteStats> {
  const res = await fetch(`${API_BASE_URL}/athletes/${athleteId}/stats`);
  if (!res.ok) throw new Error("Failed to fetch athlete stats");
  return res.json();
}
