/**
 * @fileoverview API Utility Functions
 * 
 * Deze module bevat gestandaardiseerde functies voor het afhandelen van API calls,
 * error handling, en andere API gerelateerde functionaliteit in de ChargeCars applicatie.
 * 
 * @author ChargeCars Development Team
 * @version 1.0.0
 */

import { ApiResponse } from '@/lib/api';

/**
 * Standaard error handler voor API calls
 * Deze functie zet API errors om in gebruiksvriendelijke foutmeldingen
 * 
 * @param error - De error van de API call
 * @param defaultMessage - Optioneel standaard bericht als er geen specifieke foutmelding is
 * @returns Een gebruiksvriendelijke foutmelding
 * 
 * @example
 * try {
 *   const response = await apiClient.getOrders();
 * } catch (error) {
 *   const errorMessage = handleApiError(error);
 *   showErrorNotification(errorMessage);
 * }
 */
export const handleApiError = (
  error: any, 
  defaultMessage: string = 'Er is een fout opgetreden bij het verwerken van uw verzoek.'
): string => {
  // Als het een ApiResponse object is met een error property
  if (error?.error?.message) {
    return error.error.message;
  }
  
  // Als het een Error object is met een message property
  if (error?.message) {
    // Verwijder technische details voor eindgebruikers
    const userFriendlyMessage = error.message
      .replace(/^\w+Error:\s*/i, '')
      .replace(/\[.*?\]/g, '')
      .replace(/http(s)?:\/\/[^\s]*/g, '[API URL]')
      .trim();
    
    if (userFriendlyMessage) {
      return userFriendlyMessage;
    }
  }
  
  // Specifieke HTTP status codes
  if (error?.status) {
    switch (error.status) {
      case 400:
        return 'Ongeldig verzoek. Controleer uw gegevens en probeer het opnieuw.';
      case 401:
        return 'Niet geautoriseerd. Log opnieuw in om door te gaan.';
      case 403:
        return 'Geen toegang. U heeft geen toestemming voor deze actie.';
      case 404:
        return 'Niet gevonden. De opgevraagde gegevens bestaan niet.';
      case 409:
        return 'Conflict. Er is een conflict met de huidige staat van de resource.';
      case 429:
        return 'Te veel verzoeken. Probeer het over enkele ogenblikken opnieuw.';
      case 500:
        return 'Serverfout. Probeer het later opnieuw.';
      case 503:
        return 'Service niet beschikbaar. Probeer het later opnieuw.';
    }
  }
  
  // Netwerk gerelateerde errors
  if (error?.name === 'NetworkError' || error?.message?.includes('Network')) {
    return 'Netwerkfout. Controleer uw internetverbinding en probeer het opnieuw.';
  }
  
  // Timeout errors
  if (error?.name === 'TimeoutError' || error?.message?.includes('timeout')) {
    return 'Timeout. De server reageert niet. Probeer het later opnieuw.';
  }
  
  // Fallback naar default message
  return defaultMessage;
};

/**
 * Controleert of een API response succesvol is
 * 
 * @param response - De API response
 * @returns True als de response succesvol is, anders false
 * 
 * @example
 * const response = await apiClient.getOrders();
 * if (isSuccessResponse(response)) {
 *   // Verwerk de data
 * }
 */
export const isSuccessResponse = <T>(response: ApiResponse<T>): boolean => {
  return response?.success === true && !response?.error;
};

/**
 * Wrapper functie voor het veilig uitvoeren van API calls
 * 
 * @param apiCall - De API call functie
 * @param errorHandler - Optionele custom error handler
 * @returns Een tuple met [data, error, loading]
 * 
 * @example
 * const [data, error, loading] = await safeApiCall(() => apiClient.getOrders());
 * if (loading) return <Spinner />;
 * if (error) return <ErrorMessage message={error} />;
 * return <OrdersList orders={data} />;
 */
export const safeApiCall = async <T>(
  apiCall: () => Promise<ApiResponse<T>>,
  errorHandler: (error: any) => string = handleApiError
): Promise<[T | null, string | null, boolean]> => {
  try {
    const response = await apiCall();
    if (isSuccessResponse(response)) {
      return [response.data, null, false];
    } else {
      return [null, errorHandler(response.error), false];
    }
  } catch (error) {
    return [null, errorHandler(error), false];
  }
};

/**
 * Formatteert query parameters voor API requests
 * 
 * @param params - Object met query parameters
 * @returns URL query string (zonder leading ?)
 * 
 * @example
 * const queryString = formatQueryParams({ page: 1, per_page: 10, search: 'test' });
 * // Resultaat: 'page=1&per_page=10&search=test'
 */
export const formatQueryParams = (params: Record<string, any>): string => {
  const validParams = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => {
      // Array waarden worden geformatteerd als key=value1&key=value2
      if (Array.isArray(value)) {
        return value
          .map(item => `${encodeURIComponent(key)}=${encodeURIComponent(item)}`)
          .join('&');
      }
      
      // Object waarden worden geformatteerd als JSON string
      if (typeof value === 'object') {
        return `${encodeURIComponent(key)}=${encodeURIComponent(JSON.stringify(value))}`;
      }
      
      // Standaard waarden
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join('&');
  
  return validParams;
};

/**
 * Controleert of een waarde een geldige API ID is
 * 
 * @param id - De ID om te controleren
 * @returns True als de ID geldig is, anders false
 * 
 * @example
 * if (isValidApiId(orderId)) {
 *   await apiClient.getOrderById(orderId);
 * }
 */
export const isValidApiId = (id: any): boolean => {
  if (id === undefined || id === null) return false;
  
  // Controleer of het een string of number is
  if (typeof id !== 'string' && typeof id !== 'number') return false;
  
  // Converteer naar string en controleer of het een geldige ID is
  const idStr = String(id);
  
  // Moet niet leeg zijn
  if (idStr.trim() === '') return false;
  
  // Als het een numerieke string is, moet het een positief getal zijn
  if (!isNaN(Number(idStr)) && Number(idStr) <= 0) return false;
  
  return true;
}; 