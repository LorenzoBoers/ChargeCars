# ChargeCars V2 - Ticket System Update ✅ COMPLETED
**Datum:** 15 juni 2025  
**Status:** ✅ IMPLEMENTATION COMPLETE
**Doel:** Support ticket tabel generiek maken voor support EN sales tickets  

---

## ✅ IMPLEMENTATIE VOLTOOID

### 1. Schema Updates ✅ DONE
- [x] ticket_type enum toegevoegd (support/sales/inquiry)
- [x] quote_id veld toegevoegd  
- [x] assigned_department enum toegevoegd
- [x] category enum uitgebreid met sales categories
- [x] Sales-specifieke velden toegevoegd:
  - opportunity_value (decimal)
  - sales_stage (enum)
  - lead_source (text)
  - conversion_probability (int)

### 2. Status Engine Integration ✅ DONE
- [x] "ticket" toegevoegd aan entity_type enums in:
  - status_configuration tabel
  - status_workflow tabel  
- [x] 6 ticket status configuraties toegevoegd
- [x] 3 verschillende workflows gecreëerd:
  - Support Ticket Workflow
  - Sales Ticket Workflow  
  - General Inquiry Workflow

### 3. Number Sequences ✅ DONE
- [x] 8 number sequences toegevoegd voor alle business entities:
  - ticket_support (SUP-2025-00001)
  - ticket_sales (SAL-2025-00001)
  - ticket_inquiry (INQ-2025-00001)

### 4. Test Data ✅ DONE
- [x] 3 test tickets aangemaakt:
  - SUP-2025-00001: Technical support ticket
  - SAL-2025-00001: Sales lead ticket  
  - INQ-2025-00001: General inquiry ticket

## 🎯 WORKFLOW VERSCHILLEN

### Support Workflow (8h response, 72h resolution)
```
new → open → pending → resolved → closed
      ↓
   cancelled
```
**Focus:** Technische problemen oplossen, klant tevreden houden

### Sales Workflow (4h response, 48h resolution)  
```
new → open → pending → resolved → closed
      ↓
   cancelled
```
**Focus:** Lead kwalificatie, snelle conversie naar order

### Inquiry Workflow (8h response, 48h resolution)
```
new → open → resolved → closed
      ↓
   cancelled  
```
**Focus:** Informatie verstrekken, doorverwijzen naar juiste afdeling

## 📊 TEST DATA OVERZICHT

| Ticket | Type | Category | Department | Opportunity | Sales Stage |
|--------|------|----------|------------|-------------|-------------|
| SUP-2025-00001 | Support | Technical | Technical | - | - |
| SAL-2025-00001 | Sales | New Lead | Sales | €4,500 | Lead |
| INQ-2025-00001 | Inquiry | Information | - | - | - |

## 🚀 NEXT STEPS

1. **API Functions Implementeren:**
   - createTicket (met ticket_type routing)
   - updateTicketStatus (via status engine)
   - getTicketsByType
   - convertSalesTicketToOrder

2. **Notification Logic:**
   - Department-specific routing
   - SLA monitoring per ticket type
   - Escalation rules

3. **Frontend Integration:**
   - Ticket type selection
   - Department-specific forms
   - Sales pipeline tracking

---

**✅ Database is ready for ticket system with support/sales differentiation!**

---

## 🎯 VOORGESTELDE WIJZIGINGEN

### 1. Tabel Hernoemen
```yaml
Van: support_ticket (ID: 106)
Naar: ticket (meer generiek)
```

### 2. Schema Updates

#### Nieuw veld: ticket_type
```yaml
ticket_type: enum
values:
  - support     # Support vragen/problemen
  - sales       # Sales leads/opportunities
  - inquiry     # Algemene vragen
description: "Type of ticket to route to correct department"
```

#### Update category enum voor beide types
```yaml
category: enum
values:
  # Support categories:
  - technical
  - billing
  - scheduling
  - complaint
  - installation_issue
  
  # Sales categories:
  - new_lead
  - quote_request
  - product_inquiry
  - partnership_inquiry
  
  # Shared:
  - information
  - other
```

#### Nieuwe velden voor sales
```yaml
# Sales-specifieke velden:
opportunity_value: decimal (nullable)
  description: "Estimated value for sales opportunities"

sales_stage: enum (nullable)
  values:
    - lead
    - qualified
    - proposal
    - negotiation
    - won
    - lost

lead_source: text (nullable)
  description: "Where the lead came from"

conversion_probability: int (nullable)
  description: "Probability of conversion 0-100%"

quote_id: uuid (nullable)
  description: "Link to generated quote if applicable"
  ref: quote
```

#### Update ticket_number format
```yaml
ticket_number: text
description: "Format based on type: SUP-2025-00001 or SAL-2025-00001"
```

#### Department routing
```yaml
assigned_department: enum (new field)
values:
  - support
  - sales
  - technical
  - billing
  - management
description: "Department handling this ticket"
```

### 3. Complete Updated Schema

```yaml
Table: ticket (renamed from support_ticket)
Fields:
  # Core fields (unchanged):
  - id: uuid
  - created_at: timestamp
  - updated_at: timestamp
  
  # Type en nummer:
  - ticket_type: enum [support, sales, inquiry] ✨ NEW
  - ticket_number: text (SUP/SAL/INQ-2025-00001)
  
  # Relations:
  - order_id: uuid (ref: order, nullable)
  - quote_id: uuid (ref: quote, nullable) ✨ NEW
  - customer_organization_id: uuid (ref: organization)
  - contact_id: uuid (ref: contact)
  - business_entity_id: uuid (ref: business_entity)
  
  # Categorization:
  - category: enum [extended list] ✨ UPDATED
  - priority: enum [low, normal, high, urgent]
  - status: enum [new, open, pending, resolved, closed, cancelled]
  
  # Content:
  - subject: text
  - description: text
  - resolution: text
  
  # Assignment:
  - assigned_to: uuid (ref: user_account)
  - assigned_department: enum ✨ NEW
  
  # SLA:
  - response_sla_hours: int
  - resolution_sla_hours: int
  - first_response_at: timestamp
  - resolved_at: timestamp
  - closed_at: timestamp
  
  # Sales fields (all nullable): ✨ NEW
  - opportunity_value: decimal
  - sales_stage: enum
  - lead_source: text
  - conversion_probability: int
  
  # Feedback:
  - satisfaction_rating: int (1-5)
```

### 4. Impact op Number Sequences

Update number sequences om verschillende prefixes te ondersteunen:
```yaml
number_sequence updates:
- number_type: 'support_ticket' → 'ticket_support'
- number_type: 'ticket_sales' (nieuw)
- number_type: 'ticket_inquiry' (nieuw)
```

### 5. API Endpoint Updates

```yaml
Van:
POST /support/tickets
GET /support/tickets/{id}

Naar:
POST /tickets
GET /tickets/{id}
GET /tickets?type=support
GET /tickets?type=sales
```

### 6. Voordelen van deze aanpak

1. **Unified ticketing** - Één systeem voor alle klantinteracties
2. **Better routing** - Automatisch naar juiste afdeling
3. **Sales pipeline** - Track opportunities in ticketing
4. **Consistent SLAs** - Zelfde SLA tracking voor sales en support
5. **Complete customer view** - Alle interacties in één systeem

---

## 🚀 IMPLEMENTATIE IN XANO

### Stap 1: Update tabel schema
```sql
-- In Xano:
1. Ga naar support_ticket tabel
2. Rename naar "ticket"
3. Add nieuwe velden via schema editor
4. Update enums
```

### Stap 2: Update number generation
```javascript
// In generateEntityNumber function:
switch(document_type) {
  case 'ticket_support':
    prefix = 'SUP';
    break;
  case 'ticket_sales':
    prefix = 'SAL';
    break;
  case 'ticket_inquiry':
    prefix = 'INQ';
    break;
}
```

### Stap 3: Update API endpoints
```javascript
// createTicket function:
if (input.ticket_type === 'sales') {
  // Set sales-specific defaults
  ticket.assigned_department = 'sales';
  ticket.sales_stage = 'lead';
} else if (input.ticket_type === 'support') {
  // Set support defaults
  ticket.assigned_department = 'support';
}
```

---

## 📊 BUSINESS LOGIC UPDATES

### Auto-assignment regels
```yaml
ticket_type: sales
  → assigned_department: sales
  → notify: sales@{business_entity}.nl

ticket_type: support
  category: technical → assigned_department: technical
  category: billing → assigned_department: billing
  default → assigned_department: support
```

### SLA verschillen
```yaml
Sales tickets:
  - response_sla_hours: 4 (sneller voor leads)
  - resolution_sla_hours: 48

Support tickets:
  - response_sla_hours: 8
  - resolution_sla_hours: 72
```

---

**Next steps:** 
1. Implementeer schema wijzigingen in Xano
2. Update number sequences
3. Pas API endpoints aan
4. Test met beide ticket types 