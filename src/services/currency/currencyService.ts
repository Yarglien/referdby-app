import { CurrencyConversionResult } from "./types";
import { CurrencyCache } from "./cache";
import { CurrencyDatabase } from "./database";

class CurrencyService {
  private cache = new CurrencyCache();
  private database = new CurrencyDatabase();

  /**
   * Get exchange rate from database only (client never calls external API)
   */
  private async fetchExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) return 1;

    // Check cache first
    const cachedRate = this.cache.get(fromCurrency, toCurrency);
    if (cachedRate !== null) {
      return cachedRate;
    }

    try {
      // Get rate from database only - backend updates rates weekly via cron
      const dbRate = await this.database.getExchangeRate(fromCurrency, toCurrency);
      if (dbRate) {
        console.log(`Using database exchange rate: ${fromCurrency} to ${toCurrency} = ${dbRate}`);
        this.cache.set(fromCurrency, toCurrency, dbRate);
        return dbRate;
      }

      // Try backup (stale rate) if no fresh rate available
      const backupRate = await this.database.getExchangeRate(fromCurrency, toCurrency, true);
      if (backupRate) {
        console.warn(`Using backup database rate for ${fromCurrency} to ${toCurrency}: ${backupRate}`);
        this.cache.set(fromCurrency, toCurrency, backupRate);
        return backupRate;
      }

      throw new Error(`Exchange rate for ${fromCurrency} to ${toCurrency} not available. Rates are updated weekly by the backend.`);
    } catch (error) {
      console.error(`Error fetching exchange rate for ${fromCurrency} to ${toCurrency}:`, error);
      throw error;
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
