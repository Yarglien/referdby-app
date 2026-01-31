import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';

export type ViewMode = 'restaurant' | 'personal';

interface ViewModeContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  canSwitchViews: boolean;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

export const ViewModeProvider = ({ children }: { children: ReactNode }) => {
  const { profile } = useUser();
  const [viewMode, setViewMode] = useState<ViewMode>('restaurant');

  // Determine if user can switch between views (managers and servers)
  const canSwitchViews = profile?.role === 'manager' || profile?.role === 'server';

  // Default to restaurant view for managers/servers, personal for customers
  useEffect(() => {
    if (profile?.role === 'customer') {
      setViewMode('personal');
    } else if (canSwitchViews) {
      setViewMode('restaurant');
    }
  }, [profile?.role, canSwitchViews]);

  return (
    <ViewModeContext.Provider value={{
      viewMode,
      setViewMode,
      canSwitchViews
    }}>
      {children}
    </ViewModeContext.Provider>
  );
};

export const useViewMode = () => {
  const context = useContext(ViewModeContext);
  if (!context) {
    throw new Error('useViewMode must be used within a ViewModeProvider');
  }
  return context;
};