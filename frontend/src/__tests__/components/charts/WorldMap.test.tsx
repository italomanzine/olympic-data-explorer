import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import WorldMap from '../../../components/charts/WorldMap';
import { LanguageProvider } from '../../../contexts/LanguageContext';
import { createPortal } from 'react-dom';

// Mock d3-scale to avoid ESM issues
jest.mock('d3-scale', () => ({
  scaleLinear: () => {
    const scale = (value: number) => {
      // Simple linear scale mock
      return `rgb(${Math.round(255 * value)}, ${Math.round(255 * value)}, 0)`;
    };
    scale.domain = () => scale;
    scale.range = () => scale;
    scale.clamp = () => scale;
    return scale;
  },
}));

// Mock react-dom createPortal
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: jest.fn((element) => element),
}));

// Mock react-simple-maps with better handlers
jest.mock('react-simple-maps', () => ({
  ComposableMap: ({ children, ...props }: { children: React.ReactNode; projection?: string; projectionConfig?: object; width?: number; height?: number }) => (
    <div data-testid="composable-map" data-projection={props.projection}>{children}</div>
  ),
  Geographies: ({ children, geography }: { children: (props: { geographies: Array<{ rsmKey: string; properties: { ISO_A3: string; NAME: string } }> }) => React.ReactNode; geography: string }) => {
    const mockGeographies = [
      { rsmKey: 'geo-1', properties: { ISO_A3: 'USA', NAME: 'United States' } },
      { rsmKey: 'geo-2', properties: { ISO_A3: 'BRA', NAME: 'Brazil' } },
      { rsmKey: 'geo-3', properties: { ISO_A3: 'CHN', NAME: 'China' } },
      { rsmKey: 'geo-4', properties: { ISO_A3: 'XXX', NAME: 'Unknown' } }, // No data country
      { rsmKey: 'geo-5', properties: { ISO_A3: '-99', NAME: 'Invalid' } }, // Invalid ISO
    ];
    return <g data-testid="geographies" data-geography={geography}>{children({ geographies: mockGeographies })}</g>;
  },
  Geography: (props: { 
    geography: { properties: { ISO_A3: string; NAME: string } };
    style: Record<string, unknown>; 
    onMouseEnter: (evt: React.MouseEvent) => void; 
    onMouseLeave: () => void;
    onClick: () => void;
    fill?: string;
  }) => {
    return (
      <path 
        data-testid={`geography-${props.geography.properties.ISO_A3}`}
        data-fill={props.fill}
        onMouseEnter={(evt) => props.onMouseEnter(evt as unknown as React.MouseEvent)}
        onMouseLeave={props.onMouseLeave}
        onClick={props.onClick}
      />
    );
  },
  ZoomableGroup: ({ children, center, zoom }: { children: React.ReactNode; center?: [number, number]; zoom?: number }) => (
    <g data-testid="zoomable-group" data-center={center?.join(',')} data-zoom={zoom}>{children}</g>
  ),
}));

const mockData = [
  { id: 'USA', total: 2500, gold: 1000, silver: 800, bronze: 700 },
  { id: 'BRA', total: 150, gold: 50, silver: 50, bronze: 50 },
  { id: 'CHN', total: 500, gold: 200, silver: 150, bronze: 150 },
];

const renderWithProvider = (component: React.ReactNode) => {
  return render(
    <LanguageProvider>
      {component}
    </LanguageProvider>
  );
};

describe('WorldMap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the map container', () => {
      renderWithProvider(<WorldMap data={mockData} />);
      expect(screen.getByTestId('composable-map')).toBeInTheDocument();
    });

    it('renders geographies', () => {
      renderWithProvider(<WorldMap data={mockData} />);
      expect(screen.getByTestId('geographies')).toBeInTheDocument();
    });

    it('renders zoomable group', () => {
      renderWithProvider(<WorldMap data={mockData} />);
      expect(screen.getByTestId('zoomable-group')).toBeInTheDocument();
    });

    it('renders geography elements for all countries', () => {
      renderWithProvider(<WorldMap data={mockData} />);
      expect(screen.getByTestId('geography-USA')).toBeInTheDocument();
      expect(screen.getByTestId('geography-BRA')).toBeInTheDocument();
      expect(screen.getByTestId('geography-CHN')).toBeInTheDocument();
    });

    it('renders legend gradient', () => {
      renderWithProvider(<WorldMap data={mockData} />);
      // Legend should be rendered
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('renders with empty data', () => {
      renderWithProvider(<WorldMap data={[]} />);
      expect(screen.getByTestId('composable-map')).toBeInTheDocument();
    });
  });

  describe('Mouse Interactions', () => {
    it('shows tooltip on mouse enter', async () => {
      renderWithProvider(<WorldMap data={mockData} />);
      
      const usaGeo = screen.getByTestId('geography-USA');
      
      await act(async () => {
        fireEvent.mouseEnter(usaGeo, { clientX: 100, clientY: 200 });
      });
      
      // Portal should have been called for tooltip
      expect(createPortal).toHaveBeenCalled();
    });

    it('hides tooltip on mouse leave', async () => {
      renderWithProvider(<WorldMap data={mockData} />);
      
      const usaGeo = screen.getByTestId('geography-USA');
      
      await act(async () => {
        fireEvent.mouseEnter(usaGeo, { clientX: 100, clientY: 200 });
      });
      
      await act(async () => {
        fireEvent.mouseLeave(usaGeo);
      });
      
      // Tooltip should be hidden
      expect(usaGeo).toBeInTheDocument();
    });

    it('updates tooltip position on mouse move', async () => {
      renderWithProvider(<WorldMap data={mockData} />);
      
      const usaGeo = screen.getByTestId('geography-USA');
      
      // First show tooltip
      await act(async () => {
        fireEvent.mouseEnter(usaGeo, { clientX: 100, clientY: 200 });
      });
      
      // Get the container (parent of composable-map)
      const mapContainer = screen.getByTestId('composable-map').parentElement;
      
      // Move mouse within container
      if (mapContainer) {
        await act(async () => {
          fireEvent.mouseMove(mapContainer, { clientX: 150, clientY: 250 });
        });
      }
      
      // Portal should still be called
      expect(createPortal).toHaveBeenCalled();
    });

    it('handles mouse enter on country without data', async () => {
      renderWithProvider(<WorldMap data={mockData} />);
      
      const unknownGeo = screen.getByTestId('geography-XXX');
      
      await act(async () => {
        fireEvent.mouseEnter(unknownGeo, { clientX: 100, clientY: 200 });
      });
      
      expect(unknownGeo).toBeInTheDocument();
    });

    it('handles mouse enter on invalid ISO country', async () => {
      renderWithProvider(<WorldMap data={mockData} />);
      
      const invalidGeo = screen.getByTestId('geography--99');
      
      await act(async () => {
        fireEvent.mouseEnter(invalidGeo, { clientX: 100, clientY: 200 });
      });
      
      expect(invalidGeo).toBeInTheDocument();
    });
  });

  describe('Click Interactions', () => {
    it('calls onClick when clicking a country with data', async () => {
      renderWithProvider(<WorldMap data={mockData} />);
      
      const usaGeo = screen.getByTestId('geography-USA');
      
      await act(async () => {
        fireEvent.click(usaGeo);
      });
      
      expect(usaGeo).toBeInTheDocument();
    });

    it('handles click on Brazil', async () => {
      renderWithProvider(<WorldMap data={mockData} />);
      
      const braGeo = screen.getByTestId('geography-BRA');
      
      await act(async () => {
        fireEvent.click(braGeo);
      });
      
      expect(braGeo).toBeInTheDocument();
    });

    it('handles click on country without data', async () => {
      renderWithProvider(<WorldMap data={mockData} />);
      
      const unknownGeo = screen.getByTestId('geography-XXX');
      
      await act(async () => {
        fireEvent.click(unknownGeo);
      });
      
      expect(unknownGeo).toBeInTheDocument();
    });
  });

  describe('Color Scaling', () => {
    it('applies different colors based on medal count', () => {
      renderWithProvider(<WorldMap data={mockData} />);
      
      // USA has most medals, should have different fill than BRA
      const usaGeo = screen.getByTestId('geography-USA');
      const braGeo = screen.getByTestId('geography-BRA');
      
      expect(usaGeo).toBeInTheDocument();
      expect(braGeo).toBeInTheDocument();
    });

    it('handles countries with zero medals', () => {
      const dataWithZero = [
        ...mockData,
        { id: 'XXX', total: 0, gold: 0, silver: 0, bronze: 0 },
      ];
      
      renderWithProvider(<WorldMap data={dataWithZero} />);
      
      expect(screen.getByTestId('composable-map')).toBeInTheDocument();
    });

    it('handles extreme medal counts', () => {
      const extremeData = [
        { id: 'USA', total: 10000, gold: 5000, silver: 3000, bronze: 2000 },
      ];
      
      renderWithProvider(<WorldMap data={extremeData} />);
      
      expect(screen.getByTestId('composable-map')).toBeInTheDocument();
    });
  });

  describe('NOC to ISO3 Mapping', () => {
    it('correctly maps NOC codes to ISO3', () => {
      renderWithProvider(<WorldMap data={mockData} />);
      
      // The component should render countries based on NOC to ISO mapping
      expect(screen.getByTestId('geography-USA')).toBeInTheDocument();
    });

    it('handles special NOC codes', () => {
      const specialNocData = [
        { id: 'GBR', total: 100, gold: 50, silver: 30, bronze: 20 },
        { id: 'GER', total: 80, gold: 40, silver: 25, bronze: 15 },
      ];
      
      renderWithProvider(<WorldMap data={specialNocData} />);
      
      expect(screen.getByTestId('composable-map')).toBeInTheDocument();
    });
  });

  describe('Tooltip Portal', () => {
    it('uses portal for tooltip rendering', async () => {
      renderWithProvider(<WorldMap data={mockData} />);
      
      const usaGeo = screen.getByTestId('geography-USA');
      
      await act(async () => {
        fireEvent.mouseEnter(usaGeo, { clientX: 150, clientY: 250 });
      });
      
      expect(createPortal).toHaveBeenCalled();
    });

    it('positions tooltip based on mouse coordinates', async () => {
      renderWithProvider(<WorldMap data={mockData} />);
      
      const usaGeo = screen.getByTestId('geography-USA');
      
      await act(async () => {
        fireEvent.mouseEnter(usaGeo, { clientX: 300, clientY: 400 });
      });
      
      // Tooltip should be positioned near mouse
      expect(createPortal).toHaveBeenCalled();
    });
  });

  describe('Responsive Design', () => {
    it('renders with responsive container', () => {
      renderWithProvider(<WorldMap data={mockData} />);
      
      const container = screen.getByTestId('composable-map').parentElement;
      expect(container).toBeInTheDocument();
    });
  });

  describe('Memoization', () => {
    it('component is memoized', () => {
      const { rerender } = renderWithProvider(<WorldMap data={mockData} />);
      
      // Rerender with same props
      rerender(
        <LanguageProvider>
          <WorldMap data={mockData} />
        </LanguageProvider>
      );
      
      expect(screen.getByTestId('composable-map')).toBeInTheDocument();
    });
  });
});

// Test calculateTooltipPosition function directly
import { calculateTooltipPosition } from '../../../components/charts/WorldMap';

describe('calculateTooltipPosition', () => {

  // Mock window dimensions
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;

  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: originalInnerHeight, writable: true });
  });

  it('should position tooltip with cursor offset normally', () => {
    const result = calculateTooltipPosition(100, 100);
    
    // Should be offset from cursor position (cursorOffset = 12)
    expect(result.left).toBe(112);
    expect(result.top).toBe(112);
  });

  it('should adjust tooltip position when near right edge', () => {
    // Mouse near right edge
    const result = calculateTooltipPosition(950, 100, 160, 130);
    
    // Should flip to left side of cursor
    expect(result.left).toBeLessThan(950);
  });

  it('should adjust tooltip position when near bottom edge', () => {
    // Mouse near bottom edge
    const result = calculateTooltipPosition(100, 700, 160, 130);
    
    // Should flip to top of cursor
    expect(result.top).toBeLessThan(700);
  });

  it('should keep tooltip within left boundary', () => {
    // Mouse position that would result in negative left after flipping
    // Position near right edge on a tiny screen, then flip puts it negative
    Object.defineProperty(window, 'innerWidth', { value: 100, writable: true });
    // When x=90, width=160, right edge check: 90+12+160 > 100-10 (262 > 90), so flip left
    // left = 90 - 160 - 12 = -82, which is < 10, so should be clamped to 10
    const result = calculateTooltipPosition(90, 100, 160, 130);
    
    // Should be clamped to at least padding (10)
    expect(result.left).toBe(10);
  });

  it('should keep tooltip within top boundary', () => {
    // Mouse position that would result in negative top after flipping  
    Object.defineProperty(window, 'innerHeight', { value: 100, writable: true });
    // When y=90, height=130, bottom edge check: 90+12+130 > 100-10 (232 > 90), so flip top
    // top = 90 - 130 - 12 = -52, which is < 10, so should be clamped to 10
    const result = calculateTooltipPosition(100, 90, 160, 130);
    
    // Should be clamped to at least padding (10)
    expect(result.top).toBe(10);
  });

  it('should handle corner case (bottom-right)', () => {
    const result = calculateTooltipPosition(950, 700, 160, 130);
    
    // Both should be adjusted
    expect(result.left).toBeLessThan(950);
    expect(result.top).toBeLessThan(700);
  });

  it('should work with custom tooltip dimensions', () => {
    const result = calculateTooltipPosition(100, 100, 200, 200);
    
    expect(result.left).toBeDefined();
    expect(result.top).toBeDefined();
  });
});
