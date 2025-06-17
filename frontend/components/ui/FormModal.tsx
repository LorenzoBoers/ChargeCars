import React, { useState, useCallback } from 'react';
import { Button } from "@nextui-org/react";
import { BaseModal, ModalSize } from './BaseModal';
import { 
  isValidEmail, 
  isValidDutchPostalCode, 
  isValidDutchPhoneNumber,
  isValidIBAN,
  isValidDutchVATNumber,
  isValidDutchKvKNumber,
  isRequired,
  hasMinLength,
  hasMaxLength,
  ValidationErrors
} from '../../lib/utils/validation';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  phone?: boolean;
  postalCode?: boolean;
  iban?: boolean;
  vatNumber?: boolean;
  kvkNumber?: boolean;
  custom?: (value: any) => string | null;
}

export interface ValidationErrors {
  [fieldName: string]: string;
}

export interface FormAction {
  type: 'submit' | 'cancel' | 'custom';
  label: string;
  variant?: 'solid' | 'bordered' | 'light' | 'flat' | 'faded' | 'shadow' | 'ghost';
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  action?: string;
  isLoading?: boolean;
  disabled?: boolean;
}

export interface FormModalProps<T = any> {
  /**
   * Whether the modal is open
   */
  isOpen: boolean;
  
  /**
   * Function to call when modal should close
   */
  onClose: () => void;
  
  /**
   * Modal title
   */
  title: string;
  
  /**
   * Modal size
   */
  size?: ModalSize;
  
  /**
   * Form data
   */
  formData: T;
  
  /**
   * Function to update form data
   */
  onFormDataChange: (data: T) => void;
  
  /**
   * Validation rules for form fields
   */
  validationRules?: { [K in keyof T]?: ValidationRule };
  
  /**
   * Form submission handler
   */
  onSubmit: (data: T, action?: string) => Promise<void> | void;
  
  /**
   * Form actions (buttons in footer)
   */
  actions: FormAction[];
  
  /**
   * Form content
   */
  children: React.ReactNode;
  
  /**
   * Whether form has unsaved changes
   */
  hasUnsavedChanges?: boolean;
  
  /**
   * Loading state
   */
  isLoading?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * FormModal - Form-specific modal wrapper
 * 
 * Provides form functionality built on top of BaseModal:
 * - Form validation
 * - Submit handling
 * - Unsaved changes warning
 * - Loading states
 * - Standardized action buttons
 * 
 * @example
 * ```tsx
 * <FormModal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   title="Create Order"
 *   formData={orderData}
 *   onFormDataChange={setOrderData}
 *   onSubmit={handleSubmit}
 *   actions={[
 *     { type: 'cancel', label: 'Cancel' },
 *     { type: 'submit', label: 'Save', variant: 'solid', color: 'primary' }
 *   ]}
 * >
 *   <FormField name="title" label="Order Title" />
 * </FormModal>
 * ```
 */
export function FormModal<T = any>({
  isOpen,
  onClose,
  title,
  size = 'lg',
  formData,
  onFormDataChange,
  validationRules = {},
  onSubmit,
  actions,
  children,
  hasUnsavedChanges = false,
  isLoading = false,
  className,
}: FormModalProps<T>) {
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation function
  const validateField = useCallback((fieldName: string, value: any): string | null => {
    const rules = validationRules[fieldName as keyof T];
    if (!rules) return null;

    // Required validation
    if (rules.required && !isRequired(value)) {
      return ValidationErrors.REQUIRED;
    }

    // Skip other validations if field is empty and not required
    if (!value || value.toString().trim() === '') return null;

    // Email validation
    if (rules.email && !isValidEmail(value)) {
      return ValidationErrors.INVALID_EMAIL;
    }

    // Phone validation
    if (rules.phone && !isValidDutchPhoneNumber(value)) {
      return ValidationErrors.INVALID_PHONE;
    }

    // Postal code validation
    if (rules.postalCode && !isValidDutchPostalCode(value)) {
      return ValidationErrors.INVALID_POSTAL_CODE;
    }

    // IBAN validation
    if (rules.iban && !isValidIBAN(value)) {
      return ValidationErrors.INVALID_IBAN;
    }

    // VAT number validation
    if (rules.vatNumber && !isValidDutchVATNumber(value)) {
      return ValidationErrors.INVALID_VAT;
    }

    // KvK number validation
    if (rules.kvkNumber && !isValidDutchKvKNumber(value)) {
      return ValidationErrors.INVALID_KVK;
    }

    // Length validations
    if (rules.minLength && !hasMinLength(value.toString(), rules.minLength)) {
      return ValidationErrors.MIN_LENGTH(rules.minLength);
    }

    if (rules.maxLength && !hasMaxLength(value.toString(), rules.maxLength)) {
      return ValidationErrors.MAX_LENGTH(rules.maxLength);
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value.toString())) {
      return 'Ongeldige invoer';
    }

    // Custom validation
    if (rules.custom) {
      return rules.custom(value);
    }

    return null;
  }, [validationRules]);

  // Validate all fields
  const validateForm = useCallback((): boolean => {
    const errors: ValidationErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const value = (formData as any)[fieldName];
      const error = validateField(fieldName, value);
      if (error) {
        errors[fieldName] = error;
        isValid = false;
      }
    });

    setValidationErrors(errors);
    return isValid;
  }, [formData, validationRules, validateField]);

  // Handle field validation on blur
  const handleFieldValidation = useCallback((fieldName: string, value: any) => {
    const error = validateField(fieldName, value);
    setValidationErrors(prev => ({
      ...prev,
      [fieldName]: error || ''
    }));
  }, [validateField]);

  // Handle form submission
  const handleSubmit = useCallback(async (action?: string) => {
    if (isSubmitting || isLoading) return;

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData, action);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSubmit, validateForm, isSubmitting, isLoading]);

  // Handle close with unsaved changes warning
  const handleClose = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        'Er zijn niet-opgeslagen wijzigingen. Weet je zeker dat je wilt sluiten?'
      );
      if (!confirmed) return;
    }
    onClose();
  }, [hasUnsavedChanges, onClose]);

  // Generate action buttons
  const actionButtons = actions.map((action, index) => {
    const isSubmitAction = action.type === 'submit';
    const buttonIsLoading = isSubmitAction && (isSubmitting || action.isLoading);

    return (
      <Button
        key={index}
        variant={action.variant || (action.type === 'cancel' ? 'bordered' : 'solid')}
        color={action.color || (action.type === 'cancel' ? 'default' : 'primary')}
        onPress={() => {
          if (action.type === 'cancel') {
            handleClose();
          } else if (action.type === 'submit') {
            handleSubmit(action.action);
          }
        }}
        isLoading={buttonIsLoading}
        isDisabled={action.disabled || isSubmitting || isLoading}
      >
        {action.label}
      </Button>
    );
  });

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size={size}
      className={className}
      isDismissable={!isSubmitting && !isLoading}
      footer={<div className="flex gap-2">{actionButtons}</div>}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="space-y-6"
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            // Pass form context to child components
            return React.cloneElement(child, {
              formData,
              onFormDataChange,
              validationErrors,
              onFieldValidation: handleFieldValidation,
              isLoading: isLoading || isSubmitting,
            } as any);
          }
          return child;
        })}
      </form>
    </BaseModal>
  );
}

export default FormModal;