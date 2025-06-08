# ChargeCars V2 Quote Process Implementation
**Gebaseerd op Gesprek over Granular Line Item Approvals - 31 mei 2025**
**🔄 UPDATED: Gebruik bestaande sign_offs systeem**

---

## 🎯 **EXECUTIVE SUMMARY**

We hebben de ChargeCars V2 database **geoptimaliseerd** voor het granular quote approval proces. In plaats van een nieuwe tabel gebruiken we het **bestaande `sign_off` + `sign_off_line_item`** systeem, wat eleganter en consistent is.

---

## 🔄 **COMPLETE OFFERTE WORKFLOW**

### **FASE 1: OFFERTE AANMAKEN**

```sql
-- 1. Account manager maakt offerte aan
INSERT INTO quotes (quote_number, order_id, quote_type, target_contact_id) 
VALUES ('Q-2025-001', order_uuid, 'combined', main_contact_uuid);

-- 2. Line items toevoegen met specifieke billing contacts
INSERT INTO line_items (
    quote_id, 
    billing_contact_id,        -- ALTIJD naar contact, nooit organisatie
    billing_type,
    visible_to_contact_id,     -- Wie dit item mag zien
    supplier_contact_id,       -- Partner die dit levert
    customer_visible_description,  -- Klant-vriendelijke beschrijving
    show_price_to_customer,
    show_price_to_partner
) VALUES (
    quote_uuid,
    customer_financial_contact_uuid,  -- Via organization.financial_contact_id
    'customer_pays',
    customer_contact_uuid,
    partner_contact_uuid,
    'Laadpaal installatie (geleverd door partner)',
    true,   -- Klant ziet prijs
    false   -- Partner ziet geen klantprijs
);
```

### **FASE 2: GRANULAR SIGN-OFFS PER CONTACT GROEP**

```sql
-- 3. Sign-off records aanmaken voor elke contact die moet ondertekenen
INSERT INTO sign_offs (
    order_id,
    quote_id,
    required_contact_id    -- Contact bepaalt type approval (customer/partner/financial)
) VALUES (
    order_uuid,
    quote_uuid,
    customer_financial_contact_uuid  -- Financial contact van klant organisatie
);

-- 4. Koppel sign-off aan specifieke line items die deze contact moet goedkeuren
INSERT INTO sign_off_line_items (sign_off_id, line_item_id)
SELECT sign_off_uuid, li.id
FROM line_items li 
WHERE li.quote_id = quote_uuid 
AND li.billing_contact_id = customer_financial_contact_uuid;

-- 5. Contact ondertekent via portal/email/WhatsApp
UPDATE sign_offs 
SET is_signed = true,
    signed_at = NOW(),
    signed_by = contact_uuid,
    signature_method = 'portal_click',
    signature_data = '{"ip": "192.168.1.1", "user_agent": "Chrome/91.0"}'
WHERE required_contact_id = contact_uuid AND id = sign_off_uuid;
```

### **FASE 3: AUTOMATISCHE OFFERTE APPROVAL**

```sql
-- 6. Check of alle sign-offs voor deze quote zijn voltooid
SELECT COUNT(*) as pending_sign_offs
FROM sign_offs so
WHERE so.quote_id = quote_uuid 
AND so.is_signed = false;

-- 7. Als pending_sign_offs = 0, dan offerte automatisch goedkeuren
UPDATE quotes 
SET quote_status = 'approved',
    customer_approved_at = NOW()
WHERE id = quote_uuid;
```

---

## 📊 **OPTIMALIZED DATABASE STRUCTUUR**

### **1. ORGANIZATIONS - FINANCIEEL CONTACT**

```sql
organizations:
  financial_contact_id (UUID → contacts)  -- 🆕 NIEUW VELD
  -- Designated contact voor alle financiële ondertekeningen
```

### **2. SIGN_OFFS - VEREENVOUDIGD EN VERBETERD**

```sql
sign_offs:
  id (UUID, PK)
  order_id (UUID → orders)
  quote_id (UUID → quotes)                         -- 🆕 Quotes kunnen ook ondertekend worden
  required_contact_id (UUID → contacts, REQUIRED)  -- ✅ Contact bepaalt approval type
  -- sign_off_type ENUM VERWIJDERD ❌              -- Niet meer nodig!
  
  is_signed (BOOLEAN)                               -- Ondertekend ja/nee
  signed_at (TIMESTAMP)                             -- Wanneer ondertekend
  signed_by (UUID → contacts)                       -- Wie heeft ondertekend
  signature_method (ENUM)                           -- portal_click/email_link/whatsapp_message
  signature_data (JSON)                             -- IP address, device info, etc
  rejection_reason (TEXT)                           -- Als geweigerd
  sign_off_notes (TEXT)                             -- Extra opmerkingen
```

### **3. SIGN_OFF_LINE_ITEMS - BESTAANDE JUNCTION TABLE**

```sql
sign_off_line_items:
  id (UUID, PK) 
  sign_off_id (UUID → sign_offs)                   -- Welke ondertekening
  line_item_id (UUID → line_items)                 -- Welk line item
  
  -- Deze tabel koppelt granular line items aan sign-offs
  -- Eén sign-off kan meerdere line items bevatten
  -- Eén line item kan in meerdere sign-offs zitten (edge case)
```

### **4. LINE_ITEMS - CONTACT-ONLY BILLING**

```sql
line_items:
  billing_contact_id (UUID → contacts, REQUIRED)   -- Wie moet betalen/ondertekenen
  -- billing_organization_id VERWIJDERD ❌
  
  -- ZICHTBAARHEID:
  visible_to_contact_id (UUID → contacts)          -- Wie mag dit item zien
  supplier_contact_id (UUID → contacts)            -- Partner die levert
  customer_visible_description (TEXT)              -- Klant-vriendelijke tekst
  show_price_to_customer (BOOLEAN)                 -- Prijs tonen aan klant?
  show_price_to_partner (BOOLEAN)                  -- Prijs tonen aan partner?
```

---

## 🔄 **PRAKTIJK SCENARIO'S**

### **SCENARIO A: KLANT + PARTNER OFFERTE**

```sql
-- Step 1: Line items aanmaken
-- Item 1: Laadpaal (partner levert, klant betaalt)
INSERT INTO line_items (...) VALUES (
    billing_contact_id = customer_financial_contact,
    supplier_contact_id = partner_technical_contact,
    customer_visible_description = "Laadpaal 22kW (geleverd door gecertificeerde partner)",
    show_price_to_customer = true,
    show_price_to_partner = false
);

-- Item 2: Installatie (partner levert en betaalt)
INSERT INTO line_items (...) VALUES (
    billing_contact_id = partner_financial_contact,
    supplier_contact_id = partner_technical_contact,
    customer_visible_description = "Professionele installatie (verzorgd door partner)",
    show_price_to_customer = false,
    show_price_to_partner = true
);

-- Step 2: Sign-offs aanmaken per billing contact
-- Klant financial contact sign-off
INSERT INTO sign_offs (required_contact_id) VALUES (customer_financial_contact);
INSERT INTO sign_off_line_items (sign_off_id, line_item_id) VALUES (customer_sign_off_uuid, item1_uuid);

-- Partner financial contact sign-off  
INSERT INTO sign_offs (required_contact_id) VALUES (partner_financial_contact);
INSERT INTO sign_off_line_items (sign_off_id, line_item_id) VALUES (partner_sign_off_uuid, item2_uuid);
```

### **SCENARIO B: MULTI-PARTNER PROJECT**

```sql
-- Verschillende billing contacts krijgen eigen sign-offs:
-- - customer_financial_contact (voor items die klant betaalt)
-- - partner_a_financial_contact (voor items die partner A betaalt)  
-- - partner_b_financial_contact (voor items die partner B betaalt)
-- - chargecars_financial_contact (voor commissie items)

-- Elke sign-off krijgt alleen de line items die relevant zijn voor die contact
```

---

## 🚀 **VOORDELEN GEOPTIMALISEERDE STRUCTUUR**

### **✅ VOOR DEVELOPMENT**
- **Geen duplicatie**: Gebruik bestaande `sign_off` infrastructuur
- **Flexibeler**: `sign_off_line_item` junction table ondersteunt elk scenario
- **Eenvoudiger**: Contact bepaalt approval type, geen enum nodig
- **Uitbreidbaar**: Kan quotes, orders, work orders, alles ondertekenen

### **✅ VOOR GEBRUIKERS**
- **Eenvoudige workflow**: Elke contact ondertekent alleen hun items
- **Flexibele groepering**: Line items kunnen gegroepeerd worden per sign-off
- **Transparante audit**: Wie, wat, wanneer, hoe ondertekend
- **Multi-channel**: Portal, email, WhatsApp approvals

### **✅ VOOR BUSINESS**
- **Schaalbaar**: Werkt met complexe multi-partner scenarios
- **Compliant**: Volledige audit trail met signature data
- **Efficiënt**: Automatische quote approval als alle sign-offs compleet

---

## 📱 **WEBHOOK INTEGRATION MET BESTAAND SYSTEEM**

### **MS365 OUTLOOK INTEGRATION**
```javascript
// Email approval verwerking
POST /webhook/ms365/email
{
  "subject": "Akkoord Q-2025-001",
  "sender": "finance@customer.nl", 
  "body": "Hierbij onderteken ik de offerte"
}

// Processing logic:
1. Identificeer contact via email
2. Zoek pending sign_offs voor deze contact  
3. Update sign_offs.is_signed = true
4. Check if alle sign_offs voor quote compleet zijn
5. Auto-approve quote als alles ondertekend
```

### **WHATSAPP BUSINESS INTEGRATION**
```javascript
// WhatsApp ondertekening
POST /webhook/whatsapp/message
{
  "from": "+31612345678",
  "text": "Akkoord Q-2025-001"
}

// Processing:
1. Match telefoon naar contact
2. Parse quote referentie
3. Update relevante sign_offs
4. Verstuur bevestiging terug
```

---

## 🎯 **IMPLEMENTATIE WORKFLOW**

### **1. QUOTE CREATION PROCESS**
```sql
-- Generate sign-offs automatically based on unique billing_contact_id values
INSERT INTO sign_offs (order_id, quote_id, required_contact_id)
SELECT DISTINCT li.order_id, li.quote_id, li.billing_contact_id  
FROM line_items li 
WHERE li.quote_id = new_quote_uuid;

-- Link each sign-off to relevant line items
INSERT INTO sign_off_line_items (sign_off_id, line_item_id)
SELECT so.id, li.id
FROM sign_offs so
JOIN line_items li ON li.billing_contact_id = so.required_contact_id 
WHERE so.quote_id = new_quote_uuid;
```

### **2. APPROVAL STATUS CHECKING**
```sql
-- Get approval status for a quote
SELECT 
    c.name as contact_name,
    c.email,
    o.name as organization_name,
    so.is_signed,
    so.signed_at,
    COUNT(soli.line_item_id) as line_items_count
FROM sign_offs so
JOIN contacts c ON so.required_contact_id = c.id
JOIN organizations o ON c.organization_id = o.id  
LEFT JOIN sign_off_line_items soli ON so.id = soli.sign_off_id
WHERE so.quote_id = quote_uuid
GROUP BY so.id, c.name, c.email, o.name, so.is_signed, so.signed_at;
```

### **3. AUTO-APPROVAL TRIGGER**
```sql
-- Check if quote is fully approved
SELECT CASE 
    WHEN COUNT(*) = COUNT(CASE WHEN is_signed THEN 1 END) THEN 'APPROVED'
    ELSE 'PENDING'
END as quote_status
FROM sign_offs 
WHERE quote_id = quote_uuid;
```

---

## 🎯 **NEXT STEPS**

1. **✅ Database Optimized**: Bestaand sign_offs systeem uitgebreid
2. **🔄 API Endpoints**: CRUD endpoints voor sign_offs workflow  
3. **🔄 Portal Interface**: Contact-specific ondertekenings-screens
4. **🔄 Webhook Processors**: MS365 en WhatsApp integration
5. **🔄 Notification System**: Email/SMS bij sign-off requests

---

**Status**: Database geoptimaliseerd met bestaande infrastructuur, geen duplicatie, klaar voor development. 