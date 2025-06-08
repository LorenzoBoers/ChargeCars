# ChargeCars V2 - Multichannel Inbox Folder Structure Analysis
**Database Compatibility Assessment for Nested Entity Folders**  
*Analysis Date: 1 juni 2025*

---

## 🎯 **REQUIREMENTS ANALYSIS**

### **Requested Folder Structure**
```
📁 Multichannel Inbox
├── 📂 ChargeCars B.V.
│   ├── 📧 Email
│   │   ├── 💬 Support Tickets
│   │   ├── 💰 Sales Tickets  
│   │   └── 👤 Assigned to Me
│   ├── 📱 WhatsApp
│   │   ├── 💬 Support Tickets
│   │   ├── 💰 Sales Tickets
│   │   └── 👤 Assigned to Me
│   ├── 🔗 Other Channels
│   │   ├── ☎️ Phone Calls
│   │   ├── 📋 Internal Tasks
│   │   └── 🎫 Internal Tickets
│   └── 📥 All Inbox (Combined)
├── 📂 LaderThuis B.V.
│   ├── 📧 Email
│   ├── 📱 WhatsApp  
│   ├── 🔗 Other Channels
│   └── 📥 All Inbox
├── 📂 MeterKastThuis B.V.
├── 📂 Zaptec Shop B.V.
├── 📂 Ratio Shop B.V.
└── 🔍 Global Filters
    ├── 👤 All Assigned to Me
    ├── 🚨 Urgent/Overdue
    ├── 📅 Today's Tasks
    └── 🔍 Search All
```

### **Functional Requirements**
1. **Business Entity Segregation**: Complete message isolation per entity
2. **Channel Type Filtering**: Group by email, WhatsApp, phone, internal
3. **Ticket Type Classification**: Sales vs Support tickets  
4. **Assignment Filtering**: Messages assigned to current user
5. **Unified Inbox**: All messages for an entity in one view
6. **Cross-Entity Search**: Global search and filtering capabilities

---

## ❌ **CURRENT DATABASE LIMITATIONS**

### **Critical Missing Elements**

#### **1. Business Entity Context Missing**
```sql
-- CURRENT: communication_threads table
CREATE TABLE communication_thread (
    id UUID PRIMARY KEY,
    thread_subject TEXT,
    thread_type ENUM (...),
    -- ❌ NO business_entity_id field!
    order_id UUID REFERENCES orders(id),
    customer_organization_id UUID REFERENCES organizations(id),
    ...
);
```

**Impact**: Cannot filter/organize threads by business entity.

#### **2. Channel-Entity Relationship Missing**
```sql
-- CURRENT: communication_channels table  
CREATE TABLE communication_channel (
    id UUID PRIMARY KEY,
    channel_type ENUM (...),
    channel_name TEXT,
    -- ❌ NO business_entity_id field!
    -- ❌ NO entity-specific configuration!
    ...
);
```

**Impact**: Channels are global, not entity-specific.

#### **3. Message Entity Context Missing**
```sql
-- CURRENT: communication_messages table
CREATE TABLE communication_message (
    id UUID PRIMARY KEY,
    thread_id UUID REFERENCES communication_threads(id),
    channel_id UUID REFERENCES communication_channels(id),
    -- ❌ NO direct business_entity_id reference!
    ...
);
```

**Impact**: Cannot directly query messages by business entity.

### **Query Impossibilities with Current Schema**
```sql
-- ❌ IMPOSSIBLE: Get all ChargeCars email messages
SELECT * FROM communication_messages 
JOIN communication_threads ON messages.thread_id = threads.id
WHERE business_entity_id = 'chargecars-uuid'; -- Field doesn't exist!

-- ❌ IMPOSSIBLE: Get WhatsApp channels for LaderThuis
SELECT * FROM communication_channels 
WHERE business_entity_id = 'laderthuis-uuid' 
AND channel_type = 'whatsapp_business'; -- Field doesn't exist!

-- ❌ IMPOSSIBLE: Assigned to me in specific entity
SELECT * FROM communication_threads
WHERE assigned_to_contact_id = :user_id 
AND business_entity_id = :entity_id; -- Field doesn't exist!
```

---

## ✅ **REQUIRED DATABASE MODIFICATIONS**

### **Schema Updates Needed**

#### **1. Add Business Entity Context to communication_threads**
```sql
-- UPDATE: communication_threads schema
ALTER TABLE communication_thread 
ADD COLUMN business_entity_id UUID NOT NULL REFERENCES business_entities(id);

-- Add index for performance
CREATE INDEX idx_communication_threads_business_entity 
ON communication_threads(business_entity_id, status, priority);
```

#### **2. Add Business Entity Context to communication_channels**
```sql
-- UPDATE: communication_channels schema  
ALTER TABLE communication_channel
ADD COLUMN business_entity_id UUID REFERENCES business_entities(id);

-- Add entity-specific configuration
ALTER TABLE communication_channel
ADD COLUMN entity_specific_config JSON;

-- Add unique constraint per entity+channel_type
ALTER TABLE communication_channel
ADD CONSTRAINT uk_entity_channel_type 
UNIQUE(business_entity_id, channel_type, channel_name);
```

#### **3. Enhanced Thread Classification**
```sql
-- UPDATE: communication_threads enum values
ALTER TABLE communication_thread 
MODIFY COLUMN thread_type ENUM(
    'customer_support',
    'partner_inquiry', 
    'installation_coordination',
    'technical_issue',
    'sales_inquiry',        -- ✅ SUPPORT vs SALES classification
    'sales_follow_up',      -- ✅ Additional sales types
    'complaint',
    'internal_task',
    'project_discussion',
    'billing_inquiry',      -- ✅ Additional categories
    'warranty_claim',
    'general_inquiry'
);
```

#### **4. Add Department/Team Context**
```sql
-- UPDATE: communication_threads for assignment filtering
ALTER TABLE communication_thread
ADD COLUMN assigned_department ENUM(
    'customer_service',
    'sales', 
    'technical_support',
    'operations',
    'administration',
    'management'
);

-- Add team assignment context
ALTER TABLE communication_thread  
ADD COLUMN assigned_team_id UUID REFERENCES teams(id);
```

---

## 🛠️ **IMPLEMENTATION SOLUTION**

### **Phase 1: Schema Updates (URGENT)**

#### **Step 1: Add Business Entity Fields**
```sql
-- Add business_entity_id to communication_threads
ALTER TABLE communication_thread 
ADD COLUMN business_entity_id UUID;

-- Add foreign key constraint
ALTER TABLE communication_thread
ADD CONSTRAINT fk_threads_business_entity 
FOREIGN KEY (business_entity_id) REFERENCES business_entities(id);

-- Add business_entity_id to communication_channels  
ALTER TABLE communication_channel
ADD COLUMN business_entity_id UUID;

-- Add foreign key constraint
ALTER TABLE communication_channel
ADD CONSTRAINT fk_channels_business_entity
FOREIGN KEY (business_entity_id) REFERENCES business_entities(id);
```

#### **Step 2: Data Migration Strategy**
```sql
-- Migrate existing threads to default entity (ChargeCars)
UPDATE communication_threads 
SET business_entity_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE business_entity_id IS NULL;

-- Migrate existing channels to entity-specific channels
-- Create 5 copies of each channel (one per entity)
INSERT INTO communication_channels (
    channel_type, channel_name, business_entity_id, 
    is_active, auto_assignment_rules, response_sla_hours, escalation_rules
)
SELECT 
    channel_type,
    CONCAT(entity.entity_name, ' - ', channel_name) as channel_name,
    entity.id as business_entity_id,
    is_active,
    auto_assignment_rules,
    response_sla_hours,
    escalation_rules
FROM communication_channels original
CROSS JOIN business_entities entity
WHERE original.business_entity_id IS NULL;
```

#### **Step 3: Make business_entity_id Required**
```sql
-- After data migration, make field required
ALTER TABLE communication_thread 
MODIFY COLUMN business_entity_id UUID NOT NULL;

ALTER TABLE communication_channel
MODIFY COLUMN business_entity_id UUID NOT NULL;
```

### **Phase 2: Enhanced Filtering Capabilities**

#### **New Table: communication_thread_tags**
```sql
CREATE TABLE communication_thread_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES communication_threads(id) ON DELETE CASCADE,
    tag_name VARCHAR(50) NOT NULL,
    tag_value VARCHAR(200),
    created_by_contact_id UUID REFERENCES contacts(id),
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(thread_id, tag_name)
);

-- Performance indexes
CREATE INDEX idx_thread_tags_thread_id ON communication_thread_tags(thread_id);
CREATE INDEX idx_thread_tags_name_value ON communication_thread_tags(tag_name, tag_value);
```

#### **Enhanced Query Capabilities**
```sql
-- ✅ NOW POSSIBLE: Get all ChargeCars email messages
SELECT m.*, t.thread_subject, c.channel_name
FROM communication_messages m
JOIN communication_threads t ON m.thread_id = t.id  
JOIN communication_channels c ON m.channel_id = c.id
WHERE t.business_entity_id = '550e8400-e29b-41d4-a716-446655440001'
AND c.channel_type = 'email_outlook';

-- ✅ NOW POSSIBLE: Sales tickets for LaderThuis WhatsApp
SELECT t.*
FROM communication_threads t
JOIN communication_messages m ON m.thread_id = t.id
JOIN communication_channels c ON m.channel_id = c.id  
WHERE t.business_entity_id = '550e8400-e29b-41d4-a716-446655440002'
AND c.channel_type = 'whatsapp_business'
AND t.thread_type IN ('sales_inquiry', 'sales_follow_up');

-- ✅ NOW POSSIBLE: Assigned to me in MeterKastThuis
SELECT t.*
FROM communication_threads t
WHERE t.business_entity_id = '550e8400-e29b-41d4-a716-446655440003'
AND t.assigned_to_contact_id = :current_user_id
AND t.status IN ('open', 'in_progress');
```

---

## 📊 **FOLDER STRUCTURE IMPLEMENTATION**

### **Frontend Query Structure**

#### **Business Entity Level**
```typescript
interface EntityFolderData {
  entityId: string;
  entityName: string; 
  entityCode: string;
  totalMessages: number;
  unreadCount: number;
  overdueCount: number;
  channels: ChannelFolderData[];
}

interface ChannelFolderData {
  channelType: 'email' | 'whatsapp' | 'phone' | 'internal';
  channelName: string;
  messageCount: number;
  unreadCount: number;
  ticketCategories: TicketCategoryData[];
}

interface TicketCategoryData {
  category: 'support' | 'sales' | 'assigned_to_me';
  count: number;
  unreadCount: number;
  overdue: number;
}
```

#### **API Endpoints for Folder Data**
```typescript
// Get folder structure for inbox
GET /api/communication/inbox/folder-structure

// Get messages for specific folder
GET /api/communication/messages?entityId={id}&channelType={type}&category={cat}&assignedToMe={bool}

// Get entity-specific inbox
GET /api/communication/inbox/{entityId}

// Get cross-entity assigned to me
GET /api/communication/assigned-to-me?userId={id}
```

### **Database Query Examples**

#### **Folder Counts Query**
```sql
-- Get message counts per entity/channel/category
SELECT 
    be.entity_name,
    be.entity_code,
    cc.channel_type,
    CASE 
        WHEN ct.thread_type IN ('sales_inquiry', 'sales_follow_up') THEN 'sales'
        WHEN ct.thread_type IN ('customer_support', 'technical_issue', 'complaint') THEN 'support'
        ELSE 'other'
    END as ticket_category,
    COUNT(*) as message_count,
    COUNT(CASE WHEN cm.read_at IS NULL THEN 1 END) as unread_count,
    COUNT(CASE WHEN ct.response_due_at < NOW() AND ct.status = 'open' THEN 1 END) as overdue_count
FROM business_entities be
LEFT JOIN communication_threads ct ON ct.business_entity_id = be.id
LEFT JOIN communication_messages cm ON cm.thread_id = ct.id
LEFT JOIN communication_channels cc ON cm.channel_id = cc.id
WHERE be.is_active = true
GROUP BY be.id, be.entity_name, be.entity_code, cc.channel_type, ticket_category
ORDER BY be.entity_name, cc.channel_type;
```

#### **Assigned To Me Query**
```sql
-- Get all messages assigned to current user, grouped by entity
SELECT 
    be.entity_name,
    cc.channel_type,
    ct.thread_subject,
    ct.priority,
    ct.status,
    ct.response_due_at,
    cm.created_at as last_message_at,
    CASE WHEN ct.response_due_at < NOW() THEN 'overdue' ELSE 'on_time' END as sla_status
FROM communication_threads ct
JOIN business_entities be ON ct.business_entity_id = be.id
JOIN communication_messages cm ON cm.thread_id = ct.id 
JOIN communication_channels cc ON cm.channel_id = cc.id
WHERE ct.assigned_to_contact_id = :current_user_id
AND ct.status IN ('open', 'in_progress', 'waiting_customer')
ORDER BY ct.response_due_at ASC, ct.priority DESC;
```

---

## 🎯 **UI IMPLEMENTATION STRATEGY**

### **Nested Folder Tree Component**
```typescript
interface FolderTreeProps {
  entities: EntityFolderData[];
  selectedFolder: FolderSelection;
  onFolderSelect: (folder: FolderSelection) => void;
  currentUser: User;
}

interface FolderSelection {
  entityId?: string;
  channelType?: string; 
  ticketCategory?: string;
  assignedToMe?: boolean;
  globalFilter?: string;
}
```

### **Message List Component**
```typescript
interface MessageListProps {
  folderSelection: FolderSelection;
  messages: CommunicationMessage[];
  loading: boolean;
  pagination: PaginationInfo;
  onMessageSelect: (messageId: string) => void;
  onMarkAsRead: (messageIds: string[]) => void;
}
```

### **Real-time Updates**
```typescript
// WebSocket subscription for real-time folder updates
interface InboxSubscription {
  userId: string;
  entityIds: string[];
  channelTypes: string[];
  
  onNewMessage: (message: CommunicationMessage) => void;
  onMessageRead: (messageId: string) => void;
  onThreadAssigned: (threadId: string, assigneeId: string) => void;
  onFolderCountUpdate: (counts: FolderCounts) => void;
}
```

---

## ⚡ **PERFORMANCE OPTIMIZATIONS**

### **Database Indexes**
```sql
-- Entity-channel performance indexes
CREATE INDEX idx_threads_entity_status_priority 
ON communication_threads(business_entity_id, status, priority, response_due_at);

CREATE INDEX idx_messages_entity_channel_created 
ON communication_messages(business_entity_id, channel_id, created_at DESC);

CREATE INDEX idx_threads_assigned_entity_status
ON communication_threads(assigned_to_contact_id, business_entity_id, status);

-- Channel filtering indexes
CREATE INDEX idx_channels_entity_type_active
ON communication_channels(business_entity_id, channel_type, is_active);
```

### **Caching Strategy**
```typescript
// Cache folder counts for performance
interface FolderCountCache {
  entityId: string;
  channelCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
  assignedToMeCounts: Record<string, number>;
  lastUpdated: Date;
  ttl: number; // 5 minutes
}
```

---

## ✅ **IMPLEMENTATION ROADMAP**

### **Phase 1: Critical Schema Updates (Week 1)**
- [ ] Add business_entity_id to communication_threads
- [ ] Add business_entity_id to communication_channels  
- [ ] Migrate existing data to ChargeCars entity
- [ ] Create entity-specific channels for all 5 entities
- [ ] Add required constraints and indexes

### **Phase 2: Enhanced Features (Week 2)**  
- [ ] Add department/team assignment fields
- [ ] Create communication_thread_tags table
- [ ] Implement enhanced thread classification  
- [ ] Add performance indexes
- [ ] Create API endpoints for folder structure

### **Phase 3: Frontend Implementation (Week 2-3)**
- [ ] Build nested folder tree component
- [ ] Implement message list with filtering
- [ ] Add real-time WebSocket updates  
- [ ] Create inbox dashboard with counts
- [ ] Add cross-entity search functionality

### **Phase 4: Advanced Features (Week 3-4)**
- [ ] Smart message categorization (AI-powered)
- [ ] Advanced filtering and search
- [ ] Bulk message operations
- [ ] Export and reporting capabilities
- [ ] Mobile-responsive inbox interface

---

## 🎯 **CONCLUSION**

### **Database Compatibility Status**
❌ **Current Database: NOT COMPATIBLE** for nested entity folders
✅ **With Proposed Changes: FULLY COMPATIBLE**

### **Required Changes Summary**
1. **Add business_entity_id** to communication_threads and communication_channels
2. **Migrate existing data** to entity-specific structure  
3. **Enhanced thread classification** for sales vs support tickets
4. **Department/team assignment** context for filtering
5. **Performance indexes** for fast folder queries

### **Post-Implementation Capabilities**
✅ **Complete Entity Isolation** - Perfect message segregation per business entity
✅ **Multi-Level Filtering** - Entity → Channel → Category → Assignment
✅ **Real-time Updates** - Live folder counts and message notifications  
✅ **Scalable Architecture** - Easy to add new entities and channels
✅ **Advanced Search** - Cross-entity search with proper permissions

**The multichannel inbox with nested entity folders will be fully functional after these database modifications!**

---

*Multichannel Inbox Analysis | ChargeCars V2 Technical Team | 1 juni 2025* 