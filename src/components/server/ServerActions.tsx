
import { Dice6 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { commonButtons } from "@/config/buttonConfig";
import { generateRollToken } from "@/utils/tokenUtils";
import { useQuery } from "@tanstack/react-query";
import { ReferralQRDialog } from "@/components/ReferralQRDialog";
import { toast } from "sonner";

export const ServerActions = () => {
  const navigate = useNavigate();
  const [showQR, setShowQR] = useState(false);
  const [tokenId, setTokenId] = useState<string>("");

  const { data: profileData } = useQuery({
    queryKey: ['server-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select(`
          restaurant_id,
          restaurants (
            has_roll_meal_offer
          )
        `)
        .eq('id', user.id)
        .single();

      return profile;
    }
  });

  const handleGenerateToken = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Authentication required");
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('restaurant_id')
        .eq('id', user.id)
        .single();

      if (!profile?.restaurant_id) {
        toast.error("No restaurant associated with your account");
        return;
      }

      const token = await generateRollToken(profile.restaurant_id, user.id);
      if (token) {
        setTokenId(token.id);
        setShowQR(true);
      } else {
        toast.error("Failed to generate token");
      }
    } catch (error) {
      console.error('Error generating token:', error);
      toast.error("An error occurred while generating the token");
    }
  };

  // Filter buttons based on roll meal offer status
  const visibleCommonButtons = commonButtons.filter(button => {
    // Filter out both Active Rollers and Roll for Meal buttons if the option is disabled
    if (button.label === "Active Rollers" || button.label === "Code for Roll for Meal") {
      return profileData?.restaurants?.has_roll_meal_offer;
    }
    return true;
  });

  return (
    <div className="flex flex-col space-y-4 max-w-xl mx-auto">
      <ReferralQRDialog
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        referralCode={tokenId}
        type="referral"
        title="Roll for a Free Meal"
        description="Come back in the next 4 days. Scan this code for the opportunity of a free meal on your next visit."
      />

      {visibleCommonButtons.map((item) => (
        <button
          key={item.label}
          onClick={() => {
            if (item.label === "Code for Roll for Meal") {
              handleGenerateToken();
            } else {
              navigate(item.path);
            }
          }}
          className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent/10 transition-colors"
        >
          <item.icon className={`w-6 h-6 ${item.label === "Code for Roll for Meal" ? "text-primary" : "text-primary"}`} />
          <span className="font-medium">{item.label}</span>
        </button>
      ))}
    </div>
  );
};
