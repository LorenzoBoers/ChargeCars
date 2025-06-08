# Comment Mentions System Specification

**Last Updated**: 2025-06-15  
**Status**: Ready for Implementation  
**Dependencies**: comment (ID: 110), comment_mention (ID: 111), contact (ID: 36)

## Overview

Advanced @mention system for comments enabling team collaboration with:
- Real-time @username parsing and resolution
- Flexible mention types (direct, team, role)
- Smart notification delivery
- Mention tracking and read receipts
- Integration with status updates and workflows

## Mention Processing Pipeline

### 1. Content Parsing
```javascript
// Input: "Materials arrived! Ready for installation @alex @maria_planning @team_installers"
// Output: Parsed mentions with metadata

{
  "original_content": "Materials arrived! Ready for installation @alex @maria_planning @team_installers",
  "parsed_mentions": [
    {
      "mention_text": "@alex",
      "start_position": 48,
      "end_position": 53,
      "mention_type": "direct_mention",
      "resolved_contact_id": "alex_uuid",
      "display_name": "Alex van der Berg"
    },
    {
      "mention_text": "@maria_planning", 
      "start_position": 54,
      "end_position": 69,
      "mention_type": "direct_mention",
      "resolved_contact_id": "maria_uuid",
      "display_name": "Maria Planning"
    },
    {
      "mention_text": "@team_installers",
      "start_position": 70,
      "end_position": 86,
      "mention_type": "team_mention",
      "resolved_contacts": ["installer1_uuid", "installer2_uuid", "installer3_uuid"]
    }
  ]
}
```

### 2. HTML Content Generation
```html
<!-- Input -->
"Materials arrived! Ready for installation @alex @maria_planning @team_installers"

<!-- Output -->
Materials arrived! Ready for installation 
<span class="mention" data-contact-id="alex_uuid" data-type="direct">@alex</span> 
<span class="mention" data-contact-id="maria_uuid" data-type="direct">@maria_planning</span>
<span class="mention" data-team="installers" data-type="team">@team_installers</span>
```

## Mention Types & Resolution

### 1. Direct Mentions (@username)
- **Pattern**: `@[a-zA-Z0-9_]+`
- **Resolution**: Query contact table for matching username
- **Target**: Single contact
- **Notification**: Direct notification to mentioned user

### 2. Team Mentions (@team_name)
- **Pattern**: `@team_[a-zA-Z0-9_]+`
- **Resolution**: Query team/role memberships
- **Target**: All team members
- **Notification**: Notification to all team members

### 3. Role Mentions (@role_name)
- **Pattern**: `@role_[a-zA-Z0-9_]+`
- **Resolution**: Query contacts with specific role
- **Target**: All contacts with role
- **Notification**: Role-based notification

### 4. Smart Context Mentions
- **@here**: All users currently online
- **@channel**: All users with access to entity
- **@assignee**: Current assignee of entity
- **@reviewer**: Users with review permissions

## Username Resolution System

### 1. Contact Username Mapping
```sql
-- contact table should include username field
ALTER TABLE contact ADD COLUMN username VARCHAR(50) UNIQUE;
```

### 2. Username Generation Rules
- **Format**: `firstname_lastname` or `firstname_role`
- **Examples**: `alex_berg`, `maria_planning`, `john_tech`
- **Fallback**: If collision, append number: `john_tech2`

### 3. Resolution Algorithm
```
1. Extract @mentions from content using regex
2. For each mention:
   a. Strip @ prefix
   b. Check direct username match in contact table
   c. Check team prefix (team_name) and resolve members
   d. Check role prefix (role_name) and resolve contacts
   e. Check special mentions (@here, @channel, etc.)
3. Validate permissions (can user mention this contact/team?)
4. Generate mention records for valid mentions
```

## Notification System

### 1. Notification Triggers
```json
{
  "trigger_events": [
    "new_mention_created",
    "reply_to_mentioned_comment", 
    "mention_in_status_update",
    "entity_assignment_with_mention"
  ],
  "notification_channels": [
    "in_app_notification",
    "email_notification",
    "push_notification",
    "webhook_notification"
  ]
}
```

### 2. Notification Payload
```json
{
  "notification_id": "notif_uuid",
  "recipient_contact_id": "alex_uuid",
  "notification_type": "comment_mention",
  "title": "You were mentioned in Order #CC-2025-00123",
  "message": "Materials arrived! Ready for installation @alex @maria_planning",
  "context": {
    "entity_type": "order",
    "entity_id": "order_uuid",
    "entity_display_name": "Order #CC-2025-00123",
    "comment_id": "comment_uuid",
    "author": {
      "id": "john_uuid",
      "name": "John Technician",
      "avatar_url": "https://..."
    },
    "mention_context": "...Ready for installation @alex @maria_planning...",
    "deep_link": "/orders/order_uuid/comments#comment_uuid"
  },
  "priority": "normal",
  "delivery_channels": ["in_app", "email"],
  "created_at": "2025-06-15T10:30:00Z",
  "expires_at": "2025-06-22T10:30:00Z"
}
```

### 3. Notification Preferences
```json
{
  "contact_id": "alex_uuid",
  "mention_preferences": {
    "direct_mentions": {
      "in_app": true,
      "email": true,
      "push": true,
      "immediate": true
    },
    "team_mentions": {
      "in_app": true,
      "email": false,
      "push": false,
      "batch_daily": true
    },
    "role_mentions": {
      "in_app": true,
      "email": false,
      "push": false,
      "batch_weekly": true
    }
  },
  "quiet_hours": {
    "enabled": true,
    "start_time": "22:00",
    "end_time": "08:00",
    "timezone": "Europe/Amsterdam"
  }
}
```

## Implementation in Xano NoCode

### 1. Create Comment with Mentions Function
```yaml
Function Name: create_comment_with_mentions
Input Parameters:
  - entity_type (text)
  - entity_id (text) 
  - content (text)
  - comment_type (text)
  - is_internal (boolean)
  - author_contact_id (text)

Processing Steps:
1. Create Comment Record
   - Insert into comment table
   - Set basic fields

2. Parse Mentions (Custom Function)
   - Use regex to find @mentions
   - Loop through matches
   - Resolve usernames to contact IDs

3. Generate HTML Content
   - Replace @mentions with HTML spans
   - Add mention metadata

4. Create Mention Records
   - For each resolved mention
   - Insert into comment_mention table
   - Set notification flags

5. Send Notifications
   - Queue notification jobs
   - Send immediate notifications
   - Update notification status

6. Return Response
   - Comment object with mentions
   - Notification delivery status
```

### 2. Mention Resolution Function
```yaml
Function Name: resolve_mention
Input Parameters:
  - mention_text (text) - e.g., "@alex" or "@team_installers"

Processing Logic:
1. Clean mention text (remove @)
2. Check if team mention (starts with "team_")
   - Query team memberships
   - Return array of contact IDs
3. Check if role mention (starts with "role_")
   - Query contacts with role
   - Return array of contact IDs
4. Check direct username match
   - Query contact table by username
   - Return single contact ID
5. Return null if no match found
```

### 3. Notification Queue Function
```yaml
Function Name: queue_mention_notifications
Input Parameters:
  - mention_records (array)
  - comment_data (object)

Processing Steps:
1. For each mention record:
   a. Check user notification preferences
   b. Determine delivery channels
   c. Create notification payload
   d. Queue for delivery (immediate vs batched)
2. Update mention records with notification status
3. Return delivery summary
```

## Advanced Features

### 1. Smart Mention Suggestions
```json
{
  "mention_suggestions": {
    "context_based": [
      {
        "username": "alex_berg",
        "name": "Alex van der Berg", 
        "role": "Technician",
        "relevance_score": 0.95,
        "reason": "assigned to this order"
      },
      {
        "username": "maria_planning",
        "name": "Maria Planning",
        "role": "Project Coordinator", 
        "relevance_score": 0.80,
        "reason": "manages this customer"
      }
    ],
    "recent_collaborators": [...],
    "team_suggestions": [
      {
        "team_name": "team_installers",
        "member_count": 5,
        "description": "Installation Team"
      }
    ]
  }
}
```

### 2. Mention Analytics
```json
{
  "mention_stats": {
    "period": "last_30_days",
    "total_mentions": 156,
    "mentions_by_type": {
      "direct_mention": 120,
      "team_mention": 25,
      "role_mention": 11
    },
    "top_mentioned_users": [
      {"contact_id": "alex_uuid", "count": 45},
      {"contact_id": "maria_uuid", "count": 32}
    ],
    "response_rates": {
      "average_response_time": "2h 15m",
      "response_rate": "87%"
    }
  }
}
```

### 3. Cross-Platform Mention Sync
```json
{
  "sync_config": {
    "platforms": ["web_app", "mobile_app", "email", "slack"],
    "mention_format": {
      "web_app": "<span class='mention'>@username</span>",
      "mobile_app": "[@username](mention://contact_id)",
      "email": "@username",
      "slack": "<@slack_user_id>"
    }
  }
}
```

## Security & Validation

### 1. Mention Permission Checks
```yaml
Validation Rules:
1. Can only mention contacts with entity access
2. Team mentions require team membership visibility
3. Role mentions require role visibility permissions
4. Rate limiting: max 10 mentions per comment
5. Spam protection: max 50 mentions per user per hour
```

### 2. Privacy Controls
```yaml
Privacy Settings:
1. Allow mentions from: everyone | team_only | managers_only
2. Team mention visibility: public | members_only
3. Role mention access: based on organizational hierarchy
4. Mention history: visible to mentioned users only
```

## Testing Scenarios

### 1. Basic Mention Tests
```yaml
Test Cases:
1. Single direct mention: "@alex"
2. Multiple mentions: "@alex @maria @john"
3. Team mention: "@team_installers" 
4. Role mention: "@role_manager"
5. Mixed mentions: "@alex @team_support"
6. Invalid mentions: "@nonexistent_user"
```

### 2. Notification Tests
```yaml
Test Cases:
1. Immediate notification delivery
2. Batched notification grouping
3. Notification preference respect
4. Quiet hours handling
5. Cross-platform notification sync
6. Notification read receipt tracking
```

### 3. Performance Tests
```yaml
Test Cases:
1. Large comment with many mentions (50+)
2. Team mention with large team (100+ members)
3. Concurrent mention processing
4. Notification queue performance
5. Mention history queries
```

## Integration Points

### 1. Status Engine Integration
```json
{
  "status_change_mentions": {
    "auto_mention_assignee": true,
    "mention_stakeholders": true,
    "template": "Status changed to {new_status} @{assignee} @{stakeholders}"
  }
}
```

### 2. Workflow Integration
```json
{
  "workflow_mentions": {
    "approval_required": "@{approver}",
    "task_assignment": "@{assignee}", 
    "escalation": "@{manager} @team_{department}"
  }
}
```

---

*Complete mention system ready for Xano NoCode implementation with advanced collaboration features* 