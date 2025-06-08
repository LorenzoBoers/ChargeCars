# ChargeCars V2 Audit Logging - Praktische Voorbeelden
**Real-world Scenarios en Activity Feed Implementatie**

---

## 🎯 **COMPLETE ORDER LIFECYCLE - AUDIT TRAIL VOORBEELD**

### **Scenario: Order CC-2025-001234 van Draft tot Completed**

**Order Details:**
- Customer: Tesla Charging B.V.
- Product: 3x Wallbox + Installatie
- Value: €1,650.00

---

## 📊 **ACTIVITY FEED OP ORDER DETAIL PAGE**

### **Hierarchische View - Alle Activities voor Order**

```sql
-- Query voor Order Detail Page Activity Feed
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
WHERE al.root_record_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY al.created_at DESC;
```

### **Activity Timeline (Chronologisch)**

#### **1. 📝 Order Created (2025-05-31 09:00)**
```json
{
    "table_name": "orders",
    "action": "create",
    "entity_display_name": "Order #CC-2025-001234",
    "change_summary": "New order created for Tesla Charging B.V.",
    "severity": "normal",
    "changed_by": "Sarah van Dam (Sales)",
    "business_context": {
        "customer_name": "Tesla Charging B.V.",
        "order_value": 1650.00,
        "products": ["3x Wallbox Pro", "Installation Service"],
        "created_from": "intake_form_submission"
    }
}
```

#### **2. ➕ Line Items Added (2025-05-31 09:05)**
```json
{
    "table_name": "line_items",
    "action": "create", 
    "entity_display_name": "3x Wallbox Pro - €1,350.00",
    "change_summary": "Added 3x Wallbox Pro to order",
    "parent_table_name": "orders",
    "root_record_id": "550e8400-e29b-41d4-a716-446655440000",
    "severity": "normal",
    "changed_by": "Sarah van Dam (Sales)"
}
```

#### **3. 💰 Quote Generated (2025-05-31 10:30)**
```json
{
    "table_name": "quotes",
    "action": "create",
    "entity_display_name": "Quote #QU-2025-5678",
    "change_summary": "Official quote generated and sent to customer",
    "parent_table_name": "orders", 
    "root_record_id": "550e8400-e29b-41d4-a716-446655440000",
    "severity": "normal",
    "changed_by": "Sarah van Dam (Sales)",
    "business_context": {
        "quote_value": 1650.00,
        "valid_until": "2025-06-15",
        "sent_to": "procurement@tesla.com",
        "delivery_method": "email"
    }
}
```

#### **4. 🔄 Order Status: Draft → Approved (2025-06-02 14:20)**
```json
{
    "table_name": "orders",
    "action": "status_change",
    "entity_display_name": "Order #CC-2025-001234",
    "change_summary": "Order approved by customer - ready for scheduling",
    "old_values": {"order_status": "draft"},
    "new_values": {"order_status": "approved"},
    "severity": "high",
    "changed_by": "Customer Portal (Tesla Charging)",
    "business_context": {
        "approved_by": "Jan Janssen (Tesla Procurement)",
        "approval_method": "customer_portal",
        "payment_terms": "net_30",
        "installation_requested": true
    }
}
```

#### **5. 📅 Visit Scheduled (2025-06-02 15:45)**
```json
{
    "table_name": "visits",
    "action": "create",
    "entity_display_name": "Installation Visit - Team Alex - 15 Jun 2025",
    "change_summary": "Installation visit scheduled with Team Alex for June 15th",
    "parent_table_name": "orders",
    "root_record_id": "550e8400-e29b-41d4-a716-446655440000", 
    "severity": "normal",
    "changed_by": "Planning Team (Automated)",
    "business_context": {
        "team_name": "Team Alex",
        "team_lead": "Alex van der Berg",
        "scheduled_date": "2025-06-15",
        "time_slot": "09:00-17:00",
        "customer_notified": true,
        "calendar_blocked": true
    }
}
```

#### **6. 📞 Customer Communication (2025-06-03 11:30)**
```json
{
    "table_name": "communication_messages",
    "action": "create",
    "entity_display_name": "Email: Installation Confirmation",
    "change_summary": "Installation confirmation email sent to customer",
    "parent_table_name": "communication_threads",
    "root_record_id": "550e8400-e29b-41d4-a716-446655440000",
    "severity": "low",
    "changed_by": "System (Automated Email)",
    "business_context": {
        "message_type": "installation_confirmation",
        "recipient": "jan.janssen@tesla.com",
        "template_used": "installation_confirmation_nl",
        "delivery_status": "delivered"
    }
}
```

#### **7. 🔧 Work Order Created (2025-06-15 08:30)**
```json
{
    "table_name": "work_orders",
    "action": "create",
    "entity_display_name": "Work Order #WO-2025-5678",
    "change_summary": "Work order created for installation visit",
    "parent_table_name": "visits",
    "root_record_id": "550e8400-e29b-41d4-a716-446655440000",
    "severity": "normal", 
    "changed_by": "Alex van der Berg (Technician)",
    "business_context": {
        "work_order_type": "installation",
        "technician_team": "Team Alex",
        "materials_verified": false,
        "lmra_status": "pending"
    }
}
```

#### **8. ✅ LMRA Safety Check Approved (2025-06-15 09:15)**
```json
{
    "table_name": "work_orders",
    "action": "update",
    "entity_display_name": "Work Order #WO-2025-5678 - LMRA Approved",
    "change_summary": "LMRA safety assessment completed and approved",
    "old_values": {"work_order_status": "lmra_pending"},
    "new_values": {"work_order_status": "lmra_approved"},
    "parent_table_name": "visits",
    "root_record_id": "550e8400-e29b-41d4-a716-446655440000",
    "severity": "high",
    "changed_by": "Alex van der Berg (Technician)",
    "business_context": {
        "safety_checks_passed": 4,
        "electrical_safety": true,
        "workspace_safe": true,
        "equipment_verified": true,
        "emergency_procedures": true,
        "next_step": "materials_verification"
    }
}
```

#### **9. 📦 Materials Verified (2025-06-15 09:30)**
```json
{
    "table_name": "work_orders",
    "action": "update", 
    "entity_display_name": "Work Order #WO-2025-5678 - Materials Ready",
    "change_summary": "All installation materials verified and ready",
    "old_values": {"work_order_status": "lmra_approved"},
    "new_values": {"work_order_status": "materials_verified"},
    "severity": "normal",
    "changed_by": "Alex van der Berg (Technician)",
    "business_context": {
        "materials_count": 8,
        "wallboxes_verified": 3,
        "cables_verified": 3,
        "mounting_hardware": true,
        "seals_available": 6
    }
}
```

#### **10. 🔧 Installation In Progress (2025-06-15 10:00)**
```json
{
    "table_name": "work_orders",
    "action": "update",
    "entity_display_name": "Work Order #WO-2025-5678 - Installation Started",
    "change_summary": "Installation work has started",
    "old_values": {"work_order_status": "materials_verified"},
    "new_values": {"work_order_status": "work_in_progress"},
    "severity": "normal",
    "changed_by": "Alex van der Berg (Technician)",
    "business_context": {
        "estimated_completion": "15:30",
        "current_phase": "electrical_connection",
        "wallboxes_installed": 0,
        "total_wallboxes": 3
    }
}
```

#### **11. 📸 Installation Photos (2025-06-15 15:00)**
```json
{
    "table_name": "documents",
    "action": "create",
    "entity_display_name": "Installation Photos (8 photos)",
    "change_summary": "Installation photos uploaded for quality verification",
    "parent_table_name": "work_orders",
    "root_record_id": "550e8400-e29b-41d4-a716-446655440000",
    "severity": "normal",
    "changed_by": "Alex van der Berg (Technician)",
    "business_context": {
        "photo_count": 8,
        "document_type": "installation_photo",
        "file_size_mb": 24.5,
        "customer_visible": true,
        "quality_verified": true
    }
}
```

#### **12. ✅ Installation Completed (2025-06-15 15:30)**
```json
{
    "table_name": "work_orders",
    "action": "update",
    "entity_display_name": "Work Order #WO-2025-5678 - Installation Complete",
    "change_summary": "Installation completed successfully - awaiting customer signature",
    "old_values": {"work_order_status": "work_in_progress"},
    "new_values": {"work_order_status": "work_completed"},
    "severity": "high",
    "changed_by": "Alex van der Berg (Technician)",
    "business_context": {
        "wallboxes_installed": 3,
        "installation_duration_hours": 5.5,
        "tests_passed": true,
        "customer_walkthrough": true,
        "next_step": "customer_signature"
    }
}
```

#### **13. ✍️ Customer Signature (2025-06-15 16:00)**
```json
{
    "table_name": "sign_offs",
    "action": "create",
    "entity_display_name": "Customer Signature - Installation Complete",
    "change_summary": "Customer signed off on completed installation",
    "parent_table_name": "work_orders",
    "root_record_id": "550e8400-e29b-41d4-a716-446655440000",
    "severity": "high",
    "changed_by": "Jan Janssen (Customer)",
    "business_context": {
        "customer_name": "Jan Janssen",
        "satisfaction_rating": 5,
        "installation_photos": 8,
        "warranty_activated": true,
        "signature_method": "tablet",
        "completion_certificate": true
    }
}
```

#### **14. 🔄 Order Status: Completed (2025-06-15 16:15)**
```json
{
    "table_name": "orders",
    "action": "status_change",
    "entity_display_name": "Order #CC-2025-001234",
    "change_summary": "Order completed successfully - customer satisfied",
    "old_values": {"order_status": "in_progress"},
    "new_values": {"order_status": "completed"},
    "severity": "high",
    "changed_by": "System (Automated)",
    "business_context": {
        "completion_date": "2025-06-15",
        "customer_satisfaction": 5,
        "installation_photos": 8,
        "warranty_period_years": 2,
        "follow_up_scheduled": false,
        "invoice_ready": true
    }
}
```

#### **15. 💰 Invoice Generated (2025-06-15 17:00)**
```json
{
    "table_name": "invoices",
    "action": "create",
    "entity_display_name": "Invoice #INV-2025-9012",
    "change_summary": "Final invoice generated and sent to customer",
    "parent_table_name": "orders",
    "root_record_id": "550e8400-e29b-41d4-a716-446655440000",
    "severity": "normal",
    "changed_by": "System (Automated)",
    "business_context": {
        "invoice_amount": 1650.00,
        "due_date": "2025-07-15",
        "payment_terms": "net_30",
        "sent_to": "finance@tesla.com",
        "external_reference": "MB-2025-5678"
    }
}
```

---

## 📱 **UI IMPLEMENTATIE VOORBEELDEN**

### **1. Order Detail Page - Activity Feed Tab**
```jsx
function OrderActivityFeed({ orderId }) {
    const [activities, setActivities] = useState([]);
    const [filter, setFilter] = useState('all');
    
    // Real-time activity updates
    useEffect(() => {
        const ws = new WebSocket(`wss://api.chargecars.nl/ws/activities/${orderId}`);
        ws.onmessage = (event) => {
            const newActivity = JSON.parse(event.data);
            setActivities(prev => [newActivity, ...prev]);
            
            // Show real-time notification
            showToast(newActivity.change_summary, newActivity.severity);
        };
        return () => ws.close();
    }, [orderId]);
    
    return (
        <div className="activity-feed">
            <div className="activity-filters">
                <button onClick={() => setFilter('all')}>All Activities</button>
                <button onClick={() => setFilter('status_changes')}>Status Changes</button>
                <button onClick={() => setFilter('customer_interactions')}>Customer</button>
                <button onClick={() => setFilter('technician_actions')}>Technician</button>
            </div>
            
            <div className="activity-timeline">
                {activities.map(activity => (
                    <ActivityItem key={activity.id} activity={activity} />
                ))}
            </div>
        </div>
    );
}
```

### **2. Visit Detail Page - Activity Sidebar**
```jsx
function VisitActivitySidebar({ visitId }) {
    return (
        <div className="activity-sidebar">
            <h3>Visit Activity</h3>
            <div className="activity-stream">
                {/* Only visit-specific activities */}
                <ActivityFeed 
                    entityType="visits" 
                    entityId={visitId} 
                    showHierarchical={true}
                    maxItems={20}
                />
            </div>
        </div>
    );
}
```

### **3. Quote Detail Page - Activity Timeline**
```jsx
function QuoteActivityTimeline({ quoteId }) {
    return (
        <div className="activity-timeline-horizontal">
            <h3>Quote Progress</h3>
            <div className="timeline-steps">
                <TimelineStep 
                    icon="📝" 
                    title="Quote Created"
                    timestamp="2025-05-31 10:30"
                    status="completed"
                />
                <TimelineStep 
                    icon="📧" 
                    title="Sent to Customer"
                    timestamp="2025-05-31 10:35"
                    status="completed"
                />
                <TimelineStep 
                    icon="✅" 
                    title="Customer Approved"
                    timestamp="2025-06-02 14:20" 
                    status="completed"
                />
                <TimelineStep 
                    icon="📅" 
                    title="Installation Scheduled"
                    timestamp="2025-06-02 15:45"
                    status="completed"
                />
            </div>
        </div>
    );
}
```

---

## 🔍 **SPECIFIC ENTITY ACTIVITY FEEDS**

### **Visit Detail Page - Filtered Activities**
```sql
-- Only activities related to this specific visit
SELECT al.*, c.first_name, c.last_name 
FROM audit_logs al
LEFT JOIN contacts c ON al.changed_by_contact_id = c.id
WHERE (
    -- Direct visit changes
    (al.table_name = 'visits' AND al.record_id = '{visit_id}')
    OR
    -- Work orders for this visit
    (al.table_name = 'work_orders' AND al.parent_record_id = '{visit_id}')
    OR
    -- Sign-offs for work orders of this visit
    (al.table_name = 'sign_offs' AND al.parent_table_name = 'work_orders' 
     AND al.parent_record_id IN (
         SELECT id FROM work_orders WHERE visit_id = '{visit_id}'
     ))
)
ORDER BY al.created_at DESC;
```

### **Quote Detail Page - Quote Lifecycle**
```sql
-- Quote-specific activity feed
SELECT al.*, c.first_name, c.last_name 
FROM audit_logs al
LEFT JOIN contacts c ON al.changed_by_contact_id = c.id
WHERE (
    -- Direct quote changes
    (al.table_name = 'quotes' AND al.record_id = '{quote_id}')
    OR
    -- Line items specific to this quote
    (al.table_name = 'line_items' AND al.record_id IN (
        SELECT id FROM line_items WHERE quote_id = '{quote_id}'
    ))
    OR
    -- Communications about this quote
    (al.table_name = 'communication_messages' AND al.business_context->>'quote_id' = '{quote_id}')
)
ORDER BY al.created_at DESC;
```

---

## 🎨 **ACTIVITY FEED STYLING**

### **Activity Item Components**
```jsx
function ActivityItem({ activity }) {
    const getActivityIcon = (tableName, action) => {
        const icons = {
            'orders': { 'create': '📝', 'status_change': '🔄', 'update': '✏️' },
            'visits': { 'create': '📅', 'update': '🔧' },
            'work_orders': { 'create': '🔧', 'update': '⚙️' },
            'sign_offs': { 'create': '✍️' },
            'documents': { 'create': '📸' },
            'invoices': { 'create': '💰' },
            'payments': { 'create': '💳' }
        };
        return icons[tableName]?.[action] || '📋';
    };
    
    const getSeverityColor = (severity) => {
        switch(severity) {
            case 'critical': return '#dc2626';
            case 'high': return '#ea580c';
            case 'normal': return '#0369a1';
            case 'low': return '#6b7280';
        }
    };
    
    return (
        <div className="activity-item">
            <div className="activity-icon">
                {getActivityIcon(activity.table_name, activity.action)}
            </div>
            <div className="activity-content">
                <div className="activity-header">
                    <span 
                        className="activity-title"
                        style={{ color: getSeverityColor(activity.severity) }}
                    >
                        {activity.entity_display_name}
                    </span>
                    <span className="activity-timestamp">
                        {formatTimestamp(activity.created_at)}
                    </span>
                </div>
                <div className="activity-summary">
                    {activity.change_summary}
                </div>
                <div className="activity-author">
                    by {activity.changed_by_name}
                </div>
                {activity.business_context && (
                    <div className="activity-context">
                        <BusinessContextDisplay context={activity.business_context} />
                    </div>
                )}
            </div>
        </div>
    );
}
```

---

## 🚀 **IMPLEMENTATIE CHECKLIST**

### **Database Level** ✅
- [x] audit_logs tabel met hierarchical fields
- [x] audit_entity_relationships tabel
- [x] Indexes op root_record_id, table_name, created_at

### **Backend Level** 
- [ ] Audit log creation functions
- [ ] Hierarchical context resolution
- [ ] Real-time WebSocket implementation
- [ ] Activity feed API endpoints

### **Frontend Level**
- [ ] ActivityFeed React components
- [ ] Real-time updates via WebSocket
- [ ] Activity filtering and search
- [ ] Mobile-responsive activity timeline

### **Business Logic**
- [ ] Smart change summaries generation
- [ ] Business context enrichment
- [ ] User permission-based filtering
- [ ] Performance optimization voor large datasets

---

**Met deze implementatie krijgt elke single record page in ChargeCars V2 een complete, real-time activity feed die transparantie geeft over alle wijzigingen en een perfecte audit trail biedt! 🎯** 