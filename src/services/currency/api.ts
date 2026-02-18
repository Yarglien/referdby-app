
export class CurrencyAPI {
  private readonly BASE_URL = 'https://v6.exchangerate-api.com/v6';
  private readonly API_KEY = '54bbf533675a43fb94ff4b8e';

  async fetchExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) {
      return 1;
    }

    try {
      const response = await fetch(`${this.BASE_URL}/${this.API_KEY}/latest/${fromCurrency}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.result !== 'success') {
        throw new Error(`API error: ${data['error-type'] || 'Unknown error'}`);
      }
      
      if (!data.conversion_rates || !data.conversion_rates[toCurrency]) {
        throw new Error(`Exchange rate not available for ${fromCurrency} to ${toCurrency}`);
      }

      const rate = data.conversion_rates[toCurrency];
      
      if (!rate || isNaN(rate)) {
        throw new Error(`Invalid exchange rate for ${fromCurrency} to ${toCurrency}`);
      }
      
      return rate;
      
    } catch (error) {
      console.error('Error fetching from ExchangeRate-API:', error);
      throw error;
    }
  }
}
