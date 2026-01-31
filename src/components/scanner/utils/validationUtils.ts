
import { toast } from "sonner";

/**
 * Validates if a string is a valid UUID
 */
export const isValidUuid = (value: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

/**
 * Gets a user's profile role
 */
export const getUserRole = async (userId: string, supabase: any) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user role:', error);
      return null;
    }

    return profile?.role;
  } catch (error) {
    console.error('Exception getting user role:', error);
    return null;
  }
};

/**
 * Validates a user is authenticated
 * @returns User ID if authenticated, null otherwise
 */
export const validateAuthentication = async (supabase: any): Promise<string | null> => {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    toast.error("Authentication Required");
    return null;
  }
  
  return user.id;
};
