import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "next-themes";
import logoLight from "@/assets/referdby-logo-light.png";
import logoDark from "@/assets/referdby-logo-dark.png";

interface SimpleSignupProps {
  inviteId?: string;
}

export const SimpleSignup = ({ inviteId }: SimpleSignupProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { theme, systemTheme } = useTheme();
  
  const currentTheme = theme === 'system' ? systemTheme : theme;
  const logo = currentTheme === 'dark' ? logoDark : logoLight;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, get invite details if invite ID provided
      let inviteData = null;
      if (inviteId) {
        const { data, error } = await supabase
          .from('invites')
          .select('invite_type, restaurant_id, created_by')
          .eq('id', inviteId)
          .single();
        
        if (error) {
          throw new Error('Invalid invite link');
        }
        
        inviteData = data;
        console.log('Found invite:', inviteData);
      }

      // Sign up with invite data in metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            invite_id: inviteId,
            invite_type: inviteData?.invite_type || 'customer',
            restaurant_id: inviteData?.restaurant_id,
            created_by: inviteData?.created_by
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Account created as ${inviteData?.invite_type || 'customer'}`,
      });

      // Redirect to home
      window.location.href = '/';

    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="flex justify-center">
        <img 
          src={logo}
          alt="ReferdBy Logo"
          className="h-20 w-auto object-contain"
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Sign Up for ReferdBy</CardTitle>
          {inviteId && <p className="text-sm text-muted-foreground">You've been invited to join!</p>}
        </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>
      </CardContent>
    </Card>
    </div>
  );
};