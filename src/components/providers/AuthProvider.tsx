
import { createContext, useContext, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useAuthActivity } from '@/hooks/useAuthActivity';
import { useInactivityCheck } from '@/hooks/useInactivityCheck';
import { InviteCodesProvider } from "@/components/invites/InviteCodesProvider";

type AuthContextType = {
  user: User | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, justLoggedInRef, handleSignOut } = useAuthSession();
  const { lastActivityRef } = useAuthActivity(user);
  const { activityCheckIntervalRef } = useInactivityCheck({
    user,
    lastActivityRef,
    justLoggedInRef,
    handleSignOut
  });

  return (
    <AuthContext.Provider value={{ user }}>
      {user ? (
        <InviteCodesProvider>
          {children}
        </InviteCodesProvider>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
