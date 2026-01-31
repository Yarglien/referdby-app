import { Home, Activity, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const RestaurantNav = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border h-16 flex items-center justify-around px-4">
      <Link
        to="/restaurant-manager"
        className={`flex flex-col items-center space-y-1 ${
          isActive("/restaurant-manager") ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <Home size={24} />
        <span className="text-xs">Home</span>
      </Link>
      <Link
        to="/restaurant-activity"
        className={`flex flex-col items-center space-y-1 ${
          isActive("/restaurant-activity") ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <Activity size={24} />
        <span className="text-xs">Activity</span>
      </Link>
      <Link
        to="/restaurant-profile"
        className={`flex flex-col items-center space-y-1 ${
          isActive("/restaurant-profile") ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <User size={24} />
        <span className="text-xs">Profile</span>
      </Link>
    </nav>
  );
};