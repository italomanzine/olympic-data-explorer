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
