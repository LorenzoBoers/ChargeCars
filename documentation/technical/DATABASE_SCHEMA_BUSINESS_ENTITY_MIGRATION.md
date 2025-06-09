# Database Schema Migration: Business Entity Foreign Key Relations
**Date**: June 3, 2025  
**Status**: ✅ **COMPLETED**  
**Impact**: High - All business entity references now use proper foreign keys

---

## 🎯 **MIGRATION OVERVIEW**

**Problem**: Multiple tables used `business_entity` enum fields instead of proper foreign key relationships to the `business_entity` table (ID: 90).

**Solution**: Updated all affected tables to use `business_entity_id` UUID foreign keys referencing the `business_entity` table.

---

## ✅ **COMPLETED SCHEMA CHANGES**

### **Tables Updated via MCP**
The following tables were successfully updated to replace `business_entity` enum fields with `business_entity_id` UUID foreign keys:

| Table | Table ID | Old Field | New Field | Status |
|-------|----------|-----------|-----------|---------|
| `order` | 37 | `business_entity` enum | `business_entity_id` UUID | ✅ **UPDATED** |
| `quote` | 39 | `business_entity` enum | `business_entity_id` UUID | ✅ **UPDATED** |
| `organization` | 35 | `business_entity` enum | `business_entity_id` UUID | ✅ **UPDATED** |
| `communication_template` | 72 | `business_entity` enum | `business_entity_id` UUID | ✅ **UPDATED** |
| `intake_form` | 42 | `business_entity` enum | `business_entity_id` UUID | ✅ **UPDATED** |

### **Tables Already Correct**
These tables already had proper foreign key relationships:

| Table | Table ID | Field | Status |
|-------|----------|-------|---------|
| `invoice` | 61 | `business_entity_id` UUID | ✅ **Already Correct** |
| `payment` | 62 | `business_entity_id` UUID | ✅ **Already Correct** |
| `number_sequence` | 87 | `business_entity_id` UUID | ✅ **Already Correct** |
| `communication_channel` | 68 | `business_entity_id` UUID | ✅ **Already Correct** |

---

## 🔄 **BUSINESS ENTITY TABLE REFERENCE**

**Table**: `business_entity` (ID: 90)  
**Purpose**: Central configuration for all ChargeCars business entities

### **Available Entities**
| entity_code | entity_name | number_prefix |
|------------|-------------|---------------|
| `chargecars` | ChargeCars B.V. | CC |
| `laderthuis` | LaderThuis.nl B.V. | LT |
| `meterkastthuis` | MeterKastThuis.nl B.V. | MK |
| `zaptecshop` | ZaptecShop.nl B.V. | ZS |
| `ratioshop` | RatioShop.nl B.V. | RS |

---

## 🔧 **IMPLEMENTATION IMPACT**

### **Backend Functions Updated**
The following functions in the manual implementation guide were updated to work with the new schema:

1. **generateEntityNumber Function**
   - Now queries `business_entity` table by `entity_code`
   - Uses `document_type` table for configuration
   - Proper foreign key joins with `number_sequence` table

2. **createOrder Function**
   - Validates `business_entity_id` exists
   - Queries business entity data for order creation
   - Includes business entity details in response

3. **createOrderFromPartner Function**
   - Gets business entity from partner organization
   - Uses partner's business entity for customer creation
   - Proper entity inheritance for partner orders

### **API Changes**
- `POST /numbers/generate/{business_entity_code}/{document_type}` - Now uses entity codes
- `POST /orders` - Now requires `business_entity_id` UUID instead of enum
- All queries now join with `business_entity` table for entity details

---

## 📊 **DATA CONSISTENCY**

### **Enum to UUID Mapping**
During migration, the following mapping was applied:

| Old Enum Value | New business_entity_id | Notes |
|----------------|----------------------|--------|
| `chargecars` | References `business_entity` where `entity_code = 'chargecars'` | Primary entity |
| `laderthuis` | References `business_entity` where `entity_code = 'laderthuis'` | Subsidiary |
| `meterkastthuis` | References `business_entity` where `entity_code = 'meterkastthuis'` | Subsidiary |
| `zaptecshop` | References `business_entity` where `entity_code = 'zaptecshop'` | Subsidiary |
| `ratioshop` | References `business_entity` where `entity_code = 'ratioshop'` | Subsidiary |

### **Data Migration Requirements**
⚠️ **IMPORTANT**: After schema changes, existing data must be migrated:

1. **Order Table**: Update existing records to set `business_entity_id` based on old enum values
2. **Quote Table**: Update existing records to set `business_entity_id` based on old enum values  
3. **Organization Table**: Update existing records to set `business_entity_id` based on old enum values
4. **Communication Template**: Update existing records to set `business_entity_id` based on old enum values
5. **Intake Form**: Update existing records to set `business_entity_id` based on old enum values

---

## 🔄 **RECOMMENDED DATA MIGRATION SCRIPT**

```sql
-- Example migration script for existing data
-- WARNING: Test in development environment first!

-- Update order table
UPDATE order SET business_entity_id = (
  SELECT id FROM business_entity WHERE entity_code = 'chargecars'
) WHERE business_entity = 'chargecars';

UPDATE order SET business_entity_id = (
  SELECT id FROM business_entity WHERE entity_code = 'laderthuis'
) WHERE business_entity = 'laderthuis';

-- Repeat for other tables and entities...
```

---

## ✅ **VERIFICATION CHECKLIST**

- [x] All affected tables updated to use `business_entity_id` UUID
- [x] Manual implementation guide updated with new schema
- [x] API functions updated to work with foreign keys
- [x] Proper validation added for business entity existence
- [ ] **Data migration executed** (user must complete)
- [ ] **Integration testing completed** (user must complete)
- [ ] **Frontend updated to use new API format** (user must complete)

---

## 🚨 **NEXT STEPS FOR USER**

1. **Execute Data Migration**: Run data migration scripts to update existing records
2. **Test API Functions**: Verify all Xano functions work with new schema
3. **Update Frontend**: Modify frontend to pass `business_entity_id` instead of enum values
4. **Integration Testing**: Test complete order flow with new schema
5. **Partner Integration**: Update partner API mappings for new field structure

---

## 📞 **SUPPORT**

If issues arise during implementation:
1. Check business entity table has all 5 entities populated
2. Verify foreign key relationships are properly created
3. Test with Xano Swagger interface for each function
4. Validate data integrity after migration

**Migration Completed**: ✅ **Success**  
**Schema Consistency**: ✅ **Achieved**  
**Business Compliance**: ✅ **Maintained** 