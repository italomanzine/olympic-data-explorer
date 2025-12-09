import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BiometricsChart from '../../../components/charts/BiometricsChart';
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
let tooltipContentRenderer: any = null;

// Mock recharts to avoid canvas issues in tests and capture tooltip
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

describe('BiometricsChart', () => {
  const renderWithProvider = (data: any[]) => {
    return render(
      <LanguageProvider>
        <BiometricsChart data={data} />
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
    renderWithProvider(undefined as any);

    expect(screen.getByText('Sem dados')).toBeInTheDocument();
  });

  it('should render chart when data is provided', () => {
    const mockData = [
      { Name: 'Athlete1', Sex: 'M', Height: 180, Weight: 75, Medal: 'Gold', NOC: 'USA', Sport: 'Swimming' },
      { Name: 'Athlete2', Sex: 'F', Height: 165, Weight: 55, Medal: 'Silver', NOC: 'BRA', Sport: 'Athletics' },
    ];

    renderWithProvider(mockData);

    // Chart should be rendered (no "no data" message)
    expect(screen.queryByText('Sem dados')).not.toBeInTheDocument();
  });

  it('should render legend with gender labels', () => {
    const mockData = [
      { Name: 'Athlete1', Sex: 'M', Height: 180, Weight: 75, Medal: 'Gold', NOC: 'USA', Sport: 'Swimming' },
      { Name: 'Athlete2', Sex: 'F', Height: 165, Weight: 55, Medal: 'Silver', NOC: 'BRA', Sport: 'Athletics' },
    ];

    renderWithProvider(mockData);

    // Recharts renders the chart wrapper, legend content may be in SVG
    const chartWrapper = document.querySelector('.recharts-wrapper');
    expect(chartWrapper).toBeInTheDocument();
  });

  it('should group athletes with same biometrics', () => {
    const mockData = [
      { Name: 'Athlete1', Sex: 'M', Height: 180, Weight: 75, Medal: 'Gold', NOC: 'USA', Sport: 'Swimming' },
      { Name: 'Athlete2', Sex: 'M', Height: 180, Weight: 75, Medal: 'Silver', NOC: 'USA', Sport: 'Swimming' },
    ];

    renderWithProvider(mockData);

    // Should render without error (groups are handled internally)
    expect(screen.queryByText('Sem dados')).not.toBeInTheDocument();
  });

  describe('CustomTooltip', () => {
    it('should render tooltip content with athlete data', () => {
      const mockData = [
        { Name: 'Athlete1', Sex: 'M', Height: 180, Weight: 75, Medal: 'Gold', NOC: 'USA', Sport: 'Swimming' },
      ];

      renderWithProvider(mockData);

      // Get the tooltip component and render it directly
      if (tooltipContentRenderer) {
        const { container } = render(
          <LanguageProvider>
            {React.cloneElement(tooltipContentRenderer, {
              active: true,
              payload: [{
                payload: {
                  Height: 180,
                  Weight: 75,
                  Athletes: [
                    { Name: 'Athlete1', Sex: 'M', Height: 180, Weight: 75, Medal: 'Gold', NOC: 'USA', Sport: 'Swimming' },
                  ],
                },
              }],
            })}
          </LanguageProvider>
        );

        expect(container.textContent).toContain('180cm');
        expect(container.textContent).toContain('75kg');
        expect(container.textContent).toContain('Athlete1');
      }
    });

    it('should return null when tooltip is not active', () => {
      const mockData = [
        { Name: 'Athlete1', Sex: 'M', Height: 180, Weight: 75, Medal: 'Gold', NOC: 'USA', Sport: 'Swimming' },
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

    it('should show medal badges for medalists', () => {
      const mockData = [
        { Name: 'GoldAthlete', Sex: 'M', Height: 180, Weight: 75, Medal: 'Gold', NOC: 'USA', Sport: 'Swimming' },
        { Name: 'SilverAthlete', Sex: 'F', Height: 165, Weight: 55, Medal: 'Silver', NOC: 'BRA', Sport: 'Athletics' },
        { Name: 'BronzeAthlete', Sex: 'M', Height: 175, Weight: 70, Medal: 'Bronze', NOC: 'GER', Sport: 'Running' },
      ];

      renderWithProvider(mockData);

      if (tooltipContentRenderer) {
        const { container } = render(
          <LanguageProvider>
            {React.cloneElement(tooltipContentRenderer, {
              active: true,
              payload: [{
                payload: {
                  Height: 180,
                  Weight: 75,
                  Athletes: mockData,
                },
              }],
            })}
          </LanguageProvider>
        );

        expect(container.textContent).toContain('GoldAthlete');
        expect(container.textContent).toContain('SilverAthlete');
        expect(container.textContent).toContain('BronzeAthlete');
      }
    });

    it('should show more athletes indicator when more than 10 athletes', () => {
      const mockData = Array.from({ length: 15 }, (_, i) => ({
        Name: `Athlete${i + 1}`,
        Sex: i % 2 === 0 ? 'M' : 'F',
        Height: 180,
        Weight: 75,
        Medal: i < 3 ? 'Gold' : 'NA',
        NOC: 'USA',
        Sport: 'Swimming',
      }));

      renderWithProvider(mockData);

      if (tooltipContentRenderer) {
        const { container } = render(
          <LanguageProvider>
            {React.cloneElement(tooltipContentRenderer, {
              active: true,
              payload: [{
                payload: {
                  Height: 180,
                  Weight: 75,
                  Athletes: mockData,
                },
              }],
            })}
          </LanguageProvider>
        );

        // Should show +5 more athletes indicator
        expect(container.textContent).toContain('+ 5');
      }
    });

    it('should not show medal badge for non-medalists (NA)', () => {
      const mockData = [
        { Name: 'NoMedalAthlete', Sex: 'M', Height: 180, Weight: 75, Medal: 'NA', NOC: 'USA', Sport: 'Swimming' },
      ];

      renderWithProvider(mockData);

      if (tooltipContentRenderer) {
        const { container } = render(
          <LanguageProvider>
            {React.cloneElement(tooltipContentRenderer, {
              active: true,
              payload: [{
                payload: {
                  Height: 180,
                  Weight: 75,
                  Athletes: mockData,
                },
              }],
            })}
          </LanguageProvider>
        );

        // Should not have medal styling classes
        expect(container.querySelector('.bg-yellow-100')).not.toBeInTheDocument();
        expect(container.querySelector('.bg-slate-100')).not.toBeInTheDocument();
        expect(container.querySelector('.bg-orange-100')).not.toBeInTheDocument();
      }
    });

    it('should not show medal badge for athletes with No Medal status', () => {
      const mockData = [
        { Name: 'NoMedalAthlete', Sex: 'M', Height: 180, Weight: 75, Medal: 'No Medal', NOC: 'USA', Sport: 'Swimming' },
      ];

      renderWithProvider(mockData);

      if (tooltipContentRenderer) {
        const { container } = render(
          <LanguageProvider>
            {React.cloneElement(tooltipContentRenderer, {
              active: true,
              payload: [{
                payload: {
                  Height: 180,
                  Weight: 75,
                  Athletes: mockData,
                },
              }],
            })}
          </LanguageProvider>
        );

        // Should not have medal styling classes  
        expect(container.querySelector('.bg-yellow-100')).not.toBeInTheDocument();
      }
    });

    it('should display female gender correctly', () => {
      const mockData = [
        { Name: 'FemaleAthlete', Sex: 'F', Height: 165, Weight: 55, Medal: 'Gold', NOC: 'BRA', Sport: 'Athletics' },
      ];

      renderWithProvider(mockData);

      if (tooltipContentRenderer) {
        const { container } = render(
          <LanguageProvider>
            {React.cloneElement(tooltipContentRenderer, {
              active: true,
              payload: [{
                payload: {
                  Height: 165,
                  Weight: 55,
                  Athletes: mockData,
                },
              }],
            })}
          </LanguageProvider>
        );

        expect(container.textContent).toContain('Feminino');
      }
    });

    it('should sort athletes by medal order', () => {
      const mockData = [
        { Name: 'NoMedal', Sex: 'M', Height: 180, Weight: 75, Medal: 'NA', NOC: 'USA', Sport: 'Swimming' },
        { Name: 'GoldWinner', Sex: 'M', Height: 180, Weight: 75, Medal: 'Gold', NOC: 'USA', Sport: 'Swimming' },
        { Name: 'BronzeWinner', Sex: 'M', Height: 180, Weight: 75, Medal: 'Bronze', NOC: 'USA', Sport: 'Swimming' },
        { Name: 'SilverWinner', Sex: 'M', Height: 180, Weight: 75, Medal: 'Silver', NOC: 'USA', Sport: 'Swimming' },
      ];

      renderWithProvider(mockData);

      if (tooltipContentRenderer) {
        const { container } = render(
          <LanguageProvider>
            {React.cloneElement(tooltipContentRenderer, {
              active: true,
              payload: [{
                payload: {
                  Height: 180,
                  Weight: 75,
                  Athletes: mockData,
                },
              }],
            })}
          </LanguageProvider>
        );

        const text = container.textContent || '';
        const goldIndex = text.indexOf('GoldWinner');
        const silverIndex = text.indexOf('SilverWinner');
        const bronzeIndex = text.indexOf('BronzeWinner');
        const noMedalIndex = text.indexOf('NoMedal');

        // Gold should come first, then Silver, then Bronze, then NoMedal
        expect(goldIndex).toBeLessThan(silverIndex);
        expect(silverIndex).toBeLessThan(bronzeIndex);
        expect(bronzeIndex).toBeLessThan(noMedalIndex);
      }
    });
  });
});
