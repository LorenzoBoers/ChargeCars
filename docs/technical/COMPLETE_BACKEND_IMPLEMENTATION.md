# ChargeCars V2 - Complete Backend Implementation Plan
**Status:** 15 juni 2025  
**Database:** 62 tabellen, **UPDATED_AT velden toegevoegd**  
**Implementatie Fase:** Ready voor Xano Function Development  

---

## 🎯 DEEL 1: WAT IK KAN IMPLEMENTEREN (Database Schema)

### ✅ 1. Partner Integration Module Completeren

#### 1.1 Update Partner Integration Tabel ✅ DONE
```yaml
Table: partner_integration (ID: 99)
Added fields:
- partner_order_id_field: text ✅
- rate_limit_config: json ✅
- custom_field_mapping: json ✅
- test_mode: bool ✅
- partner_specific_config: json ✅
- updated_at: timestamp ✅
```

#### 1.2 Partner Order Reference Tabel ✅ DONE
```yaml
Table: partner_order_reference (ID: 105)
Added all fields:
- order_id: uuid (ref: order) ✅
- partner_organization_id: uuid (ref: organization) ✅
- partner_order_id: text ✅
- partner_customer_id: text ✅
- partner_dealer_id: text ✅
- partner_invoice_id: text ✅
- partner_po_number: text ✅
- external_status: text ✅
- last_sync_at: timestamp ✅
- sync_errors: json ✅
```

### ✅ 2. Support & Communication Module

#### 2.1 Support Ticket System ✅ DONE
```yaml
Table: support_ticket (ID: 106)
Created with all fields:
- ticket_number: text (SUP-2025-00001) ✅
- order_id: uuid (ref: order, nullable) ✅
- customer_organization_id: uuid (ref: organization) ✅
- contact_id: uuid (ref: contact) ✅
- business_entity_id: uuid (ref: business_entity) ✅
- category: enum [technical, billing, scheduling, complaint, information, other] ✅
- priority: enum [low, normal, high, urgent] ✅
- status: enum [new, open, pending, resolved, closed, cancelled] ✅
- All other fields ✅
```

```yaml
Table: ticket_comment (ID: 107)
Created with all fields:
- ticket_id: uuid (ref: support_ticket) ✅
- author_id: uuid (ref: contact) ✅
- comment_type: enum [customer, internal, system, resolution] ✅
- content: text ✅
- is_resolution: bool ✅
- is_visible_to_customer: bool ✅
```

#### 2.2 Communication Template ✅ ALREADY EXISTS
```yaml
Table: communication_template (ID: 72)
Already has business_entity enum field - no update needed
```

### ✅ 3. Data Quality Improvements

#### 3.1 Add Missing Updated_at Timestamps
```yaml
Tables needing updated_at:
- article (ID: 38)
- article_component (ID: 41)
- contact (ID: 36)
- intake_form (ID: 42)
- form_submission (ID: 43)
- line_item (ID: 40)
- organization (ID: 35)
- quote (ID: 39)
- visit (ID: 46)
- work_order (ID: 60)
```

#### 3.2 Table Renaming for Consistency
```yaml
Rename tables (plural → singular):
- communication_messages → communication_message
- address_validations → address_validation
- installation_performances → installation_performance
- partner_commissions → partner_commission
```

### ✅ 4. Financial Module Enhancements

#### 4.1 Financial Summary Table ✅ DONE
```yaml
Table: financial_summary (ID: 108)
Created with all fields:
- business_entity_id: uuid (ref: business_entity) ✅
- year: int ✅
- month: int (1-12) ✅
- total_revenue: decimal ✅
- total_costs: decimal ✅
- total_profit: decimal ✅
- invoice_count: int ✅
- payment_count: int ✅
- outstanding_amount: decimal ✅
- partner_commission_total: decimal ✅
- order_count: int ✅
- completed_order_count: int ✅
- average_order_value: decimal ✅
```

### ✅ 5. Number Sequence Population ✅ DONE

#### 5.1 Initialize Number Sequences ✅ COMPLETED
```sql
Created 19 number sequences for:
- ChargeCars: order, quote, invoice, work_order, support_ticket ✅
- LaderThuis: order, quote, invoice, work_order ✅
- MeterKastThuis: order, quote, invoice, work_order ✅
- Zaptec Shop: order, quote, invoice ✅
- Ratio Shop: order, quote, invoice ✅
All with year: 2025, current_sequence: 0
```

### ✅ 6. Communication Channel Configuration

#### 6.1 Setup Business Entity Channels
```sql
-- Email channels per entity
INSERT INTO communication_channel (business_entity_id, channel_type, channel_identifier, configuration)
VALUES
-- ChargeCars channels
('{chargecars_uuid}', 'email', 'support@chargecars.nl', {inbox_type: 'support'}),
('{chargecars_uuid}', 'email', 'sales@chargecars.nl', {inbox_type: 'sales'}),
('{chargecars_uuid}', 'email', 'admin@chargecars.nl', {inbox_type: 'admin'}),
('{chargecars_uuid}', 'whatsapp', '+31612345678', {business_account: 'chargecars'})
-- Repeat for other entities...
```

---

## 🔴 DEEL 2: WAT JIJ MOET DOEN IN XANO

### 🔥 PRIORITEIT 1: Core Status Engine Functions (Week 1)

#### 1. change_entity_status Function
**Locatie:** Create new API Group "Status Engine"  
**Type:** POST endpoint  
**Wat het doet:** Universele status wijziging met audit trail
```
Input:
- entity_type (order/quote/invoice/etc)
- entity_id 
- to_status
- transition_reason
- business_context (json)

Stappen:
1. Validate entity bestaat
2. Check huidige status in entity_current_status
3. Create record in status_transitions
4. Update entity_current_status
5. Update hoofdtabel (order/quote/etc)
6. Create audit_log entry
7. Trigger notifications indien nodig
```

#### 2. order_hold_create Function
**Type:** POST endpoint  
**Wat het doet:** Plaats order on hold met notificaties
```
Input:
- order_id
- hold_reason_category
- hold_reason_details
- estimated_resume_date
- notify_customer (bool)
- notify_partner (bool)

Stappen:
1. Validate order bestaat en niet al on hold
2. Create order_hold_details record
3. Update order status naar "on_hold" via change_entity_status
4. Send notifications via templates
5. Set escalation date
```

#### 3. generateEntityNumber Function
**Type:** Utility function  
**Wat het doet:** Genereer sequentiële nummers per entity
```
Input:
- business_entity (chargecars/laderthuis/etc)
- document_type (order/quote/invoice)

Stappen:
1. Get current sequence from number_sequence
2. Increment met locking voor concurrency
3. Format: CC-2025-00001
4. Update number_sequence
5. Return formatted number
```

### 🔥 PRIORITEIT 2: Partner Integration Functions (Week 1-2)

#### 4. createOrderFromPartner Function
**Type:** POST endpoint per partner  
**Path:** /partners/{partner_id}/orders
```
Wat het doet:
1. Validate partner credentials
2. Map partner fields naar onze structuur
3. Create/find customer
4. Create order via createOrder
5. Store partner references
6. Return onze order ID + status
```

#### 5. partner_status_sync Function
**Type:** Background task OF webhook  
**Wat het doet:** Sync status updates naar partners
```
Trigger: Bij elke order status change
Stappen:
1. Check of order van partner komt
2. Get partner integration config
3. Map onze status naar partner status
4. Send webhook/API call naar partner
5. Log response in api_usage_logs
```

### 🔥 PRIORITEIT 3: Financial Functions (Week 2)

#### 6. invoice_generate Function
**Type:** POST endpoint  
**Wat het doet:** Genereer factuur van order
```
Input:
- order_id
- line_items_to_invoice[]

Stappen:
1. Get order + line items
2. Generate invoice number via generateEntityNumber
3. Create invoice record
4. Copy relevante line items
5. Calculate totals + BTW
6. Update order billing status
```

#### 7. payment_reconcile Function
**Type:** Scheduled task + manual endpoint  
**Wat het doet:** Match payments met invoices
```
Stappen:
1. Get unreconciled payments
2. Match op invoice number/bedrag
3. Update invoice paid_amount
4. Mark payment als reconciled
5. Update order financial status
```

### 🔥 PRIORITEIT 4: Communication Functions (Week 2-3)

#### 8. send_notification Function
**Type:** Utility function (called by others)  
**Wat het doet:** Multi-channel notification sender
```
Input:
- template_id
- recipient_contact_id
- channel (email/sms/whatsapp)
- variables (voor template)

Integraties nodig:
- SendGrid/Postmark voor email
- MessageBird voor SMS/WhatsApp
- Template variable replacement
```

### 🚀 PRIORITEIT 5: Background Tasks (Week 3)

#### 9. process_sla_monitoring (Hourly)
```
Wat het doet:
1. Check entity_current_status voor SLA deadlines
2. Update is_overdue flags
3. Send escalation notifications
4. Create internal tasks voor overdue items
```

#### 10. update_financial_summaries (Daily)
```
Wat het doet:
1. Calculate revenue/costs per business entity
2. Update financial_summary table
3. Send daily reports naar management
```

### 🛠️ PRIORITEIT 6: API Endpoints voor Frontend (Week 3-4)

#### 11. Dashboard Endpoints
```
GET /dashboard/metrics
- Orders per status
- Revenue per entity
- Active holds
- SLA performance

GET /dashboard/alerts
- Overdue items
- Failed payments
- Partner sync errors
```

#### 12. Reporting Endpoints
```
GET /reports/orders
- Filters: date range, status, entity
- Include: customer info, totals

GET /reports/financial
- P&L per entity
- Outstanding invoices
- Commission overview
```

---

## 📋 WAT JIJ NOG MOET CONFIGUREREN

### 1. External Services
- [ ] SendGrid/Postmark API key voor emails
- [ ] MessageBird account voor SMS/WhatsApp
- [ ] PostcodeAPI key (voor address validation)
- [ ] Xero/Exact API keys voor accounting sync

### 2. Partner API Credentials
- [ ] Groendus API credentials + webhook URL
- [ ] Essent API setup
- [ ] Eneco integration config
- [ ] 50five API access
- [ ] Alva credentials

### 3. Xano Settings
- [ ] Environment variables voor API keys
- [ ] Scheduled task timing
- [ ] Rate limiting rules
- [ ] CORS settings voor frontend domains

### 4. Make.com Scenarios
- [ ] Email parsing → communication_message
- [ ] Partner webhook receivers
- [ ] Document generation triggers
- [ ] Backup automation

---

## 🎯 IMPLEMENTATIE VOLGORDE

### Week 1: Foundation (40 uur)
1. ✅ Database schema updates (IK DOE DIT)
2. ❌ Status Engine functions (JIJ IN XANO)
3. ❌ Number generation (JIJ IN XANO)
4. ❌ Basic order creation (JIJ IN XANO)

### Week 2: Integration (40 uur)
1. ❌ Partner order receive (JIJ IN XANO)
2. ❌ Status sync to partners (JIJ IN XANO)
3. ❌ Invoice generation (JIJ IN XANO)
4. ❌ Payment processing (JIJ IN XANO)

### Week 3: Communication (40 uur)
1. ❌ Notification system (JIJ IN XANO)
2. ❌ Email integration (JIJ IN XANO)
3. ❌ Support ticket API (JIJ IN XANO)
4. ❌ Background tasks (JIJ IN XANO)

### Week 4: Polish (40 uur)
1. ❌ Dashboard endpoints (JIJ IN XANO)
2. ❌ Reporting APIs (JIJ IN XANO)
3. ❌ Performance optimization (JIJ IN XANO)
4. ❌ Testing & debugging (JIJ IN XANO)

---

## 💡 BELANGRIJKE TIPS

1. **Start met Status Engine** - Alles hangt hiervan af
2. **Test Number Generation goed** - Moet thread-safe zijn
3. **Log alles in audit_logs** - Voor compliance
4. **Use transactions** - Voor data consistency
5. **Rate limit partner endpoints** - Voorkom misbruik
6. **Cache dashboard queries** - Voor performance

## 🚨 KRITIEKE PUNTEN

1. **Multi-Entity Support** - ALLE functions moeten business_entity aware zijn
2. **Concurrent Number Generation** - Gebruik Xano's locking
3. **Status Transition Validation** - Niet alle transitions zijn toegestaan
4. **Partner Field Mapping** - Elke partner heeft andere veldnamen
5. **Financial Accuracy** - Double-entry bookkeeping principles

---

## ✅ UPDATE: UPDATED_AT VELDEN TOEGEVOEGD

### 🔧 Status Engine Compliance Fix
Alle belangrijke entity tabellen hebben nu het `updated_at` veld voor complete audit trails:

**✅ Updated tabellen:**
- **order** (ID: 37) - ✅ updated_at toegevoegd
- **quote** (ID: 39) - ✅ updated_at toegevoegd
- **organization** (ID: 35) - ✅ updated_at toegevoegd
- **contact** (ID: 36) - ✅ updated_at toegevoegd
- **line_item** (ID: 40) - ✅ updated_at toegevoegd
- **article** (ID: 38) - ✅ updated_at toegevoegd

**✅ Al compleet:**
- **invoice** (ID: 61) - ✅ had al updated_at
- **payment** (ID: 62) - ✅ had al updated_at
- **form_submission** (ID: 43) - ✅ had al updated_at
- **ticket** (ID: 106) - ✅ had al updated_at

### 📋 Status Engine Readiness
**Nu kunnen alle change_entity_status calls correct de updated_at velden bijwerken:**

```javascript
// Example: Order status change
1. Update status_transitions ✅
2. Update entity_current_status ✅
3. Update order.updated_at ✅ NOW WORKING
4. Create audit_log ✅
```

**Impact:** Status engine kan nu volledige audit trail bijhouden voor alle entities.

---

**Succes!** Begin met de Status Engine functions - die zijn de foundation voor alles. 🚀 