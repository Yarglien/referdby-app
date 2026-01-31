import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@/test/setup';
import { RestaurantLocation } from '../RestaurantLocation';

describe('RestaurantLocation', () => {
  const defaultProps = {
    address: '123 Main Street, City, State 12345',
    distance: 2.5,
    referral_count: 10,
  };

  it('renders address correctly', () => {
    render(<RestaurantLocation {...defaultProps} />);
    
    expect(screen.getByText('123 Main Street, City, State 12345')).toBeInTheDocument();
  });

  it('renders distance with proper formatting', () => {
    render(<RestaurantLocation {...defaultProps} />);
    
    expect(screen.getByText('2.5 miles away')).toBeInTheDocument();
  });

  it('formats distance to one decimal place', () => {
    render(<RestaurantLocation {...defaultProps} distance={3.333} />);
    
    expect(screen.getByText('3.3 miles away')).toBeInTheDocument();
  });

  it('handles zero distance', () => {
    render(<RestaurantLocation {...defaultProps} distance={0} />);
    
    expect(screen.getByText('0.0 miles away')).toBeInTheDocument();
  });

  it('handles long addresses', () => {
    const longAddress = 'A very long restaurant address that might span multiple lines in the UI';
    render(<RestaurantLocation {...defaultProps} address={longAddress} />);
    
    expect(screen.getByText(longAddress)).toBeInTheDocument();
  });
});