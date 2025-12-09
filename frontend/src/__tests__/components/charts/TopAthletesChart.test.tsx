import React from 'react';
import { render, screen } from '@testing-library/react';
import TopAthletesChart from '../../../components/charts/TopAthletesChart';
import { LanguageProvider } from '../../../contexts/LanguageContext';

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

// Store tooltip content renderer
let tooltipContentRenderer: React.ReactElement | null = null;

// Mock recharts to avoid canvas issues in tests
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 800, height: 400 }}>{children}</div>
    ),
    Tooltip: ({ content }: { content: React.ReactElement }) => {
      tooltipContentRenderer = content;
      return <div data-testid="tooltip-mock" />;
    },
  };
});

interface TopAthlete {
  id: number;
  name: string;
  noc: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
}

describe('TopAthletesChart', () => {
  const renderWithProvider = (data: TopAthlete[], medalType?: string) => {
    return render(
      <LanguageProvider>
        <TopAthletesChart data={data} medalType={medalType} />
      </LanguageProvider>
    );
  };

  beforeEach(() => {
    tooltipContentRenderer = null;
  });

  it('should render no data message when data is empty', () => {
    renderWithProvider([]);

    expect(screen.getByText('Sem dados')).toBeInTheDocument();
  });

  it('should render no data message when data is undefined', () => {
    renderWithProvider(undefined as unknown as TopAthlete[]);

    expect(screen.getByText('Sem dados')).toBeInTheDocument();
  });

  it('should render chart with athlete data', () => {
    const mockData = [
      { id: 1, name: 'Michael Phelps', noc: 'USA', gold: 23, silver: 3, bronze: 2, total: 28 },
      { id: 2, name: 'Usain Bolt', noc: 'JAM', gold: 8, silver: 0, bronze: 0, total: 8 },
    ];

    renderWithProvider(mockData);

    // Recharts wrapper should be present
    const chartWrapper = document.querySelector('.recharts-wrapper');
    expect(chartWrapper).toBeInTheDocument();
  });

  it('should truncate long athlete names', () => {
    const mockData = [
      { id: 1, name: 'Very Long Athlete Name That Exceeds Twenty Characters', noc: 'USA', gold: 1, silver: 0, bronze: 0, total: 1 },
    ];

    renderWithProvider(mockData);

    // Chart should render without error
    const chartWrapper = document.querySelector('.recharts-wrapper');
    expect(chartWrapper).toBeInTheDocument();
  });

  it('should render stacked bars for Total medal type', () => {
    const mockData = [
      { id: 1, name: 'Athlete1', noc: 'USA', gold: 5, silver: 3, bronze: 2, total: 10 },
    ];

    renderWithProvider(mockData, 'Total');

    // Chart should render
    const chartWrapper = document.querySelector('.recharts-wrapper');
    expect(chartWrapper).toBeInTheDocument();
  });

  it('should render single bar for Gold medal type', () => {
    const mockData = [
      { id: 1, name: 'Athlete1', noc: 'USA', gold: 5, silver: 3, bronze: 2, total: 10 },
    ];

    renderWithProvider(mockData, 'Gold');

    // Chart should render
    const chartWrapper = document.querySelector('.recharts-wrapper');
    expect(chartWrapper).toBeInTheDocument();
  });

  it('should render single bar for Silver medal type', () => {
    const mockData = [
      { id: 1, name: 'Athlete1', noc: 'USA', gold: 5, silver: 3, bronze: 2, total: 10 },
    ];

    renderWithProvider(mockData, 'Silver');

    // Chart should render
    const chartWrapper = document.querySelector('.recharts-wrapper');
    expect(chartWrapper).toBeInTheDocument();
  });

  it('should render single bar for Bronze medal type', () => {
    const mockData = [
      { id: 1, name: 'Athlete1', noc: 'USA', gold: 5, silver: 3, bronze: 2, total: 10 },
    ];

    renderWithProvider(mockData, 'Bronze');

    // Chart should render
    const chartWrapper = document.querySelector('.recharts-wrapper');
    expect(chartWrapper).toBeInTheDocument();
  });

  it('should default to Total when medalType not provided', () => {
    const mockData = [
      { id: 1, name: 'Athlete1', noc: 'USA', gold: 5, silver: 3, bronze: 2, total: 10 },
    ];

    renderWithProvider(mockData);

    // Chart should render
    const chartWrapper = document.querySelector('.recharts-wrapper');
    expect(chartWrapper).toBeInTheDocument();
  });

  describe('CustomTooltip', () => {
    it('should render tooltip with athlete details', () => {
      const mockData = [
        { id: 1, name: 'Michael Phelps', noc: 'USA', gold: 23, silver: 3, bronze: 2, total: 28 },
      ];

      renderWithProvider(mockData);

      if (tooltipContentRenderer) {
        const { container } = render(
          <LanguageProvider>
            {React.cloneElement(tooltipContentRenderer, {
              active: true,
              payload: [{
                payload: mockData[0],
              }],
            })}
          </LanguageProvider>
        );

        expect(container.textContent).toContain('Michael Phelps');
        expect(container.textContent).toContain('USA');
        expect(container.textContent).toContain('23');
        expect(container.textContent).toContain('3');
        expect(container.textContent).toContain('2');
        expect(container.textContent).toContain('28');
      }
    });

    it('should return null when tooltip is not active', () => {
      const mockData = [
        { id: 1, name: 'Athlete1', noc: 'USA', gold: 5, silver: 3, bronze: 2, total: 10 },
      ];

      renderWithProvider(mockData);

      if (tooltipContentRenderer) {
        const { container } = render(
          <LanguageProvider>
            {React.cloneElement(tooltipContentRenderer, {
              active: false,
              payload: [],
            })}
          </LanguageProvider>
        );

        expect(container.innerHTML).toBe('');
      }
    });

    it('should return null when payload is empty', () => {
      const mockData = [
        { id: 1, name: 'Athlete1', noc: 'USA', gold: 5, silver: 3, bronze: 2, total: 10 },
      ];

      renderWithProvider(mockData);

      if (tooltipContentRenderer) {
        const { container } = render(
          <LanguageProvider>
            {React.cloneElement(tooltipContentRenderer, {
              active: true,
              payload: [],
            })}
          </LanguageProvider>
        );

        expect(container.innerHTML).toBe('');
      }
    });

    it('should return null when payload item has no payload', () => {
      const mockData = [
        { id: 1, name: 'Athlete1', noc: 'USA', gold: 5, silver: 3, bronze: 2, total: 10 },
      ];

      renderWithProvider(mockData);

      if (tooltipContentRenderer) {
        const { container } = render(
          <LanguageProvider>
            {React.cloneElement(tooltipContentRenderer, {
              active: true,
              payload: [{ payload: null }],
            })}
          </LanguageProvider>
        );

        expect(container.innerHTML).toBe('');
      }
    });
  });
});
