/**
 * @fileoverview Validation Utilities
 * 
 * Common validation functions used throughout the application
 * for form validation, data validation, and input sanitization.
 * 
 * @author ChargeCars Development Team
 * @version 1.0.0
 */

/**
 * Validate email address format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate Dutch postal code format
 * Supports formats: 1234AB, 1234 AB
 */
export const isValidDutchPostalCode = (postalCode: string): boolean => {
  const postalCodeRegex = /^[1-9][0-9]{3}\s?[A-Z]{2}$/i;
  return postalCodeRegex.test(postalCode.trim());
};

/**
 * Validate Dutch phone number
 * Supports various Dutch phone number formats
 */
export const isValidDutchPhoneNumber = (phoneNumber: string): boolean => {
  // Remove all non-numeric characters except +
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // Dutch phone number patterns
  const patterns = [
    /^\+31[1-9]\d{8}$/, // +31612345678
    /^0[1-9]\d{8}$/, // 0612345678
    /^[1-9]\d{8}$/, // 612345678
  ];
  
  return patterns.some(pattern => pattern.test(cleaned));
};

/**
 * Validate IBAN format (basic check)
 */
export const isValidIBAN = (iban: string): boolean => {
  // Remove spaces and convert to uppercase
  const cleanIban = iban.replace(/\s/g, '').toUpperCase();
  
  // Basic IBAN format check (simplified)
  const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/;
  return ibanRegex.test(cleanIban);
};

/**
 * Validate Dutch VAT number (BTW-nummer)
 */
export const isValidDutchVATNumber = (vatNumber: string): boolean => {
  // Remove spaces and convert to uppercase
  const cleaned = vatNumber.replace(/\s/g, '').toUpperCase();
  
  // Dutch VAT format: NL123456789B01
  const vatRegex = /^NL[0-9]{9}B[0-9]{2}$/;
  return vatRegex.test(cleaned);
};

/**
 * Validate Dutch Chamber of Commerce number (KvK-nummer)
 */
export const isValidDutchKvKNumber = (kvkNumber: string): boolean => {
  // Remove all non-numeric characters
  const cleaned = kvkNumber.replace(/\D/g, '');
  
  // KvK number should be 8 digits
  return /^[0-9]{8}$/.test(cleaned);
};

/**
 * Validate required field
 */
export const isRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return !!value;
};

/**
 * Validate minimum length
 */
export const hasMinLength = (value: string, minLength: number): boolean => {
  return Boolean(value && value.length >= minLength);
};

/**
 * Validate maximum length
 */
export const hasMaxLength = (value: string, maxLength: number): boolean => {
  return !value || value.length <= maxLength;
};

/**
 * Validate number range
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

/**
 * Sanitize string input
 */
export const sanitizeString = (value: string): string => {
  return value.trim().replace(/\s+/g, ' ');
};

/**
 * Format Dutch postal code
 */
export const formatDutchPostalCode = (postalCode: string): string => {
  const cleaned = postalCode.replace(/\s/g, '').toUpperCase();
  if (cleaned.length === 6) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
  }
  return cleaned;
};

/**
 * Format Dutch phone number
 */
export const formatDutchPhoneNumber = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // If it starts with +31, format as +31 6 12345678
  if (cleaned.startsWith('+31')) {
    const number = cleaned.slice(3);
    if (number.length === 9) {
      return `+31 ${number.slice(0, 1)} ${number.slice(1, 5)} ${number.slice(5)}`;
    }
  }
  
  // If it starts with 0, format as 06 12345678
  if (cleaned.startsWith('0')) {
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)} ${cleaned.slice(6)}`;
    }
  }
  
  return phoneNumber;
};

/**
 * Format IBAN
 */
export const formatIBAN = (iban: string): string => {
  const cleaned = iban.replace(/\s/g, '').toUpperCase();
  return cleaned.replace(/(.{4})/g, '$1 ').trim();
};

/**
 * Comprehensive validation errors object
 */
export const ValidationErrors = {
  REQUIRED: 'Dit veld is verplicht',
  INVALID_EMAIL: 'Voer een geldig e-mailadres in',
  INVALID_POSTAL_CODE: 'Voer een geldige Nederlandse postcode in (bijv. 1234 AB)',
  INVALID_PHONE: 'Voer een geldig Nederlands telefoonnummer in',
  INVALID_IBAN: 'Voer een geldig IBAN rekeningnummer in',
  INVALID_VAT: 'Voer een geldig Nederlands BTW-nummer in (bijv. NL123456789B01)',
  INVALID_KVK: 'Voer een geldig KvK-nummer in (8 cijfers)',
  MIN_LENGTH: (min: number) => `Minimaal ${min} karakters vereist`,
  MAX_LENGTH: (max: number) => `Maximaal ${max} karakters toegestaan`,
  OUT_OF_RANGE: (min: number, max: number) => `Waarde moet tussen ${min} en ${max} liggen`,
} as const;