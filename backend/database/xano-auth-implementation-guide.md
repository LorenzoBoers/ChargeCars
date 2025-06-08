# ChargeCars V2 - Xano Authentication Implementation Guide
**Created**: June 3, 2025  
**Status**: Implementation Guide  
**Focus**: Using Xano's built-in authentication features

---

## 🎯 **XANO AUTHENTICATION FEATURES**

Xano provides built-in authentication utilities that we should leverage:

1. **Password Hashing**: Built-in bcrypt functions
2. **JWT Support**: Native JWT generation and validation
3. **Auth Utilities**: Pre-built authentication functions
4. **Middleware**: Built-in auth middleware support

---

## 🏗️ **XANO-SPECIFIC SETUP**

### Step 1: Create User Account Table
In Xano, create table with these fields:

```yaml
Table: user_account
Fields:
  - id: uuid (auto-generated)
  - contact_id: uuid (FK to contact table)
  - email: text (unique, required)
  - password: password (Xano's password type - auto-hashes)
  - role: text (default: 'USER')
  - is_active: boolean (default: true)
  - last_login: timestamp
  - created_at: timestamp (auto)
  - updated_at: timestamp (auto)

Indexes:
  - email (unique)
  - contact_id (unique)
```

### Step 2: Use Xano's Built-in Auth Functions

#### Create Signup Function:
```yaml
Function: auth_signup
Method: POST
Path: /auth/signup
Function Stack:
  1. Input:
     - email (text, required)
     - password (text, required)
     - contact_id (uuid, required)
  
  2. Query: Get contact by ID
     - Verify contact exists
     - Verify email matches
  
  3. Query: Check if user exists
     - Find by email in user_account
     - If exists, return error
  
  4. Create Record: user_account
     - email: input.email
     - password: input.password (auto-hashed)
     - contact_id: input.contact_id
     - role: based on contact.access_level
  
  5. Generate Auth Token:
     - Use Xano's "Create Auth Token" utility
     - Include: user_id, role, contact_id, organization_id
  
  6. Return:
     - authToken
     - user object
```

#### Create Login Function:
```yaml
Function: auth_login
Method: POST
Path: /auth/login
Function Stack:
  1. Input:
     - email (text, required)
     - password (text, required)
  
  2. Query: Get user by email
     - Include contact data
     - Include organization data
  
  3. Verify Password:
     - Use Xano's "Verify Password" utility
     - Compare input.password with user.password
  
  4. Conditional: Check if active
     - If not active, return error
  
  5. Update Record: user_account
     - last_login: NOW()
  
  6. Generate Auth Token:
     - Use Xano's "Create Auth Token" utility
     - Payload:
       - user_id
       - email
       - role
       - contact_id
       - organization_id
       - exp: 24 hours
  
  7. Return:
     - authToken
     - user object
```

### Step 3: Create Auth Middleware

#### Xano Middleware Function:
```yaml
Function: auth_middleware
Type: Utility Function
Function Stack:
  1. Get Auth Token:
     - Use Xano's "Get Auth Token" from headers
  
  2. Verify Auth Token:
     - Use Xano's "Verify Auth Token" utility
     - Extract payload
  
  3. Query: Get fresh user data
     - Get user_account by ID from token
     - Include contact and organization
  
  4. Set Variables:
     - auth_user_id
     - auth_contact_id
     - auth_organization_id
     - auth_role
     - auth_permissions (based on role)
  
  5. Return: Continue or Error
```

### Step 4: Apply Middleware to Endpoints

For each protected endpoint, add as first step:
```yaml
Function Stack:
  1. Run Function: auth_middleware
  2. [Rest of your function logic]
```

---

## 🔐 **XANO AUTH TOKEN STRUCTURE**

### JWT Payload Example:
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "role": "MANAGER",
  "contact_id": "660e8400-e29b-41d4-a716-446655440001",
  "organization_id": "770e8400-e29b-41d4-a716-446655440002",
  "iat": 1701432000,
  "exp": 1701518400
}
```

### Xano Auth Utilities to Use:
1. **Create Auth Token**: Generates JWT with custom payload
2. **Verify Auth Token**: Validates and extracts JWT payload
3. **Get Auth Token**: Extracts token from Authorization header
4. **Hash Password**: For manual password operations
5. **Verify Password**: For custom password checks

---

## 🛡️ **PERMISSION CHECKING IN XANO**

### Create Permission Check Function:
```yaml
Function: check_permission
Type: Utility Function
Inputs:
  - permission (text)
  - user_role (text, optional - uses auth context)
Function Stack:
  1. Get Variables:
     - Get auth_role from context
     - Or use input user_role
  
  2. Create Variable: permissions_map
     Value: {
       "ADMIN": ["*"],
       "MANAGER": ["orders.*", "quotes.*", "users.view"],
       "USER": ["orders.view.own", "orders.create"],
       "VIEWER": ["*.view"]
     }
  
  3. Get Permissions Array:
     - permissions = permissions_map[role]
  
  4. Loop: Check each permission
     - If permission matches exactly, return true
     - If permission has wildcard, check pattern
  
  5. Return: boolean
```

### Use in Endpoints:
```yaml
Function: get_orders
Function Stack:
  1. Run Function: auth_middleware
  
  2. Run Function: check_permission
     Input: "orders.view"
     Stop on error: true
  
  3. Create Variable: base_query
     - If role = "USER": filter by created_by_contact_id
     - If role = "VIEWER": filter by created_by_contact_id
     - Else: filter by organization_id
  
  4. Query All Records: order
     - Apply base_query filters
```

---

## 🔄 **XANO-SPECIFIC BEST PRACTICES**

### 1. Use Xano's Password Field Type
- Automatically hashes passwords
- Never stores plain text
- Built-in verification

### 2. Leverage JWT Utilities
- Don't implement custom JWT logic
- Use Xano's built-in signing
- Configure secret in workspace settings

### 3. Environment Variables
```yaml
Workspace Environment Variables:
  - JWT_SECRET: [auto-generated by Xano]
  - JWT_EXPIRY: 86400 (24 hours)
  - BCRYPT_ROUNDS: 10
```

### 4. Error Handling
```yaml
Standard Auth Errors:
  - 401: "Invalid credentials"
  - 401: "Token expired"
  - 403: "Permission denied"
  - 404: "User not found"
```

---

## 📱 **API DOCUMENTATION**

### Auth Endpoints:

#### POST /auth/signup
```json
Request:
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "contact_id": "550e8400-e29b-41d4-a716-446655440000"
}

Response:
{
  "authToken": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "role": "USER",
    "contact": {
      "first_name": "John",
      "last_name": "Doe"
    }
  }
}
```

#### POST /auth/login
```json
Request:
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response: [Same as signup]
```

#### GET /auth/me
```json
Headers:
  Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...

Response:
{
  "user": {
    "id": "...",
    "email": "user@example.com",
    "role": "MANAGER",
    "organization": {
      "id": "...",
      "name": "ABC Company"
    }
  }
}
```

---

## 🚀 **QUICK IMPLEMENTATION CHECKLIST**

### Database:
- [ ] Create user_account table with password field type
- [ ] Add unique indexes on email and contact_id
- [ ] Create test users with different roles

### API Functions:
- [ ] Create /auth API group
- [ ] Implement signup function
- [ ] Implement login function  
- [ ] Implement me function
- [ ] Create auth_middleware utility
- [ ] Create check_permission utility

### Integration:
- [ ] Add middleware to all protected endpoints
- [ ] Update existing queries to use auth context
- [ ] Test with Xano's API tester
- [ ] Document in Swagger

### Frontend:
- [ ] Update API client to send auth headers
- [ ] Implement login/logout flow
- [ ] Add token storage
- [ ] Handle 401 errors

---

## 🔧 **TROUBLESHOOTING**

### Common Issues:

1. **"Invalid token" errors**
   - Check JWT_SECRET is configured
   - Verify token hasn't expired
   - Ensure Bearer prefix in header

2. **"Password mismatch" on login**
   - Confirm using password field type
   - Check password was hashed on create
   - Verify input encoding

3. **"Permission denied" errors**
   - Log auth context variables
   - Check role mapping
   - Verify permission string format

---

**Remember**: Xano's built-in auth is battle-tested. Use it instead of rolling your own! 