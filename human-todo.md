# Human TODO - Backend Requirements

*Central communication hub voor frontend → backend ontwikkeling*  
*Laatste update: 2024-12-19*

---

## 📍 In Progress
[None - klaar voor nieuwe features]

---

## 🔥 High Priority

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

### Backend Required: Order Management API

**Component**: `frontend/pages/orders.tsx`  
**Required Endpoint**: `GET /api/orders`  
**Xano Function**: `get_orders_list` (if applicable)

**Request Schema**:
```typescript
{
  page?: number;
  per_page?: number;
  search?: string;
  business_entity?: string;
  order_type?: string;
  status?: string;
  user_id?: string; // for "Mijn Orders" filter
}
```

**Response Schema**:
```typescript
{
  success: boolean;
  data: {
    orders: Order[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
  error?: string;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  business_entity: string;
  order_type: string;
  status: string;
  amount: number;
  created_at: string;
  updated_at: string;
  priority: 'low' | 'medium' | 'high';
  installation_date?: string;
}
```

**Business Logic**: 
- Paginated order list with search and filtering
- Support for filtering by business entity, order type, status
- Search across order number and customer name
- User-specific filtering for "Mijn Orders"
- Proper sorting by creation date (newest first)

**UI Context**:
- Order management table with filters and search
- Preset filter buttons for quick access
- Pagination for large datasets
- Real-time status updates needed

**Priority**: HIGH  
**Added**: 2024-12-19  
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

### 2024-12-19 - Project Setup & Organization
- **Component**: Project structure cleanup
- **Backend Work**: None required
- **Status**: Completed
- **Details**: Complete reorganization of project structure, documentation consolidation, cursor rules implementation

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