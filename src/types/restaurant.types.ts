
export interface RestaurantDetailsForm {
  restaurantName: string;
  street_number: string;
  street_name: string;
  county_region: string;
  state: string;
  country: string;
  postal_code: string;
  cuisine_type: string;
  description: string;
  telephoneNumber: string;
  website: string;
  currency: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  plus_code?: string;
  opening_hours_schedule?: any;
  redemption_schedule?: any;
  timezone?: string;
  photos?: string[];
}

export interface RestaurantData {
  name: string;
  street_number: string;
  street_name: string;
  county_region: string;
  state: string;
  country: string;
  postal_code: string;
  cuisine_type: string;
  description: string;
  telephone: string;
  website: string;
  currency: string;
  address: string;
  manager_id: string;
  referral_count?: number;
  latitude?: number;
  longitude?: number;
  opening_hours_schedule?: any;
  redemption_schedule?: any;
  timezone?: string;
  photos?: string[];
  is_published?: boolean;
  published_at?: string;
}
