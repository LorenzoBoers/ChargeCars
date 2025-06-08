# ChargeCars V2 - Business Entity Number Generation System
**Administrative Compliance with Per-Entity Sequential Numbering**  
*Updated: 31 mei 2025*

---

## 🎯 **ADMINISTRATIVE COMPLIANCE REQUIREMENTS**

### **Dutch Legal Requirements per Business Entity**
Voor Nederlandse administratieve compliance moet **elke business entity apart opeenvolgende nummering** hebben:

- **ChargeCars B.V.** → `CC-2025-00001`, `CC-2025-00002`, etc.
- **LaderThuis.nl B.V.** → `LT-2025-00001`, `LT-2025-00002`, etc.  
- **MeterKastThuis.nl B.V.** → `MK-2025-00001`, `MK-2025-00002`, etc.
- **ZaptecShop.nl B.V.** → `ZS-2025-00001`, `ZS-2025-00002`, etc.
- **RatioShop.nl B.V.** → `RS-2025-00001`, `RS-2025-00002`, etc.

### **Separate Sequences per Document Type**
Elke business entity heeft **eigen sequences** voor:
- **Orders** (bestelnummers)
- **Quotes** (offertenummers) 
- **Invoices** (factuurnummers) ← **Kritiek voor belasting**
- **Visits** (bezoek nummers)
- **Work Orders** (werkbonnummers)

---

## 🏢 **BUSINESS ENTITY MANAGEMENT**

### **Using Existing Organizations Table**
We hergebruiken de `organization` tabel (ID: 35) die al het `business_entity` field heeft:

```sql
-- Current business_entity enum values in organizations table:
-- 'chargecars', 'laderthuis', 'meterkastthuis', 'zaptecshop', 'ratioshop'
```

### **Business Entity Configuration Query**
```javascript
// Xano Function: getBusinessEntities
function getBusinessEntities() {
  return db.query(`
    SELECT DISTINCT 
      business_entity,
      COUNT(*) as organization_count,
      MIN(created_at) as first_created
    FROM organizations 
    WHERE business_entity IS NOT NULL
    GROUP BY business_entity
    ORDER BY business_entity
  `);
}

// Returns:
// [
//   { business_entity: 'chargecars', organization_count: 1, first_created: '2025-01-01' },
//   { business_entity: 'laderthuis', organization_count: 1, first_created: '2025-01-01' },
//   { business_entity: 'meterkastthuis', organization_count: 1, first_created: '2025-01-01' },
//   { business_entity: 'zaptecshop', organization_count: 1, first_created: '2025-01-01' },
//   { business_entity: 'ratioshop', organization_count: 1, first_created: '2025-01-01' }
// ]
```

### **Enhanced Business Entity Information**
```javascript
// Xano Function: getBusinessEntityDetails
function getBusinessEntityDetails(businessEntity) {
  const org = db.query(`
    SELECT 
      name,
      legal_name,
      chamber_of_commerce,
      vat_number,
      business_entity
    FROM organizations 
    WHERE business_entity = ? 
    AND organization_type = 'internal'
    LIMIT 1
  `, [businessEntity])[0];
  
  if (!org) {
    throw new Error(`Business entity ${businessEntity} not found`);
  }
  
  return {
    entity: businessEntity,
    display_name: org.name,
    legal_name: org.legal_name,
    kvk_number: org.chamber_of_commerce,
    btw_number: org.vat_number,
    prefix_mapping: getEntityPrefix(businessEntity)
  };
}
```

---

## 🔢 **ENHANCED NUMBER SEQUENCES TABLE**

### **Updated Number Sequences Schema**
```sql
-- Enhanced number_sequences table with business entity validation
CREATE TABLE number_sequence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_entity VARCHAR(20) NOT NULL,      -- References organizations.business_entity
    number_type VARCHAR(20) NOT NULL,          -- order, quote, invoice, visit, work_order
    year INTEGER NOT NULL,                     -- Current year for annual reset
    current_sequence INTEGER DEFAULT 0,        -- Current sequence number
    max_sequence_reached INTEGER DEFAULT 0,    -- Highest sequence ever reached (for monitoring)
    last_generated_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Ensure business entity exists in organizations table
    CONSTRAINT fk_business_entity 
        FOREIGN KEY (business_entity) 
        REFERENCES (SELECT DISTINCT business_entity FROM organizations),
    
    -- Unique constraint per entity/type/year
    UNIQUE(business_entity, number_type, year),
    
    -- Indexes for performance
    INDEX(business_entity, number_type),
    INDEX(year, business_entity),
    INDEX(last_generated_at)
);
```

### **Sequence Validation and Monitoring**
```sql
-- Add check constraints to prevent sequence overflow
ALTER TABLE number_sequence 
ADD CONSTRAINT check_sequence_limit 
CHECK (current_sequence <= 99999);

ALTER TABLE number_sequence 
ADD CONSTRAINT check_year_valid 
CHECK (year >= 2025 AND year <= 2050);
```

---

## 🏭 **BUSINESS ENTITY SPECIFIC IMPLEMENTATION**

### **Entity Configuration Mapping**
```javascript
// Core business entity configuration
const BUSINESS_ENTITY_CONFIG = {
  chargecars: {
    legal_name: "ChargeCars B.V.",
    prefix: "CC",
    description: "B2B Partner Focus - Main charging solutions",
    sequence_length: 5,
    supports_work_orders: true
  },
  laderthuis: {
    legal_name: "LaderThuis.nl B.V.",
    prefix: "LT", 
    description: "Consumer Direct - Home charging solutions",
    sequence_length: 5,
    supports_work_orders: true
  },
  meterkastthuis: {
    legal_name: "MeterKastThuis.nl B.V.",
    prefix: "MK",
    description: "Electrical Infrastructure - Meter cabinet solutions", 
    sequence_length: 5,
    supports_work_orders: true
  },
  zaptecshop: {
    legal_name: "ZaptecShop.nl B.V.",
    prefix: "ZS",
    description: "B2B Wholesale - Zaptec product distribution",
    sequence_length: 5,
    supports_work_orders: false  // Wholesale, no installations
  },
  ratioshop: {
    legal_name: "RatioShop.nl B.V.", 
    prefix: "RS",
    description: "B2B Wholesale - Ratio product distribution",
    sequence_length: 5,
    supports_work_orders: false  // Wholesale, no installations
  }
};

// Document type configuration
const DOCUMENT_TYPE_CONFIG = {
  order: { prefix: "", description: "Order numbers" },
  quote: { prefix: "QT-", description: "Quote numbers" },
  invoice: { prefix: "INV-", description: "Invoice numbers" },
  visit: { prefix: "VST-", description: "Visit numbers" },
  work_order: { prefix: "WO-", description: "Work order numbers", date_based: true }
};
```

### **Enhanced Number Generation Function**
```javascript
// Xano Function: generateEntityNumber
function generateEntityNumber(businessEntity, numberType, customData = {}) {
  // Validate business entity exists
  const entityConfig = BUSINESS_ENTITY_CONFIG[businessEntity];
  if (!entityConfig) {
    throw new Error(`Invalid business entity: ${businessEntity}`);
  }
  
  // Validate document type
  const typeConfig = DOCUMENT_TYPE_CONFIG[numberType];
  if (!typeConfig) {
    throw new Error(`Invalid number type: ${numberType}`);
  }
  
  // Check if this entity supports this document type
  if (numberType === 'work_order' && !entityConfig.supports_work_orders) {
    throw new Error(`${businessEntity} does not support work orders (wholesale only)`);
  }
  
  const currentYear = new Date().getFullYear();
  const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  
  // Get or create sequence record for this specific entity/type/year
  let sequence = getEntitySequenceRecord(businessEntity, numberType, currentYear);
  if (!sequence) {
    sequence = createEntitySequenceRecord(businessEntity, numberType, currentYear);
  }
  
  // Increment sequence atomically
  const nextSequence = incrementEntitySequence(sequence.id);
  
  // Generate number with entity-specific format
  const generatedNumber = formatEntityNumber(
    businessEntity, 
    numberType, 
    {
      year: currentYear,
      date: currentDate,
      sequence: nextSequence,
      ...customData
    }
  );
  
  // Log generation for audit with entity context
  logEntityNumberGeneration(businessEntity, numberType, generatedNumber, nextSequence);
  
  // Validate uniqueness across the specific table
  validateNumberUniqueness(numberType, generatedNumber);
  
  return {
    number: generatedNumber,
    sequence: nextSequence,
    business_entity: businessEntity,
    number_type: numberType,
    entity_config: entityConfig,
    year: currentYear
  };
}
```

### **Entity-Specific Sequence Management**
```javascript
// Helper: Get sequence record for specific entity
function getEntitySequenceRecord(businessEntity, numberType, year) {
  return db.query(`
    SELECT * FROM number_sequences 
    WHERE business_entity = ? AND number_type = ? AND year = ?
  `, [businessEntity, numberType, year])[0];
}

// Helper: Create new sequence for entity
function createEntitySequenceRecord(businessEntity, numberType, year) {
  // Validate entity exists in organizations
  const entityExists = db.query(`
    SELECT COUNT(*) as count FROM organizations 
    WHERE business_entity = ? AND organization_type = 'internal'
  `, [businessEntity])[0];
  
  if (entityExists.count === 0) {
    throw new Error(`Business entity ${businessEntity} not found in organizations`);
  }
  
  const newSequence = db.query(`
    INSERT INTO number_sequences 
    (business_entity, number_type, year, current_sequence)
    VALUES (?, ?, ?, 0)
    RETURNING *
  `, [businessEntity, numberType, year])[0];
  
  console.log(`Created new sequence for ${businessEntity} ${numberType} ${year}`);
  return newSequence;
}

// Helper: Increment sequence with monitoring
function incrementEntitySequence(sequenceId) {
  const result = db.query(`
    UPDATE number_sequences 
    SET 
      current_sequence = current_sequence + 1,
      max_sequence_reached = GREATEST(max_sequence_reached, current_sequence + 1),
      last_generated_at = NOW()
    WHERE id = ?
    RETURNING current_sequence, max_sequence_reached, business_entity, number_type
  `, [sequenceId])[0];
  
  // Alert if approaching limit
  if (result.current_sequence > 95000) {
    sendEntitySequenceAlert(result.business_entity, result.number_type, result.current_sequence);
  }
  
  return result.current_sequence;
}
```

### **Entity-Specific Number Formatting**
```javascript
// Enhanced number formatting with entity rules
function formatEntityNumber(businessEntity, numberType, data) {
  const entityConfig = BUSINESS_ENTITY_CONFIG[businessEntity];
  const typeConfig = DOCUMENT_TYPE_CONFIG[numberType];
  
  let format;
  
  if (numberType === 'work_order') {
    // Work orders use date-based format
    format = `${typeConfig.prefix}${entityConfig.prefix}-{date}-{sequential_3}`;
  } else {
    // Standard format: [TYPE-]PREFIX-YEAR-SEQUENCE
    format = `${typeConfig.prefix}${entityConfig.prefix}-{YYYY}-{sequential_${entityConfig.sequence_length}}`;
  }
  
  return format
    .replace('{YYYY}', data.year.toString())
    .replace('{date}', data.date)
    .replace('{sequential_3}', data.sequence.toString().padStart(3, '0'))
    .replace('{sequential_4}', data.sequence.toString().padStart(4, '0'))
    .replace('{sequential_5}', data.sequence.toString().padStart(5, '0'));
}

// Example outputs:
// formatEntityNumber('chargecars', 'order', {year: 2025, sequence: 123}) 
// → "CC-2025-00123"

// formatEntityNumber('laderthuis', 'invoice', {year: 2025, sequence: 456})
// → "INV-LT-2025-00456"

// formatEntityNumber('meterkastthuis', 'work_order', {date: '20250531', sequence: 7})
// → "WO-MK-20250531-007"
```

---

## 📊 **ADMINISTRATIVE COMPLIANCE FEATURES**

### **Invoice Number Compliance (Critical)**
```javascript
// Enhanced invoice number generation with Dutch compliance
function generateEntityInvoiceNumber(businessEntity, orderNumber = null) {
  const result = generateEntityNumber(businessEntity, 'invoice');
  
  // Dutch invoice requirements validation
  const compliance = validateDutchInvoiceCompliance(result.number, businessEntity);
  if (!compliance.valid) {
    throw new Error(`Invoice number compliance failed: ${compliance.errors.join(', ')}`);
  }
  
  // Check for sequential gaps (required by Dutch tax law)
  const hasGaps = checkInvoiceSequentialGaps(businessEntity, result.sequence);
  if (hasGaps.length > 0) {
    console.warn(`Sequential gaps detected for ${businessEntity}:`, hasGaps);
    // Log but don't fail - gaps might be from cancelled invoices
  }
  
  return {
    ...result,
    compliance: compliance,
    linked_order: orderNumber
  };
}

// Dutch invoice compliance validation
function validateDutchInvoiceCompliance(invoiceNumber, businessEntity) {
  const errors = [];
  
  // Must match entity-specific format
  const expectedPattern = new RegExp(`^INV-${BUSINESS_ENTITY_CONFIG[businessEntity].prefix}-\\d{4}-\\d{5}$`);
  if (!expectedPattern.test(invoiceNumber)) {
    errors.push('Invoice number format invalid');
  }
  
  // Must contain current year
  const currentYear = new Date().getFullYear();
  if (!invoiceNumber.includes(currentYear.toString())) {
    errors.push('Invoice number must contain current year');
  }
  
  // Must be unique
  const existing = db.query(`
    SELECT COUNT(*) as count FROM invoices 
    WHERE invoice_number = ? AND business_entity = ?
  `, [invoiceNumber, businessEntity])[0];
  
  if (existing.count > 0) {
    errors.push('Invoice number already exists');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors,
    invoice_number: invoiceNumber,
    business_entity: businessEntity
  };
}
```

### **Entity-Specific Audit Trail**
```javascript
// Enhanced audit logging with business entity tracking
function logEntityNumberGeneration(businessEntity, numberType, generatedNumber, sequence) {
  // Get business entity details
  const entityDetails = getBusinessEntityDetails(businessEntity);
  
  db.query(`
    INSERT INTO number_generation_audit 
    (business_entity, number_type, generated_number, sequence_used, 
     generation_method, entity_legal_name, entity_kvk, generated_by)
    VALUES (?, ?, ?, ?, 'api', ?, ?, ?)
  `, [
    businessEntity, 
    numberType, 
    generatedNumber, 
    sequence,
    entityDetails.legal_name,
    entityDetails.kvk_number,
    getCurrentUserId()
  ]);
  
  // Special logging for invoices (tax compliance)
  if (numberType === 'invoice') {
    db.query(`
      INSERT INTO invoice_audit_trail 
      (business_entity, invoice_number, sequence_number, legal_entity_name, 
       kvk_number, btw_number, generated_at, generated_by)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)
    `, [
      businessEntity,
      generatedNumber,
      sequence,
      entityDetails.legal_name,
      entityDetails.kvk_number,
      entityDetails.btw_number,
      getCurrentUserId()
    ]);
  }
}
```

---

## 🔍 **ENTITY-SPECIFIC MONITORING**

### **Business Entity Dashboard**
```javascript
// Xano Function: getEntitySequenceStatus
function getEntitySequenceStatus(businessEntity = null) {
  let query = `
    SELECT 
      ns.business_entity,
      org.name as entity_name,
      org.legal_name,
      org.chamber_of_commerce,
      ns.number_type,
      ns.year,
      ns.current_sequence,
      ns.max_sequence_reached,
      ns.last_generated_at,
      (ns.current_sequence * 100.0 / 99999) as usage_percentage,
      CASE 
        WHEN ns.current_sequence > 95000 THEN 'critical'
        WHEN ns.current_sequence > 90000 THEN 'warning'
        ELSE 'normal'
      END as status
    FROM number_sequences ns
    JOIN organizations org ON org.business_entity = ns.business_entity
    WHERE org.organization_type = 'internal'
  `;
  
  let params = [];
  if (businessEntity) {
    query += ' AND ns.business_entity = ?';
    params.push(businessEntity);
  }
  
  query += ' ORDER BY ns.business_entity, ns.number_type, ns.year DESC';
  
  const sequences = db.query(query, params);
  
  // Group by entity for dashboard display
  const entitiesSummary = {};
  sequences.forEach(seq => {
    if (!entitiesSummary[seq.business_entity]) {
      entitiesSummary[seq.business_entity] = {
        entity: seq.business_entity,
        entity_name: seq.entity_name,
        legal_name: seq.legal_name,
        kvk_number: seq.chamber_of_commerce,
        sequences: [],
        total_generated: 0,
        critical_sequences: 0
      };
    }
    
    entitiesSummary[seq.business_entity].sequences.push(seq);
    entitiesSummary[seq.business_entity].total_generated += seq.current_sequence;
    
    if (seq.status === 'critical') {
      entitiesSummary[seq.business_entity].critical_sequences++;
    }
  });
  
  return {
    entities: Object.values(entitiesSummary),
    total_entities: Object.keys(entitiesSummary).length,
    overall_critical: sequences.filter(s => s.status === 'critical').length
  };
}
```

### **Invoice Sequence Monitoring (Tax Compliance)**
```javascript
// Critical monitoring for invoice sequences per entity
function monitorInvoiceSequenceCompliance() {
  const entities = Object.keys(BUSINESS_ENTITY_CONFIG);
  const complianceReport = [];
  
  entities.forEach(entity => {
    // Check for gaps in invoice sequences
    const gaps = db.query(`
      WITH sequence_numbers AS (
        SELECT 
          ROW_NUMBER() OVER (ORDER BY created_at) as expected_sequence,
          CAST(SUBSTRING(invoice_number FROM '\\d{5}$') AS INTEGER) as actual_sequence,
          invoice_number,
          created_at
        FROM invoices 
        WHERE business_entity = ? 
        AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW())
        ORDER BY created_at
      )
      SELECT * FROM sequence_numbers 
      WHERE expected_sequence != actual_sequence
    `, [entity]);
    
    // Get current year statistics
    const stats = db.query(`
      SELECT 
        COUNT(*) as total_invoices,
        MIN(created_at) as first_invoice,
        MAX(created_at) as last_invoice,
        MAX(CAST(SUBSTRING(invoice_number FROM '\\d{5}$') AS INTEGER)) as highest_sequence
      FROM invoices 
      WHERE business_entity = ? 
      AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW())
    `, [entity])[0];
    
    complianceReport.push({
      business_entity: entity,
      legal_name: BUSINESS_ENTITY_CONFIG[entity].legal_name,
      year: new Date().getFullYear(),
      total_invoices: stats.total_invoices || 0,
      highest_sequence: stats.highest_sequence || 0,
      sequence_gaps: gaps.length,
      gaps_detail: gaps,
      compliance_status: gaps.length === 0 ? 'compliant' : 'gaps_detected',
      first_invoice: stats.first_invoice,
      last_invoice: stats.last_invoice
    });
  });
  
  return complianceReport;
}
```

---

## 🚀 **IMPLEMENTATION ROADMAP**

### **Phase 1: Enhanced Entity Management (Week 1)**
- [ ] Update number_sequences table with entity validation
- [ ] Create business entity configuration system
- [ ] Implement entity-specific number generation
- [ ] Add entity validation in all APIs

### **Phase 2: Administrative Compliance (Week 1)**
- [ ] Implement Dutch invoice compliance validation
- [ ] Create entity-specific audit trails
- [ ] Add sequential gap monitoring
- [ ] Build compliance reporting dashboard

### **Phase 3: Advanced Entity Features (Week 2)**
- [ ] Entity-specific sequence monitoring dashboard
- [ ] Automated compliance alerts
- [ ] Annual sequence reset per entity
- [ ] Entity performance analytics

### **Phase 4: Production Hardening (Week 2)**
- [ ] Entity backup and recovery procedures
- [ ] Load testing per entity
- [ ] Multi-entity API rate limiting
- [ ] Compliance audit tools

---

## 📋 **USAGE EXAMPLES**

### **Entity-Specific Order Creation**
```javascript
// ChargeCars order
POST /api/orders
{
  "customer_organization_id": "uuid-123",
  "business_entity": "chargecars",
  "order_type": "installation"
}

// Response
{
  "id": "uuid-456",
  "order_number": "CC-2025-00123",
  "business_entity": "chargecars",
  "generation_info": {
    "number": "CC-2025-00123",
    "sequence": 123,
    "entity_config": {
      "legal_name": "ChargeCars B.V.",
      "prefix": "CC"
    }
  }
}

// LaderThuis order (separate sequence)
POST /api/orders  
{
  "customer_organization_id": "uuid-789",
  "business_entity": "laderthuis",
  "order_type": "home_installation"
}

// Response
{
  "id": "uuid-012",
  "order_number": "LT-2025-00001", // ← Separate sequence!
  "business_entity": "laderthuis",
  "generation_info": {
    "number": "LT-2025-00001",
    "sequence": 1,
    "entity_config": {
      "legal_name": "LaderThuis.nl B.V.",
      "prefix": "LT"
    }
  }
}
```

### **Entity-Specific Invoice Generation**
```javascript
// ChargeCars invoice
const invoiceResult = generateEntityInvoiceNumber('chargecars', 'CC-2025-00123');

// Returns:
{
  "number": "INV-CC-2025-00045",
  "sequence": 45,
  "business_entity": "chargecars", 
  "compliance": {
    "valid": true,
    "errors": [],
    "invoice_number": "INV-CC-2025-00045",
    "business_entity": "chargecars"
  },
  "linked_order": "CC-2025-00123"
}
```

---

## ✅ **COMPLIANCE BENEFITS**

### **Administrative Benefits**
- **Per-Entity Sequential Numbering** - Each business entity maintains separate sequences
- **Dutch Tax Compliance** - Invoice numbering meets belastingdienst requirements
- **Legal Entity Separation** - Clear audit trails per business entity
- **Administrative Clarity** - Easy to track which entity generated what

### **Operational Benefits**
- **Entity-Specific Dashboards** - Monitor each business separately
- **Compliance Alerts** - Automatic detection of sequence issues
- **Cross-Entity Reporting** - Consolidated view when needed
- **Scalable Architecture** - Easy to add new business entities

### **Technical Benefits**
- **Database Integrity** - Foreign key constraints ensure entity validity
- **Performance Optimization** - Indexing per entity for fast queries
- **Audit Compliance** - Complete tracking per legal entity
- **Error Prevention** - Entity validation prevents misassigned numbers

---

**This enhanced system provides enterprise-grade number generation with full administrative compliance for multiple business entities, ensuring each legal entity maintains proper sequential numbering for Dutch tax and administrative requirements.**

---

*Business Entity Number Generation System | ChargeCars V2 Technical Team | 31 mei 2025* 