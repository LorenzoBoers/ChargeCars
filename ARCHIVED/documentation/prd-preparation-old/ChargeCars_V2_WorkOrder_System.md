# ChargeCars V2 - Unified Work Order System

*Gegenereerd op: 31 mei 2025*  
*Xano Workspace: ChargeCars V2*  
*Werkbon Tabel: work_orders (ID: 60)*

## 🎯 **Systeem Overzicht**

Het ChargeCars V2 werkbon systeem digitaliseert het complete installatieproces via een unified workflow die LMRA veiligheidscheck, materialen verificatie, zegel registratie en klant handtekeningen integreert in één tabel.

### **Key Features:**
- ✅ **LMRA als geïntegreerde fase** - Geen aparte tabel, onderdeel van werkbon workflow
- ✅ **Status-driven execution** - 14 statussen van aankomst tot voltooiing  
- ✅ **Zegels als articles** - Normale inventory management via articles tabel
- ✅ **PDF generatie** - Automatic werkbon documenten voor klant en partners
- ✅ **Sign-offs integratie** - Hergebruik van bestaande sign_offs systeem
- ✅ **Real-time tracking** - GPS coordinates en tijdstempels per fase

---

## 📱 **Mobile App Workflow**

### **Status Flow Diagram:**
```
created → arrived_on_site → lmra_in_progress → lmra_approved → materials_checking 
    ↓                           ↓                    ↓
cancelled ← lmra_failed     materials_missing   materials_verified
                                ↓                    ↓
                         materials_added → work_in_progress → work_completed 
                                                ↓
                                        customer_review → customer_signed → completed
```

### **Fase 1: Aankomst op Locatie**
```sql
-- Monteur update bij aankomst
UPDATE work_orders 
SET status = 'arrived_on_site', 
    arrival_time = NOW(),
    gps_coordinates = JSON_OBJECT('lat', 52.228298, 'lng', 5.319585)
WHERE work_order_number = 'WO-2025-001234';
```

**Mobile Screen:**
```
📱 Werkbon WO-2025-001234
===========================
🏠 Adres: Bisschopsweg 123, Baarn
👤 Klant: John Smith
📞 Tel: 06-12345678

🚗 Gearriveerd: 08:30
📍 GPS: 52.228298, 5.319585

[START LMRA VEILIGHEIDSCHECK] ▶️
```

### **Fase 2: LMRA Veiligheidscheck**
```sql
-- LMRA invullen en goedkeuren
UPDATE work_orders 
SET status = 'lmra_approved',
    lmra_started_time = NOW(),
    lmra_electrical_safety = true,
    lmra_proper_equipment = true,
    lmra_workspace_safe = true,
    lmra_customer_informed = true,
    lmra_emergency_procedures = true,
    lmra_risk_level = 'low',
    lmra_identified_risks = JSON_ARRAY('Geen risicos geidentificeerd'),
    lmra_overall_approved = true,
    lmra_completed_time = NOW()
WHERE id = 1;

-- Automatic sign-off trigger
INSERT INTO sign_offs (order_id, required_contact_id, sign_off_type, is_signed, signed_by)
VALUES (123, technician_5, 'lmra_approval', true, technician_5);
```

**Mobile Screen:**
```
┌─ LMRA VEILIGHEIDSCHECK ─────────┐
│ ☑️ Elektrische veiligheid        │
│ ☑️ Juiste gereedschap aanwezig   │  
│ ☑️ Veilige werkruimte           │
│ ☑️ Klant geïnformeerd           │
│ ☑️ Noodprocedures bekend        │
│                                │
│ Risico niveau: ⚪ Laag          │
│ Opmerkingen: [text field]      │
│                                │
│ [LMRA GOEDKEUREN] ✅           │
│ [KLUS ANNULEREN] ❌            │
└────────────────────────────────┘
```

### **LMRA Failure Workflow:**
```sql
-- Bij onveilige situatie
UPDATE work_orders 
SET status = 'lmra_failed',
    lmra_overall_approved = false,
    lmra_approval_notes = 'Onveilige werkruimte, water in meterkast'
WHERE id = 1;

-- Automatic cancellation
INSERT INTO sign_offs (order_id, required_contact_id, sign_off_type, sign_off_notes)
VALUES (123, technician_5, 'work_order_cancelled', 'LMRA failed - unsafe workspace');
```

### **Fase 3: Materialen Verificatie**
```sql
-- Materialen controleren
UPDATE work_orders 
SET status = 'materials_verified',
    materials_status = 'verified',
    materials_notes = 'Alle materialen aanwezig en correct'
WHERE id = 1;

-- Materials sign-off
INSERT INTO sign_offs (order_id, required_contact_id, sign_off_type, is_signed)
VALUES (123, technician_5, 'materials_verified', true);
```

### **Fase 4: Installatie & Zegel Gebruik**
```sql
-- Werk starten
UPDATE work_orders 
SET status = 'work_in_progress',
    work_started_time = NOW()
WHERE id = 1;

-- Zegel gebruiken (via articles systeem)
INSERT INTO line_items (order_id, article_id, quantity, serial_numbers, line_item_status)
VALUES (123, 4, 1, JSON_ARRAY('ZG-2025-789456'), 'installed');

-- Zegel details in werkbon
UPDATE work_orders 
SET seals_used = JSON_ARRAY(
    JSON_OBJECT(
        'seal_number', 'ZG-2025-789456',
        'article_id', 4,
        'location', 'Nieuwe meterkast',
        'old_seal_replaced', 'ZG-2020-123456',
        'timestamp', NOW()
    )
)
WHERE id = 1;

-- Werk voltooien
UPDATE work_orders 
SET status = 'work_completed',
    work_completed_time = NOW(),
    completion_notes = 'Wallbox succesvol geïnstalleerd en getest',
    total_labor_hours = 4.5
WHERE id = 1;
```

### **Fase 5: Klant Handtekening**
```sql
-- Customer review
UPDATE work_orders 
SET status = 'customer_review'
WHERE id = 1;

-- Klant handtekening via sign_offs
INSERT INTO sign_offs (
    order_id, required_contact_id, sign_off_type, 
    is_signed, signed_by, signature_data, sign_off_notes
) VALUES (
    123, customer_contact_78, 'work_order_handover',
    true, customer_contact_78,
    'data:image/png;base64,signature_data...',
    'Klant tevreden, rating: 5 sterren'
);

-- Werkbon voltooien
UPDATE work_orders 
SET status = 'completed',
    customer_signed_time = NOW(),
    customer_satisfaction_rating = 5,
    customer_feedback = 'Uitstekende service, zeer professioneel'
WHERE id = 1;
```

---

## 🏷️ **Zegels als Articles**

### **Waarom Zegels in Articles Tabel:**
✅ **Standard inventory flow** - Normale inkoop, voorraad, uitgifte  
✅ **Pricing & cost tracking** - Kostprijzen en verkoop integratie  
✅ **Automatic reorder points** - Voorraad management  
✅ **Serial number tracking** - Via requires_serial_number = true  
✅ **Normale line_items workflow** - Geen speciale behandeling  

### **Zegel Articles in Database:**
```sql
-- Zegels in articles tabel
SELECT * FROM articles WHERE category = 'installation' AND article_number LIKE 'SEAL-%';

-- Results:
-- SEAL-MB-001: Meterkast Zegel Type A (€2.50)
-- SEAL-MB-002: Meterkast Zegel Type B (€2.50)  
-- SEAL-DK-001: Distributiekast Zegel (€3.00)
```

### **Zegel Usage Tracking:**
```sql
-- 1. Zegel aan order toevoegen
INSERT INTO line_items (order_id, article_id, quantity, serial_numbers)
VALUES (123, 4, 1, JSON_ARRAY('ZG-2025-789456'));

-- 2. Zegel details in werkbon
UPDATE work_orders 
SET seals_used = JSON_ARRAY({
    'seal_number': 'ZG-2025-789456',
    'article_id': 4,
    'location': 'Meterkast',
    'old_seal_replaced': 'ZG-2020-123456'
})
WHERE id = 1;

-- 3. Reporting: Welke zegels zijn gebruikt
SELECT 
    wo.work_order_number,
    wo.installation_address,
    JSON_UNQUOTE(JSON_EXTRACT(seals.value, '$.seal_number')) as seal_number,
    JSON_UNQUOTE(JSON_EXTRACT(seals.value, '$.location')) as location,
    a.name as seal_type
FROM work_orders wo
JOIN JSON_TABLE(wo.seals_used, '$[*]' COLUMNS(value JSON PATH '$')) seals
JOIN articles a ON a.id = JSON_UNQUOTE(JSON_EXTRACT(seals.value, '$.article_id'))
WHERE wo.seals_used IS NOT NULL;
```

---

## 📄 **PDF Generatie**

### **Xano Function voor Werkbon PDF:**
```javascript
// work_order_pdf_generator.js
export default async function(request) {
    const { work_order_id } = request.body;
    
    // Get complete work order data
    const workOrder = await WorkOrders.get(work_order_id, {
        with: [
            'order.customer_organization', 
            'order.line_items.article',
            'primary_technician_contact',
            'installation_team'
        ]
    });
    
    // Get all signatures for this order
    const signOffs = await SignOffs.list({
        where: { order_id: workOrder.order_id },
        with: ['signed_by']
    });
    
    // Get seals used from line items
    const sealsUsed = workOrder.order.line_items.filter(li => 
        li.article.article_number?.startsWith('SEAL-')
    );
    
    // Generate PDF
    const pdfData = {
        template: 'work_order_template',
        data: {
            work_order: workOrder,
            signatures: signOffs,
            seals: sealsUsed,
            lmra_data: {
                electrical_safety: workOrder.lmra_electrical_safety,
                proper_equipment: workOrder.lmra_proper_equipment,
                workspace_safe: workOrder.lmra_workspace_safe,
                risk_level: workOrder.lmra_risk_level,
                identified_risks: workOrder.lmra_identified_risks,
                approval_notes: workOrder.lmra_approval_notes
            },
            customer_signature: signOffs.find(s => s.sign_off_type === 'work_order_handover'),
            technician_signature: signOffs.find(s => s.sign_off_type === 'lmra_approval')
        }
    };
    
    const pdf = await generatePDF(pdfData);
    
    // Update work order with PDF URL
    await WorkOrders.update(work_order_id, {
        pdf_generated: true,
        pdf_file_url: pdf.url
    });
    
    return {
        success: true,
        pdf_url: pdf.url,
        work_order_number: workOrder.work_order_number
    };
}
```

### **PDF Template (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        .header { background: #003366; color: white; padding: 20px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; }
        .lmra-check { color: #22c55e; }
        .signature-box { border: 1px solid #ccc; height: 100px; margin: 10px 0; }
        .seal-info { background: #f8f9fa; padding: 10px; margin: 5px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>ChargeCars Werkbon</h1>
        <p>Werkbon: {{work_order_number}} | Datum: {{created_at}}</p>
    </div>
    
    <div class="section">
        <h2>Installatie Details</h2>
        <p><strong>Klant:</strong> {{customer_organization.name}}</p>
        <p><strong>Adres:</strong> {{installation_address}}</p>
        <p><strong>Technicus:</strong> {{primary_technician_contact.name}}</p>
        <p><strong>Aankomst:</strong> {{arrival_time}}</p>
        <p><strong>Voltooiing:</strong> {{work_completed_time}}</p>
        <p><strong>Tijdsduur:</strong> {{total_labor_hours}} uur</p>
    </div>
    
    <div class="section">
        <h2>LMRA Veiligheidscheck</h2>
        <p>✅ Elektrische veiligheid: {{lmra_data.electrical_safety}}</p>
        <p>✅ Juiste gereedschap: {{lmra_data.proper_equipment}}</p>
        <p>✅ Veilige werkruimte: {{lmra_data.workspace_safe}}</p>
        <p><strong>Risico niveau:</strong> {{lmra_data.risk_level}}</p>
        <p><strong>Opmerkingen:</strong> {{lmra_data.approval_notes}}</p>
    </div>
    
    <div class="section">
        <h2>Gebruikte Materialen</h2>
        {{#line_items}}
        <p>• {{article.name}} ({{quantity}}x)</p>
        {{/line_items}}
    </div>
    
    <div class="section">
        <h2>Gebruikte Zegels</h2>
        {{#seals}}
        <div class="seal-info">
            <p><strong>Zegel:</strong> {{serial_numbers.[0]}}</p>
            <p><strong>Type:</strong> {{article.name}}</p>
            <p><strong>Locatie:</strong> Meterkast/Distributiekast</p>
        </div>
        {{/seals}}
    </div>
    
    <div class="section">
        <h2>Handtekeningen</h2>
        <div class="signature-box">
            <p><strong>Technicus:</strong></p>
            {{#technician_signature}}
            <img src="{{signature_data}}" style="max-height: 80px;">
            <p>{{signed_by.name}} - {{signed_at}}</p>
            {{/technician_signature}}
        </div>
        
        <div class="signature-box">
            <p><strong>Klant:</strong></p>
            {{#customer_signature}}
            <img src="{{signature_data}}" style="max-height: 80px;">
            <p>{{signed_by.name}} - {{signed_at}}</p>
            <p>Tevredenheid: {{work_order.customer_satisfaction_rating}}/5 ⭐</p>
            {{/customer_signature}}
        </div>
    </div>
</body>
</html>
```

---

## 🔄 **Sign-offs Integration**

### **Extended Sign-off Types:**
```sql
-- Nieuwe sign_off_type values voor werkbonnen:
'lmra_approval'              -- LMRA veiligheidscheck
'materials_verified'         -- Materialen geverifieerd  
'work_order_start'          -- Werkbon gestart
'installation_complete'     -- Installatie voltooid
'work_order_handover'       -- Werkbon oplevering
'work_order_cancelled'      -- Werkbon geannuleerd
```

### **Automatic Sign-off Triggers:**
```sql
-- Database triggers voor automatic sign-offs
DELIMITER $$
CREATE TRIGGER work_order_status_signoff 
AFTER UPDATE ON work_orders
FOR EACH ROW
BEGIN
    -- LMRA approved trigger
    IF NEW.status = 'lmra_approved' AND OLD.status != 'lmra_approved' THEN
        INSERT INTO sign_offs (order_id, required_contact_id, sign_off_type, is_signed, signed_by)
        VALUES (NEW.order_id, NEW.primary_technician_contact_id, 'lmra_approval', TRUE, NEW.primary_technician_contact_id);
    END IF;
    
    -- Work completed trigger
    IF NEW.status = 'work_completed' AND OLD.status != 'work_completed' THEN
        INSERT INTO sign_offs (order_id, required_contact_id, sign_off_type, is_signed, signed_by)
        VALUES (NEW.order_id, NEW.primary_technician_contact_id, 'installation_complete', TRUE, NEW.primary_technician_contact_id);
    END IF;
END$$
DELIMITER ;
```

---

## 📊 **Reporting & Analytics**

### **Werkbon Performance Dashboard:**
```sql
-- Daily work order completion stats
SELECT 
    DATE(created_at) as work_date,
    COUNT(*) as total_orders,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
    SUM(CASE WHEN status = 'lmra_failed' THEN 1 ELSE 0 END) as lmra_failures,
    AVG(total_labor_hours) as avg_labor_hours,
    AVG(customer_satisfaction_rating) as avg_satisfaction
FROM work_orders 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(created_at)
ORDER BY work_date DESC;
```

### **LMRA Compliance Reporting:**
```sql
-- LMRA approval rates by team
SELECT 
    it.team_name,
    COUNT(*) as total_lmra_checks,
    SUM(CASE WHEN lmra_overall_approved = TRUE THEN 1 ELSE 0 END) as approved,
    ROUND(SUM(CASE WHEN lmra_overall_approved = TRUE THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as approval_rate,
    COUNT(DISTINCT lmra_supervisor_contact_id) as supervisor_escalations
FROM work_orders wo
JOIN installation_teams it ON wo.installation_team_id = it.id
WHERE wo.lmra_started_time IS NOT NULL
GROUP BY it.team_name
ORDER BY approval_rate DESC;
```

### **Zegel Usage Tracking:**
```sql
-- Seal usage per month
SELECT 
    YEAR(wo.created_at) as year,
    MONTH(wo.created_at) as month,
    a.name as seal_type,
    COUNT(*) as seals_used,
    SUM(a.base_price) as total_cost
FROM work_orders wo
JOIN JSON_TABLE(wo.seals_used, '$[*]' COLUMNS(article_id INT PATH '$.article_id')) seals
JOIN articles a ON a.id = seals.article_id
WHERE wo.seals_used IS NOT NULL
GROUP BY YEAR(wo.created_at), MONTH(wo.created_at), a.name
ORDER BY year DESC, month DESC, seals_used DESC;
```

---

## ✅ **Voordelen Unified System**

### **Voor Monteurs:**
✅ **Één app, één workflow** - Geen switchen tussen systemen  
✅ **Logische progressie** - LMRA → Materialen → Werk → Handtekening  
✅ **Offline capability** - Lokale opslag, sync bij verbinding  
✅ **Foto integratie** - Direct upload vanuit werkbon  

### **Voor Operations:**
✅ **Real-time visibility** - Live status van alle werkbonnen  
✅ **LMRA compliance** - Verplichte veiligheidscheck workflow  
✅ **Automatic documentation** - PDF generatie voor alle stakeholders  
✅ **Audit trails** - Complete historie via sign_offs  

### **Voor Business:**
✅ **Compliance ready** - NEN normen en zegel tracking  
✅ **Customer satisfaction** - Geïntegreerde feedback en ratings  
✅ **Billing integration** - Automatic labor en materials tracking  
✅ **Performance analytics** - Team efficiency en kwaliteit metrics  

---

*Dit unified work order systeem digitaliseert het complete installatieproces met LMRA compliance, material tracking, seal management en customer satisfaction - alles in één geïntegreerde workflow.* 🚀 