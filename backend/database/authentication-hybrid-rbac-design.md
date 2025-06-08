# ChargeCars V2 - Hybrid RBAC with Minimal Roles & Scopes
**Created**: June 3, 2025  
**Status**: Proposed Design  
**Approach**: Minimal base roles + flexible capability scopes

---

## 🎯 **DESIGN PHILOSOPHY**

Instead of rigid hierarchical roles, use:
1. **Base Roles**: Determine general access level
2. **Capability Scopes**: Grant specific functional permissions
3. **Flexible Assignment**: Users can have multiple scopes

This allows a sales person to also handle support, or a technician to create quotes.

---

## 👥 **BASE ROLES (MINIMAL)**

```
ADMIN      - Full system access, can manage users
MANAGER    - Can approve and oversee operations  
INTERNAL   - Internal staff member with base access
EXTERNAL   - External party (customer, partner)
TECHNICIAN - Field worker with limited office access
```

### Role Mapping from SmartSuite:
- `owner` → `ADMIN`
- `admin` → `ADMIN`
- `manager` → `MANAGER`
- `standard` → `INTERNAL`
- `view_only` → `EXTERNAL`

---

## 🔧 **CAPABILITY SCOPES**

### Sales Capabilities
- `sales.quotes` - Create and manage quotes
- `sales.orders` - Create and manage orders
- `sales.pricing` - Override pricing within limits
- `sales.reports` - View sales dashboards

### Support Capabilities
- `support.tickets` - Handle support tickets
- `support.escalate` - Escalate issues
- `support.communication` - Access customer communication
- `support.knowledge` - Manage knowledge base

### Financial Capabilities
- `finance.invoices` - Manage invoices
- `finance.payments` - Process payments
- `finance.reports` - View financial reports
- `finance.approve` - Approve financial transactions

### Operations Capabilities
- `operations.planning` - Schedule installations
- `operations.dispatch` - Assign technicians
- `operations.inventory` - Manage inventory
- `operations.reports` - View operational dashboards

### Technical Capabilities
- `technical.installations` - Perform installations
- `technical.maintenance` - Service equipment
- `technical.photos` - Upload completion photos
- `technical.checklists` - Complete field forms

### Administrative Capabilities
- `admin.users` - Manage user accounts
- `admin.organizations` - Manage organizations
- `admin.settings` - System configuration
- `admin.integrations` - Manage integrations

### Special Capabilities
- `api.access` - API integration access
- `partner.portal` - Partner-specific features
- `dealer.operations` - Dealer-specific operations
- `multi.entity` - Access multiple business entities

---

## 🏗️ **DATABASE SCHEMA**

### Enhanced user_account Table
```sql
CREATE TABLE user_account (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES contact(id) UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  
  -- Base role (simple)
  base_role text NOT NULL DEFAULT 'INTERNAL' 
    CHECK (base_role IN ('ADMIN', 'MANAGER', 'INTERNAL', 'EXTERNAL', 'TECHNICIAN')),
  
  -- Capability scopes (flexible)
  scopes text[] DEFAULT '{}',
  
  -- Organization scope
  primary_organization_id uuid REFERENCES organization(id),
  allowed_organizations uuid[] DEFAULT '{}', -- For multi-org access
  
  -- Security
  is_active boolean DEFAULT true,
  last_login timestamp,
  failed_login_attempts int DEFAULT 0,
  locked_until timestamp,
  
  -- Tokens
  auth_token text,
  token_expires_at timestamp,
  refresh_token text,
  refresh_token_expires_at timestamp,
  
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_user_account_email ON user_account(email);
CREATE INDEX idx_user_account_token ON user_account(auth_token);
CREATE INDEX idx_user_account_scopes ON user_account USING GIN(scopes);
```

### Optional: Scope Definition Table
```sql
CREATE TABLE capability_scope (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope_code text UNIQUE NOT NULL,
  scope_name text NOT NULL,
  description text,
  category text, -- 'sales', 'support', 'finance', etc.
  
  -- What this scope allows
  permissions text[], -- Detailed permissions
  
  -- Dependencies
  requires_scopes text[], -- Other scopes required
  conflicts_with text[], -- Scopes that conflict
  
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT NOW()
);

-- Pre-populate with standard scopes
INSERT INTO capability_scope (scope_code, scope_name, category, permissions) VALUES
('sales.quotes', 'Quote Management', 'sales', ARRAY['quotes.create', 'quotes.edit', 'quotes.view']),
('sales.orders', 'Order Management', 'sales', ARRAY['orders.create', 'orders.edit', 'orders.view']),
('support.tickets', 'Ticket Handling', 'support', ARRAY['tickets.create', 'tickets.edit', 'tickets.view']),
-- etc...
```

---

## 🔐 **PERMISSION CHECKING**

### Simple Implementation
```javascript
function hasCapability(user, capability) {
  // Admin bypass
  if (user.base_role === 'ADMIN') return true;
  
  // Check if user has the specific scope
  return user.scopes.includes(capability);
}

function hasPermission(user, resource, action) {
  // Map resource+action to required capability
  const requiredCapability = getRequiredCapability(resource, action);
  
  return hasCapability(user, requiredCapability);
}
```

### Advanced Checking with Context
```javascript
function canAccessResource(user, resource, action, context = {}) {
  // 1. Check base role restrictions
  if (user.base_role === 'EXTERNAL' && action !== 'view') {
    return false; // External users can only view
  }
  
  // 2. Check organization scope
  if (context.organization_id) {
    if (!isAllowedOrganization(user, context.organization_id)) {
      return false;
    }
  }
  
  // 3. Check capability
  const capability = `${resource}.${action}`;
  if (!hasCapability(user, capability)) {
    // Check if any of user's scopes grant this permission
    const userPermissions = getUserPermissions(user);
    return userPermissions.includes(`${resource}.${action}`);
  }
  
  return true;
}
```

---

## 📊 **EXAMPLE USER CONFIGURATIONS**

### Sales + Support Person
```json
{
  "email": "marie@chargecars.nl",
  "base_role": "INTERNAL",
  "scopes": [
    "sales.quotes",
    "sales.orders",
    "support.tickets",
    "support.communication"
  ]
}
```

### Manager with Limited Finance
```json
{
  "email": "peter@chargecars.nl", 
  "base_role": "MANAGER",
  "scopes": [
    "sales.quotes",
    "sales.orders",
    "sales.pricing",
    "sales.reports",
    "operations.planning",
    "finance.reports"  // Can view but not approve
  ]
}
```

### Technician with Quote Creation
```json
{
  "email": "johan@chargecars.nl",
  "base_role": "TECHNICIAN",
  "scopes": [
    "technical.installations",
    "technical.photos",
    "sales.quotes",  // Can create quotes on-site
    "support.tickets" // Can create support tickets
  ]
}
```

### Partner User
```json
{
  "email": "contact@partner.com",
  "base_role": "EXTERNAL",
  "scopes": [
    "partner.portal",
    "sales.orders",  // Can create orders for their customers
    "api.access"
  ],
  "allowed_organizations": ["partner-org-uuid"]
}
```

---

## 🚀 **IMPLEMENTATION IN XANO**

### Step 1: Update user_account Table
```yaml
Add fields:
- base_role: text (with validation)
- scopes: text[] (array of strings)
- primary_organization_id: uuid
- allowed_organizations: uuid[]
```

### Step 2: Create Scope Management Functions

#### Get User Capabilities
```yaml
Function: get_user_capabilities
Inputs:
  - user_id: uuid
Function Stack:
  1. Query user_account by ID
  2. If base_role = 'ADMIN', return ['*']
  3. Else return user.scopes
  4. Optionally expand to include inherited permissions
```

#### Check Capability
```yaml
Function: check_capability
Inputs:
  - capability: text
  - user_id: uuid (optional, uses auth context)
Function Stack:
  1. Get user from context or ID
  2. Get user capabilities
  3. Check if capability in list or wildcard match
  4. Return boolean
```

### Step 3: Update JWT Payload
```json
{
  "user_id": "...",
  "email": "user@example.com",
  "base_role": "INTERNAL",
  "scopes": ["sales.quotes", "support.tickets"],
  "organization_id": "...",
  "allowed_organizations": ["..."],
  "exp": 1234567890
}
```

---

## 🎯 **MIGRATION STRATEGY**

### From Current System:
1. Map existing roles to base roles
2. Analyze user activities to assign initial scopes
3. Allow users/managers to request additional scopes

### Suggested Initial Scope Assignment:
```javascript
const DEFAULT_SCOPES = {
  'ADMIN': ['*'], // All capabilities
  'MANAGER': [
    'sales.quotes', 'sales.orders', 'sales.reports',
    'operations.planning', 'operations.reports',
    'support.escalate', 'finance.reports'
  ],
  'INTERNAL': [
    'sales.quotes', 'sales.orders',
    'support.tickets'
  ],
  'EXTERNAL': [
    'support.tickets' // Can only create tickets
  ],
  'TECHNICIAN': [
    'technical.installations',
    'technical.photos',
    'technical.checklists'
  ]
};
```

---

## ✅ **BENEFITS OF THIS APPROACH**

1. **Flexibility**: Easy to add capabilities without changing roles
2. **Granular Control**: Precise permission management
3. **Business Aligned**: Matches your overlapping responsibilities
4. **Easy to Understand**: Clear what each scope allows
5. **Scalable**: Can add new scopes without schema changes
6. **Auditable**: Clear record of who can do what

---

## 📱 **UI CONSIDERATIONS**

### User Management Screen
```
User: Marie van den Berg
Email: marie@chargecars.nl
Base Role: [INTERNAL ▼]

Capabilities:
☑ Sales - Quote Management
☑ Sales - Order Management
☐ Sales - Pricing Override
☑ Support - Ticket Handling
☑ Support - Customer Communication
☐ Finance - View Reports
☐ Operations - Planning

[Save Changes]
```

### Scope Request Flow
Users can request additional scopes:
1. User selects needed capability
2. Provides business justification
3. Manager approves/denies
4. Scope automatically added

---

**This hybrid approach gives you the best of both worlds: simple base roles for general access control, and flexible scopes for specific functionality!** 