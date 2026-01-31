import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RestaurantNav } from "@/components/RestaurantNav";
import { DaySchedule } from "@/components/restaurant/schedule/DaySchedule";
import { TimezoneSelect } from "@/components/restaurant/schedule/TimezoneSelect";
import { useOpeningHours } from "@/hooks/useOpeningHours";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from 'react-i18next';

const OpeningHours = () => {
  const navigate = useNavigate();
  const { timezone, schedule, setTimezone, handleSave, handleDayUpdate } = useOpeningHours();
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

  useEffect(() => {
    if (!profile && profile !== undefined) {
      navigate('/auth');
    } else if (profile?.role !== 'manager') {
      navigate('/');
    }
  }, [profile, navigate]);

  if (profile === undefined) {
    return <div className="flex items-center justify-center min-h-screen">{t('common.loading')}</div>;
  }

  if (!profile || profile.role !== 'manager') {
    return null;
  }

  const handleDayToggle = (day: string) => {
    const index = schedule.findIndex(d => d.day_of_week === day);
    handleDayUpdate(index, { is_open: !schedule[index].is_open });
  };

  const handleTimeChange = (day: string, type: 'open_time' | 'close_time', value: string) => {
    const index = schedule.findIndex(d => d.day_of_week === day);
    handleDayUpdate(index, { [type]: value });
  };

  return (
    <div className="min-h-screen bg-background pb-20 pt-safe-top">
      <header className="p-4 border-b flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/restaurant-manager")}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold">{t('restaurant.openingHours')}</h1>
      </header>
      
      <main className="p-4 space-y-8">
        <TimezoneSelect value={timezone} onChange={setTimezone} />

        <div className="space-y-6">
          {schedule.map((day) => (
            <DaySchedule
              key={day.day_of_week}
              day={day}
              onToggleDay={handleDayToggle}
              onTimeChange={handleTimeChange}
            />
          ))}
        </div>

        <div className="flex justify-center">
          <Button onClick={handleSave}>
            {t('restaurant.saveOpeningHours')}
          </Button>
        </div>
      </main>

      <RestaurantNav />
    </div>
  );
};

export default OpeningHours;