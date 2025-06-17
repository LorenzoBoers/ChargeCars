import React, { useCallback } from 'react';
import { Input, Textarea, Select, SelectItem, Checkbox } from "@nextui-org/react";
import { ValidationErrors } from './FormModal';

export type FormFieldType = 
  | 'text' 
  | 'email' 
  | 'tel' 
  | 'password' 
  | 'number'
  | 'textarea' 
  | 'select' 
  | 'checkbox'
  | 'autocomplete';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FormFieldProps {
  /**
   * Field name (used for form data key)
   */
  name: string;
  
  /**
   * Field label
   */
  label: string;
  
  /**
   * Field type
   */
  type?: FormFieldType;
  
  /**
   * Field value
   */
  value?: any;
  
  /**
   * Change handler
   */
  onChange?: (value: any) => void;
  
  /**
   * Placeholder text
   */
  placeholder?: string;
  
  /**
   * Whether field is required
   */
  required?: boolean;
  
  /**
   * Whether field is disabled
   */
  disabled?: boolean;
  
  /**
   * Whether field is read-only
   */
  readOnly?: boolean;
  
  /**
   * Field description/help text
   */
  description?: string;
  
  /**
   * Options for select fields
   */
  options?: SelectOption[];
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Start content (icon, etc.)
   */
  startContent?: React.ReactNode;
  
  /**
   * End content (icon, button, etc.)
   */
  endContent?: React.ReactNode;
  
  /**
   * Validation error message
   */
  errorMessage?: string;
  
  /**
   * Auto-complete attribute
   */
  autoComplete?: string;
  
  // Form context props (injected by FormModal)
  formData?: any;
  onFormDataChange?: (data: any) => void;
  validationErrors?: ValidationErrors;
  onFieldValidation?: (fieldName: string, value: any) => void;
  isLoading?: boolean;
}

/**
 * FormField - Standardized form field component
 * 
 * Provides consistent form fields with:
 * - Validation display
 * - Loading states
 * - Multiple input types
 * - Consistent styling
 * - Form integration
 * 
 * @example
 * ```tsx
 * <FormField
 *   name="email"
 *   type="email"
 *   label="Email Address"
 *   placeholder="Enter your email"
 *   required
 * />
 * ```
 */
export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  type = 'text',
  value: propValue,
  onChange: propOnChange,
  placeholder,
  required = false,
  disabled = false,
  readOnly = false,
  description,
  options = [],
  className = '',
  startContent,
  endContent,
  errorMessage: propErrorMessage,
  autoComplete,
  // Form context props
  formData,
  onFormDataChange,
  validationErrors,
  onFieldValidation,
  isLoading = false,
}) => {
  // Get value from form data or prop
  const fieldValue = formData ? formData[name] : propValue;
  
  // Get error from validation errors or prop
  const errorMessage = validationErrors?.[name] || propErrorMessage;
  
  // Handle value change
  const handleChange = useCallback((newValue: any) => {
    if (onFormDataChange && formData) {
      // Update form data
      onFormDataChange({
        ...formData,
        [name]: newValue
      });
    }
    
    // Call prop onChange if provided
    if (propOnChange) {
      propOnChange(newValue);
    }
  }, [formData, onFormDataChange, name, propOnChange]);

  // Handle blur for validation
  const handleBlur = useCallback(() => {
    if (onFieldValidation) {
      onFieldValidation(name, fieldValue);
    }
  }, [onFieldValidation, name, fieldValue]);

  const baseProps = {
    label,
    placeholder,
    isRequired: required,
    isDisabled: disabled || isLoading,
    isReadOnly: readOnly,
    description,
    className,
    startContent,
    endContent,
    errorMessage,
    isInvalid: !!errorMessage,
    autoComplete,
  };

  switch (type) {
    case 'textarea':
      return (
        <Textarea
          {...baseProps}
          value={fieldValue || ''}
          onValueChange={handleChange}
          onBlur={handleBlur}
          minRows={3}
          maxRows={6}
        />
      );

    case 'select':
      return (
        <Select
          {...baseProps}
          selectedKeys={fieldValue ? [fieldValue] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0];
            handleChange(selected);
          }}
          onBlur={handleBlur}
        >
          {options.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              isDisabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </Select>
      );

    case 'checkbox':
      return (
        <Checkbox
          isSelected={fieldValue || false}
          onValueChange={handleChange}
          isDisabled={disabled || isLoading}
          className={className}
        >
          {label}
        </Checkbox>
      );

    case 'email':
    case 'tel':
    case 'password':
    case 'number':
    case 'text':
    default:
      return (
        <Input
          {...baseProps}
          type={type}
          value={fieldValue || ''}
          onValueChange={handleChange} 
          onBlur={handleBlur}
        />
      );
  }
};

export default FormField;