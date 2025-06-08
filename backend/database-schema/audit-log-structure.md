# Audit Log Structure - ChargeCars V2

**Last Updated**: 2025-06-15  
**Status**: Implemented  
**Table**: audit_logs (ID: 75)

## Overview

The audit_logs table uses a consolidated JSON-based structure for clean, organized, and flexible audit tracking. This approach reduces complexity from 21 individual fields to 9 logically grouped fields.

## Schema Structure

### Core Audit Fields (6 fields)
- `id` (uuid) - Primary key
- `created_at` (timestamp) - When audit event occurred
- `table_name` (text) - Table that was modified
- `record_id` (text) - UUID of modified record
- `action` (enum) - Action type (create, update, delete, status_change, etc.)
- `old_values` (json) - Values before change
- `new_values` (json) - Values after change  
- `changed_by_contact_id` (uuid) - Who made the change

### Context Fields (3 JSON fields)
- `web_context` (json) - Web/API request context
- `business_context` (json) - Business logic context
- `hierarchical_context` (json) - Entity relationship context

## JSON Field Structures

### 1. web_context
```json
{
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "session_id": "sess_abc123def456",
  "request_method": "POST", 
  "endpoint": "/api/status/change"
}
```

### 2. business_context
```json
{
  "reason": "All materials received and verified",
  "severity": "normal",
  "entity_display_name": "Order #CC-2025-00123",
  "change_summary": "Status changed: pending → ready_for_installation",
  "metadata": {
    "previous_status_duration_hours": 48,
    "sla_deadline": "2025-06-20T14:30:00Z",
    "workflow_step": "materials_verification",
    "automated": false
  }
}
```

### 3. hierarchical_context  
```json
{
  "parent_table_name": "order",
  "parent_record_id": "f75ead6a-1960-4b33-b98c-47c640fda568", 
  "root_table_name": "order",
  "root_record_id": "f75ead6a-1960-4b33-b98c-47c640fda568"
}
```

## Complete Audit Log Example

```json
{
  "id": "log_uuid_123",
  "created_at": "2025-06-15T14:30:00Z",
  "table_name": "order",
  "record_id": "f75ead6a-1960-4b33-b98c-47c640fda568",
  "action": "status_change",
  "old_values": {
    "status": "pending"
  },
  "new_values": {
    "status": "ready_for_installation"
  },
  "changed_by_contact_id": "d9d12e32-d5d5-4e6c-acbc-e28dcb7bfb03",
  "web_context": {
    "ip_address": "192.168.1.100",
    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "session_id": "sess_abc123def456",
    "request_method": "POST",
    "endpoint": "/api/status/change"
  },
  "business_context": {
    "reason": "All materials received and verified",
    "severity": "normal", 
    "entity_display_name": "Order #CC-2025-00123",
    "change_summary": "Status changed: pending → ready_for_installation",
    "metadata": {
      "previous_status_duration_hours": 48,
      "sla_deadline": "2025-06-20T14:30:00Z",
      "workflow_step": "materials_verification",
      "automated": false
    }
  },
  "hierarchical_context": {
    "parent_table_name": "order",
    "parent_record_id": "f75ead6a-1960-4b33-b98c-47c640fda568",
    "root_table_name": "order", 
    "root_record_id": "f75ead6a-1960-4b33-b98c-47c640fda568"
  }
}
```

## Context Usage Guidelines

### web_context
- **Always include** for web/API requests
- **Optional** for system/background processes
- **Use cases**: Security tracking, debugging, user behavior analysis

### business_context  
- **Always include** for business-critical actions
- **Severity levels**: low, normal, high, critical
- **Use cases**: Activity feeds, business reporting, compliance

### hierarchical_context
- **Include when applicable** for nested entities  
- **Use cases**: Activity feeds, relationship tracking, impact analysis
- **Examples**: line_item → order, work_order → visit → order

## API Integration

### Status Change Function Input
```json
{
  "entity_type": "order",
  "entity_id": "f75ead6a-1960-4b33-b98c-47c640fda568",
  "to_status": "ready_for_installation",
  "transition_reason": "All materials received",
  "changed_by_contact_id": "d9d12e32-d5d5-4e6c-acbc-e28dcb7bfb03",
  "web_context": {
    "ip_address": "192.168.1.100",
    "user_agent": "Mozilla/5.0...",
    "session_id": "sess_abc123",
    "request_method": "POST", 
    "endpoint": "/api/status/change"
  },
  "business_context": {
    "severity": "normal",
    "metadata": {
      "automated": false,
      "workflow_step": "materials_verification"
    }
  }
}
```

## Benefits

### 1. **Cleaner Schema**
- 21 fields → 9 fields  
- Logical grouping of related data
- Easier to understand and maintain

### 2. **Flexible Structure**
- JSON allows optional fields
- Easy to extend without schema changes
- Context can be null when not applicable

### 3. **Better API Experience**
- Structured input/output
- Type-safe JSON objects
- Clear separation of concerns

### 4. **Performance**
- Fewer database columns
- JSON indexing available
- Efficient storage

### 5. **Future-Proof**
- Easy to add new context types
- Backward compatible
- Extensible metadata

## Related Documentation

- [Status Engine Architecture](./Status_Engine_Architecture.md)
- [API Endpoints Catalog](../api-specifications/endpoints-catalog.md)
- [Business Workflows](../../02-documentation/business-workflows/)

---
*Audit Log Consolidation completed: June 15, 2025* 