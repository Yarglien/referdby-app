import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@/test/setup';
import { RestaurantHeader } from '../RestaurantHeader';

describe('RestaurantHeader', () => {
  it('renders restaurant name when provided', () => {
    render(
      <RestaurantHeader 
        restaurantName="Test Restaurant" 
        restaurantPhoto="https://example.com/photo.jpg" 
      />
    );
    
    expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
  });

  it('renders placeholder text when no restaurant name provided', () => {
    render(<RestaurantHeader />);
    
    expect(screen.getByText('No restaurant configured yet')).toBeInTheDocument();
  });

  it('renders restaurant photo when provided', () => {
    render(
      <RestaurantHeader 
        restaurantName="Test Restaurant" 
        restaurantPhoto="https://example.com/photo.jpg" 
      />
    );
    
    const image = screen.getByAltText('Test Restaurant');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/photo.jpg');
  });

  it('renders Utensils icon when no photo provided', () => {
    render(<RestaurantHeader restaurantName="Test Restaurant" />);
    
    // The icon should be present in the DOM
    const iconContainer = screen.getByRole('img', { hidden: true });
    expect(iconContainer).toBeInTheDocument();
  });

  it('handles image load error gracefully', () => {
    render(
      <RestaurantHeader 
        restaurantName="Test Restaurant" 
        restaurantPhoto="https://invalid-url.com/photo.jpg" 
      />
    );
    
    const image = screen.getByAltText('Test Restaurant');
    
    // Simulate image load error
    image.dispatchEvent(new Event('error'));
    
    expect(image).toHaveAttribute('src', '/placeholder.svg');
  });
});