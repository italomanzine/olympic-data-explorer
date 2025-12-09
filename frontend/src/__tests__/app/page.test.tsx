import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../../app/page';
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

// Mock Dashboard to avoid complex dependencies
jest.mock('../../components/Dashboard', () => {
  return function MockDashboard() {
    return <div data-testid="mock-dashboard">Dashboard</div>;
  };
});

describe('Home Page', () => {
  it('should render Dashboard component', () => {
    render(
      <LanguageProvider>
        <Home />
      </LanguageProvider>
    );

    expect(screen.getByTestId('mock-dashboard')).toBeInTheDocument();
  });
});
