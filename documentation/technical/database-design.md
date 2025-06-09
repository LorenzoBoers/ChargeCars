# ChargeCars V2 - Database Design Documentation
**Laatste Update:** 8 juni 2025  
**Status:** In Productie  
**Type:** Contact-Centric Architecture

## 🏗️ Architectuur Overzicht

### Contact-Centric Model
ChargeCars V2 gebruikt een **unified contact model** waarbij zowel personen als organisaties in dezelfde `contact` tabel worden opgeslagen. Dit maakt oneindig channelen mogelijk via hiërarchische relaties.

### Key Design Decisions
1. **Geen aparte organization tabel** - Alles is een contact
2. **Hiërarchische structuur** via `parent_organization_id`
3. **Multi-contact orders** voor channel support
4. **Flexibele commissie structuur** voor channel partners

## 📊 Core Tables

### 1. Contact (Unified Model)
De `contact` tabel is het hart van het systeem:
- **Personen**: `contact_type = 'person'`
- **Organisaties**: `contact_type = 'organization'`
- **Channeling**: via `parent_organization_id` hiërarchie

### 2. Order (Multi-Contact)
Orders hebben drie contact relaties:
- **account_contact_id**: Bepaalt pricing en toegang
- **end_customer_contact_id**: De eindgebruiker
- **channel_contact_ids[]**: Array van channel partners

## 🔄 Channel Hierarchie

### Oneindig Channelen
Het systeem ondersteunt onbeperkte channel levels:
```
Master Distributor
└── Regional Partner
    └── Local Dealer
        └── Sub-dealer
            └── Sales Agent
                └── End Customer
```

### Parent-Child Relaties
- Elke contact kan een `parent_organization_id` hebben
- Top-level organisaties hebben `parent_organization_id = NULL`
- Personen verwijzen naar hun organisatie
- Organisaties verwijzen naar hun parent/dealer

## 💰 Commissie Model

### Multi-Level Commissies
```sql
partner_commission:
- order_id: Link naar order
- beneficiary_contact_id: Wie krijgt commissie
- commission_level: Level in hierarchy (1, 2, 3, etc.)
- commission_amount: Bedrag
- commission_rate: Percentage
```

### Commissie Cascade
Bij een order via channels:
1. Bereken commissie per channel level
2. Maak commission records voor elke partner
3. Track payment status per partner

## 🔐 Access Control

### Contact-Based Permissions
- Toegang wordt bepaald via contact relaties
- Channel partners zien alleen hun eigen orders
- Parent organisaties kunnen child orders zien
- Personen zien orders van hun organisatie

### Order Visibility Rules
```
IF user.contact_id = order.account_contact_id
   OR user.contact_id = order.end_customer_contact_id
   OR user.contact_id IN order.channel_contact_ids
   OR user.parent_organization_id IN (recursive check)
THEN allow access
```

## 📋 Implementation Examples

### 1. Create Organization Contact
```sql
INSERT INTO contact (
  contact_type, 
  contact_subtype,
  display_name,
  first_name,
  last_name,
  parent_organization_id
) VALUES (
  'organization',
  'Partner',
  'ABC Dealers BV',
  'ABC',
  'Dealers BV',
  NULL -- top level
);
```

### 2. Create Person in Organization
```sql
INSERT INTO contact (
  contact_type,
  contact_subtype,
  first_name,
  last_name,
  email,
  parent_organization_id
) VALUES (
  'person',
  'Partner',
  'Jan',
  'Jansen',
  'jan@abcdealers.nl',
  [ABC_Dealers_UUID]
);
```

### 3. Create Channel Order
```sql
INSERT INTO order (
  order_number,
  account_contact_id,
  end_customer_contact_id,
  channel_contact_ids,
  business_entity_id
) VALUES (
  'CC-2025-001',
  [Conglomeraat_UUID],
  [End_Customer_UUID],
  ARRAY[Conglomeraat_UUID, Dealer_UUID],
  [ChargeCars_Entity_UUID]
);
```

## 🚀 Query Patterns

### Get Organization Hierarchy
```sql
WITH RECURSIVE org_tree AS (
  SELECT id, display_name, parent_organization_id, 0 as level
  FROM contact
  WHERE id = $1 AND contact_type = 'organization'
  
  UNION ALL
  
  SELECT c.id, c.display_name, c.parent_organization_id, ot.level + 1
  FROM contact c
  JOIN org_tree ot ON c.parent_organization_id = ot.id
  WHERE c.contact_type = 'organization'
)
SELECT * FROM org_tree ORDER BY level;
```

### Get All Channel Orders
```sql
SELECT o.*
FROM order o
WHERE $contact_id = ANY(
  SELECT unnest(
    ARRAY[
      o.account_contact_id,
      o.end_customer_contact_id
    ] || o.channel_contact_ids
  )
);
```

### Calculate Channel Commissions
```sql
SELECT 
  c.display_name,
  pc.commission_level,
  pc.commission_rate,
  pc.commission_amount
FROM partner_commission pc
JOIN contact c ON pc.beneficiary_contact_id = c.id
WHERE pc.order_id = $order_id
ORDER BY pc.commission_level;
```

## 🔧 Migration Considerations

### From Organization Table
1. **Export organization data**
2. **Transform to contact format**:
   - Set `contact_type = 'organization'`
   - Map organization fields to contact fields
   - Preserve relationships

### Update Foreign Keys
```sql
-- Example: Update old organization references
UPDATE order 
SET account_contact_id = (
  SELECT id FROM contact 
  WHERE legacy_organization_id = customer_organization_id
  AND contact_type = 'organization'
);
```

### Data Validation
- Ensure all organizations have `contact_type = 'organization'`
- Verify parent_organization_id references are valid
- Check order contact references exist

## 📈 Performance Optimization

### Indexes
```sql
CREATE INDEX idx_contact_type ON contact(contact_type);
CREATE INDEX idx_parent_org ON contact(parent_organization_id);
CREATE INDEX idx_order_account ON order(account_contact_id);
CREATE INDEX idx_order_customer ON order(end_customer_contact_id);
CREATE INDEX idx_channel_contacts ON order USING GIN(channel_contact_ids);
```

### Materialized Views
Voor snelle hierarchy lookups:
```sql
CREATE MATERIALIZED VIEW contact_hierarchy AS
WITH RECURSIVE tree AS (
  -- hierarchy query
)
SELECT * FROM tree;

CREATE INDEX ON contact_hierarchy(child_id, parent_id);
```

## 🎯 Best Practices

### Contact Creation
1. **Organizations eerst** - Maak parent orgs voor children
2. **Validate hierarchy** - Voorkom circular references
3. **Set proper type** - person vs organization
4. **Link correctly** - parent_organization_id

### Order Management
1. **Validate contacts** - Alle contact IDs moeten bestaan
2. **Channel array** - Volgorde is belangrijk voor commissies
3. **Account determines price** - account_contact_id is leidend
4. **Track changes** - Audit trail voor channel wijzigingen

### Commission Handling
1. **Level tracking** - Commission level = position in channel
2. **Rate inheritance** - Van parent org of specifiek
3. **Payment grouping** - Per beneficiary per periode
4. **Status workflow** - pending → approved → paid

## 🔍 Common Queries

### Find All Organizations
```sql
SELECT * FROM contact 
WHERE contact_type = 'organization'
ORDER BY display_name;
```

### Get Organization Members
```sql
SELECT * FROM contact
WHERE parent_organization_id = $org_id
AND contact_type = 'person'
ORDER BY last_name, first_name;
```

### Channel Order Summary
```sql
SELECT 
  o.order_number,
  account.display_name as account_name,
  customer.display_name as customer_name,
  array_length(o.channel_contact_ids, 1) as channel_depth
FROM order o
JOIN contact account ON o.account_contact_id = account.id
JOIN contact customer ON o.end_customer_contact_id = customer.id;
``` 