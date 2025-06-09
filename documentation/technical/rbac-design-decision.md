# RBAC Design Decision: Database vs Configuration

**Datum**: 2025-01-18
**Beslissing**: Database-driven RBAC approach evaluatie

## 🤔 **Je Vraag: Database-driven RBAC?**

### **Voorgestelde Database Structure:**
```sql
-- Entity types table
entity_types (
  id INT,
  name VARCHAR(50),        -- "orders", "contacts", etc.
  table_name VARCHAR(50),  -- "order", "contact", etc.
  junction_table VARCHAR(50), -- "order_contacts", etc.
  document_types JSON     -- ["invoice", "contract", "email"]
)

-- Role permissions junction
role_entity_permissions (
  user_role_id INT,
  entity_type_id INT, 
  permission VARCHAR(50),  -- "read_own", "create_own", etc.
  conditions JSON         -- {"scope": "own", "filters": {...}}
)
```

## ⚖️ **Pros vs Cons Analysis**

### 🟢 **Database-driven RBAC Voordelen:**

#### **1. Runtime Flexibility**
```javascript
// Admin kan permissions wijzigen zonder code deploy
INSERT INTO role_entity_permissions 
VALUES (sales_role_id, orders_entity_id, 'update_own')

// Nieuwe entity types toevoegen
INSERT INTO entity_types 
VALUES (null, 'maintenance_requests', 'maintenance_request', 'maintenance_contacts')
```

#### **2. Admin Interface Mogelijk**
- Permissions matrix in admin panel
- Role management voor eindgebruikers
- Audit trail van permission changes
- Self-service permission requests

#### **3. Complex Permission Rules**
```sql
-- Advanced conditions possible
{
  "scope": "own",
  "filters": {
    "status": ["active", "pending"],
    "date_range": "last_30_days",
    "department": "sales"
  },
  "field_restrictions": ["hide_financial_data"]
}
```

#### **4. Document Type Management**
```sql
-- Verschillende document types per entity
entity_types: {
  "orders": ["invoice", "contract", "technical_spec"],
  "contacts": ["vcard", "agreement", "notes"],
  "visits": ["report", "photos", "signature"]
}
```

### 🔴 **Database-driven RBAC Nadelen:**

#### **1. Complexity Explosion**
- Meer tables = meer joins = meer complexity
- Permission checking wordt multi-query operation
- Debugging wordt veel moeilijker
- Cache invalidation complexity

#### **2. Performance Impact**
```javascript
// Current: 1 query met hardcoded permissions
SELECT * FROM orders WHERE id IN (accessible_ids)

// Database-driven: 4+ queries
1. Get user roles
2. Get entity permissions  
3. Get entity config
4. Apply filters
5. Get actual data
```

#### **3. Configuration Nightmare**
- Chicken-egg problem bij setup
- Complex data migration scripts
- Harder to version control permissions
- Risk of misconfiguration breaking access

## 🎯 **ChargeCars Context Analysis**

### **Your Current Entities:**
- `orders` (core business)
- `contacts` (relationship management)  
- `organizations` (channel hierarchy)
- `visits` (field operations)
- `invoices` (financial)
- `communication_messages` (support)

### **Growth Expectations:**
- **Limited entity growth** - je hebt waarschijnlijk max 10-15 entities
- **High permission complexity** - channel hierarchy is complex
- **Admin interface need** - partners willen self-service
- **Audit requirements** - financial compliance

## 💡 **Aanbeveling: Hybrid Approach**

### **Phase 1: Configuration-based (Now)**
```javascript
// Keep current approach for speed
const ENTITY_CONFIG = {
  orders: {
    junction_table: 'order_contacts',
    permissions: ['read_own', 'create_own', 'update_own'],
    document_types: ['invoice', 'contract'],
    field_restrictions: {
      end_customer: ['hide_commission', 'hide_cost_price'],
      intermediary: ['hide_financial_data']
    }
  }
}
```

### **Phase 2: Database Enhancement (Later)**
```sql
-- Add configuration tables for future flexibility
CREATE TABLE entity_configurations (
  entity_type VARCHAR(50),
  config JSON,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Store permission overrides
CREATE TABLE permission_overrides (
  user_role_id INT,
  entity_type VARCHAR(50), 
  permission_overrides JSON
)
```

## 🚀 **Immediate Recommendation: Start Simple**

### **Why Configuration-based First:**

#### **1. Speed to Market**
- Get RBAC working in 1 week vs 1 month
- Test with real users quickly
- Iterate based on feedback

#### **2. Proven Entities**
- Your entity list is stable
- Permissions patterns are predictable
- No need for runtime entity creation

#### **3. Performance Critical**
- Orders access moet snel zijn
- Channel queries zijn al complex
- Add database-driven permissions = more latency

### **Configuration Example:**
```javascript
// 02-documentation/rbac-config.js
export const RBAC_CONFIG = {
  entities: {
    orders: {
      table: 'order',
      junction_table: 'order_contacts',
      permissions: ['read_own', 'create_own', 'update_own'],
      document_types: ['invoice', 'contract', 'technical_specification'],
      role_restrictions: {
        account: { access: 'full' },
        end_customer: { 
          hide_fields: ['total_cost', 'commission_amount'],
          allowed_documents: ['invoice', 'technical_specification']
        },
        intermediary: { 
          hide_fields: ['cost_price', 'commission_details'],
          allowed_documents: ['contract']
        }
      }
    },
    contacts: {
      table: 'contact',
      junction_table: 'contact_relationships', // Als je die toevoegt
      permissions: ['read_own', 'update_own'],
      document_types: ['vcard', 'agreement'],
      role_restrictions: {
        account: { access: 'full' },
        end_customer: { hide_fields: ['internal_notes'] }
      }
    }
  }
}
```

## 📊 **Migration Path (Als je later database-driven wilt)**

### **Step 1: Extract to Config**
```javascript
// Move hardcoded rules to config file
const entityConfig = RBAC_CONFIG.entities[entity_type]
```

### **Step 2: Add Override Table**
```sql
-- Allow database overrides
CREATE TABLE rbac_overrides (
  entity_type VARCHAR(50),
  user_role_id INT,
  override_config JSON
)
```

### **Step 3: Hybrid Lookup**
```javascript
// Check database overrides first, fallback to config
const permissions = await getPermissionOverrides(user_role, entity_type) 
                 || RBAC_CONFIG.entities[entity_type]
```

## ✅ **Conclusion: Start Configuration-based**

### **Reasons:**
1. **Speed**: Get working RBAC in days, not weeks
2. **Simplicity**: Debug and maintain easily  
3. **Performance**: Minimal database overhead
4. **Flexibility**: Can migrate to database-driven later
5. **Risk**: Low risk of over-engineering

### **When to Consider Database-driven:**
- [ ] You have 20+ entity types
- [ ] Permissions change weekly
- [ ] End users need to configure permissions
- [ ] Complex audit requirements
- [ ] Multi-tenant with different permission sets

**For ChargeCars: Configuration-based is perfect for your current scale!**

## 🎯 **Next Steps**

1. **Implement** configuration-based RBAC now
2. **Monitor** complexity and change frequency
3. **Evaluate** database approach in 6 months
4. **Migrate** only if you hit real limitations

**Want me to help build the configuration-based RBAC first?** 🚀 