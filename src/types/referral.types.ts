export interface Referral {
  id: string;
  created_at: string;
  user: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    referer_id: string | null;  // ID of the user who referred this user to join the app
  } | null;
  restaurant: {
    id: string;
    name: string;
    referer_id: string | null;  // ID of the user who referred this restaurant to join
  } | null;
}

export interface ReferralChain {
  userRefererId: string | null;     // User who referred the customer to join the app
  restaurantRefererId: string | null; // User who referred the restaurant to join
  visitRefererId: string | null;     // User who referred the customer to visit this restaurant
}