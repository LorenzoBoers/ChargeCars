# ChargeCars V2 - Security & Access Control Implementation
**Complete Authentication, Authorization & Security Framework**  
*Created: 31 mei 2025*

---

## 🔐 **SECURITY ARCHITECTURE OVERVIEW**

### **Security Principles**
- **Zero Trust**: Never trust, always verify
- **Principle of Least Privilege**: Minimum necessary access
- **Defense in Depth**: Multiple security layers
- **Role-Based Access Control**: Granular permissions
- **Audit Everything**: Complete activity logging

### **Security Components**
```
Authentication → Authorization → Resource Access → Audit
     ↓              ↓              ↓              ↓
  JWT Tokens   →  Role Check  →  Data Filter  →  Log Action
```

---

## 👤 **ROLE-BASED ACCESS CONTROL (RBAC)**

### **User Roles Hierarchy**
```javascript
// Role definitions with inheritance
const roles = {
  "super_admin": {
    level: 100,
    inherits: ["admin"],
    description: "System administrator with full access"
  },
  "admin": {
    level: 90,
    inherits: ["manager"],
    description: "Company administrator"
  },
  "manager": {
    level: 80,
    inherits: ["technician_lead"],
    description: "Operations manager"
  },
  "technician_lead": {
    level: 70,
    inherits: ["technician"],
    description: "Team leader"
  },
  "technician": {
    level: 60,
    inherits: ["customer"],
    description: "Field technician"
  },
  "customer_service": {
    level: 50,
    inherits: ["customer"],
    description: "Customer support representative"
  },
  "customer": {
    level: 10,
    inherits: [],
    description: "Customer account"
  },
  "guest": {
    level: 0,
    inherits: [],
    description: "Unauthenticated user"
  }
};
```

### **Permission Matrix**
```javascript
// Resource permissions by role
const permissions = {
  // Organization management
  "organizations": {
    "super_admin": ["create", "read", "update", "delete"],
    "admin": ["create", "read", "update"],
    "manager": ["read", "update_own"],
    "customer": ["read_own"]
  },
  
  // Order management
  "orders": {
    "super_admin": ["create", "read", "update", "delete"],
    "admin": ["create", "read", "update", "delete"],
    "manager": ["create", "read", "update"],
    "technician": ["read_assigned", "update_status"],
    "customer": ["create_own", "read_own"]
  },
  
  // Contact management
  "contacts": {
    "super_admin": ["create", "read", "update", "delete"],
    "admin": ["create", "read", "update"],
    "manager": ["read", "update_team"],
    "technician": ["read_team"],
    "customer": ["read_own", "update_own"]
  },
  
  // Installation operations
  "visits": {
    "super_admin": ["create", "read", "update", "delete"],
    "admin": ["create", "read", "update"],
    "manager": ["create", "read", "update"],
    "technician": ["read_assigned", "update_assigned"],
    "customer": ["read_own"]
  },
  
  // Financial data
  "invoices": {
    "super_admin": ["create", "read", "update", "delete"],
    "admin": ["create", "read", "update"],
    "manager": ["read"],
    "customer": ["read_own"]
  },
  
  // System administration
  "audit_logs": {
    "super_admin": ["read"],
    "admin": ["read_filtered"]
  },
  
  // Communication
  "communication_messages": {
    "super_admin": ["create", "read", "update", "delete"],
    "admin": ["create", "read", "update"],
    "manager": ["create", "read"],
    "technician": ["create", "read_assigned"],
    "customer": ["create_own", "read_own"]
  }
};
```

---

## 🔑 **AUTHENTICATION SYSTEM**

### **JWT Token Structure**
```javascript
// JWT Payload Structure
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@chargecars.nl",
  "role": "technician",
  "organization_id": "org_12345",
  "contact_id": "contact_67890",
  "permissions": ["orders:read_assigned", "visits:update_assigned"],
  "session_id": "sess_abc123",
  "iat": 1735603200,      // Issued at
  "exp": 1735689600,      // Expires at (24 hours)
  "iss": "chargecars-v2", // Issuer
  "aud": "chargecars-api" // Audience
}
```

### **Token Management**
```javascript
// Xano Function: generateAccessToken
function generateAccessToken(user) {
  const permissions = calculateUserPermissions(user.role, user.organization_id);
  
  const payload = {
    user_id: user.id,
    email: user.email,
    role: user.role,
    organization_id: user.organization_id,
    contact_id: user.contact_id,
    permissions: permissions,
    session_id: generateSessionId(),
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    iss: "chargecars-v2",
    aud: "chargecars-api"
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET);
}

// Refresh token mechanism
function generateRefreshToken(user_id) {
  return {
    token: crypto.randomBytes(32).toString('hex'),
    user_id: user_id,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    created_at: new Date()
  };
}
```

### **Password Security**
```javascript
// Password policy enforcement
const passwordPolicy = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true,
  preventPersonalInfo: true,
  maxAge: 90, // days
  historyCount: 5 // prevent reuse of last 5 passwords
};

// Xano Function: validatePassword
function validatePassword(password, user) {
  const checks = {
    length: password.length >= passwordPolicy.minLength,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    notCommon: !isCommonPassword(password),
    notPersonal: !containsPersonalInfo(password, user)
  };
  
  const isValid = Object.values(checks).every(check => check);
  return { isValid, checks };
}

// Password hashing with salt
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt };
}
```

---

## 🛡️ **AUTHORIZATION MIDDLEWARE**

### **API Endpoint Protection**
```javascript
// Xano Function: authorizeRequest
function authorizeRequest(request, requiredPermission) {
  // 1. Extract and validate JWT token
  const token = extractToken(request.headers.authorization);
  if (!token) {
    return { authorized: false, error: "No token provided" };
  }
  
  // 2. Verify token signature and expiration
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return { authorized: false, error: "Invalid token" };
  }
  
  // 3. Check session validity
  const session = getActiveSession(decoded.session_id);
  if (!session || session.revoked) {
    return { authorized: false, error: "Session expired" };
  }
  
  // 4. Verify user permissions
  const hasPermission = checkPermission(decoded.permissions, requiredPermission);
  if (!hasPermission) {
    return { authorized: false, error: "Insufficient permissions" };
  }
  
  // 5. Apply data filtering based on role
  const dataFilter = getDataFilter(decoded.role, decoded.organization_id);
  
  return { 
    authorized: true, 
    user: decoded,
    dataFilter: dataFilter
  };
}

// Permission checking logic
function checkPermission(userPermissions, requiredPermission) {
  // Direct permission match
  if (userPermissions.includes(requiredPermission)) {
    return true;
  }
  
  // Wildcard permission check
  const [resource, action] = requiredPermission.split(':');
  const wildcardPermission = `${resource}:*`;
  if (userPermissions.includes(wildcardPermission)) {
    return true;
  }
  
  // Super admin override
  if (userPermissions.includes('*:*')) {
    return true;
  }
  
  return false;
}
```

### **Data Filtering by Role**
```javascript
// Xano Function: getDataFilter
function getDataFilter(role, organizationId, userId) {
  const filters = {
    "super_admin": {}, // No restrictions
    
    "admin": {
      // Can see all data for their organization
      "organization_id": organizationId
    },
    
    "manager": {
      "organization_id": organizationId,
      // Additional team-based restrictions can be added
    },
    
    "technician": {
      "organization_id": organizationId,
      // Can only see assigned visits and related data
      "$or": [
        { "assigned_technician_id": userId },
        { "installation_team.members": { "$contains": userId } }
      ]
    },
    
    "customer": {
      // Can only see their own organization's data
      "organization_id": organizationId,
      // And only their own orders/visits
      "$or": [
        { "primary_contact_id": userId },
        { "organization_id": organizationId }
      ]
    }
  };
  
  return filters[role] || filters["customer"];
}
```

---

## 🔒 **SECURITY FEATURES**

### **Multi-Factor Authentication (MFA)**
```javascript
// MFA implementation for sensitive operations
const mfaRequirements = {
  "admin": ["login", "password_change", "user_creation"],
  "super_admin": ["login", "system_config", "data_export"],
  "manager": ["financial_access", "team_management"],
  "technician": ["status_completion"], // For high-value orders
  "customer": ["payment_method_change"]
};

// TOTP (Time-based One-Time Password) setup
function setupTOTP(user) {
  const secret = crypto.randomBytes(20).toString('base32');
  const qrCodeUrl = `otpauth://totp/ChargeCars:${user.email}?secret=${secret}&issuer=ChargeCars`;
  
  // Store secret in user_accounts table
  updateUserMFASecret(user.id, secret);
  
  return { secret, qrCodeUrl };
}

// TOTP verification
function verifyTOTP(user, token) {
  const secret = getUserMFASecret(user.id);
  const timeWindow = Math.floor(Date.now() / 30000);
  
  // Check current and previous time windows for clock drift
  for (let i = -1; i <= 1; i++) {
    const expectedToken = generateTOTP(secret, timeWindow + i);
    if (expectedToken === token) {
      return true;
    }
  }
  
  return false;
}
```

### **Session Management**
```javascript
// Active session tracking
const sessionSchema = {
  id: "uuid",
  user_id: "uuid",
  token_hash: "text", // Hashed JWT for revocation
  ip_address: "text",
  user_agent: "text",
  created_at: "timestamp",
  last_activity: "timestamp",
  expires_at: "timestamp",
  revoked: "boolean",
  revoke_reason: "text"
};

// Session monitoring
function monitorSession(sessionId, request) {
  const session = getSession(sessionId);
  
  // Check for suspicious activity
  const suspiciousActivity = detectSuspiciousActivity(session, request);
  if (suspiciousActivity) {
    revokeSession(sessionId, "Suspicious activity detected");
    logSecurityEvent("suspicious_activity", {
      session_id: sessionId,
      reason: suspiciousActivity,
      ip_address: request.ip,
      user_agent: request.headers.user_agent
    });
    return false;
  }
  
  // Update last activity
  updateSessionActivity(sessionId, request.ip);
  return true;
}

// Automatic session cleanup
function cleanupExpiredSessions() {
  const expiredSessions = getExpiredSessions();
  expiredSessions.forEach(session => {
    revokeSession(session.id, "Session expired");
  });
}
```

### **Rate Limiting & DDoS Protection**
```javascript
// Rate limiting configuration
const rateLimits = {
  "login": {
    window: "15m",
    max: 5,
    skipSuccessfulRequests: false
  },
  "password_reset": {
    window: "1h", 
    max: 3,
    skipSuccessfulRequests: false
  },
  "api_general": {
    window: "1m",
    max: 100,
    skipSuccessfulRequests: true
  },
  "api_admin": {
    window: "1m",
    max: 500,
    skipSuccessfulRequests: true
  }
};

// IP-based rate limiting
function checkRateLimit(ip, endpoint, userRole = 'guest') {
  const key = `rate_limit:${ip}:${endpoint}`;
  const limit = getRateLimitForEndpoint(endpoint, userRole);
  
  const current = incrementCounter(key, limit.window);
  
  if (current > limit.max) {
    logSecurityEvent("rate_limit_exceeded", {
      ip_address: ip,
      endpoint: endpoint,
      attempts: current,
      limit: limit.max
    });
    return false;
  }
  
  return true;
}
```

---

## 📊 **AUDIT LOGGING & MONITORING**

### **Security Event Logging**
```javascript
// Security events schema
const securityEventSchema = {
  id: "uuid",
  event_type: "text", // login, logout, permission_denied, suspicious_activity
  user_id: "uuid",
  ip_address: "text",
  user_agent: "text", 
  resource_accessed: "text",
  action_attempted: "text",
  success: "boolean",
  failure_reason: "text",
  risk_score: "int", // 1-10 risk assessment
  additional_data: "object",
  timestamp: "timestamp"
};

// Comprehensive audit logging
function logSecurityEvent(eventType, data) {
  const securityEvent = {
    id: generateUUID(),
    event_type: eventType,
    user_id: data.user_id || null,
    ip_address: data.ip_address,
    user_agent: data.user_agent,
    resource_accessed: data.resource || null,
    action_attempted: data.action || null,
    success: data.success || false,
    failure_reason: data.failure_reason || null,
    risk_score: calculateRiskScore(eventType, data),
    additional_data: data.additional_data || {},
    timestamp: new Date()
  };
  
  // Store in audit_logs table
  insertSecurityEvent(securityEvent);
  
  // Real-time monitoring alerts
  if (securityEvent.risk_score >= 8) {
    sendSecurityAlert(securityEvent);
  }
}
```

### **Real-time Security Monitoring**
```javascript
// Security monitoring dashboard
function getSecurityMetrics(timeframe = '24h') {
  return {
    failed_logins: getFailedLoginCount(timeframe),
    suspicious_activities: getSuspiciousActivityCount(timeframe),
    blocked_ips: getBlockedIPCount(timeframe),
    permission_violations: getPermissionViolationCount(timeframe),
    active_sessions: getActiveSessionCount(),
    mfa_usage: getMFAUsageStats(timeframe),
    password_changes: getPasswordChangeCount(timeframe),
    api_abuse_attempts: getAPIAbuseCount(timeframe)
  };
}

// Automated security responses
function handleSecurityThreat(event) {
  const responses = {
    "brute_force_attack": () => {
      blockIP(event.ip_address, "24h");
      notifySecurityTeam("Brute force attack detected", event);
    },
    "privilege_escalation": () => {
      revokeUserSessions(event.user_id);
      lockUserAccount(event.user_id);
      notifySecurityTeam("Privilege escalation attempt", event);
    },
    "data_exfiltration": () => {
      revokeUserSessions(event.user_id);
      blockIP(event.ip_address, "72h");
      notifySecurityTeam("Data exfiltration detected", event);
    }
  };
  
  const response = responses[event.threat_type];
  if (response) {
    response();
  }
}
```

---

## 🔧 **IMPLEMENTATION IN XANO**

### **Database Schema Updates**
```sql
-- Add security fields to user_accounts table
ALTER TABLE user_accounts ADD COLUMN password_hash TEXT;
ALTER TABLE user_accounts ADD COLUMN password_salt TEXT;
ALTER TABLE user_accounts ADD COLUMN password_changed_at TIMESTAMP;
ALTER TABLE user_accounts ADD COLUMN failed_login_attempts INT DEFAULT 0;
ALTER TABLE user_accounts ADD COLUMN account_locked_until TIMESTAMP;
ALTER TABLE user_accounts ADD COLUMN mfa_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE user_accounts ADD COLUMN mfa_secret TEXT;
ALTER TABLE user_accounts ADD COLUMN last_login_at TIMESTAMP;
ALTER TABLE user_accounts ADD COLUMN last_login_ip TEXT;

-- Create user_sessions table
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_accounts(id),
  token_hash TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  last_activity TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  revoked BOOLEAN DEFAULT FALSE,
  revoke_reason TEXT
);

-- Create security_events table
CREATE TABLE security_event (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES user_accounts(id),
  ip_address TEXT,
  user_agent TEXT,
  resource_accessed TEXT,
  action_attempted TEXT,
  success BOOLEAN DEFAULT FALSE,
  failure_reason TEXT,
  risk_score INT DEFAULT 1,
  additional_data JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

### **API Endpoint Security**
```javascript
// Example: Secure order creation endpoint
POST /api/v1/order/orders
Authorization: Bearer <jwt_token>

// Xano Function: createOrder
function createOrder(request) {
  // 1. Authorize request
  const auth = authorizeRequest(request, "orders:create");
  if (!auth.authorized) {
    logSecurityEvent("permission_denied", {
      user_id: extractUserFromToken(request),
      resource: "orders",
      action: "create",
      failure_reason: auth.error,
      ip_address: request.ip
    });
    return { error: auth.error, status: 403 };
  }
  
  // 2. Validate input data
  const validation = validateOrderData(request.body);
  if (!validation.valid) {
    return { error: validation.errors, status: 400 };
  }
  
  // 3. Apply data filtering
  const filteredData = applyDataFilter(request.body, auth.dataFilter);
  
  // 4. Create order
  const order = createOrderRecord(filteredData);
  
  // 5. Log successful action
  logSecurityEvent("resource_created", {
    user_id: auth.user.user_id,
    resource: "orders",
    action: "create",
    success: true,
    additional_data: { order_id: order.id }
  });
  
  return { data: order, status: 201 };
}
```

---

## 🚀 **IMPLEMENTATION ROADMAP**

### **Phase 1: Core Authentication (Week 1)**
- [ ] JWT token system implementation
- [ ] Password hashing and validation
- [ ] Basic role-based access control
- [ ] Session management
- [ ] Login/logout endpoints

### **Phase 2: Authorization Framework (Week 1-2)**
- [ ] Permission matrix implementation
- [ ] API endpoint protection
- [ ] Data filtering by role
- [ ] Rate limiting
- [ ] Basic audit logging

### **Phase 3: Advanced Security (Week 2-3)**
- [ ] Multi-factor authentication
- [ ] Session monitoring
- [ ] Security event logging
- [ ] Real-time threat detection
- [ ] Automated security responses

### **Phase 4: Monitoring & Compliance (Week 3-4)**
- [ ] Security dashboard
- [ ] Alert system
- [ ] Compliance reporting
- [ ] Security audit tools
- [ ] Performance optimization

---

## ✅ **SECURITY CHECKLIST**

### **Authentication Security**
- [ ] Strong password policy enforced
- [ ] JWT tokens properly signed and validated
- [ ] Refresh token rotation implemented
- [ ] Session timeout configured
- [ ] MFA available for sensitive roles

### **Authorization Security**
- [ ] Role-based permissions implemented
- [ ] Data filtering by user context
- [ ] Principle of least privilege applied
- [ ] Permission inheritance working
- [ ] Resource-level access control

### **Infrastructure Security**
- [ ] Rate limiting configured
- [ ] DDoS protection active
- [ ] IP blocking capability
- [ ] Session monitoring enabled
- [ ] Automated threat response

### **Compliance & Monitoring**
- [ ] All security events logged
- [ ] Audit trails complete
- [ ] Security metrics tracked
- [ ] Alert system functional
- [ ] Regular security reviews scheduled

---

*This comprehensive security framework ensures ChargeCars V2 meets enterprise-grade security requirements with robust authentication, authorization, and monitoring capabilities.* 