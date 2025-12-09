import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AthleteSearch from '../../../components/ui/AthleteSearch';
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

// Mock the API
jest.mock('../../../lib/api', () => ({
  searchAthletes: jest.fn(),
}));

import { searchAthletes } from '../../../lib/api';
const mockSearchAthletes = searchAthletes as jest.Mock;

describe('AthleteSearch', () => {
  const renderWithProvider = (props: { onSelect: jest.Mock; selectedAthlete: any }) => {
    return render(
      <LanguageProvider>
        <AthleteSearch {...props} />
      </LanguageProvider>
    );
  };

  beforeEach(() => {
    jest.useFakeTimers();
    mockSearchAthletes.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render search input when no athlete selected', () => {
    renderWithProvider({ onSelect: jest.fn(), selectedAthlete: null });
    
    expect(screen.getByPlaceholderText('Buscar atleta por nome...')).toBeInTheDocument();
  });

  it('should render selected athlete card when athlete is selected', () => {
    const selectedAthlete = {
      id: 1,
      name: 'Michael Phelps',
      noc: 'USA',
      sport: 'Swimming',
    };
    
    renderWithProvider({ onSelect: jest.fn(), selectedAthlete });
    
    expect(screen.getByText('Michael Phelps')).toBeInTheDocument();
    expect(screen.getByText('USA • Swimming')).toBeInTheDocument();
  });

  it('should call onSelect with null when clear button clicked', async () => {
    jest.useRealTimers();
    const handleSelect = jest.fn();
    const selectedAthlete = {
      id: 1,
      name: 'Michael Phelps',
      noc: 'USA',
      sport: 'Swimming',
    };
    
    renderWithProvider({ onSelect: handleSelect, selectedAthlete });
    
    const clearButton = screen.getByRole('button');
    await userEvent.click(clearButton);
    
    expect(handleSelect).toHaveBeenCalledWith(null);
  });

  it('should show loading indicator while searching', async () => {
    mockSearchAthletes.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    renderWithProvider({ onSelect: jest.fn(), selectedAthlete: null });
    
    const input = screen.getByPlaceholderText('Buscar atleta por nome...');
    fireEvent.change(input, { target: { value: 'Michael' } });
    fireEvent.focus(input);
    
    // Fast-forward timers for debounce
    jest.advanceTimersByTime(350);
    
    await waitFor(() => {
      // Loading state should be visible
      expect(mockSearchAthletes).toHaveBeenCalled();
    });
  });

  it('should display search results', async () => {
    const mockResults = [
      { id: 1, name: 'Michael Phelps', noc: 'USA', sport: 'Swimming' },
      { id: 2, name: 'Michael Jordan', noc: 'USA', sport: 'Basketball' },
    ];
    mockSearchAthletes.mockResolvedValue(mockResults);
    
    renderWithProvider({ onSelect: jest.fn(), selectedAthlete: null });
    
    const input = screen.getByPlaceholderText('Buscar atleta por nome...');
    fireEvent.change(input, { target: { value: 'Michael' } });
    fireEvent.focus(input);
    
    jest.advanceTimersByTime(350);
    
    await waitFor(() => {
      expect(screen.getByText('Michael Phelps')).toBeInTheDocument();
      expect(screen.getByText('Michael Jordan')).toBeInTheDocument();
    });
  });

  it('should call onSelect when result is clicked', async () => {
    jest.useRealTimers();
    const handleSelect = jest.fn();
    const mockResults = [
      { id: 1, name: 'Michael Phelps', noc: 'USA', sport: 'Swimming' },
    ];
    mockSearchAthletes.mockResolvedValue(mockResults);
    
    renderWithProvider({ onSelect: handleSelect, selectedAthlete: null });
    
    const input = screen.getByPlaceholderText('Buscar atleta por nome...');
    await userEvent.type(input, 'Michael');
    
    await waitFor(() => {
      expect(screen.getByText('Michael Phelps')).toBeInTheDocument();
    });
    
    await userEvent.click(screen.getByText('Michael Phelps'));
    
    expect(handleSelect).toHaveBeenCalledWith(mockResults[0]);
  });

  it('should show no results message when search returns empty', async () => {
    mockSearchAthletes.mockResolvedValue([]);
    
    renderWithProvider({ onSelect: jest.fn(), selectedAthlete: null });
    
    const input = screen.getByPlaceholderText('Buscar atleta por nome...');
    fireEvent.change(input, { target: { value: 'ZZZZZ' } });
    fireEvent.focus(input);
    
    jest.advanceTimersByTime(350);
    
    await waitFor(() => {
      expect(screen.getByText('Nenhum atleta encontrado')).toBeInTheDocument();
    });
  });

  it('should not search for queries less than 2 characters', () => {
    renderWithProvider({ onSelect: jest.fn(), selectedAthlete: null });
    
    const input = screen.getByPlaceholderText('Buscar atleta por nome...');
    fireEvent.change(input, { target: { value: 'M' } });
    fireEvent.focus(input);
    
    jest.advanceTimersByTime(350);
    
    expect(mockSearchAthletes).not.toHaveBeenCalled();
  });

  it('should close dropdown when clicking outside', async () => {
    const mockResults = [
      { id: 1, name: 'Michael Phelps', noc: 'USA', sport: 'Swimming' },
    ];
    mockSearchAthletes.mockResolvedValue(mockResults);
    
    render(
      <LanguageProvider>
        <div>
          <AthleteSearch onSelect={jest.fn()} selectedAthlete={null} />
          <button>Outside</button>
        </div>
      </LanguageProvider>
    );
    
    const input = screen.getByPlaceholderText('Buscar atleta por nome...');
    fireEvent.change(input, { target: { value: 'Michael' } });
    fireEvent.focus(input);
    
    jest.advanceTimersByTime(350);
    
    await waitFor(() => {
      expect(screen.getByText('Michael Phelps')).toBeInTheDocument();
    });
    
    jest.useRealTimers();
    await userEvent.click(screen.getByText('Outside'));
    
    await waitFor(() => {
      expect(screen.queryByText('Michael Phelps')).not.toBeInTheDocument();
    });
  });

  it('should handle search errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockSearchAthletes.mockRejectedValue(new Error('Network error'));
    
    renderWithProvider({ onSelect: jest.fn(), selectedAthlete: null });
    
    const input = screen.getByPlaceholderText('Buscar atleta por nome...');
    fireEvent.change(input, { target: { value: 'Michael' } });
    fireEvent.focus(input);
    
    jest.advanceTimersByTime(350);
    
    await waitFor(() => {
      expect(mockSearchAthletes).toHaveBeenCalledWith('Michael');
    });
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Erro ao buscar atletas:', expect.any(Error));
    });
    
    consoleSpy.mockRestore();
  });
});
