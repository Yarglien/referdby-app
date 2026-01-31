import { ActivityType } from './enums.types';

export interface ActivityRow {
  amount_spent: number | null;
  created_at: string;
  description: string;
  id: string;
  is_active: boolean | null;
  points_redeemed: number;
  processed_by_id: string | null;
  receipt_photo: string | null;
  related_user_id: string | null;
  restaurant_id: string | null;
  restaurant_referrer_id: string | null;
  type: ActivityType;
  user_id: string;
  user_referrer_id: string | null;
  expires_at: string | null;
  customer_points: number;
  referrer_points: number;
  restaurant_recruiter_points: number;
  app_referrer_points: number;
  restaurant_deduction: number;
  initial_points_balance: number | null;
  referral_id: string | null;
  processed_outside_hours: boolean | null;
}

export interface ActivityInsert {
  amount_spent?: number | null;
  created_at?: string;
  description: string;
  id?: string;
  is_active?: boolean | null;
  points_redeemed?: number;
  processed_by_id?: string | null;
  receipt_photo?: string | null;
  related_user_id?: string | null;
  restaurant_id?: string | null;
  restaurant_referrer_id?: string | null;
  type: ActivityType;
  user_id: string;
  user_referrer_id?: string | null;
  expires_at?: string | null;
  customer_points?: number;
  referrer_points?: number;
  restaurant_recruiter_points?: number;
  app_referrer_points?: number;
  restaurant_deduction?: number;
  initial_points_balance?: number | null;
  referral_id?: string | null;
  processed_outside_hours?: boolean | null;
}

export interface ActivityUpdate {
  amount_spent?: number | null;
  created_at?: string;
  description?: string;
  id?: string;
  is_active?: boolean | null;
  points_redeemed?: number;
  processed_by_id?: string | null;
  receipt_photo?: string | null;
  related_user_id?: string | null;
  restaurant_id?: string | null;
  restaurant_referrer_id?: string | null;
  type?: ActivityType;
  user_id?: string;
  user_referrer_id?: string | null;
  expires_at?: string | null;
  customer_points?: number;
  referrer_points?: number;
  restaurant_recruiter_points?: number;
  app_referrer_points?: number;
  restaurant_deduction?: number;
  initial_points_balance?: number | null;
  referral_id?: string | null;
  processed_outside_hours?: boolean | null;
}

export interface ActivityRelationships {
  foreignKeyName: string;
  columns: string[];
  isOneToOne: boolean;
  referencedRelation: string;
  referencedColumns: string[];
}