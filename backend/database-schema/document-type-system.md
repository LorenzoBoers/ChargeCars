# Document Type System - Slug-Based Configuration

**Last Updated**: 2025-06-15  
**Status**: Implemented in Xano  
**Tables**: document_type (ID: 113), number_sequence (ID: 87), business_entity (ID: 90)

## Overview

Centralized document type management system with **slug-based identification** enabling:
- **Business Entity Specific** document numbering
- **Flexible Slug Configuration** without enum constraints
- **Runtime Number Generation** without hardcoded prefixes
- **Multi-Entity Support** with different prefixes per entity
- **URL-Friendly Slugs** for API integration

## Architecture Benefits

### 1. **Slug Flexibility**
```sql
-- Before: Enum constraints
document_type: "ticket" + document_subtype: "support"

-- After: Free-form slugs
document_slug: "ticket-support"
document_slug: "ticket-sales"
document_slug: "order-standard"
document_slug: "invoice-monthly"
```

### 2. **API-Friendly Design**
```http
GET /api/numbers/generate/order-standard
GET /api/numbers/generate/ticket-support
GET /api/numbers/generate/invoice-monthly
POST /api/document-types/work-order-installation
```

### 3. **Future-Proof Architecture**
- No schema updates for new types
- No enum value additions required
- Unlimited document type variations
- Business-specific naming freedom

## Database Schema

### document_type (ID: 113) - Updated
**Purpose**: Slug-based central configuration for all document types

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | uuid | PK, NOT NULL | Primary key UUID |
| `business_entity_id` | uuid | FK business_entity, NULL | Entity-specific config (null = global) |
| `document_slug` | text | NOT NULL | Machine-readable identifier |
| `name` | text | NOT NULL | Human readable display name |
| `description` | text | NULL | Usage description |
| `prefix` | text | NOT NULL | Document number prefix |
| `number_format` | text | NOT NULL | Format template |
| `sequence_length` | int | NOT NULL, DEFAULT 5 | Padding length |
| `year_format` | enum | NOT NULL | YYYY or YY |
| `reset_sequence` | enum | NOT NULL | never, yearly, monthly |
| `separator` | text | NOT NULL, DEFAULT '-' | Component separator |
| `is_active` | bool | NOT NULL, DEFAULT true | Active status |
| `validation_rules` | json | NULL | Additional validation |
| `metadata` | json | NULL | Extra configuration |
| `sort_order` | int | NOT NULL, DEFAULT 0 | UI display order |

**Enums:**
- `year_format`: YYYY, YY
- `reset_sequence`: never, yearly, monthly

**Key Changes:**
- ✅ `document_slug` replaces `document_type` + `document_subtype`
- ✅ No enum constraints - unlimited flexibility
- ✅ Added `sort_order` for UI organization

## Standard Document Slugs

### Current Configurations
```
order-standard        → CC-2025-00001  (Order Number)
quote-standard        → QU-2025-00001  (Quote Number)
invoice-standard      → INV-2025-00001 (Invoice Number)
work-order-installation → WO-2025-00001  (Work Order Number)
ticket-support        → SUP-2025-0001  (Support Ticket)
ticket-sales          → SAL-2025-0001  (Sales Inquiry)
ticket-inquiry        → INQ-2025-0001  (General Inquiry)
payment-standard      → PAY-2025-000001 (Payment Reference)
form-submission       → FS-2025-00001  (Form Submission)
visit-site-survey     → VIS-2025-0001  (Site Visit)
internal-task         → TASK-2025-0001 (Internal Task)
general-document      → DOC-2025-00001 (General Document)
```

## Multi-Entity Examples

### 1. Entity-Specific Order Numbers
```json
[
  {
    "business_entity_id": "chargecare_nl_uuid",
    "document_slug": "order-standard",
    "name": "ChargeCare NL Order",
    "prefix": "CC-NL",
    "number_format": "{prefix}-{year}-{sequence:5}"
  },
  {
    "business_entity_id": "chargecare_be_uuid", 
    "document_slug": "order-standard",
    "name": "ChargeCare BE Order",
    "prefix": "CC-BE",
    "number_format": "{prefix}-{year}-{sequence:5}"
  },
  {
    "business_entity_id": "ev_installers_uuid",
    "document_slug": "order-premium",
    "name": "EV Premium Installation",
    "prefix": "EV-PREM",
    "number_format": "{prefix}-{year:2}-{sequence:6}"
  }
]
```

**Generated Numbers:**
- ChargeCare NL: `CC-NL-2025-00001`, `CC-NL-2025-00002`
- ChargeCare BE: `CC-BE-2025-00001`, `CC-BE-2025-00002`  
- EV Installers: `EV-PREM-25-000001`, `EV-PREM-25-000002`

### 2. Specialized Document Types
```json
[
  {
    "document_slug": "invoice-monthly-recurring",
    "name": "Monthly Subscription Invoice",
    "prefix": "SUB",
    "reset_sequence": "monthly"
  },
  {
    "document_slug": "quote-emergency-service", 
    "name": "Emergency Service Quote",
    "prefix": "EMRG",
    "number_format": "{prefix}-{year}-{month:2}-{sequence:3}"
  },
  {
    "document_slug": "work-order-maintenance",
    "name": "Maintenance Work Order",
    "prefix": "MAINT",
    "number_format": "{prefix}-{year}-{sequence:4}"
  }
]
```

## Implementation in Xano NoCode

### 1. Generate Number Function - Updated
```yaml
Function Name: generate_document_number
Input Parameters:
  - business_entity_id (text)
  - document_slug (text)

Processing Steps:
1. Resolve Document Type Configuration
   - Query document_type table by slug
   - Try entity-specific first: business_entity_id + document_slug
   - Fallback to global: business_entity_id = NULL + document_slug
   - Return error if no configuration found

2. Get/Create Sequence Record  
   - Query number_sequence table
   - Match business_entity_id + document_type_id + year/month
   - Create if doesn't exist

3. Thread-Safe Increment
   - Lock sequence record (is_locked = true)
   - Increment current_sequence
   - Update max_sequence_reached  
   - Release lock (is_locked = false)

4. Format Number
   - Apply number_format template
   - Handle year formatting (YYYY vs YY)
   - Apply sequence padding
   - Replace separators

5. Audit & Return
   - Log to number_generation_audit table
   - Return formatted number + metadata
```

### 2. Document Slug Resolver Function
```yaml
Function Name: resolve_document_slug
Input Parameters:
  - business_entity_id (text)
  - document_slug (text)

Processing Logic:
1. Try exact match: business_entity_id + document_slug
2. Fallback to global: NULL + document_slug
3. Return configuration or error

Return Object:
- document_type_id
- prefix
- number_format  
- formatting_rules
- validation_rules
- metadata
```

## API Integration - Updated

### 1. Slug-Based Number Generation
```http
POST /api/numbers/generate
Content-Type: application/json

{
  "business_entity_id": "chargecare_nl_uuid",
  "document_slug": "order-standard"
}
```

**Response:**
```json
{
  "success": true,
  "generated_number": "CC-NL-2025-00123",
  "document_info": {
    "document_slug": "order-standard",
    "document_name": "ChargeCare NL Order",
    "document_type_id": "doc_type_uuid"
  },
  "sequence_info": {
    "current_sequence": 123,
    "year": 2025,
    "month": null,
    "format_applied": "CC-NL-{YYYY}-{00000}"
  },
  "audit_id": "audit_uuid"
}
```

### 2. RESTful Document Type Management
```http
GET /api/document-types?business_entity_id={id}
GET /api/document-types/order-standard
POST /api/document-types
PUT /api/document-types/order-standard
DELETE /api/document-types/order-standard
```

### 3. Slug Validation Endpoint
```http
POST /api/document-types/validate-slug
{
  "document_slug": "new-custom-type",
  "business_entity_id": "entity_uuid"
}
```

## Advanced Slug Patterns

### 1. Hierarchical Slugs
```
order-standard
order-premium
order-emergency

ticket-support-l1
ticket-support-l2
ticket-sales-inbound
ticket-sales-outbound

invoice-standard
invoice-recurring
invoice-adjustment
```

### 2. Industry-Specific Slugs
```
installation-residential
installation-commercial
installation-industrial

maintenance-scheduled
maintenance-emergency
maintenance-warranty

quote-basic
quote-premium
quote-enterprise
```

### 3. Process-Specific Slugs
```
approval-manager
approval-technical
approval-financial

review-quality
review-safety
review-compliance
```

## Slug Naming Conventions

### 1. **Format Rules**
- Use lowercase only
- Separate words with hyphens (-)
- Start with main category
- Add specificity with additional terms
- Keep under 50 characters

### 2. **Good Examples**
```
✅ order-standard
✅ ticket-support
✅ invoice-recurring
✅ work-order-installation
✅ quote-emergency-service
```

### 3. **Avoid**
```
❌ Order_Standard (uppercase, underscore)
❌ orderstandard (no separation)
❌ order-std (unclear abbreviation)
❌ very-long-descriptive-slug-name (too long)
```

## Migration from Enum System

### 1. **Mapping Old to New**
```sql
-- Old system mapping
document_type: "order" + document_subtype: NULL 
  → document_slug: "order-standard"

document_type: "ticket" + document_subtype: "support"
  → document_slug: "ticket-support"

document_type: "ticket" + document_subtype: "sales"
  → document_slug: "ticket-sales"
```

### 2. **Migration Script**
```sql
-- Create new slug-based records
INSERT INTO document_type (document_slug, name, prefix, ...)
SELECT 
  CASE 
    WHEN document_type = 'order' THEN 'order-standard'
    WHEN document_type = 'ticket' AND document_subtype = 'support' THEN 'ticket-support'
    WHEN document_type = 'ticket' AND document_subtype = 'sales' THEN 'ticket-sales'
    ELSE CONCAT(document_type, '-standard')
  END as document_slug,
  name,
  prefix,
  ...
FROM old_document_type_table;
```

## Benefits Summary

### 1. **Developer Experience**
- No enum constraints to manage
- URL-friendly identifiers
- Clear, readable API endpoints
- Easy testing and debugging

### 2. **Business Flexibility**  
- Add new document types instantly
- Industry-specific terminology
- Process-specific naming
- No technical limitations

### 3. **Scalability**
- Unlimited document variations
- Multi-entity customization
- Future business requirements
- Third-party integrations

### 4. **Maintenance**
- No schema updates required
- Configuration-driven system
- Self-documenting slugs
- Easy troubleshooting

---

**Document Type System**: Slug-based architecture providing unlimited flexibility, API-friendly design, and future-proof document numbering without enum constraints. 