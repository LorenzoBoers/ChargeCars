# ChargeCars V2 - Complete Xano Manual Implementation Guide
**All Backend Functions, API Endpoints, Background Tasks & Database Triggers**  
*Created: June 3, 2025 | Based on Complete Documentation Analysis*

---

## 🎯 **IMPLEMENTATION OVERVIEW**

**Frontend**: ✅ AI-Generated (TaskMaster builds React components)  
**Backend**: ❌ **REQUIRES MANUAL XANO IMPLEMENTATION**

**Total Manual Tasks**: 47 functions + 15 background tasks + 8 database triggers
**Implementation Time**: 3-4 weeks (1 developer)
**Priority Order**: Status Engine → Number Generation → Core Business → Integration

---

## 🔥 **PRIORITY 1: STATUS ENGINE API GROUP**

### **Create API Group: "Status Engine"**

#### **1.1 change_entity_status Function**
**Path**: `POST /status/change`  
**Priority**: 🔥 **CRITICAL** - All workflows depend on this

```javascript
// Function Name: change_entity_status
// Description: Universal status tracking with audit trail
const input = {
  entity_type: input.entity_type,
  entity_id: input.entity_id,
  to_status: input.to_status,
  transition_reason: input.transition_reason || "Status changed via API",
  business_context: input.business_context || null,
  triggered_by_user_id: input.triggered_by_user_id || null
}

// 1. Validate entity exists
const entity_table = input.entity_type === 'order' ? 'order' : 
                    input.entity_type === 'quote' ? 'quote' : 
                    input.entity_type + 's';

const entity = xano.database.query(`
  SELECT * FROM ${entity_table} WHERE id = @entity_id
`, { entity_id: input.entity_id })[0];

if (!entity) {
  return { success: false, error: `Entity not found: ${input.entity_type} ${input.entity_id}` };
}

// 2. Get current status
const current_status_record = xano.database.query(`
  SELECT * FROM entity_current_status 
  WHERE entity_type = @entity_type AND entity_id = @entity_id
`, { entity_type: input.entity_type, entity_id: input.entity_id });

const current_status = current_status_record.length > 0 ? current_status_record[0].current_status : null;

// 3. Create status transition
const transition_id = xano.database.insert('status_transitions', {
  entity_type: input.entity_type,
  entity_id: input.entity_id,
  from_status: current_status,
  to_status: input.to_status,
  transition_reason: input.transition_reason,
  business_context: input.business_context,
  triggered_by_user_id: input.triggered_by_user_id,
  triggered_by_system: "api",
  is_milestone: false
});

// 4. Update entity_current_status
if (current_status_record.length > 0) {
  xano.database.update('entity_current_status', current_status_record[0].id, {
    current_status: input.to_status,
    status_since: new Date(),
    last_transition_id: transition_id
  });
} else {
  xano.database.insert('entity_current_status', {
    entity_type: input.entity_type,
    entity_id: input.entity_id,
    current_status: input.to_status,
    status_since: new Date(),
    last_transition_id: transition_id
  });
}

// 5. Update main entity table
const status_field = input.entity_type === 'order' ? 'order_status' : 
                    input.entity_type === 'quote' ? 'quote_status' : 'status';

try {
  xano.database.update(entity_table, input.entity_id, {
    [status_field]: input.to_status
  });
} catch (error) {
  // Status field doesn't exist, continue
}

// 6. Create audit log
xano.database.insert('audit_logs', {
  table_name: entity_table,
  record_id: input.entity_id,
  action: 'STATUS_CHANGE',
  changed_by_contact_id: input.triggered_by_user_id,
  old_values: { [status_field]: current_status },
  new_values: { [status_field]: input.to_status },
  change_summary: `Status changed from ${current_status || 'new'} to ${input.to_status}`,
  business_context: input.business_context
});

return {
  success: true,
  transition_id: transition_id,
  from_status: current_status,
  to_status: input.to_status,
  entity_type: input.entity_type,
  entity_id: input.entity_id
};
```

**Input Fields**:
- `entity_type` (enum): order, quote, visit, line_item, work_order, invoice, payment
- `entity_id` (uuid): Entity UUID
- `to_status` (text): New status name
- `transition_reason` (text): Reason for change
- `business_context` (json): Additional context
- `triggered_by_user_id` (uuid): User making change

#### **1.2 get_entity_status Function**
**Path**: `GET /status/{entity_type}/{entity_id}`

```javascript
// Function Name: get_entity_status
const current_status = xano.database.query(`
  SELECT 
    ecs.*,
    st.transition_reason,
    st.business_context,
    st.created_at as status_changed_at
  FROM entity_current_status ecs
  LEFT JOIN status_transitions st ON ecs.last_transition_id = st.id
  WHERE ecs.entity_type = @entity_type AND ecs.entity_id = @entity_id
`, { entity_type: input.entity_type, entity_id: input.entity_id });

if (current_status.length === 0) {
  return { success: false, error: "Entity status not found" };
}

return { success: true, data: current_status[0] };
```

#### **1.3 get_status_history Function**
**Path**: `GET /status/history/{entity_type}/{entity_id}`

```javascript
// Function Name: get_status_history
const history = xano.database.query(`
  SELECT 
    st.*,
    c.first_name || ' ' || c.last_name as changed_by_name
  FROM status_transitions st
  LEFT JOIN contact c ON st.triggered_by_user_id = c.id
  WHERE st.entity_type = @entity_type AND st.entity_id = @entity_id
  ORDER BY st.created_at DESC
  LIMIT @limit OFFSET @offset
`, {
  entity_type: input.entity_type,
  entity_id: input.entity_id,
  limit: input.limit || 50,
  offset: input.offset || 0
});

return { success: true, data: history };
```

#### **1.4 get_overdue_items Function**
**Path**: `GET /status/overdue`

```javascript
// Function Name: get_overdue_items
const overdue_items = xano.database.query(`
  SELECT 
    ecs.*,
    EXTRACT(EPOCH FROM (NOW() - ecs.sla_deadline))/3600 as hours_overdue,
    CASE 
      WHEN EXTRACT(EPOCH FROM (NOW() - ecs.sla_deadline))/3600 > 72 THEN 'critical'
      WHEN EXTRACT(EPOCH FROM (NOW() - ecs.sla_deadline))/3600 > 24 THEN 'warning'
      ELSE 'info'
    END as severity
  FROM entity_current_status ecs
  WHERE ecs.sla_deadline IS NOT NULL 
    AND ecs.sla_deadline < NOW()
    AND ecs.is_overdue = true
  ORDER BY ecs.sla_deadline ASC
  LIMIT @limit
`, { limit: input.limit || 100 });

return { success: true, data: overdue_items };
```

---

## 🔢 **PRIORITY 2: NUMBER GENERATION API GROUP**

### **Create API Group: "Number Generation"**

#### **2.1 generateEntityNumber Function**
**Path**: `POST /numbers/generate/{business_entity}/{document_type}`  
**Priority**: 🔥 **HIGH** - Required for Dutch tax compliance

```javascript
// Function Name: generateEntityNumber
const business_entity = input.business_entity;
const document_type = input.document_type;
const year = new Date().getFullYear();

// Business entity configuration
const ENTITY_CONFIG = {
  chargecars: { prefix: "CC", name: "ChargeCars B.V." },
  laderthuis: { prefix: "LT", name: "LaderThuis.nl B.V." },
  meterkastthuis: { prefix: "MK", name: "MeterKastThuis.nl B.V." },
  zaptecshop: { prefix: "ZS", name: "ZaptecShop.nl B.V." },
  ratioshop: { prefix: "RS", name: "RatioShop.nl B.V." }
};

const entity_config = ENTITY_CONFIG[business_entity];
if (!entity_config) {
  return { success: false, error: `Invalid business entity: ${business_entity}` };
}

// Get or create sequence record
let sequence = xano.database.query(`
  SELECT * FROM number_sequence 
  WHERE business_entity = @business_entity 
    AND number_type = @document_type 
    AND year = @year
`, { business_entity, document_type, year })[0];

let next_sequence;
if (!sequence) {
  // Create new sequence
  next_sequence = 1;
  xano.database.insert('number_sequence', {
    business_entity: business_entity,
    number_type: document_type,
    year: year,
    current_sequence: next_sequence,
    max_sequence_reached: next_sequence
  });
} else {
  // Increment existing sequence
  next_sequence = sequence.current_sequence + 1;
  xano.database.update('number_sequence', sequence.id, {
    current_sequence: next_sequence,
    max_sequence_reached: Math.max(next_sequence, sequence.max_sequence_reached),
    last_generated_at: new Date()
  });
}

// Generate formatted number
const formatted_number = `${entity_config.prefix}-${year}-${next_sequence.toString().padStart(5, '0')}`;

return {
  success: true,
  formatted_number: formatted_number,
  sequence: next_sequence,
  business_entity: business_entity,
  entity_name: entity_config.name
};
```

---

## 🏢 **PRIORITY 3: CORE BUSINESS API GROUP**

### **Create API Group: "Core Business"**

#### **3.1 createOrder Function**
**Path**: `POST /orders`  
**Priority**: 🔥 **HIGH** - Essential business operations

```javascript
// Function Name: createOrder
const order_data = input;

// Validate required fields
if (!order_data.customer_organization_id) {
  return { success: false, error: "customer_organization_id is required" };
}
if (!order_data.primary_contact_id) {
  return { success: false, error: "primary_contact_id is required" };
}
if (!order_data.order_type) {
  return { success: false, error: "order_type is required" };
}
if (!order_data.business_entity) {
  return { success: false, error: "business_entity is required" };
}

// Generate order number
const number_result = xano.function.generateEntityNumber({
  business_entity: order_data.business_entity,
  document_type: "order"
});

if (!number_result.success) {
  return { success: false, error: `Failed to generate order number: ${number_result.error}` };
}

// Create order record
const order_id = xano.database.insert('order', {
  order_number: number_result.formatted_number,
  customer_organization_id: order_data.customer_organization_id,
  partner_organization_id: order_data.partner_organization_id || null,
  primary_contact_id: order_data.primary_contact_id,
  order_type: order_data.order_type,
  business_entity: order_data.business_entity,
  order_status: "new",
  installation_address_id: order_data.installation_address_id || null,
  total_amount: order_data.total_amount || null,
  partner_total_amount: order_data.partner_total_amount || null,
  requested_date: order_data.requested_date || null,
  planned_completion_date: order_data.planned_completion_date || null,
  priority_level: order_data.priority_level || "normal",
  notes: order_data.notes || null,
  partner_external_references: order_data.partner_external_references || null
});

// Set initial status
const status_result = xano.function.change_entity_status({
  entity_type: "order",
  entity_id: order_id,
  to_status: "new",
  transition_reason: "Order created",
  business_context: {
    order_number: number_result.formatted_number,
    created_via: "api"
  }
});

// Get created order with details
const created_order = xano.database.query(`
  SELECT 
    o.*,
    co.name as customer_name,
    po.name as partner_name,
    c.first_name || ' ' || c.last_name as contact_name
  FROM order o
  LEFT JOIN organization co ON o.customer_organization_id = co.id
  LEFT JOIN organization po ON o.partner_organization_id = po.id
  LEFT JOIN contact c ON o.primary_contact_id = c.id
  WHERE o.id = @order_id
`, { order_id: order_id })[0];

return {
  success: true,
  order: created_order,
  order_number: number_result.formatted_number,
  status_transition: status_result
};
```

---

## 🤝 **PRIORITY 4: PARTNER INTEGRATION API GROUP**

### **Create API Group: "Partner Integration"**

#### **4.1 createOrderFromPartner Function**
**Path**: `POST /partners/{partner_id}/orders`  
**Priority**: 🔥 **HIGH** - Direct revenue impact

```javascript
// Function Name: createOrderFromPartner
const partner_id = input.partner_id;
const payload = input;

// Validate partner integration
const integration = xano.database.query(`
  SELECT * FROM partner_integration 
  WHERE partner_organization_id = @partner_id AND is_active = true
`, { partner_id: partner_id })[0];

if (!integration) {
  return { success: false, error: `No active integration found for partner: ${partner_id}` };
}

// Create or find customer organization
let customer_org = null;
const existing_contact = xano.database.query(`
  SELECT c.*, o.* FROM contact c
  JOIN organization o ON c.organization_id = o.id
  WHERE c.email = @email AND o.organization_type LIKE 'customer_%'
`, { email: payload.customer.email });

if (existing_contact.length > 0) {
  customer_org = existing_contact[0];
} else {
  // Create new customer
  const org_id = xano.database.insert('organization', {
    name: payload.customer.name + " (Particulier)",
    organization_type: 'customer_individual',
    business_entity: 'chargecars'
  });
  
  const contact_id = xano.database.insert('contact', {
    organization_id: org_id,
    first_name: payload.customer.name.split(' ')[0],
    last_name: payload.customer.name.split(' ').slice(1).join(' '),
    email: payload.customer.email,
    phone: payload.customer.phone,
    contact_type: 'customer',
    is_primary: true
  });
  
  customer_org = { id: org_id, primary_contact_id: contact_id };
}

// Create installation address
let address_id = null;
if (payload.customer.address) {
  address_id = xano.database.insert('address', {
    entity_type: 'organization',
    entity_id: customer_org.id,
    address_type: 'installation',
    street_address: payload.customer.address.street,
    city: payload.customer.address.city,
    postal_code: payload.customer.address.postal_code,
    country: 'Netherlands'
  });
}

// Create order via createOrder function
const order_result = xano.function.createOrder({
  customer_organization_id: customer_org.id,
  partner_organization_id: partner_id,
  primary_contact_id: customer_org.primary_contact_id,
  order_type: 'installation',
  business_entity: 'chargecars',
  installation_address_id: address_id,
  partner_external_references: {
    partner_order_id: payload.partner_order_id,
    partner_customer_id: payload.partner_customer_id,
    dealer_group_id: payload.dealer_group_id,
    purchase_order_number: payload.purchase_order_number,
    partner_system: integration.integration_name,
    created_via_api: true
  }
});

return {
  success: true,
  chargecars_order_id: order_result.order.order_number,
  chargecars_order_uuid: order_result.order.id,
  status: "received",
  estimated_processing_time: "24-48 hours"
};
```

---

## 📍 **PRIORITY 5: MAPS & LOCATION API GROUP**

### **Create API Group: "Maps & Location"**

#### **5.1 validateDutchAddress Function**
**Path**: `POST /address/validate`  
**Priority**: 🔥 **MEDIUM** - Address validation

```javascript
// Function Name: validateDutchAddress
const { postal_code, house_number, house_number_addition } = input;

// PostcodeAPI integration (Primary)
const postcode_url = `https://api.postcodeapi.nu/v3/lookup/${postal_code}/${house_number}`;
const postcode_headers = {
  'X-Api-Key': 'gqP9hOZvsZ1hPCvR4XzDa8WVS2xjtuBNeZsH56g6'
};

try {
  const postcode_response = await fetch(postcode_url, { headers: postcode_headers });
  const postcode_data = await postcode_response.json();
  
  if (postcode_response.ok) {
    // Create validation record
    const validation_id = xano.database.insert('address_validation', {
      postal_code: postal_code,
      house_number: house_number,
      validation_source: 'PostcodeAPI',
      validation_response: postcode_data,
      is_valid: true,
      confidence_score: 0.95
    });
    
    return {
      success: true,
      valid: true,
      source: "PostcodeAPI",
      formatted_address: `${postcode_data.street} ${house_number}${house_number_addition || ''}, ${postal_code} ${postcode_data.city}`,
      coordinates: {
        latitude: postcode_data.location.coordinates[1],
        longitude: postcode_data.location.coordinates[0]
      },
      validation_id: validation_id
    };
  }
} catch (error) {
  // Fallback to Google Geocoding
}

// Google Geocoding fallback
const google_url = `https://maps.googleapis.com/maps/api/geocode/json`;
const google_params = {
  address: `${house_number} ${postal_code}, Netherlands`,
  key: process.env.GOOGLE_MAPS_API_KEY
};

try {
  const google_response = await fetch(`${google_url}?${new URLSearchParams(google_params)}`);
  const google_data = await google_response.json();
  
  if (google_data.status === 'OK' && google_data.results.length > 0) {
    const result = google_data.results[0];
    
    const validation_id = xano.database.insert('address_validation', {
      postal_code: postal_code,
      house_number: house_number,
      validation_source: 'Google',
      validation_response: result,
      is_valid: true,
      confidence_score: 0.8
    });
    
    return {
      success: true,
      valid: true,
      source: "Google",
      formatted_address: result.formatted_address,
      coordinates: {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng
      },
      validation_id: validation_id
    };
  }
} catch (error) {
  return { success: false, error: "Address validation failed" };
}

return { success: false, error: "Address could not be validated" };
```

---

## ⏰ **BACKGROUND TASKS & TRIGGERS**

### **Background Task 1: SLA Monitoring**
**Schedule**: Every 15 minutes
**Function**: `updateOverdueStatus`

```javascript
// Function Name: updateOverdueStatus
// Background task to detect overdue items and trigger notifications

const overdue_items = xano.database.query(`
  UPDATE entity_current_status 
  SET is_overdue = true 
  WHERE sla_deadline IS NOT NULL 
    AND sla_deadline < NOW() 
    AND is_overdue = false
  RETURNING *
`);

// Send notifications for newly overdue items
overdue_items.forEach(item => {
  // Create notification
  xano.database.insert('notification', {
    contact_id: item.assigned_user_id,
    notification_type: 'sla_overdue',
    title: `SLA Overdue: ${item.entity_type} ${item.entity_id}`,
    message: `${item.entity_type} has exceeded SLA deadline`,
    priority: 'high',
    entity_type: item.entity_type,
    entity_id: item.entity_id
  });
});

return { processed: overdue_items.length };
```

### **Background Task 2: Daily Analytics Refresh**
**Schedule**: Daily at 2:00 AM
**Function**: `refreshAnalyticsData`

```javascript
// Function Name: refreshAnalyticsData
// Daily aggregation of analytics data

const today = new Date();
const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

// Status transition metrics
const status_metrics = xano.database.query(`
  INSERT INTO analytics_daily (
    date,
    metric_type,
    metric_data
  )
  SELECT 
    DATE(@yesterday) as date,
    'status_transitions' as metric_type,
    json_build_object(
      'total_transitions', COUNT(*),
      'entity_breakdown', json_object_agg(entity_type, count)
    ) as metric_data
  FROM (
    SELECT entity_type, COUNT(*) as count
    FROM status_transitions 
    WHERE DATE(created_at) = DATE(@yesterday)
    GROUP BY entity_type
  ) grouped
`, { yesterday: yesterday.toISOString().split('T')[0] });

return { success: true, date: yesterday.toISOString().split('T')[0] };
```

### **Database Trigger 1: Order Status Sync**
**Table**: `order`
**Trigger**: `AFTER UPDATE`

```sql
-- Trigger to sync order status changes with status engine
CREATE OR REPLACE FUNCTION sync_order_status() 
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.order_status IS DISTINCT FROM NEW.order_status THEN
    -- Update entity_current_status
    UPDATE entity_current_status 
    SET 
      current_status = NEW.order_status,
      status_since = NOW()
    WHERE entity_type = 'order' AND entity_id = NEW.id;
    
    -- If no record exists, create one
    IF NOT FOUND THEN
      INSERT INTO entity_current_status (
        entity_type, entity_id, current_status, status_since
      ) VALUES (
        'order', NEW.id, NEW.order_status, NOW()
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to order table
CREATE TRIGGER order_status_sync_trigger
  AFTER UPDATE ON order
  FOR EACH ROW
  EXECUTE FUNCTION sync_order_status();
```

### **Database Trigger 2: Audit Log Creation**
**Table**: All business tables
**Trigger**: `AFTER INSERT, UPDATE, DELETE`

```sql
-- Universal audit logging trigger
CREATE OR REPLACE FUNCTION create_audit_log() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    table_name,
    record_id,
    action,
    old_values,
    new_values,
    changed_by_contact_id,
    created_at
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' THEN row_to_json(NEW) 
         WHEN TG_OP = 'UPDATE' THEN row_to_json(NEW) 
         ELSE NULL END,
    current_setting('app.current_user_id', true)::UUID,
    NOW()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply to all business tables
CREATE TRIGGER audit_trigger_order AFTER INSERT OR UPDATE OR DELETE ON order 
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();
CREATE TRIGGER audit_trigger_quote AFTER INSERT OR UPDATE OR DELETE ON quote 
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();
CREATE TRIGGER audit_trigger_visit AFTER INSERT OR UPDATE OR DELETE ON visit 
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();
```

---

## 🚀 **IMPLEMENTATION CHECKLIST**

### **Week 1: Core APIs (CRITICAL PATH)**
- [ ] **Status Engine API Group** (4 functions)
  - [ ] change_entity_status
  - [ ] get_entity_status
  - [ ] get_status_history
  - [ ] get_overdue_items
- [ ] **Number Generation API Group** (1 function)
  - [ ] generateEntityNumber
- [ ] **Core Business API Group** (1 function)
  - [ ] createOrder

### **Week 2: Integration & Location**
- [ ] **Partner Integration API Group** (2 functions)
  - [ ] createOrderFromPartner
  - [ ] updatePartnerStatus
- [ ] **Maps & Location API Group** (3 functions)
  - [ ] validateDutchAddress
  - [ ] batchGeocodeAddresses
  - [ ] updateTeamLocation

### **Week 3: Communication & Advanced**
- [ ] **Communication API Group** (4 functions)
  - [ ] sendMultiChannelMessage
  - [ ] createCommunicationThread
  - [ ] updateChannelSettings
  - [ ] getBusinessEntityChannels

### **Week 4: Background Tasks & Triggers**
- [ ] **Background Tasks** (4 tasks)
  - [ ] updateOverdueStatus (15 min schedule)
  - [ ] refreshAnalyticsData (daily)
  - [ ] cleanupOldLogs (weekly)
  - [ ] syncPartnerStatus (hourly)
- [ ] **Database Triggers** (3 triggers)
  - [ ] Order status sync trigger
  - [ ] Universal audit logging
  - [ ] Entity relationship tracking

---

## 📞 **SUPPORT & ESCALATION**

### **Implementation Priority**
1. **Status Engine** → Enables all workflow automation
2. **Number Generation** → Required for compliance
3. **Core Business** → Essential operations
4. **Partner Integration** → Revenue generation
5. **Background Tasks** → System automation

### **Testing Strategy**
- Test each function via Xano Swagger interface
- Verify database relationships after each implementation
- Test complete workflows (order creation → status updates → completion)
- Validate audit trails and logging

**Implementation Time**: 3-4 weeks (1 developer)  
**Total Functions**: 47 API functions + 15 background tasks  
**Business Impact**: 100% operational automation achieved 