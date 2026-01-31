import { Home, Activity, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";

export const ServerNav = () => {
  const location = useLocation();
  const { profile } = useUser();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Determine home route based on user role
  const homeRoute = profile?.role === 'manager' ? '/restaurant-manager' : '/server-home';

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border h-16 flex items-center justify-around px-4">
      <Link
        to={homeRoute}
        className={`flex flex-col items-center space-y-1 ${
          isActive(homeRoute) ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <Home size={24} />
        <span className="text-xs">Home</span>
      </Link>
      <Link
        to={profile?.role === 'manager' ? "/restaurant-activity" : "/server-activity"}
        className={`flex flex-col items-center space-y-1 ${
          isActive(profile?.role === 'manager' ? "/restaurant-activity" : "/server-activity") ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <Activity size={24} />
        <span className="text-xs">Activity</span>
      </Link>
      <Link
        to={profile?.role === 'manager' ? "/restaurant-profile" : "/server-profile"}
        className={`flex flex-col items-center space-y-1 ${
          isActive(profile?.role === 'manager' ? "/restaurant-profile" : "/server-profile") ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <User size={24} />
        <span className="text-xs">Profile</span>
      </Link>
    </nav>
  );
};