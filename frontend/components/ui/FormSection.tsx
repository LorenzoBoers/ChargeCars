import React, { useState } from 'react';
import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

export interface FormSectionProps {
  /**
   * Section title
   */
  title: string;
  
  /**
   * Section content
   */
  children: React.ReactNode;
  
  /**
   * Whether section is collapsible
   */
  collapsible?: boolean;
  
  /**
   * Default expanded state (for collapsible sections)
   */
  defaultExpanded?: boolean;
  
  /**
   * Whether section is required (shows red asterisk)
   */
  required?: boolean;
  
  /**
   * Section description/subtitle
   */
  description?: string;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Custom header content (replaces title/description)
   */
  headerContent?: React.ReactNode;
  
  /**
   * Section variant
   */
  variant?: 'default' | 'bordered' | 'flat';
}

/**
 * FormSection - Collapsible section for organizing form fields
 * 
 * Provides structured organization of form fields with:
 * - Collapsible/expandable sections
 * - Clear section titles and descriptions
 * - Visual hierarchy
 * - Required field indicators
 * 
 * @example
 * ```tsx
 * <FormSection
 *   title="Customer Information"
 *   description="Basic customer details"
 *   collapsible
 *   defaultExpanded
 *   required
 * >
 *   <FormField name="email" label="Email" />
 *   <FormField name="name" label="Name" />
 * </FormSection>
 * ```
 */
export const FormSection: React.FC<FormSectionProps> = ({
  title,
  children,
  collapsible = false,
  defaultExpanded = true,
  required = false,
  description,
  className = '',
  headerContent,
  variant = 'default',
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  const headerClick = collapsible ? toggleExpanded : undefined;

  const cardVariant = variant === 'default' ? 'bordered' : variant;

  return (
    <Card 
      className={`${className}`}
      shadow="none"
      radius="lg"
    >
      <CardHeader 
        className={`pb-2 ${collapsible ? 'cursor-pointer hover:bg-default-50' : ''}`}
        onClick={headerClick}
      >
        <div className="flex-1">
          {headerContent || (
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-foreground">
                  {title}
                  {required && <span className="text-danger ml-1">*</span>}
                </h3>
                {collapsible && (
                  <div className="ml-auto">
                    {isExpanded ? (
                      <ChevronUpIcon className="h-5 w-5 text-default-400" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-default-400" />
                    )}
                  </div>
                )}
              </div>
              {description && (
                <p className="text-sm text-default-500 mt-1">
                  {description}
                </p>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      {(!collapsible || isExpanded) && (
        <CardBody className="pt-0 space-y-4">
          {children}
        </CardBody>
      )}
    </Card>
  );
};

export default FormSection;