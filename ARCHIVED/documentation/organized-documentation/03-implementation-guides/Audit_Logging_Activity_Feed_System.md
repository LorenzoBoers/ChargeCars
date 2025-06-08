# ChargeCars V2 Audit Logging & Activity Feed System
**Complete Implementation Guide voor Hierarchische Audit Trails - ✅ INFRASTRUCTURE COMPLETE**

---

## 🎯 **SYSTEEM OVERZICHT**

### **Doel**
- **Activity Feeds** op alle single record pages (orders, visits, quotes, etc.)
- **Hierarchische Audit Trails** - Orders tonen alle wijzigingen van onderliggende entities
- **Real-time Logging** van alle database wijzigingen
- **GDPR & Compliance** ready audit trails

### **Database Tabellen** ✅ **IMPLEMENTED**
- **audit_logs** (ID: 75) - Hoofdtabel voor alle audit events ✅
- **audit_entity_relationships** (ID: 78) - Entity hierarchy mapping ✅

### **🚨 STATUS UPDATE - 31 MEI 2025**
**✅ INFRASTRUCTURE COMPLETE:**
- ✅ Addresses normalization implemented
- ✅ Inventory reservations system active
- ✅ All critical FK relationships established
- ✅ Audit logs table with hierarchical fields ready
- ✅ Entity relationships mapping table ready

**🔄 IMPLEMENTATION READY:**
- Backend audit trigger functions
- Frontend activity feed components
- Real-time WebSocket updates
- Business logic integration

---

## 📊 **AUDIT_LOGS TABEL STRUCTUUR**

### **Basis Audit Fields**
```sql
- id (UUID, Primary Key)
- table_name (TEXT) - Gewijzigde tabel
- record_id (TEXT) - UUID van gewijzigd record  
- action (ENUM) - create, update, delete, status_change, assignment, signature, payment
- old_values (JSON) - Waarden voor wijziging
- new_values (JSON) - Waarden na wijziging
- changed_fields (JSON) - Array van gewijzigde velden
- changed_by_contact_id (UUID, FK → contact)
- created_at (TIMESTAMP)
```

### **🆕 Hierarchische Logging Fields**
```sql
- parent_table_name (TEXT) - Direct parent entity tabel
- parent_record_id (TEXT) - Direct parent entity UUID
- root_table_name (TEXT) - Root entity tabel (meestal 'orders')
- root_record_id (TEXT) - Root entity UUID (order_id)
- entity_display_name (TEXT) - Human-readable entity naam
- change_summary (TEXT) - Human-readable wijziging beschrijving
- business_context (JSON) - Extra business context voor UI
```

### **Security & Context Fields**
```sql
- ip_address (TEXT)
- user_agent (TEXT)
- session_id (TEXT)
- request_method (TEXT)
- endpoint (TEXT)
- reason (TEXT)
- severity (ENUM) - low, normal, high, critical
```

---

## 🏗️ **ENTITY RELATIONSHIPS MAPPING**

### **audit_entity_relationships Tabel**
```sql
- child_table_name (TEXT) - Kind entity tabel
- child_record_id (TEXT) - Kind entity UUID
- parent_table_name (TEXT) - Parent entity tabel  
- parent_record_id (TEXT) - Parent entity UUID
- relationship_type (ENUM) - direct_child, nested_child, related_entity
- relationship_level (INTEGER) - Hierarchy niveau (1=direct, 2=grandchild)
- foreign_key_field (TEXT) - FK veld dat relatie creëert
- cascade_audit_logs (BOOLEAN) - Logs moeten in parent activity feed
```

### **Hierarchy Voorbeelden**
```
orders (ROOT)
├── line_items (LEVEL 1)
├── quotes (LEVEL 1)
│   └── line_items (LEVEL 2) -- Quote-specific line items
├── visits (LEVEL 1)
│   ├── work_orders (LEVEL 2)
│   │   └── sign_offs (LEVEL 3)
│   └── documents (LEVEL 2) -- Visit photos
├── communication_threads (LEVEL 1)
│   ├── communication_messages (LEVEL 2)
│   └── internal_tasks (LEVEL 2)
├── invoices (LEVEL 1)
│   └── payments (LEVEL 2)
└── customer_feedback (LEVEL 1)
```

---

## 🎨 **ACTIVITY FEED IMPLEMENTATIE**

### **1. Single Entity Activity Feed**
**Voorbeeld: Visit Detail Page**
```sql
-- Haal alle audit logs voor deze visit op
SELECT * FROM audit_logs 
WHERE table_name = 'visits' 
  AND record_id = '{visit_id}'
ORDER BY created_at DESC;
```

### **2. Hierarchische Activity Feed**  
**Voorbeeld: Order Detail Page - Alle Onderliggende Activities**
```sql
-- Haal alle audit logs op voor order + alle children
SELECT al.*, c.first_name, c.last_name 
FROM audit_logs al
LEFT JOIN contacts c ON al.changed_by_contact_id = c.id
WHERE (
    -- Direct order changes
    (al.table_name = 'orders' AND al.record_id = '{order_id}')
    OR
    -- All child entity changes
    (al.root_record_id = '{order_id}')
)
ORDER BY al.created_at DESC
LIMIT 50;
```

### **3. Real-time Activity Feed Query**
```sql
-- Laatste 24 uur activiteiten voor order
SELECT 
    al.created_at,
    al.table_name,
    al.action,
    al.entity_display_name,
    al.change_summary,
    al.severity,
    c.first_name || ' ' || c.last_name as changed_by_name,
    al.business_context
FROM audit_logs al
LEFT JOIN contacts c ON al.changed_by_contact_id = c.id  
WHERE al.root_record_id = '{order_id}'
  AND al.created_at >= NOW() - INTERVAL '24 HOURS'
ORDER BY al.created_at DESC;
```

---

## 📝 **AUDIT LOG VOORBEELDEN**

### **1. Order Status Wijziging**
```json
{
    "table_name": "orders",
    "record_id": "550e8400-e29b-41d4-a716-446655440000",
    "action": "status_change",
    "old_values": {"order_status": "draft"},
    "new_values": {"order_status": "approved"},
    "changed_fields": ["order_status"],
    "changed_by_contact_id": "alex@chargecars.nl",
    "entity_display_name": "Order #CC-2025-001234",
    "change_summary": "Order status changed from Draft to Approved",
    "severity": "normal",
    "business_context": {
        "customer_name": "Tesla Charging B.V.",
        "order_value": 1650.00,
        "notification_sent": true
    }
}
```

### **2. Visit Scheduling**
```json
{
    "table_name": "visits", 
    "record_id": "660e8400-e29b-41d4-a716-446655440001",
    "action": "create",
    "new_values": {
        "scheduled_date": "2025-06-15",
        "team_id": "team-alex-001",
        "visit_type": "installation"
    },
    "parent_table_name": "orders",
    "parent_record_id": "550e8400-e29b-41d4-a716-446655440000",
    "root_table_name": "orders", 
    "root_record_id": "550e8400-e29b-41d4-a716-446655440000",
    "entity_display_name": "Installation Visit - Team Alex - 15 Jun 2025",
    "change_summary": "Installation visit scheduled with Team Alex for June 15th",
    "severity": "normal",
    "business_context": {
        "team_name": "Team Alex",
        "customer_notified": true,
        "time_slot": "09:00-17:00"
    }
}
```

### **3. Work Order LMRA Approval**
```json
{
    "table_name": "work_orders",
    "record_id": "770e8400-e29b-41d4-a716-446655440002", 
    "action": "update",
    "old_values": {"work_order_status": "lmra_pending"},
    "new_values": {"work_order_status": "lmra_approved"},
    "changed_fields": ["work_order_status", "lmra_approved_by", "lmra_completed_at"],
    "parent_table_name": "visits",
    "parent_record_id": "660e8400-e29b-41d4-a716-446655440001",
    "root_table_name": "orders",
    "root_record_id": "550e8400-e29b-41d4-a716-446655440000",
    "entity_display_name": "Work Order #WO-2025-5678 - LMRA Approved",
    "change_summary": "LMRA safety assessment approved, work can proceed",
    "severity": "high",
    "business_context": {
        "technician_name": "Alex van der Berg",
        "safety_checks_passed": 4,
        "next_step": "materials_verification"
    }
}
```

### **4. Customer Signature**
```json
{
    "table_name": "sign_offs",
    "record_id": "880e8400-e29b-41d4-a716-446655440003",
    "action": "create", 
    "new_values": {
        "sign_off_type": "installation_complete",
        "signer_contact_id": "customer-contact-001",
        "signed_at": "2025-06-15T16:30:00Z"
    },
    "parent_table_name": "work_orders",
    "parent_record_id": "770e8400-e29b-41d4-a716-446655440002",
    "root_table_name": "orders",
    "root_record_id": "550e8400-e29b-41d4-a716-446655440000",
    "entity_display_name": "Customer Signature - Installation Complete",
    "change_summary": "Customer signed off on completed installation",
    "severity": "high",
    "business_context": {
        "customer_name": "Jan Janssen",
        "satisfaction_rating": 5,
        "installation_photos": 8,
        "warranty_activated": true
    }
}
```

---

## 🔧 **TECHNISCHE IMPLEMENTATIE**

### **1. Audit Log Creation Function**
```javascript
// Pseudo-code voor audit log creatie
function createAuditLog(params) {
    const auditLog = {
        table_name: params.tableName,
        record_id: params.recordId,
        action: params.action,
        old_values: params.oldValues,
        new_values: params.newValues,
        changed_fields: getChangedFields(params.oldValues, params.newValues),
        changed_by_contact_id: getCurrentUser().id,
        entity_display_name: generateDisplayName(params.tableName, params.recordId),
        change_summary: generateChangeSummary(params),
        severity: determineSeverity(params),
        
        // Hierarchical fields
        ...getHierarchicalContext(params.tableName, params.recordId),
        
        // Technical context
        ip_address: getClientIP(),
        user_agent: getUserAgent(),
        session_id: getCurrentSession().id,
        request_method: getCurrentRequest().method,
        endpoint: getCurrentRequest().endpoint
    };
    
    return insertAuditLog(auditLog);
}
```

### **2. Hierarchical Context Resolution**
```javascript
function getHierarchicalContext(tableName, recordId) {
    const relationships = {
        'line_items': { parent: 'orders', field: 'order_id' },
        'visits': { parent: 'orders', field: 'order_id' },
        'work_orders': { parent: 'visits', field: 'visit_id' },
        'sign_offs': { parent: 'work_orders', field: 'work_order_id' },
        'communication_messages': { parent: 'communication_threads', field: 'thread_id' },
        'internal_tasks': { parent: 'communication_threads', field: 'thread_id' },
        'invoices': { parent: 'orders', field: 'order_id' },
        'payments': { parent: 'invoices', field: 'invoice_id' }
    };
    
    const context = {};
    
    if (relationships[tableName]) {
        const rel = relationships[tableName];
        const parentRecord = getRecord(rel.parent, getFieldValue(tableName, recordId, rel.field));
        
        context.parent_table_name = rel.parent;
        context.parent_record_id = parentRecord.id;
        
        // Recurse to find root (order)
        if (rel.parent !== 'orders') {
            const rootContext = getHierarchicalContext(rel.parent, parentRecord.id);
            context.root_table_name = rootContext.root_table_name || 'orders';
            context.root_record_id = rootContext.root_record_id || rootContext.parent_record_id;
        } else {
            context.root_table_name = 'orders';
            context.root_record_id = parentRecord.id;
        }
    }
    
    return context;
}
```

### **3. Activity Feed Component**
```javascript
// React component voorbeeld
function ActivityFeed({ entityType, entityId, showHierarchical = false }) {
    const [activities, setActivities] = useState([]);
    
    useEffect(() => {
        const query = showHierarchical 
            ? `audit_logs?root_record_id=${entityId}&sort=created_at:desc&limit=50`
            : `audit_logs?table_name=${entityType}&record_id=${entityId}&sort=created_at:desc&limit=50`;
            
        fetchActivities(query).then(setActivities);
    }, [entityType, entityId, showHierarchical]);
    
    return (
        <div className="activity-feed">
            {activities.map(activity => (
                <ActivityItem key={activity.id} activity={activity} />
            ))}
        </div>
    );
}

function ActivityItem({ activity }) {
    const getSeverityIcon = (severity) => {
        switch(severity) {
            case 'critical': return '🚨';
            case 'high': return '⚠️';
            case 'normal': return 'ℹ️';
            case 'low': return '📝';
        }
    };
    
    return (
        <div className={`activity-item severity-${activity.severity}`}>
            <div className="activity-header">
                <span className="severity-icon">{getSeverityIcon(activity.severity)}</span>
                <span className="entity-name">{activity.entity_display_name}</span>
                <span className="timestamp">{formatTimestamp(activity.created_at)}</span>
            </div>
            <div className="activity-summary">{activity.change_summary}</div>
            <div className="activity-author">by {activity.changed_by_name}</div>
        </div>
    );
}
```

---

## 📱 **UI/UX IMPLEMENTATIE**

### **1. Activity Feed Plaatsing**

#### **Order Detail Page**
```
[Order Header]
├── Order Details Tab
├── Line Items Tab  
├── Visits Tab
├── Communication Tab
└── Activity Feed Tab ⭐ -- NIEUWE TAB
    ├── All Activities (hierarchical)
    ├── Order Changes Only
    ├── System Events
    └── Customer Interactions
```

#### **Visit Detail Page**
```
[Visit Header]
├── Visit Details
├── Work Orders
├── Documents
└── Activity Sidebar ⭐ -- RECHTER KOLOM
    ├── Visit Activities
    ├── Work Order Updates
    └── Technician Actions
```

#### **Quote Detail Page**  
```
[Quote Header]
├── Quote Details
├── Line Items
└── Activity Timeline ⭐ -- ONDER MAIN CONTENT
    ├── Quote Changes
    ├── Customer Interactions
    └── Approval Process
```

### **2. Activity Types & Icons**
```javascript
const ACTIVITY_TYPES = {
    'create': { icon: '➕', color: 'green', label: 'Created' },
    'update': { icon: '✏️', color: 'blue', label: 'Updated' },
    'delete': { icon: '🗑️', color: 'red', label: 'Deleted' },
    'status_change': { icon: '🔄', color: 'orange', label: 'Status Changed' },
    'assignment': { icon: '👤', color: 'purple', label: 'Assigned' },
    'signature': { icon: '✍️', color: 'green', label: 'Signed' },
    'payment': { icon: '💰', color: 'green', label: 'Payment' }
};
```

### **3. Real-time Updates**
```javascript
// WebSocket implementation voor real-time activity updates
function useRealTimeActivities(entityId) {
    const [activities, setActivities] = useState([]);
    
    useEffect(() => {
        const ws = new WebSocket(`wss://api.chargecars.nl/ws/activities/${entityId}`);
        
        ws.onmessage = (event) => {
            const newActivity = JSON.parse(event.data);
            setActivities(prev => [newActivity, ...prev]);
            
            // Show toast notification
            showToast(`${newActivity.change_summary}`, newActivity.severity);
        };
        
        return () => ws.close();
    }, [entityId]);
    
    return activities;
}
```

---

## 🔒 **SECURITY & PRIVACY**

### **1. Access Control**
```sql
-- Audit logs zijn alleen zichtbaar voor gebruikers met toegang tot parent entity
CREATE POLICY audit_logs_access ON audit_logs
FOR SELECT USING (
    -- User heeft toegang tot root entity (order)
    user_has_access_to_entity(root_table_name, root_record_id, current_user_id())
    OR
    -- User heeft toegang tot direct entity  
    user_has_access_to_entity(table_name, record_id, current_user_id())
);
```

### **2. Sensitive Data Redaction**
```javascript
function redactSensitiveData(auditLog, userPermissions) {
    const sensitiveFields = ['password_hash', 'api_keys', 'bank_account'];
    
    if (!userPermissions.viewSensitiveData) {
        auditLog.old_values = redactFields(auditLog.old_values, sensitiveFields);
        auditLog.new_values = redactFields(auditLog.new_values, sensitiveFields);
    }
    
    return auditLog;
}
```

### **3. GDPR Compliance**
```sql
-- Data retention - automatisch cleanup na 7 jaar
DELETE FROM audit_logs 
WHERE created_at < NOW() - INTERVAL '7 YEARS'
  AND severity IN ('low', 'normal');

-- Customer data deletion - audit trail behouden maar anonimiseren
UPDATE audit_logs 
SET old_values = anonymize_personal_data(old_values),
    new_values = anonymize_personal_data(new_values)
WHERE root_record_id IN (SELECT id FROM orders WHERE customer_organization_id = '{deleted_customer_id}');
```

---

## 🎯 **IMPLEMENTATIE ROADMAP**

### **Phase 1 (Week 1) - Basic Audit Logging** ✅
- [x] audit_logs tabel uitgebreid met hierarchical fields
- [x] audit_entity_relationships tabel
- [x] Basic audit log creation

### **Phase 2 (Week 2) - Activity Feeds**
- [ ] Single entity activity feed queries
- [ ] Hierarchical activity feed queries  
- [ ] Activity feed UI components
- [ ] Real-time WebSocket updates

### **Phase 3 (Week 3) - Advanced Features**
- [ ] Smart change summaries
- [ ] Business context enrichment
- [ ] Activity search & filtering
- [ ] Export functionality

### **Phase 4 (Week 4) - Polish & Security**
- [ ] Access control implementation
- [ ] Sensitive data redaction
- [ ] Performance optimization
- [ ] GDPR compliance features

---

## 📊 **SUCCESS METRICS**

### **Technical Metrics**
- **Audit Coverage**: 100% van kritieke table wijzigingen
- **Performance**: Activity feed loads < 500ms
- **Storage**: Efficient audit log retention policy

### **Business Metrics** 
- **Transparency**: Klanten kunnen hun order progress volgen
- **Debugging**: 90% van support issues traceerbaar via audit logs
- **Compliance**: 100% GDPR audit trail compliance

---

**Deze implementatie geeft ChargeCars V2 enterprise-grade audit trails met complete transparency en real-time activity feeds! 🚀** 