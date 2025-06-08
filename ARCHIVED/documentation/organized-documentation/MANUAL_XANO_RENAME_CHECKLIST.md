# 🔄 HANDMATIGE XANO HERBENOEMING CHECKLIST
**Stap-voor-stap gids voor het hernoemen van tabellen in Xano Admin**

---

## 🎯 **VOORBEREIDING**

### **1. BACKUP MAKEN** ⚠️
- [ ] **Login** in Xano Admin → ChargeCars V2 workspace
- [ ] **Export** database schema (optioneel backup)
- [ ] **Noteer** huidige API endpoints (die zullen wijzigen)

### **2. DOCUMENTATIE READY** ✅
- [ ] Alle documentatie is bijgewerkt naar singular vorm
- [ ] `TABLE_RENAME_MAPPING.md` bekeken voor complete lijst

---

## 📊 **FASE 1: CORE BUSINESS TABLES**

### **🏢 Organizations & Contacts**
- [ ] **Rename** `organization` → `organization` (ID: 35)
- [ ] **Rename** `contact` → `contact` (ID: 36)
- [ ] **Rename** `address` → `address` (ID: 73)

### **📦 Products & Inventory**
- [ ] **Rename** `article` → `article` (ID: 38)
- [ ] **Rename** `article_component` → `article_component` (ID: 41)

### **💼 Sales & Orders**
- [ ] **Rename** `order` → `order` (ID: 37)
- [ ] **Rename** `quote` → `quote` (ID: 39)
- [ ] **Rename** `line_item` → `line_item` (ID: 40)

### **💰 Financial**
- [ ] **Rename** `invoice` → `invoice` (ID: 61)
- [ ] **Rename** `payment` → `payment` (ID: 62)

---

## 📊 **FASE 2: OPERATIONS TABLES**

### **🔧 Operations**
- [ ] **Rename** `visit` → `visit` (ID: 46)
- [ ] **Rename** `work_order` → `work_order` (ID: 60)
- [ ] **Rename** `sign_off` → `sign_off` (ID: 47)

### **👥 Teams**
- [ ] **Rename** `daily_team_composition` → `daily_team_composition` (ID: 65)
- [ ] **Rename** `team_vehicle_assignment` → `team_vehicle_assignment` (ID: 59)

---

## 📊 **FASE 3: COMMUNICATION TABLES**

### **💬 Communication System**
- [ ] **Rename** `communication_channel` → `communication_channel` (ID: 68)
- [ ] **Rename** `communication_message` → `communication_message` (ID: 70)
- [ ] **Rename** `communication_template` → `communication_template` (ID: 72)
- [ ] **Rename** `communication_thread` → `communication_thread` (ID: 69)

---

## 📊 **FASE 4: SUPPORT & FILES**

### **📁 Documents & Files**
- [ ] **Rename** `document` → `document` (ID: 76)
- [ ] **Rename** `submission_file` → `submission_file` (ID: 45)

### **📊 Analytics & Tracking**
- [ ] **Rename** `webhook_events` → `webhook_event` (ID: 80)
- [ ] **Rename** `form_analytic` → `form_analytic` (ID: 56)

---

## 🔍 **VERIFICATIE STAPPEN**

### **Check Foreign Key References**
- [ ] **Test** dat alle FK relaties nog werken
- [ ] **Check** API responses voor nieuwe table names
- [ ] **Verify** dat data intact is gebleven

### **API Endpoints Update**
- [ ] **Regenerate** API documentation in Xano
- [ ] **Update** any custom endpoints that hardcode table names
- [ ] **Test** core endpoints: `/order`, `/organization`, `/contact`

---

## ✅ **TABLES DIE BLIJVEN ZOALS ZE ZIJN**

### **✅ Correct Plural (Logs/Collections)**
- `audit_logs` - ✅ Logs zijn correct plural
- `api_usage_logs` - ✅ Logs zijn correct plural  
- `status_transitions` - ✅ Transitions zijn correct plural

### **✅ Al Singular**
- `user_account` (ID: 49) - ✅ Al correct
- `business_entity` (ID: 90) - ✅ Al correct
- `entity_current_status` (ID: 96) - ✅ Al correct
- `intake_form` (ID: 42) - ✅ Al correct
- `form_submission` (ID: 43) - ✅ Al correct
- `installation_team` (ID: 51) - ✅ Al correct
- `number_sequence` (ID: 87) - ✅ Al correct

---

## 🚨 **COMMON PITFALLS**

### **❌ Niet Vergeten:**
- Foreign key velden **hoeven NIET** hernoemd te worden
- Alleen de **table names** wijzigen, niet de kolom namen
- API endpoints worden automatisch bijgewerkt door Xano

### **⚠️ Let Op:**
- Na herbenoeming kunnen bestaande API calls tijdelijk falen
- Frontend moet mogelijk opnieuw opgestart worden
- Cache mogelijk clearen in Xano

---

## 🎉 **NA VOLTOOIING**

### **Bevestig Succes:**
- [ ] Alle tabellen hebben singular names
- [ ] FK relaties werken nog
- [ ] Basis API calls functioneren
- [ ] Documentatie is consistent

### **Ready for Implementation:**
- [ ] **Status Engine** API implementatie kan beginnen
- [ ] **change_entity_status** functie kan gebouwd worden
- [ ] Database is consistent en development-ready

---

**Geschatte tijd**: 30-45 minuten voor complete herbenoeming  
**Risico niveau**: Laag (alleen naam wijzigingen, geen data verlies)  
**Backup niveau**: Aanbevolen maar niet kritiek 