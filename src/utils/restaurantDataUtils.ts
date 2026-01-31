
import { RestaurantDetailsForm, RestaurantData } from "@/types/restaurant.types";
import { constructAddress } from "./addressUtils";

export const transformFormDataToRestaurantData = (
  data: RestaurantDetailsForm,
  userId: string,
  restaurantId?: string,
  userRefererId?: string
): RestaurantData => {
  console.log('=== TRANSFORMATION START ===');
  console.log('Input form data:', data);
  console.log('Currency from input:', data.currency);
  console.log('Currency type:', typeof data.currency);
  console.log('Photos from input:', data.photos);
  console.log('Number of photos in input:', data.photos?.length || 0);
  console.log('Input GPS coordinates:', { latitude: data.latitude, longitude: data.longitude });
  console.log('Input opening hours:', data.opening_hours_schedule);
  console.log('Input opening hours length:', data.opening_hours_schedule?.length || 0);
  
  const transformedData = {
    name: data.restaurantName,
    street_number: data.street_number,
    street_name: data.street_name,
    county_region: data.county_region,
    state: data.state,
    country: data.country,
    postal_code: data.postal_code,
    cuisine_type: data.cuisine_type,
    description: data.description,
    telephone: data.telephoneNumber,
    website: data.website,
    currency: data.currency,
    address: constructAddress(data),
    manager_id: userId,
    referer_id: userRefererId,
    referral_count: restaurantId ? undefined : 0,
    photos: data.photos || [],
    // Include GPS coordinates (ensure empty strings become null)
    latitude: data.latitude || null,
    longitude: data.longitude || null,
    plus_code: data.plus_code || null,
    // Include opening hours and schedules
    opening_hours_schedule: data.opening_hours_schedule || [],
    redemption_schedule: data.redemption_schedule || [],
    timezone: data.timezone
  };
  
  console.log('Transformed data:', transformedData);
  console.log('Output currency:', transformedData.currency);
  console.log('Output photos:', transformedData.photos);
  console.log('Number of photos in output:', transformedData.photos?.length || 0);
  console.log('GPS coordinates:', { latitude: transformedData.latitude, longitude: transformedData.longitude });
  console.log('Opening hours schedule:', transformedData.opening_hours_schedule);
  console.log('Number of opening hours:', transformedData.opening_hours_schedule?.length || 0);
  console.log('=== TRANSFORMATION END ===');
  return transformedData;
};
