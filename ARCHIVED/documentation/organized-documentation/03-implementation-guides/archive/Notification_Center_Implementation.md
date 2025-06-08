# Notification Center Implementation Guide

## Overview
ChargeCars V2 notification center provides real-time in-app notifications with external delivery via email, Teams, and WhatsApp. The system includes user preferences, read/unread tracking, and priority-based filtering.

## Database Architecture

### New Tables Implemented

#### 1. user_notifications (ID: 81)
**Central notification storage with delivery tracking**

```sql
CREATE TABLE user_notifications (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    contact_id             UUID NOT NULL REFERENCES contacts(id),
    
    -- Notification Content
    notification_type      notification_type_enum NOT NULL,
    title                  TEXT NOT NULL,
    message                TEXT NOT NULL,
    action_url             TEXT,
    
    -- Status & Priority
    priority               priority_enum NOT NULL,
    is_read                BOOLEAN DEFAULT false,
    read_at                TIMESTAMP,
    expires_at             TIMESTAMP,
    
    -- Source Tracking
    source_table           TEXT,
    source_record_id       TEXT,
    related_order_id       UUID REFERENCES orders(id),
    related_contact_id     UUID REFERENCES contacts(id),
    
    -- External Delivery Tracking
    delivery_channels      OBJECT {
        email: {
            should_send: BOOLEAN,
            sent_at: TIMESTAMP,
            delivery_status: ENUM ['pending', 'sent', 'delivered', 'failed']
        },
        teams: {
            should_send: BOOLEAN,
            sent_at: TIMESTAMP,
            delivery_status: ENUM ['pending', 'sent', 'delivered', 'failed']
        },
        whatsapp: {
            should_send: BOOLEAN,
            sent_at: TIMESTAMP,
            delivery_status: ENUM ['pending', 'sent', 'delivered', 'failed']
        }
    },
    
    metadata               JSON
);
```

#### 2. notification_preferences (ID: 82)
**User preferences for notification delivery**

```sql
CREATE TABLE notification_preference (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    contact_id             UUID NOT NULL REFERENCES contacts(id),
    notification_type      notification_type_enum NOT NULL,
    
    -- Channel Preferences
    in_app_enabled         BOOLEAN DEFAULT true,
    email_enabled          BOOLEAN DEFAULT false,
    teams_enabled          BOOLEAN DEFAULT false,
    whatsapp_enabled       BOOLEAN DEFAULT false,
    
    -- Filtering & Timing
    priority_threshold     priority_enum DEFAULT 'normal',
    quiet_hours_start      TEXT, -- HH:MM format
    quiet_hours_end        TEXT, -- HH:MM format
    weekend_enabled        BOOLEAN DEFAULT false,
    
    UNIQUE(contact_id, notification_type)
);
```

### Notification Types
```sql
CREATE TYPE notification_type_enum AS ENUM (
    'task_assigned',        -- User assigned a task
    'order_status_change',  -- Order status updated
    'visit_scheduled',      -- Visit scheduled/rescheduled
    'message_received',     -- New message in communication thread
    'approval_required',    -- Digital signature required
    'payment_received',     -- Payment processed
    'system_alert',         -- System-wide alerts
    'reminder',             -- Due date reminders
    'mention',              -- User mentioned in message/note
    'emergency'             -- Emergency/urgent notifications
);
```

## Integration with Existing Systems

### 1. Communication System Integration
**Notifications automatically created from existing tables:**

```javascript
// When new message arrives (communication_message)
if (message.message_type === 'incoming') {
    createNotification({
        contact_id: message.recipient_contact_id,
        notification_type: 'message_received',
        title: `Nieuw bericht van ${sender_name}`,
        message: message.subject || message.message_content.substring(0, 100),
        action_url: `/communication/threads/${message.thread_id}`,
        related_contact_id: message.sender_contact_id
    });
}
```

### 2. Task Assignment Integration
**Notifications from internal_tasks:**

```javascript
// When task is assigned (internal_task)
createNotification({
    contact_id: task.assigned_to_contact_id,
    notification_type: 'task_assigned',
    title: `Nieuwe taak toegewezen`,
    message: task.task_title,
    action_url: `/tasks/${task.id}`,
    priority: task.priority,
    related_contact_id: task.created_by_contact_id
});
```

### 3. Order Status Integration
**Notifications from order_status_history:**

```javascript
// When order status changes
createNotification({
    contact_id: order.primary_contact_id,
    notification_type: 'order_status_change',
    title: `Order ${order.order_number} status gewijzigd`,
    message: `Status gewijzigd naar: ${new_status}`,
    action_url: `/order/${order.id}`,
    related_order_id: order.id
});
```

### 4. Approval Required Integration
**Notifications from sign_offs:**

```javascript
// When signature required
createNotification({
    contact_id: signoff.required_contact_id,
    notification_type: 'approval_required',
    title: `Goedkeuring vereist`,
    message: `Order ${order.order_number} wacht op uw goedkeuring`,
    action_url: `/approvals/${signoff.id}`,
    priority: 'high',
    related_order_id: signoff.order_id
});
```

## Frontend Implementation

### 1. Notification Bell Component
```typescript
interface NotificationBellProps {
    contactId: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ contactId }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    
    // Real-time updates via WebSocket
    useEffect(() => {
        const ws = new WebSocket(`/api/notifications/stream/${contactId}`);
        ws.onmessage = (event) => {
            const notification = JSON.parse(event.data);
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);
        };
        return () => ws.close();
    }, [contactId]);
    
    return (
        <div className="notification-bell">
            <BellIcon />
            {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
            )}
        </div>
    );
};
```

### 2. Notification Center Panel
```typescript
const NotificationCenter: React.FC = () => {
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState<'all' | 'unread'>('unread');
    
    const markAsRead = async (notificationId: string) => {
        await api.patch(`/notifications/${notificationId}`, { is_read: true });
        setNotifications(prev => 
            prev.map(n => n.id === notificationId ? {...n, is_read: true} : n)
        );
    };
    
    return (
        <div className="notification-center">
            <div className="notification-header">
                <h3>Notificaties</h3>
                <div className="notification-filters">
                    <button 
                        className={filter === 'all' ? 'active' : ''}
                        onClick={() => setFilter('all')}
                    >
                        Alle
                    </button>
                    <button 
                        className={filter === 'unread' ? 'active' : ''}
                        onClick={() => setFilter('unread')}
                    >
                        Ongelezen
                    </button>
                </div>
            </div>
            
            <div className="notification-list">
                {notifications
                    .filter(n => filter === 'all' || !n.is_read)
                    .map(notification => (
                        <NotificationItem 
                            key={notification.id}
                            notification={notification}
                            onRead={markAsRead}
                        />
                    ))
                }
            </div>
        </div>
    );
};
```

### 3. Notification Item Component
```typescript
interface NotificationItemProps {
    notification: Notification;
    onRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ 
    notification, 
    onRead 
}) => {
    const handleClick = () => {
        if (!notification.is_read) {
            onRead(notification.id);
        }
        if (notification.action_url) {
            navigate(notification.action_url);
        }
    };
    
    return (
        <div 
            className={`notification-item ${!notification.is_read ? 'unread' : ''} priority-${notification.priority}`}
            onClick={handleClick}
        >
            <div className="notification-icon">
                <NotificationTypeIcon type={notification.notification_type} />
            </div>
            <div className="notification-content">
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>
                <span className="notification-time">
                    {formatTimeAgo(notification.created_at)}
                </span>
            </div>
            {!notification.is_read && (
                <div className="unread-indicator" />
            )}
        </div>
    );
};
```

## External Delivery Implementation

### 1. Email Notifications
```javascript
async function sendEmailNotification(notification) {
    const contact = await getContact(notification.contact_id);
    const preferences = await getNotificationPreferences(
        contact.id, 
        notification.notification_type
    );
    
    if (!preferences.email_enabled) return;
    
    // Check quiet hours
    if (isQuietHours(preferences)) return;
    
    // Send via MS365/Outlook
    const emailResult = await outlookAPI.send({
        to: contact.email,
        subject: notification.title,
        body: generateEmailTemplate(notification),
        priority: notification.priority
    });
    
    // Update delivery status
    await updateNotificationDelivery(notification.id, 'email', {
        sent_at: new Date(),
        delivery_status: emailResult.success ? 'sent' : 'failed'
    });
}
```

### 2. Teams Notifications
```javascript
async function sendTeamsNotification(notification) {
    const contact = await getContact(notification.contact_id);
    const preferences = await getNotificationPreferences(
        contact.id, 
        notification.notification_type
    );
    
    if (!preferences.teams_enabled) return;
    
    // Send adaptive card to Teams
    const teamsResult = await teamsAPI.sendAdaptiveCard({
        user: contact.teams_user_id,
        card: generateTeamsCard(notification)
    });
    
    await updateNotificationDelivery(notification.id, 'teams', {
        sent_at: new Date(),
        delivery_status: teamsResult.success ? 'sent' : 'failed'
    });
}
```

### 3. WhatsApp Notifications
```javascript
async function sendWhatsAppNotification(notification) {
    const contact = await getContact(notification.contact_id);
    const preferences = await getNotificationPreferences(
        contact.id, 
        notification.notification_type
    );
    
    if (!preferences.whatsapp_enabled || !contact.mobile) return;
    
    // High priority only for WhatsApp
    if (!['high', 'urgent', 'critical'].includes(notification.priority)) return;
    
    const whatsappResult = await whatsappAPI.sendMessage({
        to: contact.mobile,
        text: `${notification.title}\n\n${notification.message}`,
        action_url: notification.action_url
    });
    
    await updateNotificationDelivery(notification.id, 'whatsapp', {
        sent_at: new Date(),
        delivery_status: whatsappResult.success ? 'sent' : 'failed'
    });
}
```

## API Endpoints

### 1. Notification Management
```typescript
// Get user notifications
GET /api/notifications?filter=unread&limit=50
Response: {
    notifications: Notification[],
    unread_count: number,
    total_count: number
}

// Mark notification as read
PATCH /api/notifications/:id
Body: { is_read: true }

// Mark all as read
PATCH /api/notifications/mark-all-read
Body: { contact_id: string }

// Create notification (internal)
POST /api/notifications
Body: {
    contact_id: string,
    notification_type: string,
    title: string,
    message: string,
    priority: string,
    action_url?: string,
    related_order_id?: string,
    related_contact_id?: string
}
```

### 2. Preference Management
```typescript
// Get user preferences
GET /api/notification-preferences/:contact_id

// Update preferences
PUT /api/notification-preferences
Body: {
    contact_id: string,
    preferences: {
        [notification_type]: {
            in_app_enabled: boolean,
            email_enabled: boolean,
            teams_enabled: boolean,
            whatsapp_enabled: boolean,
            priority_threshold: string
        }
    }
}
```

### 3. Real-time Updates
```typescript
// WebSocket connection for real-time notifications
WS /api/notifications/stream/:contact_id

// Server pushes new notifications:
{
    type: 'notification',
    data: Notification
}

// Client can send read receipts:
{
    type: 'mark_read',
    notification_id: string
}
```

## Default Notification Rules

### 1. Auto-generated Notifications
```javascript
const AUTO_NOTIFICATION_RULES = {
    // Task assignments
    'internal_tasks.assigned_to_contact_id': {
        notification_type: 'task_assigned',
        title: (task) => `Nieuwe taak: ${task.task_title}`,
        priority: (task) => task.priority,
        action_url: (task) => `/tasks/${task.id}`
    },
    
    // Order status changes
    'orders.order_status': {
        notification_type: 'order_status_change',
        title: (order) => `Order ${order.order_number} bijgewerkt`,
        priority: 'normal',
        action_url: (order) => `/order/${order.id}`
    },
    
    // Visit scheduling
    'visits.scheduled_date': {
        notification_type: 'visit_scheduled',
        title: (visit) => `Bezoek ingepland`,
        priority: 'normal',
        action_url: (visit) => `/visit/${visit.id}`
    },
    
    // Payment received
    'payments.payment_status': {
        notification_type: 'payment_received',
        title: (payment) => `Betaling ontvangen`,
        priority: 'normal',
        action_url: (payment) => `/payment/${payment.id}`
    },
    
    // Approval required
    'sign_offs.is_signed': {
        notification_type: 'approval_required',
        title: (signoff) => `Goedkeuring vereist`,
        priority: 'high',
        action_url: (signoff) => `/approvals/${signoff.id}`
    }
};
```

### 2. Default User Preferences
```javascript
const DEFAULT_PREFERENCES = {
    task_assigned: {
        in_app_enabled: true,
        email_enabled: true,
        teams_enabled: false,
        whatsapp_enabled: false,
        priority_threshold: 'normal'
    },
    order_status_change: {
        in_app_enabled: true,
        email_enabled: false,
        teams_enabled: false,
        whatsapp_enabled: false,
        priority_threshold: 'normal'
    },
    approval_required: {
        in_app_enabled: true,
        email_enabled: true,
        teams_enabled: true,
        whatsapp_enabled: false,
        priority_threshold: 'normal'
    },
    emergency: {
        in_app_enabled: true,
        email_enabled: true,
        teams_enabled: true,
        whatsapp_enabled: true,
        priority_threshold: 'urgent'
    }
};
```

## Performance Considerations

### 1. Database Indexing
```sql
-- Performance indexes for notification queries
CREATE INDEX idx_user_notifications_contact_unread 
ON user_notifications(contact_id, is_read, created_at DESC);

CREATE INDEX idx_user_notifications_expires 
ON user_notifications(expires_at) WHERE expires_at IS NOT NULL;

CREATE INDEX idx_notification_preferences_contact_type 
ON notification_preferences(contact_id, notification_type);
```

### 2. Cleanup Strategy
```javascript
// Auto-cleanup expired notifications
async function cleanupExpiredNotifications() {
    await db.delete('user_notifications')
        .where('expires_at', '<', new Date())
        .where('is_read', true);
    
    // Keep unread notifications even if expired
    // Clean read notifications older than 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await db.delete('user_notifications')
        .where('created_at', '<', thirtyDaysAgo)
        .where('is_read', true);
}
```

### 3. Rate Limiting
```javascript
const NOTIFICATION_RATE_LIMITS = {
    email: { max: 10, window: '1h' },      // Max 10 emails per hour
    teams: { max: 20, window: '1h' },      // Max 20 Teams per hour  
    whatsapp: { max: 5, window: '1h' },    // Max 5 WhatsApp per hour
    in_app: { max: 100, window: '1h' }     // Max 100 in-app per hour
};
```

## Security & Privacy

### 1. Access Control
- Users only see their own notifications
- Notifications respect existing data access permissions
- External delivery only to verified contact methods

### 2. Data Protection
- Personal data in notifications follows GDPR guidelines
- Automatic cleanup of old notifications
- Secure delivery via encrypted channels

### 3. Audit Trail
- All notification delivery attempts logged
- Read/unread status changes tracked
- Integration with existing audit_logs system

---

## Summary

The notification center provides:

- **🔔 Real-time in-app notifications** with unread count badge
- **📧 Multi-channel delivery** via email, Teams, WhatsApp
- **⚙️ User preferences** with granular control per notification type
- **🎯 Priority-based filtering** with quiet hours support
- **🔗 Deep-link integration** with action URLs
- **📊 Delivery tracking** and status monitoring
- **🧹 Automatic cleanup** of expired/old notifications

**Ready for frontend implementation with complete backend infrastructure!** 🚀 