# ChargeCars V2 - Table Tags Structure & Organization
**Comprehensive Database Table Organization System**  
*Updated: 31 mei 2025*

---

## 🏷️ **TAG CATEGORIES OVERVIEW**

### **Purpose of Tags**
- **Filtering**: Quickly find related tables by functionality
- **Development Workflow**: Organize work by system components  
- **Team Coordination**: Allow different teams to focus on their domains
- **Migration Planning**: Group tables for phased implementation

### **Tag Strategy**
- **Overlapping Categories**: Tables can belong to multiple tags
- **Hierarchical Organization**: Main categories with subcategories
- **Functional Grouping**: Based on business processes
- **Technical Classification**: Based on system architecture

---

## 📊 **COMPLETE TABLE TAG ASSIGNMENTS**

### **🏢 CRM - Customer Relationship Management**
```
Tables: organizations, contacts, addresses, customer_feedback
Use Case: Customer and partner management, contact data, satisfaction tracking
Development Priority: Core system foundation
```

| Table | Additional Tags | Priority |
|-------|----------------|----------|
| `organization` | core, infrastructure | High |
| `contact` | core, crm, authentication | High |
| `address` | infrastructure, orders | Medium |
| `customer_feedback` | analytics, orders | Low |

### **🛒 ORDERS - Order Lifecycle Management**
```
Tables: orders, quotes, line_items, order_status_history, sign_offs, sign_off_line_items
Use Case: Complete order processing from quote to completion
Development Priority: Core business logic
```

| Table | Additional Tags | Priority |
|-------|----------------|----------|
| `order` | core, crm, financial | High |
| `quote` | orders, crm | High |
| `line_item` | articles, orders, financial | High |
| `order_status_history` | audit, orders, analytics | Medium |
| `sign_off` | workflow, orders, compliance | Medium |
| `sign_off_line_item` | workflow, orders | Low |

### **📦 ARTICLES - Products & Inventory**
```
Tables: articles, article_components, article_inventory, line_items
Use Case: Product catalog, inventory management, component tracking
Development Priority: Core product management
```

| Table | Additional Tags | Priority |
|-------|----------------|----------|
| `article` | core, inventory, orders | High |
| `article_component` | articles, inventory | Medium |
| `article_inventory` | articles, operations, real-time | High |
| `line_item` | orders, financial, articles | High |

### **📞 COMMUNICATIONS - Multi-channel Communication**
```
Tables: communication_channels, communication_threads, communication_messages, communication_templates, internal_tasks
Use Case: Unified communication hub (email, WhatsApp, internal)
Development Priority: Customer experience enhancement
```

| Table | Additional Tags | Priority |
|-------|----------------|----------|
| `communication_channel` | infrastructure, integrations | Medium |
| `communication_thread` | communications, crm | High |
| `communication_message` | communications, notifications | High |
| `communication_template` | infrastructure, communications | Low |
| `internal_task` | workflow, communications, operations | High |

### **🔔 NOTIFICATIONS - Real-time Notification System**
```
Tables: user_notifications, notification_preferences
Use Case: In-app notifications with external delivery (email, Teams, WhatsApp)
Development Priority: User experience enhancement
```

| Table | Additional Tags | Priority |
|-------|----------------|----------|
| `user_notifications` | notifications, communications, real-time | High |
| `notification_preference` | notifications, authentication | Medium |

### **🔧 INSTALLATIONS - Field Operations**
```
Tables: visits, work_orders, installation_teams, installation_performance, team_vehicle_assignments, vehicles, service_regions, daily_team_compositions, technician_absence
Use Case: Field work, team management, installation tracking
Development Priority: Operations optimization
```

| Table | Additional Tags | Priority |
|-------|----------------|----------|
| `visit` | installations, orders, operations | High |
| `work_order` | installations, operations, compliance | High |
| `installation_team` | operations, installations | Medium |
| `installation_performance` | analytics, installations, operations | Low |
| `team_vehicle_assignment` | operations, installations | Medium |
| `vehicle` | operations, installations | Medium |
| `service_region` | operations, installations | Low |
| `daily_team_composition` | operations, installations | High |
| `technician_absence` | operations, installations, workflow | High |

### **💰 FINANCIAL - Financial Management**
```
Tables: invoices, payments, partner_commissions, line_items
Use Case: Billing, payments, commission tracking, financial reporting
Development Priority: Revenue management
```

| Table | Additional Tags | Priority |
|-------|----------------|----------|
| `invoice` | financial, orders, crm | High |
| `payment` | financial, orders | High |
| `partner_commission` | financial, crm, analytics | Medium |
| `line_item` | orders, articles, financial | High |

### **📋 FORMS - Intake & Form Management**
```
Tables: intake_forms, form_field_templates, form_submissions, submission_line_items, submission_files, form_analytics
Use Case: Dynamic form builder, customer intake, data collection
Development Priority: Customer onboarding improvement
```

| Table | Additional Tags | Priority |
|-------|----------------|----------|
| `intake_form` | forms, infrastructure | Medium |
| `form_field_template` | forms, infrastructure | Low |
| `form_submission` | forms, crm, orders | High |
| `submission_line_item` | forms, orders, articles | Medium |
| `submission_file` | forms, infrastructure | Medium |
| `form_analytic` | analytics, forms | Low |

### **📊 AUDIT - Logging & Compliance**
```
Tables: audit_logs, audit_entity_relationships, api_usage_logs, order_status_history
Use Case: System audit trails, compliance tracking, performance monitoring
Development Priority: Security and compliance
```

| Table | Additional Tags | Priority |
|-------|----------------|----------|
| `audit_logs` | infrastructure, security, compliance | High |
| `audit_entity_relationships` | infrastructure, audit | Medium |
| `api_usage_logs` | infrastructure, security, audit | Medium |
| `order_status_history` | orders, audit, analytics | Medium |

### **🔐 AUTHENTICATION - User Management**
```
Tables: user_accounts, contacts, notification_preferences
Use Case: User authentication, access control, security
Development Priority: Security foundation
```

| Table | Additional Tags | Priority |
|-------|----------------|----------|
| `user_accounts` | core, security, crm | High |
| `contact` | crm, authentication | High |
| `notification_preference` | notifications, authentication | Medium |

### **⚙️ WORKFLOW - Business Process Management**
```
Tables: sign_offs, sign_off_line_items, internal_tasks, technician_absence, daily_team_compositions
Use Case: Approval processes, task management, workflow automation
Development Priority: Process optimization
```

| Table | Additional Tags | Priority |
|-------|----------------|----------|
| `sign_off` | workflow, orders, compliance | Medium |
| `sign_off_line_item` | workflow, orders | Low |
| `internal_task` | communications, workflow, operations | High |
| `technician_absence` | operations, workflow, installations | High |
| `daily_team_composition` | operations, workflow, installations | High |

### **🏗️ INFRASTRUCTURE - System Foundation**
```
Tables: addresses, documents, webhook_events, communication_channels, audit_logs, form_field_templates
Use Case: System infrastructure, integrations, foundational data
Development Priority: System stability
```

| Table | Additional Tags | Priority |
|-------|----------------|----------|
| `address` | infrastructure, crm, orders | Medium |
| `document` | infrastructure | Medium |
| `webhook_events` | infrastructure, integrations, communications | Medium |
| `communication_channel` | communications, infrastructure | Medium |
| `audit_logs` | audit, infrastructure, security | High |
| `form_field_template` | forms, infrastructure | Low |

---

## 🎯 **DEVELOPMENT WORKFLOWS BY TAGS**

### **Phase 1: Core Foundation**
```
Tags: core, infrastructure
Tables: organizations, contacts, articles, orders, audit_logs, addresses
Purpose: Essential system foundation
Estimated Timeline: 2-3 weeks
```

### **Phase 2: Order Management**
```
Tags: orders, financial
Tables: quotes, line_items, order_status_history, invoices, payments
Purpose: Complete order processing
Estimated Timeline: 2-3 weeks
```

### **Phase 3: Operations & Installations**
```
Tags: installations, operations
Tables: visits, work_orders, installation_teams, daily_team_compositions, technician_absence
Purpose: Field operations management
Estimated Timeline: 3-4 weeks
```

### **Phase 4: Communications & Notifications**
```
Tags: communications, notifications
Tables: communication_*, user_notifications, notification_preferences
Purpose: Multi-channel communication system
Estimated Timeline: 2-3 weeks
```

### **Phase 5: Advanced Features**
```
Tags: analytics, forms, workflow
Tables: form_*, customer_feedback, partner_commissions, installation_performance
Purpose: Advanced business intelligence
Estimated Timeline: 2-3 weeks
```

---

## 📈 **FILTERING EXAMPLES**

### **By Business Function**
```sql
-- Customer-facing tables
Tags: crm, orders, communications, notifications

-- Operations tables  
Tags: installations, operations, workflow

-- Financial tables
Tags: financial, orders, analytics

-- System tables
Tags: infrastructure, audit, security
```

### **By Development Priority**
```sql
-- Critical Path (High Priority)
organizations, contacts, orders, articles, visits, work_orders

-- Core Features (Medium Priority)  
quotes, invoices, payments, communication_threads, user_notifications

-- Enhanced Features (Low Priority)
form_analytics, installation_performance, partner_commissions
```

### **By Integration Complexity**
```sql
-- Simple (Database only)
Tags: core, infrastructure

-- Medium (Business Logic)
Tags: orders, financial, workflow  

-- Complex (External Integrations)
Tags: communications, notifications, installations
```

---

## 🔧 **IMPLEMENTATION GUIDE**

### **Manual Tag Assignment Process**
1. **Navigate to Xano Database**
2. **For each table, click table settings (⚙️)**
3. **Add tags based on above categorization**
4. **Use comma-separated values**: `crm, core, authentication`

### **Example Tag Assignments**
```javascript
// organizations table
tags: ["crm", "core", "infrastructure"]

// orders table  
tags: ["orders", "core", "crm", "financial"]

// communication_messages table
tags: ["communications", "notifications", "real-time"]

// user_notifications table
tags: ["notifications", "communications", "real-time"]
```

### **Quality Assurance Checklist**
- [ ] All 42 tables have at least 1 tag
- [ ] Core tables have "core" tag
- [ ] High-priority tables clearly marked
- [ ] Related tables share common tags
- [ ] No table has more than 4 tags (readability)

---

## 📊 **TAG STATISTICS**

### **Tag Distribution**
```
core: 8 tables (critical foundation)
infrastructure: 12 tables (system foundation)  
orders: 8 tables (order processing)
operations: 10 tables (field work)
communications: 6 tables (multi-channel)
crm: 6 tables (customer management)
financial: 5 tables (money management)
installations: 9 tables (field operations)
workflow: 6 tables (process management)
audit: 4 tables (compliance)
notifications: 2 tables (new system)
forms: 6 tables (intake system)
```

### **Priority Distribution**
```
High Priority: 18 tables (critical path)
Medium Priority: 16 tables (core features)  
Low Priority: 8 tables (enhancements)
```

---

## 🎉 **BENEFITS OF TAG SYSTEM**

### **For Developers**
- ✅ **Quick Filtering**: Find related tables instantly
- ✅ **Clear Dependencies**: Understand table relationships
- ✅ **Phased Development**: Build system incrementally
- ✅ **Code Organization**: Structure by business domain

### **For Project Management**
- ✅ **Progress Tracking**: Monitor completion by tag
- ✅ **Resource Allocation**: Assign teams to tag groups
- ✅ **Risk Management**: Identify critical path dependencies
- ✅ **Timeline Planning**: Estimate work by complexity

### **For Business Stakeholders**
- ✅ **Feature Visibility**: Understand system capabilities
- ✅ **Priority Alignment**: See development focus areas
- ✅ **Impact Assessment**: Understand feature dependencies
- ✅ **Quality Assurance**: Track testing by business function

---

*Deze tag structuur ondersteunt systematische ontwikkeling van ChargeCars V2 met duidelijke organisatie en filtering mogelijkheden voor alle 42 database tabellen.* 