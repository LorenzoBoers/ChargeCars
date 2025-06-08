# ChargeCars V2 - Table Tags Quick Reference
**Complete Tag Assignment Guide for Manual Implementation**  
*Created: 31 mei 2025*

---

## 🚀 **QUICK IMPLEMENTATION GUIDE**

### **How to Apply Tags in Xano**
1. Navigate to your ChargeCars V2 workspace in Xano
2. Go to **Database** section
3. For each table, click the **settings icon (⚙️)** 
4. Scroll to **Tags** field
5. Add tags as comma-separated values: `crm,core,infrastructure`
6. Save changes

---

## 📊 **COMPLETE TAGS REFERENCE TABLE**

| Table Name | Recommended Tags | Priority | Main Category |
|------------|-----------------|----------|---------------|
| `address` | `infrastructure,crm,orders` | Medium | Infrastructure |
| `api_usage_logs` | `audit,infrastructure,security` | Medium | Audit |
| `article_component` | `articles,inventory` | Medium | Articles |
| `article_inventory` | `articles,operations,real-time` | High | Articles |
| `article` | `articles,core,inventory,orders` | High | Articles |
| `audit_entity_relationships` | `audit,infrastructure` | Medium | Audit |
| `audit_logs` | `audit,infrastructure,security` | High | Audit |
| `communication_channel` | `communications,infrastructure` | Medium | Communications |
| `communication_message` | `communications,notifications` | High | Communications |
| `communication_template` | `communications,infrastructure` | Low | Communications |
| `communication_thread` | `communications,crm` | High | Communications |
| `contact` | `crm,core,authentication` | High | CRM |
| `customer_feedback` | `crm,analytics,orders` | Low | CRM |
| `daily_team_composition` | `operations,installations,workflow` | High | Installations |
| `document` | `infrastructure` | Medium | Infrastructure |
| `form_analytic` | `forms,analytics` | Low | Forms |
| `form_field_template` | `forms,infrastructure` | Low | Forms |
| `form_submission` | `forms,crm,orders` | High | Forms |
| `installation_performance` | `installations,analytics,operations` | Low | Installations |
| `installation_team` | `operations,installations` | Medium | Installations |
| `intake_form` | `forms,infrastructure` | Medium | Forms |
| `internal_task` | `communications,workflow,operations` | High | Communications |
| `invoice` | `financial,orders,crm` | High | Financial |
| `line_item` | `orders,articles,financial` | High | Orders |
| `notification_preference` | `notifications,authentication` | Medium | Notifications |
| `order_status_history` | `orders,audit,analytics` | Medium | Orders |
| `order` | `orders,core,crm,financial` | High | Orders |
| `organization` | `crm,core,infrastructure` | High | CRM |
| `partner_commission` | `financial,crm,analytics` | Medium | Financial |
| `payment` | `financial,orders` | High | Financial |
| `quote` | `orders,crm` | High | Orders |
| `service_region` | `operations,installations` | Low | Installations |
| `sign_off_line_item` | `workflow,orders` | Low | Workflow |
| `sign_off` | `workflow,orders,compliance` | Medium | Workflow |
| `submission_file` | `forms,infrastructure` | Medium | Forms |
| `submission_line_item` | `forms,orders,articles` | Medium | Forms |
| `team_vehicle_assignment` | `operations,installations` | Medium | Installations |
| `technician_absence` | `operations,workflow,installations` | High | Installations |
| `user_accounts` | `authentication,core,security` | High | Authentication |
| `user_notifications` | `notifications,communications,real-time` | High | Notifications |
| `vehicle` | `operations,installations` | Medium | Installations |
| `visit` | `installations,orders,operations` | High | Installations |
| `webhook_events` | `infrastructure,integrations,communications` | Medium | Infrastructure |
| `work_order` | `installations,operations,compliance` | High | Installations |

---

## 🏷️ **TAG DEFINITIONS**

### **Primary Categories (12 tags)**
- **`core`** - Essential system foundation tables (8 tables)
- **`crm`** - Customer relationship management (6 tables)  
- **`order`** - Order processing and lifecycle (8 tables)
- **`article`** - Product catalog and inventory (4 tables)
- **`communications`** - Multi-channel communication system (6 tables)
- **`notifications`** - Real-time notification system (2 tables)
- **`installations`** - Field operations and work (9 tables)
- **`financial`** - Money, billing, and payments (5 tables)
- **`forms`** - Dynamic form builder and intake (6 tables)
- **`audit`** - System logging and compliance (4 tables)
- **`authentication`** - User management and security (3 tables)
- **`workflow`** - Business process management (5 tables)

### **Technical Categories (6 tags)**
- **`infrastructure`** - System foundation and config (10 tables)
- **`operations`** - Field work and team management (10 tables)
- **`analytics`** - Reporting and business intelligence (5 tables)
- **`security`** - Security and access control (3 tables)
- **`real-time`** - Live data and notifications (3 tables)
- **`integrations`** - External system connections (2 tables)

### **Special Categories (3 tags)**
- **`inventory`** - Stock and material management (3 tables)
- **`compliance`** - Regulatory and audit requirements (3 tables)
- **`real-time`** - Live updates and notifications (3 tables)

---

## 📈 **FILTERING QUICK COMMANDS**

### **By Development Phase**
```
Phase 1 (Foundation): core,infrastructure
Phase 2 (Orders): orders,financial  
Phase 3 (Operations): installations,operations
Phase 4 (Communications): communications,notifications
Phase 5 (Advanced): analytics,forms,workflow
```

### **By Business Function**
```
Customer-facing: crm,orders,communications,notifications
Operations: installations,operations,workflow
Financial: financial,orders,analytics
System: infrastructure,audit,security
```

### **By Priority Level**
```
Critical (High): core,orders,crm
Important (Medium): financial,communications,operations
Enhanced (Low): analytics,forms,workflow
```

---

## ⚡ **BULK TAG ASSIGNMENT SCRIPT**

### **For Manual Copy-Paste in Xano**
```javascript
// Copy these exact tag strings for each table:

addresses: "infrastructure,crm,orders"
api_usage_logs: "audit,infrastructure,security"
article_components: "articles,inventory"
article_inventory: "articles,operations,real-time"
articles: "articles,core,inventory,orders"
audit_entity_relationships: "audit,infrastructure"
audit_logs: "audit,infrastructure,security"
communication_channels: "communications,infrastructure"
communication_messages: "communications,notifications"
communication_templates: "communications,infrastructure"
communication_threads: "communications,crm"
contacts: "crm,core,authentication"
customer_feedback: "crm,analytics,orders"
daily_team_compositions: "operations,installations,workflow"
documents: "infrastructure"
form_analytics: "forms,analytics"
form_field_templates: "forms,infrastructure"
form_submissions: "forms,crm,orders"
installation_performance: "installations,analytics,operations"
installation_teams: "operations,installations"
intake_forms: "forms,infrastructure"
internal_tasks: "communications,workflow,operations"
invoices: "financial,orders,crm"
line_items: "orders,articles,financial"
notification_preferences: "notifications,authentication"
order_status_history: "orders,audit,analytics"
orders: "orders,core,crm,financial"
organizations: "crm,core,infrastructure"
partner_commissions: "financial,crm,analytics"
payments: "financial,orders"
quotes: "orders,crm"
service_regions: "operations,installations"
sign_off_line_items: "workflow,orders"
sign_offs: "workflow,orders,compliance"
submission_files: "forms,infrastructure"
submission_line_items: "forms,orders,articles"
team_vehicle_assignments: "operations,installations"
technician_absence: "operations,workflow,installations"
user_accounts: "authentication,core,security"
user_notifications: "notifications,communications,real-time"
vehicles: "operations,installations"
visits: "installations,orders,operations"
webhook_events: "infrastructure,integrations,communications"
work_orders: "installations,operations,compliance"
```

---

## ✅ **IMPLEMENTATION CHECKLIST**

### **Pre-Implementation**
- [ ] Backup current Xano workspace
- [ ] Review tag strategy with development team
- [ ] Confirm tag naming conventions

### **During Implementation**
- [ ] Apply tags to all 42 tables
- [ ] Verify no typos in tag names
- [ ] Test filtering functionality
- [ ] Document any custom modifications

### **Post-Implementation**
- [ ] Update team documentation
- [ ] Train developers on tag usage
- [ ] Set up filtered views for different teams
- [ ] Monitor tag effectiveness

---

## 🎯 **USAGE EXAMPLES**

### **Finding Related Tables**
```
Need all customer data? → Filter by: crm
Working on orders? → Filter by: orders,financial
Building APIs? → Filter by: core,infrastructure
Field operations? → Filter by: installations,operations
```

### **Development Team Focus**
```
Backend Team: core,infrastructure,audit
Frontend Team: crm,orders,communications
Operations Team: installations,operations,workflow
Finance Team: financial,orders,analytics
```

### **Project Planning**
```
Sprint 1: core,infrastructure (8 tables)
Sprint 2: orders,financial (10 tables)
Sprint 3: communications,notifications (8 tables)
Sprint 4: installations,operations (16 tables)
```

---

## 📊 **TAG STATISTICS SUMMARY**

```
Total Tables: 42
Most Used Tag: operations (10 tables)
Critical Tables: 18 (High priority)
Infrastructure Tables: 10
Customer-Facing Tables: 14
Integration Points: 8
```

---

**🚀 Ready for implementation! Copy the tag strings above and paste them directly into each table's tag field in Xano.**

*This quick reference enables immediate manual tagging of all 42 tables with strategic overlapping categories for optimal filtering and development workflow organization.* 