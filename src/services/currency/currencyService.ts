
import { CurrencyConversionResult } from "./types";
import { CurrencyCache } from "./cache";
import { CurrencyAPI } from "./api";
import { CurrencyDatabase } from "./database";

class CurrencyService {
  private cache = new CurrencyCache();
  private api = new CurrencyAPI();
  private database = new CurrencyDatabase();

  /**
   * Get exchange rate from database first, then API if needed
   */
  private async fetchExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) return 1;

    // Check cache first
    const cachedRate = this.cache.get(fromCurrency, toCurrency);
    if (cachedRate !== null) {
      return cachedRate;
    }

    try {
      // First, try to get the rate from database
      const dbRate = await this.database.getExchangeRate(fromCurrency, toCurrency);
      if (dbRate) {
        console.log(`Using database exchange rate: ${fromCurrency} to ${toCurrency} = ${dbRate}`);
        this.cache.set(fromCurrency, toCurrency, dbRate);
        return dbRate;
      }

      // If not in database or outdated, fetch from API
      const apiRate = await this.api.fetchExchangeRate(fromCurrency, toCurrency);
      
      // Store the new rate in database
      await this.database.storeExchangeRate(fromCurrency, toCurrency, apiRate);
      
      // Cache the result
      this.cache.set(fromCurrency, toCurrency, apiRate);
      
      console.log(`Fetched new exchange rate from API: ${fromCurrency} to ${toCurrency} = ${apiRate}`);
      return apiRate;
      
    } catch (error) {
      console.error(`Error fetching exchange rate for ${fromCurrency} to ${toCurrency}:`, error);
      
      // Try to get any rate from database as backup (even if older)
      const backupRate = await this.database.getExchangeRate(fromCurrency, toCurrency, true);
      if (backupRate) {
        console.warn(`Using backup database rate for ${fromCurrency} to ${toCurrency}: ${backupRate}`);
        return backupRate;
      }
      
      // Last resort - throw error instead of using 1:1
      throw new Error(`Unable to get exchange rate for ${fromCurrency} to ${toCurrency}. No API access and no database backup available.`);
    }
  }

  /**
   * Convert amount from one currency to another
   */
  async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<CurrencyConversionResult> {
    const exchangeRate = await this.fetchExchangeRate(fromCurrency, toCurrency);
    const convertedAmount = Number((amount * exchangeRate).toFixed(2));
    
    return {
      convertedAmount,
      exchangeRate,
      fromCurrency,
      toCurrency,
      timestamp: new Date()
    };
  }

  /**
   * Convert bill amount to USD for standardized points calculation
   */
  async convertToStandardCurrency(
    amount: number,
    fromCurrency: string,
    standardCurrency: string = 'USD'
  ): Promise<number> {
    if (fromCurrency === standardCurrency) return amount;
    
    const result = await this.convertCurrency(amount, fromCurrency, standardCurrency);
    return result.convertedAmount;
  }

  /**
   * Convert points value to display currency
   */
  async convertPointsToDisplayCurrency(
    pointsValue: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    const result = await this.convertCurrency(pointsValue, fromCurrency, toCurrency);
    return result.convertedAmount;
  }

  /**
   * Clear the exchange rate cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const currencyService = new CurrencyService();
export type { CurrencyConversionResult };
