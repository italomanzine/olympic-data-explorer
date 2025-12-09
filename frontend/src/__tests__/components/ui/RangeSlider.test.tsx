import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RangeSlider from '../../../components/ui/RangeSlider';

describe('RangeSlider', () => {
  it('should render with label', () => {
    render(
      <RangeSlider
        min={1900}
        max={2020}
        value={2016}
        onChange={() => {}}
        label="Year"
      />
    );

    expect(screen.getByText('Year')).toBeInTheDocument();
    expect(screen.getByText('2016')).toBeInTheDocument();
    expect(screen.getByText('1900')).toBeInTheDocument();
    expect(screen.getByText('2020')).toBeInTheDocument();
  });

  it('should render without label', () => {
    render(
      <RangeSlider
        min={0}
        max={100}
        value={50}
        onChange={() => {}}
      />
    );

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('should call onChange when slider value changes', async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();
    
    render(
      <RangeSlider
        min={0}
        max={100}
        value={50}
        onChange={handleChange}
      />
    );

    const slider = screen.getByRole('slider');
    expect(slider).toHaveValue('50');
  });

  it('should display current value in label', () => {
    render(
      <RangeSlider
        min={1896}
        max={2024}
        value={2000}
        onChange={() => {}}
        label="Edição"
      />
    );

    expect(screen.getByText('Edição')).toBeInTheDocument();
    expect(screen.getByText('2000')).toBeInTheDocument();
  });
});
