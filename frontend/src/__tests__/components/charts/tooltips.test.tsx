import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageProvider } from '../../../contexts/LanguageContext';
import { CustomTooltip as BiometricsTooltip } from '../../../components/charts/BiometricsChart';
import { CustomTooltip as EvolutionTooltip, CustomLegend } from '../../../components/charts/EvolutionChart';
import { CustomTooltip as TopAthletesTooltip } from '../../../components/charts/TopAthletesChart';

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

describe('BiometricsChart CustomTooltip', () => {
  const renderTooltip = (props: any) => {
    return render(
      <LanguageProvider>
        <BiometricsTooltip {...props} />
      </LanguageProvider>
    );
  };

  it('should render tooltip with athlete data when active', () => {
    const mockPayload = [{
      payload: {
        Height: 180,
        Weight: 75,
        Athletes: [
          { Name: 'Gold Athlete', Sex: 'M', Height: 180, Weight: 75, Medal: 'Gold', NOC: 'USA', Sport: 'Swimming' },
          { Name: 'Silver Athlete', Sex: 'F', Height: 180, Weight: 75, Medal: 'Silver', NOC: 'BRA', Sport: 'Athletics' },
        ],
      },
    }];

    const { container } = renderTooltip({ active: true, payload: mockPayload });

    expect(container.textContent).toContain('180cm');
    expect(container.textContent).toContain('75kg');
    expect(container.textContent).toContain('Gold Athlete');
    expect(container.textContent).toContain('Silver Athlete');
  });

  it('should return null when not active', () => {
    const { container } = renderTooltip({ active: false, payload: [] });
    expect(container.innerHTML).toBe('');
  });

  it('should return null when payload is empty', () => {
    const { container } = renderTooltip({ active: true, payload: [] });
    expect(container.innerHTML).toBe('');
  });

  it('should sort athletes by medal order', () => {
    const mockPayload = [{
      payload: {
        Height: 180,
        Weight: 75,
        Athletes: [
          { Name: 'No Medal', Sex: 'M', Height: 180, Weight: 75, Medal: 'NA', NOC: 'USA', Sport: 'Swimming' },
          { Name: 'Gold Winner', Sex: 'M', Height: 180, Weight: 75, Medal: 'Gold', NOC: 'USA', Sport: 'Swimming' },
          { Name: 'Bronze Winner', Sex: 'M', Height: 180, Weight: 75, Medal: 'Bronze', NOC: 'USA', Sport: 'Swimming' },
          { Name: 'Silver Winner', Sex: 'M', Height: 180, Weight: 75, Medal: 'Silver', NOC: 'USA', Sport: 'Swimming' },
        ],
      },
    }];

    const { container } = renderTooltip({ active: true, payload: mockPayload });
    const text = container.textContent || '';

    const goldIndex = text.indexOf('Gold Winner');
    const silverIndex = text.indexOf('Silver Winner');
    const bronzeIndex = text.indexOf('Bronze Winner');
    const noMedalIndex = text.indexOf('No Medal');

    expect(goldIndex).toBeLessThan(silverIndex);
    expect(silverIndex).toBeLessThan(bronzeIndex);
    expect(bronzeIndex).toBeLessThan(noMedalIndex);
  });

  it('should show remaining athletes count when more than 10', () => {
    const athletes = Array.from({ length: 15 }, (_, i) => ({
      Name: `Athlete ${i}`,
      Sex: 'M',
      Height: 180,
      Weight: 75,
      Medal: 'NA',
      NOC: 'USA',
      Sport: 'Swimming',
    }));

    const mockPayload = [{
      payload: { Height: 180, Weight: 75, Athletes: athletes },
    }];

    const { container } = renderTooltip({ active: true, payload: mockPayload });
    expect(container.textContent).toContain('+ 5');
  });

  it('should show female gender correctly', () => {
    const mockPayload = [{
      payload: {
        Height: 165,
        Weight: 55,
        Athletes: [
          { Name: 'Female Athlete', Sex: 'F', Height: 165, Weight: 55, Medal: 'Gold', NOC: 'BRA', Sport: 'Athletics' },
        ],
      },
    }];

    const { container } = renderTooltip({ active: true, payload: mockPayload });
    expect(container.textContent).toContain('Feminino');
  });

  it('should show male gender correctly', () => {
    const mockPayload = [{
      payload: {
        Height: 180,
        Weight: 75,
        Athletes: [
          { Name: 'Male Athlete', Sex: 'M', Height: 180, Weight: 75, Medal: 'Gold', NOC: 'USA', Sport: 'Swimming' },
        ],
      },
    }];

    const { container } = renderTooltip({ active: true, payload: mockPayload });
    expect(container.textContent).toContain('Masculino');
  });

  it('should show medal badge for gold medalist', () => {
    const mockPayload = [{
      payload: {
        Height: 180,
        Weight: 75,
        Athletes: [
          { Name: 'Gold Athlete', Sex: 'M', Height: 180, Weight: 75, Medal: 'Gold', NOC: 'USA', Sport: 'Swimming' },
        ],
      },
    }];

    const { container } = renderTooltip({ active: true, payload: mockPayload });
    expect(container.querySelector('.bg-yellow-100')).toBeInTheDocument();
  });

  it('should show medal badge for silver medalist', () => {
    const mockPayload = [{
      payload: {
        Height: 180,
        Weight: 75,
        Athletes: [
          { Name: 'Silver Athlete', Sex: 'M', Height: 180, Weight: 75, Medal: 'Silver', NOC: 'USA', Sport: 'Swimming' },
        ],
      },
    }];

    const { container } = renderTooltip({ active: true, payload: mockPayload });
    expect(container.querySelector('.bg-slate-100')).toBeInTheDocument();
  });

  it('should show medal badge for bronze medalist', () => {
    const mockPayload = [{
      payload: {
        Height: 180,
        Weight: 75,
        Athletes: [
          { Name: 'Bronze Athlete', Sex: 'M', Height: 180, Weight: 75, Medal: 'Bronze', NOC: 'USA', Sport: 'Swimming' },
        ],
      },
    }];

    const { container } = renderTooltip({ active: true, payload: mockPayload });
    expect(container.querySelector('.bg-orange-100')).toBeInTheDocument();
  });

  it('should not show medal badge for non-medalist', () => {
    const mockPayload = [{
      payload: {
        Height: 180,
        Weight: 75,
        Athletes: [
          { Name: 'No Medal', Sex: 'M', Height: 180, Weight: 75, Medal: 'NA', NOC: 'USA', Sport: 'Swimming' },
        ],
      },
    }];

    const { container } = renderTooltip({ active: true, payload: mockPayload });
    expect(container.querySelector('.bg-yellow-100')).not.toBeInTheDocument();
    expect(container.querySelector('.bg-slate-100')).not.toBeInTheDocument();
    expect(container.querySelector('.bg-orange-100')).not.toBeInTheDocument();
  });

  it('should not show medal badge for No Medal status', () => {
    const mockPayload = [{
      payload: {
        Height: 180,
        Weight: 75,
        Athletes: [
          { Name: 'No Medal', Sex: 'M', Height: 180, Weight: 75, Medal: 'No Medal', NOC: 'USA', Sport: 'Swimming' },
        ],
      },
    }];

    const { container } = renderTooltip({ active: true, payload: mockPayload });
    expect(container.querySelector('.bg-yellow-100')).not.toBeInTheDocument();
  });
});

describe('EvolutionChart CustomTooltip', () => {
  const renderTooltip = (props: any) => {
    return render(
      <LanguageProvider>
        <EvolutionTooltip {...props} />
      </LanguageProvider>
    );
  };

  it('should render tooltip with country data when active', () => {
    const mockPayload = [
      { name: 'USA', value: 50, color: '#2563EB' },
      { name: 'BRA', value: 10, color: '#DC2626' },
    ];

    const { container } = renderTooltip({ active: true, payload: mockPayload, label: 2000 });

    expect(container.textContent).toContain('2000');
    expect(container.textContent).toContain('USA');
    expect(container.textContent).toContain('50');
    expect(container.textContent).toContain('BRA');
    expect(container.textContent).toContain('10');
  });

  it('should return null when not active', () => {
    const { container } = renderTooltip({ active: false, payload: [], label: 2000 });
    expect(container.innerHTML).toBe('');
  });

  it('should filter out zero values', () => {
    const mockPayload = [
      { name: 'USA', value: 50, color: '#2563EB' },
      { name: 'BRA', value: 0, color: '#DC2626' },
    ];

    const { container } = renderTooltip({ active: true, payload: mockPayload, label: 2000 });

    expect(container.textContent).toContain('USA');
    expect(container.textContent).not.toContain('BRA:');
  });

  it('should sort by value descending', () => {
    const mockPayload = [
      { name: 'USA', value: 50, color: '#2563EB' },
      { name: 'BRA', value: 100, color: '#DC2626' },
      { name: 'GER', value: 30, color: '#16A34A' },
    ];

    const { container } = renderTooltip({ active: true, payload: mockPayload, label: 2000 });
    const text = container.textContent || '';

    const braIndex = text.indexOf('BRA');
    const usaIndex = text.indexOf('USA');
    const gerIndex = text.indexOf('GER');

    expect(braIndex).toBeLessThan(usaIndex);
    expect(usaIndex).toBeLessThan(gerIndex);
  });
});

describe('EvolutionChart CustomLegend', () => {
  const renderLegend = (props: any) => {
    return render(
      <LanguageProvider>
        <CustomLegend {...props} />
      </LanguageProvider>
    );
  };

  it('should render legend with country names', () => {
    const mockPayload = [
      { value: 'USA', color: '#2563EB' },
      { value: 'BRA', color: '#DC2626' },
    ];

    const { container } = renderLegend({ payload: mockPayload, hiddenKeys: [], toggleKey: jest.fn() });

    expect(container.textContent).toContain('USA');
    expect(container.textContent).toContain('BRA');
  });

  it('should call toggleKey when clicked', () => {
    const toggleKey = jest.fn();
    const mockPayload = [{ value: 'USA', color: '#2563EB' }];

    const { getByText } = renderLegend({ payload: mockPayload, hiddenKeys: [], toggleKey });

    fireEvent.click(getByText('USA'));
    expect(toggleKey).toHaveBeenCalledWith('USA');
  });

  it('should show hidden style for hidden keys', () => {
    const mockPayload = [{ value: 'USA', color: '#2563EB' }];

    const { container } = renderLegend({ payload: mockPayload, hiddenKeys: ['USA'], toggleKey: jest.fn() });

    const button = container.querySelector('button');
    expect(button).toHaveClass('opacity-40');
    expect(button).toHaveClass('line-through');
  });

  it('should show asterisk for historical countries', () => {
    const mockPayload = [{ value: 'URS', color: '#2563EB' }];

    const { container } = renderLegend({ payload: mockPayload, hiddenKeys: [], toggleKey: jest.fn() });

    expect(container.textContent).toContain('*');
  });

  it('should not show asterisk for non-historical countries', () => {
    const mockPayload = [{ value: 'USA', color: '#2563EB' }];

    const { container } = renderLegend({ payload: mockPayload, hiddenKeys: [], toggleKey: jest.fn() });

    // Check that there's no asterisk in the button
    const button = container.querySelector('button');
    expect(button?.textContent).not.toContain('*');
  });
});

describe('TopAthletesChart CustomTooltip', () => {
  const renderTooltip = (props: any) => {
    return render(
      <LanguageProvider>
        <TopAthletesTooltip {...props} />
      </LanguageProvider>
    );
  };

  it('should render tooltip with athlete data when active', () => {
    const mockPayload = [{
      payload: {
        id: 1,
        name: 'Michael Phelps',
        noc: 'USA',
        gold: 23,
        silver: 3,
        bronze: 2,
        total: 28,
      },
    }];

    const { container } = renderTooltip({ active: true, payload: mockPayload });

    expect(container.textContent).toContain('Michael Phelps');
    expect(container.textContent).toContain('USA');
    expect(container.textContent).toContain('23');
    expect(container.textContent).toContain('3');
    expect(container.textContent).toContain('2');
    expect(container.textContent).toContain('28');
  });

  it('should return null when not active', () => {
    const { container } = renderTooltip({ active: false, payload: [] });
    expect(container.innerHTML).toBe('');
  });

  it('should return null when payload is empty', () => {
    const { container } = renderTooltip({ active: true, payload: [] });
    expect(container.innerHTML).toBe('');
  });

  it('should return null when payload item has no payload', () => {
    const { container } = renderTooltip({ active: true, payload: [{ payload: null }] });
    expect(container.innerHTML).toBe('');
  });
});
