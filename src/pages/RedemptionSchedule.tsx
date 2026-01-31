
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { RestaurantNav } from "@/components/RestaurantNav";
import { RedemptionPercentage } from "@/components/restaurant/schedule/RedemptionPercentage";
import { ScheduleTypeSelector } from "@/components/restaurant/schedule/ScheduleTypeSelector";
import { ScheduleSection } from "@/components/restaurant/schedule/ScheduleSection";
import { useRedemptionSchedule } from "@/hooks/useRedemptionSchedule";
import { LoadingErrorState } from "@/components/restaurant/activity/LoadingErrorState";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from 'react-i18next';

const RedemptionSchedule = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      return data;
    },
  });
  
  const {
    redemptionPercentage,
    dineInSchedule,
    takeAwaySchedule,
    usesSameSchedule,
    handleToggleDineInDay,
    handleToggleTakeAwayDay,
    handleDineInTimeChange,
    handleTakeAwayTimeChange,
    handleScheduleTypeChange,
    setRedemptionPercentage,
    handleSave,
    isLoading,
    error
  } = useRedemptionSchedule(() => navigate("/server-administration"));

  useEffect(() => {
    if (!profile && profile !== undefined) {
      navigate('/auth');
    } else if (profile?.role !== 'manager') {
      navigate('/');
    }
  }, [profile, navigate]);

  if (profile === undefined || isLoading) {
    return (
      <div className="min-h-screen bg-background pt-safe-top">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/restaurant-manager")}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl font-bold">{t('restaurant.redemptionProfiles')}</h1>
          </div>
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">{t('restaurant.loadingRedemptionProfile')}</p>
            </div>
          </div>
        </div>
        <RestaurantNav />
      </div>
    );
  }

  if (!profile || profile.role !== 'manager') {
    return null;
  }

  if (error) {
    return <LoadingErrorState isLoading={false} error={error} />;
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-safe-top">
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/restaurant-manager")}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold">{t('restaurant.redemptionProfiles')}</h1>
        </div>

        <div className="space-y-8">
          {/* Maximum Redemption Percentage Section */}
          <RedemptionPercentage 
            initialPercentage={redemptionPercentage} 
            onChange={setRedemptionPercentage} 
          />
          
          {/* Redemption Schedule Section */}
          <div className="p-4 border rounded-lg space-y-6">
            {/* Schedule Type Toggle */}
            <ScheduleTypeSelector 
              usesSameSchedule={usesSameSchedule}
              onChange={handleScheduleTypeChange}
            />
            
            {/* Dine-In Schedule */}
            <ScheduleSection
              title={t('restaurant.dineInSchedule')}
              schedule={dineInSchedule}
              onToggleDay={handleToggleDineInDay}
              onTimeChange={handleDineInTimeChange}
            />
            
            {/* Take-Away Schedule (only shown if different from dine-in) */}
            {!usesSameSchedule && (
              <div className="mt-6 pt-6 border-t">
                <ScheduleSection
                  title={t('restaurant.takeAwaySchedule')}
                  schedule={takeAwaySchedule}
                  onToggleDay={handleToggleTakeAwayDay}
                  onTimeChange={handleTakeAwayTimeChange}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={handleSave}
            disabled={isLoading}
          >
            {t('restaurant.saveRedemptionProfile')}
          </Button>
        </div>
      </div>
      <RestaurantNav />
    </div>
  );
};

export default RedemptionSchedule;
