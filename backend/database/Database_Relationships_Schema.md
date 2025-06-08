# ChargeCars V2 - Database Relationships Schema
**Complete Foreign Key Constraints & Business Rules**  
*Created: 31 mei 2025*

---

## 🔗 **RELATIONSHIP OVERVIEW**

### **Core Entity Relationships**
```
organizations (1) ←→ (N) contacts
organizations (1) ←→ (N) orders  
contacts (1) ←→ (N) user_accounts
orders (1) ←→ (N) line_items
orders (1) ←→ (N) visits
orders (1) ←→ (N) quotes
```

---

## 📊 **DETAILED RELATIONSHIP MAPPINGS**

### **🏢 Organizations Hub**
```sql
-- organizations table serves as central entity
organizations.id → contacts.organization_id (1:N)
organizations.id → orders.organization_id (1:N)  
organizations.id → addresses.entity_id (1:N) WHERE entity_type='organization'
organizations.id → invoices.organization_id (1:N)
organizations.id → quotes.organization_id (1:N)
organizations.id → form_submissions.organization_id (1:N)
organizations.id → partner_commissions.partner_organization_id (1:N)
```

### **👤 Contacts & Users**
```sql
-- Contact management relationships
contacts.id → user_accounts.contact_id (1:1)
contacts.id → addresses.entity_id (1:N) WHERE entity_type='contact'
contacts.id → communication_threads.primary_contact_id (1:N)
contacts.id → orders.primary_contact_id (1:N)
contacts.id → quotes.contact_id (1:N)
contacts.id → visits.assigned_contact_id (1:N)
contacts.id → installation_teams.team_lead_contact_id (1:N)
contacts.id → technician_absence.contact_id (1:N)

-- User authentication
user_accounts.id → user_notifications.user_id (1:N)
user_accounts.id → notification_preferences.user_id (1:1)
user_accounts.id → audit_logs.user_id (1:N)
user_accounts.id → api_usage_logs.user_id (1:N)
```

### **🛒 Orders Ecosystem**
```sql
-- Order relationships
orders.id → line_items.order_id (1:N)
orders.id → visits.order_id (1:1)
orders.id → work_orders.order_id (1:1)
orders.id → invoices.order_id (1:1)
orders.id → payments.order_id (1:N)
orders.id → order_status_history.order_id (1:N)
orders.id → sign_offs.order_id (1:N)
orders.id → customer_feedback.order_id (1:1)

-- Quote to order conversion
quotes.id → orders.quote_id (1:1)
quotes.id → line_items.quote_id (1:N)

-- Order workflow
orders.id → communication_threads.entity_id (1:N) WHERE entity_type='order'
```

### **📦 Articles & Inventory**
```sql
-- Product relationships
articles.id → line_items.article_id (1:N)
articles.id → article_inventory.article_id (1:N)
articles.id → article_components.parent_article_id (1:N)
articles.id → article_components.component_article_id (1:N)
articles.id → submission_line_items.article_id (1:N)

-- Inventory tracking
article_inventory.id → line_items.inventory_allocation_id (1:1)
```

### **🚐 Operations & Installations**
```sql
-- Team management
installation_teams.id → daily_team_compositions.installation_team_id (1:N)
installation_teams.id → team_vehicle_assignments.installation_team_id (1:N)
installation_teams.id → visits.assigned_team_id (1:N)
installation_teams.id → work_orders.assigned_team_id (1:N)
installation_teams.id → installation_performance.team_id (1:N)

-- Vehicle assignments
vehicles.id → team_vehicle_assignments.vehicle_id (1:N)

-- Visit scheduling
visits.id → work_orders.visit_id (1:1)
visits.id → sign_offs.visit_id (1:N)
visits.id → installation_performance.visit_id (1:N)

-- Service coverage
service_regions.id → installation_teams.service_region_id (1:N)
service_regions.id → addresses.service_region_id (1:N)
```

### **💬 Communications**
```sql
-- Communication threads
communication_threads.id → communication_messages.thread_id (1:N)
communication_channels.id → communication_messages.channel_id (1:N)
communication_channels.id → communication_threads.channel_id (1:N)

-- Templates and automation
communication_templates.id → communication_messages.template_id (1:N)
```

### **🔔 Notifications**
```sql
-- Notification system
user_notifications.id → notification_preferences.user_id (1:N)

-- Source tracking (polymorphic)
orders.id → user_notifications.source_record_id WHERE source_table='orders'
visits.id → user_notifications.source_record_id WHERE source_table='visits'
internal_tasks.id → user_notifications.source_record_id WHERE source_table='internal_tasks'
```

### **📋 Forms & Submissions**
```sql
-- Form builder
intake_forms.id → form_submissions.form_id (1:N)
intake_forms.id → form_field_templates.form_id (1:N)
form_field_templates.id → form_analytics.field_template_id (1:N)

-- Form submissions
form_submissions.id → submission_line_items.submission_id (1:N)
form_submissions.id → submission_files.submission_id (1:N)
form_submissions.id → orders.form_submission_id (1:1)
```

### **💰 Financial**
```sql
-- Invoice relationships
invoices.id → payments.invoice_id (1:N)
invoices.id → line_items.invoice_id (1:N)

-- Commission tracking
partner_commissions.organization_id → organizations.id (N:1)
partner_commissions.order_id → orders.id (N:1)
```

---

## 🔒 **FOREIGN KEY CONSTRAINTS**

### **Cascade Rules**
```sql
-- DELETE CASCADE (when parent deleted, children deleted)
organizations.id → contacts.organization_id ON DELETE CASCADE
orders.id → line_items.order_id ON DELETE CASCADE
orders.id → order_status_history.order_id ON DELETE CASCADE
visits.id → work_orders.visit_id ON DELETE CASCADE
communication_threads.id → communication_messages.thread_id ON DELETE CASCADE

-- DELETE SET NULL (when parent deleted, foreign key set to null)
contacts.id → orders.primary_contact_id ON DELETE SET NULL
installation_teams.id → visits.assigned_team_id ON DELETE SET NULL
quotes.id → orders.quote_id ON DELETE SET NULL

-- DELETE RESTRICT (prevent deletion if children exist)
articles.id → line_items.article_id ON DELETE RESTRICT
user_accounts.id → audit_logs.user_id ON DELETE RESTRICT
vehicles.id → team_vehicle_assignments.vehicle_id ON DELETE RESTRICT
```

---

## ✅ **BUSINESS RULES & CONSTRAINTS**

### **Order Workflow Rules**
```sql
-- Order can only have one active quote
UNIQUE(order_id) WHERE quote_status = 'active'

-- Order must have primary contact from same organization
orders.primary_contact_id → contacts.id 
WHERE contacts.organization_id = orders.organization_id

-- Line items must belong to same order
line_items.order_id = line_items.quote_id.order_id

-- Visit can only be scheduled for confirmed orders
visits.order_id → orders.id WHERE orders.status IN ('confirmed', 'in_progress')
```

### **Team Assignment Rules**
```sql
-- Team member must be contact with technician role
daily_team_compositions.contact_id → contacts.id 
WHERE contacts.role = 'technician'

-- Team can only be assigned to visits in their service region
visits.assigned_team_id → installation_teams.id
WHERE installation_teams.service_region_id = visits.address.service_region_id

-- Vehicle assignment dates cannot overlap
team_vehicle_assignments: NO OVERLAP(vehicle_id, date_range)
```

### **Financial Rules**
```sql
-- Payment cannot exceed invoice amount
payments.amount <= invoices.total_amount

-- Commission percentage must be between 0-100
partner_commissions.percentage BETWEEN 0 AND 100

-- Invoice line items must match order line items
invoices.order_id.line_items = line_items WHERE line_items.order_id = invoices.order_id
```

### **Communication Rules**
```sql
-- Message must belong to existing thread
communication_messages.thread_id → communication_threads.id NOT NULL

-- Thread must have valid entity reference
communication_threads.entity_type IN ('order', 'organization', 'contact')
communication_threads.entity_id → {orders.id | organizations.id | contacts.id}
```

---

## 🗂️ **INDEX STRATEGY**

### **Primary Indexes (Performance Critical)**
```sql
-- High-frequency lookups
CREATE INDEX idx_orders_organization_id ON orders(organization_id);
CREATE INDEX idx_contacts_organization_id ON contacts(organization_id);
CREATE INDEX idx_line_items_order_id ON line_items(order_id);
CREATE INDEX idx_visits_order_id ON visits(order_id);
CREATE INDEX idx_messages_thread_id ON communication_messages(thread_id);

-- Status-based queries
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_visits_status ON visits(status);
CREATE INDEX idx_work_orders_status ON work_orders(status);

-- Date-based queries
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_visits_scheduled_date ON visits(scheduled_date);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);
```

### **Composite Indexes (Complex Queries)**
```sql
-- Multi-column frequent queries
CREATE INDEX idx_orders_org_status ON orders(organization_id, status);
CREATE INDEX idx_visits_team_date ON visits(assigned_team_id, scheduled_date);
CREATE INDEX idx_notifications_user_read ON user_notifications(user_id, is_read);
CREATE INDEX idx_team_comp_date_team ON daily_team_compositions(date, installation_team_id);
```

---

## ⚠️ **DATA INTEGRITY CHECKS**

### **Validation Rules**
```sql
-- Email format validation
contacts.email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'

-- Phone number format
contacts.phone ~ '^\+?[0-9\s\-\(\)]+$'

-- UUID format validation  
organizations.id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'

-- Status enum validation
orders.status IN ('draft', 'confirmed', 'in_progress', 'completed', 'cancelled')
visits.status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled')
```

### **Business Logic Validation**
```sql
-- Order total calculation
orders.total_amount = SUM(line_items.quantity * line_items.unit_price) 
WHERE line_items.order_id = orders.id

-- Team capacity validation  
COUNT(daily_team_compositions.contact_id) <= installation_teams.max_team_size
WHERE daily_team_compositions.installation_team_id = installation_teams.id

-- Scheduling conflict prevention
NO OVERLAP(visits.scheduled_date, visits.estimated_duration) 
WHERE visits.assigned_team_id = same_team
```

---

## 🚀 **IMPLEMENTATION PRIORITY**

### **Phase 1: Core Relationships (Week 1)**
- [ ] Organizations ↔ Contacts ↔ Users
- [ ] Orders ↔ Line Items  
- [ ] Basic foreign key constraints
- [ ] Primary indexes

### **Phase 2: Order Workflow (Week 2)**
- [ ] Quotes ↔ Orders conversion
- [ ] Orders ↔ Visits ↔ Work Orders
- [ ] Order status history tracking
- [ ] Workflow constraints

### **Phase 3: Operations (Week 3)**  
- [ ] Teams ↔ Visits assignments
- [ ] Vehicle ↔ Team relationships
- [ ] Service region mapping
- [ ] Scheduling constraints

### **Phase 4: Advanced (Week 4)**
- [ ] Communications threading
- [ ] Notifications polymorphic relationships
- [ ] Financial calculations
- [ ] Complete business rules

---

*This relationship schema ensures data integrity, enforces business rules, and optimizes performance for ChargeCars V2 database operations.* 