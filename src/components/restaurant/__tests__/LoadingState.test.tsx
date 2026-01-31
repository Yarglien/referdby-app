import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@/test/setup';
import { LoadingState } from '../LoadingState';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoadingState', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders loading message', () => {
    render(<LoadingState />);
    
    expect(screen.getByText('Loading amenities...')).toBeInTheDocument();
  });

  it('renders page title', () => {
    render(<LoadingState />);
    
    expect(screen.getByText('Restaurant Amenities')).toBeInTheDocument();
  });

  it('renders loading spinner', () => {
    render(<LoadingState />);
    
    // Check for loading spinner by looking for the Loader icon
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('renders back button', () => {
    render(<LoadingState />);
    
    const backButton = screen.getByRole('button');
    expect(backButton).toBeInTheDocument();
  });

  it('navigates to restaurant manager when back button is clicked', () => {
    render(<LoadingState />);
    
    const backButton = screen.getByRole('button');
    fireEvent.click(backButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/restaurant-manager');
  });

  it('has proper styling classes', () => {
    render(<LoadingState />);
    
    const container = screen.getByText('Loading amenities...').closest('.min-h-screen');
    expect(container).toHaveClass('bg-background');
  });
});