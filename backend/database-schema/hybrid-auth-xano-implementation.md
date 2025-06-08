# ChargeCars V2 - Hybrid Auth Implementation in Xano
**Created**: June 3, 2025  
**Status**: Implementation Guide  
**Focus**: Minimal roles + flexible scopes in Xano

---

## 🎯 **QUICK START IMPLEMENTATION**

### Step 1: Create user_account Table in Xano

```yaml
Table: user_account
Fields:
  - id: uuid (auto)
  - contact_id: uuid (FK to contact, unique)
  - email: text (unique, required)
  - password: password (Xano password type)
  
  # Minimal role
  - base_role: enum 
    Values: ['ADMIN', 'MANAGER', 'INTERNAL', 'EXTERNAL', 'TECHNICIAN']
    Default: 'INTERNAL'
  
  # Flexible scopes  
  - scopes: text[] (array)
    Default: []
  
  # Organization access
  - primary_organization_id: uuid (FK to organization)
  - allowed_organizations: uuid[] 
    Default: []
  
  # Security
  - is_active: boolean (default: true)
  - last_login: timestamp
  
  # Standard timestamps
  - created_at: timestamp (auto)
  - updated_at: timestamp (auto)
```

---

## 🔧 **SCOPE MANAGEMENT OPTIONS**

### Option 1: Simple Array (Recommended to Start)
Just use the `scopes` text array field:
```javascript
// Example user record
{
  "base_role": "INTERNAL",
  "scopes": ["sales.quotes", "sales.orders", "support.tickets"]
}
```

### Option 2: Enum Field (If You Want Validation)
Create an enum field with all possible scopes:
```yaml
- scopes: enum[] (multi-select)
  Values: [
    'sales.quotes',
    'sales.orders', 
    'sales.pricing',
    'sales.reports',
    'support.tickets',
    'support.escalate',
    'support.communication',
    'finance.invoices',
    'finance.payments',
    'finance.reports',
    'finance.approve',
    'operations.planning',
    'operations.dispatch',
    'technical.installations',
    'technical.photos',
    'admin.users',
    'admin.settings',
    'api.access',
    'partner.portal'
  ]
```

### Option 3: Reference Table (Most Flexible)
Create a separate `capability_scope` table:
```yaml
Table: capability_scope
Fields:
  - id: uuid
  - scope_code: text (unique)
  - scope_name: text
  - description: text
  - category: enum ['sales', 'support', 'finance', 'operations', 'technical', 'admin', 'special']
  - is_active: boolean
```

---

## 🚀 **AUTHENTICATION FUNCTIONS**

### 1. Enhanced Login Function
```yaml
Function: auth_login
Path: POST /auth/login
Function Stack:
  1. Input:
     - email: text (required)
     - password: text (required)
  
  2. Query: Get user by email
     - Include contact
     - Include organization
  
  3. Verify Password (Xano utility)
  
  4. Create Variable: permissions
     Value: Merge base role permissions with scopes
  
  5. Generate Auth Token:
     Payload:
       - user_id
       - email  
       - base_role
       - scopes (array)
       - organization_id
       - allowed_organizations
  
  6. Update: user_account
     - last_login: NOW()
  
  7. Return:
     - authToken
     - user object with expanded permissions
```

### 2. Check Capability Function
```yaml
Function: check_capability
Type: Utility Function
Inputs:
  - required_capability: text
  - user_scopes: text[] (from auth context)
  - base_role: text (from auth context)
  
Function Stack:
  1. Conditional: If base_role = 'ADMIN'
     Return: true (admins can do everything)
  
  2. Conditional: If required_capability in user_scopes
     Return: true
  
  3. Create Variable: capability_parts
     Split required_capability by '.'
  
  4. Loop through user_scopes:
     - If scope ends with '*' and matches prefix
     - Return: true
  
  5. Return: false
```

### 3. Enhanced Auth Middleware
```yaml
Function: auth_middleware_hybrid
Function Stack:
  1. Get Auth Token (Xano utility)
  
  2. Verify Auth Token (Xano utility)
     Extract payload
  
  3. Set Variables from token:
     - auth_user_id
     - auth_base_role
     - auth_scopes (array)
     - auth_organization_id
     - auth_allowed_organizations
  
  4. Create Variable: auth_permissions
     Value: Combine base role + scopes into full permission list
  
  5. Continue or Error
```

---

## 📊 **PRACTICAL PERMISSION CHECKS**

### Example: Order Access
```yaml
Function: can_access_order
Inputs:
  - order_id: uuid
  - action: text (view/edit/delete)
  
Function Stack:
  1. Get auth context variables
  
  2. Query: Get order by ID
  
  3. Create Variable: required_capability
     Value: CONCAT('sales.orders.', action)
  
  4. Check base role:
     - If EXTERNAL and action != 'view': Return false
     - If TECHNICIAN and action = 'delete': Return false
  
  5. Check organization access:
     - If order.organization_id not in allowed_orgs: Return false
  
  6. Run Function: check_capability
     Input: required_capability
  
  7. Return result
```

### Example: Quote Pricing Override
```yaml
Function: can_override_pricing
Function Stack:
  1. Get auth context
  
  2. Conditional checks:
     - If base_role = 'ADMIN': Return true
     - If base_role = 'MANAGER' AND has 'sales.pricing': Return true
     - If base_role = 'INTERNAL' AND has 'sales.pricing': 
       - Check if within limits (e.g., max 10% discount)
     - Else: Return false
```

---

## 🔄 **DEFAULT SCOPE ASSIGNMENT**

### Create Function: assign_default_scopes
```yaml
Function: assign_default_scopes
Inputs:
  - base_role: text
  - contact_type: text (from contact record)
  
Function Stack:
  1. Create Variable: default_scopes
     Value: []
  
  2. Switch on base_role:
     ADMIN:
       - Add all scopes or use wildcard
     MANAGER:
       - Add: sales.quotes, sales.orders, sales.reports
       - Add: operations.planning, operations.reports
       - Add: support.escalate, finance.reports
     INTERNAL:
       - Add: sales.quotes, sales.orders
       - Add: support.tickets
       - If contact_type = 'support': Add support.communication
     EXTERNAL:
       - Add: support.tickets (create only)
       - If partner: Add partner.portal
     TECHNICIAN:
       - Add: technical.installations, technical.photos
       - Add: technical.checklists
  
  3. Return: default_scopes array
```

---

## 🎨 **UI/UX IMPLEMENTATION**

### User Profile Endpoint
```yaml
Function: get_user_profile
Path: GET /auth/profile
Function Stack:
  1. Run: auth_middleware_hybrid
  
  2. Query: Get user_account with relations
  
  3. Create Variable: available_scopes
     Value: All possible scopes for their role
  
  4. Create Variable: active_scopes
     Value: Currently assigned scopes
  
  5. Return:
     - user details
     - base_role
     - active_scopes
     - available_scopes (for UI checkboxes)
```

### Update User Scopes
```yaml
Function: update_user_scopes
Path: PATCH /users/{user_id}/scopes
Function Stack:
  1. Check permission: admin.users or self
  
  2. Input:
     - scopes: text[] (new scope array)
  
  3. Validate scopes:
     - Check each scope exists
     - Check no conflicts
     - Check role can have scope
  
  4. Update: user_account
     Set scopes = input.scopes
  
  5. Return updated user
```

---

## 🚦 **MIGRATION FROM SMARTSUITE**

### Step 1: Map Existing Access Levels
```javascript
const ACCESS_LEVEL_TO_ROLE = {
  'owner': 'ADMIN',
  'admin': 'ADMIN',
  'manager': 'MANAGER',
  'standard': 'INTERNAL',
  'view_only': 'EXTERNAL'
};

const CONTACT_TYPE_TO_SCOPES = {
  'internal': ['sales.quotes', 'sales.orders', 'support.tickets'],
  'partner': ['partner.portal', 'sales.orders'],
  'customer': ['support.tickets'],
  'supplier': ['finance.invoices'],
  'support': ['support.tickets', 'support.communication']
};
```

### Step 2: Migration Function
```yaml
Function: migrate_users_from_contacts
Function Stack:
  1. Query All: contact
     Where email is not null
  
  2. Loop through contacts:
     - Map access_level to base_role
     - Assign default scopes based on contact_type
     - Create user_account record
  
  3. Log results
```

---

## ✅ **TESTING CHECKLIST**

- [ ] Create test users with each base role
- [ ] Assign various scope combinations
- [ ] Test login returns correct JWT payload
- [ ] Test capability checks work correctly
- [ ] Test organization access restrictions
- [ ] Test scope-based UI rendering
- [ ] Test admin can access everything
- [ ] Test external users have limited access

---

## 📝 **EXAMPLE SCOPE COMBINATIONS**

### All-rounder (Marie)
```json
{
  "base_role": "INTERNAL",
  "scopes": [
    "sales.quotes",
    "sales.orders",
    "support.tickets",
    "support.communication",
    "operations.planning"
  ]
}
```

### Finance-focused Manager (Peter)
```json
{
  "base_role": "MANAGER",
  "scopes": [
    "finance.invoices",
    "finance.payments",
    "finance.reports",
    "finance.approve",
    "sales.reports"
  ]
}
```

### Field Tech with Admin (Johan)
```json
{
  "base_role": "TECHNICIAN",
  "scopes": [
    "technical.installations",
    "technical.photos",
    "sales.quotes",
    "support.tickets",
    "operations.planning"
  ]
}
```

---

**Start simple with the array approach, then expand as needed. The beauty is you can add new scopes without changing the schema!** 