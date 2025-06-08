# ChargeCars PRD Writing Instructions
**Complete Guide for Thinking Model PRD Development**

---

## 📋 Overview & Context

### Project Scope
ChargeCars operates across **5 business entities** with **391 active partners**, managing **57,445 operational records** and **45,124 automation operations**. The goal is to transform from manual, fragmented systems to a unified, automated platform while maintaining partner-specific flexibility.

### Current System Analysis (Completed)
- **Smartsuite**: Primary operational database (57,445 records, 32 tables)
- **Make.com**: Automation engine (37 scenarios, 45,124 operations)
- **ClickUp**: Legacy work orders (needs migration)
- **Fillout**: Blocked API access (needs replacement)

### Business Metrics Baseline
- **6,959 customers** | **5,576 orders** | **5,197 visits** (93.2% execution rate)
- **5,321 quotes** (104.8% conversion rate) | **391 partners** | **7 regional teams**

---

## 🎯 PRD Structure & Requirements

The PRD must be organized into **4 primary sections** with specific focus areas:

### 1. 📋 OPERATIONELE ZAKEN (Business Operations)
### 2. 🖥️ UI/PORTAL DESIGN (User Interface & Portal)
### 3. 📊 KPI'S & DATA STRUCTURE (Key Performance Indicators)
### 4. 🔗 INTEGRATIES (System Integrations)

---

## 📋 SECTION 1: OPERATIONELE ZAKEN (Business Operations)

### 1.1 Hoofdprocessen Uitschrijven (Core Process Documentation)

#### **Customer Journey Process (End-to-End)**
**Current State Analysis:**
- Lead Management: 833 leads (background pipeline)
- Quote Management: 5,321 quotes with 104.8% conversion
- Order Processing: 5,576 orders with 93.2% execution rate
- Visit Scheduling: 5,197 visits across 7 regional teams

**Required Process Documentation:**
1. **Lead Intake & Qualification Process**
   - Partner API submission requirements
   - Customer intake questionnaire flow
   - Lead scoring and qualification criteria
   - Conversion to quote/order process

2. **Quote & Approval Process**
   - Dual quote system (customer + partner versions)
   - Line item configuration and billing assignment
   - Visit configuration (max 2 visits per quote)
   - Digital signature workflow (separate approvals)
   - Approval dependency logic (both partner AND customer required)

3. **Planning & Scheduling Process**
   - Geographic optimization (7 regions, postal code bundling)
   - Capacity management (2-3 installations per team/day)
   - Customer self-scheduling interface requirements
   - Job bundling logic (±30km maximum distance)
   - Resource allocation and team assignment

4. **Inventory & Preparation Process**
   - Product flow: Partner → Warehouse → Staging → Installation
   - Serial number tracking (charging stations)
   - Picking process (main components + ad-hoc small parts)
   - Tool management and restocking

5. **Installation & Execution Process**
   - Field team workflow (2-3 mechanics per team)
   - Quality control checkpoints
   - Documentation requirements
   - Issue escalation procedures

6. **Post-Installation Process**
   - Quality assurance review
   - Customer satisfaction tracking
   - Invoicing and payment processing
   - Warranty and support handoff

#### **Partner Management Process**
**Current State:** 391 active partners with complex relationship management

**Required Process Documentation:**
1. **Partner Onboarding Process**
   - Qualification criteria per partner category
   - Documentation requirements
   - System access provisioning
   - Training and certification

2. **Partner Categories & Models**
   - Lead Transfer Model: Lead provision → ChargeCars execution → Kickback
   - Automotive Integration: Dealer/OEM co-branded experience
   - Energy Partners: Utility company integrations
   - B2B Contractors: Installation companies and webshops

3. **Partner Performance Management**
   - SLA definitions per partner type
   - Performance monitoring and reporting
   - Incentive and penalty structures
   - Relationship management workflows

#### **Business Entity Operations**
**5 Business Entities Integration:**
1. **ChargeCars**: B2B partner-focused installation services
2. **LaderThuis.nl**: Consumer charging station sales/installation
3. **MeterKastThuis.nl**: Electrical panel replacement services
4. **ZaptecShop.nl**: B2B wholesale Zaptec solutions
5. **RatioShop.nl**: B2B wholesale Ratio Electric solutions

**Cross-Entity Process Requirements:**
- Unified customer database across entities
- Shared inventory and resource management
- Coordinated scheduling and capacity planning
- Integrated financial and reporting systems

### 1.2 Workflow Standardization Requirements

#### **Automation Requirements**
**Current Automation Coverage:** 80%+ processes automated
- Lead Generation: 8 scenarios (5,958 operations)
- Customer Management: 4 scenarios (11,889 operations)
- Order Processing: 5 scenarios (7,226 operations)
- Data Validation: 2 scenarios (13,759 operations)

**Target Automation Goals:**
- 95%+ process automation coverage
- Reduce manual intervention by 50%
- Automated capacity planning and optimization
- Real-time status updates across all workflows

#### **Quality Control Processes**
- Automated quality checkpoints
- Exception handling and escalation
- Performance monitoring and alerting
- Continuous improvement feedback loops

---

## 🖥️ SECTION 2: UI/PORTAL DESIGN (User Interface & Portal)

### 2.1 Portal Architecture & User Experience

#### **Primary User Personas & Portal Requirements**

**1. Operations Manager Portal**
- **Current Context**: Managing 5,197 visits, 391 partners, 7 regional teams
- **Required Views:**
  - Real-time operations dashboard
  - Capacity planning and resource allocation
  - Performance analytics and reporting
  - Exception management and escalation

**2. Field Technician Mobile App**
- **Current Context**: 5,197 visits across 7 regional teams, 2-3 installations/day
- **Required Views:**
  - Daily schedule and route optimization
  - Job details and customer information
  - Inventory and materials tracking
  - Quality control checklists and photo capture
  - Digital signature and completion workflow

**3. Partner Portal**
- **Current Context**: 391 active partners, 4 major integrations
- **Required Views:**
  - Order status tracking and history
  - Performance dashboards and analytics
  - Self-service onboarding and configuration
  - API documentation and testing tools

**4. Customer Portal**
- **Current Context**: 6,959 customers, 5,321 quotes, 5,576 orders
- **Required Views:**
  - Order tracking and status updates
  - Scheduling interface (week view, time blocks)
  - Quote review and approval
  - Support and communication tools

### 2.2 Belangrijkste Views & Pagina's (Key Views & Pages)

#### **Dashboard Views (Priority 1)**
1. **Operations Command Center**
   - Real-time capacity utilization (7 regions)
   - Active orders and visit status (5,197 visits)
   - Partner performance metrics (391 partners)
   - Exception alerts and escalations

2. **Customer Management Dashboard**
   - Customer lifecycle overview (6,959 customers)
   - Quote-to-order conversion tracking (104.8% rate)
   - Service history and satisfaction scores
   - Communication timeline and notes

3. **Partner Performance Dashboard**
   - Partner volume and performance metrics
   - Integration health monitoring
   - Revenue and commission tracking
   - Onboarding pipeline status

#### **Operational Views (Priority 1)**
1. **Planning & Scheduling Interface**
   - Geographic view with team locations
   - Capacity planning calendar (week/month view)
   - Job bundling and route optimization
   - Resource allocation and availability

2. **Order Management Interface**
   - Order lifecycle tracking (5,576 orders)
   - Quote configuration and approval workflow
   - Inventory allocation and preparation
   - Quality control and completion tracking

3. **Inventory Management Interface**
   - Real-time stock levels and locations
   - Serial number tracking (charging stations)
   - Picking and staging workflows
   - Supplier integration and reordering

#### **Mobile Views (Priority 2)**
1. **Field Team Mobile App**
   - Daily schedule and navigation
   - Job details and customer contact
   - Inventory checklist and tracking
   - Photo capture and documentation
   - Digital signature and completion

2. **Customer Mobile Experience**
   - Order status and tracking
   - Scheduling and rescheduling
   - Communication with field teams
   - Satisfaction feedback and support

### 2.3 API Requirements per View

#### **Dashboard APIs**
- **Real-time Operations API**: Live status updates, capacity metrics
- **Analytics API**: Performance data, trend analysis, forecasting
- **Alert Management API**: Exception handling, notification system

#### **Customer Management APIs**
- **Customer Lifecycle API**: Complete customer journey tracking
- **Communication API**: Multi-channel messaging and notifications
- **Satisfaction API**: Feedback collection and analysis

#### **Partner Integration APIs**
- **Partner Portal API**: Self-service functionality and data access
- **Performance Metrics API**: Real-time partner analytics
- **Onboarding API**: Automated partner setup and configuration

#### **Field Operations APIs**
- **Mobile Sync API**: Offline capability and data synchronization
- **Location Services API**: GPS tracking and route optimization
- **Inventory API**: Real-time stock updates and allocation

#### **Scheduling & Planning APIs**
- **Capacity Management API**: Resource allocation and optimization
- **Geographic API**: Address validation and route planning
- **Automation API**: Workflow triggers and process automation

---

## 📊 SECTION 3: KPI'S & DATA STRUCTURE (Key Performance Indicators)

### 3.1 Business KPIs & Measurement Framework

#### **Operational Excellence KPIs**
**Current Baseline Performance:**
- Order Execution Rate: 93.2% (5,197 visits / 5,576 orders)
- Quote Conversion Rate: 104.8% (5,576 orders / 5,321 quotes)
- Customer Satisfaction: [TO BE MEASURED]
- Partner Performance: [TO BE STANDARDIZED]

**Target KPIs & Data Requirements:**
1. **Efficiency Metrics**
   - Order-to-completion time: Target <14 days average
   - Planning efficiency: Target 95% first-time-right scheduling
   - Resource utilization: Target 85% team capacity utilization
   - Process automation: Target 95% automated workflows

2. **Quality Metrics**
   - Customer satisfaction: Target >4.5/5.0 rating
   - First-time completion rate: Target >95%
   - Rework percentage: Target <5%
   - Partner satisfaction: Target >4.0/5.0 rating

3. **Growth Metrics**
   - Partner onboarding rate: Target 10x current capacity
   - Order volume growth: Target 200% year-over-year
   - Geographic expansion: Target coverage optimization
   - Revenue per partner: Target 25% increase

#### **Partner Performance KPIs**
**Current Partner Data:** 391 active partners, 4 major integrations

**Required Partner Metrics:**
1. **Volume Metrics**
   - Orders generated per partner per month
   - Revenue contribution per partner
   - Lead quality and conversion rates
   - Geographic coverage and penetration

2. **Performance Metrics**
   - Order completion rates by partner
   - Customer satisfaction by partner source
   - Payment terms and collection rates
   - Integration reliability and uptime

3. **Relationship Metrics**
   - Partner satisfaction scores
   - Onboarding time and success rate
   - Support ticket volume and resolution
   - Contract renewal and expansion rates

### 3.2 Data Structure Requirements

#### **Customer Data Structure**
**Current Scale:** 6,959 customers across 5 business entities

**Required Data Architecture:**
```
Customer Entity:
- Core Identity: ID, Name, Contact, Address
- Business Context: Entity source, Partner source, Acquisition date
- Lifecycle Status: Lead, Prospect, Customer, Inactive
- Interaction History: Touchpoints, Communications, Satisfaction
- Order History: Quotes, Orders, Visits, Payments
- Preferences: Communication, Scheduling, Service options
```

#### **Order & Visit Data Structure**
**Current Scale:** 5,576 orders, 5,197 visits, 5,321 quotes

**Required Data Architecture:**
```
Order Entity:
- Order Details: ID, Customer, Partner, Products, Services
- Financial: Pricing, Payment terms, Billing allocation
- Scheduling: Visit requirements, Timing preferences, Constraints
- Status Tracking: Lifecycle stage, Completion percentage, Issues
- Quality: Satisfaction scores, Completion verification, Rework

Visit Entity:
- Scheduling: Date, Time, Team, Location, Duration
- Preparation: Inventory allocation, Tools, Documentation
- Execution: Checklist completion, Photos, Signatures
- Results: Completion status, Issues, Follow-up requirements
```

#### **Partner Data Structure**
**Current Scale:** 391 partners with complex relationships

**Required Data Architecture:**
```
Partner Entity:
- Profile: Company details, Contacts, Capabilities
- Business Model: Lead transfer, Co-branded, Wholesale
- Performance: Volume metrics, Quality scores, Financial data
- Integration: API status, Data sync, Automation health
- Relationship: SLA terms, Satisfaction, Contract status
```

#### **Inventory & Product Data Structure**
**Current Gap:** Voorraden table empty in Smartsuite

**Required Data Architecture:**
```
Inventory Entity:
- Product Master: SKU, Description, Specifications, Suppliers
- Stock Levels: Quantity, Location, Reserved, Available
- Tracking: Serial numbers, Batch codes, Warranty information
- Movement: Receipts, Issues, Transfers, Adjustments
- Planning: Reorder points, Lead times, Forecasting
```

### 3.3 Analytics & Reporting Requirements

#### **Real-time Dashboards**
- Operations command center with live metrics
- Partner performance monitoring
- Customer satisfaction tracking
- Inventory levels and alerts

#### **Operational Reports**
- Daily/weekly/monthly performance summaries
- Partner scorecards and reviews
- Customer lifecycle analysis
- Financial performance by entity/partner

#### **Predictive Analytics**
- Demand forecasting and capacity planning
- Partner performance prediction
- Customer churn risk analysis
- Inventory optimization recommendations

---

## 🔗 SECTION 4: INTEGRATIES (System Integrations)

### 4.1 Current Integration Analysis

#### **Existing Integration Performance**
**Make.com Automation:** 37 scenarios, 45,124 operations
- **High Volume Integrations:**
  - Address Validation: 12,449 operations (27.6%)
  - HubSpot-Smartsuite Sync: 8,203 operations (18.2%)
  - Email Processing (AI): 4,848 operations (10.7%)
  - Token Generation: 3,686 operations (8.2%)

**Partner Integrations:**
- **Groendus**: 3,254 operations (High Volume)
- **Alva Charging**: 4,848 operations (Email Processing)
- **Eneco**: 1,156 operations (Recent Integration)
- **50five**: 96 operations (Lower Volume)

#### **Integration Patterns Analysis**
- **Webhooks**: 34/37 scenarios (91.9%) - Primary integration method
- **Smartsuite API**: 23/37 scenarios (62.2%) - Heavy usage requiring optimization
- **HTTP APIs**: 6/37 scenarios (16.2%) - External service integration

### 4.2 Required System Integrations

#### **Core Platform Integrations (Priority 1)**

**1. Smartsuite Optimization**
- **Current Usage**: 23/37 scenarios (62.2% of automations)
- **Requirements**: 
  - API rate limiting and optimization
  - Bulk operations for efficiency
  - Real-time sync capabilities
  - Error handling and retry logic
- **Data Volume**: 57,445 records across 32 tables
- **Performance Target**: <1 second response time

**2. Make.com Enhancement**
- **Current Status**: 37 active scenarios, API token needs update
- **Requirements**:
  - Scenario optimization and consolidation
  - Enhanced error handling and monitoring
  - Scalability for 10x volume growth
  - Advanced workflow automation
- **Target**: 95% automation coverage

**3. HubSpot CRM Integration**
- **Current Volume**: 8,203 operations (18.2% of total)
- **Requirements**:
  - Bi-directional customer sync
  - Lead scoring and qualification
  - Marketing automation integration
  - Sales pipeline management
- **Data Sync**: Real-time customer and lead updates

#### **Partner Integration Platform (Priority 1)**

**1. Standardized Partner API**
- **Current Partners**: 391 active, 4 major integrations
- **Requirements**:
  - RESTful API with OpenAPI documentation
  - Webhook support for real-time updates
  - Authentication and rate limiting
  - Self-service onboarding tools
- **Scalability Target**: Support 3,910+ partners (10x growth)

**2. Partner-Specific Integrations**
- **Automotive Partners**: Ford, Volvo, VanMossel, Kia
  - Vehicle sales integration
  - Co-branded customer experience
  - Delivery coordination
- **Energy Partners**: Eneco, Essent, Tibber
  - Utility account integration
  - Energy plan coordination
  - Billing integration

**3. B2B Marketplace Integration**
- **ZaptecShop.nl & RatioShop.nl**: Wholesale operations
  - Product catalog synchronization
  - Inventory management
  - Order fulfillment automation
  - Pricing and availability updates

#### **Operational System Integrations (Priority 2)**

**1. Geographic & Routing Services**
- **Current Usage**: 12,449 address validation operations
- **Requirements**:
  - Google Maps API optimization
  - Route planning and optimization
  - Geographic capacity planning
  - Real-time traffic integration
- **Performance**: Sub-second address validation

**2. Communication Platform Integration**
- **Email Processing**: 4,848 operations (AI-powered)
- **Requirements**:
  - Multi-channel communication (email, SMS, WhatsApp)
  - Automated customer notifications
  - Template management and personalization
  - Delivery tracking and analytics

**3. Financial System Integration**
- **Current**: Snelstart + MoneyBird integration layer
- **Requirements**:
  - Automated invoicing and payment processing
  - Multi-entity financial consolidation
  - Partner commission calculations
  - Revenue recognition automation

#### **Mobile & Field Operations Integration (Priority 2)**

**1. Mobile Application Backend**
- **Field Teams**: 7 regional teams, 5,197 visits
- **Requirements**:
  - Offline capability and sync
  - Real-time location tracking
  - Photo and document upload
  - Digital signature capture
- **Performance**: Instant sync when online

**2. IoT & Device Integration**
- **Charging Stations**: Serial number tracking
- **Requirements**:
  - Device registration and monitoring
  - Remote diagnostics and updates
  - Usage analytics and reporting
  - Maintenance scheduling

### 4.3 Integration Architecture Requirements

#### **API Gateway & Management**
- Centralized API management and documentation
- Rate limiting and throttling
- Authentication and authorization
- Monitoring and analytics
- Version management and deprecation

#### **Data Synchronization Strategy**
- Real-time sync for critical operations
- Batch processing for bulk operations
- Conflict resolution and data integrity
- Audit trails and change tracking
- Backup and disaster recovery

#### **Security & Compliance**
- OAuth 2.0 / JWT authentication
- Data encryption in transit and at rest
- GDPR compliance for customer data
- Partner data isolation and access control
- Security monitoring and threat detection

#### **Monitoring & Observability**
- Integration health monitoring
- Performance metrics and alerting
- Error tracking and resolution
- Usage analytics and optimization
- SLA monitoring and reporting

---

## 🎯 PRD Writing Instructions for Thinking Model

### Step 1: Context Analysis
1. **Read and understand** all provided data points and current system analysis
2. **Identify gaps** between current state and required future state
3. **Prioritize requirements** based on business impact and technical feasibility

### Step 2: Detailed Requirements Development
1. **Expand each section** with specific, measurable requirements
2. **Define acceptance criteria** for each feature and integration
3. **Specify technical constraints** and performance requirements
4. **Include user stories** and use cases for each persona

### Step 3: Implementation Planning
1. **Create phased approach** with clear milestones and dependencies
2. **Define success metrics** and KPIs for each phase
3. **Identify risks and mitigation strategies**
4. **Estimate effort and resources** required

### Step 4: Validation & Refinement
1. **Cross-reference requirements** across all four sections
2. **Ensure consistency** in data models and integration patterns
3. **Validate feasibility** against current system capabilities
4. **Optimize for scalability** and future growth requirements

### Key Success Criteria
- **Comprehensive Coverage**: All four sections fully detailed
- **Data-Driven**: Based on actual operational metrics (57,445 records, 45,124 operations)
- **Actionable**: Specific requirements with clear acceptance criteria
- **Scalable**: Designed for 10x growth in partners and volume
- **Integrated**: Seamless workflow across all business entities and systems

---

## 📚 Reference Data Summary

### Current System Metrics
- **57,445 operational records** (Smartsuite)
- **45,124 automation operations** (Make.com)
- **6,959 customers** | **5,576 orders** | **5,197 visits**
- **391 partners** | **7 regional teams** | **5 business entities**

### Performance Baselines
- **93.2% order execution rate**
- **104.8% quote conversion rate**
- **91.9% webhook usage** in automations
- **62.2% Smartsuite API usage** requiring optimization

### Growth Targets
- **10x partner scaling** (391 → 3,910+)
- **95% automation coverage** (current 80%+)
- **50% manual work reduction**
- **99.9% system uptime** with <1 second response times

Use this comprehensive framework to develop a detailed, actionable PRD that transforms ChargeCars from its current fragmented state to a unified, scalable platform capable of supporting exponential growth while maintaining operational excellence. 