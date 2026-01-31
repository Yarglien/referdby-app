import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MapPin, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { SUPPORTED_CURRENCIES } from "@/utils/currencyUtils";
import { getCurrencyByCountry } from "@/utils/currencyMapping";
import { useState } from "react";
import { GooglePlacesIntegration } from "./GooglePlacesIntegration";
import { useTranslation } from 'react-i18next';

interface RestaurantFormFieldsProps {
  form: UseFormReturn<any>;
}

export const RestaurantFormFields = ({ form }: RestaurantFormFieldsProps) => {
  const { t } = useTranslation();
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);

  const formatWebsiteUrl = (url: string) => {
    if (!url) return url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    setIsGeocodingLoading(true);
    try {
      // Using OpenStreetMap Nominatim for reverse geocoding (free service)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }
      
      const data = await response.json();
      
      if (data.address) {
        const address = data.address;
        
        // Auto-populate address fields
        form.setValue('street_number', address.house_number || '');
        form.setValue('street_name', address.road || '');
        form.setValue('county_region', address.county || address.state_district || '');
        form.setValue('state', address.state || '');
        form.setValue('country', address.country || '');
        form.setValue('postal_code', address.postcode || '');
        
        // Auto-set currency based on country
        if (address.country) {
          const currency = getCurrencyByCountry(address.country);
          form.setValue('currency', currency);
        }
        
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    } finally {
      setIsGeocodingLoading(false);
    }
  };


  const handleCoordinatesChange = async () => {
    const lat = form.getValues('latitude');
    const lng = form.getValues('longitude');
    
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      await reverseGeocode(lat, lng);
    }
  };

  return (
    <>
      <FormField
        control={form.control}
        name="restaurantName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('restaurant.form.restaurantName')} *</FormLabel>
            <FormControl>
              <Input placeholder={t('restaurant.form.enterRestaurantName')} {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {t('restaurant.form.coordinatesLocation')}
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="latitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('restaurant.form.latitude')}</FormLabel>
                <FormControl>
                  <Input 
                    className="w-32"
                    type="number" 
                    step="any"
                    placeholder={t('restaurant.form.latitudePlaceholder')} 
                    value={field.value || ''}
                    onChange={(e) => {
                      field.onChange(e.target.value ? parseFloat(e.target.value) : null);
                    }}
                  />
                </FormControl>
                <FormDescription>{t('restaurant.form.decimalDegreesFormat')}</FormDescription>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="longitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('restaurant.form.longitude')}</FormLabel>
                <FormControl>
                  <Input 
                    className="w-32"
                    type="number" 
                    step="any"
                    placeholder={t('restaurant.form.longitudePlaceholder')} 
                    value={field.value || ''}
                    onChange={(e) => {
                      field.onChange(e.target.value ? parseFloat(e.target.value) : null);
                    }}
                  />
                </FormControl>
                <FormDescription>{t('restaurant.form.decimalDegreesFormat')}</FormDescription>
              </FormItem>
            )}
          />
        </div>


        <FormField
          control={form.control}
          name="plus_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('restaurant.form.googlePlusCode')}</FormLabel>
              <FormControl>
                <Input 
                  placeholder={t('restaurant.form.enterPlusCode')} 
                  {...field} 
                />
              </FormControl>
              <FormDescription>{t('restaurant.form.plusCodeDescription')}</FormDescription>
            </FormItem>
          )}
        />
      </div>

      <GooglePlacesIntegration form={form} />

      <FormField
        control={form.control}
        name="street_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('restaurant.form.streetNumber')} *</FormLabel>
            <FormControl>
              <Input placeholder={t('restaurant.form.enterStreetNumber')} {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="street_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('restaurant.form.streetName')} *</FormLabel>
            <FormControl>
              <Input placeholder={t('restaurant.form.enterStreetName')} {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="postal_code"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('restaurant.form.postalCode')} *</FormLabel>
            <FormControl>
              <Input placeholder={t('restaurant.form.enterPostalCode')} {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="county_region"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('restaurant.form.countyRegion')}</FormLabel>
            <FormControl>
              <Input placeholder={t('restaurant.form.enterCountyRegion')} {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="state"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('restaurant.form.state')} *</FormLabel>
            <FormControl>
              <Input placeholder={t('restaurant.form.enterState')} {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="country"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('restaurant.form.country')} *</FormLabel>
            <FormControl>
              <Input 
                placeholder={t('restaurant.form.enterCountry')} 
                {...field}
                onChange={(e) => {
                  field.onChange(e.target.value);
                  // Auto-set currency when country changes
                  if (e.target.value) {
                    const currency = getCurrencyByCountry(e.target.value);
                    form.setValue('currency', currency);
                  }
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="currency"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('restaurant.form.restaurantCurrency')} *</FormLabel>
            <Select 
              onValueChange={(value) => {
                console.log('Currency dropdown changed to:', value);
                field.onChange(value);
              }}
              value={field.value || ""}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue 
                    placeholder={t('restaurant.form.selectRestaurantCurrency')}
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="max-h-[300px] overflow-y-auto">
                {SUPPORTED_CURRENCIES.map((currency) => (
                  <SelectItem key={currency.value} value={currency.value}>
                    {currency.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              {t('restaurant.form.selectPrimaryCurrency')}
            </FormDescription>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="cuisine_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('restaurant.form.cuisineType')} *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t('restaurant.form.selectCuisineType')} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="italian">{t('restaurant.form.cuisines.italian')}</SelectItem>
                <SelectItem value="chinese">{t('restaurant.form.cuisines.chinese')}</SelectItem>
                <SelectItem value="indian">{t('restaurant.form.cuisines.indian')}</SelectItem>
                <SelectItem value="japanese">{t('restaurant.form.cuisines.japanese')}</SelectItem>
                <SelectItem value="mexican">{t('restaurant.form.cuisines.mexican')}</SelectItem>
                <SelectItem value="thai">{t('restaurant.form.cuisines.thai')}</SelectItem>
                <SelectItem value="french">{t('restaurant.form.cuisines.french')}</SelectItem>
                <SelectItem value="american">{t('restaurant.form.cuisines.american')}</SelectItem>
                <SelectItem value="vegetarian">{t('restaurant.form.cuisines.vegetarian')}</SelectItem>
                <SelectItem value="vegan">{t('restaurant.form.cuisines.vegan')}</SelectItem>
                <SelectItem value="lebanese">{t('restaurant.form.cuisines.lebanese')}</SelectItem>
                <SelectItem value="korean">{t('restaurant.form.cuisines.korean')}</SelectItem>
                <SelectItem value="caribbean">{t('restaurant.form.cuisines.caribbean')}</SelectItem>
                <SelectItem value="greek">{t('restaurant.form.cuisines.greek')}</SelectItem>
                <SelectItem value="turkish">{t('restaurant.form.cuisines.turkish')}</SelectItem>
                <SelectItem value="other">{t('restaurant.form.cuisines.other')}</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('restaurant.form.description')} *</FormLabel>
            <FormControl>
              <Textarea
                placeholder={t('restaurant.form.enterDescription')}
                className="min-h-[150px]"
                maxLength={300}
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="telephoneNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('restaurant.form.telephoneNumber')} *</FormLabel>
            <FormControl>
              <Input placeholder={t('restaurant.form.enterTelephoneNumber')} {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="website"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('restaurant.form.website')}</FormLabel>
            <FormControl>
              <Input 
                placeholder={t('restaurant.form.enterWebsiteURL')} 
                {...field} 
                onChange={(e) => field.onChange(formatWebsiteUrl(e.target.value))}
              />
            </FormControl>
            <FormDescription>
              {t('restaurant.form.websiteDescription')}
            </FormDescription>
          </FormItem>
        )}
      />
    </>
  );
};
