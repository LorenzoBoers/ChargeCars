/**
 * @fileoverview Shared Types
 * 
 * Deze module bevat alle gedeelde TypeScript types die in de hele applicatie
 * worden gebruikt. Door types te centraliseren in één bestand, voorkomen we
 * duplicatie en inconsistenties.
 * 
 * @author ChargeCars Development Team
 * @version 1.0.0
 */

/**
 * API Response type voor alle API calls
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: PaginationInfo;
  error?: ApiError;
}

/**
 * API Error type
 */
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

/**
 * Pagination informatie voor lijst responses
 */
export interface PaginationInfo {
  current_page: number;
  total_pages: number;
  per_page: number;
  total_items: number;
  has_more_items: boolean;
}

/**
 * Xano API response format voor lijsten
 */
export interface XanoListResponse<T> {
  page: number;
  per_page: number;
  offset: number;
  has_more_items: boolean;
  found_count: number;
  items: T[];
}

/**
 * Order response type
 */
export interface OrderResponse {
  id: number | string;
  order_number?: string;
  customer_name?: string;
  customer_first_name?: string;
  customer_last_name?: string;
  business_entity?: string;
  account?: string;
  partner_name?: string;
  order_type?: string;
  status?: string;
  status_label?: string;
  status_name?: string;
  status_color?: string;
  status_since?: number;
  amount?: number;
  created_at: number;
  updated_at?: number;
  installation_date?: string;
  customer?: {
    id: number | string;
    name?: string;
    email?: string;
    phone?: string;
  };
}

/**
 * Order filters type
 */
export interface OrderFilters {
  search?: string;
  business_entity?: string;
  order_type?: string;
  status?: string;
  priority?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

/**
 * Dashboard statistics type
 */
export interface DashboardStats {
  total_revenue: number;
  active_orders: number;
  completed_orders: number;
  pending_orders: number;
  revenue_change?: number;
  orders_change?: number;
}

/**
 * Login response type
 */
export interface LoginResponse {
  auth_token: string;
  refresh_token?: string;
  auth_token_exp?: number;
  refresh_token_exp?: number;
  user: UserProfile;
}

/**
 * User profile type
 */
export interface UserProfile {
  id: string;
  created_at: number;
  contact_id: string;
  role_id: string;
  email_verified: boolean;
  last_login: number | null;
  account_locked_until: number | null;
  is_active: boolean;
  
  // Contact information
  email: string;
  first_name: string;
  last_name: string;
  display_name?: string;
  organization_id?: string;
  organization_name?: string;
  profile_picture?: string;
  phone?: string;
  job_title?: string;
  department?: string;
  
  // Additional fields
  permissions?: string[];
  scopes?: string;
}

/**
 * Customer response type
 */
export interface CustomerResponse {
  id: string;
  contact_type: 'person' | 'organization';
  contact_subtype: 'customer' | 'partner';
  first_name?: string;
  last_name?: string;
  organization_name?: string;
  email?: string;
  phone?: string;
  display_name?: string;
  parent_organization_id?: string;
  parent_organization_name?: string;
  is_primary?: boolean;
  is_billing_contact?: boolean;
  is_technical_contact?: boolean;
  job_title?: string;
  department?: string;
  whatsapp?: string;
  preferred_communication?: 'email' | 'phone' | 'whatsapp' | 'portal';
  is_active?: boolean;
  created_at?: number;
  updated_at?: number;
  
  // Organization specific fields
  vat_number?: string;
  kvk_number?: string;
  iban?: string;
  
  // Aggregated metrics
  total_orders?: number;
  total_revenue?: number;
  last_order_date?: number;
  status?: 'active' | 'inactive' | 'prospect';
}

/**
 * Customer filters type
 */
export interface CustomerFilters {
  search?: string;
  contact_type?: 'person' | 'organization';
  contact_subtype?: 'customer' | 'partner';
  status?: string;
  communication_preference?: string;
  parent_organization?: string;
  page?: number;
  per_page?: number;
}

/**
 * Customer metrics type
 */
export interface CustomerMetrics {
  total_customers: number;
  total_organizations: number;
  total_partners: number;
  active_customers: number;
  new_this_month: number;
  revenue_this_month: number;
  customers_change: number;
  revenue_change: number;
}

/**
 * Button variant type voor consistente styling
 */
export type ButtonVariant = 'solid' | 'bordered' | 'light' | 'flat' | 'faded' | 'shadow' | 'ghost';

/**
 * Button size type voor consistente styling
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Business Entity response type
 */
export interface BusinessEntity {
  id: string;
  name: string;
  legal_name?: string;
  is_active: boolean;
  created_at: number;
  updated_at?: number;
}

/**
 * Contact response type for simplified contact data
 */
export interface ContactResponse {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  contact_type: 'person' | 'organization';
  organization_name?: string;
  is_active: boolean;
}

/**
 * Order creation form data
 */
export interface OrderFormData {
  // Order details
  order_number?: string;
  order_type: string;
  business_entity_contact_id: string;
  account_contact_id?: string;
  priority_level?: string;
  notes?: string;
  
  // Customer data for inline creation
  customer: CustomerFormData;
  
  // Partner metadata
  partner_metadata?: string;
}

/**
 * Customer creation form data
 */
export interface CustomerFormData {
  // Email first (always visible)
  email: string;
  
  // Basic information (shown after email check)
  company_name?: string;
  legal_name?: string;
  vat_number?: string;
  chamber_of_commerce?: string;
  first_name?: string;
  last_name?: string;
  
  // Phone
  phone_number?: {
    number: string;
  };
  
  // Organization address
  organization_address: AddressFormData;
  
  // Delivery address
  delivery_address: AddressFormData;
  
  // Additional fields
  billing_info?: {
    billing_account_name?: string;
    iban?: string;
  };
}

/**
 * Address form data
 */
export interface AddressFormData {
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

/**
 * Customer lookup response
 */
export interface CustomerLookupResponse {
  found: boolean;
  customer?: CustomerResponse;
  message?: string;
}

/**
 * Order creation response
 */
export interface OrderCreationResponse {
  order: OrderResponse;
  customer?: CustomerResponse;
  message: string;
}

/**
 * Form validation state
 */
export interface FormValidationState {
  isValid: boolean;
  errors: { [fieldName: string]: string };
  touched: { [fieldName: string]: boolean };
}

export * from './ui'; 