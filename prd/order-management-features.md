# Order Management PRD - Advanced Filtering & Search

**Last Updated**: 2025-01-18
**Status**: In Development
**Priority**: High
**Owner**: Backend Team

## 🎯 **Feature Overview**

### **Advanced Order Filtering System**

Based on [Xano external filtering capabilities](https://docs.xano.com/the-function-stack/functions/database-requests/query-all-records/external-filtering-examples), we implement a comprehensive filtering system for order management.

## 📋 **User Stories**

### **US-001: Basic Filtering**
**As a** order manager  
**I want to** filter orders by single criteria (status, type, priority)  
**So that** I can quickly find specific types of orders  

**Acceptance Criteria:**
- ✅ Filter by exact status match
- ✅ Filter by exact order type match  
- ✅ Filter by exact priority level
- ✅ Filter by assigned owner
- ✅ Filter by business entity

### **US-002: Multi-Value Filtering**
**As a** order manager  
**I want to** filter orders by multiple values in the same field  
**So that** I can view orders across multiple statuses/types at once  

**Acceptance Criteria:**
- ✅ Filter by multiple statuses (e.g., "new,pending,in_progress")
- ✅ Filter by multiple order types (e.g., "installation,maintenance")
- ✅ Filter by multiple priority levels
- ✅ Use comma-separated values in URL parameters
- ✅ Support both single and multi-value filtering simultaneously

### **US-003: Date Range Filtering**
**As a** order manager  
**I want to** filter orders by date ranges  
**So that** I can analyze orders within specific time periods  

**Acceptance Criteria:**
- ✅ Filter by creation date range (created_from/created_to)
- ✅ Filter by requested date range  
- ✅ Filter by planned completion date range
- ✅ Support ISO 8601 date format
- ✅ Support both start and end dates independently

### **US-004: Advanced Text Search**
**As a** order manager  
**I want to** search orders with flexible text matching  
**So that** I can find orders even with partial information  

**Acceptance Criteria:**
- ✅ Global search across order_number, notes, display_name
- ✅ Case-insensitive text search (ilike)
- ✅ Partial matching with wildcard support
- ✅ Specific field text filters (order_number_like, notes_contains)
- ✅ OR logic for global search across multiple fields

### **US-005: Boolean & Numeric Filtering**
**As a** order manager  
**I want to** filter orders by boolean and numeric criteria  
**So that** I can find orders meeting specific business conditions  

**Acceptance Criteria:**
- ✅ Filter overdue orders (boolean)
- ✅ Filter orders with quotes (boolean)
- ✅ Filter by amount ranges (min/max_total_amount)
- ✅ Include/exclude deleted orders
- ✅ Support numeric comparison operators

### **US-006: Complex Combined Filtering**
**As a** power user  
**I want to** combine multiple filter types  
**So that** I can create sophisticated order queries  

**Acceptance Criteria:**
- ✅ Combine single-value + multi-value filters
- ✅ Combine date ranges + text search + boolean filters
- ✅ Support AND logic between different filter types
- ✅ Support OR logic within same filter category
- ✅ Maintain performance with complex queries

### **US-007: Flexible Sorting**
**As a** order manager  
**I want to** sort filtered results by different criteria  
**So that** I can view orders in the most relevant order  

**Acceptance Criteria:**
- ✅ Sort by creation date, update date, order number
- ✅ Sort by status, priority, requested date
- ✅ Support ascending and descending order
- ✅ Default to most recent first
- ✅ Maintain sort across pagination

## 🔧 **Technical Implementation**

### **Xano External Filter Structure**

```javascript
// Example complex filter expression
{
  "expression": [
    {
      "statement": {
        "left": {"tag": "col", "operand": "order.status"},
        "op": "in",
        "right": {"operand": ["pending", "in_progress"]}
      }
    },
    {
      "statement": {
        "left": {"tag": "col", "operand": "order.created_at"},
        "op": ">=",
        "right": {"operand": "2025-01-01"}
      }
    },
    {
      "type": "group",
      "group": {
        "expression": [
          {
            "statement": {
              "left": {"tag": "col", "operand": "order.order_number"},
              "op": "ilike",
              "right": {"operand": "%CC-2025%"}
            }
          },
          {
            "or": true,
            "statement": {
              "left": {"tag": "col", "operand": "order.notes"},
              "op": "ilike",
              "right": {"operand": "%urgent%"}
            }
          }
        ]
      }
    }
  ]
}
```

### **Filter Types Mapping**

| Filter Category | Xano Operator | Use Case |
|----------------|---------------|----------|
| Exact Match | `=` | Single status, type, owner |
| Array Match | `in` | Multiple statuses, types |
| Range | `>=`, `<=` | Date ranges, numeric ranges |
| Text Match | `ilike` | Case-insensitive partial text |
| Contains | `contains` | Exact text within field |
| Between | `between` | Numeric ranges |

### **Performance Considerations**

- ✅ Index on commonly filtered fields (status, created_at, owner_id)
- ✅ Limit complex text searches to reasonable query length
- ✅ Pagination mandatory for large result sets
- ✅ Cache frequently used filter combinations
- ✅ Monitor query performance in production

## 📊 **Frontend Integration**

### **Filter UI Components**

1. **Quick Filters Bar**
   - Status dropdown (multi-select)
   - Order type dropdown (multi-select)
   - Priority dropdown (multi-select)
   - Date range pickers

2. **Advanced Search Panel**
   - Text search input
   - Boolean toggle switches
   - Numeric range inputs
   - Business entity selector

3. **Saved Filters**
   - Save commonly used filter combinations
   - Quick access to saved searches
   - Share filter URLs with team

### **URL Structure Examples**

```bash
# Basic filtering
/orders?status=pending&priority=high

# Multi-value with date range
/orders?status_in=new,pending&created_from=2025-01-01&created_to=2025-01-31

# Complex search
/orders?search=laadpaal&overdue=true&min_total_amount=1000&sort=created_at&order=desc
```

## 🧪 **Testing Requirements**

### **API Testing**
- ✅ Test each filter type individually
- ✅ Test complex filter combinations
- ✅ Test edge cases (empty results, invalid dates)
- ✅ Performance testing with large datasets
- ✅ Test pagination with filters

### **Frontend Testing**
- ✅ Filter UI component functionality
- ✅ URL parameter handling
- ✅ Filter state persistence
- ✅ Filter combination validation
- ✅ Performance with complex filters

## 📈 **Success Metrics**

### **Performance KPIs**
- Order search time < 500ms for typical queries
- Support for 10,000+ orders with maintained performance
- 95% accuracy in filter results

### **Usage KPIs**
- % of users using advanced filters
- Most commonly used filter combinations
- Time saved in order discovery

## 🔄 **Related Documentation**

- [Xano External Filtering Documentation](https://docs.xano.com/the-function-stack/functions/database-requests/query-all-records/external-filtering-examples)
- [Order API Endpoints](../../01-backend/api-specifications/order-endpoints.md)
- [Order Database Schema](../../01-backend/database-schema/current-schema.md)
- [Order Management Workflow](../business-workflows/order-lifecycle-workflow.md)

## 📝 **Implementation Checklist**

- [x] Basic single-value filters (status, type, priority)
- [x] Multi-value array filters (status_in, type_in)
- [x] Date range filters (created, requested, planned)
- [x] Text search filters (global search, specific fields)
- [x] Boolean filters (overdue, has_quotes)
- [x] Numeric filters (amount ranges)
- [x] Complex filter expressions with grouping
- [x] Flexible sorting options
- [x] Performance optimization
- [ ] Frontend filter UI components
- [ ] Saved filter functionality
- [ ] Filter analytics and monitoring 