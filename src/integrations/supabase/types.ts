export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          activity_type: string | null
          amount_spent: number | null
          app_referrer_id: string | null
          app_referrer_points: number | null
          associated_referral: string | null
          created_at: string
          customer_points: number | null
          description: string
          expires_at: string | null
          id: string
          initial_points_balance: number | null
          is_active: boolean | null
          points_redeemed: number | null
          processed_by_id: string | null
          processed_outside_hours: boolean | null
          receipt_photo: string | null
          referral_id: string | null
          referrer_points: number | null
          related_user_id: string | null
          restaurant_deduction: number | null
          restaurant_id: string | null
          restaurant_recruiter_points: number | null
          restaurant_referrer_id: string | null
          scanned_at: string | null
          scanner_id: string | null
          type: Database["public"]["Enums"]["activity_type"] | null
          user_id: string
          user_referrer_id: string | null
        }
        Insert: {
          activity_type?: string | null
          amount_spent?: number | null
          app_referrer_id?: string | null
          app_referrer_points?: number | null
          associated_referral?: string | null
          created_at?: string
          customer_points?: number | null
          description: string
          expires_at?: string | null
          id?: string
          initial_points_balance?: number | null
          is_active?: boolean | null
          points_redeemed?: number | null
          processed_by_id?: string | null
          processed_outside_hours?: boolean | null
          receipt_photo?: string | null
          referral_id?: string | null
          referrer_points?: number | null
          related_user_id?: string | null
          restaurant_deduction?: number | null
          restaurant_id?: string | null
          restaurant_recruiter_points?: number | null
          restaurant_referrer_id?: string | null
          scanned_at?: string | null
          scanner_id?: string | null
          type?: Database["public"]["Enums"]["activity_type"] | null
          user_id: string
          user_referrer_id?: string | null
        }
        Update: {
          activity_type?: string | null
          amount_spent?: number | null
          app_referrer_id?: string | null
          app_referrer_points?: number | null
          associated_referral?: string | null
          created_at?: string
          customer_points?: number | null
          description?: string
          expires_at?: string | null
          id?: string
          initial_points_balance?: number | null
          is_active?: boolean | null
          points_redeemed?: number | null
          processed_by_id?: string | null
          processed_outside_hours?: boolean | null
          receipt_photo?: string | null
          referral_id?: string | null
          referrer_points?: number | null
          related_user_id?: string | null
          restaurant_deduction?: number | null
          restaurant_id?: string | null
          restaurant_recruiter_points?: number | null
          restaurant_referrer_id?: string | null
          scanned_at?: string | null
          scanner_id?: string | null
          type?: Database["public"]["Enums"]["activity_type"] | null
          user_id?: string
          user_referrer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_processed_by_id_fkey"
            columns: ["processed_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_related_user_id_fkey"
            columns: ["related_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_restaurant_referrer_id_fkey"
            columns: ["restaurant_referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_scanner_id_fkey"
            columns: ["scanner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_user_referrer_id_fkey"
            columns: ["user_referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_app_referrer"
            columns: ["app_referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dice_tokens: {
        Row: {
          created_at: string | null
          created_by: string
          expires_at: string
          id: string
          is_active: boolean | null
          processed_at: string | null
          processed_by: string | null
          restaurant_id: string
          restaurant_scanned_at: string | null
          restaurant_scanned_by: string | null
          token_state: string | null
          used_at: string | null
          user_scanned_at: string | null
          user_scanned_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          expires_at: string
          id?: string
          is_active?: boolean | null
          processed_at?: string | null
          processed_by?: string | null
          restaurant_id: string
          restaurant_scanned_at?: string | null
          restaurant_scanned_by?: string | null
          token_state?: string | null
          used_at?: string | null
          user_scanned_at?: string | null
          user_scanned_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          expires_at?: string
          id?: string
          is_active?: boolean | null
          processed_at?: string | null
          processed_by?: string | null
          restaurant_id?: string
          restaurant_scanned_at?: string | null
          restaurant_scanned_by?: string | null
          token_state?: string | null
          used_at?: string | null
          user_scanned_at?: string | null
          user_scanned_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dice_tokens_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dice_tokens_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dice_tokens_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dice_tokens_restaurant_scanned_by_fkey"
            columns: ["restaurant_scanned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dice_tokens_user_scanned_by_fkey"
            columns: ["user_scanned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exchange_rates: {
        Row: {
          created_at: string
          fetched_at: string
          from_currency: string
          id: string
          is_active: boolean | null
          rate: number
          source: string | null
          to_currency: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          fetched_at?: string
          from_currency: string
          id?: string
          is_active?: boolean | null
          rate: number
          source?: string | null
          to_currency: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          fetched_at?: string
          from_currency?: string
          id?: string
          is_active?: boolean | null
          rate?: number
          source?: string | null
          to_currency?: string
          updated_at?: string
        }
        Relationships: []
      }
      external_restaurants: {
        Row: {
          address: string
          created_at: string | null
          cuisine_type: string | null
          currency: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          opening_hours: Json | null
          phone: string | null
          photos: string[] | null
          place_id: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          cuisine_type?: string | null
          currency?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          opening_hours?: Json | null
          phone?: string | null
          photos?: string[] | null
          place_id: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          cuisine_type?: string | null
          currency?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          opening_hours?: Json | null
          phone?: string | null
          photos?: string[] | null
          place_id?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      favorite_lists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          restaurant_ids: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          restaurant_ids?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          restaurant_ids?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      invites: {
        Row: {
          created_at: string
          created_by: string | null
          expires_at: string
          id: string
          invite_code: string | null
          invite_type: string
          permanent_code: string | null
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
          invite_code?: string | null
          invite_type: string
          permanent_code?: string | null
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
          invite_code?: string | null
          invite_type?: string
          permanent_code?: string | null
          restaurant_id?: string | null
          type?: Database["public"]["Enums"]["invite_type"]
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
          },
        ]
      }
      points_allocation: {
        Row: {
          created_at: string
          description: string | null
          id: number
          is_active: boolean | null
          percentage: number | null
          type: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          is_active?: boolean | null
          percentage?: number | null
          type?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          is_active?: boolean | null
          percentage?: number | null
          type?: string | null
        }
        Relationships: []
      }
      points_sharing: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          is_used: boolean
          points_amount: number
          receiver_id: string | null
          sender_currency: string
          sender_id: string
          share_code: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          is_used?: boolean
          points_amount: number
          receiver_id?: string | null
          sender_currency?: string
          sender_id: string
          share_code: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          is_used?: boolean
          points_amount?: number
          receiver_id?: string | null
          sender_currency?: string
          sender_id?: string
          share_code?: string
          used_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          country_code: string | null
          created_at: string
          current_points: number | null
          distance_unit: string | null
          email: string | null
          email_notifications: boolean | null
          first_name: string | null
          home_address_line1: string | null
          home_address_line2: string | null
          home_address_line3: string | null
          home_country: string | null
          home_currency: string | null
          id: string
          join_date: string | null
          language_preference: string | null
          last_name: string | null
          last_used: string | null
          mobile_number: string | null
          name: string | null
          photo: string | null
          push_notifications: boolean | null
          referer_id: string | null
          restaurant: Json | null
          restaurant_id: string | null
          role: string | null
          theme: string | null
          updated_at: string
        }
        Insert: {
          country_code?: string | null
          created_at?: string
          current_points?: number | null
          distance_unit?: string | null
          email?: string | null
          email_notifications?: boolean | null
          first_name?: string | null
          home_address_line1?: string | null
          home_address_line2?: string | null
          home_address_line3?: string | null
          home_country?: string | null
          home_currency?: string | null
          id: string
          join_date?: string | null
          language_preference?: string | null
          last_name?: string | null
          last_used?: string | null
          mobile_number?: string | null
          name?: string | null
          photo?: string | null
          push_notifications?: boolean | null
          referer_id?: string | null
          restaurant?: Json | null
          restaurant_id?: string | null
          role?: string | null
          theme?: string | null
          updated_at?: string
        }
        Update: {
          country_code?: string | null
          created_at?: string
          current_points?: number | null
          distance_unit?: string | null
          email?: string | null
          email_notifications?: boolean | null
          first_name?: string | null
          home_address_line1?: string | null
          home_address_line2?: string | null
          home_address_line3?: string | null
          home_country?: string | null
          home_currency?: string | null
          id?: string
          join_date?: string | null
          language_preference?: string | null
          last_name?: string | null
          last_used?: string | null
          mobile_number?: string | null
          name?: string | null
          photo?: string | null
          push_notifications?: boolean | null
          referer_id?: string | null
          restaurant?: Json | null
          restaurant_id?: string | null
          role?: string | null
          theme?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          creator_id: string
          expires_at: string | null
          external_restaurant_id: string | null
          id: string
          is_external: boolean | null
          is_invalid_recent_visit: boolean | null
          restaurant_id: string | null
          scanned_at: string | null
          scanned_by_id: string | null
          status: Database["public"]["Enums"]["referral_status"]
        }
        Insert: {
          created_at?: string
          creator_id: string
          expires_at?: string | null
          external_restaurant_id?: string | null
          id?: string
          is_external?: boolean | null
          is_invalid_recent_visit?: boolean | null
          restaurant_id?: string | null
          scanned_at?: string | null
          scanned_by_id?: string | null
          status?: Database["public"]["Enums"]["referral_status"]
        }
        Update: {
          created_at?: string
          creator_id?: string
          expires_at?: string | null
          external_restaurant_id?: string | null
          id?: string
          is_external?: boolean | null
          is_invalid_recent_visit?: boolean | null
          restaurant_id?: string | null
          scanned_at?: string | null
          scanned_by_id?: string | null
          status?: Database["public"]["Enums"]["referral_status"]
        }
        Relationships: [
          {
            foreignKeyName: "referrals_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_external_restaurant_id_fkey"
            columns: ["external_restaurant_id"]
            isOneToOne: false
            referencedRelation: "external_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_scanned_by_id_fkey"
            columns: ["scanned_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_feedback: {
        Row: {
          activity_id: string
          created_at: string
          customer_id: string
          email_sent_at: string
          feedback_token: string
          id: string
          response_given_at: string | null
          restaurant_id: string
          would_return: boolean | null
        }
        Insert: {
          activity_id: string
          created_at?: string
          customer_id: string
          email_sent_at?: string
          feedback_token?: string
          id?: string
          response_given_at?: string | null
          restaurant_id: string
          would_return?: boolean | null
        }
        Update: {
          activity_id?: string
          created_at?: string
          customer_id?: string
          email_sent_at?: string
          feedback_token?: string
          id?: string
          response_given_at?: string | null
          restaurant_id?: string
          would_return?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_feedback_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
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
          currency: string | null
          current_points: number | null
          description: string
          has_delivery: boolean | null
          has_gluten_free_options: boolean | null
          has_outdoor_seating: boolean | null
          has_parking: boolean | null
          has_roll_meal_offer: boolean | null
          has_takeout: boolean | null
          has_vegan_options: boolean | null
          has_vegetarian_options: boolean | null
          has_wifi: boolean | null
          id: string
          is_family_friendly: boolean | null
          is_published: boolean | null
          is_wheelchair_accessible: boolean | null
          latitude: number | null
          longitude: number | null
          manager_id: string | null
          max_redemption_percentage: number | null
          name: string
          opening_hours_schedule: Json
          photos: string[] | null
          plus_code: string | null
          postal_code: string | null
          publication_history: Json | null
          published_at: string | null
          redemption_schedule: Json
          referer_id: string | null
          referral_count: number
          require_bill_photos: boolean | null
          return_rate: number | null
          state: string | null
          street_name: string | null
          street_number: string | null
          takeaway_redemption_schedule: Json | null
          telephone: string | null
          timezone: string | null
          unpublished_at: string | null
          updated_at: string
          uses_same_redemption_schedule: boolean | null
          website: string | null
        }
        Insert: {
          accepts_credit_cards?: boolean | null
          accepts_reservations?: boolean | null
          address: string
          country?: string | null
          county_region?: string | null
          created_at?: string
          cuisine_type: string
          currency?: string | null
          current_points?: number | null
          description: string
          has_delivery?: boolean | null
          has_gluten_free_options?: boolean | null
          has_outdoor_seating?: boolean | null
          has_parking?: boolean | null
          has_roll_meal_offer?: boolean | null
          has_takeout?: boolean | null
          has_vegan_options?: boolean | null
          has_vegetarian_options?: boolean | null
          has_wifi?: boolean | null
          id?: string
          is_family_friendly?: boolean | null
          is_published?: boolean | null
          is_wheelchair_accessible?: boolean | null
          latitude?: number | null
          longitude?: number | null
          manager_id?: string | null
          max_redemption_percentage?: number | null
          name: string
          opening_hours_schedule?: Json
          photos?: string[] | null
          plus_code?: string | null
          postal_code?: string | null
          publication_history?: Json | null
          published_at?: string | null
          redemption_schedule?: Json
          referer_id?: string | null
          referral_count: number
          require_bill_photos?: boolean | null
          return_rate?: number | null
          state?: string | null
          street_name?: string | null
          street_number?: string | null
          takeaway_redemption_schedule?: Json | null
          telephone?: string | null
          timezone?: string | null
          unpublished_at?: string | null
          updated_at?: string
          uses_same_redemption_schedule?: boolean | null
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
          currency?: string | null
          current_points?: number | null
          description?: string
          has_delivery?: boolean | null
          has_gluten_free_options?: boolean | null
          has_outdoor_seating?: boolean | null
          has_parking?: boolean | null
          has_roll_meal_offer?: boolean | null
          has_takeout?: boolean | null
          has_vegan_options?: boolean | null
          has_vegetarian_options?: boolean | null
          has_wifi?: boolean | null
          id?: string
          is_family_friendly?: boolean | null
          is_published?: boolean | null
          is_wheelchair_accessible?: boolean | null
          latitude?: number | null
          longitude?: number | null
          manager_id?: string | null
          max_redemption_percentage?: number | null
          name?: string
          opening_hours_schedule?: Json
          photos?: string[] | null
          plus_code?: string | null
          postal_code?: string | null
          publication_history?: Json | null
          published_at?: string | null
          redemption_schedule?: Json
          referer_id?: string | null
          referral_count?: number
          require_bill_photos?: boolean | null
          return_rate?: number | null
          state?: string | null
          street_name?: string | null
          street_number?: string | null
          takeaway_redemption_schedule?: Json | null
          telephone?: string | null
          timezone?: string | null
          unpublished_at?: string | null
          updated_at?: string
          uses_same_redemption_schedule?: boolean | null
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
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bytea_to_text: { Args: { data: string }; Returns: string }
      can_view_server_profile: {
        Args: { target_profile_id: string }
        Returns: boolean
      }
      check_recent_restaurant_visit: {
        Args: { p_restaurant_id: string; p_user_id: string }
        Returns: boolean
      }
      claim_referral: {
        Args: { p_referral_id: string; p_user_id: string }
        Returns: Json
      }
      clean_expired_invites: { Args: never; Returns: undefined }
      clean_expired_referrals: { Args: never; Returns: undefined }
      cleanup_dice_tokens: { Args: never; Returns: undefined }
      cleanup_old_exchange_rates: { Args: never; Returns: undefined }
      create_invite_for_qr: {
        Args: {
          p_created_by: string
          p_invite_type: string
          p_is_permanent?: boolean
          p_restaurant_id?: string
        }
        Returns: string
      }
      geocode_all_restaurants: { Args: never; Returns: undefined }
      get_current_user_role: { Args: never; Returns: string }
      get_manager_restaurant: {
        Args: { manager_user_id: string }
        Returns: {
          accepts_credit_cards: boolean | null
          accepts_reservations: boolean | null
          address: string
          country: string | null
          county_region: string | null
          created_at: string
          cuisine_type: string
          currency: string | null
          current_points: number | null
          description: string
          has_delivery: boolean | null
          has_gluten_free_options: boolean | null
          has_outdoor_seating: boolean | null
          has_parking: boolean | null
          has_roll_meal_offer: boolean | null
          has_takeout: boolean | null
          has_vegan_options: boolean | null
          has_vegetarian_options: boolean | null
          has_wifi: boolean | null
          id: string
          is_family_friendly: boolean | null
          is_published: boolean | null
          is_wheelchair_accessible: boolean | null
          latitude: number | null
          longitude: number | null
          manager_id: string | null
          max_redemption_percentage: number | null
          name: string
          opening_hours_schedule: Json
          photos: string[] | null
          plus_code: string | null
          postal_code: string | null
          publication_history: Json | null
          published_at: string | null
          redemption_schedule: Json
          referer_id: string | null
          referral_count: number
          require_bill_photos: boolean | null
          return_rate: number | null
          state: string | null
          street_name: string | null
          street_number: string | null
          takeaway_redemption_schedule: Json | null
          telephone: string | null
          timezone: string | null
          unpublished_at: string | null
          updated_at: string
          uses_same_redemption_schedule: boolean | null
          website: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "restaurants"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_profile_id_by_email: {
        Args: { email_param: string }
        Returns: string
      }
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "http_request"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_delete:
        | {
            Args: { uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: { content: string; content_type: string; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      http_get:
        | {
            Args: { uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: { data: Json; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      http_head: {
        Args: { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "*"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_header: {
        Args: { field: string; value: string }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
        SetofOptions: {
          from: "*"
          to: "http_header"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_list_curlopt: {
        Args: never
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: { content: string; content_type: string; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "*"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_post:
        | {
            Args: { content: string; content_type: string; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: { data: Json; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      http_put: {
        Args: { content: string; content_type: string; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "*"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_reset_curlopt: { Args: never; Returns: boolean }
      http_set_curlopt: {
        Args: { curlopt: string; value: string }
        Returns: boolean
      }
      is_manager_of_restaurant: {
        Args: { target_restaurant_id: string }
        Returns: boolean
      }
      is_restaurant_staff_for_user: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      process_bill_transaction:
        | {
            Args: {
              p_activity_id: string
              p_app_referrer_id: string
              p_app_referrer_points: number
              p_bill_image: string
              p_bill_total: number
              p_customer_id: string
              p_customer_points: number
              p_initial_points_balance: number
              p_new_restaurant_points: number
              p_points_distribution: Json
              p_processed_by_id: string
              p_referrer_points: number
              p_restaurant_deduction: number
              p_restaurant_id: string
              p_restaurant_recruiter_points: number
              p_restaurant_referrer_id: string
              p_user_referrer_id: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_activity_id: string
              p_app_referrer_id: string
              p_app_referrer_points: number
              p_bill_image: string
              p_bill_total: number
              p_customer_id: string
              p_customer_points: number
              p_initial_points_balance: number
              p_new_restaurant_points: number
              p_points_distribution: Json
              p_processed_by_id: string
              p_referrer_points: number
              p_restaurant_deduction: number
              p_restaurant_id: string
              p_restaurant_recruiter_points: number
              p_restaurant_referrer_id: string
              p_user_referrer_id: string
            }
            Returns: Json
          }
      process_points_redemption: {
        Args: {
          p_current_points: number
          p_points_amount: number
          p_restaurant_id: string
          p_user_id: string
        }
        Returns: boolean
      }
      text_to_bytea: { Args: { data: string }; Returns: string }
      update_restaurant_points: {
        Args: { p_points: number; p_restaurant_id: string }
        Returns: undefined
      }
      update_user_points: {
        Args: { p_points: number; p_user_id: string }
        Returns: undefined
      }
      urlencode:
        | { Args: { data: Json }; Returns: string }
        | {
            Args: { string: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.urlencode(string => bytea), public.urlencode(string => varchar). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
        | {
            Args: { string: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.urlencode(string => bytea), public.urlencode(string => varchar). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
    }
    Enums: {
      activity_type:
        | "referral_presented"
        | "referral_scanned"
        | "referral_processed"
        | "redeem_presented"
        | "redeem_scanned"
        | "redeem_processed"
        | "points_deducted"
        | "roll_token_processed"
      dice_token_state:
        | "created"
        | "user_scanned"
        | "user_presented"
        | "processed"
      invite_type: "manager" | "customer" | "server"
      referral_status: "active" | "scanned" | "used" | "expired" | "presented"
      token_state: "created" | "user_scanned" | "user_presented" | "processed"
    }
    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      activity_type: [
        "referral_presented",
        "referral_scanned",
        "referral_processed",
        "redeem_presented",
        "redeem_scanned",
        "redeem_processed",
        "points_deducted",
        "roll_token_processed",
      ],
      dice_token_state: [
        "created",
        "user_scanned",
        "user_presented",
        "processed",
      ],
      invite_type: ["manager", "customer", "server"],
      referral_status: ["active", "scanned", "used", "expired", "presented"],
      token_state: ["created", "user_scanned", "user_presented", "processed"],
    },
  },
} as const
