# ChargeCars V2 - Xano Manual Implementation Tasks
**Handmatige Implementatie Taken voor Backend Development**  
*Created: 1 juni 2025 | Updated with Postcode API integration*

---

## 🎯 **OVERVIEW: MANUAL XANO TASKS**

**Frontend**: ✅ TaskMaster AI bouwt de React frontend  
**Backend**: ❌ Handmatige Xano functions & API endpoints implementatie vereist

---

## 🗄️ **DATABASE TASKS** 

### **✅ VOLTOOID: Database Schema**
- [x] addresses table enhanced (Table ID: 73)
- [x] address_validations table created (Table ID: 91) 
- [x] team_locations table created (Table ID: 92)
- [x] Alle indexen en relaties geconfigureerd

---

## 🔧 **XANO FUNCTIONS - TODO**

### **🚨 PRIORITY 1: Address Validation Functions**

#### **Function: validateDutchAddress**
**Status**: ❌ MOET HANDMATIG GEÏMPLEMENTEERD

**Locatie**: Xano Functions → Create New Function  
**Function Name**: `validateDutchAddress`

**Input Parameters**:
```javascript
{
  postal_code: "1012AB",
  house_number: "123", 
  house_number_addition: "A"
}
```

**Implementation Steps**:
1. **Postcode API Call** (Primary - Nederlandse BAG Data):
   ```javascript
   // URL: https://api.postcodeapi.nu/v3/lookup/{postcode}/{huisnummer}
   // Example: https://api.postcodeapi.nu/v3/lookup/1012AB/123
   // Headers: X-Api-Key: gqP9hOZvsZ1hPCvR4XzDa8WVS2xjtuBNeZsH56g6
   // Response: street, city, municipality, province, coordinates
   ```

2. **Google Geocoding** (Fallback):
   ```javascript
   // URL: https://maps.googleapis.com/maps/api/geocode/json
   // Query: house_number + postal_code + ", Netherlands"
   // Key: GOOGLE_MAPS_API_KEY_BACKEND
   ```

3. **Database Logging**:
   - Create record in `address_validations` table
   - Update `address` table with validation results

**Expected Output**:
```javascript
{
  valid: true,
  source: "PostcodeAPI",
  formatted_address: "Keizersgracht 123A, 1012 AB Amsterdam",
  coordinates: { latitude: 52.3676, longitude: 4.9041 },
  confidence: "high",
  validation_id: "uuid"
}
```

**Example Postcode API Response**:
```javascript
{
  "postcode": "1012AB",
  "number": 123,
  "street": "Keizersgracht",
  "city": "Amsterdam",
  "municipality": "Amsterdam", 
  "province": "Noord-Holland",
  "location": {
    "type": "Point",
    "coordinates": [4.9041, 52.3676]  // [longitude, latitude]
  }
}
```

---

#### **Function: batchGeocodeAddresses**
**Status**: ❌ MOET HANDMATIG GEÏMPLEMENTEERD

**Function Name**: `batchGeocodeAddresses`

**Purpose**: Batch verwerking van meerdere adressen tegelijk

**Input Parameters**:
```javascript
{
  addresses: [
    { id: "addr_1", postal_code: "1012AB", house_number: "123" },
    { id: "addr_2", postal_code: "2585HV", house_number: "456" }
  ]
}
```

**Implementation**: Loop door addresses array, call validateDutchAddress per item

---

### **🚨 PRIORITY 2: Team Location Functions**

#### **Function: updateTeamLocation**
**Status**: ❌ MOET HANDMATIG GEÏMPLEMENTEERD

**Function Name**: `updateTeamLocation`

**Purpose**: Real-time team locatie updates van mobile apps

**Input Parameters**:
```javascript
{
  team_id: "uuid",
  coordinates: { latitude: 52.3676, longitude: 4.9041 },
  team_status: "travelling",
  speed_kmh: 45,
  battery_level: 85
}
```

**Implementation**:
1. Update `team_locations` table met nieuwe coordinaten
2. Set `updated_at` timestamp
3. Trigger real-time notification naar frontend

---

#### **Function: getActiveTeamLocations**
**Status**: ❌ MOET HANDMATIG GEÏMPLEMENTEERD

**Function Name**: `getActiveTeamLocations`

**Purpose**: Ophalen van alle actieve team locaties voor dashboard

**Input Parameters**:
```javascript
{
  business_entity_id: "uuid",
  active_only: true
}
```

**Implementation**:
1. Query `team_locations` JOIN `installation_team`
2. Filter op business_entity_id en is_active
3. Return team info + current coordinates + visit details

---

### **🚨 PRIORITY 3: Route Optimization Functions**

#### **Function: calculateOptimalRoutes**
**Status**: ❌ MOET HANDMATIG GEÏMPLEMENTEERD

**Function Name**: `calculateOptimalRoutes`

**Purpose**: Route optimization voor daily scheduling

**Input Parameters**:
```javascript
{
  date: "2025-06-02",
  teams: ["team_uuid_1", "team_uuid_2"],
  visits: ["visit_uuid_1", "visit_uuid_2"],
  constraints: {
    max_driving_time: 480,
    skill_requirements: true
  }
}
```

**Implementation**:
1. Get team skills en availability
2. Get visit addresses en required skills
3. Call Google Distance Matrix API
4. Apply optimization algorithm
5. Return optimized schedule

---

## 📡 **API ENDPOINTS - TODO**

### **🚨 PRIORITY 1: Address Validation Endpoints**

#### **POST /api/address/validate**
**Status**: ❌ MOET HANDMATIG GECONFIGUREERD

**Configuration**:
- **Method**: POST
- **Authentication**: Required (JWT)
- **Function**: validateDutchAddress
- **Rate Limit**: 100 requests/minute per user

**Request Body**:
```json
{
  "postal_code": "1012AB",
  "house_number": "123",
  "house_number_addition": "A"
}
```

---

#### **POST /api/geocoding/batch-coordinates**
**Status**: ❌ MOET HANDMATIG GECONFIGUREERD

**Configuration**:
- **Method**: POST
- **Authentication**: Required (Admin role)
- **Function**: batchGeocodeAddresses
- **Rate Limit**: 10 requests/minute per user

---

### **🚨 PRIORITY 2: Team Tracking Endpoints**

#### **GET /api/maps/team-locations**
**Status**: ❌ MOET HANDMATIG GECONFIGUREERD

**Configuration**:
- **Method**: GET
- **Authentication**: Required (Manager+ role)
- **Function**: getActiveTeamLocations
- **Real-time**: Enable WebSocket updates

**Query Parameters**:
- business_entity_id (required)
- active_only (optional, default: true)

---

#### **POST /api/teams/location-update**
**Status**: ❌ MOET HANDMATIG GECONFIGUREERD

**Configuration**:
- **Method**: POST
- **Authentication**: Required (Technician role)
- **Function**: updateTeamLocation
- **Rate Limit**: 120 requests/hour per team

---

### **🚨 PRIORITY 3: Route Optimization Endpoints**

#### **POST /api/route-optimization/calculate**
**Status**: ❌ MOET HANDMATIG GECONFIGUREERD

**Configuration**:
- **Method**: POST
- **Authentication**: Required (Manager+ role)
- **Function**: calculateOptimalRoutes
- **Timeout**: 30 seconds (complex calculations)

---

## 🔑 **ENVIRONMENT CONFIGURATION - TODO**

### **Environment Variables in Xano**

#### **Google Maps API Keys**
**Status**: ❌ MOET HANDMATIG TOEGEVOEGD

**In Xano Environment Settings toevoegen**:
```javascript
// Nederlandse Adres Validatie (Primary)
POSTCODE_API_KEY = "gqP9hOZvsZ1hPCvR4XzDa8WVS2xjtuBNeZsH56g6"
POSTCODE_API_BASE_URL = "https://api.postcodeapi.nu/v3/lookup"

// Google Maps (Fallback & Geocoding)
GOOGLE_MAPS_API_KEY_BACKEND = "AIzaSyC..." // Server IP restricted
GOOGLE_GEOCODING_API_KEY = "AIzaSyD..."    // Geocoding only
```

#### **Rate Limiting Configuration**
**Status**: ❌ MOET HANDMATIG GECONFIGUREERD

**In Xano Rate Limits**:
- Address validation: 100/minute per user
- Team location updates: 120/hour per team
- Route optimization: 5/minute per user
- Batch operations: 10/minute per user

---

## 🧪 **TESTING TASKS - TODO**

### **Function Testing in Xano**

#### **Address Validation Testing**
**Status**: ❌ MOET HANDMATIG GETEST

**Test Cases**:
1. **Valid Dutch Address**: "1012AB", "123" → Should return Postcode API data
2. **Invalid Address**: "0000XX", "999" → Should return validation error
3. **Google Fallback**: Postcode API fails → Should fallback to Google
4. **Performance**: Response time < 200ms
5. **API Key**: Verify X-Api-Key header is correctly set

#### **Team Location Testing**
**Status**: ❌ MOET HANDMATIG GETEST

**Test Cases**:
1. **Location Update**: Valid coordinates → Should update database
2. **Invalid Coordinates**: Outside Netherlands → Should reject
3. **Real-time Updates**: Location change → Frontend should update
4. **Multiple Teams**: 5+ teams → Performance should remain good

---

## 📊 **MONITORING & ANALYTICS - TODO**

### **Function Performance Monitoring**

#### **Metrics to Track**
**Status**: ❌ MOET HANDMATIG OPGEZET

**Key Metrics**:
- Address validation success rate (target: >98%)
- Average response time (target: <200ms)
- API error rates (target: <1%)
- Team location update frequency
- Route optimization calculation time

#### **Error Logging**
**Status**: ❌ MOET HANDMATIG GECONFIGUREERD

**Log Requirements**:
- Failed address validations with reason
- Google API quota usage and limits
- Team location update failures
- Performance bottlenecks

---

## 🚀 **DEPLOYMENT CHECKLIST - TODO**

### **Pre-Production Tasks**

#### **Security Configuration**
- [ ] API key restrictions configured in Google Cloud
- [ ] Rate limiting enabled on all endpoints
- [ ] HTTPS/SSL enforced on all API calls
- [ ] Input validation on all function parameters

#### **Performance Optimization**
- [ ] Database indexes created for frequent queries
- [ ] Caching strategy implemented for address validations
- [ ] API response compression enabled
- [ ] Function timeout limits configured

#### **Integration Testing**
- [ ] Frontend API integration tested
- [ ] Mobile app location updates tested
- [ ] Cross-browser compatibility verified
- [ ] Load testing completed (100+ concurrent users)

---

## 📋 **COMPLETION TRACKING**

### **Progress Overview**
- **Database Schema**: ✅ 100% Complete
- **Xano Functions**: ❌ 0% Complete (8 functions to build)
- **API Endpoints**: ❌ 0% Complete (6 endpoints to configure)
- **Environment Setup**: ❌ 0% Complete (API keys, rate limits)
- **Testing**: ❌ 0% Complete (Function testing required)
- **Monitoring**: ❌ 0% Complete (Analytics setup needed)

### **Estimated Time Investment**
- **Functions Development**: 3-4 days
- **API Configuration**: 1 day
- **Testing & Debugging**: 2 days
- **Performance Optimization**: 1 day
- **Total**: ~7-8 days development time

---

**🎯 NEXT STEPS:**
1. Start met Priority 1 functions (Address Validation)
2. Test functions in Xano playground
3. Configure API endpoints met authentication
4. Set up Google Cloud API keys
5. Test integration met frontend (TaskMaster AI builds)

---

*Xano Manual Implementation Tasks | ChargeCars V2 Backend | 1 juni 2025* 