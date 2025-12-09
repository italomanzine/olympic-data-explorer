import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AthleteProfileCard from '../../components/AthleteProfileCard';
import { LanguageProvider } from '../../contexts/LanguageContext';
import { AthleteProfile } from '../../lib/api';

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

describe('AthleteProfileCard', () => {
  const mockProfile: AthleteProfile = {
    id: 1,
    name: 'Michael Phelps',
    sex: 'M',
    noc: 'USA',
    team: 'United States',
    height: 193,
    weight: 88,
    age_range: { min: 15, max: 31 },
    sports: ['Swimming'],
    years: [2000, 2004, 2008, 2012, 2016],
    medals: {
      gold: 23,
      silver: 3,
      bronze: 2,
      total: 28,
    },
    participations: [
      {
        year: 2016,
        season: 'Summer',
        city: 'Rio de Janeiro',
        sport: 'Swimming',
        event: '100m Butterfly',
        medal: 'Gold',
      },
    ],
  };

  const renderWithProvider = (props: { profile: AthleteProfile; onClose: jest.Mock }) => {
    return render(
      <LanguageProvider>
        <AthleteProfileCard {...props} />
      </LanguageProvider>
    );
  };

  it('should render athlete name', () => {
    renderWithProvider({ profile: mockProfile, onClose: jest.fn() });

    expect(screen.getByText('Michael Phelps')).toBeInTheDocument();
  });

  it('should render country info', () => {
    renderWithProvider({ profile: mockProfile, onClose: jest.fn() });

    expect(screen.getByText(/Estados Unidos/)).toBeInTheDocument();
    expect(screen.getByText(/USA/)).toBeInTheDocument();
  });

  it('should render medal counts', () => {
    renderWithProvider({ profile: mockProfile, onClose: jest.fn() });

    expect(screen.getByText('23')).toBeInTheDocument(); // Gold
    expect(screen.getByText('3')).toBeInTheDocument(); // Silver
    expect(screen.getByText('2')).toBeInTheDocument(); // Bronze
  });

  it('should render biometrics when available', () => {
    renderWithProvider({ profile: mockProfile, onClose: jest.fn() });

    expect(screen.getByText('193 cm')).toBeInTheDocument();
    expect(screen.getByText('88 kg')).toBeInTheDocument();
  });

  it('should not render height when null', () => {
    const profileWithoutHeight = { ...mockProfile, height: null };
    renderWithProvider({ profile: profileWithoutHeight, onClose: jest.fn() });

    expect(screen.queryByText(/cm/)).not.toBeInTheDocument();
  });

  it('should not render weight when null', () => {
    const profileWithoutWeight = { ...mockProfile, weight: null };
    renderWithProvider({ profile: profileWithoutWeight, onClose: jest.fn() });

    expect(screen.queryByText(/kg/)).not.toBeInTheDocument();
  });

  it('should render years range', () => {
    renderWithProvider({ profile: mockProfile, onClose: jest.fn() });

    expect(screen.getByText('2000 - 2016')).toBeInTheDocument();
  });

  it('should call onClose when close button clicked', async () => {
    const handleClose = jest.fn();
    const user = userEvent.setup();
    
    renderWithProvider({ profile: mockProfile, onClose: handleClose });

    const closeButton = screen.getByRole('button');
    await user.click(closeButton);

    expect(handleClose).toHaveBeenCalled();
  });

  it('should render sports', () => {
    renderWithProvider({ profile: mockProfile, onClose: jest.fn() });

    expect(screen.getByText('Natação')).toBeInTheDocument();
  });

  it('should render multiple sports', () => {
    const multiSportProfile = {
      ...mockProfile,
      sports: ['Swimming', 'Athletics'],
    };
    renderWithProvider({ profile: multiSportProfile, onClose: jest.fn() });

    expect(screen.getByText('Natação')).toBeInTheDocument();
    expect(screen.getByText('Atletismo')).toBeInTheDocument();
  });

  it('should render total medals in header', () => {
    renderWithProvider({ profile: mockProfile, onClose: jest.fn() });

    // Total appears multiple times
    const totalElements = screen.getAllByText('28');
    expect(totalElements.length).toBeGreaterThan(0);
  });

  it('should render participation with Silver medal', () => {
    const profileWithSilver = {
      ...mockProfile,
      participations: [
        {
          year: 2016,
          season: 'Summer',
          city: 'Rio de Janeiro',
          sport: 'Swimming',
          event: '100m Freestyle',
          medal: 'Silver',
        },
      ],
    };
    
    renderWithProvider({ profile: profileWithSilver, onClose: jest.fn() });

    expect(screen.getByText('100m Freestyle')).toBeInTheDocument();
    // There may be multiple 'Prata' texts (header and badge)
    const prataElements = screen.getAllByText(/prata/i);
    expect(prataElements.length).toBeGreaterThan(0);
  });

  it('should render participation with Bronze medal', () => {
    const profileWithBronze = {
      ...mockProfile,
      participations: [
        {
          year: 2016,
          season: 'Summer',
          city: 'Rio de Janeiro',
          sport: 'Swimming',
          event: '200m Medley',
          medal: 'Bronze',
        },
      ],
    };
    
    renderWithProvider({ profile: profileWithBronze, onClose: jest.fn() });

    expect(screen.getByText('200m Medley')).toBeInTheDocument();
    // There may be multiple 'Bronze' texts
    const bronzeElements = screen.getAllByText(/bronze/i);
    expect(bronzeElements.length).toBeGreaterThan(0);
  });

  it('should render participation without medal', () => {
    const profileWithoutMedal = {
      ...mockProfile,
      participations: [
        {
          year: 2016,
          season: 'Summer',
          city: 'Rio de Janeiro',
          sport: 'Swimming',
          event: '50m Sprint',
          medal: null,
        },
      ],
    };
    
    renderWithProvider({ profile: profileWithoutMedal, onClose: jest.fn() });

    expect(screen.getByText('50m Sprint')).toBeInTheDocument();
  });

  it('should render female athlete', () => {
    const femaleProfile = {
      ...mockProfile,
      name: 'Simone Biles',
      sex: 'F',
      sports: ['Gymnastics'],
    };
    
    renderWithProvider({ profile: femaleProfile, onClose: jest.fn() });

    expect(screen.getByText('Simone Biles')).toBeInTheDocument();
  });
});
