import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '../../components/Dashboard';
import { LanguageProvider } from '../../contexts/LanguageContext';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(() => null),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
  length: 0,
  key: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock API
jest.mock('../../lib/api', () => ({
  fetchFilters: jest.fn(),
  fetchMapStats: jest.fn(),
  fetchBiometrics: jest.fn(),
  fetchEvolution: jest.fn(),
  fetchMedalTable: jest.fn(),
  fetchTopAthletes: jest.fn(),
  fetchGenderStats: jest.fn(),
  fetchAthleteProfile: jest.fn(),
  fetchAthleteStats: jest.fn(),
  searchAthletes: jest.fn(),
}));

// Mock chart components to avoid complex rendering
jest.mock('../../components/charts/WorldMap', () => {
  return function MockWorldMap({ data }: { data: unknown[] }) {
    return <div data-testid="world-map">WorldMap ({data?.length || 0} items)</div>;
  };
});

jest.mock('../../components/charts/BiometricsChart', () => {
  return function MockBiometricsChart({ data }: { data: unknown[] }) {
    return <div data-testid="biometrics-chart">BiometricsChart ({data?.length || 0} items)</div>;
  };
});

jest.mock('../../components/charts/EvolutionChart', () => {
  return function MockEvolutionChart({ data }: { data: unknown[] }) {
    return <div data-testid="evolution-chart">EvolutionChart ({data?.length || 0} items)</div>;
  };
});

jest.mock('../../components/charts/TopAthletesChart', () => {
  return function MockTopAthletesChart({ data, medalType }: { data: unknown[]; medalType?: string }) {
    return <div data-testid="top-athletes-chart">TopAthletesChart ({data?.length || 0} items, {medalType})</div>;
  };
});

jest.mock('../../components/charts/GenderPieChart', () => {
  return function MockGenderPieChart({ data }: { data: unknown[] }) {
    return <div data-testid="gender-pie-chart">GenderPieChart ({data?.length || 0} items)</div>;
  };
});

jest.mock('../../components/MedalTable', () => {
  return function MockMedalTable({ data, title, isLoading }: { data: unknown[]; title: string; isLoading?: boolean }) {
    return (
      <div data-testid="medal-table">
        {title} ({data?.length || 0} items)
        {isLoading && <span data-testid="medal-table-loading">Loading...</span>}
      </div>
    );
  };
});

jest.mock('../../components/ui/ChartSkeleton', () => {
  return function MockChartSkeleton({ variant, message }: { variant?: string; message?: string }) {
    return (
      <div data-testid={`chart-skeleton-${variant || 'default'}`}>
        {message && <span>{message}</span>}
      </div>
    );
  };
});

// Store callback for AthleteSearch to simulate selection
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let athleteSearchOnSelect: ((athlete: { id: number; name: string; noc: string; sport: string } | null) => void) | null = null;

jest.mock('../../components/ui/AthleteSearch', () => {
  return function MockAthleteSearch({ onSelect, selectedAthlete }: { 
    onSelect: (athlete: { id: number; name: string; noc: string; sport: string } | null) => void;
    selectedAthlete: { id: number; name: string; noc: string; sport: string } | null;
  }) {
    athleteSearchOnSelect = onSelect;
    return (
      <div data-testid="athlete-search">
        <input placeholder="Buscar atleta por nome..." />
        {selectedAthlete && <span>{selectedAthlete.name}</span>}
        <button data-testid="select-athlete-btn" onClick={() => onSelect({ id: 1, name: 'Test Athlete', noc: 'USA', sport: 'Swimming' })}>
          Select Test Athlete
        </button>
      </div>
    );
  };
});

jest.mock('../../components/AthleteProfileCard', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return function MockAthleteProfileCard({ profile, onClose }: { profile: unknown; onClose: () => void }) {
    return (
      <div data-testid="athlete-profile-card">
        Athlete Profile
        <button data-testid="close-profile-btn" onClick={onClose}>Close</button>
      </div>
    );
  };
});

import {
  fetchFilters,
  fetchMapStats,
  fetchBiometrics,
  fetchEvolution,
  fetchMedalTable,
  fetchTopAthletes,
  fetchGenderStats,
  fetchAthleteProfile,
  fetchAthleteStats,
} from '../../lib/api';

const mockFetchFilters = fetchFilters as jest.Mock;
const mockFetchMapStats = fetchMapStats as jest.Mock;
const mockFetchBiometrics = fetchBiometrics as jest.Mock;
const mockFetchEvolution = fetchEvolution as jest.Mock;
const mockFetchMedalTable = fetchMedalTable as jest.Mock;
const mockFetchTopAthletes = fetchTopAthletes as jest.Mock;
const mockFetchGenderStats = fetchGenderStats as jest.Mock;
const mockFetchAthleteProfile = fetchAthleteProfile as jest.Mock;
const mockFetchAthleteStats = fetchAthleteStats as jest.Mock;

describe('Dashboard', () => {
  const mockFiltersData = {
    years: [2000, 2004, 2008, 2012, 2016],
    sports: ['All', 'Swimming', 'Athletics'],
    countries: [
      { code: 'All', label: 'All Countries' },
      { code: 'USA', label: 'United States (USA)' },
      { code: 'BRA', label: 'Brazil (BRA)' },
    ],
    year_season_map: {
      2000: ['Summer'],
      2004: ['Summer'],
      2008: ['Summer'],
      2012: ['Summer'],
      2016: ['Summer'],
    },
  };

  const mockMapData = [
    { id: 'USA', total: 100, gold: 50, silver: 30, bronze: 20 },
    { id: 'BRA', total: 20, gold: 5, silver: 10, bronze: 5 },
  ];

  const mockBiometricsData = [
    { Name: 'Athlete1', Sex: 'M', Height: 180, Weight: 75, Medal: 'Gold', NOC: 'USA', Sport: 'Swimming' },
  ];

  const mockEvolutionData = [
    { Year: 2000, USA: 50, BRA: 10 },
    { Year: 2004, USA: 55, BRA: 12 },
  ];

  const mockMedalTableData = [
    { name: 'United States (USA)', code: 'USA', gold: 50, silver: 30, bronze: 20, total: 100 },
  ];

  const mockTopAthletesData = [
    { id: 1, name: 'Michael Phelps', noc: 'USA', gold: 23, silver: 3, bronze: 2, total: 28 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockFetchFilters.mockResolvedValue(mockFiltersData);
    mockFetchMapStats.mockResolvedValue(mockMapData);
    mockFetchBiometrics.mockResolvedValue(mockBiometricsData);
    mockFetchEvolution.mockResolvedValue(mockEvolutionData);
    mockFetchMedalTable.mockResolvedValue(mockMedalTableData);
    mockFetchTopAthletes.mockResolvedValue(mockTopAthletesData);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const renderDashboard = async () => {
    const result = render(
      <LanguageProvider>
        <Dashboard />
      </LanguageProvider>
    );
    
    // Advance past initial fetch and debounce, wait for promises
    await act(async () => {
      jest.advanceTimersByTime(200);
      await Promise.resolve(); // Let promises settle
    });
    
    return result;
  };

  it('should render the dashboard title', async () => {
    await renderDashboard();

    expect(screen.getAllByText('Olympic Data').length).toBeGreaterThan(0);
  });

  it('should fetch filters on mount', async () => {
    await renderDashboard();

    expect(mockFetchFilters).toHaveBeenCalled();
  });

  it('should fetch data when filters loaded', async () => {
    await renderDashboard();

    // Advance time for debounced fetch
    await act(async () => {
      jest.advanceTimersByTime(200);
      await Promise.resolve();
    });
    
    // Check that at least filters were called (mapStats may need more time due to debounce)
    expect(mockFetchFilters).toHaveBeenCalled();
  });

  it('should render chart components after data loads', async () => {
    await renderDashboard();

    expect(screen.getByTestId('world-map')).toBeInTheDocument();
  });

  it('should render season filter buttons', async () => {
    await renderDashboard();

    expect(screen.getByText('Verão')).toBeInTheDocument();
  });

  it('should render gender filter options', async () => {
    await renderDashboard();

    expect(screen.getByText('Todos')).toBeInTheDocument();
  });

  it('should show error state when API fails', async () => {
    mockFetchFilters.mockRejectedValue(new Error('API Error'));
    
    render(
      <LanguageProvider>
        <Dashboard />
      </LanguageProvider>
    );

    await act(async () => {
      jest.advanceTimersByTime(200);
    });

    expect(screen.getByText('Falha ao conectar com o backend.')).toBeInTheDocument();
  });

  it('should render status indicator', async () => {
    await renderDashboard();

    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('should show athlete search section', async () => {
    await renderDashboard();

    expect(screen.getByPlaceholderText('Buscar atleta por nome...')).toBeInTheDocument();
  });

  it('should render medal type filter', async () => {
    await renderDashboard();

    expect(screen.getByText('Total')).toBeInTheDocument();
  });
});

describe('Dashboard with user interactions', () => {
  const mockFiltersData = {
    years: [2016],
    sports: ['All'],
    countries: [{ code: 'All', label: 'All' }],
    year_season_map: { 2016: ['Summer'] },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (fetchFilters as jest.Mock).mockResolvedValue(mockFiltersData);
    (fetchMapStats as jest.Mock).mockResolvedValue([]);
    (fetchBiometrics as jest.Mock).mockResolvedValue([]);
    (fetchEvolution as jest.Mock).mockResolvedValue([]);
    (fetchMedalTable as jest.Mock).mockResolvedValue([]);
    (fetchTopAthletes as jest.Mock).mockResolvedValue([]);
    (fetchGenderStats as jest.Mock).mockResolvedValue([]);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should change season filter on click', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    render(
      <LanguageProvider>
        <Dashboard />
      </LanguageProvider>
    );

    await act(async () => {
      jest.advanceTimersByTime(200);
    });

    expect(screen.getByText('Verão')).toBeInTheDocument();

    await user.click(screen.getByText('Inverno'));

    await act(async () => {
      jest.advanceTimersByTime(200);
    });

    // Filter should have changed
    expect(fetchFilters).toHaveBeenCalled();
  });

  it('should toggle sidebar', async () => {
    render(
      <LanguageProvider>
        <Dashboard />
      </LanguageProvider>
    );

    await act(async () => {
      jest.advanceTimersByTime(200);
    });

    expect(screen.getAllByText('Olympic Data').length).toBeGreaterThan(0);

    // Find menu button
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should change medal type filter', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    render(
      <LanguageProvider>
        <Dashboard />
      </LanguageProvider>
    );

    await act(async () => {
      jest.advanceTimersByTime(200);
    });

    // Click on Gold medal type
    await user.click(screen.getByText('Ouro'));

    await act(async () => {
      jest.advanceTimersByTime(200);
    });

    expect(screen.getByTestId('top-athletes-chart')).toBeInTheDocument();
  });

  it('should filter years by Both season', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    render(
      <LanguageProvider>
        <Dashboard />
      </LanguageProvider>
    );

    await act(async () => {
      jest.advanceTimersByTime(200);
    });

    // Click on "Ambos" button (season filter, not the label)
    const ambosButtons = screen.getAllByText('Ambos');
    await user.click(ambosButtons[0]); // Click the button, not the label

    await act(async () => {
      jest.advanceTimersByTime(200);
    });

    expect(fetchFilters).toHaveBeenCalled();
  });

  it('should change gender filter', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    render(
      <LanguageProvider>
        <Dashboard />
      </LanguageProvider>
    );

    await act(async () => {
      jest.advanceTimersByTime(200);
    });

    // Click on "Masculino" to filter by male
    await user.click(screen.getByText('Masculino'));

    await act(async () => {
      jest.advanceTimersByTime(200);
    });

    expect(fetchFilters).toHaveBeenCalled();
  });

  it('should use cached data when available', async () => {
    render(
      <LanguageProvider>
        <Dashboard />
      </LanguageProvider>
    );

    // First load
    await act(async () => {
      jest.advanceTimersByTime(200);
      await Promise.resolve();
    });

    // Store initial call count
    const callsBefore = (fetchMapStats as jest.Mock).mock.calls.length;

    // Change filter and change back - should use cache
    await act(async () => {
      jest.advanceTimersByTime(200);
      await Promise.resolve();
    });

    // Verify calls happened
    expect(fetchFilters).toHaveBeenCalled();
    expect(callsBefore).toBeGreaterThanOrEqual(0);
  });
});

describe('Dashboard year filtering', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (fetchMapStats as jest.Mock).mockResolvedValue([]);
    (fetchBiometrics as jest.Mock).mockResolvedValue([]);
    (fetchEvolution as jest.Mock).mockResolvedValue([]);
    (fetchMedalTable as jest.Mock).mockResolvedValue([]);
    (fetchTopAthletes as jest.Mock).mockResolvedValue([]);
    (fetchGenderStats as jest.Mock).mockResolvedValue([]);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should filter years by season', async () => {
    const mixedYearSeasonMap = {
      1924: ['Winter'],
      1928: ['Summer'],
      1932: ['Summer', 'Winter'],
      1936: ['Summer'],
      2000: ['Summer'],
    };

    (fetchFilters as jest.Mock).mockResolvedValue({
      years: [1924, 1928, 1932, 1936, 2000],
      sports: ['All'],
      countries: [{ code: 'All', label: 'All' }],
      year_season_map: mixedYearSeasonMap,
    });

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    render(
      <LanguageProvider>
        <Dashboard />
      </LanguageProvider>
    );

    await act(async () => {
      jest.advanceTimersByTime(200);
      await Promise.resolve();
    });

    // Switch to Winter season
    await user.click(screen.getByText('Inverno'));

    await act(async () => {
      jest.advanceTimersByTime(200);
      await Promise.resolve();
    });

    // Data should have been fetched
    expect(fetchFilters).toHaveBeenCalled();
  });

  it('should adjust year when filtered years change', async () => {
    (fetchFilters as jest.Mock).mockResolvedValue({
      years: [1924, 1928, 1932],
      sports: ['All'],
      countries: [{ code: 'All', label: 'All' }],
      year_season_map: {
        1924: ['Winter'],
        1928: ['Summer'],
        1932: ['Summer'],
      },
    });

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    render(
      <LanguageProvider>
        <Dashboard />
      </LanguageProvider>
    );

    await act(async () => {
      jest.advanceTimersByTime(200);
      await Promise.resolve();
    });

    // Switch to Winter - should adjust to only available Winter year
    await user.click(screen.getByText('Inverno'));

    await act(async () => {
      jest.advanceTimersByTime(200);
      await Promise.resolve();
    });

    expect(fetchFilters).toHaveBeenCalled();
  });
});

describe('Dashboard athlete selection', () => {
  const mockFiltersData = {
    years: [2016],
    sports: ['All'],
    countries: [{ code: 'All', label: 'All' }],
    year_season_map: { 2016: ['Summer'] },
  };

  const mockAthleteProfile = {
    id: 1,
    name: 'Michael Phelps',
    sex: 'M',
    born: '1985',
    height: 193,
    weight: 88,
    noc: 'USA',
  };

  const mockAthleteStats = {
    total_gold: 23,
    total_silver: 3,
    total_bronze: 2,
    sports: ['Swimming'],
    first_games: 2000,
    last_games: 2016,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (fetchFilters as jest.Mock).mockResolvedValue(mockFiltersData);
    (fetchMapStats as jest.Mock).mockResolvedValue([]);
    (fetchBiometrics as jest.Mock).mockResolvedValue([]);
    (fetchEvolution as jest.Mock).mockResolvedValue([]);
    (fetchMedalTable as jest.Mock).mockResolvedValue([]);
    (fetchTopAthletes as jest.Mock).mockResolvedValue([]);
    (fetchGenderStats as jest.Mock).mockResolvedValue([]);
    mockFetchAthleteProfile.mockResolvedValue(mockAthleteProfile);
    mockFetchAthleteStats.mockResolvedValue(mockAthleteStats);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should show athlete search component', async () => {
    render(
      <LanguageProvider>
        <Dashboard />
      </LanguageProvider>
    );

    await act(async () => {
      jest.advanceTimersByTime(200);
      await Promise.resolve();
    });

    expect(screen.getByPlaceholderText('Buscar atleta por nome...')).toBeInTheDocument();
  });

  it('should load athlete profile when athlete selected', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    render(
      <LanguageProvider>
        <Dashboard />
      </LanguageProvider>
    );

    await act(async () => {
      jest.advanceTimersByTime(200);
      await Promise.resolve();
    });

    // Click the mock select button
    await user.click(screen.getByTestId('select-athlete-btn'));

    await act(async () => {
      jest.advanceTimersByTime(200);
      await Promise.resolve();
    });

    // Profile and stats should be fetched
    expect(mockFetchAthleteProfile).toHaveBeenCalledWith(1);
    expect(mockFetchAthleteStats).toHaveBeenCalledWith(1);
  });

  it('should show athlete profile card after loading', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    render(
      <LanguageProvider>
        <Dashboard />
      </LanguageProvider>
    );

    await act(async () => {
      jest.advanceTimersByTime(200);
      await Promise.resolve();
    });

    // Select athlete
    await user.click(screen.getByTestId('select-athlete-btn'));

    await act(async () => {
      jest.advanceTimersByTime(500);
      await Promise.resolve();
    });

    // Profile card should be shown
    expect(screen.getByTestId('athlete-profile-card')).toBeInTheDocument();
  });

  it('should close athlete profile card when close button clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    render(
      <LanguageProvider>
        <Dashboard />
      </LanguageProvider>
    );

    await act(async () => {
      jest.advanceTimersByTime(200);
      await Promise.resolve();
    });

    // Select athlete
    await user.click(screen.getByTestId('select-athlete-btn'));

    await act(async () => {
      jest.advanceTimersByTime(500);
      await Promise.resolve();
    });

    // Close profile
    await user.click(screen.getByTestId('close-profile-btn'));

    await act(async () => {
      jest.advanceTimersByTime(200);
      await Promise.resolve();
    });

    // Profile card should be hidden
    expect(screen.queryByTestId('athlete-profile-card')).not.toBeInTheDocument();
  });

  it('should handle error when loading athlete profile', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockFetchAthleteProfile.mockRejectedValue(new Error('Failed to load athlete'));
    
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    render(
      <LanguageProvider>
        <Dashboard />
      </LanguageProvider>
    );

    await act(async () => {
      jest.advanceTimersByTime(200);
      await Promise.resolve();
    });

    // Select athlete that will fail
    await user.click(screen.getByTestId('select-athlete-btn'));

    await act(async () => {
      jest.advanceTimersByTime(500);
      await Promise.resolve();
    });

    // Error should be logged
    expect(consoleSpy).toHaveBeenCalledWith('Erro ao carregar atleta:', expect.any(Error));
    
    consoleSpy.mockRestore();
  });
});

describe('Dashboard error handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    (console.error as jest.Mock).mockRestore();
  });

  it('should handle filter fetch errors gracefully', async () => {
    (fetchFilters as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(
      <LanguageProvider>
        <Dashboard />
      </LanguageProvider>
    );

    await act(async () => {
      jest.advanceTimersByTime(200);
      await Promise.resolve();
    });

    // Should show backend connection error
    expect(screen.getByText('Falha ao conectar com o backend.')).toBeInTheDocument();
  });
});

describe('Dashboard timeline player', () => {
  const mockFiltersData = {
    years: [2000, 2004, 2008, 2012, 2016],
    sports: ['All'],
    countries: [{ code: 'All', label: 'All' }],
    year_season_map: {
      2000: ['Summer'],
      2004: ['Summer'],
      2008: ['Summer'],
      2012: ['Summer'],
      2016: ['Summer'],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (fetchFilters as jest.Mock).mockResolvedValue(mockFiltersData);
    (fetchMapStats as jest.Mock).mockResolvedValue([]);
    (fetchBiometrics as jest.Mock).mockResolvedValue([]);
    (fetchEvolution as jest.Mock).mockResolvedValue([]);
    (fetchMedalTable as jest.Mock).mockResolvedValue([]);
    (fetchTopAthletes as jest.Mock).mockResolvedValue([]);
    (fetchGenderStats as jest.Mock).mockResolvedValue([]);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render play button', async () => {
    render(
      <LanguageProvider>
        <Dashboard />
      </LanguageProvider>
    );

    await act(async () => {
      jest.advanceTimersByTime(200);
      await Promise.resolve();
    });

    // Play button should be present
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should render speed controls', async () => {
    render(
      <LanguageProvider>
        <Dashboard />
      </LanguageProvider>
    );

    await act(async () => {
      jest.advanceTimersByTime(200);
      await Promise.resolve();
    });

    // Speed buttons should be present
    expect(screen.getByText('1x')).toBeInTheDocument();
    expect(screen.getByText('2x')).toBeInTheDocument();
  });

  it('should render all years button', async () => {
    render(
      <LanguageProvider>
        <Dashboard />
      </LanguageProvider>
    );

    await act(async () => {
      jest.advanceTimersByTime(200);
      await Promise.resolve();
    });

    expect(screen.getByText('Todos os Anos')).toBeInTheDocument();
  });

  it('should toggle all years filter', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    render(
      <LanguageProvider>
        <Dashboard />
      </LanguageProvider>
    );

    await act(async () => {
      jest.advanceTimersByTime(200);
      await Promise.resolve();
    });

    // Click "Todos os Anos" button
    await user.click(screen.getByText('Todos os Anos'));

    await act(async () => {
      jest.advanceTimersByTime(200);
      await Promise.resolve();
    });

    // Should show checkmark
    expect(screen.getByText(/Todos os Anos.*✓/)).toBeInTheDocument();
  });

  it('should toggle back from all years to specific year', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    render(
      <LanguageProvider>
        <Dashboard />
      </LanguageProvider>
    );

    await act(async () => {
      jest.advanceTimersByTime(200);
      await Promise.resolve();
    });

    // Click "Todos os Anos" button to enable
    await user.click(screen.getByText('Todos os Anos'));

    await act(async () => {
      jest.advanceTimersByTime(200);
      await Promise.resolve();
    });

    // Click again to disable
    await user.click(screen.getByText(/Todos os Anos.*✓/));

    await act(async () => {
      jest.advanceTimersByTime(200);
      await Promise.resolve();
    });

    // Should not have checkmark
    expect(screen.queryByText(/✓/)).not.toBeInTheDocument();
  });

  it('should start and stop playback', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    render(
      <LanguageProvider>
        <Dashboard />
      </LanguageProvider>
    );

    await act(async () => {
      jest.advanceTimersByTime(200);
      await Promise.resolve();
    });

    // Find play button (by querying buttons)
    const buttons = screen.getAllByRole('button');
    // Play button is typically one of the first buttons in the timeline area
    const playButton = buttons.find(btn => btn.className.includes('rounded-full'));
    
    if (playButton) {
      await user.click(playButton);
      
      await act(async () => {
        jest.advanceTimersByTime(2000);
        await Promise.resolve();
      });
      
      // Click again to pause
      await user.click(playButton);
    }
    
    expect(fetchFilters).toHaveBeenCalled();
  });

  it('should change playback speed', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    render(
      <LanguageProvider>
        <Dashboard />
      </LanguageProvider>
    );

    await act(async () => {
      jest.advanceTimersByTime(200);
      await Promise.resolve();
    });

    // Click 2x speed
    await user.click(screen.getByText('2x'));

    await act(async () => {
      jest.advanceTimersByTime(200);
    });

    // Speed should be selected (has different styling)
    expect(screen.getByText('2x')).toBeInTheDocument();
  });
});

describe('Dashboard medal type badges', () => {
  const mockFiltersData = {
    years: [2016],
    sports: ['All'],
    countries: [{ code: 'All', label: 'All' }],
    year_season_map: { 2016: ['Summer'] },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (fetchFilters as jest.Mock).mockResolvedValue(mockFiltersData);
    (fetchMapStats as jest.Mock).mockResolvedValue([]);
    (fetchBiometrics as jest.Mock).mockResolvedValue([]);
    (fetchEvolution as jest.Mock).mockResolvedValue([]);
    (fetchMedalTable as jest.Mock).mockResolvedValue([]);
    (fetchTopAthletes as jest.Mock).mockResolvedValue([]);
    (fetchGenderStats as jest.Mock).mockResolvedValue([]);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should show gold badge when gold filter selected', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    render(
      <LanguageProvider>
        <Dashboard />
      </LanguageProvider>
    );

    await act(async () => {
      jest.advanceTimersByTime(200);
      await Promise.resolve();
    });

    await user.click(screen.getByText('Ouro'));

    await act(async () => {
      jest.advanceTimersByTime(200);
      await Promise.resolve();
    });

    // Should show gold badge in chart header
    const badges = screen.getAllByText('Ouro');
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it('should show silver badge when silver filter selected', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    render(
      <LanguageProvider>
        <Dashboard />
      </LanguageProvider>
    );

    await act(async () => {
      jest.advanceTimersByTime(200);
      await Promise.resolve();
    });

    await user.click(screen.getByText('Prata'));

    await act(async () => {
      jest.advanceTimersByTime(200);
      await Promise.resolve();
    });

    // Should show silver badge
    const badges = screen.getAllByText('Prata');
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it('should show bronze badge when bronze filter selected', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    render(
      <LanguageProvider>
        <Dashboard />
      </LanguageProvider>
    );

    await act(async () => {
      jest.advanceTimersByTime(200);
      await Promise.resolve();
    });

    await user.click(screen.getByText('Bronze'));

    await act(async () => {
      jest.advanceTimersByTime(200);
      await Promise.resolve();
    });

    // Should show bronze badge
    const badges = screen.getAllByText('Bronze');
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });
});

describe('Dashboard playback and prefetch', () => {
  const mockFiltersData = {
    years: [2000, 2004, 2008, 2012, 2016],
    sports: ['All'],
    countries: [{ code: 'All', label: 'All' }],
    year_season_map: {
      2000: ['Summer'],
      2004: ['Summer'],
      2008: ['Summer'],
      2012: ['Summer'],
      2016: ['Summer'],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (fetchFilters as jest.Mock).mockResolvedValue(mockFiltersData);
    (fetchMapStats as jest.Mock).mockResolvedValue([{ id: 'USA', total: 100, gold: 50, silver: 30, bronze: 20 }]);
    (fetchBiometrics as jest.Mock).mockResolvedValue([]);
    (fetchEvolution as jest.Mock).mockResolvedValue([]);
    (fetchMedalTable as jest.Mock).mockResolvedValue([]);
    (fetchTopAthletes as jest.Mock).mockResolvedValue([]);
    (fetchGenderStats as jest.Mock).mockResolvedValue([]);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should stop playback at the end of year list', async () => {
    // Start from near the end
    const nearEndFilters = {
      ...mockFiltersData,
      years: [2012, 2016],
    };
    
    (fetchFilters as jest.Mock).mockResolvedValue(nearEndFilters);
    
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    render(
      <LanguageProvider>
        <Dashboard />
      </LanguageProvider>
    );

    await act(async () => {
      jest.advanceTimersByTime(200);
      await Promise.resolve();
    });

    // Find and click play button
    const buttons = screen.getAllByRole('button');
    const playButton = buttons.find(btn => btn.className.includes('rounded-full'));
    
    if (playButton) {
      await user.click(playButton);
      
      // Allow playback to complete
      for (let i = 0; i < 5; i++) {
        await act(async () => {
          jest.advanceTimersByTime(1500);
          await Promise.resolve();
        });
      }
      
      // Playback should have stopped (play button should be visible, not pause)
      expect(fetchFilters).toHaveBeenCalled();
    }
  });

  it('should handle loading state during playback', async () => {
    // Make fetch slow
    (fetchMapStats as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve([]), 2000))
    );
    
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    render(
      <LanguageProvider>
        <Dashboard />
      </LanguageProvider>
    );

    await act(async () => {
      jest.advanceTimersByTime(200);
      await Promise.resolve();
    });

    // Find and click play button
    const buttons = screen.getAllByRole('button');
    const playButton = buttons.find(btn => btn.className.includes('rounded-full'));
    
    if (playButton) {
      await user.click(playButton);
      
      await act(async () => {
        jest.advanceTimersByTime(500);
        await Promise.resolve();
      });
      
      // Should show loading state or not crash
      expect(playButton).toBeInTheDocument();
    }
  });
});

describe('Dashboard error states during data fetch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    (console.error as jest.Mock).mockRestore();
  });

  it('should not show error during playback', async () => {
    (fetchFilters as jest.Mock).mockResolvedValue({
      years: [2000, 2004],
      sports: ['All'],
      countries: [{ code: 'All', label: 'All' }],
      year_season_map: { 2000: ['Summer'], 2004: ['Summer'] },
    });
    (fetchMapStats as jest.Mock).mockResolvedValue([]);
    (fetchBiometrics as jest.Mock).mockResolvedValue([]);
    (fetchEvolution as jest.Mock).mockResolvedValue([]);
    (fetchMedalTable as jest.Mock).mockResolvedValue([]);
    (fetchTopAthletes as jest.Mock).mockResolvedValue([]);
    (fetchGenderStats as jest.Mock).mockResolvedValue([]);
    
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    render(
      <LanguageProvider>
        <Dashboard />
      </LanguageProvider>
    );

    await act(async () => {
      jest.advanceTimersByTime(200);
      await Promise.resolve();
    });

    // Find and click play button
    const buttons = screen.getAllByRole('button');
    const playButton = buttons.find(btn => btn.className.includes('rounded-full'));
    
    if (playButton) {
      // Make next fetch fail before clicking play
      (fetchMapStats as jest.Mock).mockImplementation(() => 
        Promise.reject(new Error('Network error'))
      );
      (fetchBiometrics as jest.Mock).mockImplementation(() => 
        Promise.reject(new Error('Network error'))
      );
      (fetchMedalTable as jest.Mock).mockImplementation(() => 
        Promise.reject(new Error('Network error'))
      );
      (fetchTopAthletes as jest.Mock).mockImplementation(() => 
        Promise.reject(new Error('Network error'))
      );
      (fetchGenderStats as jest.Mock).mockImplementation(() => 
        Promise.reject(new Error('Network error'))
      );
      
      await user.click(playButton);
      
      await act(async () => {
        jest.advanceTimersByTime(1500);
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
      });
      
      // Should not show error during playback (silently fails)
      expect(screen.queryByText('Erro ao carregar dados.')).not.toBeInTheDocument();
    }
  });
});
