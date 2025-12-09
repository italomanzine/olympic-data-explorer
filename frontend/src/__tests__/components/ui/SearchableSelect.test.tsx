import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchableSelect from '../../../components/ui/SearchableSelect';

describe('SearchableSelect', () => {
  const mockOptions = [
    { value: 'usa', label: 'United States' },
    { value: 'bra', label: 'Brazil' },
    { value: 'gbr', label: 'Great Britain' },
    { value: 'ger', label: 'Germany' },
  ];

  it('should render with placeholder when no value selected', () => {
    render(
      <SearchableSelect
        options={mockOptions}
        value=""
        onChange={() => {}}
        placeholder="Select a country..."
      />
    );

    expect(screen.getByText('Select a country...')).toBeInTheDocument();
  });

  it('should display selected value label', () => {
    render(
      <SearchableSelect
        options={mockOptions}
        value="usa"
        onChange={() => {}}
      />
    );

    expect(screen.getByText('United States')).toBeInTheDocument();
  });

  it('should open dropdown on click', async () => {
    const user = userEvent.setup();
    render(
      <SearchableSelect
        options={mockOptions}
        value=""
        onChange={() => {}}
      />
    );

    const trigger = screen.getByText('Selecione...');
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Digite para buscar...')).toBeInTheDocument();
    });
  });

  it('should filter options based on search', async () => {
    const user = userEvent.setup();
    render(
      <SearchableSelect
        options={mockOptions}
        value=""
        onChange={() => {}}
      />
    );

    const trigger = screen.getByText('Selecione...');
    await user.click(trigger);

    const searchInput = screen.getByPlaceholderText('Digite para buscar...');
    await user.type(searchInput, 'Braz');

    expect(screen.getByText('Brazil')).toBeInTheDocument();
    expect(screen.queryByText('United States')).not.toBeInTheDocument();
  });

  it('should call onChange when option is selected', async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();
    
    render(
      <SearchableSelect
        options={mockOptions}
        value=""
        onChange={handleChange}
      />
    );

    const trigger = screen.getByText('Selecione...');
    await user.click(trigger);

    const option = await screen.findByText('Brazil');
    await user.click(option);

    expect(handleChange).toHaveBeenCalledWith('bra');
  });

  it('should show no results message when search has no matches', async () => {
    const user = userEvent.setup();
    render(
      <SearchableSelect
        options={mockOptions}
        value=""
        onChange={() => {}}
      />
    );

    const trigger = screen.getByText('Selecione...');
    await user.click(trigger);

    const searchInput = screen.getByPlaceholderText('Digite para buscar...');
    await user.type(searchInput, 'xyz');

    expect(screen.getByText('Nenhum resultado encontrado.')).toBeInTheDocument();
  });

  it('should close dropdown when clicking outside', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <SearchableSelect
          options={mockOptions}
          value=""
          onChange={() => {}}
        />
        <button>Outside</button>
      </div>
    );

    const trigger = screen.getByText('Selecione...');
    await user.click(trigger);

    expect(screen.getByPlaceholderText('Digite para buscar...')).toBeInTheDocument();

    await user.click(screen.getByText('Outside'));

    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Digite para buscar...')).not.toBeInTheDocument();
    });
  });

  it('should show check icon for selected option', async () => {
    const user = userEvent.setup();
    render(
      <SearchableSelect
        options={mockOptions}
        value="usa"
        onChange={() => {}}
      />
    );

    const trigger = screen.getByText('United States');
    await user.click(trigger);

    // Find the check icon (Check component from lucide-react)
    const checkIcon = document.querySelector('.lucide-check');
    expect(checkIcon).toBeInTheDocument();
    
    // Verify the selected option has the highlight class
    const selectedOption = checkIcon?.closest('div');
    expect(selectedOption).toHaveClass('bg-olympic-blue/10');
  });

  it('should render with custom icon', async () => {
    render(
      <SearchableSelect
        options={mockOptions}
        value=""
        onChange={() => {}}
        icon={<span data-testid="custom-icon">🌍</span>}
      />
    );

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('should toggle dropdown on multiple clicks', async () => {
    const user = userEvent.setup();
    render(
      <SearchableSelect
        options={mockOptions}
        value=""
        onChange={() => {}}
      />
    );

    const trigger = screen.getByText('Selecione...');
    
    // First click - open
    await user.click(trigger);
    expect(screen.getByPlaceholderText('Digite para buscar...')).toBeInTheDocument();

    // Second click - close
    await user.click(trigger);
    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Digite para buscar...')).not.toBeInTheDocument();
    });
  });
});
