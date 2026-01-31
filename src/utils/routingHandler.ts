import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";

export type ValidPaths = {
  customer: string[];
  manager: string[];
  server: string[];
  managerPersonal: string[];
  serverPersonal: string[];
};

export const validPaths: ValidPaths = {
  customer: ['/', '/profile', '/activity', '/my-referrals', '/make-referral', '/redeem-points'],
  manager: ['/restaurant-manager', '/restaurant-profile', '/restaurant-images', '/restaurant-amenities', '/opening-hours', '/redemption-schedule', '/restaurant-activity', '/profile', '/activity'],
  server: ['/server-home', '/profile', '/activity'],
  managerPersonal: ['/', '/profile', '/activity', '/my-referrals', '/make-referral', '/redeem-points'],
  serverPersonal: ['/', '/profile', '/activity', '/my-referrals', '/make-referral', '/redeem-points']
};

interface Profile {
  role: string;
  restaurant_id?: string;
  referer_id?: string;
}

export const handleUserRouting = async (
  session: Session,
  profile: Profile,
  currentPath: string,
  navigate: (path: string) => void,
  viewMode?: 'restaurant' | 'personal'
): Promise<void> => {
  console.log('Handling user routing:', { profile, currentPath, viewMode });
  
  const userRole = profile?.role || 'customer';
  
  // Determine valid paths based on role and view mode
  let userValidPaths: string[];
  if (viewMode === 'personal' && (userRole === 'manager' || userRole === 'server')) {
    userValidPaths = userRole === 'manager' ? validPaths.managerPersonal : validPaths.serverPersonal;
  } else {
    userValidPaths = validPaths[userRole as keyof ValidPaths] || validPaths.customer;
  }
  
  if (userValidPaths.includes(currentPath)) {
    console.log('User already on valid path:', currentPath);
    return;
  }

  console.log('Routing based on role and view mode:', { role: profile.role, viewMode });
  
  // If in personal mode, route to customer home
  if (viewMode === 'personal' && (userRole === 'manager' || userRole === 'server')) {
    navigate("/");
    return;
  }
  
  switch (profile.role) {
    case 'manager':
      try {
        const { data: restaurant, error } = await supabase
          .from('restaurants')
          .select('id')
          .eq('manager_id', session.user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching restaurant:', error);
          toast("Unable to access restaurant details");
          navigate("/");
          return;
        }
        
        if (restaurant) {
          console.log('Manager has restaurant, routing to manager page');
          navigate("/restaurant-manager");
        } else {
          console.log('Manager without restaurant, routing to home');
          navigate("/");
        }
      } catch (error) {
        console.error('Error in manager routing:', error);
        toast("Error accessing manager dashboard");
        navigate("/");
      }
      break;
      
    case 'server':
      if (!profile.restaurant_id || !profile.referer_id) {
        console.error('Server profile missing required fields');
        toast("Your server profile is incomplete");
        navigate("/");
        return;
      }
      navigate("/server-home");
      break;
      
    case 'customer':
    default:
      console.log('Routing customer to home');
      navigate("/");
  }
};