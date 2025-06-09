# User Action Items for ChargeCars V2
**Last Updated**: June 3, 2025
**Status**: Active
**Priority**: High

## 🚨 **HIGH PRIORITY**

### 1. **Permission System Implementation** 🆕
- [ ] **Data Migration**:
  - [ ] Update existing orders: Set `root_organization_id = customer_organization_id`
  - [ ] Update existing line items: Set `billing_organization_id` from order's customer
  - [ ] Update existing line items: Set `financial_contact_id` from organization's financial contact
  
- [ ] **Backend Functions**:
  - [ ] Implement `canUserAccessOrder()` permission check
  - [ ] Implement `assignLineItemBilling()` logic
  - [ ] Implement approval workflow engine
  - [ ] Create API endpoints for permission management
  
- [ ] **Testing**:
  - [ ] Test multi-organization order scenarios
  - [ ] Test split billing configurations
  - [ ] Test approval workflows

### 2. **Business Entity Migration** ✅ **PARTIALLY COMPLETE**
- [x] Database schema updated (all tables now use proper foreign keys)
- [ ] **Data Migration Still Needed**:
  - [ ] Populate `business_entity` table with 5 entities if not done
  - [ ] Update existing order records with `business_entity_id`
  - [ ] Update existing quote records with `business_entity_id`
  - [ ] Update existing organization records with `business_entity_id`
  - [ ] Update existing communication_template records
  - [ ] Update existing intake_form records

### 3. **Xano Function Implementation**
The following critical functions need manual implementation in Xano:

#### Status Engine (CRITICAL)
- [ ] `change_entity_status` - Universal status tracking
- [ ] `get_entity_status` - Get current status
- [ ] `get_status_history` - Get status history
- [ ] `get_overdue_items` - Find overdue items

### 4. **Authentication & Authorization Setup** 🆕
- [ ] **Create auth tables in Xano**:
  - [ ] `user_account` table with auth fields
  - [ ] `role` table with predefined roles
  - [ ] `user_role` junction table
  - [ ] `api_token` table for API access
- [ ] **Implement core auth functions**:
  - [ ] User registration endpoint
  - [ ] Login with JWT generation
  - [ ] Token refresh mechanism
  - [ ] Password reset flow
  - [ ] MFA setup (optional initially)
- [ ] **Create initial roles**:
  - [ ] System roles: SUPER_ADMIN, SYSTEM_ADMIN
  - [ ] Org roles: ADMIN, MANAGER, USER, VIEWER
  - [ ] Map existing contact.access_level to new roles
- [ ] **Build permission middleware**:
  - [ ] JWT validation
  - [ ] Permission checking
  - [ ] Organization context validation

### 5. **Pricing System Setup**
- [ ] Implement pricing system

---

## 🚨 **IMMEDIATE ACTIONS REQUIRED**

### 1. **Database Cleanup & Fixes** 🆕
- [x] **Convert ENUM status to TEXT**: ✅ COMPLETED
  - [x] `communication_thread.status` field - Successfully converted to TEXT
  - [x] Verified that type/category enums can remain as ENUM
- [ ] **Verify missing tables**:
  - [x] Tables confirmed to exist by user
  - [x] Documentation updated accordingly
- [ ] **Remove legacy fields** (after data migration):
  - [ ] `visit.postal_code`
  - [ ] `work_order.installation_address`
- [ ] **Add performance indexes**:
  ```sql
  CREATE INDEX idx_entity_status_composite ON entity_current_status(entity_type, entity_id, current_status);
  CREATE INDEX idx_comm_thread_composite ON communication_thread(entity_type, entity_id, status);
  CREATE INDEX idx_number_seq_lookup ON number_sequence(business_entity_id, document_type_id, year);
  ```

## 📋 **IMPLEMENTATION SEQUENCE**

### Phase 1: Foundation (Week 1)
1. Complete data migration for business entities
2. Implement status engine functions
3. Implement number generation

### Phase 2: Permissions (Week 2) 🆕
1. Implement permission check functions
2. Create access control APIs
3. Test multi-organization scenarios

### Phase 3: Business Logic (Week 3-4)
1. Core order/quote functions
2. Partner integration
3. Communication system
4. Background tasks

### Phase 4: Authentication (Week 4)
1. Implement authentication and authorization
2. Test authentication and authorization

---

## 🔧 **TECHNICAL DEBT**

### Database
- [ ] Create indexes for new permission tables
- [ ] Add constraints for order_access_control uniqueness
- [ ] Optimize JSON field queries

### Documentation
- [ ] Update API documentation with permission endpoints
- [ ] Create user guide for permission system
- [ ] Document billing split scenarios

---

## ✅ **COMPLETED ITEMS**

### June 3, 2025
- [x] Business entity foreign key migration (schema updated)
- [x] Permission system database design
- [x] Created new permission tables:
  - [x] order_access_control (ID: 114)
  - [x] quote_approval_workflow (ID: 115)
  - [x] organization_billing_rule (ID: 116)
- [x] Enhanced existing tables with permission fields

### June 2, 2025
- [x] Database schema corrections
- [x] Table renaming to singular names
- [x] Status engine design
- [x] Number sequence system design

### June 1, 2025
- [x] Authentication tables creation
- [x] Authentication functions implementation

---

## 📞 **SUPPORT NOTES**

For permission system questions:
1. Refer to `/01-backend/database-schema/permission-system-design.md`
2. Check implementation status in `/01-backend/database-schema/permission-system-implementation.md`
3. JSON structure examples are documented

Remember: The root_organization_id determines the primary workflow and configuration!

## 🎯 **PRIORITY ORDER**

1. **Week 1**: Authentication foundation
   - Create auth tables
   - Basic login/logout
   - JWT implementation
   
2. **Week 1-2**: Execute data migrations (business entity)
   - Complete data migration for business entities
   - Implement status engine functions
   - Implement number generation

3. **Week 2**: Permission system
   - Implement role checks
   - Add to existing endpoints
   - Test access control

4. **Week 2-3**: Implement pricing system
   - Implement pricing system

5. **Week 3-4**: Test complex scenarios
   - Test multi-organization scenarios
   - Test split billing configurations
   - Test approval workflows

6. **Week 4**: Frontend auth integration
   - Login/logout UI
   - Protected routes
   - Role-based UI

## 🐛 **KNOWN ISSUES TO RESOLVE**

## 📝 **NOTES**

### Authentication Design Decisions:
- JWT for stateless auth (15 min access, 7 day refresh)
- Support multiple auth providers (local, OAuth, SAML)
- Role-based with granular permissions
- Organization-scoped permissions
- API tokens for integrations

### Existing Notes:
Remember: Complete auth setup before allowing any production access. Security first! 