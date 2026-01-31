// Country to currency mapping
const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  // North America
  'USA': 'USD',
  'United States': 'USD',
  'Canada': 'CAD',
  'Mexico': 'MXN',
  
  // Europe
  'Germany': 'EUR',
  'France': 'EUR',
  'Italy': 'EUR',
  'Spain': 'EUR',
  'Netherlands': 'EUR',
  'Belgium': 'EUR',
  'Austria': 'EUR',
  'Portugal': 'EUR',
  'Ireland': 'EUR',
  'Greece': 'EUR',
  'Finland': 'EUR',
  'Luxembourg': 'EUR',
  'United Kingdom': 'GBP',
  'UK': 'GBP',
  'Switzerland': 'CHF',
  'Norway': 'NOK',
  'Sweden': 'SEK',
  'Denmark': 'DKK',
  'Poland': 'PLN',
  'Czech Republic': 'CZK',
  'Hungary': 'HUF',
  'Romania': 'RON',
  'Bulgaria': 'BGN',
  'Croatia': 'HRK',
  
  // Asia Pacific
  'Australia': 'AUD',
  'New Zealand': 'NZD',
  'Japan': 'JPY',
  'South Korea': 'KRW',
  'China': 'CNY',
  'India': 'INR',
  'Singapore': 'SGD',
  'Hong Kong': 'HKD',
  'Thailand': 'THB',
  'Malaysia': 'MYR',
  'Philippines': 'PHP',
  'Indonesia': 'IDR',
  'Vietnam': 'VND',
  
  // Middle East & Africa
  'South Africa': 'ZAR',
  'Israel': 'ILS',
  'UAE': 'AED',
  'Saudi Arabia': 'SAR',
  'Turkey': 'TRY',
  'Egypt': 'EGP',
  
  // Americas
  'Brazil': 'BRL',
  'Argentina': 'ARS',
  'Chile': 'CLP',
  'Colombia': 'COP',
  'Peru': 'PEN',
};

export const getCurrencyByCountry = (country: string): string => {
  if (!country) return 'USD'; // Default fallback
  
  // Try exact match first
  if (COUNTRY_CURRENCY_MAP[country]) {
    return COUNTRY_CURRENCY_MAP[country];
  }
  
  // Try case-insensitive match
  const normalizedCountry = country.trim();
  const foundKey = Object.keys(COUNTRY_CURRENCY_MAP).find(
    key => key.toLowerCase() === normalizedCountry.toLowerCase()
  );
  
  if (foundKey) {
    return COUNTRY_CURRENCY_MAP[foundKey];
  }
  
  // Default fallback
  return 'USD';
};

export const getSupportedCurrencies = (): string[] => {
  return Array.from(new Set(Object.values(COUNTRY_CURRENCY_MAP))).sort();
};