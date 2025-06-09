# SLA Addon Strategy - Xano API Enhancement

**Datum**: 2025-01-18
**Approach**: Hybrid - `order.status` + Status Engine via API Addon

## 🎯 **Perfect Hybrid Solution**

### **Database Layer: Simple & Fast**
```sql
-- Keep simple for performance
order (
  id: uuid,
  status: text,  -- "quote_sent", "in_progress", etc.
  ...
)
```

### **API Layer: Rich SLA Enhancement**
```javascript
// Xano Addon adds SLA data to response
{
  "id": "uuid",
  "order_number": "CC-2025-001",
  "status": "quote_sent",  // From order table
  "sla_info": {           // Added by addon
    "deadline": "2025-01-25T10:00:00Z",
    "is_overdue": false,
    "hours_remaining": 72,
    "status_since": "2025-01-18T10:00:00Z"
  }
}
```

## 🔧 **Xano Implementation Strategy**

### **Step 1: Keep Current order.status**
- ✅ No database changes needed
- ✅ Existing queries blijven werken
- ✅ Performance stays optimal

### **Step 2: Create Status Engine Tables**
```sql
-- Add SLA monitoring capability
entity_current_status (
  entity_type: 'order',
  entity_id: uuid,  -- FK to order.id
  current_status: text,  -- Sync with order.status
  status_since: timestamp,
  sla_deadline: timestamp,
  is_overdue: boolean,
  sla_hours: decimal
)

status_transitions (
  entity_type: 'order', 
  entity_id: uuid,
  from_status: text,
  to_status: text,
  transition_reason: text,
  triggered_by_contact_id: uuid,
  created_at: timestamp,
  sla_deadline: timestamp
)
```

### **Step 3: Create Xano Addon Function**

#### **Addon Name**: `sla_enhancer`
```javascript
// Xano Function: enhance_with_sla
function enhance_with_sla(response_data, entity_type) {
  
  // Extract entity IDs from response
  const entityIds = Array.isArray(response_data) 
    ? response_data.map(item => item.id)
    : [response_data.id];
  
  // Bulk query SLA data
  const slaData = xano.database.query(`
    SELECT 
      entity_id,
      current_status,
      status_since,
      sla_deadline,
      is_overdue,
      EXTRACT(EPOCH FROM (sla_deadline - NOW())) / 3600 as hours_remaining
    FROM entity_current_status 
    WHERE entity_type = @entity_type 
    AND entity_id IN (@entity_ids)
  `, {
    entity_type: entity_type,
    entity_ids: entityIds
  });
  
  // Create lookup map
  const slaMap = {};
  slaData.forEach(item => {
    slaMap[item.entity_id] = {
      deadline: item.sla_deadline,
      is_overdue: item.is_overdue,
      hours_remaining: Math.max(0, item.hours_remaining || 0),
      status_since: item.status_since
    };
  });
  
  // Enhance response data
  if (Array.isArray(response_data)) {
    return response_data.map(item => ({
      ...item,
      sla_info: slaMap[item.id] || null
    }));
  } else {
    return {
      ...response_data,
      sla_info: slaMap[response_data.id] || null
    };
  }
}
```

### **Step 4: Apply Addon to API Endpoints**

#### **Orders API Enhancement:**
```javascript
// In je orders endpoint (after main query)

// 1. Get orders (existing logic)
const orders = xano.database.query(`
  SELECT * FROM order 
  WHERE id IN (${accessible_order_ids})
`);

// 2. Enhance with SLA data (addon)
const enhanced_orders = enhance_with_sla(orders, 'order');

// 3. Return enhanced response
return {
  orders: enhanced_orders,
  total_count: enhanced_orders.length
};
```

## 📊 **SLA Configuration Strategy**

### **Default SLA Rules:**
```javascript
// Configure in Xano function or config table
const SLA_RULES = {
  order: {
    new_lead: { hours: 24, color: '#FF5722' },
    intake_sent: { hours: 168, color: '#FF9800' }, // 7 days
    quote_draft: { hours: 48, color: '#FFC107' },
    quote_sent: { hours: 168, color: '#2196F3' }, // 7 days
    planning: { hours: 72, color: '#9C27B0' },
    in_progress: { hours: null, color: '#4CAF50' }, // No SLA
    completed: { hours: null, color: '#388E3C' }
  }
};
```

### **SLA Calculation Function:**
```javascript
// Xano Function: calculate_sla_deadline
function calculate_sla_deadline(status, transition_time) {
  const slaHours = SLA_RULES.order[status]?.hours;
  
  if (!slaHours) return null; // No SLA for this status
  
  const deadline = new Date(transition_time);
  deadline.setHours(deadline.getHours() + slaHours);
  
  return deadline;
}
```

## 🔧 **Status Change Logic (Enhanced)**

### **Function: update_order_status_with_sla**
```javascript
function update_order_status_with_sla(order_id, new_status, reason, user_id) {
  
  // 1. Get current status
  const currentOrder = xano.database.get('order', order_id);
  const oldStatus = currentOrder.status;
  
  // 2. Update order table (fast access)
  xano.database.update('order', order_id, {
    status: new_status,
    updated_at: new Date()
  });
  
  // 3. Calculate SLA deadline
  const slaDeadline = calculate_sla_deadline(new_status, new Date());
  
  // 4. Log transition with SLA
  const transitionId = xano.database.insert('status_transitions', {
    entity_type: 'order',
    entity_id: order_id,
    from_status: oldStatus,
    to_status: new_status,
    transition_reason: reason,
    triggered_by_contact_id: user_id,
    sla_deadline: slaDeadline,
    created_at: new Date()
  });
  
  // 5. Update/create current status cache
  const existingStatus = xano.database.query(`
    SELECT id FROM entity_current_status 
    WHERE entity_type = 'order' AND entity_id = @order_id
  `, { order_id: order_id })[0];
  
  if (existingStatus) {
    xano.database.update('entity_current_status', existingStatus.id, {
      current_status: new_status,
      status_since: new Date(),
      sla_deadline: slaDeadline,
      is_overdue: false,
      last_transition_id: transitionId
    });
  } else {
    xano.database.insert('entity_current_status', {
      entity_type: 'order',
      entity_id: order_id,
      current_status: new_status,
      status_since: new Date(),
      sla_deadline: slaDeadline,
      is_overdue: false,
      last_transition_id: transitionId
    });
  }
  
  return { success: true, sla_deadline: slaDeadline };
}
```

## 📱 **Frontend Usage**

### **API Response Example:**
```javascript
// GET /api/orders
{
  "orders": [
    {
      "id": "uuid-1",
      "order_number": "CC-2025-001", 
      "status": "quote_sent",
      "created_at": "2025-01-18T09:00:00Z",
      "sla_info": {
        "deadline": "2025-01-25T09:00:00Z",
        "is_overdue": false,
        "hours_remaining": 168,
        "status_since": "2025-01-18T09:00:00Z"
      }
    }
  ]
}
```

### **Frontend SLA Display:**
```javascript
// React component
function OrderStatusBadge({ order }) {
  const { status, sla_info } = order;
  
  const getBadgeColor = () => {
    if (!sla_info?.deadline) return 'gray'; // No SLA
    if (sla_info.is_overdue) return 'red';
    if (sla_info.hours_remaining < 24) return 'orange';
    return 'green';
  };
  
  return (
    <div className={`badge ${getBadgeColor()}`}>
      {status}
      {sla_info?.deadline && (
        <span className="sla-info">
          {sla_info.is_overdue ? 'OVERDUE' : `${Math.round(sla_info.hours_remaining)}h left`}
        </span>
      )}
    </div>
  );
}
```

## ⚡ **Performance Benefits**

### **Fast Core Queries:**
```sql
-- Still lightning fast
SELECT * FROM order WHERE status = 'quote_sent'  -- No joins needed
```

### **Rich When Needed:**
```sql
-- SLA data only when API calls addon
-- Bulk query for multiple orders at once
-- Cached in entity_current_status table
```

### **Optimized API Calls:**
- Base order data: 1 query
- SLA enhancement: 1 additional bulk query
- Total: 2 queries for rich data vs many joins

## ✅ **Implementation Steps**

### **Phase 1: Setup (1 day)**
1. Create `entity_current_status` table
2. Create `status_transitions` table  
3. Sync existing order statuses

### **Phase 2: Addon Development (2 days)**
1. Create `enhance_with_sla` addon function
2. Create `update_order_status_with_sla` function
3. Add SLA calculation logic

### **Phase 3: API Integration (1 day)**
1. Apply addon to orders endpoints
2. Test enhanced responses
3. Update frontend to use SLA data

### **Phase 4: SLA Monitoring (1 day)**
1. Create overdue detection script
2. Add SLA dashboard components
3. Setup notifications

## 🎯 **Conclusion**

**Perfect hybrid approach:**
- ✅ `order.status` voor performance
- ✅ Status engine voor SLA intelligence
- ✅ API addon voor seamless integration
- ✅ Zero breaking changes
- ✅ Rich SLA monitoring

**Best of both worlds - performance EN SLA monitoring!** 🚀 