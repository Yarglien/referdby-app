
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useIsMobile } from "@/hooks/use-mobile";

interface ReferralHeaderProps {
  onCreateMultiple?: () => void;
  onShowFavorites?: () => void;
}

export const ReferralHeader = ({ onCreateMultiple, onShowFavorites }: ReferralHeaderProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div className="p-4 flex items-center justify-between border-b">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/')}
          className="text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-xl font-semibold">{t('referrals.generateReferrals')}</h1>
      </div>
      
      <div className="flex gap-2">
        {onShowFavorites && (
          <Button 
            onClick={onShowFavorites}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Heart className="h-4 w-4" />
            {!isMobile && "Favorites"}
          </Button>
        )}
        {onCreateMultiple && (
          <Button 
            onClick={onCreateMultiple}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {isMobile ? "Multi" : t('referrals.multipleRecommendations')}
          </Button>
        )}
      </div>
    </div>
  );
};
