
import { CacheEntry } from "./types";

export class CurrencyCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  get(fromCurrency: string, toCurrency: string): number | null {
    const cacheKey = `${fromCurrency}_${toCurrency}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp.getTime() < this.CACHE_DURATION) {
      return cached.rate;
    }
    
    return null;
  }

  set(fromCurrency: string, toCurrency: string, rate: number): void {
    const cacheKey = `${fromCurrency}_${toCurrency}`;
    this.cache.set(cacheKey, { rate, timestamp: new Date() });
  }

  clear(): void {
    this.cache.clear();
  }
}
