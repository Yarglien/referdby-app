
import { ProfileProvider } from "@/components/profile/ProfileProvider";
import { ProfileLayout } from "@/components/profile/ProfileLayout";
import { useAuth } from "@/components/providers/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if we're sure there's no user and we're not in a loading state
    if (user === null) {
      const timer = setTimeout(() => {
        console.log('No user found after timeout, redirecting to auth');
        navigate('/auth');
      }, 100); // Small delay to allow auth state to settle
      
      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  // Don't render anything while checking auth state
  if (user === null) {
    return null;
  }

  return (
    <ProfileProvider>
      <ProfileLayout />
    </ProfileProvider>
  );
};

export default Profile;
