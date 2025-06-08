# Universal Comments API Specification

**Last Updated**: 2025-06-15  
**Status**: Ready for Implementation  
**Tables**: comment (ID: 110), comment_mention (ID: 111), comment_reaction (ID: 112)

## Overview

Universal comments system enabling internal team collaboration on all entity types with support for:
- @mentions with notifications
- Threading/replies
- File attachments 
- Reactions (likes, thumbs up, etc)
- Internal vs customer-facing comments
- Edit history and audit trails

## Database Schema

### comment (ID: 110)
```sql
├── id (uuid, PK)
├── entity_type (enum) - order, quote, visit, work_order, etc.
├── entity_id (uuid) - polymorphic reference
├── parent_comment_id (uuid, FK to comment) - threading
├── author_contact_id (uuid, FK to contact)
├── content (text) - raw comment content
├── content_html (text) - processed HTML with mentions
├── mentions (json) - array of mentioned contact IDs
├── comment_type (enum) - comment, status_note, etc.
├── is_internal (bool) - internal vs customer-facing
├── is_pinned (bool) - pinned to top
├── attachments (attachment list) - file attachments
├── edited_at (timestamp) - edit tracking
├── edited_by_contact_id (uuid) - who edited
├── reaction_summary (json) - reaction counts
├── thread_depth (int) - nesting level
└── display_name (text) - audit trail
```

### comment_mention (ID: 111)
```sql
├── id (uuid, PK)
├── comment_id (uuid, FK to comment)
├── mentioned_contact_id (uuid, FK to contact)
├── mention_context (text) - preview text
├── notification_sent (bool)
├── notification_sent_at (timestamp)
├── notification_read (bool)
├── notification_read_at (timestamp)
└── mention_type (enum) - direct, team, role mention
```

### comment_reaction (ID: 112)
```sql
├── id (uuid, PK)
├── comment_id (uuid, FK to comment)
├── contact_id (uuid, FK to contact)
└── reaction_type (enum) - like, thumbs_up, heart, etc.
```

## API Endpoints

### 1. Create Comment
```
POST /comments
```

**Request Body:**
```json
{
  "entity_type": "order",
  "entity_id": "f75ead6a-1960-4b33-b98c-47c640fda568",
  "content": "Materials arrived! Ready for installation @alex @maria_planning",
  "comment_type": "comment",
  "is_internal": true,
  "parent_comment_id": null,
  "attachments": ["file_uuid_1", "file_uuid_2"]
}
```

**Response:**
```json
{
  "success": true,
  "comment": {
    "id": "comment_uuid",
    "entity_type": "order",
    "entity_id": "f75ead6a-1960-4b33-b98c-47c640fda568",
    "author": {
      "id": "contact_uuid",
      "name": "John Technician",
      "avatar_url": "https://..."
    },
    "content": "Materials arrived! Ready for installation @alex @maria_planning",
    "content_html": "Materials arrived! Ready for installation <mention>@alex</mention> <mention>@maria_planning</mention>",
    "mentions": [
      {
        "contact_id": "alex_uuid",
        "name": "Alex van der Berg",
        "username": "alex"
      }
    ],
    "comment_type": "comment",
    "is_internal": true,
    "is_pinned": false,
    "attachments": [],
    "thread_depth": 0,
    "created_at": "2025-06-15T10:30:00Z",
    "edited_at": null,
    "reactions": {
      "like": 0,
      "thumbs_up": 0
    }
  },
  "mentions_processed": [
    {
      "contact_id": "alex_uuid",
      "notification_sent": true
    }
  ]
}
```

### 2. Get Comments for Entity
```
GET /comments?entity_type={type}&entity_id={id}&include_threads={bool}
```

**Query Parameters:**
- `entity_type` (required): order, quote, visit, etc.
- `entity_id` (required): UUID of entity
- `include_threads` (optional): Include threaded replies (default: true)
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 20)
- `only_internal` (optional): Only internal comments (default: false)

**Response:**
```json
{
  "success": true,
  "comments": [
    {
      "id": "comment_1",
      "author": {
        "id": "contact_uuid",
        "name": "John Technician",
        "avatar_url": "https://..."
      },
      "content": "Site survey completed. Customer wants wallbox on garage wall @maria_planning",
      "content_html": "Site survey completed. Customer wants wallbox on garage wall <mention>@maria_planning</mention>",
      "mentions": [
        {
          "contact_id": "maria_uuid",
          "name": "Maria Planning",
          "username": "maria_planning"
        }
      ],
      "comment_type": "comment",
      "is_internal": true,
      "is_pinned": false,
      "attachments": [
        {
          "id": "attachment_uuid",
          "filename": "site_photo.jpg",
          "url": "https://...",
          "size": 2048576
        }
      ],
      "thread_depth": 0,
      "created_at": "2025-06-15T10:30:00Z",
      "edited_at": null,
      "reactions": {
        "like": 2,
        "thumbs_up": 1
      },
      "replies": [
        {
          "id": "comment_2",
          "parent_comment_id": "comment_1",
          "author": {
            "id": "maria_uuid",
            "name": "Maria Planning"
          },
          "content": "@john_tech Thanks! Scheduled for next Tuesday.",
          "thread_depth": 1,
          "created_at": "2025-06-15T11:00:00Z"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 15,
    "total_pages": 1
  }
}
```

### 3. Reply to Comment
```
POST /comments/{comment_id}/reply
```

**Request Body:**
```json
{
  "content": "@john_tech Thanks for the update! I'll coordinate with the team.",
  "comment_type": "comment",
  "is_internal": true
}
```

**Response:** Same as Create Comment

### 4. Edit Comment
```
PUT /comments/{comment_id}
```

**Request Body:**
```json
{
  "content": "Updated content @new_mention",
  "is_internal": true
}
```

**Response:** Updated comment object

### 5. Delete Comment
```
DELETE /comments/{comment_id}
```

**Response:**
```json
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

### 6. Add Reaction
```
POST /comments/{comment_id}/reactions
```

**Request Body:**
```json
{
  "reaction_type": "thumbs_up"
}
```

**Response:**
```json
{
  "success": true,
  "reaction": {
    "id": "reaction_uuid",
    "comment_id": "comment_uuid",
    "contact_id": "user_uuid",
    "reaction_type": "thumbs_up",
    "created_at": "2025-06-15T10:30:00Z"
  },
  "updated_summary": {
    "like": 2,
    "thumbs_up": 3,
    "heart": 1
  }
}
```

### 7. Get My Mentions
```
GET /mentions/my?unread_only={bool}
```

**Response:**
```json
{
  "success": true,
  "mentions": [
    {
      "id": "mention_uuid",
      "comment": {
        "id": "comment_uuid",
        "content": "Can you review this @username?",
        "author": {
          "name": "John Doe"
        },
        "entity_type": "order",
        "entity_id": "order_uuid",
        "entity_display_name": "Order #CC-2025-00123"
      },
      "mention_context": "Can you review this @username? The customer wants...",
      "notification_sent": true,
      "notification_read": false,
      "created_at": "2025-06-15T10:30:00Z"
    }
  ]
}
```

### 8. Mark Mention as Read
```
PUT /mentions/{mention_id}/read
```

**Response:**
```json
{
  "success": true,
  "message": "Mention marked as read"
}
```

## Implementation Features

### 1. Mention Processing
- Parse @username patterns in content
- Resolve usernames to contact IDs
- Generate HTML with mention links
- Create mention records automatically
- Send notifications to mentioned users

### 2. Threading Support
- Unlimited nesting depth
- Thread collapse/expand
- Reply notifications
- Context preservation

### 3. File Attachments
- Multiple file uploads per comment
- Image preview in comment feed
- File type validation
- Size limits

### 4. Real-time Features
- WebSocket updates for new comments
- Live mention notifications
- Reaction updates
- Typing indicators

### 5. Notification System
- Email notifications for mentions
- In-app notification badges
- Configurable notification preferences
- Batch notification summaries

## Integration Points

### 1. Status Engine Integration
Auto-create comments when status changes:
```json
{
  "entity_type": "order",
  "entity_id": "order_uuid",
  "content": "Status changed: pending → ready_for_installation",
  "comment_type": "status_note",
  "author_contact_id": "system",
  "is_internal": true
}
```

### 2. Communication Messages Bridge
Link important external communications:
```json
{
  "content": "Customer confirmed installation date via email",
  "comment_type": "internal_note",
  "related_communication_id": "email_uuid"
}
```

### 3. Audit Log Integration
Comments generate audit trail entries:
```json
{
  "table_name": "comment",
  "action": "create",
  "business_context": {
    "entity_type": "order",
    "entity_id": "order_uuid",
    "mentions_count": 2
  }
}
```

## Security & Permissions

### 1. Access Control
- Internal comments: Team members only
- Customer comments: Customer + team access
- Entity-based permissions (can view order = can comment)

### 2. Edit Permissions
- Authors can edit own comments (time limit: 15 minutes)
- Managers can edit any comment
- Edit history preserved

### 3. Mention Permissions
- Can only mention contacts with entity access
- Team/role mentions respect group permissions

## Performance Considerations

### 1. Database Optimization
- Index on entity_type + entity_id
- Index on author_contact_id + created_at
- Index on mentioned_contact_id for notification queries

### 2. Caching Strategy
- Cache comment counts per entity
- Cache reaction summaries
- Cache mention notifications

### 3. Pagination
- Cursor-based pagination for performance
- Load older comments on demand
- Limit thread depth in single query

## Testing Scenarios

### 1. Basic Comment CRUD
- Create comment with mentions
- Edit comment content
- Delete comment
- Thread replies

### 2. Mention Functionality
- @username resolution
- Notification generation
- Mention reading/marking
- Invalid username handling

### 3. File Attachments
- Upload files with comments
- Display file previews
- Download attachments
- File size/type validation

### 4. Reactions
- Add/remove reactions
- Multiple reactions per user
- Reaction summary updates

### 5. Performance Testing
- Large comment threads
- Heavy mention usage
- Concurrent comment creation
- Notification delivery

---

*Universal Comments System ready for implementation with full collaboration features* 