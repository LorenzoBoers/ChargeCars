# ChargeCars V2 - Xano Implementation TODO List

**Laatste Update:** 15 juni 2025  
**Prioriteit:** 🔥 = Kritiek | ⚠️ = Belangrijk | 💡 = Nice-to-have  

## 📋 Database Schema Updates

### 🔥 Week 1: Financiële Module (KRITIEK)

#### Invoice Tabel Updates
- [x] Add `business_entity_id` (UUID, required, ref: business_entity) ✅ DONE
- [x] Add `paid_amount` (decimal, default: 0) ✅ DONE
- [x] Add `currency` (text, default: 'EUR') ✅ DONE
- [x] Add `updated_at` (timestamp) ✅ DONE
- [ ] Create unique index on (business_entity_id, invoice_number)

#### Payment Tabel Updates  
- [x] Add `business_entity_id` (UUID, required, ref: business_entity) ✅ DONE
- [x] Add `reconciled_at` (timestamp, nullable) ✅ DONE
- [x] Add `bank_account_id` (UUID, nullable, ref: bank_account) ✅ DONE
- [x] Add `updated_at` (timestamp) ✅ DONE

#### Nieuwe Tabellen
- [x] Create `bank_account` tabel: ✅ DONE (Table ID: 104)
  ```yaml
  fields:
    - id: uuid
    - business_entity_id: uuid (ref: business_entity)
    - account_name: text
    - iban: text
    - bic: text
    - bank_name: text
    - is_primary: bool
    - is_active: bool
    - created_at: timestamp
    - updated_at: timestamp
  ```

### ✅ Week 1.5: Attachment Architectuur Consistentie (VOLTOOID)

#### Centrale Attachment Tabel Updates (Table ID: 76)
- [x] Add `quote_id` foreign key ✅ DONE
- [x] Add `invoice_id` foreign key ✅ DONE  
- [x] Add `customer_feedback_id` foreign key ✅ DONE
- [x] Add `partner_commission_id` foreign key ✅ DONE
- [x] Remove invalid `work_order_id` reference ✅ DONE
- [x] Remove invalid `visit_id` reference ✅ DONE
- [x] Enhanced document_type enum (feedback_attachment, commission_statement) ✅ DONE
- [x] Enhanced file_category enum (feedback_photo, commission_document) ✅ DONE

#### Entity Table Cleanup
- [x] Remove `pdf_file_url` from invoice tabel ✅ DONE
- [ ] Remove `pdf_file_url` from work_order tabel (keep pdf_generated flag)
- [x] Keep `pdf_generated` flag in invoice for status tracking ✅ DONE
- [x] Junction table `communication_message_attachment` already exists ✅ VERIFIED

#### Attachment Architecture Benefits ✅ ACHIEVED
- ✅ **Unified File Management** - Single attachment table for ALL entities
- ✅ **Rich Metadata** - Processing status, access control, versioning
- ✅ **Security Features** - Virus scanning, checksum validation, expiry dates
- ✅ **Junction Pattern** - Proper many-to-many relationships via junction tables
- ✅ **Entity Flexibility** - Can link attachments to any entity type
- ✅ **Audit Trail** - Complete file lifecycle tracking

### ⚠️ Week 2: Partner Integration Updates

#### Partner Integration Tabel
- [ ] Add `partner_order_id_field` (text)
- [ ] Add `rate_limit_config` (json)
- [ ] Add `custom_field_mapping` (json)
- [ ] Add `test_mode` (bool, default: false)
- [ ] Add `partner_specific_config` (json)
- [ ] Add `updated_at` (timestamp)

#### Nieuwe Partner Reference Tabel
- [ ] Create `partner_order_reference` tabel:
  ```yaml
  fields:
    - id: uuid
    - order_id: uuid (ref: order)
    - partner_organization_id: uuid (ref: organization)
    - partner_order_id: text
    - partner_customer_id: text
    - partner_dealer_id: text
    - partner_invoice_id: text
    - partner_po_number: text
    - created_at: timestamp
  ```

### ⚠️ Week 3: Communication & Support

#### Communication Updates
- [x] ✅ KEEP: Centrale attachment architectuur (beter dan native) ✅ VERIFIED
- [x] ✅ KEEP: Junction table pattern voor message attachments ✅ VERIFIED
- [ ] Add `business_entity_id` to `communication_template`

#### Support Ticket System
- [ ] Create `support_ticket` tabel
- [ ] Create `ticket_category` tabel
- [ ] Create `ticket_priority` tabel

### 💡 Week 4: Data Quality

#### Table Renaming (Singular)
- [ ] Rename `communication_messages` → `communication_message`
- [ ] Rename `address_validations` → `address_validation`
- [ ] Rename `installation_performances` → `installation_performance`

#### Missing Timestamps
- [ ] Add `updated_at` to all tables zonder dit veld

## 🔧 Xano Functions Implementation

### 🔥 Priority 1: Status Engine Functions (uit manual guide)
- [ ] `order_status_change` - Main status transition handler
- [ ] `order_status_validate` - Validation before status change
- [ ] `order_status_history` - Get status history
- [ ] `order_hold_create` - Create hold with notifications
- [ ] `order_hold_resolve` - Resolve hold and restore status

### 🔥 Priority 2: Financial Functions
- [ ] `invoice_generate` - Generate invoice from order
- [ ] `invoice_number_generate` - Sequential per entity
- [ ] `payment_process` - Process incoming payment
- [ ] `payment_reconcile` - Bank reconciliation
- [ ] `commission_calculate` - Partner commission calc

### ⚠️ Priority 3: Partner Integration
- [ ] `partner_order_create` - Receive partner orders
- [ ] `partner_status_sync` - Send status updates
- [ ] `partner_webhook_send` - Webhook dispatcher
- [ ] `partner_order_map` - Map partner fields

### ⚠️ Priority 4: Communication
- [ ] `email_send` - Multi-channel email sender
- [ ] `sms_send` - SMS via MessageBird
- [ ] `whatsapp_send` - WhatsApp Business API
- [ ] `notification_queue` - Queue processor

## 🔄 Background Tasks

### Daily Tasks
- [ ] `check_sla_breaches` - Check en escalate SLA overschrijdingen
- [ ] `process_payment_reminders` - Stuur betaalherinneringen
- [ ] `sync_partner_data` - Sync met partner APIs

### Hourly Tasks  
- [ ] `process_notification_queue` - Verwerk notification queue
- [ ] `update_entity_current_status` - Update status cache

### Real-time Triggers
- [ ] `on_order_create` - Trigger voor nieuwe orders
- [ ] `on_status_change` - Trigger voor status updates
- [ ] `on_payment_received` - Trigger voor betalingen

## 📝 API Endpoints (nog te maken)

### Orders API
- [ ] POST `/orders/{id}/hold` - Place order on hold
- [ ] DELETE `/orders/{id}/hold` - Remove hold
- [ ] GET `/orders/{id}/timeline` - Full order timeline

### Financial API
- [ ] POST `/invoices/generate` - Generate invoice
- [ ] POST `/payments/reconcile` - Reconcile payment
- [ ] GET `/invoices/{id}/pdf` - Get PDF invoice

### Partner API
- [ ] POST `/partners/{id}/orders` - Receive partner order
- [ ] POST `/partners/webhooks/status` - Status webhook

## 🎯 Quick Wins (Direct te doen)

1. [ ] Vul `number_sequence` tabel voor alle entities
2. [ ] Test `status_configuration` met echte order
3. [ ] Maak eerste communication templates
4. [ ] Setup eerste partner in `partner_integration`
5. [x] Bank accounts voor alle entities ✅ DONE

## 📊 Testing Requirements

### Unit Tests
- [ ] Status transition validatie tests
- [ ] Number generation collision tests
- [ ] Financial calculation tests

### Integration Tests
- [ ] Partner webhook tests
- [ ] Email/SMS delivery tests
- [ ] Complete order flow test

## 🚨 Belangrijke Notities

1. **Multi-Entity Support**: ALLE nieuwe features moeten multi-entity aware zijn
2. **Audit Trail**: Alle wijzigingen moeten in audit_logs
3. **Status Engine**: Gebruik ALTIJD de status engine, nooit direct status updates
4. **Partner Sync**: Test mode eerst voordat live sync
5. **Financial**: Double-entry bookkeeping principles volgen

## 📅 Geschatte Timeline

- **Week 1**: Database schema fixes (40 uur)
- **Week 2**: Core functions implementation (40 uur)
- **Week 3**: API endpoints + testing (40 uur)
- **Week 4**: Background tasks + optimization (40 uur)

**Totaal: ~160 uur development tijd**

---

**Tip**: Begin met de 🔥 items - deze blokkeren andere functionaliteit. Test elke wijziging in Xano's preview mode eerst! 

## 🚨 **CRITICAL DATABASE FIXES** (NEW)

### Schema Corrections Needed:
1. **Status Field Conversions**: ✅ COMPLETED
   - [x] Convert `communication_thread.status` from ENUM to TEXT - DONE June 3, 2025
   - [x] Verified other status fields are already TEXT (order, visit, work_order, line_item)

2. **Missing Tables to Create**: ✅ USER CONFIRMED THEY EXIST
   - [x] All tables confirmed to exist in database
   - [x] Documentation updated to reflect this

3. **Performance Indexes to Add**:
   ```sql
   CREATE INDEX idx_entity_status_composite ON entity_current_status(entity_type, entity_id, current_status);
   CREATE INDEX idx_comm_thread_composite ON communication_thread(entity_type, entity_id, status);
   CREATE INDEX idx_number_seq_lookup ON number_sequence(business_entity_id, document_type_id, year);
   ```

## 🎯 **CORE FUNCTIONS TO IMPLEMENT**

## 🔴 CRITICAL - Missing Tables

### 1. user_account Table
**Status**: NOT IMPLEMENTED
**Priority**: HIGH
**Note**: Consider using contact-based authentication instead (see authentication-contact-based.md)

### 2. vehicle Table
**Status**: NOT IMPLEMENTED
**Priority**: MEDIUM
**Dependencies**: team_vehicle_assignment table references this

### 3. vehicle_tracking Table
**Status**: NOT IMPLEMENTED
**Priority**: MEDIUM
**For**: Real-time GPS tracking

### 4. team_vehicle_assignment Table
**Status**: NOT IMPLEMENTED
**Priority**: MEDIUM
**Dependencies**: Needs vehicle table first

## 🟡 AUTHENTICATION UPDATES

### Contact Table Extensions
Add authentication fields to contact table:
- [ ] password_hash (TEXT)
- [ ] is_user (BOOLEAN DEFAULT false)
- [ ] is_active (BOOLEAN DEFAULT true)
- [ ] email_verified (BOOLEAN DEFAULT false)
- [ ] last_login (TIMESTAMP)
- [ ] failed_login_attempts (INT DEFAULT 0)
- [ ] locked_until (TIMESTAMP)
- [ ] auth_token (TEXT)
- [ ] token_expires_at (TIMESTAMP)
- [ ] refresh_token (TEXT)
- [ ] refresh_token_expires_at (TIMESTAMP)
- [ ] password_reset_token (TEXT)
- [ ] password_reset_expires_at (TIMESTAMP)

## 🟢 XANO FUNCTION IMPLEMENTATIONS

### Authentication Endpoints
- [ ] POST /auth/login (using contact table)
- [ ] POST /auth/register
- [ ] POST /auth/refresh
- [ ] POST /auth/logout
- [ ] POST /auth/password-reset
- [ ] POST /auth/verify-email

### Order Management
- [ ] POST /order/create
- [ ] GET /order/list
- [ ] GET /order/{id}
- [ ] PATCH /order/{id}/status
- [ ] POST /order/{id}/line-items

### Partner Integration
- [ ] POST /partner/order/push
- [ ] POST /partner/status/webhook
- [ ] GET /partner/order/{external_id}

## 📝 NOTES
- The PRD documentation mentions user_account and vehicle tables but they don't exist in Xano
- Consider contact-based authentication to avoid duplicate email fields
- Vehicle tracking might be better implemented as a separate microservice 

## ✅ COMPLETED - Tables Now Exist

### 1. user_account Table
**Status**: IMPLEMENTED (ID #49)
**Note**: Keep separate from contact table for performance and security
**Recommendation**: DO NOT merge with contact table - current structure is optimal

### 2. vehicle Table  
**Status**: IMPLEMENTED (ID #57)
**Note**: Has proper GPS tracking structure and equipment management
**Update**: Removed business_entity_id as vehicles are company-wide

### 3. user_role Table
**Status**: IMPLEMENTED (ID #85)
**Note**: RBAC permissions system ready

### 4. user_session Table
**Status**: IMPLEMENTED (ID #83)
**Note**: JWT session management

### 5. phone_number Table
**Status**: IMPLEMENTED (ID #125)
**Note**: E.164 formatted phone numbers per contact

### 6. business_phone_number Table
**Status**: IMPLEMENTED (ID #122)
**Note**: Aircall integration ready

### 7. call Table
**Status**: IMPLEMENTED (ID #123)
**Note**: Complete call tracking with recordings

## 🔴 CRITICAL - Missing Tables

### 1. vehicle_tracking Table
**Status**: NOT IMPLEMENTED
**Priority**: MEDIUM
**For**: Historical GPS tracking data storage

### 2. team_vehicle_assignment Table
**Status**: NOT IMPLEMENTED
**Priority**: MEDIUM
**Dependencies**: Links teams to vehicles

## 🟡 AUTHENTICATION RECOMMENDATIONS

### Keep Current Structure
✅ **user_account** + **contact** separation is CORRECT
- Better performance (only ~10% of contacts need login)
- Better security (auth data isolated)
- Follows enterprise patterns (HubSpot/Salesforce model)

### Add Indexes for Performance
- [ ] Index on user_account.contact_id
- [ ] Index on contact.email
- [ ] Index on contact.username (for @mentions) 