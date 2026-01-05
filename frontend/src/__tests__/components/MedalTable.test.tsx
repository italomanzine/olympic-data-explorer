import React from 'react';
import { render, screen } from '@testing-library/react';
import MedalTable from '../../components/MedalTable';
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

describe('MedalTable', () => {
  const renderWithProvider = (props: any) => {
    return render(
      <LanguageProvider>
        <MedalTable {...props} />
      </LanguageProvider>
    );
  };

  it('should render table with title', () => {
    renderWithProvider({
      data: [],
      title: 'Medal Table',
    });

    expect(screen.getByText('Medal Table')).toBeInTheDocument();
  });

  it('should render medal data', () => {
    const mockData = [
      { name: 'United States (USA)', code: 'USA', gold: 50, silver: 30, bronze: 20, total: 100 },
      { name: 'China (CHN)', code: 'CHN', gold: 40, silver: 35, bronze: 25, total: 100 },
    ];

    renderWithProvider({
      data: mockData,
      title: 'Medal Table',
    });

    expect(screen.getByText('50')).toBeInTheDocument(); // Gold
    expect(screen.getByText('30')).toBeInTheDocument(); // Silver
  });

  it('should show no medals message when data is empty', () => {
    renderWithProvider({
      data: [],
      title: 'Medal Table',
    });

    expect(screen.getByText('Nenhuma medalha encontrada com estes filtros.')).toBeInTheDocument();
  });

  it('should render expand button when onExpand provided', () => {
    const handleExpand = jest.fn();
    
    renderWithProvider({
      data: [],
      title: 'Medal Table',
      onExpand: handleExpand,
    });

    expect(screen.getByText('Expandir')).toBeInTheDocument();
  });

  it('should not render expand button when onExpand not provided', () => {
    renderWithProvider({
      data: [],
      title: 'Medal Table',
    });

    expect(screen.queryByText('Expandir')).not.toBeInTheDocument();
  });

  it('should render column headers', () => {
    renderWithProvider({
      data: [],
      title: 'Medal Table',
    });

    expect(screen.getByText('NOME')).toBeInTheDocument();
    expect(screen.getByText('TOTAL')).toBeInTheDocument();
    expect(screen.getByTitle('Ouro')).toBeInTheDocument();
    expect(screen.getByTitle('Prata')).toBeInTheDocument();
    expect(screen.getByTitle('Bronze')).toBeInTheDocument();
  });

  it('should show country flag for country codes', () => {
    const mockData = [
      { name: 'United States (USA)', code: 'USA', gold: 50, silver: 30, bronze: 20, total: 100 },
    ];

    renderWithProvider({
      data: mockData,
      title: 'Medal Table',
    });

    // CountryFlag should be rendered (it's memoized)
    const img = screen.getByAltText('Bandeira USA');
    expect(img).toBeInTheDocument();
  });

  it('should not show flag for non-country codes (sports)', () => {
    const mockData = [
      { name: 'Swimming', code: 'Swimming', gold: 10, silver: 5, bronze: 3, total: 18 },
    ];

    renderWithProvider({
      data: mockData,
      title: 'Medal Table',
    });

    expect(screen.queryByAltText(/Bandeira/)).not.toBeInTheDocument();
  });

  it('should render row numbers', () => {
    const mockData = [
      { name: 'USA', code: 'USA', gold: 50, silver: 30, bronze: 20, total: 100 },
      { name: 'CHN', code: 'CHN', gold: 40, silver: 35, bronze: 25, total: 100 },
    ];

    renderWithProvider({
      data: mockData,
      title: 'Medal Table',
    });

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should translate country names when available', () => {
    const mockData = [
      { name: 'United States (USA)', code: 'USA', gold: 50, silver: 30, bronze: 20, total: 100 },
    ];

    renderWithProvider({
      data: mockData,
      title: 'Medal Table',
    });

    // In pt-BR, USA should be translated
    expect(screen.getByText(/Estados Unidos/)).toBeInTheDocument();
  });

  it('should translate sport names when available', () => {
    const mockData = [
      { name: 'Swimming', code: 'Swimming', gold: 10, silver: 5, bronze: 3, total: 18 },
    ];

    renderWithProvider({
      data: mockData,
      title: 'Medal Table',
    });

    // In pt-BR, Swimming should be translated to Natação
    expect(screen.getByText('Natação')).toBeInTheDocument();
  });

  it('should show loading skeleton when isLoading is true', () => {
    const { container } = renderWithProvider({
      data: [],
      title: 'Medal Table',
      isLoading: true,
    });

    // Should render skeleton rows
    const skeletonRows = container.querySelectorAll('.animate-pulse');
    expect(skeletonRows.length).toBeGreaterThan(0);
  });

  it('should show spinner in header when isLoading is true', () => {
    const { container } = renderWithProvider({
      data: [],
      title: 'Medal Table',
      isLoading: true,
    });

    // Should show spinner
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should not show skeleton when isLoading is false', () => {
    const { container } = renderWithProvider({
      data: [],
      title: 'Medal Table',
      isLoading: false,
    });

    // Should not render skeleton rows
    const skeletonRows = container.querySelectorAll('.animate-pulse');
    expect(skeletonRows.length).toBe(0);
  });

  it('should show data instead of skeleton when isLoading is false with data', () => {
    const mockData = [
      { name: 'USA', code: 'USA', gold: 50, silver: 30, bronze: 20, total: 100 },
    ];

    renderWithProvider({
      data: mockData,
      title: 'Medal Table',
      isLoading: false,
    });

    expect(screen.getByText('50')).toBeInTheDocument();
  });
});
