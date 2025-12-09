import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChartModal, { MaximizeButton } from '../../../components/ui/ChartModal';

describe('ChartModal', () => {
  it('should not render when isOpen is false', () => {
    render(
      <ChartModal
        isOpen={false}
        onClose={() => {}}
        title="Test Modal"
      >
        <div>Modal content</div>
      </ChartModal>
    );

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(
      <ChartModal
        isOpen={true}
        onClose={() => {}}
        title="Test Modal"
      >
        <div>Modal content</div>
      </ChartModal>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('should display subtitle when provided', () => {
    render(
      <ChartModal
        isOpen={true}
        onClose={() => {}}
        title="Test Modal"
        subtitle="Test subtitle"
      >
        <div>Modal content</div>
      </ChartModal>
    );

    expect(screen.getByText('Test subtitle')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    const handleClose = jest.fn();
    const user = userEvent.setup();
    
    render(
      <ChartModal
        isOpen={true}
        onClose={handleClose}
        title="Test Modal"
      >
        <div>Modal content</div>
      </ChartModal>
    );

    const closeButton = screen.getByTitle('Fechar (ESC)');
    await user.click(closeButton);

    expect(handleClose).toHaveBeenCalled();
  });

  it('should call onClose when ESC key is pressed', () => {
    const handleClose = jest.fn();
    
    render(
      <ChartModal
        isOpen={true}
        onClose={handleClose}
        title="Test Modal"
      >
        <div>Modal content</div>
      </ChartModal>
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(handleClose).toHaveBeenCalled();
  });

  it('should call onClose when overlay is clicked', async () => {
    const handleClose = jest.fn();
    const user = userEvent.setup();
    
    render(
      <ChartModal
        isOpen={true}
        onClose={handleClose}
        title="Test Modal"
      >
        <div>Modal content</div>
      </ChartModal>
    );

    // Click on overlay (the backdrop)
    const overlay = screen.getByText('Test Modal').closest('.fixed');
    if (overlay) {
      await user.click(overlay);
      expect(handleClose).toHaveBeenCalled();
    }
  });

  it('should not close when modal content is clicked', async () => {
    const handleClose = jest.fn();
    const user = userEvent.setup();
    
    render(
      <ChartModal
        isOpen={true}
        onClose={handleClose}
        title="Test Modal"
      >
        <div>Modal content</div>
      </ChartModal>
    );

    await user.click(screen.getByText('Modal content'));

    // onClose should not have been called (stopPropagation)
    expect(handleClose).toHaveBeenCalledTimes(0);
  });

  it('should show ESC hint in footer', () => {
    render(
      <ChartModal
        isOpen={true}
        onClose={() => {}}
        title="Test Modal"
      >
        <div>Modal content</div>
      </ChartModal>
    );

    expect(screen.getByText('ESC')).toBeInTheDocument();
  });

  it('should set body overflow to hidden when open', () => {
    render(
      <ChartModal
        isOpen={true}
        onClose={() => {}}
        title="Test Modal"
      >
        <div>Modal content</div>
      </ChartModal>
    );

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should restore body overflow when closed', () => {
    const { rerender } = render(
      <ChartModal
        isOpen={true}
        onClose={() => {}}
        title="Test Modal"
      >
        <div>Modal content</div>
      </ChartModal>
    );

    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <ChartModal
        isOpen={false}
        onClose={() => {}}
        title="Test Modal"
      >
        <div>Modal content</div>
      </ChartModal>
    );

    expect(document.body.style.overflow).toBe('');
  });
});

describe('MaximizeButton', () => {
  it('should render with default label', () => {
    render(<MaximizeButton onClick={() => {}} />);

    expect(screen.getByTitle('Expandir gráfico')).toBeInTheDocument();
  });

  it('should render with custom label', () => {
    render(<MaximizeButton onClick={() => {}} label="Expand" />);

    expect(screen.getByTitle('Expand')).toBeInTheDocument();
    expect(screen.getByText('Expand')).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    
    render(<MaximizeButton onClick={handleClick} />);

    const button = screen.getByTitle('Expandir gráfico');
    await user.click(button);

    expect(handleClick).toHaveBeenCalled();
  });
});
