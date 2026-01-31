
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Schedule } from "@/integrations/supabase/types/schedule.types";
import { JsonValue } from "@/integrations/supabase/types/activity.types";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const useOpeningHours = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [timezone, setTimezone] = useState("");
  const [schedule, setSchedule] = useState<Schedule[]>(
    DAYS_OF_WEEK.map(day => ({
      day_of_week: day,
      is_open: false,
      open_time: "09:00",
      close_time: "17:00",
    }))
  );

  useEffect(() => {
    const fetchOpeningHours = async () => {
      try {
        console.log('🔍 Fetching opening hours...');
        
        // Check for imported schedule from Google Places first
        const importedScheduleJson = localStorage.getItem('importedSchedule');
        if (importedScheduleJson) {
          try {
            const importedSchedule = JSON.parse(importedScheduleJson);
            console.log('📅 Found imported Google Places schedule:', importedSchedule);
            
            // Convert imported schedule format to our format
            const convertedSchedule = DAYS_OF_WEEK.map((day) => {
              const dayKey = day.toLowerCase();
              const importedDay = importedSchedule[dayKey];
              
              if (importedDay) {
                return {
                  day_of_week: day,
                  is_open: importedDay.isOpen,
                  open_time: importedDay.openTime,
                  close_time: importedDay.closeTime,
                };
              }
              
              return {
                day_of_week: day,
                is_open: false,
                open_time: "09:00",
                close_time: "17:00",
              };
            });
            
            console.log('📅 Converted imported schedule:', convertedSchedule);
            setSchedule(convertedSchedule);
            localStorage.removeItem('importedSchedule'); // Clean up after use
            return; // Use imported schedule instead of database
          } catch (parseError) {
            console.error('Error parsing imported schedule:', parseError);
            localStorage.removeItem('importedSchedule');
          }
        }
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('❌ No user found');
          toast({
            title: "Authentication Error",
            description: "Please sign in to view opening hours",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }

        const { data: restaurant, error: restaurantError } = await supabase
          .from("restaurants")
          .select("id, timezone, opening_hours_schedule, redemption_schedule")
          .eq("manager_id", user.id)
          .single();

        if (restaurantError) {
          console.error('❌ Restaurant fetch error:', restaurantError);
          throw restaurantError;
        }

        if (restaurant?.timezone) {
          setTimezone(restaurant.timezone);
        }

        if (restaurant?.opening_hours_schedule) {
          const savedSchedule = restaurant.opening_hours_schedule as Schedule[];
          console.log('📅 Saved schedule from database:', savedSchedule);
          
          const updatedSchedule = DAYS_OF_WEEK.map((day) => {
            const existingDay = savedSchedule.find(
              (s) => s.day_of_week === day || s.day_of_week === day.toLowerCase()
            );
            console.log(`📅 Looking for ${day}, found:`, existingDay);
            return existingDay || {
              day_of_week: day,
              is_open: false,
              open_time: "09:00",
              close_time: "17:00",
            };
          });
          console.log('📅 Final schedule from database:', updatedSchedule);
          setSchedule(updatedSchedule);
        }

        // If no redemption schedule exists, create default 24/7 schedule
        if (!restaurant?.redemption_schedule || (restaurant.redemption_schedule as Schedule[]).length === 0) {
          const defaultRedemptionSchedule = DAYS_OF_WEEK.map(day => ({
            day_of_week: day,
            is_open: true,
            open_time: "00:00",
            close_time: "23:59"
          }));

          await supabase
            .from("restaurants")
            .update({ 
              redemption_schedule: defaultRedemptionSchedule as unknown as JsonValue[]
            })
            .eq("id", restaurant.id);
        }
      } catch (error) {
        console.error("Error in fetchOpeningHours:", error);
        toast({
          title: "Error",
          description: "Failed to load opening hours",
          variant: "destructive",
        });
      }
    };

    fetchOpeningHours();
  }, [navigate, toast]);

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "Please sign in to update opening hours",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const { data: restaurant, error: restaurantError } = await supabase
        .from("restaurants")
        .select("id, redemption_schedule")
        .eq("manager_id", user.id)
        .single();

      if (restaurantError) throw restaurantError;

      console.log('💾 Saving schedule:', schedule);

      // Check if redemption schedule is empty or doesn't exist
      const hasRedemptionSchedule = restaurant.redemption_schedule && 
        Array.isArray(restaurant.redemption_schedule) && 
        restaurant.redemption_schedule.length > 0;

      console.log('🔍 Checking redemption schedule:', {
        hasRedemptionSchedule,
        currentRedemptionSchedule: restaurant.redemption_schedule
      });

      const updateData: { timezone: string; opening_hours_schedule: JsonValue[]; redemption_schedule?: JsonValue[] } = {
        timezone,
        opening_hours_schedule: schedule as unknown as JsonValue[]
      };

      // If no redemption schedule exists, copy opening hours to redemption schedule
      if (!hasRedemptionSchedule) {
        console.log('📋 Copying opening hours to redemption schedule (first time setup)');
        updateData.redemption_schedule = schedule as unknown as JsonValue[];
      }

      const { error: updateError } = await supabase
        .from("restaurants")
        .update(updateData)
        .eq("id", restaurant.id);

      if (updateError) throw updateError;

      await queryClient.invalidateQueries({ queryKey: ['restaurant'] });
      await queryClient.invalidateQueries({ queryKey: ['restaurant-basic'] });
      await queryClient.invalidateQueries({ queryKey: ['restaurants'] });

      toast({
        title: "Success",
        description: "Opening hours updated successfully",
      });

      setTimeout(() => {
        navigate("/redemption-schedule");
      }, 1000);
    } catch (error) {
      console.error("Error saving opening hours:", error);
      toast({
        title: "Error",
        description: "Failed to update opening hours",
        variant: "destructive",
      });
    }
  };

  const handleDayUpdate = (index: number, updates: Partial<Schedule>) => {
    setSchedule((current) =>
      current.map((day, i) => (i === index ? { ...day, ...updates } : day))
    );
  };

  return {
    timezone,
    schedule,
    setTimezone,
    handleSave,
    handleDayUpdate,
  };
};
