import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageProvider, useLanguage } from '../../contexts/LanguageContext';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
  length: 0,
  key: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Test component to access context
function TestComponent() {
  const { language, setLanguage, t, tSport, tCountry } = useLanguage();
  return (
    <div>
      <span data-testid="language">{language}</span>
      <span data-testid="translated">{t('app_title')}</span>
      <span data-testid="sport">{tSport('Swimming')}</span>
      <span data-testid="country">{tCountry('USA')}</span>
      <button onClick={() => setLanguage('en')} data-testid="change-to-en">EN</button>
      <button onClick={() => setLanguage('es')} data-testid="change-to-es">ES</button>
    </div>
  );
}

describe('LanguageContext', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  it('should provide default language pt-BR', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    expect(screen.getByTestId('language')).toHaveTextContent('pt-BR');
    expect(screen.getByTestId('translated')).toHaveTextContent('Dashboard Olímpico');
  });

  it('should load saved language from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('en');
    
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    // Initially pt-BR, then useEffect changes to en
    expect(localStorageMock.getItem).toHaveBeenCalledWith('olympic-lang');
  });

  it('should change language and save to localStorage', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    const user = userEvent.setup();
    
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    await user.click(screen.getByTestId('change-to-en'));
    
    expect(screen.getByTestId('language')).toHaveTextContent('en');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('olympic-lang', 'en');
  });

  it('should translate sports in pt-BR', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    expect(screen.getByTestId('sport')).toHaveTextContent('Natação');
  });

  it('should return original sport name in English', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    const user = userEvent.setup();
    
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    await user.click(screen.getByTestId('change-to-en'));
    expect(screen.getByTestId('sport')).toHaveTextContent('Swimming');
  });

  it('should translate countries in pt-BR', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    expect(screen.getByTestId('country')).toHaveTextContent('Estados Unidos');
  });

  it('should return empty string for country in English', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    const user = userEvent.setup();
    
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    await user.click(screen.getByTestId('change-to-en'));
    expect(screen.getByTestId('country')).toHaveTextContent('');
  });

  it('should return key if translation not found', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    function TestMissingKey() {
      const { t } = useLanguage();
      return <span data-testid="missing">{t('non_existent_key')}</span>;
    }
    
    render(
      <LanguageProvider>
        <TestMissingKey />
      </LanguageProvider>
    );

    expect(screen.getByTestId('missing')).toHaveTextContent('non_existent_key');
  });

  it('should throw error when used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useLanguage must be used within a LanguageProvider');
    
    consoleSpy.mockRestore();
  });

  it('should handle sport translation for non-existent sport', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    function TestUnknownSport() {
      const { tSport } = useLanguage();
      return <span data-testid="unknown-sport">{tSport('UnknownSport')}</span>;
    }
    
    render(
      <LanguageProvider>
        <TestUnknownSport />
      </LanguageProvider>
    );

    expect(screen.getByTestId('unknown-sport')).toHaveTextContent('UnknownSport');
  });

  it('should handle country translation for non-existent country', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    function TestUnknownCountry() {
      const { tCountry } = useLanguage();
      return <span data-testid="unknown-country">{tCountry('XYZ')}</span>;
    }
    
    render(
      <LanguageProvider>
        <TestUnknownCountry />
      </LanguageProvider>
    );

    expect(screen.getByTestId('unknown-country')).toHaveTextContent('');
  });

  it('should change to Spanish', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    const user = userEvent.setup();
    
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    await user.click(screen.getByTestId('change-to-es'));
    
    expect(screen.getByTestId('language')).toHaveTextContent('es');
    expect(screen.getByTestId('translated')).toHaveTextContent('Tablero Olímpico');
  });
});
