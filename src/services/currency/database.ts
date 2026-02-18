
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export class CurrencyDatabase {
  private readonly MAX_DB_AGE_DAYS = 10; // Maximum age before warning (allows buffer for 7-day update cycle)

  async getExchangeRate(
    fromCurrency: string, 
    toCurrency: string, 
    allowStale: boolean = false
  ): Promise<number | null> {
    try {
      let query = supabase
        .from('exchange_rates')
        .select('rate, fetched_at')
        .eq('from_currency', fromCurrency)
        .eq('to_currency', toCurrency)
        .eq('is_active', true)
        .order('fetched_at', { ascending: false })
        .limit(1);

      const { data, error } = await query;

      if (error) {
        console.error('Database query error:', error);
        return null;
      }

      if (!data || data.length === 0) {
        return null;
      }

      const rate = data[0];
      const fetchedAt = new Date(rate.fetched_at);
      const now = new Date();
      const ageInHours = (now.getTime() - fetchedAt.getTime()) / (1000 * 60 * 60);
      const ageInDays = ageInHours / 24;

      // Check if data is older than maximum allowed age
      if (ageInDays > this.MAX_DB_AGE_DAYS) {
        const errorMessage = `Exchange rate data is ${Math.floor(ageInDays)} days old. Please check the exchange rate update system.`;
        console.error(errorMessage);
        
        // Show toast notification to user
        toast({
          title: "Exchange Rate Warning",
          description: errorMessage,
          variant: "destructive",
        });

        // Only return the rate if we explicitly allow stale data
        if (!allowStale) {
          return null;
        }
      }

      return Number(rate.rate);
    } catch (error) {
      console.error('Error fetching from database:', error);
      return null;
    }
  }

  async storeExchangeRate(
    fromCurrency: string,
    toCurrency: string,
    rate: number
  ): Promise<void> {
    try {
      // First, deactivate any existing active rates for this pair
      await supabase
        .from('exchange_rates')
        .update({ is_active: false })
        .eq('from_currency', fromCurrency)
        .eq('to_currency', toCurrency)
        .eq('is_active', true);

      // Insert new rate
      const { error } = await supabase
        .from('exchange_rates')
        .insert({
          from_currency: fromCurrency,
          to_currency: toCurrency,
          rate: rate,
          source: 'exchangerate-api',
          is_active: true
        });

      if (error) {
        console.error('Error storing exchange rate:', error);
      }
    } catch (error) {
      console.error('Error storing exchange rate in database:', error);
    }
  }
}
