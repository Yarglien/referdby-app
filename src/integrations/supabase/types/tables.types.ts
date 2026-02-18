import { ActivityType, InviteType, ReferralStatus } from './enums.types';
import { ActivityRow, ActivityInsert, ActivityUpdate, ActivityRelationships } from './activities.types';
import { ReferralRow, ReferralInsert, ReferralUpdate, ReferralRelationships } from './referrals.types';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      points_allocation: {
        Row: {
          id: string
          created_at: string
          type: string
          percentage: number
          description: string
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          type: string
          percentage: number
          description: string
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          type?: string
          percentage?: number
          description?: string
          is_active?: boolean
        }
      }
      activities: {
        Row: ActivityRow
        Insert: ActivityInsert
        Update: ActivityUpdate
        Relationships: ActivityRelationships[]
      }
      invites: {
        Row: {
          created_at: string
          created_by: string | null
          expires_at: string
          id: string
          invite_code: string
          restaurant_id: string | null
          type: Database["public"]["Enums"]["invite_type"]
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expires_at: string
          id?: string
          invite_code: string
          restaurant_id?: string | null
          type: Database["public"]["Enums"]["invite_type"]
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expires_at?: string
          id?: string
          invite_code?: string
          restaurant_id?: string | null
          type: Database["public"]["Enums"]["invite_type"]
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invites_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invites_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invites_used_by_fkey"
            columns: ["used_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      opening_hours: {
        Row: {
          close_time: string | null
          created_at: string
          day_of_week: string
          id: string
          is_open: boolean | null
          open_time: string | null
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          close_time?: string | null
          created_at?: string
          day_of_week: string
          id?: string
          is_open?: boolean | null
          open_time?: string | null
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          close_time?: string | null
          created_at?: string
          day_of_week?: string
          id?: string
          is_open?: boolean | null
          open_time?: string
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "opening_hours_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          }
        ]
      }

profiles: {
  Row: {
    country_code: string | null
    created_at: string
    current_points: number | null
    current_session_token: string | null
    email: string | null
    first_name: string | null
    home_address_line1: string | null
    home_address_line2: string | null
    home_address_line3: string | null
    home_country: string | null
    home_currency: string | null
    id: string
    join_date: string | null
    last_name: string | null
    last_used: string | null
    mobile_number: string | null
    name: string | null
    photo: string | null
    referer_id: string | null
    restaurant_id: string | null
    role: string | null
    theme: string | null
    updated_at: string
    login_count: number | null
  }
  Insert: {
    country_code?: string | null
    created_at?: string
    current_points?: number | null
    current_session_token?: string | null
    email?: string | null
    first_name?: string | null
    home_address_line1?: string | null
    home_address_line2?: string | null
    home_address_line3?: string | null
    home_country?: string | null
    home_currency?: string | null
    id: string
    join_date?: string | null
    last_name?: string | null
    last_used?: string | null
    mobile_number?: string | null
    name?: string | null
    photo?: string | null
    referer_id?: string | null
    restaurant_id?: string | null
    role?: string | null
    theme?: string | null
    updated_at?: string
    login_count?: number | null
  }
  Update: {
    country_code?: string | null
    created_at?: string
    current_points?: number | null
    current_session_token?: string | null
    email?: string | null
    first_name?: string | null
    home_address_line1?: string | null
    home_address_line2?: string | null
    home_address_line3?: string | null
    home_country?: string | null
    home_currency?: string | null
    id?: string
    join_date?: string | null
    last_name?: string | null
    last_used?: string | null
    mobile_number?: string | null
    name?: string | null
    photo?: string | null
    referer_id?: string | null
    restaurant_id?: string | null
    role?: string | null
    theme?: string | null
    updated_at?: string
    login_count?: number | null
  }
        Relationships: []
}

      redemption_schedule: {
        Row: {
          close_time: string | null
          created_at: string
          day_of_week: string
          id: string
          is_open: boolean | null
          open_time: string | null
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          close_time?: string | null
          created_at?: string
          day_of_week: string
          id?: string
          is_open?: boolean | null
          open_time?: string | null
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          close_time?: string | null
          created_at?: string
          day_of_week?: string
          id?: string
          is_open?: boolean | null
          open_time?: string
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "redemption_schedule_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          }
        ]
      }
      referrals: {
        Row: ReferralRow
        Insert: ReferralInsert
        Update: ReferralUpdate
        Relationships: ReferralRelationships[]
      }
      restaurants: {
        Row: {
          accepts_credit_cards: boolean | null
          accepts_reservations: boolean | null
          address: string
          country: string | null
          county_region: string | null
          created_at: string
          cuisine_type: string
          current_points: number | null
          description: string
          has_delivery: boolean | null
          has_gluten_free_options: boolean | null
          has_outdoor_seating: boolean | null
          has_parking: boolean | null
          has_takeout: boolean | null
          has_vegan_options: boolean | null
          has_vegetarian_options: boolean | null
          has_wifi: boolean | null
          id: string
          is_family_friendly: boolean | null
          is_wheelchair_accessible: boolean | null
          latitude: number | null
          longitude: number | null
          manager_id: string | null
          name: string
          photos: string[] | null
          referer_id: string | null
          referral_count: number
          state: string | null
          street_name: string | null
          street_number: string | null
          telephone: string | null
          updated_at: string
          website: string | null
          timezone: string | null
        }
        Insert: {
          accepts_credit_cards?: boolean | null
          accepts_reservations?: boolean | null
          address: string
          country?: string | null
          county_region?: string | null
          created_at?: string
          cuisine_type: string
          current_points?: number | null
          description: string
          has_delivery?: boolean | null
          has_gluten_free_options?: boolean | null
          has_outdoor_seating?: boolean | null
          has_parking?: boolean | null
          has_takeout?: boolean | null
          has_vegan_options?: boolean | null
          has_vegetarian_options?: boolean | null
          has_wifi?: boolean | null
          id?: string
          is_family_friendly?: boolean | null
          is_wheelchair_accessible?: boolean | null
          latitude?: number | null
          longitude?: number | null
          manager_id?: string | null
          name: string
          photos?: string[] | null
          referer_id?: string | null
          referral_count?: number
          state?: string | null
          street_name?: string | null
          street_number?: string | null
          telephone?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          accepts_credit_cards?: boolean | null
          accepts_reservations?: boolean | null
          address?: string
          country?: string | null
          county_region?: string | null
          created_at?: string
          cuisine_type?: string
          current_points?: number | null
          description?: string
          has_delivery?: boolean | null
          has_gluten_free_options?: boolean | null
          has_outdoor_seating?: boolean | null
          has_parking?: boolean | null
          has_takeout?: boolean | null
          has_vegan_options?: boolean | null
          has_vegetarian_options?: boolean | null
          has_wifi?: boolean | null
          id?: string
          is_family_friendly?: boolean | null
          is_wheelchair_accessible?: boolean | null
          latitude?: number | null
          longitude?: number | null
          manager_id?: string | null
          name: string
          photos?: string[] | null
          referer_id?: string | null
          referral_count?: number
          state?: string | null
          street_name?: string | null
          street_number?: string | null
          telephone?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurants_referer_id_fkey"
            columns: ["referer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bytea_to_text: {
        Args: {
          data: string
        }
        Returns: string
      }
      claim_referral: {
        Args: {
          p_referral_id: string
          p_user_id: string
        }
        Returns: undefined
      }
      clean_expired_invites: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      clean_expired_referrals: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      geocode_all_restaurants: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_profile_id_by_email: {
        Args: {
          email_param: string
        }
        Returns: string
      }
      http: {
        Args: {
          request: Database["public"]["CompositeTypes"]["http_request"]
        }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_delete:
        | {
            Args: {
              uri: string
            }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
          }
        | {
            Args: {
              uri: string
              content: string
              content_type: string
            }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
          }
      http_get:
        | {
            Args: {
              uri: string
            }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
          }
        | {
            Args: {
              uri: string
              data: Json
            }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
          }
      http_head: {
        Args: {
          uri: string
        }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_header: {
        Args: {
          field: string
          value: string
        }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
      }
      http_list_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: {
          uri: string
          content: string
          content_type: string
        }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_post:
        | {
            Args: {
              uri: string
              content: string
              content_type: string
            }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
          }
        | {
            Args: {
              uri: string
              data: Json
            }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
          }
      http_put: {
        Args: {
          uri: string
          content: string
          content_type: string
        }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_reset_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      http_set_curlopt: {
        Args: {
          curlopt: string
          value: string
        }
        Returns: boolean
      }
      text_to_bytea: {
        Args: {
          data: string
        }
        Returns: string
      }
      urlencode:
        | {
            Args: {
              data: Json
            }
            Returns: string
          }
        | {
            Args: {
              string: string
            }
            Returns: string
          }
        | {
            Args: {
              string: string
            }
            Returns: string
          }
    }
    Enums: {
      activity_type: ActivityType
      invite_type: InviteType
      referral_status: ReferralStatus
    }
    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown | null
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

