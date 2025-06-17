/**
 * @fileoverview Error Handling Utilities
 * 
 * Centralized error handling and user-friendly error message generation
 * for API errors, validation errors, and other application errors.
 * 
 * @author ChargeCars Development Team
 * @version 1.0.0
 */

import { ApiError } from '../../types';

/**
 * Error types for categorization
 */
export enum ErrorType {
  VALIDATION = 'validation',
  API = 'api',
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  UNKNOWN = 'unknown',
}

/**
 * Application error class
 */
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly code?: string;
  public readonly details?: any;
  public readonly userMessage: string;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    code?: string,
    details?: any,
    userMessage?: string
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.code = code;
    this.details = details;
    this.userMessage = userMessage || message;
  }
}

/**
 * Convert API error to user-friendly message
 */
export const getApiErrorMessage = (error: ApiError): string => {
  // Check for specific error codes
  switch (error.code) {
    case '400':
      return 'De ingevoerde gegevens zijn niet geldig. Controleer de formuliervelden.';
    case '401':
      return 'Uw sessie is verlopen. Log opnieuw in.';
    case '403':
      return 'U heeft geen toestemming voor deze actie.';
    case '404':
      return 'De gevraagde resource is niet gevonden.';
    case '409':
      return 'Er bestaat al een record met deze gegevens.';
    case '422':
      return 'De ingevoerde gegevens konden niet worden verwerkt.';
    case '429':
      return 'Te veel verzoeken. Probeer het later opnieuw.';
    case '500':
      return 'Er is een serverfout opgetreden. Probeer het later opnieuw.';
    case '502':
    case '503':
    case '504':
      return 'De service is tijdelijk niet beschikbaar. Probeer het later opnieuw.';
    case 'NETWORK_ERROR':
      return 'Netwerkfout. Controleer uw internetverbinding.';
    default:
      return error.message || 'Er is een onverwachte fout opgetreden.';
  }
};

/**
 * Handle different types of errors and return user-friendly messages
 */
export const handleError = (error: unknown): AppError => {
  // If it's already an AppError, return as is
  if (error instanceof AppError) {
    return error;
  }

  // Handle API response errors
  if (error && typeof error === 'object' && 'error' in error) {
    const apiError = (error as any).error as ApiError;
    const userMessage = getApiErrorMessage(apiError);
    
    return new AppError(
      apiError.message,
      getErrorTypeFromCode(apiError.code),
      apiError.code,
      apiError.details,
      userMessage
    );
  }

  // Handle standard JavaScript errors
  if (error instanceof Error) {
    return new AppError(
      error.message,
      ErrorType.UNKNOWN,
      undefined,
      undefined,
      'Er is een onverwachte fout opgetreden.'
    );
  }

  // Handle string errors
  if (typeof error === 'string') {
    return new AppError(error, ErrorType.UNKNOWN, undefined, undefined, error);
  }

  // Handle unknown errors
  return new AppError(
    'Unknown error occurred',
    ErrorType.UNKNOWN,
    undefined,
    error,
    'Er is een onbekende fout opgetreden.'
  );
};

/**
 * Get error type from HTTP status code
 */
const getErrorTypeFromCode = (code: string): ErrorType => {
  switch (code) {
    case '400':
    case '422':
      return ErrorType.VALIDATION;
    case '401':
      return ErrorType.AUTHENTICATION;
    case '403':
      return ErrorType.AUTHORIZATION;
    case '404':
      return ErrorType.NOT_FOUND;
    case '500':
    case '502':
    case '503':
    case '504':
      return ErrorType.SERVER;
    case 'NETWORK_ERROR':
      return ErrorType.NETWORK;
    default:
      return ErrorType.API;
  }
};

/**
 * Validation error utilities
 */
export class ValidationError extends AppError {
  public readonly fieldErrors: Record<string, string>;

  constructor(
    message: string = 'Validatiefout',
    fieldErrors: Record<string, string> = {}
  ) {
    super(message, ErrorType.VALIDATION, 'VALIDATION_ERROR', fieldErrors, message);
    this.fieldErrors = fieldErrors;
    this.name = 'ValidationError';
  }
}

/**
 * Create validation error from field errors
 */
export const createValidationError = (fieldErrors: Record<string, string>): ValidationError => {
  const errorCount = Object.keys(fieldErrors).length;
  const message = errorCount === 1 
    ? 'Er is een validatiefout gevonden'
    : `Er zijn ${errorCount} validatiefouten gevonden`;
  
  return new ValidationError(message, fieldErrors);
};

/**
 * Log error for debugging (with different levels based on error type)
 */
export const logError = (error: AppError, context?: string): void => {
  const logData = {
    message: error.message,
    type: error.type,
    code: error.code,
    details: error.details,
    context,
    timestamp: new Date().toISOString(),
    stack: error.stack,
  };

  switch (error.type) {
    case ErrorType.NETWORK:
    case ErrorType.SERVER:
      console.error('🚨 Critical Error:', logData);
      break;
    case ErrorType.API:
    case ErrorType.AUTHENTICATION:
    case ErrorType.AUTHORIZATION:
      console.warn('⚠️ API Error:', logData);
      break;
    case ErrorType.VALIDATION:
      console.info('ℹ️ Validation Error:', logData);
      break;
    default:
      console.log('📝 General Error:', logData);
  }
};

/**
 * Retry mechanism for failed operations
 */
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Exponential backoff
      const waitTime = delay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError!;
};

/**
 * Safe async operation wrapper
 */
export const safeAsync = async <T>(
  operation: () => Promise<T>,
  fallback?: T,
  onError?: (error: AppError) => void
): Promise<T | undefined> => {
  try {
    return await operation();
  } catch (error) {
    const appError = handleError(error);
    
    if (onError) {
      onError(appError);
    } else {
      logError(appError);
    }

    return fallback;
  }
};

/**
 * Default error messages for common scenarios
 */
export const DefaultErrors = {
  NETWORK: 'Netwerkfout. Controleer uw internetverbinding en probeer opnieuw.',
  SERVER: 'Serverfout. Probeer het later opnieuw.',
  VALIDATION: 'De ingevoerde gegevens zijn niet geldig.',
  AUTH_REQUIRED: 'U moet ingelogd zijn om deze actie uit te voeren.',
  PERMISSION_DENIED: 'U heeft geen toestemming voor deze actie.',
  NOT_FOUND: 'De gevraagde resource is niet gevonden.',
  UNKNOWN: 'Er is een onverwachte fout opgetreden.',
  FORM_INVALID: 'Controleer het formulier op fouten voordat u doorgaat.',
  OPERATION_FAILED: 'De bewerking kon niet worden voltooid.',
} as const;