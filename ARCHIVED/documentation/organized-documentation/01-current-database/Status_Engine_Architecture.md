# Status Engine Architecture - ChargeCars V2

## Overview

The Status Engine provides universal status tracking across all entity types in the ChargeCars V2 platform. This system enables real-time status monitoring, SLA tracking, business process automation, and comprehensive audit trails.

## Database Tables

### 1. status_transitions (Table ID: 93)
**Purpose**: Universal status tracking for all entity types with complete audit trail

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| created_at | timestamp | Transition timestamp |
| entity_type | enum | Type of entity (order, quote, visit, line_item, work_order, invoice, payment, installation, form_submission, customer_feedback, internal_task) |
| entity_id | int | ID of the specific entity |
| from_status | text | Previous status (null for initial status) |
| to_status | text | New status |
| transition_reason | text | Human-readable reason for change |
| business_context | json | Additional business context data |
| triggered_by_user_id | uuid | User who triggered change (FK to user_accounts) |
| triggered_by_system | text | System component that triggered change |
| sla_deadline | timestamp | SLA deadline for this status |
| is_milestone | boolean | Whether this is a business milestone |
| metadata | json | Additional metadata for the transition |

### 2. status_workflows (Table ID: 94)
**Purpose**: Configurable status workflows with business rules per entity type

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| created_at | timestamp | Creation timestamp |
| entity_type | enum | Entity type this workflow applies to |
| workflow_name | text | Human-readable workflow name |
| is_default | boolean | Whether this is the default workflow |
| business_entity_id | uuid | Business entity this workflow belongs to (FK to business_entities) |
| conditions | json | Conditions for workflow activation |
| is_active | boolean | Whether workflow is currently active |

### 3. status_workflow_steps (Table ID: 95)
**Purpose**: Individual steps within status workflows with SLA monitoring

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| created_at | timestamp | Creation timestamp |
| workflow_id | uuid | Parent workflow (FK to status_workflows) |
| status_name | text | Internal status name |
| status_label | text | User-friendly status label |
| status_color | text | Hex color code for UI display |
| step_order | int | Order within workflow |
| allowed_transitions | json | Array of allowed next statuses |
| sla_hours | decimal | SLA hours for this status |
| requires_approval | boolean | Whether approval is required |
| approval_role | text | Role required for approval |
| auto_transition_conditions | json | Conditions for automatic transitions |
| notification_settings | json | Notification configuration |
| is_final | boolean | Whether this is a final status |

### 4. entity_current_status (Table ID: 96)
**Purpose**: Performance-optimized current status cache with SLA tracking

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| created_at | timestamp | Creation timestamp |
| entity_type | enum | Type of entity |
| entity_id | int | ID of the specific entity |
| current_status | text | Current status name |
| status_since | timestamp | When current status was set |
| sla_deadline | timestamp | SLA deadline for current status |
| is_overdue | boolean | Whether entity is overdue |
| workflow_id | uuid | Active workflow (FK to status_workflows) |
| last_transition_id | uuid | Last transition record (FK to status_transitions) |

## Entity Types Supported

The status engine supports tracking for all major entities:
- **order**: Customer orders and projects
- **quote**: Quotes and offers
- **visit**: Installation and service visits
- **line_item**: Individual order line items
- **work_order**: Work orders and tasks
- **invoice**: Customer invoices
- **payment**: Payment records
- **installation**: Installation activities
- **form_submission**: Customer form submissions
- **customer_feedback**: Customer feedback and surveys
- **internal_task**: Internal tasks and to-dos

## Key Features

### Universal Status Tracking
- Single system for all entity status changes
- Complete audit trail with business context
- Support for both user and system-triggered changes

### SLA Monitoring
- Configurable SLA hours per status
- Automatic overdue detection
- Performance analytics and reporting

### Workflow Management
- Configurable workflows per entity type
- Business entity-specific customization
- Approval requirements and role-based access

### Performance Optimization
- Current status cache for fast queries
- Indexed lookups for real-time performance
- Efficient overdue monitoring

### Integration Ready
- JSON metadata for flexible extension
- API-friendly structure
- Real-time update capabilities

## Relationships

```
status_workflows (1) --> (N) status_workflow_steps
status_workflows (1) --> (N) entity_current_status
status_transitions (1) --> (1) entity_current_status.last_transition_id
business_entities (1) --> (N) status_workflows
user_accounts (1) --> (N) status_transitions.triggered_by_user_id
```

## Integration with Existing Tables

The status engine integrates with existing infrastructure:
- **audit_logs**: Cross-referenced for comprehensive change tracking
- **order_status_history**: Enhanced with universal status engine capabilities
- **user_accounts**: User tracking for status changes
- **business_entities**: Multi-entity workflow configuration

## Next Steps

1. **API Development**: Create REST endpoints for status management
2. **Frontend Components**: Build status tracking UI components
3. **Business Logic**: Implement workflow automation rules
4. **Data Migration**: Migrate existing status data to new engine
5. **Performance Monitoring**: Set up SLA tracking and alerts

---
*Status Engine implemented: June 1, 2025*
*Current database: 50 tables (46 existing + 4 status engine)* 