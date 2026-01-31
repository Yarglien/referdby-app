import { useSearchParams, useNavigate } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getAuthConfig } from "@/components/auth/AuthConfig";
import { AuthContainer } from "@/components/auth/AuthContainer";
import { useAuthHandlers } from "@/components/auth/useAuthHandlers";
import { InviteValidator } from "@/components/auth/InviteValidator";

import { CustomSignupForm } from "@/components/auth/CustomSignupForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import logoLight from "@/assets/referdby-logo-light.png";
import logoDark from "@/assets/referdby-logo-dark.png";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, systemTheme } = useTheme();
  const inviteCode = searchParams.get("code");
  const inviteId = searchParams.get("invite_id") || searchParams.get("invite");
  const inviteType = searchParams.get("type");
  const view = searchParams.get("view");
  const referralCode = searchParams.get("referral_code");
  
  const [inviteData, setInviteData] = useState<{code: string | null, type: string | null}>({
    code: null,
    type: null
  });
  const [isLoadingInvite, setIsLoadingInvite] = useState(false);
  
  // Check if this is a direct signup request
  const isDirectSignup = window.location.pathname === '/direct-signup' || 
                         searchParams.get("invite") !== null;
  
  // Fetch invite data once when component loads
  useEffect(() => {
    const fetchInviteData = async () => {
      if (inviteId && !inviteData.code) {
        setIsLoadingInvite(true);
        try {
          const { data, error } = await supabase
            .from('invites')
            .select('invite_type, type, restaurant_id, created_by')
            .eq('id', inviteId)
            .single();
          
          if (error) throw error;
          
          const type = data.invite_type || data.type;
          setInviteData({ code: inviteId, type });
        } catch (error) {
          console.error('Error fetching invite data:', error);
          setInviteData({ code: null, type: null });
        } finally {
          setIsLoadingInvite(false);
        }
      }
    };
    
    fetchInviteData();
  }, [inviteId, inviteData.code]);

  const [authView, setAuthView] = useState<'sign_in' | 'sign_up' | 'forgotten_password'>(
    view === "forgot_password" ? "forgotten_password" :
    view === "sign_up" || referralCode ? "sign_up" : 
    isDirectSignup || inviteId || inviteCode ? "sign_up" : "sign_in"
  );

  useEffect(() => {
    // Check IMMEDIATELY on page load - before any React state changes
    const hash = window.location.hash;
    const search = window.location.search;
    const fullUrl = window.location.href;
    
    console.log('🔐 Checking recovery on page load:', { fullUrl, hash, search });
    
    // Supabase recovery tokens come in the URL hash after successful email verification
    const hasRecoveryInHash = hash.includes("access_token") && hash.includes("type=recovery");
    const hasRecoveryInSearch = search.includes("type=recovery");
    const isExpired = hash.includes("otp_expired") || search.includes("otp_expired");
    
    console.log('🔐 Recovery detection:', { hasRecoveryInHash, hasRecoveryInSearch, isExpired });
    
    // If we have a valid recovery token, go straight to reset page
    if ((hasRecoveryInHash || hasRecoveryInSearch) && !isExpired) {
      console.log('🔐 Valid recovery - going to /reset-password');
      window.location.replace("/reset-password");
      return;
    }
    
    // Handle expired recovery
    if (isExpired) {
      console.log('🔐 Recovery expired');
      toast({
        title: "Password Reset Link Expired", 
        description: "Please request a new password reset email.",
        variant: "destructive",
      });
      setAuthView('forgotten_password');
    }
  }, []);

  // Check if already signed in on mount - redirect handled by AuthProvider's useAuthSession
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        console.log('🔐 Auth page - already signed in, redirecting');
        navigate('/', { replace: true });
      }
    });
  }, [navigate]);
  
  // Only initialize useAuthHandlers when we have complete invite data or no invite needed
  const shouldInitializeAuth = !inviteId || (inviteData.code && inviteData.type);
  const { isLoading, handleSubmit, handleSuccess, handleError } = useAuthHandlers(
    shouldInitializeAuth ? (inviteData.code || inviteCode) : null,
    shouldInitializeAuth ? (inviteData.type || inviteType) : null
  );

  // Determine current theme
  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDark = currentTheme === 'dark';
  const logo = isDark ? logoDark : logoLight;

  useEffect(() => {
    (window as any).supabase = supabase;
    
    const style = document.createElement('style');
    style.innerHTML = `
      .auth-button {
        background-color: #FF5600 !important;
        color: white !important;
      }
      .auth-button:hover {
        background-color: #FF6B35 !important;
      }
      .auth-input {
        background-color: transparent !important;
        border: 1px solid #8E9196 !important;
        color: #333333 !important;
      }
      .auth-input:focus {
        border-color: #DB5D27 !important;
        box-shadow: 0 0 0 2px rgba(255, 107, 53, 0.2) !important;
      }
      .auth-label {
        color: #333333 !important;
      }
      .dark .auth-input {
        background-color: hsl(240 10% 15%) !important;
        border-color: #6B7280 !important;
        color: #F1F1F1 !important;
      }
      .dark .auth-input:focus {
        border-color: #DB5D27 !important;
        background-color: hsl(240 10% 18%) !important;
      }
      .dark .auth-label {
        color: #F1F1F1 !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleAuthSubmit = async (formData: { email: string; password: string }) => {
    if (authView === 'sign_up' && inviteId && (!inviteData.code || !inviteData.type)) {
      toast({
        title: "Loading",
        description: "Please wait while we load invite details...",
        variant: "destructive",
      });
      return false;
    }
    
    if (authView === 'sign_up' && inviteId && !inviteData.code) {
      toast({
        title: "Invalid Invite",
        description: "The invite link is invalid or expired.",
        variant: "destructive",
      });
      return false;
    }
    
    return await handleSubmit(formData);
  };

  const handleForgotPassword = () => {
    setAuthView('forgotten_password');
  };

  const handleBackToSignIn = () => {
    setAuthView('sign_in');
  };

  // Show loading while fetching invite data
  if (isLoadingInvite) {
    return (
      <AuthContainer>
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading invite...</p>
        </div>
      </AuthContainer>
    );
  }

  return (
    <InviteValidator inviteCode={inviteData.code || inviteCode}>
      <AuthContainer>
        <div className="flex flex-col space-y-6">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img 
              src={logo}
              alt="ReferdBy Logo"
              className="h-20 w-auto object-contain"
            />
          </div>

          {/* Referral explanation text */}
          {referralCode && (
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold text-foreground mb-2">🎉 Congratulations!</h2>
              <p className="text-sm text-muted-foreground">
                You have been referred to a great place! If you are not registered, this will also serve as an invite to ReferdBy and the referral will be listed under My Referrals. If you are already a member of ReferdBy, just sign in and the referral will be listed under My Referrals.
              </p>
            </div>
          )}

          {/* Regular auth forms - no recovery handling here */}
          {authView === 'forgotten_password' ? (
            <ForgotPasswordForm onBackToSignIn={handleBackToSignIn} />
          ) : /* Use custom form for invite-based signups, Supabase Auth for regular auth */ 
          authView === 'sign_up' && (inviteData.code || inviteCode) ? (
            <div className="space-y-4">
              <CustomSignupForm
                inviteCode={inviteData.code || inviteCode}
                inviteType={inviteData.type || inviteType}
                onSuccess={handleSuccess}
                onError={handleError}
              />
              <div className="text-center">
                <button 
                  onClick={() => setAuthView('sign_in')}
                  className="text-sm text-primary hover:underline"
                >
                  Already have an account? Sign in
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <SupabaseAuth
                supabaseClient={supabase}
                {...getAuthConfig(
                  isLoading,
                  inviteData.code || inviteCode,
                  handleAuthSubmit,
                  handleSuccess,
                  handleError,
                  authView
                )}
                view={authView}
                theme={isDark ? "dark" : "default"}
              />
              
              {/* Show toggle buttons when there's a referral code */}
              {referralCode && (
                <div className="text-center">
                  {authView === 'sign_in' ? (
                    <button 
                      onClick={() => setAuthView('sign_up')}
                      className="text-sm text-primary hover:underline"
                    >
                      New to ReferdBy? Sign up
                    </button>
                  ) : authView === 'sign_up' ? (
                    <button 
                      onClick={() => setAuthView('sign_in')}
                      className="text-sm text-primary hover:underline"
                    >
                      Already have an account? Sign in
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          )}
          
          {authView === 'sign_in' && (
            <button 
              onClick={handleForgotPassword}
              className="text-sm text-primary hover:underline mt-2 self-center"
            >
              Forgot password?
            </button>
          )}
        </div>
      </AuthContainer>
    </InviteValidator>
  );
};

export default Auth;