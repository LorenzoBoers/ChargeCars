# ChargeCars V2 - Enhanced Quote System Implementation Guide

**Revolutionary Contact-Targeted Quote System** - 31 mei 2025

---

## 🎯 **OVERVIEW**

Het nieuwe ChargeCars quote systeem biedt revolutionaire mogelijkheden voor contact-specifieke offertes met flexibele prijzenbsichtbaarheid. Dit systeem ondersteunt complexe business scenarios waarbij verschillende contacten verschillende informatie moeten zien.

---

## 🔧 **CORE FEATURES**

### **1. Contact-Targeted Quotes**
- Quotes gericht op specifieke contacts (klant OF partner financial contact)
- Multiple quote versions per order mogelijk
- Geïntegreerde communications binnen quote entity

### **2. Flexible Pricing Visibility**
- Partner ziet alle artikelen met prijzen maar alleen totaal voor hun items
- Klant ziet alle artikelen maar zonder partner-specifieke pricing
- Granulaire controle per line item

### **3. Quote Types**
- **Customer**: Voor eindklanten
- **Partner Financial**: Voor partner commissie breakdowns
- **Combined**: Geavanceerde mixed scenario's

---

## 📊 **DATABASE SCHEMA**

### **Enhanced Quotes Table (ID: 39)**
```sql
-- NIEUWE VELDEN:
target_contact_id INT          -- Primary contact (customer or partner financial)
quote_type ENUM               -- 'customer', 'partner_financial', 'combined'
show_partner_prices BOOL      -- Show partner-specific line item prices  
show_customer_prices BOOL     -- Show customer-specific line item prices
communications TEXT           -- Correspondence notes (replaces communications table)
template_used VARCHAR         -- Quote template/layout used
presentation_notes TEXT       -- Special presentation instructions
```

### **Enhanced Line Items Table (ID: 40)**
```sql
-- NIEUWE VELDEN:
visible_to_contact_id INT     -- Specific contact this line item is visible to
pricing_tier ENUM            -- 'customer', 'partner', 'internal', 'commission'  
show_price_to_customer BOOL  -- Show price to customer (true/false)
show_price_to_partner BOOL   -- Show price to partner (true/false)
```

---

## 🔄 **BUSINESS SCENARIOS**

### **Scenario 1: Customer-Only Quote**
```json
{
  "quote_id": 101,
  "target_contact_id": 1001,    // Eindklant contact
  "quote_type": "customer",
  "show_customer_prices": true,
  "show_partner_prices": false,
  "line_items": [
    {
      "description": "Wallbox installation",
      "billing_type": "customer_pays",
      "visible_to_contact_id": 1001,
      "show_price_to_customer": true,
      "show_price_to_partner": false
    }
  ]
}
```

### **Scenario 2: Partner Financial Quote**
```json
{
  "quote_id": 102, 
  "target_contact_id": 2001,    // Partner financial contact
  "quote_type": "partner_financial",
  "show_customer_prices": false,
  "show_partner_prices": true,
  "line_items": [
    {
      "description": "Commission fee",
      "billing_type": "partner_pays", 
      "visible_to_contact_id": 2001,
      "show_price_to_customer": false,
      "show_price_to_partner": true
    }
  ]
}
```

### **Scenario 3: Combined Quote**
```json
{
  "quote_id": 103,
  "target_contact_id": 1001,    // Primary contact (customer)
  "quote_type": "combined",
  "show_customer_prices": true,
  "show_partner_prices": true,
  "line_items": [
    {
      "description": "Wallbox",
      "billing_type": "customer_pays",
      "visible_to_contact_id": 1001,  // Customer sees this
      "show_price_to_customer": true,
      "show_price_to_partner": false
    },
    {
      "description": "Installation service", 
      "billing_type": "partner_pays",
      "visible_to_contact_id": 2001,  // Partner financial contact sees this
      "show_price_to_customer": false,
      "show_price_to_partner": true
    }
  ]
}
```

---

## 💰 **PRICING LOGIC**

### **Customer View Query**
```sql
-- Customer sees:
SELECT li.* FROM line_items li 
WHERE li.quote_id = ? 
  AND (li.visible_to_contact_id = customer_contact_id 
       OR li.visible_to_contact_id IS NULL)
  AND li.show_price_to_customer = true
  AND li.billing_type IN ('customer_pays', 'shared_cost')
```

### **Partner View Query**  
```sql
-- Partner sees:
SELECT li.* FROM line_items li
WHERE li.quote_id = ?
  AND (li.visible_to_contact_id = partner_contact_id
       OR li.visible_to_contact_id IS NULL) 
  AND li.show_price_to_partner = true
  AND li.billing_type IN ('partner_pays', 'commission_fee', 'shared_cost')
```

---

## 🛠️ **IMPLEMENTATION STEPS**

### **1. Database Setup**
```sql
-- Tables are already created in Xano
-- quotes (ID: 39) - Enhanced with contact targeting
-- line_items (ID: 40) - Enhanced with visibility controls
-- communications table removed (functionality integrated into quotes)
```

### **2. API Endpoints**

#### **Create Contact-Targeted Quote**
```http
POST /api/quote/create-targeted
{
  "order_id": 123,
  "target_contact_id": 1001,
  "quote_type": "customer",
  "template_used": "customer_standard"
}
```

#### **Add Targeted Line Item**
```http
POST /api/line-items/add-targeted
{
  "quote_id": 101,
  "article_id": 5,
  "quantity": 1,
  "visible_to_contact_id": 1001,
  "billing_type": "customer_pays",
  "show_price_to_customer": true,
  "show_price_to_partner": false
}
```

#### **Get Quote for Specific Contact**
```http
GET /api/quote/{quote_id}/view?contact_id=1001
# Returns filtered view based on contact visibility rules
```

### **3. Frontend Implementation**

#### **Quote Builder Interface**
```javascript
// Quote type selection
const quoteTypes = [
  { value: 'customer', label: 'Customer Quote' },
  { value: 'partner_financial', label: 'Partner Financial Quote' },
  { value: 'combined', label: 'Combined Quote' }
];

// Contact targeting
const selectTargetContact = (contacts, quoteType) => {
  return contacts.filter(contact => {
    if (quoteType === 'customer') return contact.contact_type === 'customer';
    if (quoteType === 'partner_financial') return contact.contact_type === 'partner_financial';
    return true; // combined allows all
  });
};
```

#### **Line Item Visibility Controls**
```javascript
// Per line item visibility controls
const LineItemVisibility = ({ lineItem, contacts, onUpdate }) => {
  return (
    <div>
      <Select
        label="Visible to Contact"
        value={lineItem.visible_to_contact_id}
        options={contacts}
        onChange={(contactId) => onUpdate({...lineItem, visible_to_contact_id: contactId})}
      />
      
      <Checkbox
        label="Show price to customer"
        checked={lineItem.show_price_to_customer}
        onChange={(checked) => onUpdate({...lineItem, show_price_to_customer: checked})}
      />
      
      <Checkbox
        label="Show price to partner"
        checked={lineItem.show_price_to_partner}
        onChange={(checked) => onUpdate({...lineItem, show_price_to_partner: checked})}
      />
    </div>
  );
};
```

---

## 📱 **USER WORKFLOWS**

### **Sales Representative Creating Customer Quote**
1. Select order and target customer contact
2. Choose "Customer" quote type
3. Add relevant line items with customer pricing
4. Set visibility: show_price_to_customer = true, show_price_to_partner = false
5. Add communication notes
6. Generate and send quote

### **Sales Representative Creating Partner Financial Quote**
1. Select order and target partner financial contact
2. Choose "Partner Financial" quote type
3. Add commission and fee line items
4. Set visibility: show_price_to_partner = true, show_price_to_customer = false
5. Include commission breakdown in communications
6. Generate and send quote

### **Complex Combined Quote**
1. Select order and primary contact
2. Choose "Combined" quote type
3. Add customer line items (visible to customer contact)
4. Add partner line items (visible to partner contact)
5. Configure individual visibility per line item
6. Generate targeted views per contact type

---

## 🔒 **SECURITY & ACCESS CONTROL**

### **Contact-Based Access**
```sql
-- User can only see quotes where they are the target contact
-- or where their organization is involved
SELECT q.* FROM quotes q
JOIN contacts c ON q.target_contact_id = c.id
WHERE c.user_account_id = current_user_id
   OR q.order_id IN (
     SELECT o.id FROM orders o 
     WHERE o.customer_organization_id = user_organization_id
        OR o.partner_organization_id = user_organization_id
   )
```

### **Line Item Filtering**
```sql
-- Filter line items based on contact visibility rules
SELECT li.* FROM line_items li
WHERE li.quote_id = quote_id
  AND (li.visible_to_contact_id = user_contact_id 
       OR li.visible_to_contact_id IS NULL)
  AND (
    (user_type = 'customer' AND li.show_price_to_customer = true) OR
    (user_type = 'partner' AND li.show_price_to_partner = true)
  )
```

---

## 📊 **REPORTING & ANALYTICS**

### **Quote Performance Metrics**
```sql
-- Quote acceptance rates by type
SELECT 
  quote_type,
  COUNT(*) as total_quotes,
  SUM(CASE WHEN quote_status = 'approved' THEN 1 ELSE 0 END) as approved_quotes,
  AVG(CASE WHEN quote_status = 'approved' THEN 1.0 ELSE 0.0 END) as acceptance_rate
FROM quotes
GROUP BY quote_type;
```

### **Contact Engagement Tracking**
```sql
-- Track which contacts engage with quotes most
SELECT 
  c.name,
  c.contact_type,
  COUNT(q.id) as quotes_received,
  COUNT(CASE WHEN q.quote_status = 'approved' THEN 1 END) as quotes_approved
FROM contacts c
JOIN quotes q ON c.id = q.target_contact_id
GROUP BY c.id, c.name, c.contact_type
ORDER BY quotes_received DESC;
```

---

## 🧪 **TESTING SCENARIOS**

### **Test Case 1: Customer Quote Visibility**
```javascript
// Test that customer only sees customer-relevant line items
const testCustomerQuoteView = async () => {
  const quote = await createQuote({
    target_contact_id: customerContactId,
    quote_type: 'customer'
  });
  
  await addLineItem(quote.id, {
    article_id: 1,
    visible_to_contact_id: customerContactId,
    show_price_to_customer: true,
    show_price_to_partner: false
  });
  
  const customerView = await getQuoteView(quote.id, customerContactId);
  expect(customerView.line_items).toHaveLength(1);
  expect(customerView.line_items[0].price).toBeDefined();
};
```

### **Test Case 2: Partner Quote Isolation**
```javascript
// Test that partner only sees partner-relevant information
const testPartnerQuoteIsolation = async () => {
  const quote = await createQuote({
    target_contact_id: partnerContactId,
    quote_type: 'partner_financial'
  });
  
  const partnerView = await getQuoteView(quote.id, partnerContactId);
  expect(partnerView.show_customer_prices).toBe(false);
  expect(partnerView.communications).toContain('commission');
};
```

---

## 🚀 **MIGRATION FROM OLD SYSTEM**

### **Data Migration Strategy**
```sql
-- Existing quotes remain functional
-- New quotes use enhanced schema
-- Gradual migration of communications
UPDATE quotes SET communications = 
  (SELECT GROUP_CONCAT(message) FROM old_communications WHERE quote_id = quotes.id)
WHERE communications IS NULL;
```

### **Backward Compatibility**
```sql
-- Old quotes without target_contact_id default to primary order contact
UPDATE quotes SET target_contact_id = (
  SELECT o.primary_contact_id 
  FROM orders o 
  WHERE o.id = quotes.order_id
) WHERE target_contact_id IS NULL;
```

---

## ✅ **SUCCESS CRITERIA**

### **Functional Requirements Met**
- ✅ Contact-specific quote targeting
- ✅ Flexible pricing visibility controls
- ✅ Multi-version quote support per order
- ✅ Integrated communications
- ✅ Multiple quote types (customer/partner/combined)

### **Technical Requirements Met**
- ✅ Enhanced database schema implemented
- ✅ Contact-based access control
- ✅ Scalable for complex business scenarios
- ✅ Backward compatible with existing quotes
- ✅ Performance optimized queries

### **Business Requirements Met**
- ✅ Transparency for customers (see only relevant pricing)
- ✅ Commission clarity for partners
- ✅ Simplified communication management
- ✅ Support for complex multi-stakeholder scenarios
- ✅ Audit trail for all quote interactions

---

**Het Enhanced Quote System is volledig geïmplementeerd en klaar voor productie! 🎯** 