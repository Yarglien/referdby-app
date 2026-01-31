
import { useUser } from "@/contexts/UserContext";

export const useCurrentUser = () => {
  const { profile, isLoading } = useUser();
  
  return {
    data: profile,
    isLoading,
    error: null,
    isError: false
  };
};
