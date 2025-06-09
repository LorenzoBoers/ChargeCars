# Complete TypeScript Interfaces for ChargeCars V2

**Last Updated**: 2025-01-18
**Status**: Production Ready
**Target**: TaskMaster Frontend Generator

## 🎯 **Complete API Response Types**

### **Base Types & Utilities**

```typescript
// Base Xano response structure
interface XanoBaseResponse {
  id: string;
  created_at: string;
  updated_at: string;
}

// Paginated list response from Xano
interface XanoListResponse<T> {
  data: T[];
  curPage: number;
  pageTotal: number;
  perPage: number;
  itemsTotal: number;
}

// Error response structure
interface XanoErrorResponse {
  error: {
    message: string;
    code?: string;
    details?: any;
  };
  status: number;
}

// API success response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    current_page: number;
    total_pages: number;
    per_page: number;
    total_items: number;
  };
  filters_applied?: any;
}
```

### **Order Management Types**

```typescript
// Order entity from API
interface OrderResponse extends XanoBaseResponse {
  order_number: string;
  status: OrderStatus;
  order_type: OrderType;
  priority_level: PriorityLevel;
  business_entity_id: string;
  order_owner_id: string;
  
  // Optional fields
  total_amount?: number;
  requested_date?: string;
  planned_completion_date?: string;
  actual_completion_date?: string;
  notes?: string;
  internal_notes?: string;
  
  // Relationships
  business_entity?: BusinessEntity;
  order_owner?: Contact;
  installation_address?: InstallationAddress;
  current_status_info?: CurrentStatusInfo;
  contacts?: OrderContact[];
  quotes?: OrderQuote[];
  
  // Metadata
  metadata?: Record<string, any>;
  deleted: boolean;
  deleted_at?: string;
  deleted_by?: string;
  last_updated_by?: string;
}

// Enums
type OrderStatus = 
  | 'new'
  | 'pending' 
  | 'in_progress'
  | 'on_hold'
  | 'review'
  | 'completed'
  | 'cancelled';

type OrderType = 
  | 'installation'
  | 'service'
  | 'upgrade'
  | 'removal'
  | 'maintenance';

type PriorityLevel = 
  | 'low'
  | 'normal'
  | 'high'
  | 'urgent';

// Current status information
interface CurrentStatusInfo {
  status: OrderStatus;
  status_label: string;
  status_color: string;
  status_since: string;
  sla_deadline?: string;
  is_overdue: boolean;
  workflow_name: string;
  allowed_transitions: OrderStatus[];
  requires_approval?: boolean;
  approval_role?: string;
}

// Installation address
interface InstallationAddress {
  postal_code: string;
  house_number: number;
  house_number_suffix?: string;
  street?: string;
  city?: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  access_instructions?: string;
  parking_instructions?: string;
}

// Order contact relationship
interface OrderContact {
  contact_id: string;
  role: ContactRole;
  is_primary: boolean;
  billing_contact: boolean;
  technical_contact: boolean;
  communication_preference: CommunicationChannel;
  contact?: Contact;
}

type ContactRole = 
  | 'customer'
  | 'technician'
  | 'project_manager'
  | 'sales'
  | 'support';

type CommunicationChannel = 
  | 'email'
  | 'phone'
  | 'sms'
  | 'whatsapp';
```

### **Status & Timeline Types**

```typescript
// Status timeline entry
interface StatusTimelineEntry extends XanoBaseResponse {
  entity_type: 'order';
  entity_id: string;
  current_status: OrderStatus;
  workflow_step_id: string;
  status_since: string;
  sla_deadline?: string;
  is_overdue: boolean;
  is_current: boolean;
  changed_by_contact_id?: string;
  transition_reason?: string;
  metadata?: Record<string, any>;
  
  // Enriched data (from API)
  status_label?: string;
  status_color?: string;
  changed_by?: string;
  workflow_name?: string;
}

// Status change request
interface StatusChangeRequest {
  status: OrderStatus;
  reason?: string;
  notify_contacts?: boolean;
  scheduled_date?: string;
  metadata?: Record<string, any>;
}

// Available transitions response
interface StatusTransitionsResponse {
  current_status: OrderStatus;
  allowed_transitions: OrderStatus[];
  transition_requirements: Record<OrderStatus, TransitionRequirement>;
}

interface TransitionRequirement {
  requires_approval: boolean;
  approval_role?: string;
  required_fields?: string[];
  validation_rules?: ValidationRule[];
}

interface ValidationRule {
  field: string;
  rule: 'required' | 'min_length' | 'max_length' | 'pattern';
  value?: any;
  message: string;
}
```

### **Contact & Business Entity Types**

```typescript
// Contact entity
interface Contact extends XanoBaseResponse {
  email: string;
  display_name: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  mobile?: string;
  role: ContactRole;
  business_entity_permissions: string[];
  is_active: boolean;
  
  // Address information
  address?: ContactAddress;
  
  // Preferences
  communication_preference: CommunicationChannel;
  language: 'nl' | 'en';
  timezone: string;
  
  // Metadata
  last_login?: string;
  avatar_url?: string;
}

interface ContactAddress {
  postal_code?: string;
  house_number?: number;
  street?: string;
  city?: string;
  country?: string;
}

// Business entity
interface BusinessEntity extends XanoBaseResponse {
  name: string;
  code: BusinessEntityCode;
  display_name: string;
  is_active: boolean;
  settings?: BusinessEntitySettings;
}

type BusinessEntityCode = 
  | 'chargecars'
  | 'laderthuis'
  | 'meterkastthuis'
  | 'zaptecshop'
  | 'ratioshop';

interface BusinessEntitySettings {
  order_number_prefix: string;
  default_sla_hours: number;
  color_scheme: string;
  logo_url?: string;
  contact_info: {
    email: string;
    phone: string;
    address: string;
  };
}
```

### **Quote Types**

```typescript
// Quote entity
interface OrderQuote extends XanoBaseResponse {
  quote_number: string;
  order_id: string;
  status: QuoteStatus;
  total_amount: number;
  valid_until: string;
  
  // Line items
  line_items: QuoteLineItem[];
  
  // Terms
  terms_conditions?: string;
  delivery_time?: string;
  warranty_period?: string;
  
  // Relationships
  created_by: string;
  approved_by?: string;
  
  // Metadata
  external_quote_id?: string;
  partner_quote_data?: Record<string, any>;
}

type QuoteStatus = 
  | 'draft'
  | 'sent'
  | 'accepted'
  | 'rejected'
  | 'expired';

interface QuoteLineItem {
  id: string;
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category: 'product' | 'service' | 'installation' | 'other';
  metadata?: Record<string, any>;
}
```

### **Filter & Search Types**

```typescript
// Order filters for API requests
interface OrderFilters {
  // Pagination
  page?: number;
  per_page?: number;
  
  // Single value filters
  status?: OrderStatus;
  order_type?: OrderType;
  priority?: PriorityLevel;
  owner_id?: string;
  business_entity_id?: string;
  
  // Multi-value filters (will be converted to comma-separated strings)
  status_in?: OrderStatus[];
  order_type_in?: OrderType[];
  priority_in?: PriorityLevel[];
  
  // Date range filters (ISO 8601 strings)
  created_from?: string;
  created_to?: string;
  requested_date_from?: string;
  requested_date_to?: string;
  planned_completion_from?: string;
  planned_completion_to?: string;
  
  // Text search
  search?: string;
  order_number_like?: string;
  notes_contains?: string;
  
  // Boolean filters
  overdue?: boolean;
  has_quotes?: boolean;
  include_deleted?: boolean;
  
  // Numeric filters
  min_total_amount?: number;
  max_total_amount?: number;
  
  // Sorting
  sort?: OrderSortField;
  order?: SortDirection;
}

type OrderSortField = 
  | 'created_at'
  | 'updated_at'
  | 'order_number'
  | 'status'
  | 'priority'
  | 'requested_date'
  | 'planned_completion';

type SortDirection = 'asc' | 'desc';

// Search response with facets
interface OrderSearchResponse {
  orders: OrderResponse[];
  facets: SearchFacets;
  total_count: number;
  search_time_ms: number;
}

interface SearchFacets {
  status: FacetCount[];
  order_type: FacetCount[];
  priority: FacetCount[];
  business_entity: FacetCount[];
}

interface FacetCount {
  value: string;
  count: number;
  label: string;
}
```

### **Dashboard & Analytics Types**

```typescript
// Dashboard statistics
interface DashboardStats {
  summary: {
    total_orders: number;
    overdue_orders: number;
    overdue_percentage: number;
    recent_orders_count: number;
  };
  status_distribution: Record<OrderStatus, number>;
  type_distribution: Record<OrderType, number>;
  priority_distribution: Record<PriorityLevel, number>;
  recent_orders: OrderResponse[];
  time_range_days: number;
}

// KPI metrics
interface KPIMetrics {
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  start_date: string;
  end_date: string;
  metrics: {
    orders_created: number;
    orders_completed: number;
    completion_rate: number;
    avg_completion_time_hours: number;
    sla_compliance_rate: number;
    revenue_total: number;
    revenue_average: number;
  };
  trends: {
    orders_trend: TrendPoint[];
    revenue_trend: TrendPoint[];
    sla_trend: TrendPoint[];
  };
}

interface TrendPoint {
  date: string;
  value: number;
}
```

### **Form & Validation Types**

```typescript
// Create order form data
interface CreateOrderForm {
  // Basic info
  order_type: OrderType;
  business_entity_id: string;
  priority_level: PriorityLevel;
  
  // Customer info
  customer_organization_id?: string;
  primary_contact_id: string;
  
  // Installation details
  installation_address: Partial<InstallationAddress>;
  requested_date?: string;
  planned_completion_date?: string;
  
  // Additional info
  notes?: string;
  internal_notes?: string;
  
  // Line items (if creating with quote)
  line_items?: Partial<QuoteLineItem>[];
}

// Update order form data
interface UpdateOrderForm {
  priority_level?: PriorityLevel;
  requested_date?: string;
  planned_completion_date?: string;
  notes?: string;
  internal_notes?: string;
  installation_address?: Partial<InstallationAddress>;
}

// Form validation errors
interface FormValidationErrors {
  [field: string]: string | string[];
}

// Field validation rules
interface FieldValidation {
  required?: boolean;
  min_length?: number;
  max_length?: number;
  pattern?: RegExp;
  custom_validator?: (value: any) => string | null;
}
```

### **Authentication Types**

```typescript
// Xano authentication response
interface XanoAuthResponse {
  authToken: string;
  refreshToken?: string;
  user: AuthenticatedUser;
}

// Authenticated user
interface AuthenticatedUser {
  id: string;
  email: string;
  display_name: string;
  role: ContactRole;
  business_entity_permissions: string[];
  is_active: boolean;
  last_login?: string;
  preferences?: UserPreferences;
}

interface UserPreferences {
  language: 'nl' | 'en';
  timezone: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationPreferences;
}

interface NotificationPreferences {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  order_status_changes: boolean;
  sla_warnings: boolean;
  new_quotes: boolean;
}

// Login request
interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

// Auth state
interface AuthState {
  user: AuthenticatedUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

## 🔧 **Type Guards & Utilities**

```typescript
// Type guards
export const isOrderResponse = (obj: any): obj is OrderResponse => {
  return obj && typeof obj.id === 'string' && typeof obj.order_number === 'string';
};

export const isXanoListResponse = <T>(obj: any): obj is XanoListResponse<T> => {
  return obj && Array.isArray(obj.data) && typeof obj.curPage === 'number';
};

// Utility types
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

// API endpoint types
export type ApiEndpoint = 
  | '/db/order'
  | '/db/contact'
  | '/db/quote'
  | '/auth/login'
  | '/auth/refresh';

// Export all types for use in components
export type {
  XanoBaseResponse,
  XanoListResponse,
  XanoErrorResponse,
  ApiResponse,
  OrderResponse,
  OrderStatus,
  OrderType,
  PriorityLevel,
  CurrentStatusInfo,
  InstallationAddress,
  OrderContact,
  StatusTimelineEntry,
  StatusChangeRequest,
  Contact,
  BusinessEntity,
  OrderQuote,
  OrderFilters,
  DashboardStats,
  CreateOrderForm,
  UpdateOrderForm,
  XanoAuthResponse,
  AuthenticatedUser,
  AuthState,
};
``` 