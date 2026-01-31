import { ActivityType } from './enums.types';

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | { [key: string]: JsonValue } | JsonValue[];

export interface JsonObject {
  [key: string]: JsonValue;
}

export interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  name: string | null;
  photo: string | null;
  language_preference?: string | null;
}

export interface Restaurant {
  id: string;
  name: string;
  referer_id?: string | null;
  photos?: string[] | null;
  currency?: string | null;
}

export interface Schedule extends JsonObject {
  day_of_week: string;
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
}

export interface ActivityPointsDistribution {
  customer_points: number;
  referrer_points: number;
  restaurant_recruiter_points: number;
  app_referrer_points: number;
  restaurant_deduction: number;
}

export interface ActivityBase {
  id: string;
  created_at: string;
  description: string;
  type: ActivityType;
  activity_type?: 'meal_purchase' | 'referral_used' | 'restaurant_recruited' | 'app_referral_used' | 'roll_token_generated' | 'roll_token_processed';
  is_active: boolean | null;
  amount_spent: number | null;
  receipt_photo: string | null;
  processed_by_id: string | null;
  scanned_at: string | null;
  scanner_id: string | null;
  points_redeemed: number;
  expires_at?: string | null;
  processed_outside_hours?: boolean | null;
  initial_points_balance?: number | null;
  referral_id?: string | null;
}

export interface Activity extends ActivityBase, ActivityPointsDistribution {
  user_id: string;
  related_user_id: string | null;
  restaurant_id: string | null;
  restaurant_referrer_id: string | null;
  user_referrer_id: UserProfile | null;
  app_referrer_id: string | null;
  restaurant?: Restaurant | null;
  user?: Partial<UserProfile> | null;
  processed_by?: Partial<UserProfile> | null;
  scanner?: Partial<UserProfile> | null;
}

export interface PointsDistributionEntry extends JsonObject {
  user_id: string;
  roles: string[];
  points: number;
  initial_balance: number;
}

export interface Token {
  id: string;
  created_at: string;
  created_by: string;
  restaurant_id: string;
  expires_at: string;
  is_active: boolean;
  processed_at: string | null;
  processed_by: string | null;
  user_scanned_at: string | null;
  user_scanned_by: string | null;
  restaurant_scanned_at: string | null;
  restaurant_scanned_by: string | null;
  token_state: string;
  used_at: string | null;
  scanned_by_profile?: Partial<UserProfile> | null;
}

export type DaySchedule = Schedule;
