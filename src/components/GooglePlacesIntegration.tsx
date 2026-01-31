import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { UseFormReturn } from "react-hook-form";
import { MapPin, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from 'react-i18next';

interface GooglePlacesIntegrationProps {
  form: UseFormReturn<any>;
}

export const GooglePlacesIntegration = ({ form }: GooglePlacesIntegrationProps) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchGooglePlacesData = async () => {
    console.log("=== GOOGLE PLACES BUTTON CLICKED ===");
    setIsLoading(true);
    console.log("=== LOADING STATE SET TO TRUE ===");
    
    try {
      console.log("=== STARTING GOOGLE PLACES FUNCTION ===");
      const restaurantName = form.getValues('restaurantName');
      const latitude = form.getValues('latitude');
      const longitude = form.getValues('longitude');
      const plusCode = form.getValues('plus_code');
      
      console.log("Form values:", { restaurantName, latitude, longitude, plusCode });
      
      if (!restaurantName?.trim()) {
        console.log("=== ERROR: No restaurant name ===");
        toast({
          title: t('common.error'),
          description: "Please enter restaurant name first",
          variant: "destructive",
        });
        return;
      }

      if (!latitude && !longitude && !plusCode?.trim()) {
        console.log("=== ERROR: No location data ===");
        toast({
          title: t('common.error'),
          description: "Please enter either GPS coordinates or Google Plus Code",
          variant: "destructive",
        });
        return;
      }

      const requestBody = { restaurantName, latitude, longitude, plusCode };
      console.log("=== CALLING SUPABASE FUNCTION ===");
      console.log("Request body:", requestBody);
      
      console.log("Supabase client:", !!supabase);
      console.log("Functions available:", !!supabase.functions);
      
      // Add timeout to function call (20 seconds for international API calls)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out after 20 seconds')), 20000);
      });

      const functionPromise = supabase.functions.invoke('google-places-simple', {
        body: requestBody
      });

      const { data, error } = await Promise.race([functionPromise, timeoutPromise]) as any;

      console.log("=== FUNCTION RESPONSE ===");
      console.log("Data:", data);
      console.log("Error:", error);

      if (error) {
        console.log("=== SUPABASE ERROR ===", error);
        throw new Error(`Service error: ${error.message}`);
      }

      if (!data) {
        console.log("=== NO DATA RECEIVED ===");
        throw new Error('No data received');
      }

      console.log("=== PROCESSING RESPONSE ===");
      console.log("Response data structure:", JSON.stringify(data, null, 2));
      console.log("data.success:", data.success);
      console.log("data.restaurant:", data.restaurant);
      console.log("data.restaurant?.matched:", data.restaurant?.matched);
      
      if (data.success && data.restaurant?.matched) {
        const restaurant = data.restaurant;
        console.log("=== RESTAURANT FOUND ===", restaurant);
        
        // Populate GPS coordinates
        if (restaurant.latitude && restaurant.longitude) {
          form.setValue('latitude', restaurant.latitude);
          form.setValue('longitude', restaurant.longitude);
          console.log("GPS coordinates set:", restaurant.latitude, restaurant.longitude);
        }
        
        // Parse and populate address components using Google's structured data
        if (restaurant.address_components) {
          console.log("Processing address components:", restaurant.address_components);
          
          let streetNumber = '';
          let streetName = '';
          
          restaurant.address_components.forEach((component: any) => {
            const types = component.types;
            const longName = component.long_name;
            
            if (types.includes('street_number')) {
              streetNumber = longName;
            } else if (types.includes('route')) {
              streetName = longName;
            } else if (types.includes('sublocality') || types.includes('locality')) {
              // Use sublocality first, fallback to locality for city/town
              if (!form.getValues('county_region') || types.includes('sublocality')) {
                form.setValue('county_region', longName);
              }
            } else if (types.includes('administrative_area_level_2')) {
              // County/district level
              if (!form.getValues('county_region')) {
                form.setValue('county_region', longName);
              }
            } else if (types.includes('administrative_area_level_1')) {
              // State/province level
              form.setValue('state', longName);
            } else if (types.includes('postal_code')) {
              form.setValue('postal_code', longName);
            } else if (types.includes('country')) {
              form.setValue('country', longName);
            }
          });
          
          // Combine street number and name
          if (streetNumber && streetName) {
            form.setValue('street_number', streetNumber);
            form.setValue('street_name', streetName);
          } else if (streetName) {
            // If no street number, check if the street name contains a number
            const streetMatch = streetName.match(/^(\d+[\w]*)\s+(.+)/);
            if (streetMatch) {
              form.setValue('street_number', streetMatch[1]);
              form.setValue('street_name', streetMatch[2]);
            } else {
              form.setValue('street_name', streetName);
            }
          }
          
          console.log("Address populated:", {
            street_number: form.getValues('street_number'),
            street_name: form.getValues('street_name'),
            county_region: form.getValues('county_region'),
            state: form.getValues('state'),
            postal_code: form.getValues('postal_code'),
            country: form.getValues('country')
          });
        } else if (restaurant.address) {
          // Fallback to parsing formatted address for older API responses
          console.log("Using fallback address parsing for:", restaurant.address);
          const addressParts = restaurant.address.split(', ');
          
          if (addressParts[0]) {
            const streetMatch = addressParts[0].match(/^(\d+[\w]*)\s+(.+)/);
            if (streetMatch) {
              form.setValue('street_number', streetMatch[1]);
              form.setValue('street_name', streetMatch[2]);
            } else {
              form.setValue('street_name', addressParts[0]);
            }
          }
          
          if (addressParts.length >= 2) {
            form.setValue('county_region', addressParts[1] || '');
          }
          if (addressParts.length >= 3) {
            form.setValue('state', addressParts[2]?.replace(/\s[\w\d\s-]{3,10}.*/, '') || '');
          }
          if (addressParts.length > 3) {
            form.setValue('country', addressParts[addressParts.length - 1]);
          }
          
          // Extract postal code using international patterns
          const postalMatch = restaurant.address.match(/\b([\w\d\s-]{3,10})\b(?=,?\s*[A-Z]{2,}(?:\s|$))/);
          if (postalMatch) {
            form.setValue('postal_code', postalMatch[1].trim());
          }
        }
        
        // Update restaurant name if different
        if (restaurant.name && restaurant.name !== form.getValues('restaurantName')) {
          form.setValue('restaurantName', restaurant.name);
        }
        
        // Update phone number
        if (restaurant.phone) {
          form.setValue('telephoneNumber', restaurant.phone);
        }
        
        // Update website
        if (restaurant.website) {
          form.setValue('website', restaurant.website);
        }

        // Save photos if available (they come as base64 from the edge function now)
        if (restaurant.photos && restaurant.photos.length > 0) {
          console.log("Saving photos:", restaurant.photos.length);
          form.setValue('photos', restaurant.photos);
        }

        // Process opening hours for redemption schedule
        if (restaurant.opening_hours?.weekday_text) {
          console.log("Processing opening hours:", restaurant.opening_hours.weekday_text);
          const schedule = parseOpeningHours(restaurant.opening_hours.weekday_text);
          if (schedule) {
            console.log("Parsed schedule:", schedule);
            // Store schedule in localStorage for the opening hours page to pick up
            localStorage.setItem('importedSchedule', JSON.stringify(schedule));
            
            toast({
              title: "Opening Hours Imported",
              description: "Opening hours have been imported. Save the form, then go to Opening Hours to review and apply them.",
            });
          }
        }

        toast({
          title: "Restaurant Found!",
          description: `${restaurant.message}${restaurant.rating ? ` (Rating: ${restaurant.rating}/5)` : ''}`,
        });
      } else if (data.success && !data.restaurant?.matched) {
        console.log("=== NO RESTAURANT MATCH ===");
        toast({
          title: "No Match Found",
          description: data.restaurant?.message || "No matching restaurant found in Google Places. Try adjusting the restaurant name or location.",
          variant: "destructive",
        });
      } else {
        console.log("=== API ERROR ===", data);
        toast({
          title: "Search Failed",
          description: data.error || "Unable to search for restaurants. Please check your location data and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.log("=== CATCH BLOCK ERROR ===", error);
      console.log("Error message:", error.message);
      console.log("Error stack:", error.stack);
      
      let errorMessage = "Failed to fetch restaurant data";
      
      if (error.message.includes('timeout') || error.message.includes('not responding')) {
        errorMessage = "Request timed out - Google Places API is not responding. Please try again.";
      } else if (error.message.includes('Service error')) {
        errorMessage = error.message.replace('Service error: ', '');
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = "Network error - please check your internet connection and try again.";
      } else {
        errorMessage = `${errorMessage}: ${error.message}`;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      console.log("=== SETTING LOADING TO FALSE ===");
      setIsLoading(false);
    }
  };

  const constructAddress = () => {
    const streetNumber = form.getValues('street_number');
    const streetName = form.getValues('street_name');
    const countyRegion = form.getValues('county_region');
    const state = form.getValues('state');
    const postalCode = form.getValues('postal_code');
    const country = form.getValues('country');

    const addressParts = [
      streetNumber,
      streetName,
      countyRegion,
      state,
      postalCode,
      country
    ].filter(Boolean);

    return addressParts.join(', ');
  };

  // Helper function to parse Google Places opening hours into our schedule format
  const parseOpeningHours = (weekdayText: string[]) => {
    try {
      const daysMap = {
        'monday': 'Monday',
        'tuesday': 'Tuesday', 
        'wednesday': 'Wednesday',
        'thursday': 'Thursday',
        'friday': 'Friday',
        'saturday': 'Saturday',
        'sunday': 'Sunday'
      };

      const schedule: any = {};

      weekdayText.forEach(dayStr => {
        console.log('Parsing day string:', dayStr);
        
        // Parse format like "Monday: 7:00 AM – 9:30 PM" or "Wednesday: 7:00 AM – 1:00 PM"
        const match = dayStr.match(/^(\w+):\s*(.+)$/);
        if (!match) return;

        const [, dayName, hoursStr] = match;
        const dayKey = dayName.toLowerCase();
        
        console.log(`Processing ${dayName} (${dayKey}): ${hoursStr}`);
        
        if (daysMap[dayKey]) {
          if (hoursStr.toLowerCase().includes('closed')) {
            schedule[dayKey] = {
              isOpen: false,
              openTime: '09:00',
              closeTime: '17:00'
            };
          } else {
            // Parse times like "7:00 AM – 9:30 PM" - handle both en dash (–) and hyphen (-)
            const timeMatch = hoursStr.match(/(\d{1,2}:\d{2})\s*([AP]M)\s*[–\-]\s*(\d{1,2}:\d{2})\s*([AP]M)/i);
            if (timeMatch) {
              const [, openTime, openPeriod, closeTime, closePeriod] = timeMatch;
              const convertedOpen = convertTo24Hour(openTime, openPeriod);
              const convertedClose = convertTo24Hour(closeTime, closePeriod);
              
              console.log(`${dayName}: ${openTime} ${openPeriod} -> ${convertedOpen}, ${closeTime} ${closePeriod} -> ${convertedClose}`);
              
              schedule[dayKey] = {
                isOpen: true,
                openTime: convertedOpen,
                closeTime: convertedClose
              };
            } else {
              console.log(`Failed to parse times for ${dayName}: ${hoursStr}`);
              // Default fallback
              schedule[dayKey] = {
                isOpen: true,
                openTime: '09:00',
                closeTime: '17:00'
              };
            }
          }
        }
      });

      console.log('Final parsed schedule:', schedule);
      return schedule;
    } catch (error) {
      console.error('Error parsing opening hours:', error);
      return null;
    }
  };

  // Helper function to convert 12-hour to 24-hour format
  const convertTo24Hour = (time: string, period: string) => {
    const [hours, minutes] = time.split(':');
    let hour24 = parseInt(hours);
    
    if (period.toUpperCase() === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (period.toUpperCase() === 'AM' && hour24 === 12) {
      hour24 = 0;
    }
    
    return `${hour24.toString().padStart(2, '0')}:${minutes}`;
  };


  // Helper function to apply parsed schedule to redemption schedule
  const applyScheduleToRedemption = (schedule: any) => {
    // Store schedule in localStorage for the redemption schedule page to pick up
    localStorage.setItem('importedSchedule', JSON.stringify(schedule));
    toast({
      title: "Schedule Ready",
      description: "Go to Redemption Schedule to apply the imported hours.",
    });
  };


  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <MapPin className="h-5 w-5" />
        {t('restaurant.form.googlePlacesIntegration')}
      </h3>
      
      <p className="text-sm text-muted-foreground">
        {t('restaurant.form.findMatchingRestaurant')}
      </p>
      
      <Button 
        type="button"
        onClick={fetchGooglePlacesData}
        disabled={isLoading}
        className="bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('restaurant.form.fetchingFromGoogle')}
          </>
        ) : (
          <>
            <MapPin className="mr-2 h-4 w-4" />
            {t('restaurant.form.findAutoFill')}
          </>
        )}
      </Button>
    </div>
  );
};