import { Home, Activity, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const BottomNav = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border h-16 flex items-center justify-around px-4">
      <Link
        to="/"
        className={`flex flex-col items-center space-y-1 ${
          isActive("/") ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <Home size={24} />
        <span className="text-xs">{t('navigation.home')}</span>
      </Link>
      <Link
        to="/activity"
        className={`flex flex-col items-center space-y-1 ${
          isActive("/activity") ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <Activity size={24} />
        <span className="text-xs">{t('navigation.activity')}</span>
      </Link>
      <Link
        to="/profile"
        className={`flex flex-col items-center space-y-1 ${
          isActive("/profile") ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <User size={24} />
        <span className="text-xs">{t('navigation.profile')}</span>
      </Link>
    </nav>
  );
};