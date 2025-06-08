# Step-by-Step API Implementation Guide
*Live Implementation Session - ChargeCars V2*

## 🎯 **IMPLEMENTATIE SESSIE - VOLG DEZE STAPPEN**

### **VOORBEREIDING (2 minuten)**

1. **Open twee browser tabs:**
   - **Tab 1:** Xano Admin Dashboard (je gaat hierin werken)
   - **Tab 2:** Deze documentatie (voor copy-paste)

2. **Login Xano Admin:**
   - Ga naar je Xano workspace: **ChargeCars V2**
   - Navigeer naar **API** sectie

---

## 📋 **FASE 1: STATUS ENGINE API (30 minuten) - CRITICAL PATH**

### **STAP 1A: Create API Group (3 minuten)**

1. **In Xano Admin:**
   - Klik **"API"** in de linker navigatie
   - Klik **"+ Add API Group"**
   - **Name:** `Status Engine`
   - **Description:** `Core status management and workflow automation`
   - Klik **"Create"**

### **STAP 1B: Create change_entity_status Function (15 minuten)**

1. **In je nieuwe "Status Engine" API Group:**
   - Klik **"+ Add Function"**
   - **Function Name:** `change_entity_status`
   - **Description:** `Change entity status with validation and audit trail`

2. **Add Input Fields (belangrijkste stap!):**
   Klik **"Add Input"** voor elk van deze velden:

   **Input Field 1:**
   - **Name:** `entity_type`
   - **Type:** `enum`
   - **Required:** `Yes`
   - **Enum Values:** `order,quote,visit,line_item,work_order,invoice,payment,installation`

   **Input Field 2:**
   - **Name:** `entity_id`
   - **Type:** `uuid`
   - **Required:** `Yes`

   **Input Field 3:**
   - **Name:** `to_status`
   - **Type:** `text`
   - **Required:** `Yes`

   **Input Field 4:**
   - **Name:** `transition_reason`
   - **Type:** `text`
   - **Required:** `No`
   - **Default:** `"Status changed via API"`

   **Input Field 5:**
   - **Name:** `business_context`
   - **Type:** `json`
   - **Required:** `No`

   **Input Field 6:**
   - **Name:** `triggered_by_user_id`
   - **Type:** `uuid`
   - **Required:** `No`

3. **Paste Function Code:**
   In het **Function Code** veld, paste deze complete code:

```javascript
// Function: change_entity_status
// Description: Core Status Engine - change entity status with validation
const inputData = {
  entity_type: input.entity_type,
  entity_id: input.entity_id,
  to_status: input.to_status,
  transition_reason: input.transition_reason || "Status changed via API",
  business_context: input.business_context || null,
  triggered_by_user_id: input.triggered_by_user_id || null
}

// 1. Validate entity exists
let entity = null;
const entity_table = inputData.entity_type + 's'; // orders, quotes, etc.

try {
  const entityQuery = `SELECT * FROM ${entity_table} WHERE id = $1`;
  entity = await xano.database.query(entityQuery, [inputData.entity_id]);
  
  if (!entity || entity.length === 0) {
    return {
      success: false,
      error: `Entity not found: ${inputData.entity_type} ${inputData.entity_id}`
    };
  }
} catch (error) {
  return {
    success: false,
    error: `Invalid entity type: ${inputData.entity_type}`
  };
}

// 2. Get current status
let current_status = null;
const current_status_query = `
  SELECT * FROM entity_current_status 
  WHERE entity_type = $1 AND entity_id = $2
`;

const current_status_record = await xano.database.query(current_status_query, [
  inputData.entity_type,
  inputData.entity_id
]);

if (current_status_record.length > 0) {
  current_status = current_status_record[0].current_status;
}

// 3. Create status transition record
const transition_insert = `
  INSERT INTO status_transitions (
    entity_type, entity_id, from_status, to_status, 
    transition_reason, business_context, triggered_by_user_id,
    triggered_by_system, is_milestone, created_at
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  RETURNING id
`;

const transition_result = await xano.database.query(transition_insert, [
  inputData.entity_type,
  inputData.entity_id,
  current_status,
  inputData.to_status,
  inputData.transition_reason,
  inputData.business_context,
  inputData.triggered_by_user_id,
  "api",
  false,
  new Date()
]);

const transition_id = transition_result[0].id;

// 4. Update entity_current_status
if (current_status_record.length > 0) {
  const update_status = `
    UPDATE entity_current_status 
    SET current_status = $1, status_since = $2, last_transition_id = $3
    WHERE entity_type = $4 AND entity_id = $5
  `;
  
  await xano.database.query(update_status, [
    inputData.to_status,
    new Date(),
    transition_id,
    inputData.entity_type,
    inputData.entity_id
  ]);
} else {
  const insert_status = `
    INSERT INTO entity_current_status (
      entity_type, entity_id, current_status, status_since, last_transition_id
    ) VALUES ($1, $2, $3, $4, $5)
  `;
  
  await xano.database.query(insert_status, [
    inputData.entity_type,
    inputData.entity_id,
    inputData.to_status,
    new Date(),
    transition_id
  ]);
}

// 5. Update entity table status field (if exists)
try {
  const status_field = inputData.entity_type === 'order' ? 'order_status' : 
                      inputData.entity_type === 'quote' ? 'quote_status' : 
                      'status';
  
  const update_entity = `UPDATE ${entity_table} SET ${status_field} = $1 WHERE id = $2`;
  await xano.database.query(update_entity, [inputData.to_status, inputData.entity_id]);
} catch (error) {
  // Status field doesn't exist in entity table, continue
}

// 6. Log audit trail
const audit_insert = `
  INSERT INTO audit_logs (
    table_name, record_id, action, changed_by_user_id, changes
  ) VALUES ($1, $2, $3, $4, $5)
`;

await xano.database.query(audit_insert, [
  entity_table,
  inputData.entity_id,
  'STATUS_CHANGE',
  inputData.triggered_by_user_id,
  {
    from_status: current_status,
    to_status: inputData.to_status,
    reason: inputData.transition_reason
  }
]);

return {
  success: true,
  transition_id: transition_id,
  from_status: current_status,
  to_status: inputData.to_status,
  entity_type: inputData.entity_type,
  entity_id: inputData.entity_id,
  timestamp: new Date()
};
```

4. **Klik "Save Function"**

### **STAP 1C: Create API Endpoint (5 minuten)**

1. **In je Status Engine API Group:**
   - Klik **"+ Add API Endpoint"**
   - **Path:** `/status/change`
   - **Method:** `POST`
   - **Function:** Select `change_entity_status`
   - **Authentication:** `Required`
   - Klik **"Save"**

### **STAP 1D: Test de Status Engine (7 minuten)**

1. **Ga naar de Swagger interface:**
   - Klik **"Test API"** in je API Group
   - Zoek je `/status/change` endpoint
   - Klik **"Try it out"**

2. **Test Data (gebruik deze voor test):**
```json
{
  "entity_type": "order",
  "entity_id": "00000000-0000-0000-0000-000000000001",
  "to_status": "approved",
  "transition_reason": "Test status change via API"
}
```

3. **Klik "Execute"**
   - ✅ **Success:** Je krijgt een response met `"success": true`
   - ❌ **Error:** Laat me weten de foutmelding

---

## 📋 **FEEDBACK CHECKPOINT 1**

**Stop hier even! Laat me weten:**
1. ✅ **Status Engine API Group gemaakt?**
2. ✅ **change_entity_status function created?**
3. ✅ **API endpoint working?**
4. ✅ **Test successful?**

**Als alles werkt, gaan we door naar Number Generation API!**
**Als er errors zijn, help ik je die oplossen.**

---

## 📋 **FASE 2: NUMBER GENERATION API (20 minuten) - COMPLIANCE**

*Start deze fase nadat Fase 1 succesvol is*

### **STAP 2A: Create Number Generation API Group (3 minuten)**

1. **Create nieuwe API Group:**
   - **Name:** `Number Generation`
   - **Description:** `Sequential number generation per business entity`

### **STAP 2B: Create generateEntityNumber Function (12 minuten)**

1. **Function Details:**
   - **Name:** `generateEntityNumber`
   - **Description:** `Generate sequential numbers per business entity`

2. **Input Fields:**

   **Input Field 1:**
   - **Name:** `business_entity`
   - **Type:** `enum`
   - **Required:** `Yes`
   - **Enum Values:** `chargecars,laderthuis,meterkastthuis,zaptecshop,ratioshop`

   **Input Field 2:**
   - **Name:** `document_type`
   - **Type:** `enum`
   - **Required:** `Yes`
   - **Enum Values:** `order,quote,invoice,visit,work_order`

   **Input Field 3:**
   - **Name:** `year`
   - **Type:** `int`
   - **Required:** `No`

3. **Function Code:**
```javascript
// Function: generateEntityNumber
// Description: Generate sequential numbers per business entity
const business_entity = input.business_entity;
const document_type = input.document_type;
const year = input.year || new Date().getFullYear();

// 1. Get business entity configuration
const entity_query = `SELECT * FROM business_entities WHERE entity_code = $1`;
const entity_config = await xano.database.query(entity_query, [business_entity]);

if (!entity_config || entity_config.length === 0) {
  return {
    success: false,
    error: `Business entity not found: ${business_entity}`
  };
}

const config = entity_config[0];

// 2. Get or create sequence record (atomic operation)
const sequence_query = `
  SELECT * FROM number_sequences 
  WHERE business_entity_id = $1 AND number_type = $2 AND year = $3
`;

let sequence_record = await xano.database.query(sequence_query, [
  config.id,
  document_type,
  year
]);

let next_sequence;
let sequence_id;

if (sequence_record.length === 0) {
  // Create new sequence starting at 1
  next_sequence = 1;
  const insert_sequence = `
    INSERT INTO number_sequences (
      business_entity_id, number_type, year, current_sequence, 
      max_sequence_reached, last_generated_at
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id
  `;
  
  const new_sequence = await xano.database.query(insert_sequence, [
    config.id,
    document_type,
    year,
    next_sequence,
    next_sequence,
    new Date()
  ]);
  
  sequence_id = new_sequence[0].id;
} else {
  // Increment existing sequence
  const current = sequence_record[0];
  next_sequence = current.current_sequence + 1;
  sequence_id = current.id;
  
  const update_sequence = `
    UPDATE number_sequences 
    SET current_sequence = $1, 
        max_sequence_reached = GREATEST(max_sequence_reached, $1),
        last_generated_at = $2
    WHERE id = $3
  `;
  
  await xano.database.query(update_sequence, [
    next_sequence,
    new Date(),
    sequence_id
  ]);
}

// 3. Format number with prefix
const formatted_number = `${config.number_prefix}-${year}-${String(next_sequence).padStart(config.sequence_length, '0')}`;

// 4. Log generation to audit trail
const audit_insert = `
  INSERT INTO number_generation_audit (
    business_entity_id, number_type, year, sequence_number, 
    formatted_number, generated_at
  ) VALUES ($1, $2, $3, $4, $5, $6)
`;

await xano.database.query(audit_insert, [
  config.id,
  document_type,
  year,
  next_sequence,
  formatted_number,
  new Date()
]);

return {
  success: true,
  formatted_number: formatted_number,
  sequence_number: next_sequence,
  business_entity: business_entity,
  document_type: document_type,
  year: year
};
```

### **STAP 2C: Create API Endpoint (3 minuten)**

1. **API Endpoint:**
   - **Path:** `/numbers/generate/{business_entity}/{document_type}`
   - **Method:** `POST`
   - **Function:** `generateEntityNumber`
   - **Path Parameters:** 
     - `business_entity` → map to input.business_entity
     - `document_type` → map to input.document_type

### **STAP 2D: Test Number Generation (2 minuten)**

**Test Data:**
- **Path:** `/numbers/generate/chargecars/order`
- **Body:** `{}`

**Expected Response:**
```json
{
  "success": true,
  "formatted_number": "CC-2025-00001",
  "sequence_number": 1,
  "business_entity": "chargecars",
  "document_type": "order",
  "year": 2025
}
```

---

## 📋 **FEEDBACK CHECKPOINT 2**

**Stop hier! Status check:**
1. ✅ **Number Generation API working?**
2. ✅ **Generated number format correct? (CC-2025-00001)**
3. ✅ **Ready for Core Business API?**

**Als beide APIs werken, gaan we door naar de Order Creation API!**

---

*Wacht op je feedback voordat we doorgaan naar de volgende fase...* 