# ChargeCars V2 - API Endpoints Catalog
**Last Updated**: 2025-06-02
**Status**: Draft
**Base URL**: `https://api.chargecars.nl/v2`

## API Groups Overview

1. **Status Engine** - Universal status tracking
2. **Number Generation** - Sequential numbering  
3. **Core Business** - Orders, quotes, visits
4. **Partner Integration** - External partner APIs
5. **Maps & Location** - Address validation, geocoding
6. **Communication** - Multi-channel messaging
7. **Reporting** - Analytics and reports
8. **System** - Authentication, configuration

## 1. Status Engine API Group

### 1.1 Change Entity Status
**Endpoint**: `POST /status/change`  
**Description**: Update status for any entity with full audit trail  
**Authentication**: Required

**Request Body**:
```json
{
  "entity_type": "order",
  "entity_id": "uuid",
  "to_status": "in_progress",
  "transition_reason": "Work started",
  "business_context": {
    "technician_id": "uuid"
  },
  "triggered_by_contact_id": "uuid"
}
```

**Response**:
```json
{
  "success": true,
  "transition_id": "uuid",
  "from_status": "new",
  "to_status": "in_progress",
  "entity_type": "order",
  "entity_id": "uuid"
}
```

### 1.2 Get Entity Status
**Endpoint**: `GET /status/{entity_type}/{entity_id}`  
**Description**: Retrieve current status for an entity  
**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "data": {
    "entity_type": "order",
    "entity_id": "uuid",
    "current_status": "in_progress",
    "status_since": "2025-06-02T10:30:00Z",
    "assigned_user_id": "uuid",
    "sla_deadline": "2025-06-04T17:00:00Z"
  }
}
```

### 1.3 Get Status History
**Endpoint**: `GET /status/history/{entity_type}/{entity_id}`  
**Description**: Retrieve complete status transition history  
**Authentication**: Required  
**Query Parameters**:
- `limit` (integer, default: 50)
- `offset` (integer, default: 0)

### 1.4 Get Overdue Items
**Endpoint**: `GET /status/overdue`  
**Description**: List all entities past SLA deadline  
**Authentication**: Required  
**Query Parameters**:
- `limit` (integer, default: 100)
- `entity_type` (string, optional)

## 2. Number Generation API Group

### 2.1 Generate Entity Number
**Endpoint**: `POST /numbers/generate/{business_entity}/{document_type}`  
**Description**: Generate sequential number for entity/document type  
**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "formatted_number": "CC-2025-00123",
  "sequence": 123,
  "business_entity": "chargecars",
  "entity_name": "ChargeCars B.V."
}
```

## 3. Core Business API Group

### 3.1 Create Order
**Endpoint**: `POST /orders`  
**Description**: Create new order with automatic numbering  
**Authentication**: Required

**Request Body**:
```json
{
  "customer_organization_id": "uuid",
  "partner_organization_id": "uuid",
  "primary_contact_id": "uuid",
  "order_type": "installation",
  "business_entity": "chargecars",
  "installation_address_id": "uuid",
  "total_amount": 1250.00,
  "requested_date": "2025-06-15",
  "priority_level": "normal",
  "notes": "Customer prefers morning installation",
  "partner_external_references": {
    "partner_order_id": "PO-12345"
  }
}
```

### 3.2 Get Order
**Endpoint**: `GET /orders/{order_id}`  
**Description**: Retrieve order details with relations  
**Authentication**: Required

### 3.3 Update Order
**Endpoint**: `PATCH /orders/{order_id}`  
**Description**: Update order fields  
**Authentication**: Required

### 3.4 List Orders
**Endpoint**: `GET /orders`  
**Description**: List orders with filtering  
**Authentication**: Required  
**Query Parameters**:
- `status` (string)
- `business_entity` (string)
- `customer_id` (uuid)
- `partner_id` (uuid)
- `date_from` (date)
- `date_to` (date)
- `page` (integer)
- `per_page` (integer)

### 3.5 Create Quote
**Endpoint**: `POST /quotes`  
**Description**: Create new quote  
**Authentication**: Required

### 3.6 Convert Quote to Order
**Endpoint**: `POST /quotes/{quote_id}/convert`  
**Description**: Convert approved quote to order  
**Authentication**: Required

## 4. Partner Integration API Group

### 4.1 Create Order from Partner
**Endpoint**: `POST /partners/{partner_id}/orders`  
**Description**: Partner API to submit new orders  
**Authentication**: Partner API Key

**Request Body**:
```json
{
  "partner_order_id": "EXT-12345",
  "partner_customer_id": "CUST-789",
  "dealer_group_id": "DG-456",
  "purchase_order_number": "PO-2025-123",
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+31612345678",
    "address": {
      "street": "Hoofdstraat 123",
      "city": "Amsterdam",
      "postal_code": "1234 AB"
    }
  },
  "products": [
    {
      "sku": "ZAPTEC-PRO",
      "quantity": 1
    }
  ],
  "installation_requested": true,
  "preferred_date": "2025-06-20"
}
```

### 4.2 Update Partner Order Status
**Endpoint**: `POST /partners/{partner_id}/orders/{order_id}/status`  
**Description**: Send status update to partner webhook  
**Authentication**: System

### 4.3 Get Partner Integration Status
**Endpoint**: `GET /partners/{partner_id}/integration`  
**Description**: Check partner integration health  
**Authentication**: Partner API Key

## 5. Maps & Location API Group

### 5.1 Validate Dutch Address
**Endpoint**: `POST /address/validate`  
**Description**: Validate and geocode Dutch address  
**Authentication**: Required

**Request Body**:
```json
{
  "postal_code": "1234 AB",
  "house_number": "123",
  "house_number_addition": "A"
}
```

**Response**:
```json
{
  "success": true,
  "valid": true,
  "source": "PostcodeAPI",
  "formatted_address": "Hoofdstraat 123A, 1234 AB Amsterdam",
  "coordinates": {
    "latitude": 52.370216,
    "longitude": 4.895168
  },
  "validation_id": "uuid"
}
```

### 5.2 Batch Geocode Addresses
**Endpoint**: `POST /address/geocode/batch`  
**Description**: Geocode multiple addresses for route planning  
**Authentication**: Required

### 5.3 Update Team Location
**Endpoint**: `POST /teams/{team_id}/location`  
**Description**: Update field team real-time location  
**Authentication**: Mobile App Token

## 6. Communication API Group

### 6.1 Send Multi-Channel Message
**Endpoint**: `POST /communications/send`  
**Description**: Send message via email/SMS/WhatsApp  
**Authentication**: Required

**Request Body**:
```json
{
  "channel": "email",
  "business_entity": "chargecars",
  "template_id": "order_confirmation",
  "recipients": ["customer@example.com"],
  "variables": {
    "order_number": "CC-2025-00123",
    "customer_name": "John Doe"
  },
  "thread_entity_type": "order",
  "thread_entity_id": "uuid"
}
```

### 6.2 Create Communication Thread
**Endpoint**: `POST /communications/threads`  
**Description**: Create new communication thread  
**Authentication**: Required

### 6.3 Get Business Entity Channels
**Endpoint**: `GET /business-entities/{entity}/channels`  
**Description**: List available communication channels  
**Authentication**: Required

## 7. Reporting API Group

### 7.1 Get Dashboard Metrics
**Endpoint**: `GET /reports/dashboard`  
**Description**: Real-time KPI dashboard data  
**Authentication**: Required  
**Query Parameters**:
- `date_from` (date)
- `date_to` (date)
- `business_entity` (string)

### 7.2 Generate Order Report
**Endpoint**: `POST /reports/orders`  
**Description**: Generate detailed order report  
**Authentication**: Required

### 7.3 Get SLA Compliance Report
**Endpoint**: `GET /reports/sla-compliance`  
**Description**: SLA performance metrics  
**Authentication**: Required

## 8. System API Group

### 8.1 Authenticate
**Endpoint**: `POST /auth/login`  
**Description**: User authentication  
**Authentication**: None

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

### 8.2 Refresh Token
**Endpoint**: `POST /auth/refresh`  
**Description**: Refresh access token  
**Authentication**: Refresh Token

### 8.3 Get User Profile
**Endpoint**: `GET /auth/profile`  
**Description**: Get authenticated user details  
**Authentication**: Required

### 8.4 Health Check
**Endpoint**: `GET /health`  
**Description**: API health status  
**Authentication**: None

## Error Responses

All endpoints return consistent error format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  },
  "timestamp": "2025-06-02T10:30:00Z"
}
```

## Rate Limiting

- **Partner APIs**: 100 requests/minute
- **User APIs**: 1000 requests/minute
- **Public APIs**: 10 requests/minute

Headers returned:
- `X-RateLimit-Limit`: Maximum requests
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset timestamp

## Webhook Events

Partners can subscribe to webhook events:

- `order.created`
- `order.status_changed`
- `order.completed`
- `quote.created`
- `quote.approved`
- `invoice.created`
- `payment.received`

## API Versioning

- Current version: `v2`
- Version in URL path: `/v2/`
- Breaking changes require new version
- Deprecation notice: 6 months minimum

---

**Note**: This catalog must be kept in sync with Xano implementation. Update after any endpoint changes. 