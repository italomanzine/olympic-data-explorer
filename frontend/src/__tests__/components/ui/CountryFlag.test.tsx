import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CountryFlag from '../../../components/ui/CountryFlag';

// Mock flags module
jest.mock('../../../lib/flags', () => ({
  getFlagWithSrcSet: jest.fn((noc: string) => ({
    src: `https://flagcdn.com/w40/${noc.toLowerCase()}.png`,
    srcSet: `https://flagcdn.com/w40/${noc.toLowerCase()}.png 1x, https://flagcdn.com/w80/${noc.toLowerCase()}.png 2x`,
  })),
}));

describe('CountryFlag', () => {
  it('should render flag image', () => {
    render(<CountryFlag noc="USA" />);
    
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('alt', 'Bandeira USA');
  });

  it('should apply size sm by default', () => {
    render(<CountryFlag noc="BRA" />);
    
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('width', '20');
    expect(img).toHaveAttribute('height', '15');
  });

  it('should apply size xs', () => {
    render(<CountryFlag noc="GBR" size="xs" />);
    
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('width', '16');
    expect(img).toHaveAttribute('height', '12');
  });

  it('should apply size md', () => {
    render(<CountryFlag noc="FRA" size="md" />);
    
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('width', '32');
    expect(img).toHaveAttribute('height', '24');
  });

  it('should apply size lg', () => {
    render(<CountryFlag noc="GER" size="lg" />);
    
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('width', '48');
    expect(img).toHaveAttribute('height', '36');
  });

  it('should apply size xl', () => {
    render(<CountryFlag noc="JPN" size="xl" />);
    
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('width', '64');
    expect(img).toHaveAttribute('height', '48');
  });

  it('should apply custom className', () => {
    render(<CountryFlag noc="CHN" className="custom-class" />);
    
    const img = screen.getByRole('img');
    expect(img).toHaveClass('custom-class');
  });

  it('should show fallback on image error when showFallback is true', () => {
    render(<CountryFlag noc="XYZ" showFallback={true} />);
    
    const img = screen.getByRole('img');
    fireEvent.error(img);
    
    // After error, fallback span should appear
    expect(screen.getByText('XYZ')).toBeInTheDocument();
  });

  it('should not show fallback when showFallback is false and image errors', () => {
    render(<CountryFlag noc="XYZ" showFallback={false} />);
    
    const img = screen.getByRole('img');
    fireEvent.error(img);
    
    // Image should still be in the document (not replaced)
    expect(screen.queryByText('XYZ')).not.toBeInTheDocument();
  });

  it('should have lazy loading attribute', () => {
    render(<CountryFlag noc="AUS" />);
    
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('should have title attribute with NOC code', () => {
    render(<CountryFlag noc="ITA" />);
    
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('title', 'ITA');
  });
});
