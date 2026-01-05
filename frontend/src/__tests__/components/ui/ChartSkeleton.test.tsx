import React from 'react';
import { render, screen } from '@testing-library/react';
import ChartSkeletonLoader, { 
  MapSkeleton, 
  LineSkeleton, 
  PieSkeleton, 
  BarSkeleton, 
  TableSkeleton 
} from '../../../components/ui/ChartSkeleton';

describe('ChartSkeletonLoader', () => {
  it('should render map skeleton variant', () => {
    const { container } = render(<ChartSkeletonLoader variant="map" />);
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('should render chart skeleton variant', () => {
    const { container } = render(<ChartSkeletonLoader variant="chart" />);
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('should render pie skeleton variant', () => {
    const { container } = render(<ChartSkeletonLoader variant="pie" />);
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('should render bar skeleton variant', () => {
    const { container } = render(<ChartSkeletonLoader variant="bar" />);
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('should render table skeleton variant', () => {
    const { container } = render(<ChartSkeletonLoader variant="table" />);
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('should render default chart skeleton when no variant specified', () => {
    const { container } = render(<ChartSkeletonLoader />);
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('should display message when provided', () => {
    render(<ChartSkeletonLoader message="Carregando dados..." />);
    expect(screen.getByText('Carregando dados...')).toBeInTheDocument();
  });

  it('should not display message when not provided', () => {
    render(<ChartSkeletonLoader />);
    expect(screen.queryByText('Carregando dados...')).not.toBeInTheDocument();
  });

  it('should render spinner with message', () => {
    const { container } = render(<ChartSkeletonLoader message="Conectando..." />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });
});

describe('Individual Skeleton Components', () => {
  it('should render MapSkeleton', () => {
    const { container } = render(<MapSkeleton />);
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('should render LineSkeleton', () => {
    const { container } = render(<LineSkeleton />);
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('should render PieSkeleton', () => {
    const { container } = render(<PieSkeleton />);
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('should render BarSkeleton', () => {
    const { container } = render(<BarSkeleton />);
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('should render TableSkeleton', () => {
    const { container } = render(<TableSkeleton />);
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('should render multiple skeleton elements in MapSkeleton', () => {
    const { container } = render(<MapSkeleton />);
    const skeletonElements = container.querySelectorAll('.bg-slate-200');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('should render bar elements in BarSkeleton', () => {
    const { container } = render(<BarSkeleton />);
    const barElements = container.querySelectorAll('.bg-slate-200');
    expect(barElements.length).toBe(20); // 10 labels + 10 bars
  });

  it('should render pie circle in PieSkeleton', () => {
    const { container } = render(<PieSkeleton />);
    const circleElement = container.querySelector('.rounded-full');
    expect(circleElement).toBeInTheDocument();
  });

  it('should render header row in TableSkeleton', () => {
    const { container } = render(<TableSkeleton />);
    const headerRow = container.querySelector('.border-b');
    expect(headerRow).toBeInTheDocument();
  });
});

