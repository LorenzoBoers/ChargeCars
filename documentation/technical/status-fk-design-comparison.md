# Status Engine FK Design - Universal vs Entity-Specific

**Datum**: 2025-01-18
**Decision**: Foreign Key direction in Status Engine

## 🤔 **Je Vraag: FK Direction**

### **Huidige Design (Universal)**
```sql
-- Status engine → Entity
entity_current_status (
  id: uuid,
  entity_type: enum,  -- "order", "contact", etc.
  entity_id: uuid,    -- FK naar order.id, contact.id, etc.
  current_status: text,
  sla_deadline: timestamp
)

order (
  id: uuid,
  status: text,  -- Duplicate for performance
  ...
)
```

### **Jouw Voorstel (Entity-Specific)**
```sql
-- Entity → Status engine
order (
  id: uuid,
  status: text,
  status_record_id: uuid  -- FK naar entity_current_status
)

entity_current_status (
  id: uuid,
  current_status: text,
  sla_deadline: timestamp,
  status_since: timestamp
)
```

## ⚖️ **Pros & Cons Analysis**

### 🟢 **Entity-Specific FK Approach (Jouw voorstel)**

#### **Voordelen:**
```sql
-- 1. Traditional FK constraints
ALTER TABLE order ADD CONSTRAINT fk_order_status 
FOREIGN KEY (status_record_id) REFERENCES entity_current_status(id);

-- 2. Simpelere queries
SELECT o.*, s.sla_deadline, s.is_overdue 
FROM order o 
LEFT JOIN entity_current_status s ON o.status_record_id = s.id
WHERE o.status = 'quote_sent';

-- 3. Better data integrity
-- Can't delete status record if order references it

-- 4. Performance optimized
-- Direct JOIN without entity_type filter
```

#### **Database Schema:**
```sql
order (
  id: uuid,
  status: text,                    -- For fast queries
  status_record_id: uuid,          -- FK to status engine
  order_number: text,
  created_at: timestamp
)

contact (
  id: uuid,
  status: text,                    -- For fast queries  
  status_record_id: uuid,          -- FK to status engine
  name: text,
  contact_type: enum
)

entity_current_status (
  id: uuid,
  current_status: text,            -- Sync with entity.status
  status_since: timestamp,
  sla_deadline: timestamp,
  is_overdue: boolean,
  workflow_id: uuid
)
```

### 🔴 **Entity-Specific FK Nadelen:**

#### **1. Schema Changes Required**
```sql
-- Must modify every entity table
ALTER TABLE order ADD COLUMN status_record_id uuid;
ALTER TABLE contact ADD COLUMN status_record_id uuid;
ALTER TABLE visit ADD COLUMN status_record_id uuid;
-- etc...
```

#### **2. More Complex Setup**
```javascript
// When creating order, must also create status record
const statusRecordId = await xano.database.insert('entity_current_status', {
  current_status: 'new_lead',
  status_since: new Date(),
  sla_deadline: calculateSLA('new_lead')
});

const orderId = await xano.database.insert('order', {
  status: 'new_lead',
  status_record_id: statusRecordId,
  // other fields...
});
```

### 🟢 **Universal Approach (Huidige design)**

#### **Voordelen:**
```sql
-- 1. No entity table changes needed
-- order table stays exactly the same

-- 2. Easy to add new entities
-- Just start tracking status for new entity_type

-- 3. Flexible entity types
entity_current_status (
  entity_type: 'custom_entity',  -- Any string
  entity_id: uuid,
  current_status: text
)
```

#### **Query Example:**
```sql
-- Get orders with SLA info
SELECT o.*, s.sla_deadline, s.is_overdue
FROM order o
LEFT JOIN entity_current_status s ON (
  s.entity_type = 'order' 
  AND s.entity_id = o.id
)
WHERE o.status = 'quote_sent';
```

### 🔴 **Universal Approach Nadelen:**

#### **1. More Complex Queries**
```sql
-- Always need entity_type filter
WHERE s.entity_type = 'order' AND s.entity_id = o.id
```

#### **2. No FK Constraints**
```sql
-- Can't create traditional foreign key constraint
-- Must rely on application logic for data integrity
```

## 🎯 **Aanbeveling voor ChargeCars: Entity-Specific!**

### **Waarom Entity-Specific beter is voor jou:**

#### **1. Beperkte Entities (Stable Schema)**
- Je hebt ~6-10 entity types
- Schema is relatief stabiel
- One-time change, long-term benefit

#### **2. Performance Critical**
```sql
-- Much faster queries
SELECT o.*, s.sla_deadline 
FROM order o 
JOIN entity_current_status s ON o.status_record_id = s.id
-- vs
SELECT o.*, s.sla_deadline 
FROM order o 
JOIN entity_current_status s ON s.entity_type = 'order' AND s.entity_id = o.id
```

#### **3. Better Data Integrity**
- FK constraints prevent orphaned records
- Database-level consistency
- Easier debugging

#### **4. Simpler API Logic**
```javascript
// Much simpler join
const ordersWithSLA = xano.database.query(`
  SELECT o.*, s.sla_deadline, s.is_overdue
  FROM order o 
  LEFT JOIN entity_current_status s ON o.status_record_id = s.id
`);
```

## 🔧 **Implementation Strategy**

### **Phase 1: Add Status FK Columns**
```sql
-- Add to each entity table
ALTER TABLE order ADD COLUMN status_record_id uuid;
ALTER TABLE contact ADD COLUMN status_record_id uuid;
ALTER TABLE visit ADD COLUMN status_record_id uuid;
```

### **Phase 2: Modified Status Engine Schema**
```sql
-- Simplified - no entity_type needed
entity_current_status (
  id: uuid PRIMARY KEY,
  current_status: text,
  status_since: timestamp,
  sla_deadline: timestamp,
  is_overdue: boolean,
  workflow_id: uuid,
  created_at: timestamp
)

status_transitions (
  id: uuid PRIMARY KEY,
  status_record_id: uuid,  -- FK to entity_current_status
  from_status: text,
  to_status: text,
  transition_reason: text,
  triggered_by_contact_id: uuid,
  created_at: timestamp
)
```

### **Phase 3: Create Status Records**
```javascript
// For existing orders
const orders = await xano.database.query('SELECT id, status FROM order');

for (const order of orders) {
  const statusRecordId = await xano.database.insert('entity_current_status', {
    current_status: order.status,
    status_since: new Date(),
    sla_deadline: calculateSLA(order.status),
    is_overdue: false
  });
  
  await xano.database.update('order', order.id, {
    status_record_id: statusRecordId
  });
}
```

### **Phase 4: Update API Logic**
```javascript
// Simplified addon function
function enhance_with_sla(orders) {
  // SLA data already joined!
  return orders.map(order => ({
    ...order,
    sla_info: order.status_record_id ? {
      deadline: order.sla_deadline,
      is_overdue: order.is_overdue,
      status_since: order.status_since
    } : null
  }));
}
```

## 📊 **Query Performance Comparison**

### **Entity-Specific (Recommended):**
```sql
-- Simple JOIN
SELECT o.*, s.sla_deadline
FROM order o 
LEFT JOIN entity_current_status s ON o.status_record_id = s.id
-- Index: entity_current_status.id (primary key)
```

### **Universal (Current):**
```sql
-- Composite filter
SELECT o.*, s.sla_deadline
FROM order o 
LEFT JOIN entity_current_status s ON (
  s.entity_type = 'order' AND s.entity_id = o.id
)
-- Index needed: entity_current_status(entity_type, entity_id)
```

## ✅ **Final Recommendation**

### **Voor ChargeCars: Go Entity-Specific!**

**Redenen:**
1. **Performance**: Simpelere, snellere queries
2. **Integrity**: Database FK constraints  
3. **Simplicity**: Makkelijker te onderhouden
4. **Scale**: Perfect voor je stabiele entity set

**Migration Plan:**
1. Add `status_record_id` columns
2. Create status records voor existing data
3. Update API queries
4. Remove entity_type logic

**Result: Beter performance + cleaner architecture!** 🚀 