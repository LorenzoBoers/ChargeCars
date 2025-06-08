# Suggested Database Additions
**Last Updated**: 2025-12-05
**Status**: Proposal

## Overview
Additional tables to consider for better operational tracking

## Suggested Tables

### technician_activity
Operational activity tracking for field technicians
```sql
CREATE TABLE technician_activity (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP,
    technician_contact_id UUID REFERENCES contact(id),
    activity_type ENUM[
        'shift_start',
        'shift_end',
        'break_start',
        'break_end',
        'travel_start',
        'travel_end',
        'arrived_on_site',
        'work_started',
        'work_paused',
        'work_resumed',
        'work_completed',
        'left_site',
        'vehicle_inspection',
        'fuel_stop',
        'emergency_stop'
    ],
    visit_id UUID REFERENCES visit(id),
    vehicle_id UUID REFERENCES vehicle(id),
    location OBJECT {
        latitude DECIMAL,
        longitude DECIMAL,
        accuracy_meters INT,
        address TEXT
    },
    notes TEXT,
    metadata JSON -- For activity-specific data
);
```

### communication_call_details
Extended phone call tracking (extends communication_messages)
```sql
CREATE TABLE communication_call_details (
    id UUID PRIMARY KEY,
    communication_message_id UUID REFERENCES communication_messages(id),
    call_type ENUM['inbound', 'outbound', 'missed', 'voicemail'],
    duration_seconds INT,
    wait_time_seconds INT,
    recording_url TEXT,
    transcription TEXT,
    sentiment_score DECIMAL,
    call_outcome ENUM[
        'answered',
        'voicemail_left',
        'no_answer',
        'busy',
        'failed',
        'transferred'
    ],
    transferred_to_contact_id UUID REFERENCES contact(id),
    queue_name TEXT,
    ivr_path JSON
);
```

### operational_event
General operational events not tied to specific entities
```sql
CREATE TABLE operational_event (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP,
    event_type TEXT, -- 'phone_ring', 'alarm_triggered', 'system_alert'
    event_category ENUM['communication', 'security', 'operational', 'system'],
    severity ENUM['info', 'warning', 'error', 'critical'],
    source_system TEXT,
    title TEXT,
    description TEXT,
    metadata JSON,
    resolved_at TIMESTAMP,
    resolved_by_contact_id UUID REFERENCES contact(id)
);
```

## Usage Examples

### Tracking a technician's day:
```sql
-- Morning start
INSERT INTO technician_activity (
    technician_contact_id: [tech_id],
    activity_type: 'shift_start',
    location: {latitude: 52.1, longitude: 4.3}
);

-- Starting travel to first job
INSERT INTO technician_activity (
    technician_contact_id: [tech_id],
    activity_type: 'travel_start',
    visit_id: [visit_id],
    vehicle_id: [vehicle_id]
);

-- Arrived on site
INSERT INTO technician_activity (
    technician_contact_id: [tech_id],
    activity_type: 'arrived_on_site',
    visit_id: [visit_id],
    location: {latitude: 52.2, longitude: 4.4}
);
```

### Phone call tracking:
```sql
-- Incoming call
INSERT INTO communication_messages (
    channel_type: 'phone',
    direction: 'inbound',
    thread_id: [customer_thread_id]
);

-- Call details
INSERT INTO communication_call_details (
    communication_message_id: [msg_id],
    call_type: 'inbound',
    duration_seconds: 245,
    call_outcome: 'answered',
    queue_name: 'support'
);
```

## Benefits
1. **Better operational visibility** - Track technician productivity
2. **Communication analytics** - Detailed call metrics
3. **Compliance** - Full activity audit trail
4. **Performance monitoring** - KPIs and SLAs
5. **Safety tracking** - Know technician locations

## Implementation Priority
1. **HIGH**: technician_activity (core for field operations)
2. **MEDIUM**: communication_call_details (enhances existing comms)
3. **LOW**: operational_event (nice to have for monitoring) 