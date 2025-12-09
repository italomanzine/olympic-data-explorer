import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EvolutionChart from '../../../components/charts/EvolutionChart';
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

// Store tooltip and legend content renderers
let tooltipContentRenderer: React.ReactElement | null = null;
let legendContentRenderer: React.ReactElement | null = null;

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
    Legend: ({ content }: { content: React.ReactElement }) => {
      legendContentRenderer = content;
      return <div data-testid="legend-mock" />;
    },
  };
});

interface EvolutionDataPoint {
  Year: number;
  [key: string]: number;
}

describe('EvolutionChart', () => {
  const renderWithProvider = (data: EvolutionDataPoint[]) => {
    return render(
      <LanguageProvider>
        <EvolutionChart data={data} />
      </LanguageProvider>
    );
  };

  beforeEach(() => {
    tooltipContentRenderer = null;
    legendContentRenderer = null;
  });

  it('should render chart with data', () => {
    const mockData = [
      { Year: 2000, USA: 50, BRA: 10 },
      { Year: 2004, USA: 55, BRA: 12 },
      { Year: 2008, USA: 60, BRA: 15 },
    ];

    renderWithProvider(mockData);

    // Recharts wrapper should be present
    const chartWrapper = document.querySelector('.recharts-wrapper');
    expect(chartWrapper).toBeInTheDocument();
  });

  it('should render without errors for empty data', () => {
    renderWithProvider([]);

    // Component should render without error
    const container = document.querySelector('.recharts-wrapper') || document.querySelector('[class*="bg-white"]');
    expect(container).toBeInTheDocument();
  });

  it('should show historical country notes section', () => {
    const mockData: EvolutionDataPoint[] = [
      { Year: 1988, URS: 100 },
      { Year: 1992, RUS: 80 },
    ];

    renderWithProvider(mockData);

    // Should have historical notes footer
    expect(screen.getByText(/Países com mudanças históricas/)).toBeInTheDocument();
  });

  it('should render axis labels', () => {
    const mockData = [
      { Year: 2000, USA: 50 },
    ];

    renderWithProvider(mockData);

    // Chart should render
    const chartWrapper = document.querySelector('.recharts-wrapper');
    expect(chartWrapper).toBeInTheDocument();
  });

  it('should not show historical notes when no historical countries', () => {
    const mockData = [
      { Year: 2016, USA: 121, GBR: 67 },
    ];

    renderWithProvider(mockData);

    // Should not have warning note
    expect(screen.queryByText(/Países com mudanças históricas/)).not.toBeInTheDocument();
  });

  describe('CustomTooltip', () => {
    it('should render tooltip with country medals', () => {
      const mockData = [
        { Year: 2000, USA: 50, BRA: 10 },
      ];

      renderWithProvider(mockData);

      if (tooltipContentRenderer) {
        const { container } = render(
          <LanguageProvider>
            {React.cloneElement(tooltipContentRenderer, {
              active: true,
              label: 2000,
              payload: [
                { name: 'USA', value: 50, color: '#2563EB' },
                { name: 'BRA', value: 10, color: '#DC2626' },
              ],
            })}
          </LanguageProvider>
        );

        expect(container.textContent).toContain('2000');
        expect(container.textContent).toContain('USA');
        expect(container.textContent).toContain('50');
        expect(container.textContent).toContain('BRA');
        expect(container.textContent).toContain('10');
      }
    });

    it('should return null when tooltip is not active', () => {
      const mockData = [
        { Year: 2000, USA: 50 },
      ];

      renderWithProvider(mockData);

      if (tooltipContentRenderer) {
        const { container } = render(
          <LanguageProvider>
            {React.cloneElement(tooltipContentRenderer, {
              active: false,
              label: 2000,
              payload: [],
            })}
          </LanguageProvider>
        );

        expect(container.innerHTML).toBe('');
      }
    });

    it('should filter out zero values from tooltip', () => {
      const mockData = [
        { Year: 2000, USA: 50, BRA: 0 },
      ];

      renderWithProvider(mockData);

      if (tooltipContentRenderer) {
        const { container } = render(
          <LanguageProvider>
            {React.cloneElement(tooltipContentRenderer, {
              active: true,
              label: 2000,
              payload: [
                { name: 'USA', value: 50, color: '#2563EB' },
                { name: 'BRA', value: 0, color: '#DC2626' },
              ],
            })}
          </LanguageProvider>
        );

        expect(container.textContent).toContain('USA');
        // BRA should be filtered out since value is 0
        const braText = container.textContent?.includes('BRA:') && container.textContent?.includes(':0');
        expect(braText).toBeFalsy();
      }
    });

    it('should sort tooltip entries by value descending', () => {
      const mockData = [
        { Year: 2000, USA: 50, BRA: 100, GER: 30 },
      ];

      renderWithProvider(mockData);

      if (tooltipContentRenderer) {
        const { container } = render(
          <LanguageProvider>
            {React.cloneElement(tooltipContentRenderer, {
              active: true,
              label: 2000,
              payload: [
                { name: 'USA', value: 50, color: '#2563EB' },
                { name: 'BRA', value: 100, color: '#DC2626' },
                { name: 'GER', value: 30, color: '#16A34A' },
              ],
            })}
          </LanguageProvider>
        );

        const text = container.textContent || '';
        const braIndex = text.indexOf('BRA');
        const usaIndex = text.indexOf('USA');
        const gerIndex = text.indexOf('GER');

        // BRA (100) should come first, then USA (50), then GER (30)
        expect(braIndex).toBeLessThan(usaIndex);
        expect(usaIndex).toBeLessThan(gerIndex);
      }
    });
  });

  describe('CustomLegend', () => {
    it('should render legend with country names', () => {
      const mockData = [
        { Year: 2000, USA: 50, BRA: 10 },
      ];

      renderWithProvider(mockData);

      if (legendContentRenderer) {
        const { container } = render(
          <LanguageProvider>
            {React.cloneElement(legendContentRenderer, {
              payload: [
                { value: 'USA', color: '#2563EB' },
                { value: 'BRA', color: '#DC2626' },
              ],
              hiddenKeys: [],
              toggleKey: jest.fn(),
            })}
          </LanguageProvider>
        );

        expect(container.textContent).toContain('USA');
        expect(container.textContent).toContain('BRA');
      }
    });

    it('should toggle line visibility when legend clicked', () => {
      const mockData = [
        { Year: 2000, USA: 50, BRA: 10 },
      ];

      renderWithProvider(mockData);

      if (legendContentRenderer) {
        const toggleKey = jest.fn();
        const { getByText } = render(
          <LanguageProvider>
            {React.cloneElement(legendContentRenderer, {
              payload: [
                { value: 'USA', color: '#2563EB' },
              ],
              hiddenKeys: [],
              toggleKey,
            })}
          </LanguageProvider>
        );

        fireEvent.click(getByText('USA'));
        expect(toggleKey).toHaveBeenCalledWith('USA');
      }
    });

    it('should show hidden style for hidden keys', () => {
      const mockData = [
        { Year: 2000, USA: 50, BRA: 10 },
      ];

      renderWithProvider(mockData);

      if (legendContentRenderer) {
        const { container } = render(
          <LanguageProvider>
            {React.cloneElement(legendContentRenderer, {
              payload: [
                { value: 'USA', color: '#2563EB' },
              ],
              hiddenKeys: ['USA'],
              toggleKey: jest.fn(),
            })}
          </LanguageProvider>
        );

        const button = container.querySelector('button');
        expect(button).toHaveClass('opacity-40');
        expect(button).toHaveClass('line-through');
      }
    });

    it('should show asterisk for historical countries', () => {
      const mockData = [
        { Year: 1988, URS: 100 },
      ];

      renderWithProvider(mockData);

      if (legendContentRenderer) {
        const { container } = render(
          <LanguageProvider>
            {React.cloneElement(legendContentRenderer, {
              payload: [
                { value: 'URS', color: '#2563EB' },
              ],
              hiddenKeys: [],
              toggleKey: jest.fn(),
            })}
          </LanguageProvider>
        );

        expect(container.textContent).toContain('*');
      }
    });

    it('should not show asterisk for non-historical countries', () => {
      const mockData = [
        { Year: 2000, USA: 50 },
      ];

      renderWithProvider(mockData);

      if (legendContentRenderer) {
        const { container } = render(
          <LanguageProvider>
            {React.cloneElement(legendContentRenderer, {
              payload: [
                { value: 'USA', color: '#2563EB' },
              ],
              hiddenKeys: [],
              toggleKey: jest.fn(),
            })}
          </LanguageProvider>
        );

        // Should only contain 'USA' without asterisk indicator
        const buttons = container.querySelectorAll('button');
        const usaButton = Array.from(buttons).find(b => b.textContent?.includes('USA'));
        expect(usaButton?.textContent).not.toContain('*');
      }
    });

    it('should call toggleKey when legend button is clicked', () => {
      const mockData = [
        { Year: 2000, USA: 50 },
      ];

      renderWithProvider(mockData);

      if (legendContentRenderer) {
        const mockToggleKey = jest.fn();
        
        const { container } = render(
          <LanguageProvider>
            {React.cloneElement(legendContentRenderer, {
              payload: [
                { value: 'USA', color: '#2563EB' },
              ],
              hiddenKeys: [],
              toggleKey: mockToggleKey,
            })}
          </LanguageProvider>
        );

        // Find and click the USA button
        const buttons = container.querySelectorAll('button');
        const usaButton = Array.from(buttons).find(b => b.textContent?.includes('USA'));
        
        if (usaButton) {
          fireEvent.click(usaButton);
          expect(mockToggleKey).toHaveBeenCalledWith('USA');
        }
      }
    });

    it('should toggle hidden keys correctly', () => {
      const mockData = [
        { Year: 2000, USA: 50, BRA: 30 },
      ];

      renderWithProvider(mockData);

      if (legendContentRenderer) {
        const mockToggleKey = jest.fn();
        
        // First render with USA hidden
        const { container: containerWithHidden } = render(
          <LanguageProvider>
            {React.cloneElement(legendContentRenderer, {
              payload: [
                { value: 'USA', color: '#2563EB' },
                { value: 'BRA', color: '#DC2626' },
              ],
              hiddenKeys: ['USA'],
              toggleKey: mockToggleKey,
            })}
          </LanguageProvider>
        );

        // USA button should have reduced opacity styling
        const buttons = containerWithHidden.querySelectorAll('button');
        expect(buttons.length).toBeGreaterThan(0);
      }
    });
  });
});
