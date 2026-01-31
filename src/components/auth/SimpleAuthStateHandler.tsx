import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const SimpleAuthStateHandler = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 Auth event:', event, 'Session:', !!session);
      
      if (event === "SIGNED_IN" && session) {
        console.log('🔐 SIGNED_IN - redirecting to home');
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return null;
};