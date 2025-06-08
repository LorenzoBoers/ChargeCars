# Status Engine API Specification - ChargeCars V2

## Overview

This document defines the API endpoints for the Status Engine system, providing universal status tracking, workflow management, and SLA monitoring across all entity types.

## Base Configuration

**Base URL**: `/api/v1/status`
**Authentication**: Required (JWT Bearer Token)
**Content-Type**: `application/json`

## Core Endpoints

### 1. Status Change

**POST** `/api/v1/status/change`

Changes the status of any entity type with full audit trail.

#### Request Body
```json
{
  "entity_type": "order",
  "entity_id": 12345,
  "to_status": "in_production",
  "transition_reason": "All materials received and production started",
  "business_context": {
    "production_line": "A1",
    "estimated_completion": "2025-06-15T14:00:00Z",
    "assigned_team": "Team Alpha"
  },
  "metadata": {
    "automatic_notification": true,
    "customer_visible": true
  }
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "transition_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "entity_type": "order",
    "entity_id": 12345,
    "from_status": "pending_materials",
    "to_status": "in_production",
    "transition_timestamp": "2025-06-01T10:30:00Z",
    "sla_deadline": "2025-06-15T14:00:00Z",
    "is_overdue": false,
    "workflow_step": {
      "step_order": 3,
      "status_label": "In Production",
      "status_color": "#FFA500",
      "allowed_next_transitions": ["quality_check", "on_hold", "cancelled"]
    }
  }
}
```

### 2. Status History

**GET** `/api/v1/status/history/{entity_type}/{entity_id}`

Retrieves complete status history for an entity.

#### Parameters
- `entity_type` (path): Entity type
- `entity_id` (path): Entity ID
- `include_metadata` (query): Include full metadata (default: false)
- `limit` (query): Number of records (default: 50)
- `offset` (query): Pagination offset (default: 0)

#### Response
```json
{
  "success": true,
  "data": {
    "entity_type": "order",
    "entity_id": 12345,
    "current_status": "in_production",
    "status_since": "2025-06-01T10:30:00Z",
    "sla_deadline": "2025-06-15T14:00:00Z",
    "is_overdue": false,
    "workflow": {
      "id": "workflow-123",
      "name": "Standard Order Workflow",
      "business_entity": "ChargeCars BV"
    },
    "history": [
      {
        "transition_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "from_status": "pending_materials",
        "to_status": "in_production",
        "transition_timestamp": "2025-06-01T10:30:00Z",
        "transition_reason": "All materials received and production started",
        "triggered_by": {
          "user_id": "user-456",
          "user_name": "John Doe",
          "system_component": null
        },
        "duration_in_previous_status_hours": 48.5,
        "is_milestone": true
      }
    ],
    "pagination": {
      "total_count": 5,
      "limit": 50,
      "offset": 0,
      "has_more": false
    }
  }
}
```

### 3. Current Status Bulk Query

**POST** `/api/v1/status/current/bulk`

Get current status for multiple entities in a single request.

#### Request Body
```json
{
  "entities": [
    {"entity_type": "order", "entity_id": 12345},
    {"entity_type": "order", "entity_id": 12346},
    {"entity_type": "quote", "entity_id": 789}
  ],
  "include_sla_info": true
}
```

#### Response
```json
{
  "success": true,
  "data": [
    {
      "entity_type": "order",
      "entity_id": 12345,
      "current_status": "in_production",
      "status_label": "In Production",
      "status_color": "#FFA500",
      "status_since": "2025-06-01T10:30:00Z",
      "sla_deadline": "2025-06-15T14:00:00Z",
      "is_overdue": false,
      "hours_until_overdue": 336.5
    }
  ]
}
```

### 4. Overdue Items Dashboard

**GET** `/api/v1/status/overdue`

Get all overdue items across entity types for dashboard display.

#### Parameters
- `entity_types` (query): Comma-separated entity types to filter
- `business_entity_id` (query): Filter by business entity
- `severity` (query): Overdue severity (critical, warning, info)
- `limit` (query): Number of records (default: 100)

#### Response
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_overdue": 23,
      "critical_overdue": 5,
      "by_entity_type": {
        "order": 12,
        "quote": 8,
        "installation": 3
      }
    },
    "overdue_items": [
      {
        "entity_type": "order",
        "entity_id": 12340,
        "current_status": "pending_approval",
        "status_since": "2025-05-20T09:00:00Z",
        "sla_deadline": "2025-05-25T17:00:00Z",
        "hours_overdue": 168.5,
        "severity": "critical",
        "entity_details": {
          "order_number": "ORD-2025-1234",
          "customer_name": "ABC Company",
          "priority": "high"
        }
      }
    ]
  }
}
```

### 5. Workflow Management

**GET** `/api/v1/status/workflows/{entity_type}`

Get available workflows for an entity type.

#### Response
```json
{
  "success": true,
  "data": [
    {
      "workflow_id": "workflow-123",
      "workflow_name": "Standard Order Workflow",
      "entity_type": "order",
      "is_default": true,
      "business_entity": "ChargeCars BV",
      "is_active": true,
      "steps": [
        {
          "step_id": "step-1",
          "status_name": "new",
          "status_label": "New Order",
          "status_color": "#E3F2FD",
          "step_order": 1,
          "sla_hours": 24,
          "requires_approval": false,
          "is_final": false,
          "allowed_transitions": ["pending_approval", "cancelled"]
        }
      ]
    }
  ]
}
```

### 6. Status Analytics

**GET** `/api/v1/status/analytics`

Get status transition analytics and performance metrics.

#### Parameters
- `entity_type` (query): Filter by entity type
- `date_from` (query): Start date (ISO 8601)
- `date_to` (query): End date (ISO 8601)
- `business_entity_id` (query): Filter by business entity
- `group_by` (query): Group by (status, entity_type, user, day, week, month)

#### Response
```json
{
  "success": true,
  "data": {
    "period": {
      "from": "2025-05-01T00:00:00Z",
      "to": "2025-06-01T00:00:00Z"
    },
    "metrics": {
      "total_transitions": 1247,
      "unique_entities_affected": 423,
      "average_status_duration_hours": 26.4,
      "sla_compliance_rate": 94.2,
      "overdue_incidents": 24
    },
    "status_performance": [
      {
        "status_name": "pending_approval",
        "total_entries": 156,
        "average_duration_hours": 18.2,
        "sla_compliance_rate": 89.1,
        "bottleneck_score": 7.3
      }
    ],
    "trend_data": [
      {
        "date": "2025-05-01",
        "transitions": 42,
        "overdue_count": 3,
        "sla_compliance_rate": 92.8
      }
    ]
  }
}
```

## Workflow Configuration Endpoints

### 7. Create/Update Workflow

**POST** `/api/v1/status/workflows`

Create a new workflow or update existing one.

#### Request Body
```json
{
  "entity_type": "order",
  "workflow_name": "Express Order Workflow",
  "business_entity_id": "entity-123",
  "is_default": false,
  "conditions": {
    "priority": "high",
    "order_value_min": 10000
  },
  "steps": [
    {
      "status_name": "express_new",
      "status_label": "Express New",
      "status_color": "#FF5722",
      "step_order": 1,
      "sla_hours": 4,
      "requires_approval": false,
      "allowed_transitions": ["express_processing", "cancelled"],
      "notification_settings": {
        "send_email": true,
        "send_sms": true,
        "email_template": "express_order_created"
      }
    }
  ]
}
```

### 8. Status Transition Webhooks

**POST** `/api/v1/status/webhooks`

Register webhook endpoints for status change notifications.

#### Request Body
```json
{
  "webhook_url": "https://external-system.com/webhooks/status",
  "entity_types": ["order", "quote"],
  "status_filters": ["completed", "cancelled"],
  "secret_key": "webhook-secret-123",
  "is_active": true
}
```

## Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_STATUS_TRANSITION",
    "message": "Cannot transition from 'completed' to 'in_progress'",
    "details": {
      "current_status": "completed",
      "requested_status": "in_progress",
      "allowed_transitions": ["archived", "refunded"]
    }
  }
}
```

## Common Error Codes

- `ENTITY_NOT_FOUND`: Entity does not exist
- `INVALID_STATUS_TRANSITION`: Requested status transition not allowed
- `WORKFLOW_NOT_FOUND`: Specified workflow does not exist
- `APPROVAL_REQUIRED`: Status change requires approval
- `SLA_VALIDATION_ERROR`: SLA configuration invalid
- `PERMISSION_DENIED`: User lacks permission for operation
- `RATE_LIMIT_EXCEEDED`: Too many requests

## Rate Limiting

- Standard endpoints: 1000 requests/hour per user
- Bulk operations: 100 requests/hour per user
- Analytics endpoints: 50 requests/hour per user
- Webhook registration: 10 requests/hour per user

## Webhook Payload

Status change webhooks send this payload:

```json
{
  "event": "status_changed",
  "timestamp": "2025-06-01T10:30:00Z",
  "data": {
    "transition_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "entity_type": "order",
    "entity_id": 12345,
    "from_status": "pending_materials",
    "to_status": "in_production",
    "triggered_by_user": "user-456",
    "sla_deadline": "2025-06-15T14:00:00Z",
    "is_milestone": true,
    "business_context": {...}
  }
}
```

---
*API Specification Version: 1.0*
*Last Updated: June 1, 2025*
*Status Engine Tables: 93-96* 