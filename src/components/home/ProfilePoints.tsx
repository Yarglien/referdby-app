
import { PartialProfile } from "@/types/profile.types";
import { useTranslation } from "react-i18next";

interface ProfilePointsProps {
  profile: PartialProfile | null;
}

export const ProfilePoints = ({ profile }: ProfilePointsProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col items-center space-y-4">
      {profile?.photo && (
        <div className="w-24 h-24 rounded-full overflow-hidden">
          <img 
            src={profile.photo} 
            alt={`${profile.first_name}'s profile`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="bg-primary rounded-lg p-4 text-center text-white w-full">
        <p className="text-lg">{t('redeem.currentPoints')}</p>
        <p className="text-4xl font-bold">
          {Math.ceil(profile?.current_points || 0)}
        </p>
        
      </div>
    </div>
  );
};
