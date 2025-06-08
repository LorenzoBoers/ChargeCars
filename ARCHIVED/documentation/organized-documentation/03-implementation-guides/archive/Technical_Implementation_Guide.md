# ChargeCars V2 - Technical Implementation Guide
**Complete technische implementatie gids voor developers**

---

## 🏗️ **SYSTEM ARCHITECTURE OVERVIEW**

### **Technology Stack**
- **Database**: Xano (No-code backend met PostgreSQL)
- **API Layer**: Xano REST APIs + Custom endpoints
- **Automation**: Make.com scenarios (45,124+ operations) > wordt gemigreerd naar xano
- **Frontend**: React/Vue.js voor portals, React Native voor mobile
- **Real-time**: XANO WebSockets voor live updates
- **Integration**: RESTful APIs + Webhooks

---

## 📊 **DATABASE IMPLEMENTATION**

### **Complete Schema: 23 Tabellen**

#### **Core Tables Implementation Priority:**

**Priority 1: Foundation (Weken 1-2)**
```sql
✅ organizations (ID: 35) - Implemented
✅ contacts (ID: 36) - Implemented  
✅ orders (ID: 37) - Implemented
✅ articles (ID: 38) - Implemented
✅ line_items (ID: 40) - Implemented
```

**Priority 2: Operations (Weken 3-4)**
```sql
✅ visits (ID: 46) - Implemented
✅ sign_offs (ID: 47) - Implemented
✅ installation_teams (ID: 51) - Implemented
🆕 work_orders (ID: 60) - Recently implemented
```

**Priority 3: Fleet Management (Weken 5-6)**
```sql
🆕 vehicles (ID: 57) - Recently implemented
🆕 vehicle_tracking (ID: 58) - Recently implemented  
🆕 team_vehicle_assignments (ID: 59) - Recently implemented
```

### **Key Database Features**

#### **1. Work Orders Integration**
```javascript
// Work Order Status Flow
const workOrderStatuses = [
  'created',
  'lmra_pending', 
  'lmra_approved',
  'lmra_failed',
  'materials_verified',
  'work_in_progress', 
  'work_completed',
  'customer_review',
  'awaiting_signature',
  'completed'
];

// Integrated LMRA Fields
const lmraFields = {
  lmra_electrical_safety: Boolean,
  lmra_proper_equipment: Boolean,
  lmra_workspace_safe: Boolean,
  lmra_emergency_procedures: Boolean,
  lmra_risk_assessment: JSON,
  lmra_completed_at: DateTime,
  lmra_approved_by: UUID
};
```

#### **2. Fleet Tracking Integration**
```javascript
// Real-time Vehicle Data
const vehicleTrackingSchema = {
  vehicle_id: UUID,
  timestamp: DateTime,
  latitude: Decimal,
  longitude: Decimal,
  speed: Integer, // km/h
  heading: Integer, // degrees
  fuel_level: Integer, // percentage
  engine_status: Enum(['running', 'stopped', 'idle']),
  odometer_reading: Integer // km
};

// Team-Vehicle Assignment
const teamVehicleAssignment = {
  team_id: UUID,
  vehicle_id: UUID,
  assignment_start: DateTime,
  assignment_end: DateTime,
  start_mileage: Integer,
  end_mileage: Integer,
  fuel_used: Decimal
};
```

#### **3. Sign-offs Extension**
```javascript
// Extended Sign-off Types voor Work Orders
const extendedSignOffTypes = [
  'customer_approval',
  'partner_approval', 
  'technical_approval',
  'lmra_approval',           // 🆕
  'materials_verified',      // 🆕
  'installation_complete',   // 🆕
  'work_order_handover',     // 🆕
  'customer_satisfaction'    // 🆕
];
```

---

## 🔌 **API IMPLEMENTATION**

### **Core API Endpoints**

#### **Work Orders API**
```javascript
// GET /api/work_order/{id}
{
  "id": "uuid",
  "visit_id": "uuid", 
  "work_order_number": "WO-2025-001",
  "status": "lmra_approved",
  "technician_id": "uuid",
  "lmra_assessment": {
    "electrical_safety": true,
    "proper_equipment": true,
    "workspace_safe": true,
    "emergency_procedures": true,
    "risk_assessment": {...},
    "completed_at": "2025-05-31T10:30:00Z",
    "approved_by": "uuid"
  },
  "materials_list": [...],
  "seals_used": [
    {
      "seal_type": "SEAL-MB-001",
      "serial_number": "MB001-2025-0531",
      "location": "meter_box_main"
    }
  ],
  "installation_photos": [...],
  "customer_satisfaction_rating": 5
}

// POST /api/work_order/{id}/lmra
{
  "electrical_safety": true,
  "proper_equipment": true, 
  "workspace_safe": false,
  "emergency_procedures": true,
  "risk_assessment": {
    "workspace_issues": ["limited_access"],
    "mitigation_actions": ["additional_safety_equipment"]
  }
}

// POST /api/work_order/{id}/complete
{
  "completion_notes": "Installation successful",
  "customer_satisfaction_rating": 5,
  "installation_photos": [...]
}
```

#### **Fleet Management API**
```javascript
// GET /api/vehicle/tracking/live
{
  "vehicles": [
    {
      "vehicle_id": "uuid",
      "license_plate": "V-196-RP", 
      "current_location": {
        "latitude": 52.2297,
        "longitude": 5.4098
      },
      "status": "active",
      "team_assignment": {
        "team_id": "uuid",
        "team_name": "Team Citan Alex"
      },
      "last_update": "2025-05-31T10:30:00Z"
    }
  ]
}

// POST /api/vehicle/{id}/tracking
{
  "latitude": 52.2297,
  "longitude": 5.4098,
  "speed": 45,
  "heading": 180,
  "fuel_level": 75,
  "engine_status": "running",
  "odometer_reading": 125430
}
```

#### **Partner Integration API**
```javascript
// POST /api/partners/leads (Partner API)
{
  "partner_id": "uuid",
  "customer_data": {
    "email": "customer@example.com", // Required
    "name": "John Doe",              // Required  
    "phone": "+31612345678",         // Optional
    "address": {                     // Optional
      "street": "Hoofdstraat 123",
      "city": "Amsterdam", 
      "postal_code": "1012AB"
    }
  },
  "lead_source": "website_form",
  "business_entity": "chargecars"
}

// Response
{
  "lead_id": "uuid",
  "status": "accepted",
  "lead_score": 85,
  "routing_decision": "chargecars",
  "estimated_processing_time": "2-4 hours"
}
```

### **Real-time Integration**

#### **WebSocket Events**
```javascript
// Work Order Status Updates
{
  "event": "work_order_status_changed",
  "data": {
    "work_order_id": "uuid",
    "old_status": "lmra_pending",
    "new_status": "lmra_approved", 
    "timestamp": "2025-05-31T10:30:00Z",
    "technician_id": "uuid"
  }
}

// Vehicle Location Updates
{
  "event": "vehicle_location_updated",
  "data": {
    "vehicle_id": "uuid",
    "license_plate": "V-196-RP",
    "location": {
      "latitude": 52.2297,
      "longitude": 5.4098
    },
    "timestamp": "2025-05-31T10:30:15Z"
  }
}

// Visit Status Updates  
{
  "event": "visit_status_changed",
  "data": {
    "visit_id": "uuid",
    "order_id": "uuid",
    "old_status": "scheduled",
    "new_status": "in_progress",
    "team_id": "uuid"
  }
}
```

---

## 📱 **MOBILE APP IMPLEMENTATION**

### **React Native Architecture**

#### **Core Components**
```jsx
// WorkOrderScreen.jsx
import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';

const WorkOrderScreen = ({ workOrderId }) => {
  const [workOrder, setWorkOrder] = useState(null);
  const [lmraStatus, setLmraStatus] = useState('pending');
  
  const handleLMRASubmit = async (lmraData) => {
    try {
      const response = await api.post(
        `/work_order/${workOrderId}/lmra`, 
        lmraData
      );
      
      if (response.data.approved) {
        setLmraStatus('approved');
        // Proceed to materials verification
      } else {
        setLmraStatus('failed');
        Alert.alert('LMRA Failed', 'Please address safety issues');
      }
    } catch (error) {
      console.error('LMRA submission failed:', error);
    }
  };

  return (
    <ScrollView>
      <LMRAComponent 
        onSubmit={handleLMRASubmit}
        status={lmraStatus}
      />
      <MaterialsComponent workOrderId={workOrderId} />
      <InstallationComponent workOrderId={workOrderId} />
      <CustomerSignatureComponent workOrderId={workOrderId} />
    </ScrollView>
  );
};
```

#### **Offline Capability**
```javascript
// OfflineStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

class OfflineStorage {
  static async saveWorkOrder(workOrderId, data) {
    const key = `work_order_${workOrderId}`;
    await AsyncStorage.setItem(key, JSON.stringify(data));
  }
  
  static async getOfflineWorkOrders() {
    const keys = await AsyncStorage.getAllKeys();
    const workOrderKeys = keys.filter(key => 
      key.startsWith('work_order_')
    );
    
    const workOrders = await AsyncStorage.multiGet(workOrderKeys);
    return workOrders.map(([key, value]) => JSON.parse(value));
  }
  
  static async syncOfflineData() {
    const offlineWorkOrders = await this.getOfflineWorkOrders();
    
    for (const workOrder of offlineWorkOrders) {
      try {
        await api.put(`/work_order/${workOrder.id}`, workOrder);
        await AsyncStorage.removeItem(`work_order_${workOrder.id}`);
      } catch (error) {
        console.log('Sync failed for work order:', workOrder.id);
      }
    }
  }
}
```

### **Camera & Document Capture**
```javascript
// PhotoCapture.jsx
import { Camera } from 'expo-camera';

const PhotoCapture = ({ onPhotoCapture, photoType }) => {
  const [hasPermission, setHasPermission] = useState(null);
  
  const takePicture = async () => {
    const photo = await camera.takePictureAsync({
      quality: 0.8,
      base64: true,
      exif: true
    });
    
    const photoData = {
      uri: photo.uri,
      base64: photo.base64,
      timestamp: new Date().toISOString(),
      type: photoType, // 'before_installation', 'during_work', 'completed'
      location: await Location.getCurrentPositionAsync()
    };
    
    onPhotoCapture(photoData);
  };
  
  return (
    <Camera ref={ref => camera = ref} style={styles.camera}>
      <TouchableOpacity onPress={takePicture}>
        <Text>Capture Photo</Text>
      </TouchableOpacity>
    </Camera>
  );
};
```

---

## 🔄 **AUTOMATION IMPLEMENTATION**

### **Make.com Scenario Optimization**

#### **Current Scenarios (37 active, 45,124 operations)**

**High Volume Scenarios:**
1. **Address Validation** (12,449 ops) - Google Maps API
2. **HubSpot-Smartsuite Sync** (8,203 ops) - Data synchronization  
3. **Email Processing** (4,848 ops) - AI processing
4. **Token Generation** (3,686 ops) - Authentication
5. **Partner Integration** (3,254 ops) - Lead processing

#### **Optimization Strategies**

**1. API Rate Limiting**
```javascript
// Rate limiting voor Smartsuite API (23/37 scenarios gebruiken dit)
const rateLimiter = {
  maxRequestsPerMinute: 100,
  currentRequests: 0,
  resetTime: Date.now() + 60000,
  
  async makeRequest(apiCall) {
    if (this.currentRequests >= this.maxRequestsPerMinute) {
      const waitTime = this.resetTime - Date.now();
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.currentRequests = 0;
      this.resetTime = Date.now() + 60000;
    }
    
    this.currentRequests++;
    return await apiCall();
  }
};
```

**2. Webhook Reliability (91.9% usage)**
```javascript
// Webhook retry mechanism
const webhookHandler = {
  async processWebhook(payload, retryCount = 0) {
    const maxRetries = 3;
    
    try {
      await this.processPayload(payload);
    } catch (error) {
      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        setTimeout(() => {
          this.processWebhook(payload, retryCount + 1);
        }, delay);
      } else {
        // Log to error queue for manual review
        await this.logFailedWebhook(payload, error);
      }
    }
  }
};
```

#### **New Automation Scenarios**

**Work Order Automation**
```javascript
// Scenario: Work Order Status Automation
{
  "trigger": "work_order_status_changed",
  "conditions": [
    {
      "field": "status", 
      "operator": "equals",
      "value": "completed"
    }
  ],
  "actions": [
    {
      "type": "update_visit_status",
      "status": "completed"
    },
    {
      "type": "trigger_invoice_generation", 
      "delay": "1_hour"
    },
    {
      "type": "send_customer_satisfaction_survey"
    },
    {
      "type": "update_partner_dashboard"
    }
  ]
}
```

**Fleet Tracking Automation**
```javascript
// Scenario: Vehicle Geofence Alerts
{
  "trigger": "vehicle_location_updated",
  "conditions": [
    {
      "field": "location",
      "operator": "outside_geofence", 
      "value": "service_area"
    }
  ],
  "actions": [
    {
      "type": "alert_operations_manager",
      "urgency": "medium"
    },
    {
      "type": "log_geofence_violation"
    }
  ]
}
```

---

## 🔐 **SECURITY & COMPLIANCE**

### **Authentication & Authorization**
```javascript
// JWT Token Structure
const jwtPayload = {
  user_id: "uuid",
  contact_id: "uuid", 
  organization_id: "uuid",
  access_level: "partner_admin", // global_admin, partner_admin, sales_agent, read_only
  portal_role: "dealer_manager",
  permissions: [
    "read_orders",
    "write_work_orders", 
    "read_partner_data"
  ],
  business_entities: ["chargecars", "laderthuis"],
  exp: 1672531200
};

// Permission Check Middleware
const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    const userPermissions = req.user.permissions;
    
    if (userPermissions.includes(requiredPermission) || 
        userPermissions.includes('admin_all')) {
      next();
    } else {
      res.status(403).json({ error: 'Insufficient permissions' });
    }
  };
};
```

### **Data Privacy (GDPR Compliance)**
```javascript
// Data Anonymization for Analytics
const anonymizeCustomerData = (customerData) => {
  return {
    ...customerData,
    email: hashEmail(customerData.email),
    phone: null,
    name: null,
    address: {
      postal_code: customerData.address.postal_code.substring(0, 4), // Keep first 4 digits
      city: customerData.address.city,
      street: null
    }
  };
};

// Data Retention Policy
const dataRetentionPolicy = {
  customer_data: "7_years",     // Legal requirement
  work_orders: "10_years",      // Safety compliance
  vehicle_tracking: "2_years",  // Operational needs
  analytics_data: "3_years"     // Business insights
};
```

---

## 📊 **MONITORING & ANALYTICS**

### **Performance Monitoring**
```javascript
// API Performance Tracking
const performanceMonitor = {
  trackAPICall: (endpoint, duration, status) => {
    const metric = {
      endpoint,
      duration,
      status,
      timestamp: new Date().toISOString()
    };
    
    // Send to analytics service
    analytics.track('api_performance', metric);
    
    // Alert if duration > threshold
    if (duration > 1000) { // 1 second threshold
      alerts.send('slow_api_response', metric);
    }
  }
};

// Business Metrics Tracking  
const businessMetrics = {
  trackWorkOrderCompletion: (workOrder) => {
    const metric = {
      work_order_id: workOrder.id,
      completion_time: workOrder.completed_at - workOrder.created_at,
      customer_satisfaction: workOrder.customer_satisfaction_rating,
      lmra_compliance: workOrder.lmra_approved,
      technician_id: workOrder.technician_id
    };
    
    analytics.track('work_order_completed', metric);
  }
};
```

### **Error Handling & Logging**
```javascript
// Centralized Error Handler
const errorHandler = {
  logError: (error, context) => {
    const errorLog = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      severity: this.determineSeverity(error)
    };
    
    // Log to monitoring service
    logger.error(errorLog);
    
    // Send alert voor critical errors
    if (errorLog.severity === 'critical') {
      alerts.send('critical_error', errorLog);
    }
  },
  
  determineSeverity: (error) => {
    if (error.message.includes('database') || 
        error.message.includes('payment')) {
      return 'critical';
    } else if (error.message.includes('api')) {
      return 'high';
    }
    return 'medium';
  }
};
```

---

## 🚀 **DEPLOYMENT & SCALING**

### **Infrastructure Requirements**
```yaml
# Docker Compose voor local development
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:8000
  
  mobile_backend:
    build: ./mobile-backend  
    ports:
      - "8000:8000"
    environment:
      - XANO_API_URL=${XANO_API_URL}
      - XANO_API_KEY=${XANO_API_KEY}
  
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
```

### **Performance Optimization**
```javascript
// Caching Strategy
const cacheConfig = {
  // Static data - long cache
  articles: { ttl: 3600 },      // 1 hour
  organizations: { ttl: 1800 }, // 30 minutes
  
  // Dynamic data - short cache  
  work_orders: { ttl: 300 },    // 5 minutes
  vehicle_tracking: { ttl: 60 }, // 1 minute
  
  // Real-time data - no cache
  live_tracking: { ttl: 0 }
};

// Database Query Optimization
const optimizedQueries = {
  getWorkOrdersForTeam: `
    SELECT wo.*, v.scheduled_date, o.customer_organization_id
    FROM work_orders wo
    JOIN visits v ON wo.visit_id = v.id  
    JOIN orders o ON v.order_id = o.id
    WHERE v.team_id = $1 
    AND wo.status IN ('lmra_approved', 'materials_verified', 'work_in_progress')
    ORDER BY v.scheduled_date ASC
  `
};
```

---

## 📋 **IMPLEMENTATION CHECKLIST**

### **Phase 1: Foundation (Weken 1-4)**
- [ ] Database schema implementatie (23 tabellen)
- [ ] Core API endpoints development
- [ ] Basic mobile app framework
- [ ] Authentication & authorization system
- [ ] Work order system integration

### **Phase 2: Operations (Weken 5-8)**  
- [ ] Fleet management system
- [ ] Real-time tracking implementation
- [ ] Partner portal development
- [ ] Operations dashboard
- [ ] Mobile app completion

### **Phase 3: Integration (Weken 9-12)**
- [ ] Make.com scenario optimization
- [ ] Advanced analytics implementation  
- [ ] Performance monitoring setup
- [ ] Security audit & compliance
- [ ] Production deployment

---

*Deze technische gids biedt complete implementatie details voor alle ChargeCars V2 platform componenten.* 