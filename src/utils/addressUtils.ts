
import { RestaurantDetailsForm } from "@/types/restaurant.types";

export const constructAddress = (data: RestaurantDetailsForm): string => {
  return `${data.street_number} ${data.street_name}, ${data.county_region}, ${data.state} ${data.postal_code}, ${data.country}`;
};
