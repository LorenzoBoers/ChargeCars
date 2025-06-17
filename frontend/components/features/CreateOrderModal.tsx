import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { FormModal, ValidationRule } from '../ui/FormModal';
import { FormSection } from '../ui/FormSection';
import { FormField } from '../ui/FormField';
import { CustomerSection } from './CustomerSection';
import { apiClient } from '../../lib/api';
import { 
  OrderFormData, 
  CustomerFormData, 
  AddressFormData,
  BusinessEntity,
  OrderCreationResponse 
} from '../../types';

export interface CreateOrderModalProps {
  /**
   * Whether the modal is open
   */
  isOpen: boolean;
  
  /**
   * Function to call when modal should close
   */
  onClose: () => void;
  
  /**
   * Function to call when order is successfully created
   */
  onOrderCreated?: (order: any) => void;
  
  /**
   * Function to refresh orders list
   */
  onRefreshOrders?: () => void;
}

// Default form data
const createDefaultFormData = (): OrderFormData => ({
  order_type: '',
  business_entity_contact_id: '',
  account_contact_id: undefined,
  priority_level: 'medium',
  notes: '',
  partner_metadata: '{}',
  customer: {
    email: '',
    organization_address: {
      street_name: '',
      house_number: '',
      postal_code: '',
      city: '',
      province: '',
    },
    delivery_address: {
      street_name: '',
      house_number: '',
      postal_code: '',
      city: '',
      province: '',
    },
  },
});

// Validation rules for the form
const validationRules: { [key: string]: ValidationRule } = {
  order_type: { required: true },
  business_entity_contact_id: { required: true },
  'customer.email': { required: true, email: true },
  'customer.company_name': { required: true, minLength: 2 },
  'customer.legal_name': { required: true, minLength: 2 },
  'customer.first_name': { required: true, minLength: 2 },
  'customer.last_name': { required: true, minLength: 2 },
  'customer.phone_number.number': { required: true, phone: true },
  'customer.vat_number': { vatNumber: true },
  'customer.chamber_of_commerce': { kvkNumber: true },
  'customer.organization_address.street_name': { required: true },
  'customer.organization_address.house_number': { required: true },
  'customer.organization_address.postal_code': { required: true, postalCode: true },
  'customer.organization_address.city': { required: true },
  'customer.organization_address.province': { required: true },
  'customer.delivery_address.street_name': { required: true },
  'customer.delivery_address.house_number': { required: true },
  'customer.delivery_address.postal_code': { required: true, postalCode: true },
  'customer.delivery_address.city': { required: true },
  'customer.delivery_address.province': { required: true },
  'customer.billing_info.iban': { iban: true },
};

/**
 * CreateOrderModal - Main order creation modal
 * 
 * Implements the complete order creation flow with:
 * - Order details configuration
 * - Business entity selection
 * - Email-first customer creation
 * - Address autocomplete
 * - Comprehensive validation
 * - Save & Close / Save & Open actions
 * 
 * @example
 * ```tsx
 * <CreateOrderModal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   onOrderCreated={handleOrderCreated}
 *   onRefreshOrders={refreshOrders}
 * />
 * ```
 */
export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  isOpen,
  onClose,
  onOrderCreated,
  onRefreshOrders,
}) => {
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState<OrderFormData>(createDefaultFormData());
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Business entities data
  const [businessEntities, setBusinessEntities] = useState<BusinessEntity[]>([]);
  const [loadingBusinessEntities, setLoadingBusinessEntities] = useState(false);

  // Load business entities on mount
  useEffect(() => {
    if (isOpen) {
      loadBusinessEntities();
    }
  }, [isOpen]);

  // Track unsaved changes
  useEffect(() => {
    const defaultData = createDefaultFormData();
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(defaultData);
    setHasUnsavedChanges(hasChanges);
  }, [formData]);

  // Load business entities
  const loadBusinessEntities = async () => {
    setLoadingBusinessEntities(true);
    try {
      const response = await apiClient.getBusinessEntities();
      if (response.success) {
        setBusinessEntities(response.data);
        
        // Auto-select if only one business entity
        if (response.data.length === 1) {
          setFormData(prev => ({
            ...prev,
            business_entity_contact_id: response.data[0].id,
          }));
        }
      } else {
        toast.error('Kon bedrijfsentiteiten niet laden');
      }
    } catch (error) {
      console.error('Error loading business entities:', error);
      toast.error('Fout bij laden van bedrijfsentiteiten');
    } finally {
      setLoadingBusinessEntities(false);
    }
  };

  // Handle form data changes
  const handleFormDataChange = useCallback((newData: OrderFormData) => {
    setFormData(newData);
  }, []);

  // Handle customer data changes
  const handleCustomerDataChange = useCallback((customerData: CustomerFormData) => {
    setFormData(prev => ({
      ...prev,
      customer: customerData,
    }));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (data: OrderFormData, action?: string) => {
    setIsLoading(true);
    
    try {
      // Transform form data to API format
      const apiData = {
        order_number: data.order_number || undefined,
        order_type: data.order_type,
        business_entity_contact_id: data.business_entity_contact_id,
        account_contact_id: data.account_contact_id,
        priority_level: data.priority_level,
        notes: data.notes,
        partner_metadata: data.partner_metadata,
        
        // Customer data
        end_customer: {
          email: data.customer.email,
          company_name: data.customer.company_name,
          legal_name: data.customer.legal_name,
          vat_number: data.customer.vat_number,
          chamber_of_commerce: data.customer.chamber_of_commerce,
          first_name: data.customer.first_name,
          last_name: data.customer.last_name,
          phone_number: data.customer.phone_number,
          organization_address: data.customer.organization_address,
          delivery_address: data.customer.delivery_address,
          billing_info: data.customer.billing_info,
        },
      };

      const response = await apiClient.createOrderWithCustomer(apiData);
      
      if (response.success) {
        const orderResponse = response.data as OrderCreationResponse;
        
        // Show success message
        toast.success(`Order ${orderResponse.order.order_number || orderResponse.order.id} succesvol aangemaakt`);
        
        // Call success callbacks
        if (onOrderCreated) {
          onOrderCreated(orderResponse.order);
        }
        
        if (onRefreshOrders) {
          onRefreshOrders();
        }
        
        // Handle different actions
        if (action === 'save-and-open') {
          // Navigate to order detail page
          router.push(`/orders/${orderResponse.order.id}`);
        }
        
        // Close modal
        onClose();
        
        // Reset form
        setFormData(createDefaultFormData());
        setHasUnsavedChanges(false);
        
      } else {
        // Handle API errors
        const errorMessage = response.error?.message || 'Er is een fout opgetreden bij het aanmaken van de order';
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error('Er is een onverwachte fout opgetreden');
    } finally {
      setIsLoading(false);
    }
  }, [onOrderCreated, onRefreshOrders, onClose, router]);

  // Handle modal close
  const handleClose = useCallback(() => {
    // Reset form data when closing
    setFormData(createDefaultFormData());
    setHasUnsavedChanges(false);
    onClose();
  }, [onClose]);

  // Form actions
  const formActions = [
    {
      type: 'cancel' as const,
      label: 'Annuleren',
      variant: 'bordered' as const,
      color: 'default' as const,
    },
    {
      type: 'submit' as const,
      label: 'Opslaan & Sluiten',
      variant: 'solid' as const,
      color: 'secondary' as const,
      action: 'save-and-close',
    },
    {
      type: 'submit' as const,
      label: 'Opslaan & Openen',
      variant: 'solid' as const,
      color: 'primary' as const,
      action: 'save-and-open',
    },
  ];

  // Business entity options
  const businessEntityOptions = businessEntities.map(entity => ({
    value: entity.id,
    label: entity.name,
    disabled: !entity.is_active,
  }));

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nieuwe Order Aanmaken"
      size="3xl"
      formData={formData}
      onFormDataChange={handleFormDataChange}
      validationRules={validationRules}
      onSubmit={handleSubmit}
      actions={formActions}
      hasUnsavedChanges={hasUnsavedChanges}
      isLoading={isLoading}
    >
      <div className="space-y-6">
        {/* Order Details Section */}
        <FormSection
          title="Order Details"
          description="Basis informatie voor de nieuwe order"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              name="order_number"
              label="Order Nummer"
              placeholder="Laat leeg voor automatische generatie"
              value={formData.order_number}
              onChange={(value) => setFormData(prev => ({ ...prev, order_number: value }))}
              disabled={isLoading}
            />
            
            <FormField
              name="order_type"
              type="select"
              label="Order Type"
              placeholder="Selecteer order type"
              required
              options={[
                { value: 'installation', label: 'Installatie' },
                { value: 'maintenance', label: 'Onderhoud' },
                { value: 'webshop', label: 'Webshop' },
              ]}
              value={formData.order_type}
              onChange={(value) => setFormData(prev => ({ ...prev, order_type: value }))}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              name="business_entity_contact_id"
              type="select"
              label="Bedrijfsentiteit"
              placeholder={loadingBusinessEntities ? "Laden..." : "Selecteer bedrijfsentiteit"}
              required
              options={businessEntityOptions}
              value={formData.business_entity_contact_id}
              onChange={(value) => setFormData(prev => ({ ...prev, business_entity_contact_id: value }))}
              disabled={isLoading || loadingBusinessEntities}
            />
            
            <FormField
              name="priority_level"
              type="select"
              label="Prioriteit"
              placeholder="Selecteer prioriteit"
              options={[
                { value: 'low', label: 'Laag' },
                { value: 'medium', label: 'Normaal' },
                { value: 'high', label: 'Hoog' },
                { value: 'urgent', label: 'Urgent' },
              ]}
              value={formData.priority_level}
              onChange={(value) => setFormData(prev => ({ ...prev, priority_level: value }))}
              disabled={isLoading}
            />
          </div>

          <FormField
            name="notes"
            type="textarea"
            label="Opmerkingen"
            placeholder="Aanvullende informatie over de order..."
            value={formData.notes}
            onChange={(value) => setFormData(prev => ({ ...prev, notes: value }))}
            disabled={isLoading}
          />
        </FormSection>

        {/* Customer Section */}
        <CustomerSection
          customerData={formData.customer}
          onCustomerDataChange={handleCustomerDataChange}
          isLoading={isLoading}
        />
      </div>
    </FormModal>
  );
};

export default CreateOrderModal;