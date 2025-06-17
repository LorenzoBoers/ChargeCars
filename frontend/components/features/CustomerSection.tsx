import React, { useState, useCallback, useEffect } from 'react';
import { Button, Spinner, Chip } from "@nextui-org/react";
import { CheckCircleIcon, ExclamationTriangleIcon, UserPlusIcon, PencilIcon } from "@heroicons/react/24/outline";
import { FormSection } from '../ui/FormSection';
import { FormField } from '../ui/FormField';
import { AddressAutocomplete } from '../ui/AddressAutocomplete';
import { apiClient } from '../../lib/api';
import { CustomerFormData, AddressFormData, CustomerLookupResponse } from '../../types';

export interface CustomerSectionProps {
  /**
   * Customer form data
   */
  customerData: CustomerFormData;
  
  /**
   * Change handler for customer data
   */
  onCustomerDataChange: (data: CustomerFormData) => void;
  
  /**
   * Validation errors
   */
  validationErrors?: { [key: string]: string };
  
  /**
   * Field validation handler
   */
  onFieldValidation?: (fieldName: string, value: any) => void;
  
  /**
   * Loading state
   */
  isLoading?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

export interface CustomerLookupState {
  isLoading: boolean;
  isExpanded: boolean;
  existingCustomer: any | null;
  isEditMode: boolean;
  message: string;
  messageType: 'info' | 'success' | 'warning' | 'error';
}

/**
 * CustomerSection - Email-first customer creation component
 * 
 * Implements the email-first customer flow:
 * 1. User enters email first
 * 2. System looks up existing customer
 * 3. If found: auto-fill fields (read-only with edit toggle)
 * 4. If not found: expand form for new customer creation
 * 
 * Features:
 * - Email validation and lookup
 * - Auto-fill from existing customer data
 * - Inline customer creation
 * - Address autocomplete integration
 * - Copy address functionality
 * 
 * @example
 * ```tsx
 * <CustomerSection
 *   customerData={customerData}
 *   onCustomerDataChange={setCustomerData}
 *   validationErrors={validationErrors}
 *   onFieldValidation={handleFieldValidation}
 * />
 * ```
 */
export const CustomerSection: React.FC<CustomerSectionProps> = ({
  customerData,
  onCustomerDataChange,
  validationErrors = {},
  onFieldValidation,
  isLoading = false,
  className = '',
}) => {
  const [lookupState, setLookupState] = useState<CustomerLookupState>({
    isLoading: false,
    isExpanded: false,
    existingCustomer: null,
    isEditMode: false,
    message: '',
    messageType: 'info',
  });

  // Handle email change and trigger lookup
  const handleEmailChange = useCallback(async (email: string) => {
    // Update customer data
    onCustomerDataChange({
      ...customerData,
      email,
    });

    // Validate email format
    if (onFieldValidation) {
      onFieldValidation('customer.email', email);
    }

    // Clear previous state
    setLookupState(prev => ({
      ...prev,
      existingCustomer: null,
      isExpanded: false,
      isEditMode: false,
      message: '',
    }));

    // Check if email is valid before lookup
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return;
    }

    // Perform customer lookup
    setLookupState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await apiClient.lookupCustomerByEmail(email);
      
      if (response.success && response.data?.found) {
        // Existing customer found
        const customer = response.data.customer;
        
        // Auto-fill customer data
        onCustomerDataChange({
          ...customerData,
          email,
          company_name: customer.organization_name || '',
          legal_name: customer.legal_name || '',
          vat_number: customer.vat_number || '',
          chamber_of_commerce: customer.kvk_number || '',
          first_name: customer.first_name || '',
          last_name: customer.last_name || '',
          phone_number: customer.phone ? { number: customer.phone } : undefined,
          // Note: Address data would need to be mapped from customer response
        });

        setLookupState(prev => ({
          ...prev,
          isLoading: false,
          existingCustomer: customer,
          isExpanded: true,
          isEditMode: false,
          message: 'Bestaande klant gevonden en gegevens ingeladen',
          messageType: 'success',
        }));
      } else {
        // No customer found - expand form for new customer
        setLookupState(prev => ({
          ...prev,
          isLoading: false,
          existingCustomer: null,
          isExpanded: true,
          isEditMode: false,
          message: 'Nieuwe klant - vul de gegevens aan',
          messageType: 'info',
        }));
      }
    } catch (error) {
      console.error('Customer lookup error:', error);
      setLookupState(prev => ({
        ...prev,
        isLoading: false,
        message: 'Kon klant niet opzoeken, probeer opnieuw',
        messageType: 'error',
      }));
    }
  }, [customerData, onCustomerDataChange, onFieldValidation]);

  // Handle edit mode toggle
  const toggleEditMode = useCallback(() => {
    setLookupState(prev => ({
      ...prev,
      isEditMode: !prev.isEditMode,
    }));
  }, []);

  // Handle customer field changes
  const handleCustomerFieldChange = useCallback((field: keyof CustomerFormData, value: any) => {
    onCustomerDataChange({
      ...customerData,
      [field]: value,
    });
  }, [customerData, onCustomerDataChange]);

  // Handle address changes
  const handleAddressChange = useCallback((addressType: 'organization_address' | 'delivery_address', address: AddressFormData) => {
    onCustomerDataChange({
      ...customerData,
      [addressType]: address,
    });
  }, [customerData, onCustomerDataChange]);

  // Handle copy address functionality
  const handleCopyAddress = useCallback((shouldCopy: boolean) => {
    if (shouldCopy) {
      onCustomerDataChange({
        ...customerData,
        delivery_address: { ...customerData.organization_address },
      });
    }
  }, [customerData, onCustomerDataChange]);

  const isFieldDisabled = isLoading || (lookupState.existingCustomer && !lookupState.isEditMode);

  return (
    <FormSection
      title="Eindklant"
      description="Voer eerst het e-mailadres in om te controleren of de klant al bestaat"
      required
      className={className}
    >
      {/* Email Field - Always Visible */}
      <div className="relative">
        <FormField
          name="email"
          type="email"
          label="E-mailadres"
          placeholder="klant@example.com"
          value={customerData.email}
          onChange={handleEmailChange}
          required
          disabled={isLoading}
          errorMessage={validationErrors['customer.email']}
          endContent={lookupState.isLoading && <Spinner size="sm" />}
        />
      </div>

      {/* Lookup Message */}
      {lookupState.message && (
        <div className="flex items-center gap-2">
          {lookupState.messageType === 'success' && (
            <CheckCircleIcon className="h-5 w-5 text-success-500" />
          )}
          {lookupState.messageType === 'warning' && (
            <ExclamationTriangleIcon className="h-5 w-5 text-warning-500" />
          )}
          {lookupState.messageType === 'info' && (
            <UserPlusIcon className="h-5 w-5 text-primary-500" />
          )}
          <span className={`text-sm ${
            lookupState.messageType === 'success' ? 'text-success-600' :
            lookupState.messageType === 'warning' ? 'text-warning-600' :
            lookupState.messageType === 'error' ? 'text-danger-600' :
            'text-primary-600'
          }`}>
            {lookupState.message}
          </span>
          
          {/* Edit Toggle for Existing Customers */}
          {lookupState.existingCustomer && (
            <Button
              size="sm"
              variant="light"
              color="primary"
              startContent={<PencilIcon className="h-4 w-4" />}
              onPress={toggleEditMode}
            >
              {lookupState.isEditMode ? 'Alleen Lezen' : 'Bewerken'}
            </Button>
          )}
        </div>
      )}

      {/* Expanded Customer Form */}
      {lookupState.isExpanded && (
        <div className="space-y-6 mt-6">
          {/* Organization Information */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-foreground">Organisatie Informatie</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                name="company_name"
                label="Bedrijfsnaam"
                placeholder="ChargeCars B.V."
                value={customerData.company_name}
                onChange={(value) => handleCustomerFieldChange('company_name', value)}
                required
                disabled={isFieldDisabled}
                errorMessage={validationErrors['customer.company_name']}
              />
              
              <FormField
                name="legal_name"
                label="Juridische naam"
                placeholder="ChargeCars B.V."
                value={customerData.legal_name}
                onChange={(value) => handleCustomerFieldChange('legal_name', value)}
                required
                disabled={isFieldDisabled}
                errorMessage={validationErrors['customer.legal_name']}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                name="vat_number"
                label="BTW-nummer"
                placeholder="NL123456789B01"
                value={customerData.vat_number}
                onChange={(value) => handleCustomerFieldChange('vat_number', value)}
                disabled={isFieldDisabled}
                errorMessage={validationErrors['customer.vat_number']}
              />
              
              <FormField
                name="chamber_of_commerce"
                label="KvK-nummer"
                placeholder="12345678"
                value={customerData.chamber_of_commerce}
                onChange={(value) => handleCustomerFieldChange('chamber_of_commerce', value)}
                disabled={isFieldDisabled}
                errorMessage={validationErrors['customer.chamber_of_commerce']}
              />
            </div>

            <FormField
              name="phone_number"
              type="tel"
              label="Telefoonnummer"
              placeholder="+31 6 12345678"
              value={customerData.phone_number?.number || ''}
              onChange={(value) => handleCustomerFieldChange('phone_number', { number: value })}
              required
              disabled={isFieldDisabled}
              errorMessage={validationErrors['customer.phone_number.number']}
            />
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-foreground">Contactpersoon</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                name="first_name"
                label="Voornaam"
                placeholder="Jan"
                value={customerData.first_name}
                onChange={(value) => handleCustomerFieldChange('first_name', value)}
                required
                disabled={isFieldDisabled}
                errorMessage={validationErrors['customer.first_name']}
              />
              
              <FormField
                name="last_name"
                label="Achternaam"
                placeholder="de Vries"
                value={customerData.last_name}
                onChange={(value) => handleCustomerFieldChange('last_name', value)}
                required
                disabled={isFieldDisabled}
                errorMessage={validationErrors['customer.last_name']}
              />
            </div>
          </div>

          {/* Organization Address */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-foreground">Organisatie Adres</h4>
            <AddressAutocomplete
              value={customerData.organization_address}
              onChange={(address) => handleAddressChange('organization_address', address)}
              namePrefix="customer.organization_address"
              required
              disabled={isFieldDisabled}
              validationErrors={validationErrors}
              isLoading={isLoading}
            />
          </div>

          {/* Delivery Address */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-foreground">Bezorgadres</h4>
            <AddressAutocomplete
              value={customerData.delivery_address}
              onChange={(address) => handleAddressChange('delivery_address', address)}
              namePrefix="customer.delivery_address"
              required
              disabled={isFieldDisabled}
              showCopyCheckbox
              copyCheckboxLabel="Zelfde als organisatie adres"
              onCopyAddress={handleCopyAddress}
              validationErrors={validationErrors}
              isLoading={isLoading}
            />
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-foreground">Aanvullende Informatie</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                name="billing_account_name"
                label="Factuurrekening naam"
                placeholder="ChargeCars B.V."
                value={customerData.billing_info?.billing_account_name || ''}
                onChange={(value) => handleCustomerFieldChange('billing_info', { 
                  ...customerData.billing_info, 
                  billing_account_name: value 
                })}
                disabled={isFieldDisabled}
                errorMessage={validationErrors['customer.billing_info.billing_account_name']}
              />
              
              <FormField
                name="iban"
                label="IBAN"
                placeholder="NL91 ABNA 0417 1643 00"
                value={customerData.billing_info?.iban || ''}
                onChange={(value) => handleCustomerFieldChange('billing_info', { 
                  ...customerData.billing_info, 
                  iban: value 
                })}
                disabled={isFieldDisabled}
                errorMessage={validationErrors['customer.billing_info.iban']}
              />
            </div>
          </div>
        </div>
      )}
    </FormSection>
  );
};

export default CustomerSection;