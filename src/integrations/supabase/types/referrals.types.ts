import { ReferralStatus } from './enums.types';

export interface ReferralRow {
  id: string;
  created_at: string;
  creator_id: string;
  restaurant_id: string;
  status: ReferralStatus;
  scanned_at: string | null;
  scanned_by_id: string | null;
  expires_at: string;
  app_referrer_id: string | null;
  restaurant_referrer_id: string | null;
}

export interface ReferralInsert {
  id?: string;
  created_at?: string;
  creator_id: string;
  restaurant_id: string;
  status?: ReferralStatus;
  scanned_at?: string | null;
  scanned_by_id?: string | null;
  expires_at: string;
  app_referrer_id?: string | null;
  restaurant_referrer_id?: string | null;
}

export interface ReferralUpdate {
  id?: string;
  created_at?: string;
  creator_id?: string;
  restaurant_id?: string;
  status?: ReferralStatus;
  scanned_at?: string | null;
  scanned_by_id?: string | null;
  expires_at?: string;
  app_referrer_id?: string | null;
  restaurant_referrer_id?: string | null;
}

export interface ReferralRelationships {
  foreignKeyName: "referrals_creator_id_fkey" | "referrals_restaurant_id_fkey" | "referrals_scanned_by_id_fkey" | "referrals_app_referrer_id_fkey" | "referrals_restaurant_referrer_id_fkey";
  columns: ["creator_id"] | ["restaurant_id"] | ["scanned_by_id"] | ["app_referrer_id"] | ["restaurant_referrer_id"];
  isOneToOne: false;
  referencedRelation: "profiles" | "restaurants";
  referencedColumns: ["id"];
}