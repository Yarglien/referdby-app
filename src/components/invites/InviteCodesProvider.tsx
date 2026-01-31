import React, { createContext, useContext, useEffect } from "react";
import { useInviteCodes } from "@/hooks/useInviteCodes";

interface InviteCodesContextType {
  userInviteCode: string;
  restaurantInviteCode: string;
  isLoading: boolean;
}

const InviteCodesContext = createContext<InviteCodesContextType>({
  userInviteCode: "",
  restaurantInviteCode: "",
  isLoading: true,
});

export const useInviteCodesContext = () => {
  const context = useContext(InviteCodesContext);
  if (!context) {
    throw new Error("useInviteCodesContext must be used within InviteCodesProvider");
  }
  return context;
};

interface InviteCodesProviderProps {
  children: React.ReactNode;
}

export const InviteCodesProvider = ({ children }: InviteCodesProviderProps) => {
  const inviteCodes = useInviteCodes();

  // Pre-cache invite codes on component mount
  useEffect(() => {
    // The useInviteCodes hook will automatically fetch/create codes when this provider mounts
  }, []);

  return (
    <InviteCodesContext.Provider value={inviteCodes}>
      {children}
    </InviteCodesContext.Provider>
  );
};