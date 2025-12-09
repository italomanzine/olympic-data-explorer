import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LanguageSelector from '../../../components/ui/LanguageSelector';
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

describe('LanguageSelector', () => {
  const renderWithProvider = () => {
    return render(
      <LanguageProvider>
        <LanguageSelector />
      </LanguageProvider>
    );
  };

  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
  });

  it('should render language button', () => {
    renderWithProvider();
    
    // Globe icon should be present (button with title)
    expect(screen.getByTitle('Mudar idioma')).toBeInTheDocument();
  });

  it('should open dropdown on click', async () => {
    const user = userEvent.setup();
    renderWithProvider();
    
    const button = screen.getByTitle('Mudar idioma');
    await user.click(button);

    expect(screen.getByText('Português')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Español')).toBeInTheDocument();
    expect(screen.getByText('Français')).toBeInTheDocument();
    expect(screen.getByText('中文')).toBeInTheDocument();
  });

  it('should close dropdown when clicking outside', async () => {
    const user = userEvent.setup();
    render(
      <LanguageProvider>
        <div>
          <LanguageSelector />
          <button>Outside</button>
        </div>
      </LanguageProvider>
    );
    
    const langButton = screen.getByTitle('Mudar idioma');
    await user.click(langButton);
    
    expect(screen.getByText('English')).toBeInTheDocument();
    
    await user.click(screen.getByText('Outside'));
    
    await waitFor(() => {
      expect(screen.queryByText('English')).not.toBeInTheDocument();
    });
  });

  it('should change language when option clicked', async () => {
    const user = userEvent.setup();
    renderWithProvider();
    
    const button = screen.getByTitle('Mudar idioma');
    await user.click(button);

    const englishOption = screen.getByText('English');
    await user.click(englishOption);

    expect(localStorageMock.setItem).toHaveBeenCalledWith('olympic-lang', 'en');
  });

  it('should show all language flags', async () => {
    const user = userEvent.setup();
    renderWithProvider();
    
    const button = screen.getByTitle('Mudar idioma');
    await user.click(button);

    expect(screen.getByText('🇧🇷')).toBeInTheDocument();
    expect(screen.getByText('🇺🇸')).toBeInTheDocument();
    expect(screen.getByText('🇪🇸')).toBeInTheDocument();
    expect(screen.getByText('🇫🇷')).toBeInTheDocument();
    expect(screen.getByText('🇨🇳')).toBeInTheDocument();
  });

  it('should highlight current language', async () => {
    const user = userEvent.setup();
    renderWithProvider();
    
    const button = screen.getByTitle('Mudar idioma');
    await user.click(button);

    const ptOption = screen.getByText('Português').closest('button');
    expect(ptOption).toHaveClass('text-olympic-blue');
    expect(ptOption).toHaveClass('font-bold');
  });

  it('should close dropdown after selecting language', async () => {
    const user = userEvent.setup();
    renderWithProvider();
    
    const button = screen.getByTitle('Mudar idioma');
    await user.click(button);

    const spanishOption = screen.getByText('Español');
    await user.click(spanishOption);

    await waitFor(() => {
      expect(screen.queryByText('Português')).not.toBeInTheDocument();
    });
  });
});
