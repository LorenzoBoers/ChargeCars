# ChargeCars V2 - External Integrations Specification
**Complete Third-Party Integration Implementation Guide**  
*Created: 31 mei 2025*

---

## 🔌 **INTEGRATION OVERVIEW**

### **Priority External Systems**
- **WhatsApp Business API** - Customer communication channel
- **Microsoft Teams** - Internal notifications and collaboration  
- **Email Services** - Transactional and marketing emails
- **Make.com** - Workflow automation and data sync
- **Fillout Forms** - Dynamic form submissions
- **Address Validation** - Dutch postal code and address verification

---

## 📱 **WHATSAPP BUSINESS API INTEGRATION**

### **Setup Requirements**
```javascript
// WhatsApp Business API Configuration
{
  "provider": "WhatsApp Business Cloud API",
  "phone_number_id": "106742025925718",
  "business_account_id": "chargecars_business",
  "webhook_verify_token": "chargecars_webhook_2025",
  "access_token": "EAAG...",
  "api_version": "v18.0"
}
```

### **Webhook Integration**
```javascript
// Xano Webhook Endpoint: /api/v1/webhooks/whatsapp
POST /api/v1/webhooks/whatsapp
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "ENTRY_ID",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "31612345678",
          "phone_number_id": "106742025925718"
        },
        "messages": [{
          "from": "31687654321",
          "id": "wamid.xxx",
          "timestamp": "1703765400",
          "text": {
            "body": "Ik heb een vraag over mijn bestelling"
          },
          "type": "text"
        }]
      }
    }]
  }]
}
```

### **Message Processing Logic**
```javascript
// Xano Function: processWhatsAppMessage
function processWhatsAppMessage(payload) {
  const message = payload.entry[0].changes[0].value.messages[0];
  const from = message.from;
  const messageBody = message.text.body;
  
  // 1. Find or create contact by phone number
  const contact = findContactByPhone(from);
  
  // 2. Find or create communication thread
  const thread = findOrCreateThread(contact.id, 'whatsapp');
  
  // 3. Store message in communication_messages table
  const storedMessage = {
    thread_id: thread.id,
    channel_id: getChannelId('whatsapp'),
    message_content: messageBody,
    direction: 'inbound',
    external_message_id: message.id,
    sender_phone: from,
    received_at: new Date(message.timestamp * 1000)
  };
  
  // 4. Create notification for relevant users
  createNotification({
    type: 'message_received',
    title: `Nieuw WhatsApp bericht van ${contact.name}`,
    message: messageBody,
    source_table: 'communication_messages',
    source_record_id: storedMessage.id
  });
  
  // 5. Auto-respond for common queries
  if (isOrderStatusQuery(messageBody)) {
    sendOrderStatusUpdate(from, contact.id);
  }
}
```

### **Outbound Message API**
```javascript
// Send WhatsApp message via Xano
POST /api/v1/external/send-whatsapp
{
  "to": "31687654321",
  "type": "text",
  "text": {
    "body": "Uw bestelling #ORD-2025-001 is vandaag afgerond! Bedankt voor uw vertrouwen in ChargeCars."
  },
  "context": {
    "message_id": "wamid.previous_message_id"
  }
}

// Template message for order updates
{
  "to": "31687654321",
  "type": "template",
  "template": {
    "name": "order_status_update",
    "language": { "code": "nl" },
    "components": [{
      "type": "body",
      "parameters": [{
        "type": "text",
        "text": "ORD-2025-001"
      }, {
        "type": "text", 
        "text": "In behandeling"
      }]
    }]
  }
}
```

---

## 💼 **MICROSOFT TEAMS INTEGRATION**

### **Teams Webhook Configuration**
```javascript
// Teams Incoming Webhook Setup
{
  "webhook_url": "https://outlook.office.com/webhook/xxx/IncomingWebhook/yyy/zzz",
  "team_name": "ChargeCars Operations",
  "channel_name": "Notifications",
  "mention_users": ["john@chargecars.nl", "sarah@chargecars.nl"]
}
```

### **Adaptive Card Templates**
```javascript
// Order Status Update Card
const orderUpdateCard = {
  "type": "message",
  "attachments": [{
    "contentType": "application/vnd.microsoft.card.adaptive",
    "content": {
      "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
      "type": "AdaptiveCard",
      "version": "1.3",
      "body": [{
        "type": "TextBlock",
        "text": "Order Status Update",
        "weight": "Bolder",
        "size": "Medium",
        "color": "Accent"
      }, {
        "type": "FactSet",
        "facts": [{
          "title": "Order ID:",
          "value": "${order_id}"
        }, {
          "title": "Customer:",
          "value": "${customer_name}"
        }, {
          "title": "Status:",
          "value": "${new_status}"
        }, {
          "title": "Team:",
          "value": "${assigned_team}"
        }]
      }],
      "actions": [{
        "type": "Action.OpenUrl",
        "title": "View Order",
        "url": "https://portal.chargecars.nl/order/${order_id}"
      }]
    }
  }]
};
```

### **Notification Triggers**
```javascript
// Xano Function: sendTeamsNotification  
function sendTeamsNotification(notificationType, data) {
  const triggers = {
    'order_urgent': {
      teams: ['operations', 'management'],
      priority: 'high',
      template: 'urgent_order_card'
    },
    'technician_absent': {
      teams: ['operations'],
      priority: 'medium', 
      template: 'absence_notification_card'
    },
    'system_error': {
      teams: ['tech', 'management'],
      priority: 'critical',
      template: 'system_alert_card'
    }
  };
  
  const config = triggers[notificationType];
  if (config) {
    config.teams.forEach(team => {
      sendToTeamsChannel(team, config.template, data);
    });
  }
}
```

---

## 📧 **EMAIL SERVICE INTEGRATION**

### **SendGrid Configuration** (Recommended)
```javascript
// SendGrid API Configuration
{
  "api_key": "SG.xxx-yyy-zzz",
  "from_email": "noreply@chargecars.nl",
  "from_name": "ChargeCars Nederland",
  "reply_to": "info@chargecars.nl",
  "tracking": {
    "click_tracking": true,
    "open_tracking": true,
    "subscription_tracking": false
  }
}
```

### **Email Templates**
```javascript
// Order Confirmation Email
const orderConfirmationTemplate = {
  "template_id": "d-order-confirmation-2025",
  "dynamic_template_data": {
    "customer_name": "{{customer_name}}",
    "order_id": "{{order_id}}",
    "order_total": "{{order_total}}",
    "installation_date": "{{installation_date}}",
    "team_contact": "{{team_contact}}",
    "articles": "{{articles}}"
  },
  "categories": ["order", "confirmation", "transactional"]
};

// Visit Reminder Email
const visitReminderTemplate = {
  "template_id": "d-visit-reminder-2025", 
  "dynamic_template_data": {
    "customer_name": "{{customer_name}}",
    "visit_date": "{{visit_date}}",
    "visit_time": "{{visit_time}}",
    "technician_name": "{{technician_name}}",
    "technician_phone": "{{technician_phone}}",
    "preparation_notes": "{{preparation_notes}}"
  },
  "send_at": "{{visit_date_minus_24h}}"
};
```

### **Email API Endpoints**
```javascript
// Send transactional email
POST /api/v1/external/send-email
{
  "to": "customer@example.com",
  "template_id": "order_confirmation",
  "dynamic_data": {
    "customer_name": "Jan Janssen",
    "order_id": "ORD-2025-001"
  },
  "category": "order_confirmation"
}

// Send bulk marketing email (if applicable)
POST /api/v1/external/send-bulk-email
{
  "list_id": "marketing_subscribers",
  "template_id": "monthly_newsletter",
  "send_at": "2025-02-01T09:00:00Z"
}
```

---

## 🔄 **MAKE.COM AUTOMATION INTEGRATION**

### **Webhook Scenarios**
```javascript
// Make.com Webhook Endpoints in Xano
POST /api/v1/webhooks/make/order-created
POST /api/v1/webhooks/make/visit-completed  
POST /api/v1/webhooks/make/payment-received
POST /api/v1/webhooks/make/customer-feedback
```

### **Data Synchronization Flows**
```javascript
// Order Status → Multiple Systems
{
  "trigger": "order.status_changed",
  "actions": [
    {
      "type": "update_external_crm",
      "endpoint": "https://api.external-crm.com/orders",
      "method": "PATCH"
    },
    {
      "type": "send_whatsapp", 
      "condition": "status === 'completed'",
      "template": "order_completion_notification"
    },
    {
      "type": "create_invoice",
      "condition": "status === 'completed'",
      "integration": "accounting_system"
    }
  ]
}
```

### **Make.com Integration Functions**
```javascript
// Xano Function: triggerMakeScenario
function triggerMakeScenario(scenario, data) {
  const makeWebhooks = {
    'order_processing': 'https://hook.eu1.make.com/xxx1',
    'inventory_update': 'https://hook.eu1.make.com/xxx2', 
    'customer_communication': 'https://hook.eu1.make.com/xxx3',
    'financial_processing': 'https://hook.eu1.make.com/xxx4'
  };
  
  const webhookUrl = makeWebhooks[scenario];
  if (webhookUrl) {
    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        source: 'chargecars_xano',
        scenario: scenario,
        data: data
      })
    });
  }
}
```

---

## 📋 **FILLOUT FORMS INTEGRATION**

### **Form Webhook Processing**
```javascript
// Fillout webhook payload structure
POST /api/v1/webhooks/fillout
{
  "formId": "chargecars-intake-2025",
  "submissionId": "sub_xxx123",
  "submittedAt": "2025-01-31T14:30:00Z",
  "responses": {
    "customer_name": "Jan Janssen",
    "email": "jan@example.com", 
    "phone": "06-12345678",
    "address": "Kerkstraat 123, 1234AB Amsterdam",
    "charging_needs": "Thuisladen voor 2 auto's",
    "installation_preference": "Zo snel mogelijk",
    "selected_products": ["Wallbox 11kW", "Slimme laadkabel"]
  }
}
```

### **Form Processing Logic**
```javascript
// Xano Function: processFilloutSubmission
function processFilloutSubmission(payload) {
  const responses = payload.responses;
  
  // 1. Create or update organization
  const organization = createOrUpdateOrganization({
    name: responses.customer_name + " (Privé)",
    type: "individual"
  });
  
  // 2. Create contact
  const contact = createContact({
    organization_id: organization.id,
    name: responses.customer_name,
    email: responses.email,
    phone: responses.phone,
    role: "primary"
  });
  
  // 3. Create address
  const address = createAddress({
    entity_type: "organization",
    entity_id: organization.id,
    full_address: responses.address,
    address_type: "installation"
  });
  
  // 4. Create form submission record
  const submission = createFormSubmission({
    form_id: getFormIdByExternalId(payload.formId),
    external_submission_id: payload.submissionId,
    organization_id: organization.id,
    contact_id: contact.id,
    raw_data: responses,
    submitted_at: payload.submittedAt
  });
  
  // 5. Create preliminary order
  const order = createPreliminaryOrder({
    organization_id: organization.id,
    primary_contact_id: contact.id,
    form_submission_id: submission.id,
    status: "intake_received",
    notes: responses.charging_needs
  });
  
  // 6. Add line items for selected products
  responses.selected_products.forEach(product => {
    addLineItem({
      order_id: order.id,
      article_id: getArticleByName(product),
      quantity: 1,
      status: "preliminary"
    });
  });
  
  // 7. Trigger notifications
  createNotification({
    type: "order_intake_received",
    title: `Nieuwe intake: ${responses.customer_name}`,
    message: `Locatie: ${responses.address}`,
    source_table: "orders",
    source_record_id: order.id
  });
  
  return { success: true, order_id: order.id };
}
```

---

## 🏠 **ADDRESS VALIDATION INTEGRATION**

### **PostNL/BAG API Integration**
```javascript
// Dutch address validation service
const validateDutchAddress = {
  "api_endpoint": "https://api.pdok.nl/bzk/locatieserver/search/v3_1/",
  "service": "BAG (Basisregistratie Adressen en Gebouwen)",
  "authentication": "none", // Public API
  "rate_limit": "1000/hour"
};

// Xano Function: validateAddress
function validateAddress(postalCode, houseNumber, houseNumberAddition = '') {
  const query = `${postalCode} ${houseNumber}${houseNumberAddition}`;
  
  const response = fetch(`https://api.pdok.nl/bzk/locatieserver/search/v3_1/suggest?q=${encodeURIComponent(query)}&fq=type:adres`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  });
  
  if (response.response && response.response.docs.length > 0) {
    const address = response.response.docs[0];
    return {
      valid: true,
      formatted_address: address.weergavenaam,
      city: address.woonplaatsnaam,
      province: address.provincienaam,
      coordinates: {
        latitude: address.centroide_ll.split(' ')[1],
        longitude: address.centroide_ll.split(' ')[0]
      },
      bag_id: address.id
    };
  }
  
  return { valid: false, error: 'Address not found' };
}
```

---

## 🔐 **SECURITY CONSIDERATIONS**

### **API Key Management**
```javascript
// Environment variables for secure storage
process.env.WHATSAPP_ACCESS_TOKEN = "EAAG...";
process.env.SENDGRID_API_KEY = "SG.xxx...";
process.env.TEAMS_WEBHOOK_URL = "https://outlook.office.com/webhook/...";
process.env.MAKE_WEBHOOK_SECRET = "make_secret_2025";
```

### **Webhook Security**
```javascript
// Verify webhook signatures
function verifyWebhookSignature(payload, signature, secret) {
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

### **Rate Limiting**
```javascript
// Integration-specific rate limits
const rateLimits = {
  whatsapp: '80 messages/second',
  sendgrid: '600 emails/minute',
  teams: '100 messages/minute',
  make: '1000 webhook calls/hour'
};
```

---

## 📊 **MONITORING & ANALYTICS**

### **Integration Health Checks**
```javascript
// Daily health check function
function performIntegrationHealthChecks() {
  const checks = [
    checkWhatsAppConnection(),
    checkSendGridQuota(),
    checkTeamsWebhook(),
    checkMakeScenarios(),
    checkAddressValidationAPI()
  ];
  
  const results = Promise.all(checks);
  
  if (results.some(check => !check.healthy)) {
    sendAdminAlert('Integration health check failed');
  }
  
  logHealthCheckResults(results);
}
```

### **Usage Analytics**
```javascript
// Track integration usage in api_usage_logs
{
  "endpoint": "/api/v1/external/send-whatsapp",
  "integration": "whatsapp",
  "request_count": 156,
  "success_rate": 98.7,
  "avg_response_time": 245,
  "date": "2025-01-31"
}
```

---

## 🚀 **IMPLEMENTATION ROADMAP**

### **Phase 1: Core Communications (Week 1-2)**
- [ ] WhatsApp Business API setup
- [ ] Basic message sending/receiving
- [ ] Email template configuration
- [ ] Teams webhook integration

### **Phase 2: Advanced Features (Week 2-3)**
- [ ] WhatsApp template messages
- [ ] Email automation workflows
- [ ] Teams adaptive cards
- [ ] Fillout form processing

### **Phase 3: Automation (Week 3-4)**
- [ ] Make.com scenario integration
- [ ] Address validation service
- [ ] Multi-channel notification rules
- [ ] Error handling and monitoring

### **Phase 4: Optimization (Week 4-5)**
- [ ] Performance monitoring
- [ ] Advanced analytics
- [ ] Rate limiting optimization
- [ ] Security audit

---

*This comprehensive integration specification ensures ChargeCars V2 seamlessly connects with all essential external services for optimal customer experience and operational efficiency.* 