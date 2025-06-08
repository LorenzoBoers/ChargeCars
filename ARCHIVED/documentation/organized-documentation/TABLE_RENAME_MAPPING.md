# ChargeCars V2 - Table Name Mapping: Plural → Singular
**Database Consistency Update - Complete Mapping**

## 🔄 **CORE BUSINESS TABLES**

### **Primary Entities**
| Old Name (Plural) | New Name (Singular) | Table ID | References Update Required |
|-------------------|---------------------|----------|---------------------------|
| `organization` | `organization` | 35 | ✅ All FK references |
| `contact` | `contact` | 36 | ✅ All FK references |
| `article` | `article` | 38 | ✅ All FK references |
| `order` | `order` | 37 | ✅ All FK references |
| `quote` | `quote` | 39 | ✅ All FK references |
| `address` | `address` | 73 | ✅ All FK references |
| `invoice` | `invoice` | 61 | ✅ All FK references |
| `payment` | `payment` | 62 | ✅ All FK references |
| `document` | `document` | 76 | ✅ All FK references |

### **Junction/Component Tables**
| Old Name (Plural) | New Name (Singular) | Table ID | References Update Required |
|-------------------|---------------------|----------|---------------------------|
| `article_component` | `article_component` | 41 | ✅ FK to article |
| `line_item` | `line_item` | 40 | ✅ FK to order, quote, article |
| `sign_off` | `sign_off` | 47 | ✅ FK to order |
| `submission_file` | `submission_file` | 45 | ✅ FK to form_submission |

### **Communication Tables**
| Old Name (Plural) | New Name (Singular) | Table ID | References Update Required |
|-------------------|---------------------|----------|---------------------------|
| `communication_channel` | `communication_channel` | 68 | ✅ FK to business_entity |
| `communication_message` | `communication_message` | 70 | ✅ FK to communication_thread |
| `communication_template` | `communication_template` | 72 | ✅ FK to business_entity |
| `communication_thread` | `communication_thread` | 69 | ✅ FK to order, organization |

### **Operations Tables**
| Old Name (Plural) | New Name (Singular) | Table ID | References Update Required |
|-------------------|---------------------|----------|---------------------------|
| `team_vehicle_assignment` | `team_vehicle_assignment` | 59 | ✅ FK to installation_team, vehicle |

## ✅ **TABLES THAT STAY PLURAL (Correct Convention)**

### **Log/Audit Tables (Standard)**
- `audit_logs` - ✅ Logs are plural by convention
- `api_usage_logs` - ✅ Logs are plural by convention  
- `status_transitions` - ✅ Multiple transitions per entity

### **Already Singular**
- `user_account` (ID: 49) - ✅ Already correct
- `business_entity` (ID: 90) - ✅ Already correct
- `entity_current_status` (ID: 96) - ✅ Already correct

### **Compound Names (Already Correct)**
- `form_submission` (ID: 43) - ✅ Already singular
- `intake_form` (ID: 42) - ✅ Already singular
- `installation_team` (ID: 51) - ✅ Already singular
- `number_sequence` (ID: 87) - ✅ Already singular

## 🔍 **FOREIGN KEY UPDATES REQUIRED**

### **High Impact References** (Many FK relationships)
1. **organization** (was organizations) - Referenced by:
   - `contact.organization_id`
   - `order.customer_organization_id`
   - `order.partner_organization_id`
   - `quote.customer_organization_id`
   - `article.supplier_id`
   - `communication_thread.organization_id`

2. **contact** (was contacts) - Referenced by:
   - `order.primary_contact_id`
   - `contact.manager_contact_id`
   - `user_account.contact_id`

3. **article** (was articles) - Referenced by:
   - `line_item.article_id`
   - `article_component.parent_article_id`
   - `article_component.component_article_id`

4. **order** (was orders) - Referenced by:
   - `line_item.order_id`
   - `visit.order_id`
   - `work_order.order_id`
   - `sign_off.order_id`

5. **address** (was addresses) - Referenced by:
   - `organization.primary_address_id`
   - `organization.billing_address_id`
   - `order.installation_address_id`

## 📝 **DOCUMENTATION FILES TO UPDATE**

### **Database Documentation**
- ✅ `01-current-database/ChargeCars_V2_Database_Complete.md` - IN PROGRESS
- `01-current-database/Status_Engine_Architecture.md`
- `01-current-database/Database_Relationships_Schema.md`

### **API Documentation**
- `02-api-specifications/API_Architecture_Plan.md`
- `02-api-specifications/Status_Engine_API_Specification.md`

### **Implementation Guides**
- `03-implementation-guides/Technical_Implementation_Guide.md`
- `03-implementation-guides/Xano_Manual_Implementation_Tasks.md`
- All 20+ implementation guides

### **Business Requirements**
- `02-business-requirements/ChargeCars_Unified_PRD.md`
- `02-business-requirements/ChargeCars_Frontend_Development_PRD.md`

## 🚀 **IMPLEMENTATION ORDER**

### **Phase 1: Manual Database Changes (Xano Admin)**
1. Rename tables in Xano interface (cannot be done via API)
2. Update all FK field references to point to new table names

### **Phase 2: Documentation Update (Automated)**
1. Update all documentation with find/replace operations
2. Update API endpoint references
3. Update code examples and schemas

### **Phase 3: Validation**
1. Check all FK relationships are working
2. Verify documentation consistency
3. Test API functionality

---

**Status**: Phase 1 (Manual) Required → Phase 2 (Documentation) IN PROGRESS
**Priority**: HIGH - Database consistency critical for development 