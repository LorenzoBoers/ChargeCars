# ChargeCars V2 - Business Entities Management System
**Centralized Entity Configuration with Branding, Templates & Number Generation**  
*Created: 31 mei 2025*

---

## 🎯 **CENTRALIZED ENTITY MANAGEMENT**

### **Business Entity Configuration Approach**
In plaats van business entities te configureren via de organizations tabel, hebben we nu een **dedicated `business_entities` tabel** voor:

- ✅ **Legal entity information** (KvK, BTW, legal names)
- ✅ **Number generation configuration** (prefixes, sequence lengths)
- ✅ **Brand configuration** (colors, logos, styling)
- ✅ **Email template configuration** (signatures, footers, branding)
- ✅ **Document template configuration** (invoices, quotes, contracts)
- ✅ **Operational settings** (payment terms, timezone, business hours)

### **ChargeCars Business Entities**
```javascript
const CHARGECARS_ENTITIES = {
  chargecars: {
    legal_name: "ChargeCars B.V.",
    prefix: "CC",
    focus: "B2B Partner Solutions",
    supports_work_orders: true
  },
  laderthuis: {
    legal_name: "LaderThuis.nl B.V.", 
    prefix: "LT",
    focus: "Consumer Direct Home Charging",
    supports_work_orders: true
  },
  meterkastthuis: {
    legal_name: "MeterKastThuis.nl B.V.",
    prefix: "MK", 
    focus: "Electrical Infrastructure & Meter Cabinets",
    supports_work_orders: true
  },
  zaptecshop: {
    legal_name: "ZaptecShop.nl B.V.",
    prefix: "ZS",
    focus: "B2B Wholesale - Zaptec Products",
    supports_work_orders: false  // Wholesale only
  },
  ratioshop: {
    legal_name: "RatioShop.nl B.V.",
    prefix: "RS", 
    focus: "B2B Wholesale - Ratio Products",
    supports_work_orders: false  // Wholesale only
  }
};
```

---

## 🏢 **BUSINESS ENTITIES TABLE SCHEMA**

### **Core Entity Information**
```sql
CREATE TABLE business_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_code VARCHAR(20) UNIQUE NOT NULL,    -- 'chargecars', 'laderthuis', etc.
    entity_name VARCHAR(100) NOT NULL,          -- 'ChargeCars'
    legal_name VARCHAR(200) NOT NULL,           -- 'ChargeCars B.V.'
    kvk_number VARCHAR(20),                     -- Chamber of Commerce number
    btw_number VARCHAR(20),                     -- VAT number
    
    -- Number generation configuration
    number_prefix VARCHAR(10) NOT NULL,         -- 'CC', 'LT', 'MK', etc.
    sequence_length INTEGER DEFAULT 5,          -- Length of sequence (00001 = 5)
    supports_work_orders BOOLEAN DEFAULT true,  -- Wholesale entities = false
    
    -- Contact information
    website_url VARCHAR(200),
    contact_email VARCHAR(100),
    contact_phone VARCHAR(50),
    
    -- Configuration objects
    branding_config JSON,                       -- Colors, logos, styling
    email_config JSON,                          -- Email templates and settings
    document_config JSON,                       -- Document templates and styling
    operational_config JSON,                    -- Business settings
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### **Branding Configuration Structure**
```javascript
// branding_config object structure
const brandingConfig = {
  primary_color: "#1E40AF",           // Primary brand color (hex)
  secondary_color: "#3B82F6",        // Secondary brand color
  accent_color: "#EF4444",           // Accent/CTA color
  
  logo_url: "https://cdn.chargecars.nl/logos/cc-logo.svg",
  logo_dark_url: "https://cdn.chargecars.nl/logos/cc-logo-dark.svg", 
  favicon_url: "https://cdn.chargecars.nl/favicons/cc-favicon.ico",
  
  email_header_url: "https://cdn.chargecars.nl/email/cc-header.jpg",
  document_letterhead_url: "https://cdn.chargecars.nl/docs/cc-letterhead.pdf",
  
  // CSS classes for styling
  css_classes: {
    primary_button: "bg-blue-600 hover:bg-blue-700",
    secondary_button: "bg-gray-600 hover:bg-gray-700",
    header_style: "bg-gradient-to-r from-blue-600 to-blue-800"
  }
};
```

### **Email Configuration Structure**
```javascript
// email_config object structure  
const emailConfig = {
  from_name: "ChargeCars Service",
  from_email: "service@chargecars.nl",
  reply_to_email: "support@chargecars.nl",
  
  footer_text: "ChargeCars B.V. | KvK: 12345678 | BTW: NL123456789B01",
  
  signature_template: `
    Met vriendelijke groet,<br>
    Het ChargeCars Team<br><br>
    <strong>ChargeCars B.V.</strong><br>
    📧 service@chargecars.nl<br>
    📞 +31 20 123 4567<br>
    🌐 www.chargecars.nl
  `,
  
  unsubscribe_url: "https://chargecars.nl/unsubscribe",
  
  // Template overrides per email type
  templates: {
    order_confirmation: "cc-order-confirmation-v2",
    invoice_notification: "cc-invoice-notification-v2", 
    visit_reminder: "cc-visit-reminder-v1"
  }
};
```

### **Document Configuration Structure**
```javascript
// document_config object structure
const documentConfig = {
  invoice_template: "chargecars-invoice-v3",
  quote_template: "chargecars-quote-v2", 
  contract_template: "chargecars-contract-v1",
  work_order_template: "chargecars-workorder-v1",
  
  footer_text: "ChargeCars B.V. | Postbus 12345, 1000 AB Amsterdam | KvK: 12345678 | BTW: NL123456789B01",
  
  terms_url: "https://chargecars.nl/algemene-voorwaarden",
  privacy_url: "https://chargecars.nl/privacy",
  
  // Styling configuration
  styling: {
    font_family: "Inter, sans-serif",
    header_height: "120px",
    footer_height: "80px",
    margin_size: "20mm"
  }
};
```

### **Operational Configuration Structure**
```javascript
// operational_config object structure
const operationalConfig = {
  default_payment_terms: "net_30",
  default_currency: "EUR",
  timezone: "Europe/Amsterdam", 
  
  business_hours: {
    monday: "08:00-17:00",
    tuesday: "08:00-17:00", 
    wednesday: "08:00-17:00",
    thursday: "08:00-17:00",
    friday: "08:00-17:00",
    saturday: "closed",
    sunday: "closed"
  },
  
  // Business-specific settings
  settings: {
    auto_send_quotes: true,
    require_signature_on_delivery: true,
    send_visit_reminders: true,
    reminder_hours_before: 24
  }
};
```

---

## 🔧 **ENTITY MANAGEMENT FUNCTIONS**

### **Entity Configuration Functions**
```javascript
// Xano Function: getBusinessEntity
function getBusinessEntity(entityCode) {
  const entity = db.query(`
    SELECT * FROM business_entities 
    WHERE entity_code = ? AND is_active = true
  `, [entityCode])[0];
  
  if (!entity) {
    throw new Error(`Business entity '${entityCode}' not found or inactive`);
  }
  
  return {
    ...entity,
    branding_config: JSON.parse(entity.branding_config || '{}'),
    email_config: JSON.parse(entity.email_config || '{}'),
    document_config: JSON.parse(entity.document_config || '{}'),
    operational_config: JSON.parse(entity.operational_config || '{}')
  };
}

// Xano Function: getAllBusinessEntities
function getAllBusinessEntities() {
  const entities = db.query(`
    SELECT 
      entity_code,
      entity_name,
      legal_name,
      number_prefix,
      supports_work_orders,
      is_active
    FROM business_entities 
    WHERE is_active = true
    ORDER BY entity_name
  `);
  
  return entities;
}

// Xano Function: updateEntityBranding
function updateEntityBranding(entityCode, brandingConfig) {
  const entity = getBusinessEntity(entityCode);
  
  const result = db.query(`
    UPDATE business_entities 
    SET branding_config = ?
    WHERE entity_code = ?
    RETURNING *
  `, [JSON.stringify(brandingConfig), entityCode])[0];
  
  // Clear any cached branding
  clearEntityCache(entityCode);
  
  return result;
}
```

### **Enhanced Number Generation with Entity Integration**
```javascript
// Updated number generation to use business_entities table
function generateEntityNumber(entityCode, numberType, customData = {}) {
  // Get entity configuration
  const entity = getBusinessEntity(entityCode);
  
  // Validate document type support
  if (numberType === 'work_order' && !entity.supports_work_orders) {
    throw new Error(`${entity.entity_name} does not support work orders (wholesale only)`);
  }
  
  const currentYear = new Date().getFullYear();
  const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  
  // Get or create sequence record
  let sequence = getEntitySequenceRecord(entityCode, numberType, currentYear);
  if (!sequence) {
    sequence = createEntitySequenceRecord(entityCode, numberType, currentYear);
  }
  
  // Increment sequence atomically
  const nextSequence = incrementEntitySequence(sequence.id);
  
  // Generate number using entity configuration
  const generatedNumber = formatNumberWithEntityConfig(
    entity,
    numberType,
    {
      year: currentYear,
      date: currentDate,
      sequence: nextSequence,
      ...customData
    }
  );
  
  // Enhanced logging with entity details
  logEntityNumberGeneration(entity, numberType, generatedNumber, nextSequence);
  
  return {
    number: generatedNumber,
    sequence: nextSequence,
    entity_code: entityCode,
    entity_name: entity.entity_name,
    number_type: numberType,
    entity_config: {
      legal_name: entity.legal_name,
      prefix: entity.number_prefix,
      kvk_number: entity.kvk_number,
      btw_number: entity.btw_number
    },
    year: currentYear
  };
}

// Enhanced number formatting using entity configuration
function formatNumberWithEntityConfig(entity, numberType, data) {
  const typePrefix = {
    order: "",
    quote: "QT-",
    invoice: "INV-",
    visit: "VST-", 
    work_order: "WO-"
  };
  
  let format;
  
  if (numberType === 'work_order') {
    // Work orders use date-based format
    format = `${typePrefix[numberType]}${entity.number_prefix}-{date}-{sequential_3}`;
  } else {
    // Standard format: [TYPE-]PREFIX-YEAR-SEQUENCE
    format = `${typePrefix[numberType]}${entity.number_prefix}-{YYYY}-{sequential_${entity.sequence_length}}`;
  }
  
  return format
    .replace('{YYYY}', data.year.toString())
    .replace('{date}', data.date)
    .replace('{sequential_3}', data.sequence.toString().padStart(3, '0'))
    .replace('{sequential_4}', data.sequence.toString().padStart(4, '0'))
    .replace('{sequential_5}', data.sequence.toString().padStart(5, '0'));
}
```

---

## 📧 **EMAIL TEMPLATE INTEGRATION**

### **Entity-Specific Email Generation**
```javascript
// Xano Function: sendEntityEmail
function sendEntityEmail(entityCode, emailType, recipientEmail, templateData) {
  const entity = getBusinessEntity(entityCode);
  const emailConfig = entity.email_config;
  const brandingConfig = entity.branding_config;
  
  // Get entity-specific template
  const templateId = emailConfig.templates?.[emailType] || `default-${emailType}`;
  
  // Prepare email data with entity branding
  const emailData = {
    to: recipientEmail,
    from: {
      name: emailConfig.from_name || entity.entity_name,
      email: emailConfig.from_email || entity.contact_email
    },
    reply_to: emailConfig.reply_to_email,
    
    template_id: templateId,
    template_data: {
      ...templateData,
      
      // Entity branding variables
      entity_name: entity.entity_name,
      entity_legal_name: entity.legal_name,
      entity_logo: brandingConfig.logo_url,
      entity_primary_color: brandingConfig.primary_color,
      entity_website: entity.website_url,
      
      // Footer and signature
      email_footer: emailConfig.footer_text,
      email_signature: emailConfig.signature_template,
      
      // Legal information
      kvk_number: entity.kvk_number,
      btw_number: entity.btw_number,
      
      // Unsubscribe
      unsubscribe_url: emailConfig.unsubscribe_url
    }
  };
  
  // Send via SendGrid with entity-specific configuration
  return sendEmailViaSendGrid(emailData);
}

// Example usage: Order confirmation email
function sendOrderConfirmationEmail(orderData) {
  const entity = getBusinessEntity(orderData.business_entity);
  
  return sendEntityEmail(
    orderData.business_entity,
    'order_confirmation',
    orderData.customer_email,
    {
      order_number: orderData.order_number,
      customer_name: orderData.customer_name,
      order_total: orderData.total_amount,
      delivery_date: orderData.estimated_delivery,
      order_items: orderData.line_items
    }
  );
}
```

### **Email Template Management**
```javascript
// Xano Function: updateEntityEmailTemplates
function updateEntityEmailTemplates(entityCode, emailConfig) {
  const entity = getBusinessEntity(entityCode);
  
  // Validate email configuration
  if (emailConfig.from_email && !isValidEmail(emailConfig.from_email)) {
    throw new Error('Invalid from_email format');
  }
  
  const result = db.query(`
    UPDATE business_entities 
    SET email_config = ?
    WHERE entity_code = ?
    RETURNING *
  `, [JSON.stringify(emailConfig), entityCode])[0];
  
  // Update SendGrid templates if needed
  syncEntityEmailTemplates(entityCode, emailConfig);
  
  return result;
}
```

---

## 📄 **DOCUMENT TEMPLATE INTEGRATION**

### **Entity-Specific Document Generation**
```javascript
// Xano Function: generateEntityDocument
function generateEntityDocument(entityCode, documentType, documentData) {
  const entity = getBusinessEntity(entityCode);
  const documentConfig = entity.document_config;
  const brandingConfig = entity.branding_config;
  
  // Get entity-specific template
  const templateKey = `${documentType}_template`;
  const templateId = documentConfig[templateKey] || `default-${documentType}`;
  
  // Prepare document data with entity styling
  const docData = {
    ...documentData,
    
    // Entity information
    entity_name: entity.entity_name,
    entity_legal_name: entity.legal_name,
    entity_address: entity.operational_config?.address,
    entity_contact_email: entity.contact_email,
    entity_contact_phone: entity.contact_phone,
    entity_website: entity.website_url,
    
    // Legal numbers
    kvk_number: entity.kvk_number,
    btw_number: entity.btw_number,
    
    // Branding
    logo_url: brandingConfig.logo_url,
    primary_color: brandingConfig.primary_color,
    letterhead_url: brandingConfig.document_letterhead_url,
    
    // Document styling
    font_family: documentConfig.styling?.font_family,
    header_height: documentConfig.styling?.header_height,
    footer_height: documentConfig.styling?.footer_height,
    
    // Footer content
    document_footer: documentConfig.footer_text,
    terms_url: documentConfig.terms_url,
    privacy_url: documentConfig.privacy_url,
    
    // Business configuration
    default_payment_terms: entity.operational_config?.default_payment_terms,
    default_currency: entity.operational_config?.default_currency
  };
  
  // Generate document using template engine
  return generateDocumentFromTemplate(templateId, docData);
}

// Example: Invoice generation with entity branding
function generateEntityInvoice(invoiceData) {
  const entity = getBusinessEntity(invoiceData.business_entity);
  
  return generateEntityDocument(
    invoiceData.business_entity,
    'invoice',
    {
      invoice_number: invoiceData.invoice_number,
      invoice_date: invoiceData.created_at,
      due_date: calculateDueDate(invoiceData.created_at, entity.operational_config?.default_payment_terms),
      
      customer_info: invoiceData.customer_organization,
      line_items: invoiceData.line_items,
      subtotal: invoiceData.subtotal,
      tax_amount: invoiceData.tax_amount,
      total_amount: invoiceData.total_amount,
      
      payment_terms: entity.operational_config?.default_payment_terms,
      currency: entity.operational_config?.default_currency || 'EUR'
    }
  );
}
```

---

## 🔍 **ENTITY DASHBOARD & MONITORING**

### **Entity Performance Dashboard**
```javascript
// Xano Function: getEntityDashboard
function getEntityDashboard(entityCode = null) {
  let entities = [];
  
  if (entityCode) {
    entities = [getBusinessEntity(entityCode)];
  } else {
    entities = getAllBusinessEntities();
  }
  
  const dashboard = entities.map(entity => {
    // Get sequence status
    const sequences = getEntitySequenceStatus(entity.entity_code);
    
    // Get recent activity
    const recentActivity = db.query(`
      SELECT 
        COUNT(CASE WHEN number_type = 'order' THEN 1 END) as orders_today,
        COUNT(CASE WHEN number_type = 'invoice' THEN 1 END) as invoices_today,
        COUNT(CASE WHEN number_type = 'quote' THEN 1 END) as quotes_today
      FROM number_generation_audit 
      WHERE business_entity = ? 
      AND DATE(created_at) = CURRENT_DATE
    `, [entity.entity_code])[0];
    
    // Get email statistics
    const emailStats = getEntityEmailStats(entity.entity_code);
    
    return {
      entity: entity.entity_code,
      entity_name: entity.entity_name,
      legal_name: entity.legal_name,
      
      sequences: sequences,
      activity: recentActivity,
      email_stats: emailStats,
      
      branding_configured: !!entity.branding_config?.logo_url,
      email_configured: !!entity.email_config?.from_email,
      documents_configured: !!entity.document_config?.invoice_template,
      
      is_active: entity.is_active
    };
  });
  
  return dashboard;
}
```

### **Entity Configuration Validation**
```javascript
// Xano Function: validateEntityConfiguration
function validateEntityConfiguration(entityCode) {
  const entity = getBusinessEntity(entityCode);
  const issues = [];
  
  // Legal information validation
  if (!entity.legal_name) issues.push('Missing legal_name');
  if (!entity.kvk_number) issues.push('Missing kvk_number'); 
  if (!entity.btw_number) issues.push('Missing btw_number');
  
  // Branding validation
  if (!entity.branding_config?.logo_url) issues.push('Missing logo_url');
  if (!entity.branding_config?.primary_color) issues.push('Missing primary_color');
  
  // Email configuration validation
  if (!entity.email_config?.from_email) issues.push('Missing email from_email');
  if (!entity.email_config?.from_name) issues.push('Missing email from_name');
  
  // Document configuration validation
  if (!entity.document_config?.invoice_template) issues.push('Missing invoice_template');
  if (!entity.document_config?.footer_text) issues.push('Missing document footer_text');
  
  // Operational configuration validation
  if (!entity.operational_config?.default_payment_terms) issues.push('Missing default_payment_terms');
  if (!entity.operational_config?.timezone) issues.push('Missing timezone');
  
  return {
    entity_code: entityCode,
    entity_name: entity.entity_name,
    is_valid: issues.length === 0,
    issues: issues,
    validation_score: Math.round((1 - issues.length / 10) * 100)
  };
}
```

---

## 🚀 **IMPLEMENTATION ROADMAP**

### **Phase 1: Entity Table & Basic Configuration (Week 1)**
- [x] Create business_entities table with full schema
- [ ] Insert initial entity data for all 5 business entities
- [ ] Update number generation to use business_entities table
- [ ] Create entity management API endpoints

### **Phase 2: Branding & Email Integration (Week 1)**
- [ ] Implement entity-specific email templates
- [ ] Configure branding per entity (logos, colors, styling)
- [ ] Update email sending to use entity configuration
- [ ] Create branding management interface

### **Phase 3: Document Templates (Week 2)**
- [ ] Implement entity-specific document generation
- [ ] Configure invoice/quote templates per entity
- [ ] Add document styling and letterheads
- [ ] Create document template management

### **Phase 4: Dashboard & Monitoring (Week 2)**
- [ ] Build entity configuration dashboard
- [ ] Add entity performance monitoring
- [ ] Implement configuration validation
- [ ] Create entity management admin interface

---

## 📋 **ENTITY INITIALIZATION DATA**

### **Sample Entity Setup**
```javascript
// Initial data for business_entities table
const initialEntities = [
  {
    entity_code: 'chargecars',
    entity_name: 'ChargeCars',
    legal_name: 'ChargeCars B.V.',
    kvk_number: '12345678',
    btw_number: 'NL123456789B01',
    number_prefix: 'CC',
    sequence_length: 5,
    supports_work_orders: true,
    website_url: 'https://chargecars.nl',
    contact_email: 'service@chargecars.nl',
    contact_phone: '+31 20 123 4567',
    
    branding_config: {
      primary_color: '#1E40AF',
      secondary_color: '#3B82F6',
      logo_url: 'https://cdn.chargecars.nl/logos/cc-logo.svg',
      email_header_url: 'https://cdn.chargecars.nl/email/cc-header.jpg'
    },
    
    email_config: {
      from_name: 'ChargeCars Service',
      from_email: 'service@chargecars.nl',
      footer_text: 'ChargeCars B.V. | KvK: 12345678 | BTW: NL123456789B01'
    },
    
    operational_config: {
      default_payment_terms: 'net_30',
      default_currency: 'EUR',
      timezone: 'Europe/Amsterdam'
    }
  }
  // ... other entities
];
```

---

## ✅ **BENEFITS VAN CENTRALIZED ENTITY MANAGEMENT**

### **Operational Benefits**
- **Centralized Configuration** - Alle entity settings op één plek
- **Consistent Branding** - Automatische branding per entity
- **Template Management** - Easy email/document template updates
- **Entity-Specific Settings** - Payment terms, business hours, etc.

### **Technical Benefits**
- **Single Source of Truth** - No configuration duplication
- **API Efficiency** - One query for all entity configuration
- **Scalable Architecture** - Easy to add new entities
- **Configuration Validation** - Automated checks for completeness

### **Business Benefits**  
- **Brand Consistency** - Automatic correct branding per entity
- **Compliance Ready** - Legal information always up-to-date
- **Operational Efficiency** - Entity-specific business rules
- **Professional Communications** - Branded emails and documents

---

## 🔗 **INTEGRATION MET COMMUNICATION CHANNELS**

### **Multi-Channel per Entity**
Het business entities systeem integreert perfect met het nieuwe **Multi-Entity Communication Channels** systeem:

```javascript
// Example: Complete entity setup with communication channels
function setupCompleteBusinessEntity(entityCode) {
  // 1. Create/update business entity
  const entity = updateBusinessEntity(entityCode, {
    branding_config: { /* colors, logos, styling */ },
    email_config: { /* templates, signatures */ },
    operational_config: { /* business hours, settings */ }
  });
  
  // 2. Configure communication channels
  const channels = setupEntityCommunicationChannels(entityCode, {
    email: ['support', 'sales', 'admin', 'operations'],
    whatsapp: ['support', 'sales'],
    teams: ['operations', 'support']
  });
  
  // 3. Setup number generation
  initializeEntityNumberGeneration(entityCode);
  
  return {
    entity: entity,
    channels: channels,
    status: 'fully_configured'
  };
}
```

### **Related Documentation**
- **Multi_Entity_Communication_Channels.md** - Gedetailleerde communicatie architectuur
- **Number_Generation_System.md** - Automatische nummer generatie per entity
- **Business_Entity_Number_Generation.md** - Nederlandse compliance voor nummering

---

**Total System: 56 Database Tables**
- **Business Entities Management**: 4 tables (87-90)
- **Multi-Entity Communication**: 3 tables (91-93)
- **Complete Integration**: Entity-specific channels, branding, templates & numbering

**Dit systeem biedt complete controle over alle business entities met centralized configuration voor branding, templates, number generation, communication channels en operational settings. Perfect voor enterprise multi-entity business management! 🎉**

---

*Business Entities Management System | ChargeCars V2 Technical Team | 31 mei 2025* 