
import { useNavigate } from 'react-router-dom';
import { PartialProfile } from "@/types/profile.types";
import { useTheme } from "next-themes";
import { useState } from "react";
import { InviteCodesDialog } from "@/components/invites/InviteCodesDialog";
import { useViewMode } from "@/contexts/ViewModeContext";
import { useTranslation } from 'react-i18next';

interface MenuGridProps {
  profile: PartialProfile | null;
}

export const MenuGrid = ({ profile }: MenuGridProps) => {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const { viewMode } = useViewMode();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const { t } = useTranslation();
  
  // Determine which dice image to use based on the theme
  const diceImage = resolvedTheme === 'dark' 
    ? "/lovable-uploads/dice-dark.png" 
    : "/lovable-uploads/dice-highlight.png";
  
  // Determine which invite image to use based on the theme
  const inviteImage = resolvedTheme === 'dark' 
    ? "/lovable-uploads/referral-dark.png" 
    : "/lovable-uploads/referral-light.png";
  
  // Determine which referral image to use based on the theme
  const referralImage = resolvedTheme === 'dark' 
    ? "/lovable-uploads/make-referral-dark.png" 
    : "/lovable-uploads/make-referral-light.png";
    
  // Determine which my referrals image to use based on the theme
  const myReferralsImage = resolvedTheme === 'dark' 
    ? "/lovable-uploads/my-referrals-dark.png" 
    : "/lovable-uploads/my-referrals-light.png";
  
  // Determine which redeem points image to use based on the theme
  const redeemPointsImage = resolvedTheme === 'dark' 
    ? "/lovable-uploads/redeem-points-dark.png" 
    : "/lovable-uploads/redeem-points-light.png";
  
  // Determine which share points image to use based on the theme
  const sharePointsImage = resolvedTheme === 'dark'
    ? "/lovable-uploads/share-points-dark.png"
    : "/lovable-uploads/share-points-light.png";
  
  // Highlighted icons for hover/focus states
  const highlightedIcons = {
    referral: "/lovable-uploads/make-referral-highlight.png",
    myReferrals: "/lovable-uploads/my-referrals-highlight.png",
    invite: "/lovable-uploads/referral-highlight.png",
    redeem: "/lovable-uploads/redeem-points-highlight.png",
    sharePoints: "/lovable-uploads/share-points-highlight.png",
    dice: "/lovable-uploads/dice-light.png"
  };
  
  const menuItems = (profile?.role === 'manager' || profile?.role === 'server') && viewMode === 'restaurant'
    ? [] 
    : [
      { 
        icon: referralImage, 
        highlightedIcon: highlightedIcons.referral,
        label: t('home.makeReferral'), 
        route: "/make-referral" 
      },
      { 
        icon: myReferralsImage, 
        highlightedIcon: highlightedIcons.myReferrals,
        label: t('home.myReferrals'), 
        route: "/my-referrals" 
      },
      { 
        icon: inviteImage, 
        highlightedIcon: highlightedIcons.invite,
        label: t('home.inviteOthers'), 
        onClick: () => setShowInviteDialog(true) 
      },
      { 
        icon: redeemPointsImage, 
        highlightedIcon: highlightedIcons.redeem,
        label: t('home.redeemPoints'), 
        route: "/redeem-points" 
      },
      { 
        icon: sharePointsImage, 
        highlightedIcon: highlightedIcons.sharePoints,
        label: t('home.sharePoints'), 
        route: "/share-points" 
      },
      { 
        icon: diceImage, 
        highlightedIcon: highlightedIcons.dice,
        label: t('home.freeMealRoll'), 
        route: "/roll-token" 
      },
    ];

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => item.route ? navigate(item.route) : item.onClick?.()}
            className="group flex flex-col items-center justify-center p-3 space-y-2 rounded-lg border border-border hover:bg-accent transition-colors"
          >
            <div className="relative h-8 w-8">
              <img 
                src={item.icon} 
                alt={item.label} 
                className="h-8 w-8 transition-opacity group-hover:opacity-0 group-focus:opacity-0" 
              />
              <img 
                src={item.highlightedIcon} 
                alt={`${item.label} highlighted`} 
                className="absolute top-0 left-0 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100" 
              />
            </div>
            <span className={`text-sm text-center transition-colors ${
              resolvedTheme === 'dark' 
                ? 'text-white group-hover:!text-black group-focus:!text-black' 
                : ''
            }`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
      
      <InviteCodesDialog 
        open={showInviteDialog} 
        onOpenChange={setShowInviteDialog} 
      />
    </>
  );
};
