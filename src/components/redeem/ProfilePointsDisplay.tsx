
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";

interface ProfilePointsDisplayProps {
  profile: {
    photo?: string;
    first_name?: string;
    last_name?: string;
    current_points?: number;
    home_currency?: string;
  } | null;
}

export const ProfilePointsDisplay = ({ profile }: ProfilePointsDisplayProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col items-center space-y-6">
      <Avatar className="w-24 h-24">
        <AvatarImage src={profile?.photo || undefined} alt={profile?.first_name} />
        <AvatarFallback>
          {profile?.first_name?.[0]}{profile?.last_name?.[0]}
        </AvatarFallback>
      </Avatar>

      <h2 className="text-2xl font-semibold">
        {profile?.first_name} {profile?.last_name}
      </h2>

      <div className="w-full max-w-md bg-primary p-6 rounded-lg text-center">
        <div className="text-4xl font-bold text-white">
          {Math.ceil(profile?.current_points || 0)}
        </div>
        <div className="text-white">{t('redeem.currentPointsBalance')}</div>
      </div>
    </div>
  );
};
