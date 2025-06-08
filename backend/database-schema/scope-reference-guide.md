# ChargeCars V2 - Scope Reference Guide
**Created**: June 3, 2025  
**Status**: Reference Documentation  
**Purpose**: Complete list of all capability scopes

---

## 📊 **SCOPE CATEGORIES**

### 🛒 **Sales Scopes**
| Scope Code | Name | Description | Typical Users |
|------------|------|-------------|---------------|
| `sales.quotes` | Quote Management | Create, edit, view quotes | Sales, Support, Technicians |
| `sales.orders` | Order Management | Create, edit, view orders | Sales, Support |
| `sales.pricing` | Pricing Override | Override standard pricing (with limits) | Sales Manager, Senior Sales |
| `sales.reports` | Sales Reports | View sales dashboards and analytics | Managers, Senior Sales |
| `sales.customers` | Customer Management | Create and edit customer records | Sales, Support |

### 📞 **Support Scopes**
| Scope Code | Name | Description | Typical Users |
|------------|------|-------------|---------------|
| `support.tickets` | Ticket Handling | Create and manage support tickets | Support, Sales, Technicians |
| `support.escalate` | Escalation Rights | Escalate tickets to higher level | Senior Support, Managers |
| `support.communication` | Customer Comms | Access all customer communication | Support Team |
| `support.knowledge` | Knowledge Base | Manage KB articles and FAQs | Support, Documentation Team |
| `support.remote` | Remote Access | Remote support capabilities | Senior Support |

### 💰 **Finance Scopes**
| Scope Code | Name | Description | Typical Users |
|------------|------|-------------|---------------|
| `finance.invoices` | Invoice Management | Create and send invoices | Finance, Admin |
| `finance.payments` | Payment Processing | Record and process payments | Finance Team |
| `finance.reports` | Financial Reports | View financial dashboards | Managers, Accountants |
| `finance.approve` | Financial Approval | Approve invoices, refunds, credits | Finance Manager, CFO |
| `finance.export` | Export Financial Data | Export for accounting software | Accountants |
| `finance.credit` | Credit Management | Set credit limits, payment terms | Finance Manager |

### 🔧 **Operations Scopes**
| Scope Code | Name | Description | Typical Users |
|------------|------|-------------|---------------|
| `operations.planning` | Installation Planning | Schedule installations | Planners, Managers |
| `operations.dispatch` | Technician Dispatch | Assign technicians to jobs | Dispatchers, Planners |
| `operations.inventory` | Inventory Management | Manage stock and supplies | Warehouse, Operations |
| `operations.reports` | Operations Reports | View operational dashboards | Managers |
| `operations.routes` | Route Planning | Optimize technician routes | Dispatchers |

### 🔨 **Technical Scopes**
| Scope Code | Name | Description | Typical Users |
|------------|------|-------------|---------------|
| `technical.installations` | Perform Installations | Execute field installations | Technicians |
| `technical.maintenance` | Maintenance Work | Service and maintain equipment | Technicians |
| `technical.photos` | Upload Photos | Document installation completion | Technicians |
| `technical.checklists` | Complete Checklists | Fill installation forms | Technicians |
| `technical.diagnostics` | Run Diagnostics | Technical troubleshooting | Senior Technicians |

### ⚙️ **Administrative Scopes**
| Scope Code | Name | Description | Typical Users |
|------------|------|-------------|---------------|
| `admin.users` | User Management | Create, edit, delete users | Admins, HR |
| `admin.organizations` | Org Management | Manage organization records | Admins |
| `admin.settings` | System Settings | Configure system parameters | System Admins |
| `admin.integrations` | Integration Config | Manage API integrations | IT, System Admins |
| `admin.audit` | Audit Logs | View system audit trails | Admins, Compliance |

### 🌐 **Special Scopes**
| Scope Code | Name | Description | Typical Users |
|------------|------|-------------|---------------|
| `api.access` | API Access | Use system APIs | Integration Partners |
| `api.webhooks` | Webhook Management | Configure webhooks | Developers |
| `partner.portal` | Partner Portal | Access partner features | Partners, Dealers |
| `dealer.operations` | Dealer Functions | Dealer-specific operations | Dealer Staff |
| `multi.entity` | Multi-Entity Access | Switch between business entities | Senior Staff |

---

## 🎯 **COMMON ROLE COMBINATIONS**

### Sales Representative
```javascript
base_role: "INTERNAL"
scopes: [
  "sales.quotes",
  "sales.orders",
  "sales.customers",
  "support.tickets"
]
```

### Support Agent
```javascript
base_role: "INTERNAL"
scopes: [
  "support.tickets",
  "support.communication",
  "support.knowledge",
  "sales.quotes"  // For upselling
]
```

### Field Technician
```javascript
base_role: "TECHNICIAN"
scopes: [
  "technical.installations",
  "technical.photos",
  "technical.checklists",
  "support.tickets"  // Report issues
]
```

### Office Manager
```javascript
base_role: "MANAGER"
scopes: [
  "sales.quotes",
  "sales.orders",
  "sales.reports",
  "operations.planning",
  "operations.reports",
  "finance.reports",
  "admin.users"
]
```

### Finance Manager
```javascript
base_role: "MANAGER"
scopes: [
  "finance.invoices",
  "finance.payments",
  "finance.reports",
  "finance.approve",
  "finance.credit",
  "sales.reports"
]
```

### Partner User
```javascript
base_role: "EXTERNAL"
scopes: [
  "partner.portal",
  "sales.orders",    // Create orders only
  "support.tickets", // Create tickets only
  "api.access"
]
```

---

## 🔒 **SCOPE RESTRICTIONS BY BASE ROLE**

### ADMIN
- Can have any scope
- Automatically has all permissions

### MANAGER
- Can have any scope except:
  - `admin.settings` (system-level only)
  - `multi.entity` (unless specifically granted)

### INTERNAL
- Cannot have:
  - `admin.*` scopes (except `admin.audit`)
  - `finance.approve`
  - `finance.credit`

### EXTERNAL
- Limited to:
  - `support.tickets` (create only)
  - `partner.portal`
  - `dealer.operations`
  - `api.access`
  - Read-only access to own data

### TECHNICIAN
- Limited to:
  - `technical.*` scopes
  - `support.tickets` (create only)
  - `sales.quotes` (if trained)
  - Read access to assigned work

---

## 📝 **IMPLEMENTATION NOTES**

1. **Scope Inheritance**: Some scopes automatically include others:
   - `sales.orders` includes `sales.quotes` (view)
   - `finance.approve` includes `finance.reports`
   - `operations.dispatch` includes `operations.planning` (view)

2. **Context-Sensitive**: Some scopes behave differently based on context:
   - `support.tickets` - EXTERNAL users can only create, not view all
   - `sales.orders` - Partners can only create for their customers
   - `finance.reports` - Scope limited by organization access

3. **Combinable**: Scopes work together:
   - `sales.quotes` + `sales.pricing` = Can create quotes with custom pricing
   - `support.tickets` + `support.escalate` = Full support capabilities
   - `operations.planning` + `operations.dispatch` = Complete scheduling control

---

**Remember**: Start with minimal scopes and add as needed. It's easier to grant additional capabilities than to revoke them! 