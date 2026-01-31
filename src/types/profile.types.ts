
import { Profile } from "@/integrations/supabase/types/profile.types";

export type PartialProfile = Pick<Profile, 'id' | 'role' | 'first_name' | 'current_points' | 'photo' | 'home_currency'>;
