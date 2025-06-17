import React, { useState, useCallback, useEffect } from 'react';
import { Input, Spinner, Checkbox } from "@nextui-org/react";
import { MapPinIcon } from "@heroicons/react/24/outline";

export interface AddressData {
  street_name: string;
  house_number: string;
  postal_code: string;
  city: string;
  province: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface AddressAutocompleteProps {
  /**
   * Current address data
   */
  value: AddressData;
  
  /**
   * Change handler for address data
   */
  onChange: (address: AddressData) => void;
  
  /**
   * Field name prefix (e.g., 'delivery_address' for delivery_address.street_name)
   */
  namePrefix?: string;
  
  /**
   * Whether fields are required
   */
  required?: boolean;
  
  /**
   * Whether fields are disabled
   */
  disabled?: boolean;
  
  /**
   * Whether to show copy address checkbox
   */
  showCopyCheckbox?: boolean;
  
  /**
   * Label for copy checkbox
   */
  copyCheckboxLabel?: string;
  
  /**
   * Handler for copy address checkbox
   */
  onCopyAddress?: (shouldCopy: boolean) => void;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Form validation errors
   */
  validationErrors?: { [key: string]: string };
  
  /**
   * Loading state
   */
  isLoading?: boolean;
}

// Dutch PostcodeAPI.nu integration
interface PostcodeApiResponse {
  success: boolean;
  street?: string;
  city?: string;
  province?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * AddressAutocomplete - Dutch address autocomplete component
 * 
 * Provides address autocomplete functionality using PostcodeAPI.nu:
 * - Auto-fills address when postal code + house number are entered
 * - Shows loading states during API calls
 * - Handles API errors gracefully
 * - Supports copy address functionality
 * - Validates Dutch postal codes
 * 
 * @example
 * ```tsx
 * <AddressAutocomplete
 *   value={addressData}
 *   onChange={setAddressData}
 *   required
 *   showCopyCheckbox
 *   copyCheckboxLabel="Same as organization address"
 *   onCopyAddress={handleCopyAddress}
 * />
 * ```
 */
export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  namePrefix = '',
  required = false,
  disabled = false,
  showCopyCheckbox = false,
  copyCheckboxLabel = "Gebruik hetzelfde adres",
  onCopyAddress,
  className = '',
  validationErrors = {},
  isLoading = false,
}) => {
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupMessage, setLookupMessage] = useState<string>('');
  const [copyAddressChecked, setCopyAddressChecked] = useState(false);

  // Generate field names with prefix
  const getFieldName = (field: string) => namePrefix ? `${namePrefix}.${field}` : field;

  // Validate Dutch postal code format
  const isValidPostalCode = (postalCode: string): boolean => {
    return /^[1-9][0-9]{3}\s?[A-Z]{2}$/i.test(postalCode.trim());
  };

  // Lookup address using PostcodeAPI.nu
  const lookupAddress = useCallback(async (postalCode: string, houseNumber: string) => {
    if (!postalCode || !houseNumber || !isValidPostalCode(postalCode)) {
      return;
    }

    setIsLookingUp(true);
    setLookupMessage('');

    try {
      // Clean postal code (remove spaces)
      const cleanPostalCode = postalCode.replace(/\s/g, '');
      
      // Use PostcodeAPI.nu (this would need to be implemented with proper API key)
      const response = await fetch(
        `https://api.postcodeapi.nu/v3/lookup/${cleanPostalCode}/${houseNumber}`,
        {
          headers: {
            'X-Api-Key': process.env.NEXT_PUBLIC_POSTCODE_API_KEY || 'demo-key',
          },
        }
      );

      if (response.ok) {
        const data: PostcodeApiResponse = await response.json();
        
        if (data.success && data.street && data.city && data.province) {
          // Update address with API data
          onChange({
            ...value,
            street_name: data.street,
            city: data.city,
            province: data.province,
            coordinates: data.latitude && data.longitude ? {
              latitude: data.latitude,
              longitude: data.longitude,
            } : undefined,
          });
          
          setLookupMessage('Adres automatisch ingevuld');
        } else {
          setLookupMessage('Adres niet gevonden, vul handmatig in');
        }
      } else {
        setLookupMessage('Adres niet gevonden, vul handmatig in');
      }
    } catch (error) {
      console.error('Address lookup error:', error);
      setLookupMessage('Kon adres niet opzoeken, vul handmatig in');
    } finally {
      setIsLookingUp(false);
    }
  }, [value, onChange]);

  // Debounced address lookup
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value.postal_code && value.house_number) {
        lookupAddress(value.postal_code, value.house_number);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [value.postal_code, value.house_number, lookupAddress]);

  // Handle field changes
  const handleFieldChange = (field: keyof AddressData, newValue: string) => {
    onChange({
      ...value,
      [field]: newValue,
    });
  };

  // Handle copy address checkbox
  const handleCopyAddressChange = (checked: boolean) => {
    setCopyAddressChecked(checked);
    if (onCopyAddress) {
      onCopyAddress(checked);
    }
  };

  const fieldDisabled = disabled || isLoading;

  return (
    <div className={`space-y-4 ${className}`}>
      {showCopyCheckbox && (
        <Checkbox
          isSelected={copyAddressChecked}
          onValueChange={handleCopyAddressChange}
          isDisabled={fieldDisabled}
        >
          {copyCheckboxLabel}
        </Checkbox>
      )}
      
      {!copyAddressChecked && (
        <>
          {/* Postal Code and House Number Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Postcode"
              placeholder="1234 AB"
              value={value.postal_code || ''}
              onValueChange={(val) => handleFieldChange('postal_code', val)}
              isRequired={required}
              isDisabled={fieldDisabled}
              errorMessage={validationErrors[getFieldName('postal_code')]}
              isInvalid={!!validationErrors[getFieldName('postal_code')]}
              startContent={<MapPinIcon className="h-4 w-4 text-default-400" />}
              endContent={isLookingUp && <Spinner size="sm" />}
            />
            
            <Input
              label="Huisnummer"
              placeholder="123"
              value={value.house_number || ''}
              onValueChange={(val) => handleFieldChange('house_number', val)}
              isRequired={required}
              isDisabled={fieldDisabled}
              errorMessage={validationErrors[getFieldName('house_number')]}
              isInvalid={!!validationErrors[getFieldName('house_number')]}
              endContent={isLookingUp && <Spinner size="sm" />}
            />
          </div>

          {/* Lookup Message */}
          {lookupMessage && (
            <p className={`text-sm ${
              lookupMessage.includes('automatisch') 
                ? 'text-success-600' 
                : 'text-warning-600'
            }`}>
              {lookupMessage}
            </p>
          )}

          {/* Street Name */}
          <Input
            label="Straatnaam"
            placeholder="Voorbeeldstraat"
            value={value.street_name || ''}
            onValueChange={(val) => handleFieldChange('street_name', val)}
            isRequired={required}
            isDisabled={fieldDisabled}
            errorMessage={validationErrors[getFieldName('street_name')]}
            isInvalid={!!validationErrors[getFieldName('street_name')]}
          />

          {/* City and Province Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Plaats"
              placeholder="Amsterdam"
              value={value.city || ''}
              onValueChange={(val) => handleFieldChange('city', val)}
              isRequired={required}
              isDisabled={fieldDisabled}
              errorMessage={validationErrors[getFieldName('city')]}
              isInvalid={!!validationErrors[getFieldName('city')]}
            />
            
            <Input
              label="Provincie"
              placeholder="Noord-Holland"
              value={value.province || ''}
              onValueChange={(val) => handleFieldChange('province', val)}
              isRequired={required}
              isDisabled={fieldDisabled}
              errorMessage={validationErrors[getFieldName('province')]}
              isInvalid={!!validationErrors[getFieldName('province')]}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AddressAutocomplete;