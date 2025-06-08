# ChargeCars V2 - Current Database Schema
**Last Updated**: 2025-12-05
**Status**: In Review

## Overview
This document represents the current database schema for ChargeCars V2 as implemented in Xano. All tables follow singular naming convention and use UUIDs as primary keys.

## ⚠️ IMPORTANT NOTES
1. The `user_account` table is implemented and linked to contacts via `contact_id` (no duplicate email)
2. All status columns use TEXT type instead of ENUM for flexibility
3. See `XANO_TODO_IMPLEMENTATION.md` for pending implementations

## Core Business Tables

### 1. organization
Primary entity for all companies, partners, and customers.
```sql
- id (uuid, primary key)
- name (text, required)
- organization_type (enum: customer_business, customer_individual, partner, supplier, business_entity)
- business_entity (enum: chargecars, laderthuis, meterkastthuis, zaptecshop, ratioshop)
- kvk_number (text)
- vat_number (text)
- website (text)
- phone (text)
- email (text)
- created_at (timestamp)
- updated_at (timestamp)
```

### 2. contact
Individual people associated with organizations.
```sql
- id (uuid, primary key)
- organization_id (uuid, foreign key → organization)
- first_name (text, required)
- last_name (text, required)
- email (email, required)
- phone (text)
- mobile (text)
- contact_type (enum: customer, partner, employee, contractor)
- is_primary (boolean, default: false)
- created_at (timestamp)
- updated_at (timestamp)
```

### 3. order
Main order tracking table.
```sql
- id (uuid, primary key)
- order_number (text, unique, generated)
- customer_organization_id (uuid, foreign key → organization)
- partner_organization_id (uuid, foreign key → organization, nullable)
- primary_contact_id (uuid, foreign key → contact)
- order_type (enum: installation, service, upgrade, removal)
- business_entity (enum: chargecars, laderthuis, meterkastthuis, zaptecshop, ratioshop)
- order_status (text, default: new)
- installation_address_id (uuid, foreign key → address)
- total_amount (decimal)
- partner_total_amount (decimal)
- requested_date (date)
- planned_completion_date (date)
- actual_completion_date (date)
- priority_level (enum: low, normal, high, urgent)
- notes (text)
- partner_external_references (json)
- created_at (timestamp)
- updated_at (timestamp)
```

### 4. address
Flexible address storage for multiple entities.
```sql
- id (uuid, primary key)
- entity_type (enum: organization, contact, order, visit)
- entity_id (uuid)
- address_type (enum: billing, shipping, installation, business)
- street_address (text, required)
- street_number (text)
- city (text, required)
- state_province (text)
- postal_code (text, required)
- country (text, default: Netherlands)
- coordinates (object: {latitude: decimal, longitude: decimal})
- is_validated (boolean, default: false)
- validation_source (text)
- created_at (timestamp)
- updated_at (timestamp)
```

### 5. line_item
Order line items for products and services.
```sql
- id (uuid, primary key)
- order_id (uuid, foreign key → order)
- product_id (uuid, foreign key → product)
- quantity (integer, required)
- unit_price (decimal, required)
- total_price (decimal, required)
- partner_price (decimal)
- description (text)
- item_type (enum: product, service, discount, tax)
- status (text, default: pending)
- created_at (timestamp)
- updated_at (timestamp)
```

### 6. product
Product and service catalog.
```sql
- id (uuid, primary key)
- sku (text, unique)
- name (text, required)
- description (text)
- category (text)
- product_type (enum: charge_point, cable, installation_service, accessory)
- unit_price (decimal)
- partner_price (decimal)
- tax_rate (decimal, default: 0.21)
- is_active (boolean, default: true)
- stock_quantity (integer)
- supplier_id (uuid, foreign key → organization)
- created_at (timestamp)
- updated_at (timestamp)
```

### vehicle
Vehicle fleet management with real-time GPS tracking
- **id** (uuid): Primary key
- **created_at** (timestamp): Creation timestamp
- **updated_at** (timestamp): Last update timestamp
- **license_plate** (text): Vehicle registration number *required*
- **vehicle_name** (text): Friendly name (e.g., V-196-RP)
- **vehicle_type** (enum): Type of vehicle [bus, van, truck, car, trailer] *required*
- **brand_model** (text): Make and model
- **year** (int): Year of manufacture
- **ulu_vehicle_id** (text): External ID in ULU tracking system
- **current_location** (object): Real-time GPS position
  - **latitude** (decimal): Current latitude (WGS84) *required*
  - **longitude** (decimal): Current longitude (WGS84) *required*
  - **accuracy_meters** (int): GPS accuracy in meters
  - **speed_kmh** (decimal): Current speed in km/h
  - **heading_degrees** (int): Direction of travel (0-360)
  - **altitude_meters** (decimal): Altitude in meters
- **last_location_update** (timestamp): When location was last updated
- **operational_status** (text): Current status (parked, driving, on_site, maintenance) *default: parked*
- **current_visit_id** (uuid → visit): Current visit if vehicle is on site
- **equipment_list** (object): Installed equipment inventory
  - **equipment** (array of objects):
    - **name** (text): Equipment name *required*
    - **category** (enum): [tools, safety, charging, diagnostic, measurement] *required*
    - **quantity** (int): Quantity available *required*
    - **condition** (enum): [good, fair, needs_replacement, out_of_order] *required*
    - **last_checked** (date): Last inspection date
- **mileage_km** (int): Total vehicle mileage
- **insurance_expiry** (date): Insurance expiration date
- **maintenance_due** (date): Next scheduled maintenance
- **last_maintenance_date** (date): Last maintenance performed
- **is_active** (bool): Vehicle is in active use *default: true*
- **is_available** (bool): Available for assignment *default: true*

### user_account
Authentication and authorization for user logins
- **id** (uuid): Primary key
- **created_at** (timestamp): Creation timestamp
- **contact_id** (uuid → contact): Linked contact record *required* *unique*
- **password** (password): Hashed password *required*
- **role_id** (uuid → user_role): User role for RBAC *required*
- **scopes** (enum): Additional permissions [planning, sales_manager]
- **user_organization_id** (uuid → organization): User's organization
- **is_active** (bool): Account is active
- **email_verified** (bool): Email has been verified
- **email_verification_token** (text): Token for email verification
- **last_login** (timestamp): Last successful login
- **login_attempts** (int): Failed login attempts counter
- **account_locked_until** (timestamp): Account lockout expiry
- **password_reset_token** (text): Password reset token
- **password_reset_expires** (timestamp): Token expiry time
- **two_factor_enabled** (bool): 2FA is enabled
- **two_factor_secret** (text): 2FA secret key

### user_role
Role-based access control definitions
- **id** (uuid): Primary key
- **created_at** (timestamp): Creation timestamp
- **role_name** (text): Role identifier (admin, manager, user, technician) *required*
- **description** (text): Role description
- **is_active** (bool): Role is active *default: true*
- **permissions** (object): Detailed permission configuration
  - **resources** (array): Resource access permissions
  - **organizations** (array): Organization scope
  - **contacts** (array): Contact access rules
  - **visits** (array): Visit management permissions
  - **invoices** (array): Financial permissions
  - **communication_messages** (array): Communication access
  - **audit_logs** (array): Audit trail access
  - **data_filters** (object): Data filtering rules
    - **organization_scope** (text): Access scope
    - **user_scope** (text): User-level restrictions

### user_session
Active user sessions for JWT management
- **id** (uuid): Primary key
- **created_at** (timestamp): Creation timestamp
- **user_id** (uuid → user_account): Logged in user *required*
- **token_hash** (text): Hashed JWT token *required*
- **ip_address** (text): Client IP address
- **user_agent** (text): Browser/client info
- **last_activity** (timestamp): Last activity timestamp
- **expires_at** (timestamp): Session expiry *required*
- **revoked** (bool): Session has been revoked *default: false*
- **revoke_reason** (text): Reason for revocation

## Status Tracking Tables

### 7. entity_current_status
Current status snapshot for any entity.
```sql
- id (uuid, primary key)
- entity_type (text, required)
- entity_id (uuid, required)
- current_status (text, required)
- status_since (timestamp, required)
- assigned_user_id (uuid, foreign key → contact)
- assigned_team_id (uuid, foreign key → team)
- sla_deadline (timestamp)
- is_overdue (boolean, default: false)
- last_transition_id (uuid, foreign key → status_transition)
- created_at (timestamp)
- updated_at (timestamp)
- UNIQUE(entity_type, entity_id)
```

### 8. status_transition
Complete status change history.
```sql
- id (uuid, primary key)
- entity_type (text, required)
- entity_id (uuid, required)
- from_status (text)
- to_status (text, required)
- transition_reason (text)
- business_context (json)
- triggered_by_contact_id (uuid, foreign key → contact)
- triggered_by_system (text)
- is_milestone (boolean, default: false)
- created_at (timestamp)
```

## Communication Tables

### 9. communication_thread
Conversation threads across all channels.
```sql
- id (uuid, primary key)
- entity_type (enum: order, quote, support_ticket)
- entity_id (uuid)
- channel (enum: email, sms, whatsapp, portal, internal)
- subject (text)
- status (enum: open, pending, resolved, archived)
- priority (enum: low, normal, high, urgent)
- assigned_to_contact_id (uuid, foreign key → contact)
- first_message_at (timestamp)
- last_message_at (timestamp)
- message_count (integer, default: 0)
- created_at (timestamp)
- updated_at (timestamp)
```

### 10. communication_message
Individual messages within threads.
```sql
- id (uuid, primary key)
- thread_id (uuid, foreign key → communication_thread)
- sender_contact_id (uuid, foreign key → contact)
- sender_email (text)
- sender_name (text)
- recipient_emails (json array)
- cc_emails (json array)
- bcc_emails (json array)
- subject (text)
- body_text (text)
- body_html (text)
- attachments (attachment[])
- direction (enum: inbound, outbound)
- status (enum: draft, sent, delivered, failed, read)
- external_message_id (text)
- created_at (timestamp)
- updated_at (timestamp)
```

## Communication & CRM Tables

### phone_number
Phone numbers for contacts (E.164 format)
- **id** (uuid): Primary key
- **created_at** (timestamp): Creation timestamp
- **contact_id** (uuid → contact): Associated contact
- **phone_number** (text): E.164 formatted number *required*
- **country_name** (text): Country name
- **country_code** (text): Country dialing code
- **timezone** (text): Phone number timezone

### business_phone_number  
Business phone numbers synced from telephony system
- **id** (uuid): Primary key
- **created_at** (timestamp): Creation timestamp
- **last_synced** (timestamp): Last sync with telephony system
- **aircall_id** (text): External ID in Aircall *required*
- **name** (text): Display name *required*
- **digits** (text): Phone number digits *required*
- **business_entity_id** (uuid → business_entity): Owning business entity

### call
Call tracking and history
- **id** (uuid): Primary key
- **created_at** (timestamp): Record creation
- **business_phone_number_id** (uuid → business_phone_number): Business number used
- **call_id** (text): External call ID from telephony
- **call_uuid** (text): Call UUID from telephony
- **cost** (decimal): Call cost
- **phone_number_id** (uuid → phone_number): Customer phone number
- **direction** (enum): Call direction [inbound, outbound]
- **status** (enum): Call status [initial, ringing, answered, completed, busy, failed, no_answer]
- **duration** (int): Duration in seconds
- **started_at** (timestamp): Call start time
- **answered_at** (timestamp): When answered
- **ended_at** (timestamp): Call end time
- **direct_link** (text): API link to call details
- **recording_url** (text): Recording URL if available
- **voicemail_url** (text): Voicemail URL if left
- **hangup_cause** (text): Termination reason
- **missed_call_reason** (text): Why call was missed
- **tags** (json): Call tags
- **teams** (json): Teams that handled call
- **ivr_options** (json): IVR flow data
- **comments** (json): Call notes
- **asset** (text): Related asset info

### communication_channel
// ... existing code ...

## System Tables

### 11. number_sequence
Sequential number generation per entity and type.
```sql
- id (uuid, primary key)
- business_entity (enum: chargecars, laderthuis, meterkastthuis, zaptecshop, ratioshop)
- number_type (enum: order, quote, invoice, visit)
- year (integer, required)
- current_sequence (integer, required)
- prefix (text)
- max_sequence_reached (integer)
- last_generated_at (timestamp)
- created_at (timestamp)
- updated_at (timestamp)
- UNIQUE(business_entity, number_type, year)
```

### 12. audit_log
Comprehensive audit trail for all changes.
```sql
- id (uuid, primary key)
- table_name (text, required)
- record_id (uuid, required)
- action (enum: CREATE, UPDATE, DELETE, STATUS_CHANGE)
- old_values (json)
- new_values (json)
- changed_by_contact_id (uuid, foreign key → contact)
- change_summary (text)
- business_context (json)
- ip_address (text)
- user_agent (text)
- created_at (timestamp)
```

### 13. attachment
Centralized file storage.
```sql
- id (uuid, primary key)
- entity_type (text, required)
- entity_id (uuid, required)
- file_name (text, required)
- file_type (text)
- file_size (integer)
- file_url (text, required)
- mime_type (text)
- uploaded_by_contact_id (uuid, foreign key → contact)
- is_public (boolean, default: false)
- metadata (json)
- created_at (timestamp)
```

### 14. partner_integration
Partner API configurations.
```sql
- id (uuid, primary key)
- partner_organization_id (uuid, foreign key → organization)
- integration_name (text, required)
- integration_type (enum: api, webhook, sftp, email)
- api_base_url (text)
- api_key (text, encrypted)
- api_secret (text, encrypted)
- webhook_url (text)
- webhook_secret (text)
- is_active (boolean, default: false)
- status_mapping (json)
- field_mapping (json)
- rate_limit (integer)
- last_sync_at (timestamp)
- sync_frequency_minutes (integer)
- error_count (integer, default: 0)
- last_error_at (timestamp)
- last_error_message (text)
- created_at (timestamp)
- updated_at (timestamp)
```

### 15. business_entity
Configuration for each business entity.
```sql
- id (uuid, primary key)
- entity_code (enum: chargecars, laderthuis, meterkastthuis, zaptecshop, ratioshop)
- legal_name (text, required)
- trade_name (text)
- kvk_number (text)
- vat_number (text)
- bank_account (text)
- email_domains (json array)
- communication_channels (json)
- branding_config (json)
- is_active (boolean, default: true)
- created_at (timestamp)
- updated_at (timestamp)
```

## Indexes

### Performance Indexes
```sql
CREATE INDEX idx_order_customer ON order(customer_organization_id);
CREATE INDEX idx_order_partner ON order(partner_organization_id);
CREATE INDEX idx_order_status ON order(order_status);
CREATE INDEX idx_contact_org ON contact(organization_id);
CREATE INDEX idx_address_entity ON address(entity_type, entity_id);
CREATE INDEX idx_status_entity ON entity_current_status(entity_type, entity_id);
CREATE INDEX idx_transition_entity ON status_transition(entity_type, entity_id);
CREATE INDEX idx_audit_table_record ON audit_log(table_name, record_id);
```

## Notes

1. All tables use UUID primary keys for better distribution and security
2. Timestamps are stored in UTC
3. Sensitive data (API keys, secrets) must be encrypted at rest
4. All monetary values are stored as decimal(10,2)
5. Status fields use text type for flexibility, validated at application level
6. JSON fields use Xano's json type for proper indexing and querying

## Pending Decisions

- [ ] Full schema for `visit` table
- [ ] Schema for `quote` and `invoice` tables
- [ ] Detailed `notification` table structure
- [ ] `team` and permission management tables 