# Status Change API Test Examples

**Last Updated**: 2025-06-15  
**API Endpoint**: POST /status/change  

## Correct Test Input Structure

### Basic Status Change
```json
{
  "entity_type": "order",
  "entity_id": "f75ead6a-1960-4b33-b98c-47c640fda568",
  "to_status": "intake_completed",
  "transition_reason": "Customer intake form completed successfully",
  "changed_by_contact_id": "731e1609-e67f-40c5-8972-7a72a1ec7c58",
  "web_context": {
    "ip_address": "192.168.1.100",
    "request_method": "POST",
    "endpoint": "/api/status/change"
  },
  "business_context": {
    "severity": "normal",
    "metadata": {
      "completion_percentage": 100,
      "automated": false
    }
  }
}
```

### Expected Response Structure
```json
{
  "success": true,
  "transition_id": "28b7a569-4262-4459-9c3e-f47f8bf46464",
  "from_status": {
    "current_status": "ready_for_installation",
    "status_since": 1748904575451,
    "sla_deadline": 1749163775445,
    "is_overdue": false,
    "workflow_id": "c1c59cda-43d9-4755-973a-a82bd01cab1c"
  },
  "to_status": "intake_completed",
  "entity_type": "order",
  "entity_id": "f75ead6a-1960-4b33-b98c-47c640fda568",
  "timestamp": 1748904790641,
  "audit_log": {
    "id": "e142a228-407f-4790-8f0d-b485fd16602c",
    "created_at": 1748904790670,
    "table_name": "order",
    "record_id": "f75ead6a-1960-4b33-b98c-47c640fda568",
    "action": "update",
    "old_values": {"status": "ready_for_installation"},
    "new_values": {"status": "intake_completed"},
    "changed_by_contact_id": "731e1609-e67f-40c5-8972-7a72a1ec7c58",
    "web_context": {
      "ip_address": "192.168.1.100",
      "request_method": "POST",
      "endpoint": "/api/status/change"
    },
    "business_context": {
      "severity": "normal",
      "metadata": {
        "completion_percentage": 100,
        "automated": false
      }
    },
    "hierarchical_context": {}
  }
}
```

## Field Naming Conventions

### Universal Status Field
Always use `"status"` in old_values/new_values for consistency across all entity types:

```json
// ✅ CORRECT - Universal naming
"old_values": {"status": "pending"}
"new_values": {"status": "ready_for_installation"}

// ❌ WRONG - Entity-specific naming  
"old_values": {"order_status": "pending"}
"old_values": {"quote_status": "draft"}
"old_values": {"visit_status": "scheduled"}
```

### Contact ID Field Names
- **API Input**: `changed_by_contact_id` (matches audit_logs table)
- **Status Transitions**: `triggered_by_contact_id` (internal status engine field)

```json
// ✅ CORRECT API Input
{
  "changed_by_contact_id": "731e1609-e67f-40c5-8972-7a72a1ec7c58"
}

// ❌ WRONG 
{
  "triggered_by_contact_id": "731e1609-e67f-40c5-8972-7a72a1ec7c58"
}
```

## Test Scenarios

### 1. Order Status Change
```json
{
  "entity_type": "order",
  "entity_id": "f75ead6a-1960-4b33-b98c-47c640fda568",
  "to_status": "materials_checking",
  "transition_reason": "Starting materials verification",
  "changed_by_contact_id": "731e1609-e67f-40c5-8972-7a72a1ec7c58"
}
```

### 2. Quote Status Change  
```json
{
  "entity_type": "quote",
  "entity_id": "quote_uuid_here",
  "to_status": "sent",
  "transition_reason": "Quote sent to customer",
  "changed_by_contact_id": "731e1609-e67f-40c5-8972-7a72a1ec7c58"
}
```

### 3. Work Order Status Change
```json
{
  "entity_type": "work_order", 
  "entity_id": "work_order_uuid_here",
  "to_status": "lmra_in_progress",
  "transition_reason": "Safety assessment started",
  "changed_by_contact_id": "731e1609-e67f-40c5-8972-7a72a1ec7c58"
}
```

### 4. Form Submission Status Change
```json
{
  "entity_type": "form_submission",
  "entity_id": "form_uuid_here", 
  "to_status": "sent_to_customer",
  "transition_reason": "Intake form sent via email",
  "changed_by_contact_id": "731e1609-e67f-40c5-8972-7a72a1ec7c58"
}
```

## Context Guidelines

### web_context - Always include for API calls
```json
"web_context": {
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "session_id": "sess_abc123", 
  "request_method": "POST",
  "endpoint": "/api/status/change"
}
```

### business_context - Include for business relevance  
```json
"business_context": {
  "severity": "normal",
  "metadata": {
    "automated": false,
    "workflow_step": "materials_verification",
    "completion_percentage": 100
  }
}
```

### hierarchical_context - For nested entities
```json
"hierarchical_context": {
  "parent_table_name": "order",
  "parent_record_id": "f75ead6a-1960-4b33-b98c-47c640fda568",
  "root_table_name": "order", 
  "root_record_id": "f75ead6a-1960-4b33-b98c-47c640fda568"
}
```

---
*Test examples updated for consolidated audit log structure* 