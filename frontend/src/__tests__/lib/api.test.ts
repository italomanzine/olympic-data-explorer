import {
  fetchFilters,
  fetchMapStats,
  fetchBiometrics,
  fetchEvolution,
  fetchMedalTable,
  fetchTopAthletes,
  searchAthletes,
  fetchAthleteProfile,
  fetchAthleteStats,
  FilterState,
} from '../../lib/api';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('API Module', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('fetchFilters', () => {
    it('should fetch filters successfully', async () => {
      const mockData = {
        years: [2000, 2004, 2008],
        sports: ['Swimming', 'Athletics'],
        countries: [{ code: 'USA', label: 'United States' }],
        year_season_map: { 2000: ['Summer'], 2004: ['Summer'] },
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await fetchFilters();
      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/api/filters');
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(fetchFilters()).rejects.toThrow('Failed to fetch filters');
    });
  });

  describe('fetchMapStats', () => {
    it('should fetch map stats with filters', async () => {
      const mockData = [{ id: 'USA', total: 100 }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const filters: FilterState = { year: 2016, season: 'Summer' };
      const result = await fetchMapStats(filters);
      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/stats/map?year=2016&season=Summer'
      );
    });

    it('should throw error on failure', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });
      await expect(fetchMapStats({})).rejects.toThrow('Failed to fetch map stats');
    });

    it('should skip Both season filter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      await fetchMapStats({ season: 'Both' });
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/api/stats/map?');
    });

    it('should skip Both sex filter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      await fetchMapStats({ sex: 'Both' });
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/api/stats/map?');
    });

    it('should skip All sport filter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      await fetchMapStats({ sport: 'All' });
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/api/stats/map?');
    });

    it('should skip All country filter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      await fetchMapStats({ country: 'All' });
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/api/stats/map?');
    });

    it('should skip Total medal_type filter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      await fetchMapStats({ medal_type: 'Total' });
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/api/stats/map?');
    });

    it('should include all filter params when set', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      await fetchMapStats({
        year: 2016,
        start_year: 2000,
        end_year: 2016,
        season: 'Summer',
        sex: 'M',
        sport: 'Swimming',
        country: 'USA',
        medal_type: 'Gold',
      });
      
      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('year=2016');
      expect(calledUrl).toContain('start_year=2000');
      expect(calledUrl).toContain('end_year=2016');
      expect(calledUrl).toContain('season=Summer');
      expect(calledUrl).toContain('sex=M');
      expect(calledUrl).toContain('sport=Swimming');
      expect(calledUrl).toContain('country=USA');
      expect(calledUrl).toContain('medal_type=Gold');
    });
  });

  describe('fetchBiometrics', () => {
    it('should fetch biometrics successfully', async () => {
      const mockData = [{ Name: 'Athlete1', Height: 180, Weight: 75 }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await fetchBiometrics({ year: 2016 });
      expect(result).toEqual(mockData);
    });

    it('should throw error on failure', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });
      await expect(fetchBiometrics({})).rejects.toThrow('Failed to fetch biometrics');
    });
  });

  describe('fetchEvolution', () => {
    it('should fetch evolution successfully', async () => {
      const mockData = [{ Year: 2016, USA: 100 }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await fetchEvolution({});
      expect(result).toEqual(mockData);
    });

    it('should append countries to params', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      await fetchEvolution({}, ['USA', 'BRA']);
      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('countries=USA');
      expect(calledUrl).toContain('countries=BRA');
    });

    it('should throw error on failure', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });
      await expect(fetchEvolution({})).rejects.toThrow('Failed to fetch evolution stats');
    });
  });

  describe('fetchMedalTable', () => {
    it('should fetch medal table successfully', async () => {
      const mockData = [{ name: 'USA', code: 'USA', gold: 50, silver: 30, bronze: 20, total: 100 }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await fetchMedalTable({});
      expect(result).toEqual(mockData);
    });

    it('should throw error on failure', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });
      await expect(fetchMedalTable({})).rejects.toThrow('Failed to fetch medal table');
    });
  });

  describe('fetchTopAthletes', () => {
    it('should fetch top athletes with default limit', async () => {
      const mockData = [{ id: 1, name: 'Michael Phelps', noc: 'USA', gold: 23, silver: 3, bronze: 2, total: 28 }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await fetchTopAthletes({});
      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/api/stats/top-athletes?limit=10');
    });

    it('should fetch top athletes with custom limit', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      await fetchTopAthletes({}, 20);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/api/stats/top-athletes?limit=20');
    });

    it('should throw error on failure', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });
      await expect(fetchTopAthletes({})).rejects.toThrow('Failed to fetch top athletes');
    });
  });

  describe('searchAthletes', () => {
    it('should return empty array for short query', async () => {
      const result = await searchAthletes('A');
      expect(result).toEqual([]);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should search athletes successfully', async () => {
      const mockData = [{ id: 1, name: 'Michael Phelps', noc: 'USA', sport: 'Swimming' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await searchAthletes('Michael');
      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/athletes/search?query=Michael&limit=20'
      );
    });

    it('should throw error on failure', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });
      await expect(searchAthletes('Michael')).rejects.toThrow('Failed to search athletes');
    });
  });

  describe('fetchAthleteProfile', () => {
    it('should fetch athlete profile successfully', async () => {
      const mockData = { id: 1, name: 'Michael Phelps', noc: 'USA' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await fetchAthleteProfile(1);
      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/api/athletes/1');
    });

    it('should throw error on failure', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });
      await expect(fetchAthleteProfile(1)).rejects.toThrow('Failed to fetch athlete profile');
    });
  });

  describe('fetchAthleteStats', () => {
    it('should fetch athlete stats successfully', async () => {
      const mockData = { evolution: [], biometrics: { height: 190 }, medals_by_sport: [] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await fetchAthleteStats(1);
      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/api/athletes/1/stats');
    });

    it('should throw error on failure', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });
      await expect(fetchAthleteStats(1)).rejects.toThrow('Failed to fetch athlete stats');
    });
  });
});
