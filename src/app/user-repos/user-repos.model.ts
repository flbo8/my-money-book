export interface MoneyRepo{
    id: number;
    repoName: string;
    description: string;
    startBalance: number;
    startBalanceDate: string;
    currency: string // e.g. "EUR", "USD", "GBP"
}

export const CURRENCY_SYMBOLS: Record<string, string> = {
  // Major currencies
  'USD': '$',      // US Dollar
  'EUR': '€',      // Euro
  'GBP': '£',      // British Pound
  'JPY': '¥',      // Japanese Yen
  'CNY': '¥',      // Chinese Yuan
  'CHF': 'CHF',    // Swiss Franc
  'CAD': 'C$',     // Canadian Dollar
  'AUD': 'A$',     // Australian Dollar
  'NZD': 'NZ$',    // New Zealand Dollar
  
  // European currencies
  'SEK': 'kr',     // Swedish Krona
  'NOK': 'kr',     // Norwegian Krone
  'DKK': 'kr',     // Danish Krone
  'PLN': 'zł',     // Polish Złoty
  'CZK': 'Kč',     // Czech Koruna
  'HUF': 'Ft',     // Hungarian Forint
  'RON': 'lei',    // Romanian Leu
  'BGN': 'лв',     // Bulgarian Lev
  'HRK': 'kn',     // Croatian Kuna
  'RUB': '₽',      // Russian Ruble
  'UAH': '₴',      // Ukrainian Hryvnia
  'TRY': '₺',      // Turkish Lira
  
  // Asian currencies
  'INR': '₹',      // Indian Rupee
  'KRW': '₩',      // South Korean Won
  'SGD': 'S$',     // Singapore Dollar
  'HKD': 'HK$',    // Hong Kong Dollar
  'TWD': 'NT$',    // Taiwan Dollar
  'THB': '฿',      // Thai Baht
  'MYR': 'RM',     // Malaysian Ringgit
  'IDR': 'Rp',     // Indonesian Rupiah
  'PHP': '₱',      // Philippine Peso
  'VND': '₫',      // Vietnamese Dong
  'PKR': '₨',      // Pakistani Rupee
  'BDT': '৳',      // Bangladeshi Taka
  'LKR': 'Rs',     // Sri Lankan Rupee
  'NPR': 'Rs',     // Nepalese Rupee
  'MMK': 'K',      // Myanmar Kyat
  'KHR': '៛',      // Cambodian Riel
  'LAK': '₭',      // Lao Kip
  
  // Middle Eastern currencies
  'SAR': '﷼',      // Saudi Riyal
  'AED': 'د.إ',    // UAE Dirham
  'QAR': 'ر.ق',    // Qatari Riyal
  'KWD': 'د.ك',    // Kuwaiti Dinar
  'BHD': 'د.ب',    // Bahraini Dinar
  'OMR': 'ر.ع.',   // Omani Rial
  'JOD': 'د.ا',    // Jordanian Dinar
  'ILS': '₪',      // Israeli Shekel
  'IQD': 'ع.د',    // Iraqi Dinar
  'IRR': '﷼',      // Iranian Rial
  'LBP': 'ل.ل',    // Lebanese Pound
  'SYP': '£',      // Syrian Pound
  
  // African currencies
  'ZAR': 'R',      // South African Rand
  'EGP': '£',      // Egyptian Pound
  'NGN': '₦',      // Nigerian Naira
  'KES': 'KSh',    // Kenyan Shilling
  'GHS': '₵',      // Ghanaian Cedi
  'TZS': 'TSh',    // Tanzanian Shilling
  'UGX': 'USh',    // Ugandan Shilling
  'MAD': 'د.م.',   // Moroccan Dirham
  'TND': 'د.ت',    // Tunisian Dinar
  'DZD': 'د.ج',    // Algerian Dinar
  'ETB': 'Br',     // Ethiopian Birr
  'XOF': 'CFA',    // West African CFA Franc
  'XAF': 'FCFA',   // Central African CFA Franc
  
  // American currencies
  'BRL': 'R$',     // Brazilian Real
  'MXN': '$',      // Mexican Peso
  'ARS': '$',      // Argentine Peso
  'CLP': '$',      // Chilean Peso
  'COP': '$',      // Colombian Peso
  'PEN': 'S/',     // Peruvian Sol
  'VES': 'Bs.',    // Venezuelan Bolívar
  'UYU': '$U',     // Uruguayan Peso
  'PYG': '₲',      // Paraguayan Guaraní
  'BOB': 'Bs.',    // Bolivian Boliviano
  'DOP': 'RD$',    // Dominican Peso
  'CRC': '₡',      // Costa Rican Colón
  'GTQ': 'Q',      // Guatemalan Quetzal
  'HNL': 'L',      // Honduran Lempira
  'NIO': 'C$',     // Nicaraguan Córdoba
  'PAB': 'B/.',    // Panamanian Balboa
  'JMD': 'J$',     // Jamaican Dollar
  'TTD': 'TT$',    // Trinidad and Tobago Dollar
  'BBD': 'Bds$',   // Barbadian Dollar
  
  // Oceania currencies
  'FJD': 'FJ$',    // Fijian Dollar
  'PGK': 'K',      // Papua New Guinean Kina
  'WST': 'WS$',    // Samoan Tālā
  'TOP': 'T$',     // Tongan Paʻanga
  'VUV': 'VT',     // Vanuatu Vatu
  
  // Cryptocurrencies (bonus)
  'BTC': '₿',      // Bitcoin
  'ETH': 'Ξ',      // Ethereum
  
  // Special/Historical
  'XAU': 'Au',     // Gold (troy ounce)
  'XAG': 'Ag',     // Silver (troy ounce)
  'XPT': 'Pt',     // Platinum
  'XPD': 'Pd',     // Palladium
};

/** 
 * convenience function for fetching currency symbol 
 */
export function getCurrencySymbol(currencyCode: string): string {
    return CURRENCY_SYMBOLS[currencyCode.toUpperCase()] || currencyCode;
}

/**
 * Brings currency values into correct format (for display only)
 * @param amount 
 * @param currencyCode 
 * @param locale 
 * @returns string
 */
export function formatCurrency(amount: number, currencyCode: string, locale: string = 'de-DE'): string {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode
    }).format(amount);
}