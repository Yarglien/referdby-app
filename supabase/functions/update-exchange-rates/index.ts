
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const API_KEY = '54bbf533675a43fb94ff4b8e';
const BASE_URL = 'https://v6.exchangerate-api.com/v6';

interface ExchangeRateUpdate {
  from_currency: string;
  to_currency: string;
  rate: number;
  source: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // All supported currencies (excluding USD as it's the base)
    const currencyPairs = [
      'AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'AWG', 'AZN',
      'BAM', 'BBD', 'BDT', 'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BRL',
      'BSD', 'BTN', 'BWP', 'BYN', 'BZD', 'CAD', 'CDF', 'CHF', 'CLP', 'CNY',
      'COP', 'CRC', 'CUP', 'CVE', 'CZK', 'DJF', 'DKK', 'DOP', 'DZD', 'EGP',
      'ERN', 'ETB', 'EUR', 'FJD', 'FKP', 'FOK', 'GBP', 'GEL', 'GGP', 'GHS',
      'GIP', 'GMD', 'GNF', 'GTQ', 'GYD', 'HKD', 'HNL', 'HRK', 'HTG', 'HUF',
      'IDR', 'ILS', 'IMP', 'INR', 'IQD', 'IRR', 'ISK', 'JEP', 'JMD', 'JOD',
      'JPY', 'KES', 'KGS', 'KHR', 'KMF', 'KPW', 'KRW', 'KWD', 'KYD', 'KZT',
      'LAK', 'LBP', 'LKR', 'LRD', 'LSL', 'LYD', 'MAD', 'MDL', 'MGA', 'MKD',
      'MMK', 'MNT', 'MOP', 'MRU', 'MUR', 'MVR', 'MWK', 'MXN', 'MYR', 'MZN',
      'NAD', 'NGN', 'NIO', 'NOK', 'NPR', 'NZD', 'OMR', 'PAB', 'PEN', 'PGK',
      'PHP', 'PKR', 'PLN', 'PYG', 'QAR', 'RON', 'RSD', 'RUB', 'RWF', 'SAR',
      'SBD', 'SCR', 'SDG', 'SEK', 'SGD', 'SHP', 'SLE', 'SLL', 'SOS', 'SRD',
      'SSP', 'STN', 'SYP', 'SZL', 'THB', 'TJS', 'TMT', 'TND', 'TOP', 'TRY',
      'TTD', 'TVD', 'TWD', 'TZS', 'UAH', 'UGX', 'UYU', 'UZS', 'VED', 'VES',
      'VND', 'VUV', 'WST', 'XAF', 'XCD', 'XDR', 'XOF', 'XPF', 'YER', 'ZAR',
      'ZMW', 'ZWL'
    ];

    // Check if we already have fresh rates (less than 7 days old) to avoid unnecessary API calls
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const { data: recentRates } = await supabaseClient
      .from('exchange_rates')
      .select('from_currency, fetched_at')
      .eq('is_active', true)
      .gte('fetched_at', new Date(Date.now() - SEVEN_DAYS_MS).toISOString());

    const recentCurrencies = new Set(recentRates?.map(r => r.from_currency) || []);
    const currenciesToUpdate = currencyPairs.filter(currency => !recentCurrencies.has(currency));

    console.log(`Skipping ${recentCurrencies.size} currencies with fresh rates`);
    console.log(`Updating ${currenciesToUpdate.length} currencies`);

    if (currenciesToUpdate.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'All exchange rates are fresh (less than 7 days old)',
          skipped: recentCurrencies.size,
          timestamp: new Date().toISOString()
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    const updates: ExchangeRateUpdate[] = [];
    const errors: string[] = [];

    // Process only currencies that need updating
    for (const currency of currenciesToUpdate) {
      try {
        const response = await fetch(`${BASE_URL}/${API_KEY}/latest/${currency}`);
        
        if (!response.ok) {
          errors.push(`Failed to fetch ${currency} rates: HTTP ${response.status}`);
          continue;
        }
        
        const data = await response.json();
        
        if (data.result !== 'success') {
          errors.push(`API error for ${currency}: ${data['error-type'] || 'Unknown error'}`);
          continue;
        }
        
        if (!data.conversion_rates || !data.conversion_rates.USD) {
          errors.push(`No USD rate available for ${currency}`);
          continue;
        }

        const rate = data.conversion_rates.USD;
        
        updates.push({
          from_currency: currency,
          to_currency: 'USD',
          rate: rate,
          source: 'exchangerate-api'
        });

        console.log(`Fetched ${currency}/USD: ${rate}`);
        
        // Add a small delay between API calls to be respectful
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        errors.push(`Error fetching ${currency}: ${(error as Error).message}`);
      }
    }

    // Update database with new rates
    let updateCount = 0;
    for (const update of updates) {
      try {
        // Deactivate existing rates
        await supabaseClient
          .from('exchange_rates')
          .update({ is_active: false })
          .eq('from_currency', update.from_currency)
          .eq('to_currency', update.to_currency)
          .eq('is_active', true);

        // Insert new rate
        const { error } = await supabaseClient
          .from('exchange_rates')
          .insert({
            from_currency: update.from_currency,
            to_currency: update.to_currency,
            rate: update.rate,
            source: update.source,
            is_active: true
          });

        if (error) {
          errors.push(`Failed to update ${update.from_currency}/${update.to_currency}: ${error.message}`);
        } else {
          updateCount++;
        }
      } catch (error) {
        errors.push(`Database error for ${update.from_currency}/${update.to_currency}: ${(error as Error).message}`);
      }
    }

    // Clean up old rates
    try {
      await supabaseClient.rpc('cleanup_old_exchange_rates');
      console.log('Cleaned up old exchange rates');
    } catch (error) {
      errors.push(`Cleanup error: ${(error as Error).message}`);
    }

    const response = {
      success: true,
      message: `Updated ${updateCount} exchange rates`,
      total_pairs: currencyPairs.length,
      skipped_fresh: recentCurrencies.size,
      currencies_updated: currenciesToUpdate.length,
      successful_updates: updateCount,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    };

    console.log('Exchange rate update completed:', response);

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Exchange rate update failed:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: (error as Error).message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
