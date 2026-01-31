
export interface ExchangeRateResponse {
  [key: string]: {
    [key: string]: number;
  };
}

export interface CurrencyConversionResult {
  convertedAmount: number;
  exchangeRate: number;
  fromCurrency: string;
  toCurrency: string;
  timestamp: Date;
}

export interface DatabaseExchangeRate {
  id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  fetched_at: string;
  source: string;
  is_active: boolean;
}

export interface CacheEntry {
  rate: number;
  timestamp: Date;
}
