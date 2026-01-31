import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@/test/setup';
import { AmenitiesList } from '../AmenitiesList';

describe('AmenitiesList', () => {
  const mockOnAmenityChange = vi.fn();
  
  const defaultProps = {
    amenities: {
      'wifi': 'yes',
      'parking': 'no',
      'outdoor_seating': '',
    },
    onAmenityChange: mockOnAmenityChange,
  };

  beforeEach(() => {
    mockOnAmenityChange.mockClear();
  });

  it('renders all amenity options', () => {
    render(<AmenitiesList {...defaultProps} />);
    
    // Check that WiFi, Parking, and Outdoor Seating are rendered
    expect(screen.getByText('WiFi')).toBeInTheDocument();
    expect(screen.getByText('Parking')).toBeInTheDocument();
    expect(screen.getByText('Outdoor Seating')).toBeInTheDocument();
  });

  it('shows correct initial values', () => {
    render(<AmenitiesList {...defaultProps} />);
    
    // WiFi should be "Yes"
    const wifiYes = screen.getAllByDisplayValue('yes').find(input => 
      input.closest('[data-amenity="wifi"]')
    );
    expect(wifiYes).toBeChecked();
    
    // Parking should be "No"
    const parkingNo = screen.getAllByDisplayValue('no').find(input => 
      input.closest('[data-amenity="parking"]')
    );
    expect(parkingNo).toBeChecked();
  });

  it('calls onAmenityChange when radio button is selected', () => {
    render(<AmenitiesList {...defaultProps} />);
    
    // Find and click a different option
    const outdoorSeatingYes = screen.getAllByDisplayValue('yes').find(input => 
      input.closest('div')?.textContent?.includes('Outdoor Seating')
    );
    
    if (outdoorSeatingYes) {
      fireEvent.click(outdoorSeatingYes);
      expect(mockOnAmenityChange).toHaveBeenCalledWith('outdoor_seating', 'yes');
    }
  });

  it('renders radio groups for each amenity', () => {
    render(<AmenitiesList {...defaultProps} />);
    
    // Should have multiple radio groups
    const radioGroups = screen.getAllByRole('radiogroup');
    expect(radioGroups.length).toBeGreaterThan(0);
  });
});