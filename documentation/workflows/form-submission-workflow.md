# Form Submission Workflow

**Last Updated**: 2025-06-15
**Status**: Implemented
**Owner**: Backend Team

## Overview
Unified workflow covering complete form lifecycle from outbound sending to inbound completion, combining intake request functionality with form submission tracking.

## Process Steps

### 1. Form Creation & Sending (Outbound)
**Trigger**: Customer needs to fill out a form
**Status**: `draft` → `sent_to_customer`

**Actions**:
1. Create form_submission record with status 'draft'
2. Generate secure `submission_uuid` for anonymous access
3. Set SLA deadline (default: 7 days)
4. Send form via selected channel (email/SMS/WhatsApp)
5. Update status to 'sent_to_customer'
6. Set `sent_at` timestamp
7. Schedule automatic reminders

**API Call**: `POST /forms/send`
**Input**:
- intake_form_id (required)
- customer_contact_id (optional)
- customer_email (fallback)
- send_via (email/sms/whatsapp)
- sla_days (default: 7)
- request_reason
- custom_message

### 2. Customer Opens Form
**Trigger**: Customer clicks form link
**Status**: `sent_to_customer` → `first_opened`

**Actions**:
1. Set `first_opened_at` timestamp
2. Update status to 'first_opened'
3. Capture device_info and UTM parameters
4. Start activity tracking

### 3. Form Completion Process (Inbound)
**Status Flow**: `first_opened` → `in_progress` → `partially_completed` → `completed`

**Actions per step**:
- Update `current_step`, `progress_percentage`
- Set `last_activity_at` timestamp
- Save `submission_data` (partial or complete)
- Calculate estimated amounts if applicable

**Abandonment Detection**:
- No activity for 30 minutes → potential abandonment
- No activity for 24 hours → status becomes 'abandoned'

### 4. SLA & Reminder Management
**Background Process**: Runs every hour

**Reminder Logic**:
- Send reminder at 50% of SLA time (e.g., day 3 for 7-day SLA)
- Send second reminder at 80% of SLA time (e.g., day 5)
- Send final reminder at 95% of SLA time (e.g., day 6)
- Max 3 reminders per form

**Escalation**:
- After SLA expires → status becomes 'expired'
- Escalate to `escalated_to_contact_id` for manual follow-up

### 5. Form Completion
**Trigger**: Customer submits complete form
**Status**: `in_progress` → `completed`

**Actions**:
1. Set `completed_at` timestamp
2. Validate all required fields
3. Calculate final `total_estimated_amount`
4. Generate `calculated_line_items` if pricing form
5. Create `created_order_id` if conversion form
6. Update status to 'completed'
7. Trigger post-completion workflows

### 6. Post-Completion Processing
**Trigger**: Form status becomes 'completed'

**Actions**:
- If order form → create order record
- If quote form → generate quote
- If service form → create service request
- Send confirmation email to customer
- Notify internal team
- Update CRM/partner systems

## Business Rules

### Status Transitions
```
draft → sent_to_customer → first_opened → in_progress → completed
                                      → partially_completed → completed
                                      → abandoned
                      → reminder_sent (parallel status flag)
                      → expired (after SLA)
                      → cancelled (manual cancellation)
```

### SLA Rules
- **Default SLA**: 7 days from `sent_at`
- **High Priority**: 3 days SLA
- **Service Forms**: 5 days SLA
- **Partner Forms**: 2 days SLA

### Reminder Rules
- **Timing**: 50%, 80%, 95% of SLA period
- **Channels**: Same channel as original send + email fallback
- **Max Count**: 3 reminders
- **Content**: Progressively more urgent

### Conversion Rules
- **Quote Forms**: Auto-generate quote on completion
- **Order Forms**: Auto-create order with pending status
- **Service Forms**: Create internal_task for follow-up
- **Partner Forms**: Sync to partner systems via API

## Automation & Integration

### Make.com Scenarios
1. **Form Reminder Scheduler**
   - Trigger: Hourly check of overdue forms
   - Action: Send reminders via email/SMS/WhatsApp
   
2. **Form Completion Processor**
   - Trigger: form_submission status → completed
   - Action: Generate orders/quotes/tasks

3. **SLA Escalation Handler**
   - Trigger: Forms past SLA deadline
   - Action: Escalate to team, create internal_task

### API Integrations
- **Email Service**: Send forms and reminders
- **SMS Service**: Text reminders for mobile contacts
- **WhatsApp**: Business API for form notifications
- **CRM Sync**: Update contact records with completion status
- **Partner APIs**: Sync form data for partner leads

## KPIs & Metrics

### Response Metrics
- **Open Rate**: first_opened / sent_to_customer
- **Completion Rate**: completed / sent_to_customer
- **Time to Complete**: Average time from sent to completed
- **Abandonment Rate**: abandoned / first_opened

### SLA Metrics
- **On-Time Completion**: completed within SLA / total sent
- **Reminder Effectiveness**: completed after reminder / reminders sent
- **Escalation Rate**: expired / total sent

### Business Metrics
- **Conversion Rate**: created_order_id / completed forms
- **Average Order Value**: Average of total_estimated_amount
- **Channel Effectiveness**: Completion rates by send_via channel

## Related Documents
- [Database Schema - Form Submission](../../01-backend/database-schema/form-submission-table.md)
- [API Specification - Form Management](../../01-backend/api-specifications/form-endpoints.md)
- [Communication Workflow](./communication-workflow.md)
- [Order Lifecycle Workflow](./order-lifecycle-workflow.md)

## Technical Implementation

### Database Fields Used
```sql
-- Outbound Tracking
sent_at, sent_via_channel, reminder_count, last_reminder_sent_at
sla_deadline, priority, request_reason, customer_instructions

-- Inbound Tracking  
first_opened_at, current_step, progress_percentage, time_spent_seconds
submission_data, calculated_line_items, device_info, utm_source

-- Status Management
submission_status, last_activity_at, completed_at
escalated_to_contact_id, followup_required, internal_notes

-- Conversion Tracking
created_order_id, total_estimated_amount, conversion_data
```

### Background Jobs
1. **form_submission_monitor** (hourly)
2. **form_abandonment_detector** (every 30 minutes)  
3. **form_sla_enforcer** (daily at 9 AM)
4. **form_analytics_updater** (daily at midnight) 