/**
 * @fileoverview Date Utility Functions
 * 
 * Deze module bevat gestandaardiseerde functies voor het formatteren en manipuleren van datums
 * in de ChargeCars applicatie. Gebruik deze functies in plaats van custom implementaties
 * om consistentie in de hele applicatie te waarborgen.
 * 
 * @author ChargeCars Development Team
 * @version 1.0.0
 */

/**
 * Formatteert een timestamp (in seconden of milliseconden) of datum string naar een lokaal datum formaat
 * 
 * @param timestamp - Timestamp in seconden of milliseconden, of een datum string
 * @param options - Opties voor het formatteren van de datum
 * @returns Geformatteerde datum string, of '-' als de datum ongeldig is
 * 
 * @example
 * // Gebruik met een timestamp in seconden (Xano formaat)
 * formatDate(1625097600); // '1-7-2021'
 * 
 * // Gebruik met een timestamp in milliseconden
 * formatDate(1625097600000); // '1-7-2021'
 * 
 * // Gebruik met een datum string
 * formatDate('2021-07-01'); // '1-7-2021'
 * 
 * // Gebruik met aangepaste opties
 * formatDate(1625097600, { locale: 'en-US', dateStyle: 'full' }); // 'Thursday, July 1, 2021'
 */
export const formatDate = (
  timestamp: number | string | undefined | null,
  options: {
    locale?: string;
    dateStyle?: 'full' | 'long' | 'medium' | 'short';
    timeStyle?: 'full' | 'long' | 'medium' | 'short';
    showTime?: boolean;
  } = {}
): string => {
  // Handle invalid/null timestamps
  if (!timestamp || timestamp === 0) return '-';
  
  // Default options
  const {
    locale = 'nl-NL',
    dateStyle = 'short',
    timeStyle = 'short',
    showTime = false
  } = options;
  
  try {
    // Handle both timestamp numbers and string dates
    let date: Date;
    if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else {
      // Xano timestamps are typically in seconds, convert to milliseconds if needed
      date = timestamp > 1e10 ? new Date(timestamp) : new Date(timestamp * 1000);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) return '-';
    
    // Format the date
    if (showTime) {
      return new Intl.DateTimeFormat(locale, {
        dateStyle,
        timeStyle
      }).format(date);
    } else {
      return new Intl.DateTimeFormat(locale, {
        dateStyle
      }).format(date);
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
};

/**
 * Formatteert een timestamp naar een relatieve tijd (bijv. 'Vandaag', 'Gisteren', '3 dagen geleden')
 * 
 * @param timestamp - Timestamp in seconden of milliseconden, of een datum string
 * @param options - Opties voor het formatteren van de relatieve tijd
 * @returns Relatieve tijd string, of een lege string als de datum ongeldig is
 * 
 * @example
 * // Als vandaag 3 juli 2021 is:
 * formatRelativeTime(1625097600); // '2 dagen geleden' (1 juli)
 * formatRelativeTime(new Date()); // 'Vandaag'
 */
export const formatRelativeTime = (
  timestamp: number | string | undefined | null,
  options: {
    locale?: string;
    fallbackToDate?: boolean;
  } = {}
): string => {
  // Handle invalid/null timestamps
  if (!timestamp || timestamp === 0) return '';
  
  // Default options
  const {
    locale = 'nl-NL',
    fallbackToDate = true
  } = options;
  
  try {
    // Convert to Date object
    const date = typeof timestamp === 'string' 
      ? new Date(timestamp) 
      : timestamp > 1e10 
        ? new Date(timestamp) 
        : new Date(timestamp * 1000);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return '';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    // Format based on time difference
    if (diffDays === 0) return 'Vandaag';
    if (diffDays === 1) return 'Gisteren';
    if (diffDays < 7) return `${diffDays} dagen geleden`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weken geleden`;
    
    // Fall back to formatted date for older dates
    return fallbackToDate ? formatDate(timestamp) : '';
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return '';
  }
};

/**
 * Formatteert een bedrag naar een valuta string
 * 
 * @param amount - Bedrag als number
 * @param options - Opties voor het formatteren van het bedrag
 * @returns Geformatteerde valuta string
 * 
 * @example
 * formatCurrency(1000); // '€ 1.000,00'
 * formatCurrency(1000, { currency: 'USD' }); // '$1,000.00'
 */
export const formatCurrency = (
  amount?: number | null,
  options: {
    locale?: string;
    currency?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string => {
  // Handle invalid/null amounts
  if (amount === undefined || amount === null) return '€0,00';
  
  // Default options
  const {
    locale = 'nl-NL',
    currency = 'EUR',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2
  } = options;
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits,
      maximumFractionDigits
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return '€0,00';
  }
};

/**
 * Formatteert een aantal naar een leesbaar getal met duizendtallen notatie
 * 
 * @param number - Getal als number
 * @param options - Opties voor het formatteren van het getal
 * @returns Geformatteerd getal string
 * 
 * @example
 * formatNumber(1000); // '1.000'
 * formatNumber(1000.5, { minimumFractionDigits: 1 }); // '1.000,5'
 */
export const formatNumber = (
  number?: number | null,
  options: {
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string => {
  // Handle invalid/null numbers
  if (number === undefined || number === null) return '0';
  
  // Default options
  const {
    locale = 'nl-NL',
    minimumFractionDigits = 0,
    maximumFractionDigits = 0
  } = options;
  
  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits,
      maximumFractionDigits
    }).format(number);
  } catch (error) {
    console.error('Error formatting number:', error);
    return '0';
  }
};

/**
 * Berekent het verschil tussen twee datums in dagen
 * 
 * @param startDate - Begin datum als Date object, timestamp of string
 * @param endDate - Eind datum als Date object, timestamp of string (default: nu)
 * @returns Aantal dagen verschil, of null bij ongeldige datums
 * 
 * @example
 * // Als vandaag 3 juli 2021 is:
 * getDaysDifference('2021-07-01'); // 2
 */
export const getDaysDifference = (
  startDate: Date | number | string,
  endDate: Date | number | string = new Date()
): number | null => {
  try {
    // Convert to Date objects
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    const end = endDate instanceof Date ? endDate : new Date(endDate);
    
    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
    
    // Calculate difference in days
    const diffMs = end.getTime() - start.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  } catch (error) {
    console.error('Error calculating days difference:', error);
    return null;
  }
}; 