import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { AuthContainer } from "@/components/auth/AuthContainer";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import logoLight from "@/assets/referdby-logo-light.png";
import logoDark from "@/assets/referdby-logo-dark.png";

const ReferralAuth = () => {
  const [searchParams] = useSearchParams();
  const { theme, systemTheme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();
  const referralCode = searchParams.get("referral_code");
  
  console.log('🎯 ReferralAuth page LOADED');
  console.log('🎯 Current URL:', window.location.href);
  console.log('🎯 Search params:', Object.fromEntries(searchParams.entries()));
  console.log('🎯 Referral code:', referralCode);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("signup");
  const [isLoading, setIsLoading] = useState(false);

  // Determine current theme
  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDark = currentTheme === 'dark';
  const logo = isDark ? logoDark : logoLight;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    console.log('🎯 Form submitted with:', { email, activeTab, referralCode });
    
    try {
      let result;
      if (activeTab === 'signup') {
        console.log('🎯 Attempting signup...');
        result = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });
      } else {
        console.log('🎯 Attempting signin...');
        result = await supabase.auth.signInWithPassword({
          email,
          password
        });
      }

      console.log('🎯 Auth result:', result);

      if (result.error) {
        console.log('🎯 Auth error:', result.error);
        toast({
          title: "Error",
          description: result.error.message,
          variant: "destructive",
        });
      } else {
        console.log('🎯 Auth success, user:', result.data.user?.id);
        toast({
          title: "Success",
          description: activeTab === 'signup' ? "Account created successfully!" : "Signed in successfully!",
        });
        
        // Handle referral claiming after successful auth
        if (referralCode && result.data.user) {
          console.log('🎯 Claiming referral(s):', referralCode, 'for user:', result.data.user.id);
          setTimeout(async () => {
            try {
              const codes = referralCode.split(',').map(c => c.trim()).filter(Boolean);

              let claimedCount = 0;
              for (const code of codes) {
                // Fetch the original referral details
                const { data: original, error: fetchErr } = await supabase
                  .from('referrals')
                  .select(`
                    id, status, expires_at, creator_id, restaurant_id, external_restaurant_id, is_external
                  `)
                  .eq('id', code)
                  .maybeSingle();

                if (fetchErr) {
                  console.error('🎯 Error fetching original referral:', fetchErr);
                  continue;
                }
                if (!original) continue;

                // Skip invalid or self-referrals
                if (original.creator_id === result.data.user.id) {
                  console.warn('🎯 Skipping self-referral');
                  continue;
                }
                if (original.expires_at && new Date(original.expires_at) < new Date()) {
                  console.warn('🎯 Skipping expired referral');
                  continue;
                }
                if (original.status !== 'active') {
                  console.warn('🎯 Skipping non-active referral');
                  continue;
                }

                // Prevent duplicates for same origin + restaurant + user
                const { data: existing } = await supabase
                  .from('referrals')
                  .select('id')
                  .eq('creator_id', original.creator_id)
                  .eq('restaurant_id', original.restaurant_id)
                  .eq('external_restaurant_id', original.external_restaurant_id)
                  .eq('scanned_by_id', result.data.user.id)
                  .maybeSingle();
                if (existing) {
                  console.warn('🎯 Duplicate claim detected, skipping');
                  continue;
                }

                const { error: insertErr } = await supabase
                  .from('referrals')
                  .insert({
                    creator_id: original.creator_id,
                    restaurant_id: original.restaurant_id,
                    external_restaurant_id: original.external_restaurant_id,
                    is_external: original.is_external,
                    status: 'scanned',
                    scanned_at: new Date().toISOString(),
                    scanned_by_id: result.data.user.id,
                    expires_at: original.expires_at
                  });
                if (!insertErr) claimedCount += 1;
              }

              if (claimedCount > 0) {
                toast({
                  title: 'Referral Claimed!',
                  description: claimedCount === 1 ? 'Your referral has been added to My Referrals.' : `${claimedCount} referrals have been added to My Referrals.`,
                });
              }
            } catch (error) {
              console.error('🎯 Error claiming referral(s):', error);
            }
            console.log('🎯 Navigating to my-referrals...');
            navigate('/my-referrals');
          }, 600);
        } else {
          console.log('🎯 No referral to claim, navigating to home...');
          navigate('/');
        }
      }
    } catch (error) {
      console.error("🎯 Auth error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  console.log('🎯 ReferralAuth rendering component');

  return (
    <AuthContainer>
      <div className="w-full max-w-md mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src={logo}
            alt="ReferdBy Logo"
            className="h-20 w-auto object-contain"
          />
        </div>

        {/* Welcome message with referral info */}
        <div className="mb-8 text-center space-y-4">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 border border-primary/20">
            <div className="text-4xl mb-3">🎉</div>
            <h1 className="text-2xl font-bold text-foreground mb-3">
              You've Been Referred!
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Someone has recommended a great place to you! Join ReferdBy to claim your referral and start earning points when you visit.
            </p>
            {referralCode && (
              <div className="mt-4 p-3 bg-background/50 rounded-md border">
                <p className="text-sm text-muted-foreground">
                  <strong>Referral Code:</strong> {referralCode.slice(0, 8)}...
                </p>
              </div>
            )}
          </div>
          
          <div className="bg-accent/5 rounded-lg p-4 border border-accent/20">
            <p className="text-sm text-muted-foreground">
              💡 <strong>How it works:</strong> After signing up or logging in, this referral will automatically be added to your "My Referrals" list. Visit the recommended place to earn points!
            </p>
          </div>
        </div>

        {/* Auth tabs */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signup" className="text-sm font-medium">
                  Create Account
                </TabsTrigger>
                <TabsTrigger value="signin" className="text-sm font-medium">
                  Sign In
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="signup" className="space-y-6 mt-0">
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold">Join ReferdBy</h3>
                  <p className="text-sm text-muted-foreground">
                    Create your account to claim your referral and start earning points!
                  </p>
                </div>
                
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="h-11"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium">
                      Password
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a secure password"
                      className="h-11"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-11 text-base font-medium" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "🎯 Sign Up & Claim Referral"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signin" className="space-y-6 mt-0">
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold">Welcome Back</h3>
                  <p className="text-sm text-muted-foreground">
                    Sign in to your account to claim this referral
                  </p>
                </div>
                
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="h-11"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-sm font-medium">
                      Password
                    </Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="h-11"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-11 text-base font-medium" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing In..." : "🎯 Sign In & Claim Referral"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            🔒 Your data is secure and your referral will be automatically processed
          </p>
        </div>
      </div>
    </AuthContainer>
  );
};

export default ReferralAuth;