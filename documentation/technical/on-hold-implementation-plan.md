# ChargeCars V2 - "On Hold" Workflow Implementatieplan

**Datum:** 15 juni 2025  
**Status:** Klaar voor Implementatie  
**Urgentie:** Hoog - Directe Business Need

## 🎯 Directe Implementatie (Deze Week)

### Stap 1: Nieuwe Database Tabel Aanmaken (30 min)

#### A. `order_hold_details` Tabel via MCP
```sql
-- Via Xano database interface
CREATE TABLE order_hold_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT NOW(),
    order_id UUID NOT NULL,
    hold_reason_category TEXT NOT NULL,
    hold_reason_details TEXT NOT NULL,
    estimated_resume_date DATE,
    escalation_date DATE,
    escalation_level TEXT DEFAULT 'none',
    created_by_user_id UUID,
    is_active BOOLEAN DEFAULT TRUE,
    resolved_at TIMESTAMP,
    resolved_by_user_id UUID,
    resolution_notes TEXT,
    customer_notified BOOLEAN DEFAULT FALSE,
    partner_notified BOOLEAN DEFAULT FALSE,
    automatic_followup_date DATE
);
```

#### B. Indexes voor Performance
```sql
CREATE INDEX idx_order_hold_active ON order_hold_details(order_id, is_active);
CREATE INDEX idx_hold_escalation_date ON order_hold_details(escalation_date) WHERE is_active = TRUE;
CREATE INDEX idx_hold_resume_date ON order_hold_details(estimated_resume_date) WHERE is_active = TRUE;
```

### Stap 2: Status Configuration Populeren (45 min)

```sql
-- Order status configuraties
INSERT INTO status_configuration (
    entity_type, status_code, status_label, status_category, status_order,
    is_final_status, requires_reason, sla_hours, is_customer_visible,
    customer_display_name, status_color, valid_transitions, is_active
) VALUES 
-- Bestaande statussen
('order', 'intake_completed', 'Intake Afgerond', 'pending', 1, FALSE, FALSE, 24, TRUE, 'Aanvraag ontvangen', '#007BFF', 'quote_draft,on_hold', TRUE),
('order', 'quote_draft', 'Offerte Concept', 'pending', 2, FALSE, FALSE, 48, FALSE, 'Offerte wordt voorbereid', '#FFC107', 'quote_ready,on_hold', TRUE),
('order', 'quote_ready', 'Offerte Klaar', 'pending', 3, FALSE, FALSE, 2, TRUE, 'Offerte gereed voor verzending', '#17A2B8', 'quote_sent,on_hold', TRUE),
('order', 'quote_sent', 'Offerte Verzonden', 'pending', 4, FALSE, FALSE, 168, TRUE, 'Offerte verzonden', '#28A745', 'customer_approved,on_hold,cancelled', TRUE),
('order', 'customer_approved', 'Klant Akkoord', 'pending', 5, FALSE, FALSE, 24, TRUE, 'Goedgekeurd door klant', '#20C997', 'partner_approved,both_approved,on_hold', TRUE),
('order', 'partner_approved', 'Partner Akkoord', 'pending', 6, FALSE, FALSE, 24, FALSE, 'Goedgekeurd door partner', '#20C997', 'both_approved,on_hold', TRUE),
('order', 'both_approved', 'Volledig Akkoord', 'in_progress', 7, FALSE, FALSE, 48, TRUE, 'Volledig goedgekeurd', '#28A745', 'planning,on_hold', TRUE),
('order', 'planning', 'In Planning', 'in_progress', 8, FALSE, FALSE, 72, TRUE, 'Planning wordt gemaakt', '#FD7E14', 'scheduled,on_hold', TRUE),
('order', 'scheduled', 'Ingepland', 'in_progress', 9, FALSE, FALSE, NULL, TRUE, 'Afspraak ingepland', '#6610F2', 'in_progress,on_hold', TRUE),
('order', 'in_progress', 'In Uitvoering', 'in_progress', 10, FALSE, FALSE, NULL, TRUE, 'Wordt uitgevoerd', '#007BFF', 'completed,on_hold', TRUE),
('order', 'completed', 'Afgerond', 'completed', 11, TRUE, FALSE, NULL, TRUE, 'Succesvol afgerond', '#28A745', '', TRUE),
('order', 'cancelled', 'Geannuleerd', 'cancelled', 12, TRUE, TRUE, NULL, TRUE, 'Geannuleerd', '#DC3545', '', TRUE),

-- Nieuwe ON HOLD status
('order', 'on_hold', 'On Hold', 'pending', 13, FALSE, TRUE, NULL, TRUE, 'Tijdelijk uitgesteld', '#FFA500', 'intake_completed,quote_draft,quote_ready,quote_sent,customer_approved,partner_approved,both_approved,planning,scheduled,in_progress,cancelled', TRUE);
```

### Stap 3: Xano API Functions Implementeren (2 uur)

#### A. `order_hold_create` Functie
```javascript
// Input parameters
{
  "order_id": "uuid",
  "hold_reason_category": "string",
  "hold_reason_details": "string", 
  "estimated_resume_date": "date",
  "notify_customer": "boolean",
  "notify_partner": "boolean"
}

// Function logic (NoCode)
1. Validate order exists and is not already on hold
2. Create record in order_hold_details
3. Update order status to "on_hold"
4. Create status_transition record
5. Update entity_current_status cache
6. If notify flags = true, trigger communication
7. Return success response
```

#### B. `order_hold_resolve` Functie
```javascript
// Input parameters
{
  "order_id": "uuid",
  "resolution_notes": "string",
  "new_status": "string", // optional, defaults to previous status
  "new_planned_date": "date" // optional
}

// Function logic (NoCode)
1. Find active hold record for order
2. Mark hold as resolved (is_active = false)
3. Update order status to new_status
4. Create status_transition record
5. Update entity_current_status cache
6. Send resolution notification
7. Return success response
```

#### C. `order_bulk_hold` Functie
```javascript
// Input parameters
{
  "order_ids": ["uuid"],
  "hold_reason_category": "string",
  "hold_reason_details": "string",
  "estimated_resume_date": "date"
}

// Function logic (NoCode)
1. Loop through order_ids
2. For each order, call order_hold_create
3. Collect success/failure results
4. Return bulk operation summary
```

### Stap 4: Basic Communication Templates (1 uur)

```sql
INSERT INTO communication_template (
    template_name, template_type, subject_template, body_template, 
    trigger_conditions, is_active
) VALUES 
(
    'Order On Hold - Customer Notification',
    'email',
    'Order {{order_number}} - Tijdelijk Uitgesteld',
    'Beste {{customer_name}},

Uw order {{order_number}} is tijdelijk uitgesteld.

**Reden:** {{hold_reason_details}}
**Verwachte hervatting:** {{estimated_resume_date}}

Wij houden u op de hoogte van verdere ontwikkelingen. Voor vragen kunt u contact met ons opnemen.

Met vriendelijke groet,
Team {{business_entity_name}}',
    '{"status_change": "on_hold", "recipient": "customer"}',
    TRUE
),
(
    'Order On Hold - Partner Notification', 
    'email',
    'Order {{order_number}} - On Hold Status Update',
    'Dear Partner,

Order {{order_number}} has been placed on hold.

**Reason:** {{hold_reason_details}}
**Estimated Resume:** {{estimated_resume_date}}
**Customer:** {{customer_name}}

Please update your systems accordingly.

Best regards,
ChargeCars Team',
    '{"status_change": "on_hold", "recipient": "partner"}',
    TRUE
),
(
    'Order Resume - Customer Notification',
    'email', 
    'Order {{order_number}} - Hervatting Planning',
    'Beste {{customer_name}},

Goed nieuws! Uw order {{order_number}} wordt hervat.

**Nieuwe planning:** {{new_planned_date}}
**Opmerkingen:** {{resolution_notes}}

Wij nemen binnenkort contact met u op voor verdere afspraken.

Met vriendelijke groet,
Team {{business_entity_name}}',
    '{"status_change": "resume", "recipient": "customer"}',
    TRUE
);
```

## 🚀 Quick Implementation via MCP (Nu Uitvoeren)

### Direct Implementeerbare MCP Commando's

1. **Tabel Aanmaken:**
```bash
# Via Python MCP script
python3 -c "
import chargecars_mcp
mcp = chargecars_mcp.ChargeCarseMCP()
mcp.create_order_hold_table()
"
```

2. **Status Configuration:**
```bash
# Via MCP bulk insert
python3 -c "
import chargecars_mcp
mcp = chargecars_mcp.ChargeCarseMCP() 
mcp.populate_order_status_config()
"
```

### Stap-voor-Stap Implementatie (Vandaag)

#### Stap 1: Database Wijzigingen (15 min)
1. Open Xano workspace "ChargeCars V2"
2. Ga naar Database → Tables
3. Create nieuwe tabel `order_hold_details` met bovenstaande schema
4. Maak de indexes aan

#### Stap 2: Status Configuration (15 min)  
1. Ga naar `status_configuration` tabel
2. Insert alle order status records (zie SQL boven)
3. Verificeer dat alle statussen correct zijn aangemaakt

#### Stap 3: Basic API (45 min)
1. Ga naar API → Functions
2. Create `order_hold_create` function
3. Create `order_hold_resolve` function  
4. Test beide functions met sample data

#### Stap 4: Communication Setup (30 min)
1. Ga naar `communication_template` tabel
2. Insert de 3 email templates
3. Test template rendering met sample data

## 📋 Testing Checklist

### Functionele Tests
- [ ] Order kan "on hold" gezet worden met reden
- [ ] Hold status wordt correct opgeslagen in database
- [ ] Status transition wordt gelogd
- [ ] Entity current status wordt geupdate  
- [ ] Order kan resumed worden naar vorige status
- [ ] Hold history is beschikbaar per order
- [ ] Bulk hold operations werken correct
- [ ] Email templates renderen correct

### Edge Cases
- [ ] Order al on hold → Error handling
- [ ] Invalid order_id → Proper error response
- [ ] Missing required fields → Validation errors
- [ ] Concurrent hold/resume operations → Race condition handling

### Performance Tests
- [ ] Single hold operation < 500ms
- [ ] Bulk hold (10 orders) < 2 seconds
- [ ] Hold history query < 200ms
- [ ] Dashboard data < 1 second

## 🔄 Workflow Scenarios

### Scenario 1: Customer Delay
```json
POST /api/orders/f75ead6a-1960-4b33-b98c-47c640fda568/hold
{
  "hold_reason_category": "customer_delay",
  "hold_reason_details": "Klant heeft vakantie, wil installatie na 15 juli",
  "estimated_resume_date": "2025-07-16",
  "notify_customer": true,
  "notify_partner": true
}
```

### Scenario 2: Supplier Issue
```json
POST /api/orders/bulk-hold
{
  "order_ids": ["uuid1", "uuid2", "uuid3"],
  "hold_reason_category": "supplier_delay", 
  "hold_reason_details": "Wallbox leverancier heeft productie vertraging",
  "estimated_resume_date": "2025-08-01"
}
```

### Scenario 3: Resume Order
```json
PUT /api/orders/f75ead6a-1960-4b33-b98c-47c640fda568/resume
{
  "resolution_notes": "Klant is terug van vakantie, nieuwe afspraak gemaakt",
  "new_status": "scheduled",
  "new_planned_date": "2025-07-20"
}
```

## 📊 Immediate Dashboard Widgets

### Widget 1: Active Holds Summary
```sql
SELECT 
    COUNT(*) as total_holds,
    SUM(CASE WHEN escalation_date < NOW() THEN 1 ELSE 0 END) as overdue_holds,
    AVG(EXTRACT(DAYS FROM (NOW() - created_at))) as avg_hold_duration
FROM order_hold_details 
WHERE is_active = TRUE;
```

### Widget 2: Holds by Category
```sql
SELECT 
    hold_reason_category,
    COUNT(*) as count,
    AVG(EXTRACT(DAYS FROM (NOW() - created_at))) as avg_duration
FROM order_hold_details 
WHERE is_active = TRUE
GROUP BY hold_reason_category
ORDER BY count DESC;
```

### Widget 3: Resume Schedule
```sql
SELECT 
    estimated_resume_date,
    COUNT(*) as orders_to_resume
FROM order_hold_details 
WHERE is_active = TRUE 
  AND estimated_resume_date BETWEEN NOW() AND NOW() + INTERVAL '7 days'
GROUP BY estimated_resume_date
ORDER BY estimated_resume_date;
```

## ⚡ Immediate Benefits

### Week 1 Results:
- ✅ Complete hold/resume workflow operational
- ✅ Automatic customer/partner notifications
- ✅ Full audit trail of all hold activities
- ✅ Basic dashboard for hold management
- ✅ Bulk operations for efficiency

### Month 1 Results:
- 📈 30% reduction in customer support calls about order status
- 📈 100% transparency in order delays
- 📈 Improved partner communication and satisfaction
- 📈 Data-driven insights into delay patterns
- 📈 Better resource planning around holds

---

**Status:** Ready voor onmiddellijke implementatie  
**Schatting:** 4 uur voor complete basic functionaliteit  
**Next:** Begin met Stap 1 - Database setup 