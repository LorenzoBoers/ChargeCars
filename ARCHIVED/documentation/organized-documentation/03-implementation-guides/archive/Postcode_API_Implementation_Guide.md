# ChargeCars V2 - Postcode API Implementation Guide
**Nederlandse Adres Validatie voor Frontend & Backend Development**  
*Created: 1 juni 2025*

---

## 🎯 **POSTCODE API OVERVIEW**

### **Service Details**
- **Provider**: Postcode API (postcodeapi.nu)
- **Data Source**: Nederlandse BAG (Basisregistratie Adressen en Gebouwen) + CBS Open Data
- **API Key**: `gqP9hOZvsZ1hPCvR4XzDa8WVS2xjtuBNeZsH56g6`
- **Base URL**: `https://api.postcodeapi.nu/v3/lookup`
- **Response Time**: < 200ms (100% uptime guaranteed)
- **Rate Limit**: 100 requests/minute

### **Benefits vs Alternatives**
- **✅ Dutch Focus**: Optimized specifically for Nederlandse addresses
- **✅ BAG Integration**: Direct access to official government address database
- **✅ Complete Data**: Street, city, municipality, province, coordinates
- **✅ High Accuracy**: >99% accuracy for Dutch addresses
- **✅ Cost Effective**: €5/month starting plan
- **✅ No Google Dependency**: Reduces Google API quota usage

---

## 🔧 **FRONTEND IMPLEMENTATION**

### **React TypeScript Integration**

#### **API Client Setup**
```typescript
// postcode-api-client.ts
class PostcodeAPIClient {
  private readonly baseURL = 'https://api.postcodeapi.nu/v3/lookup';
  private readonly apiKey = 'gqP9hOZvsZ1hPCvR4XzDa8WVS2xjtuBNeZsH56g6';
  private readonly timeout = 5000;

  async validateAddress(postalCode: string, houseNumber: string): Promise<PostcodeAPIResponse> {
    // Format postal code (remove spaces, uppercase)
    const formattedPostcode = postalCode.replace(/\s/g, '').toUpperCase();
    
    // Validate format (4 digits + 2 letters)
    if (!/^\d{4}[A-Z]{2}$/.test(formattedPostcode)) {
      throw new Error('Invalid Dutch postal code format');
    }

    const url = `${this.baseURL}/${formattedPostcode}/${houseNumber}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Api-Key': this.apiKey,
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(this.timeout)
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Address not found');
        }
        if (response.status === 429) {
          throw new Error('Rate limit exceeded');
        }
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error');
    }
  }

  formatPostalCode(input: string): string {
    return input.replace(/\s/g, '').toUpperCase();
  }

  isValidPostalCodeFormat(postalCode: string): boolean {
    return /^\d{4}[A-Z]{2}$/.test(postalCode.replace(/\s/g, ''));
  }
}

// Types
interface PostcodeAPIResponse {
  postcode: string;
  number: number;
  street: string;
  city: string;
  municipality: string;
  province: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
}

interface AddressValidationResult {
  valid: boolean;
  source: 'PostcodeAPI' | 'Google' | 'Manual';
  street?: string;
  city?: string;
  municipality?: string;
  province?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  confidence: 'high' | 'medium' | 'low';
  error?: string;
}
```

#### **React Hook for Address Validation**
```typescript
// useAddressValidation.ts
import { useState, useCallback } from 'react';

export const useAddressValidation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AddressValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const client = new PostcodeAPIClient();

  const validateAddress = useCallback(async (postalCode: string, houseNumber: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const apiResponse = await client.validateAddress(postalCode, houseNumber);
      
      const result: AddressValidationResult = {
        valid: true,
        source: 'PostcodeAPI',
        street: apiResponse.street,
        city: apiResponse.city,
        municipality: apiResponse.municipality,
        province: apiResponse.province,
        coordinates: {
          latitude: apiResponse.location.coordinates[1],
          longitude: apiResponse.location.coordinates[0]
        },
        confidence: 'high'
      };

      setResult(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      
      const failedResult: AddressValidationResult = {
        valid: false,
        source: 'PostcodeAPI',
        confidence: 'low',
        error: errorMessage
      };
      
      setResult(failedResult);
      return failedResult;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    validateAddress,
    isLoading,
    result,
    error,
    reset
  };
};
```

#### **Address Input Component**
```typescript
// AddressInput.tsx
import React, { useState, useEffect } from 'react';
import { useAddressValidation } from './useAddressValidation';

interface AddressInputProps {
  onAddressSelect: (address: AddressValidationResult) => void;
  onValidationChange?: (isValid: boolean) => void;
  className?: string;
  required?: boolean;
}

export const AddressInput: React.FC<AddressInputProps> = ({
  onAddressSelect,
  onValidationChange,
  className = '',
  required = false
}) => {
  const [postalCode, setPostalCode] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const { validateAddress, isLoading, result, error } = useAddressValidation();

  // Auto-validate when both fields are filled
  useEffect(() => {
    if (postalCode.length === 6 && houseNumber.length > 0) {
      validateAddress(postalCode, houseNumber);
    }
  }, [postalCode, houseNumber, validateAddress]);

  // Notify parent of validation status
  useEffect(() => {
    if (result) {
      onValidationChange?.(result.valid);
      if (result.valid) {
        onAddressSelect(result);
      }
    }
  }, [result, onAddressSelect, onValidationChange]);

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '').toUpperCase();
    if (value.length <= 6) {
      setPostalCode(value);
    }
  };

  const handleHouseNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHouseNumber(e.target.value);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-2 gap-4">
        {/* Postal Code Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Postcode {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={postalCode}
            onChange={handlePostalCodeChange}
            placeholder="1012AB"
            maxLength={6}
            required={required}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-uppercase"
          />
        </div>

        {/* House Number Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Huisnummer {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={houseNumber}
            onChange={handleHouseNumberChange}
            placeholder="123"
            required={required}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex items-center space-x-2 text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm">Adres valideren...</span>
        </div>
      )}

      {/* Success Result */}
      {result && result.valid && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-start space-x-2">
            <div className="text-green-500 mt-0.5">✅</div>
            <div>
              <p className="text-green-800 font-medium">
                {result.street} {houseNumber}, {result.city}
              </p>
              <p className="text-green-600 text-sm">
                {result.municipality}, {result.province}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Result */}
      {(error || (result && !result.valid)) && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-start space-x-2">
            <div className="text-red-500 mt-0.5">❌</div>
            <div>
              <p className="text-red-800 font-medium">
                Adres niet gevonden
              </p>
              <p className="text-red-600 text-sm">
                Controleer de postcode en het huisnummer
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
```

---

## 🔧 **BACKEND IMPLEMENTATION (XANO)**

### **Xano Function: validateDutchAddress**

```javascript
// Function Name: validateDutchAddress
// Input: { postal_code: string, house_number: string, house_number_addition?: string }

function validateDutchAddress(postal_code, house_number, house_number_addition = '') {
  // Environment variables needed in Xano:
  const POSTCODE_API_KEY = 'gqP9hOZvsZ1hPCvR4XzDa8WVS2xjtuBNeZsH56g6';
  const POSTCODE_API_BASE_URL = 'https://api.postcodeapi.nu/v3/lookup';
  
  // Format postal code
  const formatted_postcode = postal_code.replace(/\s/g, '').toUpperCase();
  
  // Validate Dutch postal code format
  if (!/^\d{4}[A-Z]{2}$/.test(formatted_postcode)) {
    return {
      valid: false,
      error: 'Invalid Dutch postal code format',
      source: 'PostcodeAPI'
    };
  }
  
  // Build API URL
  const api_url = `${POSTCODE_API_BASE_URL}/${formatted_postcode}/${house_number}`;
  
  try {
    // Call Postcode API
    const response = fetch(api_url, {
      method: 'GET',
      headers: {
        'X-Api-Key': POSTCODE_API_KEY,
        'Accept': 'application/json'
      }
    });
    
    if (response.ok && response.json) {
      const data = response.json;
      
      // Transform to standardized format
      const validation_result = {
        valid: true,
        source: 'PostcodeAPI',
        formatted_address: `${data.street} ${house_number}, ${formatted_postcode} ${data.city}`,
        street: data.street,
        house_number: house_number,
        house_number_addition: house_number_addition,
        postal_code: formatted_postcode,
        city: data.city,
        municipality: data.municipality,
        province: data.province,
        coordinates: {
          latitude: data.location.coordinates[1],
          longitude: data.location.coordinates[0]
        },
        confidence: 'high',
        validation_id: generateUUID()
      };
      
      // Log validation to database
      logAddressValidation(validation_result, {
        postal_code: postal_code,
        house_number: house_number,
        house_number_addition: house_number_addition
      });
      
      return validation_result;
    }
    
    // Handle API errors
    if (response.status === 404) {
      return {
        valid: false,
        error: 'Address not found in Dutch BAG database',
        source: 'PostcodeAPI'
      };
    }
    
    if (response.status === 429) {
      return {
        valid: false,
        error: 'Rate limit exceeded',
        source: 'PostcodeAPI'
      };
    }
    
    throw new Error(`API returned status ${response.status}`);
    
  } catch (error) {
    console.error('Postcode API failed:', error);
    
    // Fallback to Google Geocoding
    return validateWithGoogle(formatted_postcode, house_number, house_number_addition);
  }
}

// Helper function for database logging
function logAddressValidation(validation_result, input_data) {
  return addRecord('address_validations', {
    input_data: input_data,
    validation_source: validation_result.source,
    validation_result: validation_result,
    confidence_score: validation_result.confidence,
    response_time_ms: Date.now() - start_time,
    business_entity_id: getCurrentBusinessEntity()
  });
}
```

---

## 📊 **PERFORMANCE & MONITORING**

### **Performance Metrics**
- **Response Time**: < 200ms average
- **Success Rate**: > 99% for valid Dutch addresses
- **Uptime**: 100% guaranteed by provider
- **Rate Limits**: 100 requests/minute (monitor usage)

### **Error Handling Strategy**
```typescript
// Error handling hierarchy
const errorHandlingStrategy = {
  1: 'Postcode API (Primary)',
  2: 'Google Geocoding (Fallback)',
  3: 'Manual Entry (Last Resort)'
};

// Common error scenarios
const errorTypes = {
  'INVALID_FORMAT': 'Show format help (1234AB)',
  'NOT_FOUND': 'Suggest manual entry',
  'RATE_LIMIT': 'Show temporary message, retry',
  'NETWORK_ERROR': 'Fallback to Google API'
};
```

### **Caching Strategy**
```typescript
// Frontend caching
const addressCache = {
  storage: 'localStorage',
  ttl: 30 * 24 * 60 * 60 * 1000, // 30 days
  maxEntries: 1000,
  keyFormat: 'addr_{postcode}_{housenumber}'
};

// Backend caching (Xano)
const xanoCaching = {
  table: 'address_cache',
  ttl: '30 days',
  cleanup: 'weekly'
};
```

---

## 🧪 **TESTING GUIDE**

### **Test Cases**

#### **Valid Address Tests**
```typescript
const validTestCases = [
  { postcode: '1012AB', number: '1', expected: 'Amsterdam' },
  { postcode: '2585 HV', number: '147', expected: 'Den Haag' },
  { postcode: '3011AD', number: '105', expected: 'Rotterdam' },
  { postcode: '5611AZ', number: '1', expected: 'Eindhoven' }
];
```

#### **Invalid Address Tests**
```typescript
const invalidTestCases = [
  { postcode: '0000XX', number: '999', expected: 'Address not found' },
  { postcode: '1234', number: '1', expected: 'Invalid format' },
  { postcode: 'ABCD12', number: '1', expected: 'Invalid format' }
];
```

### **Integration Testing**
```bash
# Test API directly
curl -H "X-Api-Key: gqP9hOZvsZ1hPCvR4XzDa8WVS2xjtuBNeZsH56g6" \
     "https://api.postcodeapi.nu/v3/lookup/1012AB/1"

# Expected response
{
  "postcode": "1012AB",
  "number": 1,
  "street": "Amstel",
  "city": "Amsterdam",
  "municipality": "Amsterdam",
  "province": "Noord-Holland",
  "location": {
    "type": "Point",
    "coordinates": [4.89707, 52.36832]
  }
}
```

---

## 🚀 **DEPLOYMENT CHECKLIST**

### **Frontend Deployment**
- [ ] API key configured in environment variables
- [ ] AddressInput component integrated in forms
- [ ] Error handling implemented
- [ ] Caching strategy activated
- [ ] User experience testing completed

### **Backend Deployment**
- [ ] Xano function `validateDutchAddress` created
- [ ] Environment variables configured
- [ ] API endpoint `/api/address/validate` configured
- [ ] Rate limiting set up
- [ ] Database logging implemented
- [ ] Fallback to Google configured

### **Monitoring Setup**
- [ ] API usage tracking
- [ ] Error rate monitoring
- [ ] Performance metrics dashboard
- [ ] Alert system for failures

---

## 📞 **SUPPORT & TROUBLESHOOTING**

### **Common Issues**
1. **Rate Limit Exceeded**: Upgrade plan or implement better caching
2. **Invalid API Key**: Verify key in environment settings
3. **Network Timeouts**: Check internet connection and API status
4. **Invalid Postal Codes**: Implement format validation

### **Support Contacts**
- **Postcode API Support**: info@postcodeapi.nu
- **API Documentation**: https://www.postcodeapi.nu/docs
- **Status Page**: Check API status for outages

---

**🎯 This guide provides everything needed for successful Postcode API integration in the ChargeCars V2 platform, ensuring accurate Dutch address validation with excellent user experience.**

---

*Postcode API Implementation Guide | ChargeCars V2 Technical Team | 1 juni 2025* 