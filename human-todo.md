# Human TODO - Backend Requirements

*Central communication hub voor frontend → backend ontwikkeling*  
*Laatste update: 2024-12-19*

---

## 📍 In Progress
[None - klaar voor nieuwe features]

---

## 🔥 High Priority

### Backend Required: Customer Management API

**Component**: `frontend/pages/customers.tsx`  
**Required Endpoints**: 
- `GET /api/customers` - Get filtered customers list
- `GET /api/customers/{id}` - Get customer by ID
- `POST /api/customers` - Create new customer
- `PUT /api/customers/{id}` - Update customer
- `DELETE /api/customers/{id}` - Delete customer
- `GET /api/customers/metrics` - Get customer dashboard metrics

**Request Schemas**:
```typescript
// Get Customers (GET /api/customers)
{
  search?: string;
  contact_type?: 'person' | 'organization';
  contact_subtype?: 'customer' | 'partner';
  status?: 'active' | 'inactive' | 'prospect';
  communication_preference?: 'email' | 'phone' | 'whatsapp' | 'portal';
  parent_organization?: string;
  page?: number;
  per_page?: number;
}

// Create/Update Customer
{
  contact_type: 'person' | 'organization';
  contact_subtype: 'customer' | 'partner';
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  display_name?: string;
  parent_organization_id?: string;
  job_title?: string;
  department?: string;
  whatsapp?: string;
  preferred_communication?: 'email' | 'phone' | 'whatsapp' | 'portal';
  vat_number?: string;
  kvk_number?: string;
  iban?: string;
  status?: 'active' | 'inactive' | 'prospect';
}
```

**Response Schemas**:
```typescript
// Customer Response
{
  id: string;
  contact_type: 'person' | 'organization';
  contact_subtype: 'customer' | 'partner';
  first_name?: string;
  last_name?: string;
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
  vat_number?: string;
  kvk_number?: string;
  iban?: string;
  total_orders?: number;
  total_revenue?: number;
  last_order_date?: number;
  status?: 'active' | 'inactive' | 'prospect';
}

// Customer Metrics Response
{
  total_customers: number;
  total_organizations: number;
  total_partners: number;
  active_customers: number;
  new_this_month: number;
  revenue_this_month: number;
  customers_change: number; // percentage
  revenue_change: number; // percentage
}

// List Response
{
  success: boolean;
  data: {
    items: CustomerResponse[];
    page: number;
    per_page: number;
    found_count: number;
    has_more_items: boolean;
  };
  error?: string;
}
```

**Business Logic**: 
- Unified contact model (persons AND organizations in one table)
- Hierarchical organization structure (parent_organization_id)
- Contact subtypes for customer vs partner distinction
- Aggregated metrics (total orders, revenue from related orders)
- Status management with lifecycle tracking
- Communication preference management
- Business data for organizations (VAT, KvK, IBAN)
- Search across names, emails, organizations
- Filter combinations for tab-based organization

**UI Context**:
- Tabbed interface: All Customers, Organizations, End Customers, Partners
- Advanced search and filtering system
- Dashboard metrics cards
- CRUD operations with inline editing
- Customer hierarchy display
- Status and communication preference management

**Database Schema Reference**: 
Based on `contact` table (contact-centric architecture) with contact_type and contact_subtype fields

**Priority**: HIGH  
**Added**: 2025-01-09  
**Estimated Effort**: Large

### Backend Required: Quote Builder Line Items Management

**Component**: `frontend/pages/quotes/[id].tsx`  
**Required Endpoints**: 
- `POST /api/quotes/{id}/line-items` - Add new line item
- `PUT /api/quotes/{id}/line-items/{item_id}` - Update line item
- `DELETE /api/quotes/{id}/line-items/{item_id}` - Remove line item
- `POST /api/quotes/{id}/visits` - Add new visit
- `POST /api/quotes/{id}/contacts` - Add new contact

**Request Schemas**:
```typescript
// Add Line Item
{
  visit_id: string;
  contact_id: string;
  article_code: string;
  description: string;
  quantity: number;
  unit_price: number;
  category: string;
}

// Add Visit
{
  name: string;
  sequence: number;
}

// Add Contact
{
  name: string;
  email: string;
  phone: string;
  role: 'account' | 'end_customer';
}
```

**Response Schema**:
```typescript
{
  success: boolean;
  data: {
    line_item?: QuoteLineItem;
    visit?: Visit;
    contact?: Contact;
    updated_totals?: {
      customer_amount: number;
      partner_amount: number;
    };
  };
  error?: string;
}
```

**Business Logic**: 
- Line items grouped by visit and contact
- Automatic calculation of totals per contact and overall
- Visit sequence management for ordering
- Contact role-based pricing calculations
- Article lookup from product catalog
- Inline editing with real-time updates

**UI Context**:
- Drag & drop line item management
- Inline editing of quantities and prices
- Visit-based organization structure
- Contact grouping with role-based totals
- Modal dialogs for adding visits/contacts

**Priority**: HIGH  
**Added**: 2025-01-09  
**Estimated Effort**: Large

### Backend Required: Quote Article Search & Catalog

**Component**: `frontend/pages/quotes/[id].tsx`  
**Required Endpoint**: `GET /api/articles/search`  

**Request Schema**:
```typescript
{
  query: string;
  category?: string;
  limit?: number;
}
```

**Response Schema**:
```typescript
{
  success: boolean;
  data: {
    articles: Article[];
  };
  error?: string;
}

interface Article {
  id: string;
  code: string;
  name: string;
  description: string;
  unit_price: number;
  category: string;
  unit: string;
}
```

**Business Logic**: 
- Fuzzy search across article names and codes
- Category-based filtering
- Price lookup from current catalog
- Fast autocomplete response times
- Support for custom articles/descriptions

**UI Context**:
- Real-time search autocomplete
- Article selection dropdown
- Price auto-population
- Category icon display

**Priority**: HIGH  
**Added**: 2025-01-09  
**Estimated Effort**: Medium

### Backend Required: Dashboard Statistics API

**Component**: `frontend/pages/orders.tsx`  
**Required Endpoint**: `GET /api/dashboard/stats`  

**Request Schema**:
```typescript
{
  period?: 'today' | 'week' | 'month' | 'quarter';
  business_entity?: string;
}
```

**Response Schema**:
```typescript
{
  success: boolean;
  data: {
    total_revenue: number;
    active_orders: number;
    completed_orders: number;
    pending_orders: number;
    revenue_change: number; // percentage change
    orders_change: number; // percentage change
  };
  error?: string;
}
```

**Business Logic**: 
- Calculate revenue totals and order counts
- Compare with previous period for change percentages
- Filter by business entity when specified
- Real-time calculations preferred

**UI Context**:
- Dashboard cards showing key metrics
- Change indicators with color coding
- Period-based filtering

**Priority**: HIGH  
**Added**: 2025-01-09  
**Estimated Effort**: Medium

### Backend Required: Multichannel Inbox API

**Component**: `frontend/pages/inbox.tsx`  
**Required Endpoints**: 
- `GET /api/inbox/conversations` - Get filtered conversations
- `GET /api/inbox/messages/{conversation_id}` - Get conversation messages  
- `POST /api/inbox/messages/{conversation_id}` - Send message
- `PUT /api/inbox/conversations/{conversation_id}/assign` - Assign conversation
- `GET /api/inbox/entities/counts` - Get channel counts per entity

**Request Schemas**:
```typescript
// Get Conversations
{
  entity_id?: string;
  channel?: 'email' | 'whatsapp' | 'phone' | 'livechat' | 'support_ticket' | 'sales_ticket';
  status?: 'new' | 'open' | 'pending' | 'resolved';
  assigned_to?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

// Send Message
{
  content: string;
  is_internal: boolean;
  attachments?: string[];
  message_type?: 'text' | 'template' | 'system';
}

// Assign Conversation  
{
  assigned_to: string;
  department?: string;
}
```

**Response Schema**:
```typescript
{
  success: boolean;
  data: {
    conversations?: Conversation[];
    messages?: Message[];
    entity_counts?: EntityChannelCounts[];
    total?: number;
    page?: number;
    per_page?: number;
  };
  error?: string;
}

interface Conversation {
  id: string;
  subject: string;
  customer: ContactInfo;
  channel: ChannelType;
  status: ConversationStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  last_message: string;
  last_message_time: string;
  unread_count: number;
  assigned_to?: string;
  sla_deadline?: string;
  business_entity_id: string;
  order_id?: string;
}
```

**Business Logic**: 
- Real-time message routing per business entity
- SLA deadline calculations and monitoring
- Automatic channel detection and categorization  
- Cross-entity conversation assignment
- Notification triggers for urgent messages
- Template management for standard responses

**UI Context**:
- 4-column layout: folders → conversations → chat → contact info
- Real-time updates via WebSocket for new messages
- Entity switching with context preservation
- Channel filtering with badge counts
- Contact/order integration for context

**Priority**: HIGH  
**Added**: 2025-01-09  
**Estimated Effort**: Large

---

## 🟡 Medium Priority

*Geen items - alle basis componenten zijn gereed*

---

## 🟢 Low Priority

*Geen items - clean slate voor ontwikkeling*

---

## ✅ Completed

### 2025-01-09 - Orders Display Enhancement
- **Components**: `frontend/pages/orders.tsx`, `frontend/lib/api.ts`
- **Status**: ✅ Completed - Enhanced Status Display & Layout
- **Details**: 
  - **Status Fields**: Added support for status_name, status_label, and status_since from API response
  - **Enhanced Status Display**: Status chip shows status_label with relative time (e.g., "2 dagen geleden")
  - **Business Entity Layout**: Moved business entity as small text under customer name
  - **Partner Column**: Added dedicated partner column replacing business entity column
  - **Relative Time**: Smart relative time formatting (Vandaag, Gisteren, X dagen geleden)
  - **Status Colors**: Extended color mapping for both Dutch and English status labels
  - **Improved UX**: Better visual hierarchy with customer name + business entity grouped

### 2025-01-09 - Token Management System Documentation
- **Components**: `frontend/lib/api.ts`, `frontend/contexts/AuthContext.tsx`, `frontend/hooks/useOrders.ts`, `documentation/frontend/token-management.md`
- **Status**: ✅ Completed - Comprehensive Documentation Added
- **Details**: 
  - **API Client Documentation**: Added full JSDoc documentation with examples for all methods
  - **AuthContext Documentation**: Documented interfaces, methods, and authentication flow
  - **useOrders Hook Documentation**: Complete hook documentation with usage examples
  - **System Documentation**: Created comprehensive `token-management.md` covering architecture, security, troubleshooting
  - **Code Examples**: Added real-world usage examples throughout codebase
  - **Error Handling**: Documented debug logging system and error recovery strategies
  - **Security Notes**: Documented hybrid storage, CSRF protection, and token validation
  - **Performance Considerations**: Documented caching, debouncing, and optimization strategies

### 2025-01-09 - API Client Token Management Fix
- **Components**: `frontend/lib/api.ts`, `frontend/contexts/AuthContext.tsx`, `frontend/hooks/useOrders.ts`
- **Status**: ✅ Completed - Token Automatically Applied to API Requests
- **Details**: 
  - **Auto Token Init**: API client automatically loads token from storage on startup
  - **Token Validation**: Expired tokens are automatically cleared
  - **Startup Token Set**: AuthContext ensures API client has token on app load
  - **Debug Logging**: Added extensive logging to track token usage in requests
  - **Token Preview**: Console shows token preview for verification
  - **Order Requests**: Orders page now properly includes auth token in all requests

### 2025-01-09 - Enhanced Token Storage with Cookies
- **Component**: `frontend/lib/auth.ts`
- **Status**: ✅ Completed - Hybrid Storage Implementation
- **Details**: 
  - **Dual Storage**: Tokens now stored in both localStorage AND cookies
  - **Security Improved**: Cookies with Secure, SameSite=Strict flags
  - **Fallback Support**: localStorage first, cookies as backup
  - **Auto Expiry**: Cookies automatically expire (7 days auth, 30 days refresh)
  - **Full Cleanup**: Both storage methods cleared on logout
  - **HTTPS Support**: Secure flag automatically added on HTTPS

### 2025-01-09 - Login Redirect & User State Fixes
- **Components**: `frontend/contexts/AuthContext.tsx`, `frontend/components/auth/LoginPage.tsx`, `frontend/lib/api.ts`
- **Status**: ✅ Completed - Enhanced Redirect Logic
- **Details**: 
  - **Improved User Object Creation**: Proper mapping of API response to User interface
  - **Enhanced Redirect Logic**: Multiple redirect attempts with timeouts to ensure navigation
  - **Token Expiry Handling**: Proper token expiry management (24h default)
  - **Backup Redirect**: LoginPage component has additional redirect as backup
  - **Delayed State Update**: Small delay to ensure state updates before redirect
  - **Console Debugging**: Comprehensive logging for troubleshooting
  - **API Response Handling**: Better error handling and data processing

### 2025-01-09 - Login Redirect & Routing Fixes
- **Components**: `frontend/pages/index.tsx`, `frontend/contexts/AuthContext.tsx`, `frontend/components/auth/LoginPage.tsx`
- **Configuration**: `frontend/next.config.js`, `frontend/public/.htaccess`, `frontend/package.json`
- **Status**: ✅ Completed - Production Ready
- **Details**: 
  - **Login Redirect**: Fixed automatic redirect to dashboard after successful login
  - **Index Page**: Added automatic redirect for authenticated users
  - **Routing**: Fixed 404 issues by configuring proper SPA routing for Hostinger
  - **Next.js Config**: Updated for conditional static export based on environment
  - **Apache Config**: Added .htaccess for proper routing on shared hosting
  - **Removed Duplicate Redirects**: Centralized redirect logic in AuthContext

### 2025-01-09 - Order Management Xano API Integration
- **Component**: `frontend/pages/orders.tsx`, `frontend/hooks/useOrders.ts`, `frontend/lib/api.ts`
- **Backend Work**: Full integration with Xano API `https://api.chargecars.nl/api:V2/order`
- **Status**: ✅ Completed - Production Ready
- **Details**: 
  - **API Client**: Created comprehensive API client with Xano response format handling
  - **Response Mapping**: Implemented XanoListResponse interface for paginated data
  - **Data Types**: Updated OrderResponse interface to match Xano schema (number IDs, timestamps)
  - **Authentication**: Integrated auth tokens with refresh token support
  - **Pagination**: Native Xano pagination (page, per_page, offset, has_more_items, found_count)
  - **Filtering**: Search, business entity, order type, status, priority filters
  - **Error Handling**: Comprehensive error states and user feedback
  - **Real-time Updates**: Refresh functionality with loading states
  - **Type Safety**: Full TypeScript integration with proper interfaces
  - **Mock Data Removed**: Completely replaced static data with live API calls
- **API Endpoints Used**:
  - `GET /api:V2/order` - Order list with filtering and pagination
  - `POST /api:auth/login` - Authentication with auth_token and refresh_token
- **Technical Implementation**:
  - Xano timestamp handling (seconds to milliseconds conversion)
  - Optional field handling for missing customer_name, business_entity, amount
  - Dynamic dashboard stats (ready for dedicated endpoint)
  - Server-side pagination with proper UI pagination controls

### 2024-12-19 - Project Setup & Organization
- **Component**: Project structure cleanup
- **Backend Work**: None required
- **Status**: Completed
- **Details**: Complete reorganization of project structure, documentation consolidation, cursor rules implementation

### 2025-01-09 - User Profile Data Integration from /me Endpoint
- **Components**: `frontend/lib/api.ts`, `frontend/hooks/useUser.ts`, `frontend/components/ui/Sidebar.tsx`, `frontend/pages/dashboard.tsx`
- **Backend Integration**: Fixed /me endpoint response structure handling
- **Status**: ✅ Completed - User Profile Data Now Displayed in UI
- **Details**: 
  - **API Response Structure**: Updated MeResponse interface to match actual API with nested _contact object
  - **Data Extraction**: Enhanced useUser hook to properly extract user data from nested _contact structure
  - **Display Names**: Smart display name fallback logic (display_name > full_name > first_name + last_name > email)
  - **Initials Generation**: Proper initials extraction from contact first/last names with fallbacks
  - **Profile Pictures**: Support for nested profile_picture structure from API response
  - **Role Labels**: Enhanced role mapping with Dutch translations and contact_type fallbacks
  - **Email Display**: Proper email extraction from _contact.email with legacy fallback
  - **Sidebar Integration**: User profile now shows real contact data in navigation
  - **Dashboard Integration**: User name in dashboard now uses real API data
  - **Backward Compatibility**: Maintained support for legacy flat field structure

---

## 📋 Template voor Nieuwe Entries

```markdown
## Backend Required: [Feature Name]

**Component**: `frontend/components/[ComponentName].tsx`  
**Required Endpoint**: `GET/POST/PUT/DELETE /api/[endpoint]`  
**Xano Function**: `[function_name]` (if applicable)

**Request Schema**:
```typescript
{
  field: string;
  id?: number;
  // additional fields...
}
```

**Response Schema**:
```typescript
{
  success: boolean;
  data: {
    field: string;
    // response structure...
  };
  error?: string;
}
```

**Business Logic**: 
- [Explain what the endpoint should do]
- [Any special validation rules]
- [Database operations needed]

**UI Context**:
- [Where this will be used in the UI]
- [User interaction flow]
- [Error states to handle]

**Priority**: HIGH/MEDIUM/LOW  
**Added**: YYYY-MM-DD  
**Estimated Effort**: [Small/Medium/Large]
```

---

## 🎯 Development Flow

### Voor AI Assistant:
1. **Check deze file EERST** voordat je nieuwe features bouwt
2. **Voeg entries toe** zodra je backend functionaliteit nodig hebt
3. **Update prioriteiten** op basis van frontend development flow
4. **Move naar Completed** wanneer backend klaar is

### Voor Human Developer:
1. **Review daily** tijdens actieve development
2. **Implement high priority items** eerst
3. **Communicate** met frontend team over blockers
4. **Update status** en add completion dates

---

## 📊 Status Overzicht

| Priority | Items | Status |
|----------|--------|---------|
| 🔥 High | 4 | Quote Builder, Order Management, Multichannel Inbox |
| 🟡 Medium | 0 | Clean |
| 🟢 Low | 0 | Clean |
| ✅ Completed | 1 | Setup done |

**Next Actions**: Implement quote builder backend API endpoints en order management! 🚀

---

*💡 **Tip**: Houd deze file altijd up-to-date voor smooth frontend/backend collaboration* 