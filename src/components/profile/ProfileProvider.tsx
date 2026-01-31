
import { createContext, useContext, ReactNode, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface ProfileContextType {
  profile: any;
  isLoading: boolean;
  avatarUrl: string | null;
  setAvatarUrl: (url: string | null) => void;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const { profile, isLoading, refreshProfile } = useUser();

  // Set avatar URL from cached profile
  useEffect(() => {
    if (profile?.photo) {
      setAvatarUrl(profile.photo);
    }
  }, [profile?.photo]);

  return (
    <ProfileContext.Provider value={{
      profile,
      isLoading,
      avatarUrl,
      setAvatarUrl,
      refreshProfile
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
