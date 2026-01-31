import { useViewMode } from "@/contexts/ViewModeContext";
import { useUser } from "@/contexts/UserContext";
import { BottomNav } from "@/components/BottomNav";
import { RestaurantNav } from "@/components/RestaurantNav";
import { ServerNav } from "@/components/ServerNav";

export const DualRoleNavigation = () => {
  const { viewMode, canSwitchViews } = useViewMode();
  const { profile } = useUser();

  // If user can't switch views (customer only), show customer nav
  if (!canSwitchViews) {
    return <BottomNav />;
  }

  // If in personal mode, show customer navigation
  if (viewMode === 'personal') {
    return <BottomNav />;
  }

  // If in restaurant mode, show appropriate restaurant navigation
  if (profile?.role === 'manager') {
    return <RestaurantNav />;
  } else if (profile?.role === 'server') {
    return <ServerNav />;
  }

  // Fallback to customer nav
  return <BottomNav />;
};