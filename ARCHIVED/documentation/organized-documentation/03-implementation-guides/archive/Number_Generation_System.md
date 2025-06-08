# ChargeCars V2 - Number Generation System
**Automatic Number Generation with Business Logic & Safety Triggers**  
*Created: 31 mei 2025*

---

## 🎯 **SYSTEM OVERVIEW**

### **Dual-Layer Approach**
- **Primary**: API-level generation (Xano Functions) → Numbers in response
- **Safety Net**: Database triggers → Prevent gaps/duplicates
- **Business Logic**: Different formats per business entity
- **Audit Trail**: Complete number generation tracking

### **Number Formats per Business Entity**

#### **ChargeCars (B2B Partner Focus)**
```javascript
const numberFormats = {
  orders: "CC-{YYYY}-{sequential_5}",        // CC-2025-00001
  quotes: "QT-CC-{YYYY}-{sequential_5}",     // QT-CC-2025-00001  
  invoices: "INV-CC-{YYYY}-{sequential_5}",  // INV-CC-2025-00001
  visits: "VST-CC-{YYYY}-{sequential_5}",    // VST-CC-2025-00001
  work_orders: "WO-CC-{date}-{sequential_3}" // WO-CC-20250531-001
}
```

#### **LaderThuis.nl (Consumer Direct)**
```javascript
const numberFormats = {
  orders: "LT-{YYYY}-{sequential_5}",        // LT-2025-00001
  quotes: "QT-LT-{YYYY}-{sequential_5}",     // QT-LT-2025-00001
  invoices: "INV-LT-{YYYY}-{sequential_5}",  // INV-LT-2025-00001
  visits: "VST-LT-{YYYY}-{sequential_5}",    // VST-LT-2025-00001
  work_orders: "WO-LT-{date}-{sequential_3}" // WO-LT-20250531-001
}
```

#### **MeterKastThuis.nl (Electrical Infrastructure)**
```javascript
const numberFormats = {
  orders: "MK-{YYYY}-{sequential_5}",        // MK-2025-00001
  quotes: "QT-MK-{YYYY}-{sequential_5}",     // QT-MK-2025-00001
  invoices: "INV-MK-{YYYY}-{sequential_5}",  // INV-MK-2025-00001
  visits: "VST-MK-{YYYY}-{sequential_5}",    // VST-MK-2025-00001
  work_orders: "WO-MK-{date}-{sequential_3}" // WO-MK-20250531-001
}
```

#### **ZaptecShop.nl + RatioShop.nl (B2B Wholesale)**
```javascript
const numberFormats = {
  orders: "ZS-{YYYY}-{sequential_5}",        // ZS-2025-00001 (Zaptec)
  orders: "RS-{YYYY}-{sequential_5}",        // RS-2025-00001 (Ratio)
  quotes: "QT-ZS-{YYYY}-{sequential_5}",     // QT-ZS-2025-00001
  invoices: "INV-ZS-{YYYY}-{sequential_5}",  // INV-ZS-2025-00001
}
```

---

## 🔧 **API-LEVEL IMPLEMENTATION**

### **Number Generation Table**
```sql
-- New table for sequence management
CREATE TABLE number_sequence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_entity VARCHAR(50) NOT NULL,     -- chargecars, laderthuis, meterkast, etc.
    number_type VARCHAR(50) NOT NULL,         -- order, quote, invoice, visit, work_order
    year INTEGER NOT NULL,                    -- Current year for annual reset
    current_sequence INTEGER DEFAULT 0,       -- Current sequence number
    last_generated_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Unique constraint per entity/type/year
    UNIQUE(business_entity, number_type, year)
);
```

### **Core Number Generation Function**
```javascript
// Xano Function: generateNumber
function generateNumber(businessEntity, numberType, customData = {}) {
  const currentYear = new Date().getFullYear();
  const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  
  // Get or create sequence record
  let sequence = getSequenceRecord(businessEntity, numberType, currentYear);
  if (!sequence) {
    sequence = createSequenceRecord(businessEntity, numberType, currentYear);
  }
  
  // Increment sequence
  const nextSequence = incrementSequence(sequence.id);
  
  // Generate number based on business entity and type
  const numberFormat = getNumberFormat(businessEntity, numberType);
  const generatedNumber = formatNumber(numberFormat, {
    year: currentYear,
    date: currentDate,
    sequence: nextSequence,
    ...customData
  });
  
  // Log generation for audit
  logNumberGeneration(businessEntity, numberType, generatedNumber, nextSequence);
  
  return {
    number: generatedNumber,
    sequence: nextSequence,
    business_entity: businessEntity,
    number_type: numberType
  };
}

// Helper function: Get sequence record
function getSequenceRecord(businessEntity, numberType, year) {
  return db.query(`
    SELECT * FROM number_sequences 
    WHERE business_entity = ? AND number_type = ? AND year = ?
  `, [businessEntity, numberType, year])[0];
}

// Helper function: Increment sequence atomically
function incrementSequence(sequenceId) {
  const result = db.query(`
    UPDATE number_sequences 
    SET current_sequence = current_sequence + 1,
        last_generated_at = NOW()
    WHERE id = ?
    RETURNING current_sequence
  `, [sequenceId]);
  
  return result[0].current_sequence;
}

// Helper function: Format number
function formatNumber(format, data) {
  return format
    .replace('{YYYY}', data.year.toString())
    .replace('{date}', data.date)
    .replace('{sequential_3}', data.sequence.toString().padStart(3, '0'))
    .replace('{sequential_5}', data.sequence.toString().padStart(5, '0'));
}
```

### **Business Entity Specific Functions**

#### **Order Number Generation**
```javascript
// Xano Function: generateOrderNumber
function generateOrderNumber(businessEntity) {
  const result = generateNumber(businessEntity, 'order');
  
  // Validate uniqueness in orders table
  const existing = db.query(`
    SELECT id FROM orders WHERE order_number = ?
  `, [result.number]);
  
  if (existing.length > 0) {
    // Fallback: add suffix if duplicate somehow exists
    const timestamp = Date.now().toString().slice(-3);
    result.number += '-' + timestamp;
    
    // Log the collision for investigation
    logNumberCollision('order', result.number, businessEntity);
  }
  
  return result;
}

// Example usage in createOrder API
function createOrder(orderData) {
  // Generate order number first
  const numberResult = generateOrderNumber(orderData.business_entity);
  
  // Create order with generated number
  const order = {
    ...orderData,
    order_number: numberResult.number,
    generated_sequence: numberResult.sequence
  };
  
  const createdOrder = db.insert('orders', order);
  
  return {
    ...createdOrder,
    generation_info: numberResult  // Include generation info in response
  };
}
```

#### **Quote Number Generation**
```javascript
// Xano Function: generateQuoteNumber
function generateQuoteNumber(businessEntity, orderNumber = null) {
  const result = generateNumber(businessEntity, 'quote');
  
  // Optional: Link to order number for traceability
  if (orderNumber) {
    result.linked_order = orderNumber;
  }
  
  return result;
}
```

#### **Invoice Number Generation**
```javascript
// Xano Function: generateInvoiceNumber
function generateInvoiceNumber(businessEntity, orderNumber = null) {
  const result = generateNumber(businessEntity, 'invoice');
  
  // Validate against legal requirements (Dutch invoice numbering)
  const isValidDutchInvoice = validateDutchInvoiceNumber(result.number);
  if (!isValidDutchInvoice) {
    throw new Error('Generated invoice number does not meet Dutch legal requirements');
  }
  
  return result;
}

// Dutch invoice number validation
function validateDutchInvoiceNumber(invoiceNumber) {
  // Dutch requirements:
  // - Must be unique
  // - Must be sequential (no gaps allowed)
  // - Must contain year
  // - Must be traceable
  
  const pattern = /^INV-[A-Z]{2,3}-\d{4}-\d{5}$/;
  return pattern.test(invoiceNumber);
}
```

#### **Work Order Number Generation**
```javascript
// Xano Function: generateWorkOrderNumber
function generateWorkOrderNumber(businessEntity, visitDate = null) {
  const customData = {};
  
  if (visitDate) {
    // Use visit date instead of current date
    customData.date = visitDate.replace(/-/g, '');
  }
  
  const result = generateNumber(businessEntity, 'work_order', customData);
  return result;
}
```

---

## 🛡️ **DATABASE TRIGGERS (SAFETY NET)**

### **Order Number Trigger**
```sql
-- Trigger to ensure order_number is always set
CREATE OR REPLACE FUNCTION ensure_order_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate if order_number is NULL or empty
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    -- Simple fallback format (triggers can't call complex functions)
    NEW.order_number := 'ORD-' || NEW.business_entity || '-' || 
                        EXTRACT(YEAR FROM NOW()) || '-' || 
                        LPAD(nextval('order_number_seq')::text, 5, '0');
    
    -- Log that trigger was used (indicates API issue)
    INSERT INTO audit_logs (entity_type, entity_id, action, details)
    VALUES ('order', NEW.id, 'number_generated_by_trigger', 
            json_build_object('generated_number', NEW.order_number));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to orders table
CREATE TRIGGER order_number_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION ensure_order_number();
```

### **Quote Number Trigger**
```sql
-- Trigger for quote numbers
CREATE OR REPLACE FUNCTION ensure_quote_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quote_number IS NULL OR NEW.quote_number = '' THEN
    -- Get business entity from related order
    SELECT business_entity INTO NEW.business_entity 
    FROM orders WHERE id = NEW.order_id;
    
    NEW.quote_number := 'QT-' || NEW.business_entity || '-' || 
                       EXTRACT(YEAR FROM NOW()) || '-' || 
                       LPAD(nextval('quote_number_seq')::text, 5, '0');
    
    -- Log trigger usage
    INSERT INTO audit_logs (entity_type, entity_id, action, details)
    VALUES ('quote', NEW.id, 'number_generated_by_trigger', 
            json_build_object('generated_number', NEW.quote_number));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quote_number_trigger
  BEFORE INSERT ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION ensure_quote_number();
```

### **Invoice Number Trigger**
```sql
-- Trigger for invoice numbers (extra validation for legal compliance)
CREATE OR REPLACE FUNCTION ensure_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    -- Get business entity from related order
    SELECT business_entity INTO NEW.business_entity 
    FROM orders WHERE id = NEW.order_id;
    
    NEW.invoice_number := 'INV-' || NEW.business_entity || '-' || 
                         EXTRACT(YEAR FROM NOW()) || '-' || 
                         LPAD(nextval('invoice_number_seq')::text, 5, '0');
    
    -- Log trigger usage (should investigate why API didn't generate)
    INSERT INTO audit_logs (entity_type, entity_id, action, details, severity)
    VALUES ('invoice', NEW.id, 'number_generated_by_trigger', 
            json_build_object('generated_number', NEW.invoice_number), 'warning');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invoice_number_trigger
  BEFORE INSERT ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION ensure_invoice_number();
```

---

## 📊 **SEQUENCE MANAGEMENT**

### **Annual Reset Logic**
```javascript
// Xano Function: resetAnnualSequences
function resetAnnualSequences() {
  const currentYear = new Date().getFullYear();
  
  // Create new year sequences for all business entities
  const businessEntities = ['chargecars', 'laderthuis', 'meterkast', 'zaptec', 'ratio'];
  const numberTypes = ['order', 'quote', 'invoice', 'visit', 'work_order'];
  
  businessEntities.forEach(entity => {
    numberTypes.forEach(type => {
      // Check if sequence for current year exists
      const existing = db.query(`
        SELECT id FROM number_sequences 
        WHERE business_entity = ? AND number_type = ? AND year = ?
      `, [entity, type, currentYear]);
      
      if (existing.length === 0) {
        // Create new sequence for current year
        db.query(`
          INSERT INTO number_sequences (business_entity, number_type, year, current_sequence)
          VALUES (?, ?, ?, 0)
        `, [entity, type, currentYear]);
        
        console.log(`Created ${entity} ${type} sequence for ${currentYear}`);
      }
    });
  });
  
  return { status: 'success', year: currentYear };
}

// Schedule this function to run on January 1st
```

### **Sequence Monitoring**
```javascript
// Xano Function: getSequenceStatus
function getSequenceStatus(businessEntity = null) {
  let query = `
    SELECT 
      business_entity,
      number_type,
      year,
      current_sequence,
      last_generated_at,
      (current_sequence * 100.0 / 99999) as usage_percentage
    FROM number_sequences
  `;
  
  let params = [];
  if (businessEntity) {
    query += ' WHERE business_entity = ?';
    params.push(businessEntity);
  }
  
  query += ' ORDER BY business_entity, number_type, year DESC';
  
  const sequences = db.query(query, params);
  
  // Add warnings for sequences nearing limit
  sequences.forEach(seq => {
    if (seq.usage_percentage > 90) {
      seq.warning = 'Sequence nearing limit (90%+)';
    }
    if (seq.usage_percentage > 98) {
      seq.warning = 'Sequence critically full (98%+)';
    }
  });
  
  return sequences;
}
```

---

## 🔍 **AUDIT & MONITORING**

### **Number Generation Audit**
```sql
-- Table for number generation audit
CREATE TABLE number_generation_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_entity VARCHAR(50) NOT NULL,
    number_type VARCHAR(50) NOT NULL,
    generated_number VARCHAR(100) NOT NULL,
    sequence_used INTEGER NOT NULL,
    generation_method VARCHAR(50) NOT NULL,  -- 'api', 'trigger', 'manual'
    generated_at TIMESTAMP DEFAULT NOW(),
    generated_by UUID REFERENCES user_accounts(id),
    
    INDEX(business_entity, number_type),
    INDEX(generated_number),
    INDEX(generated_at)
);
```

### **Collision Detection**
```javascript
// Xano Function: detectNumberCollisions
function detectNumberCollisions() {
  const collisions = [];
  
  // Check orders
  const orderCollisions = db.query(`
    SELECT order_number, COUNT(*) as count
    FROM orders 
    GROUP BY order_number 
    HAVING COUNT(*) > 1
  `);
  collisions.push(...orderCollisions);
  
  // Check quotes
  const quoteCollisions = db.query(`
    SELECT quote_number, COUNT(*) as count
    FROM quotes 
    GROUP BY quote_number 
    HAVING COUNT(*) > 1
  `);
  collisions.push(...quoteCollisions);
  
  // Check invoices
  const invoiceCollisions = db.query(`
    SELECT invoice_number, COUNT(*) as count
    FROM invoices 
    GROUP BY invoice_number 
    HAVING COUNT(*) > 1
  `);
  collisions.push(...invoiceCollisions);
  
  if (collisions.length > 0) {
    // Send alert to admins
    sendSecurityAlert('number_collisions_detected', {
      collisions: collisions,
      severity: 'high',
      action_required: 'immediate_investigation'
    });
  }
  
  return collisions;
}
```

### **Performance Monitoring**
```javascript
// Xano Function: getNumberGenerationMetrics
function getNumberGenerationMetrics(days = 30) {
  const metrics = db.query(`
    SELECT 
      business_entity,
      number_type,
      generation_method,
      COUNT(*) as total_generated,
      AVG(EXTRACT(EPOCH FROM (generated_at - LAG(generated_at) OVER (
        PARTITION BY business_entity, number_type 
        ORDER BY generated_at
      )))) as avg_interval_seconds
    FROM number_generation_audit 
    WHERE generated_at >= NOW() - INTERVAL '${days} days'
    GROUP BY business_entity, number_type, generation_method
    ORDER BY total_generated DESC
  `);
  
  return {
    period_days: days,
    metrics: metrics,
    total_generated: metrics.reduce((sum, m) => sum + m.total_generated, 0),
    trigger_usage_percentage: (
      metrics
        .filter(m => m.generation_method === 'trigger')
        .reduce((sum, m) => sum + m.total_generated, 0) / 
      metrics.reduce((sum, m) => sum + m.total_generated, 0)
    ) * 100
  };
}
```

---

## 🚀 **IMPLEMENTATION ROADMAP**

### **Phase 1: Core API Functions (Week 1)**
- [ ] Create number_sequences table
- [ ] Implement generateNumber core function
- [ ] Create business entity specific functions
- [ ] Add to order/quote/invoice creation APIs

### **Phase 2: Safety Triggers (Week 1)**
- [ ] Create database triggers for all number types
- [ ] Add sequence validation triggers
- [ ] Implement collision detection
- [ ] Add audit logging

### **Phase 3: Monitoring & Admin (Week 2)**
- [ ] Build admin dashboard for sequence monitoring
- [ ] Implement annual reset automation
- [ ] Add performance metrics and alerts
- [ ] Create number regeneration tools (emergency)

### **Phase 4: Business Logic Enhancement (Week 2)**
- [ ] Add custom number formats per customer
- [ ] Implement number reservations
- [ ] Add number preview functionality
- [ ] Create bulk number generation tools

---

## 📋 **USAGE EXAMPLES**

### **Creating Order with Generated Number**
```javascript
// Frontend request
POST /api/orders
{
  "customer_organization_id": "uuid-123",
  "business_entity": "chargecars",
  "order_type": "installation",
  // No order_number provided - will be auto-generated
}

// API Response
{
  "id": "uuid-456",
  "order_number": "CC-2025-00123",  // Auto-generated
  "customer_organization_id": "uuid-123",
  "business_entity": "chargecars",
  "generation_info": {
    "number": "CC-2025-00123",
    "sequence": 123,
    "business_entity": "chargecars",
    "number_type": "order"
  },
  "created_at": "2025-05-31T10:30:00Z"
}
```

### **Creating Quote from Order**
```javascript
// Frontend request
POST /api/quotes
{
  "order_id": "uuid-456",
  // No quote_number provided - will be auto-generated based on order's business_entity
}

// API Response
{
  "id": "uuid-789",
  "quote_number": "QT-CC-2025-00045",  // Auto-generated
  "order_id": "uuid-456",
  "order_number": "CC-2025-00123",      // Related order number
  "generation_info": {
    "number": "QT-CC-2025-00045",
    "sequence": 45,
    "business_entity": "chargecars",
    "number_type": "quote",
    "linked_order": "CC-2025-00123"
  }
}
```

---

## ✅ **BENEFITS**

### **Operational Benefits**
- **Immediate Response**: Generated numbers returned in API response
- **Business Logic**: Different formats per business entity
- **Audit Trail**: Complete generation tracking
- **Zero Gaps**: Sequential numbering with collision prevention

### **Technical Benefits**
- **API-First**: Primary logic in controllable application layer
- **Safety Net**: Database triggers prevent data integrity issues
- **Scalable**: Handles high volume with atomic sequence increments
- **Monitoring**: Real-time metrics and collision detection

### **Compliance Benefits**
- **Dutch Invoice Rules**: Sequential invoice numbering compliance
- **Audit Ready**: Complete paper trail for financial audits
- **Error Prevention**: Automatic validation and collision detection
- **Recovery Tools**: Emergency regeneration capabilities

---

**This number generation system provides enterprise-grade automatic numbering with business logic, safety nets, and comprehensive monitoring for all ChargeCars V2 business documents.**

---

*Number Generation System Implementation | ChargeCars V2 Technical Team | 31 mei 2025* 