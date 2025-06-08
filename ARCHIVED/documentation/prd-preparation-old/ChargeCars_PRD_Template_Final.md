# ChargeCars Platform PRD
**Product Requirements Document - Unified Operations Platform**

---

## 📋 Executive Summary

### Vision Statement
Transform ChargeCars from manual, fragmented operations to a unified, automated platform supporting 10x growth across 5 business entities while maintaining partner-specific flexibility.

### Problem Statement
ChargeCars operates 57,445 operational records across fragmented systems (Smartsuite, Make.com, ClickUp) with 391 partners and 7 regional teams. Current manual processes limit scalability and real-time visibility.

### Solution Overview
Unified platform with automated workflows, real-time visibility, and standardized processes supporting exponential growth while maintaining operational excellence.

### Success Metrics
- **Operational Efficiency**: 50% reduction in manual processing
- **Partner Scalability**: 10x partner onboarding capacity (391 → 3,910+)
- **System Performance**: 99.9% uptime, <1 second response times
- **Business Growth**: Support 10x current volume (57,445 → 574,450 records)

---

## 📋 SECTION 1: OPERATIONELE ZAKEN (Business Operations)

### 1.1 Hoofdprocessen (Core Business Processes)

#### **Customer Journey Process (End-to-End)**
**Current State:** 6,959 customers, 5,576 orders, 5,197 visits (93.2% execution rate)

**1. Lead Intake & Qualification**
- **Input**: Partner API submission (Email + Name required, Phone + Address optional)
- **Process**: Automated lead scoring, qualification criteria, intake questionnaire
- **Output**: Qualified lead ready for quote generation
- **Automation**: 833 leads currently managed, target 95% automated processing

**2. Quote & Approval Process**
- **Current**: 5,321 quotes with 104.8% conversion rate
- **Dual Quote System**: Customer version + Partner version with shared line items
- **Visit Configuration**: Maximum 2 visits per quote (survey + installation, installation + meter box)
- **Line Items**: Charging station, cables, mounting poles, services, meter box modules, smart meters
- **Billing Assignment**: Flexible per-item designation (customer/partner payment)
- **Digital Signatures**: Separate approvals (partner signs their items, customer signs theirs)
- **Approval Logic**: Both partner AND customer approval required for order progression

**3. Planning & Scheduling Process**
- **Current**: 5,197 visits across 7 regional teams, 2-3 installations per team/day
- **Geographic Optimization**: Netherlands regions, postal code bundling (first 2 digits)
- **Job Bundling**: Same area ±30km maximum distance
- **Customer Interface**: Week view calendar with morning/afternoon time blocks
- **Capacity Indicator**: General availability status without exact numbers
- **Resource Allocation**: Automated team assignment based on location and capacity

**4. Inventory & Preparation Process**
- **Current Gap**: Voorraden table empty in Smartsuite
- **Product Flow**: Partner → ChargeCars warehouse → staging → installation
- **Tracking**: Serial numbers for charging stations, batch tracking for components
- **Picking**: Main components + ad-hoc small parts management
- **Tool Management**: Automated restocking and allocation

**5. Installation & Execution Process**
- **Team Structure**: 2-3 mechanics per team, single vehicle dispatch
- **Daily Capacity**: 2-3 installations per team per day from Nijkerk base
- **Quality Control**: Automated checkpoints and completion verification
- **Documentation**: Digital forms, photo capture, signature collection
- **Issue Escalation**: Automated routing based on problem type and severity

**6. Post-Installation Process**
- **Quality Assurance**: Account manager review and customer satisfaction tracking
- **Invoicing**: Automated billing based on completion verification
- **Support Handoff**: OCPP platform enrollment and ongoing support
- **Warranty Management**: Automated warranty registration and tracking

#### **Partner Management Process**
**Current State:** 391 active partners with complex relationship management

**1. Partner Onboarding Process**
- **Qualification**: Automated criteria assessment per partner category
- **Documentation**: Digital document collection and verification
- **System Access**: Automated provisioning and training delivery
- **Certification**: Competency verification and ongoing assessment

**2. Partner Categories & Business Models**
- **Lead Transfer Model**: Lead provision → ChargeCars execution → Kickback calculation
- **Automotive Integration**: Dealer/OEM co-branded experience with delivery coordination
- **Energy Partners**: Utility integration with billing coordination
- **B2B Contractors**: Installation companies and webshop integration

**3. Partner Performance Management**
- **SLA Monitoring**: Automated performance tracking per partner type
- **Incentive Calculation**: Automated commission and penalty processing
- **Relationship Management**: Structured communication and review cycles
- **Escalation Procedures**: Automated issue routing and resolution tracking

#### **Business Entity Operations**
**5 Business Entities Integration:**

**1. ChargeCars**: B2B partner-focused installation services
**2. LaderThuis.nl**: Consumer charging station sales and installation
**3. MeterKastThuis.nl**: Electrical panel replacement services
**4. ZaptecShop.nl**: B2B wholesale Zaptec solutions
**5. RatioShop.nl**: B2B wholesale Ratio Electric solutions

**Cross-Entity Requirements:**
- Unified customer database with entity-specific views
- Shared inventory and resource management
- Coordinated scheduling across all entities
- Integrated financial reporting and commission tracking

### 1.2 Workflow Standardization

#### **Automation Requirements**
**Current**: 80%+ processes automated (37 scenarios, 45,124 operations)
**Target**: 95% automation coverage with 50% reduction in manual intervention

**Priority Automation Areas:**
- Lead qualification and routing (currently 833 leads)
- Quote generation and approval workflow (5,321 quotes)
- Capacity planning and scheduling optimization (5,197 visits)
- Inventory management and allocation (currently manual)
- Quality control and completion verification
- Partner performance monitoring and reporting

#### **Quality Control Framework**
- Automated quality checkpoints at each process stage
- Exception handling with escalation procedures
- Performance monitoring with real-time alerting
- Continuous improvement feedback loops
- Customer satisfaction tracking and analysis

---

## 🖥️ SECTION 2: UI/PORTAL DESIGN (User Interface & Portal)

### 2.1 User Personas & Portal Requirements

#### **1. Operations Manager Portal**
**Context**: Managing 5,197 visits, 391 partners, 7 regional teams

**Dashboard Requirements:**
- Real-time operations command center with capacity utilization
- Geographic view of active installations and team locations
- Partner performance metrics and integration health
- Exception alerts and escalation management
- Resource allocation and planning tools

**Key Views:**
- Operations dashboard with live metrics
- Capacity planning calendar (week/month view)
- Partner performance scorecards
- Exception management interface
- Resource allocation tools

#### **2. Field Technician Mobile App**
**Context**: 5,197 visits across 7 regional teams, 2-3 installations/day

**Mobile Requirements:**
- Offline capability with automatic sync
- Daily schedule with route optimization
- Job details and customer contact information
- Inventory checklist and tracking
- Photo capture and digital signatures
- Quality control checklists

**Key Views:**
- Daily schedule and navigation
- Job details and customer info
- Inventory management
- Quality control forms
- Photo and signature capture

#### **3. Partner Portal**
**Context**: 391 active partners, 4 major integrations

**Portal Requirements:**
- Self-service onboarding and configuration
- Real-time order tracking and history
- Performance dashboards and analytics
- API documentation and testing tools
- Commission tracking and reporting

**Key Views:**
- Partner dashboard with performance metrics
- Order tracking and management
- Self-service configuration
- API documentation and testing
- Financial reporting and commissions

#### **4. Customer Portal**
**Context**: 6,959 customers, 5,321 quotes, 5,576 orders

**Portal Requirements:**
- Order tracking with real-time status updates
- Self-scheduling interface (week view, time blocks)
- Quote review and digital approval
- Communication with field teams
- Support and satisfaction feedback

**Key Views:**
- Customer dashboard with order status
- Scheduling interface
- Quote review and approval
- Communication center
- Support and feedback forms

### 2.2 API Requirements per View

#### **Real-time Operations APIs**
- **Capacity Management API**: Resource allocation and optimization
- **Geographic API**: Address validation and route planning (currently 12,449 operations)
- **Status Tracking API**: Live updates across all workflows
- **Alert Management API**: Exception handling and notifications

#### **Customer Management APIs**
- **Customer Lifecycle API**: Complete journey tracking (6,959 customers)
- **Communication API**: Multi-channel messaging and notifications
- **Satisfaction API**: Feedback collection and analysis
- **Scheduling API**: Self-service appointment management

#### **Partner Integration APIs**
- **Partner Portal API**: Self-service functionality and data access
- **Performance Metrics API**: Real-time partner analytics
- **Onboarding API**: Automated partner setup and configuration
- **Commission API**: Automated calculation and reporting

#### **Field Operations APIs**
- **Mobile Sync API**: Offline capability and data synchronization
- **Location Services API**: GPS tracking and route optimization
- **Inventory API**: Real-time stock updates and allocation
- **Quality Control API**: Checklist management and verification

---

## 📊 SECTION 3: KPI'S & DATA STRUCTURE (Key Performance Indicators)

### 3.1 Business KPIs & Measurement Framework

#### **Operational Excellence KPIs**
**Current Baseline:**
- Order Execution Rate: 93.2% (5,197 visits / 5,576 orders)
- Quote Conversion Rate: 104.8% (5,576 orders / 5,321 quotes)
- Partner Count: 391 active partners
- Automation Coverage: 80%+ (37 scenarios, 45,124 operations)

**Target KPIs:**
1. **Efficiency Metrics**
   - Order-to-completion time: <14 days average
   - Planning efficiency: 95% first-time-right scheduling
   - Resource utilization: 85% team capacity utilization
   - Process automation: 95% automated workflows

2. **Quality Metrics**
   - Customer satisfaction: >4.5/5.0 rating
   - First-time completion rate: >95%
   - Rework percentage: <5%
   - Partner satisfaction: >4.0/5.0 rating

3. **Growth Metrics**
   - Partner onboarding rate: 10x current capacity
   - Order volume growth: 200% year-over-year
   - Geographic expansion: Optimized coverage
   - Revenue per partner: 25% increase

#### **Partner Performance KPIs**
**Current**: 391 active partners, 4 major integrations

**Volume Metrics:**
- Orders generated per partner per month
- Revenue contribution per partner
- Lead quality and conversion rates
- Geographic coverage and penetration

**Performance Metrics:**
- Order completion rates by partner
- Customer satisfaction by partner source
- Payment terms and collection rates
- Integration reliability and uptime

**Relationship Metrics:**
- Partner satisfaction scores
- Onboarding time and success rate
- Support ticket volume and resolution
- Contract renewal and expansion rates

### 3.2 Data Structure Requirements

#### **Customer Data Architecture**
**Scale**: 6,959 customers across 5 business entities

```
Customer Entity:
- Core Identity: ID, Name, Contact, Address
- Business Context: Entity source, Partner source, Acquisition date
- Lifecycle Status: Lead, Prospect, Customer, Inactive
- Interaction History: Touchpoints, Communications, Satisfaction
- Order History: Quotes, Orders, Visits, Payments
- Preferences: Communication, Scheduling, Service options
```

#### **Order & Visit Data Architecture**
**Scale**: 5,576 orders, 5,197 visits, 5,321 quotes

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

#### **Partner Data Architecture**
**Scale**: 391 partners with complex relationships

```
Partner Entity:
- Profile: Company details, Contacts, Capabilities
- Business Model: Lead transfer, Co-branded, Wholesale
- Performance: Volume metrics, Quality scores, Financial data
- Integration: API status, Data sync, Automation health
- Relationship: SLA terms, Satisfaction, Contract status
```

#### **Inventory Data Architecture**
**Current Gap**: Voorraden table empty in Smartsuite

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
**Make.com**: 37 scenarios, 45,124 operations
- Address Validation: 12,449 operations (27.6%)
- HubSpot-Smartsuite Sync: 8,203 operations (18.2%)
- Email Processing (AI): 4,848 operations (10.7%)
- Token Generation: 3,686 operations (8.2%)

**Partner Integrations:**
- Groendus: 3,254 operations (High Volume)
- Alva Charging: 4,848 operations (Email Processing)
- Eneco: 1,156 operations (Recent Integration)
- 50five: 96 operations (Lower Volume)

**Integration Patterns:**
- Webhooks: 34/37 scenarios (91.9%)
- Smartsuite API: 23/37 scenarios (62.2%) - Heavy usage requiring optimization
- HTTP APIs: 6/37 scenarios (16.2%)

### 4.2 Required System Integrations

#### **Core Platform Integrations (Priority 1)**

**1. Smartsuite Optimization**
- Current Usage: 23/37 scenarios (62.2% of automations)
- Data Volume: 57,445 records across 32 tables
- Requirements: API rate limiting, bulk operations, real-time sync, error handling
- Performance Target: <1 second response time

**2. Make.com Enhancement**
- Current Status: 37 active scenarios, API token needs update
- Requirements: Scenario optimization, enhanced error handling, scalability for 10x growth
- Target: 95% automation coverage

**3. HubSpot CRM Integration**
- Current Volume: 8,203 operations (18.2% of total)
- Requirements: Bi-directional sync, lead scoring, marketing automation, sales pipeline
- Data Sync: Real-time customer and lead updates

#### **Partner Integration Platform (Priority 1)**

**1. Standardized Partner API**
- Current Partners: 391 active, 4 major integrations
- Requirements: RESTful API, webhook support, authentication, self-service onboarding
- Scalability Target: Support 3,910+ partners (10x growth)

**2. Partner-Specific Integrations**
- Automotive Partners (Ford, Volvo, VanMossel, Kia): Vehicle sales integration, co-branded experience
- Energy Partners (Eneco, Essent, Tibber): Utility integration, energy plan coordination
- B2B Contractors: Installation companies and webshop integration

**3. B2B Marketplace Integration**
- ZaptecShop.nl & RatioShop.nl: Product catalog sync, inventory management, order fulfillment
- Requirements: Real-time pricing, availability updates, automated order processing

#### **Operational System Integrations (Priority 2)**

**1. Geographic & Routing Services**
- Current Usage: 12,449 address validation operations
- Requirements: Google Maps optimization, route planning, capacity planning, traffic integration
- Performance: Sub-second address validation

**2. Communication Platform Integration**
- Email Processing: 4,848 operations (AI-powered)
- Requirements: Multi-channel communication, automated notifications, template management
- Channels: Email, SMS, WhatsApp, in-app notifications

**3. Financial System Integration**
- Current: Snelstart + MoneyBird integration layer
- Requirements: Automated invoicing, multi-entity consolidation, partner commissions, revenue recognition

#### **Mobile & Field Operations Integration (Priority 2)**

**1. Mobile Application Backend**
- Field Teams: 7 regional teams, 5,197 visits
- Requirements: Offline capability, location tracking, photo upload, digital signatures
- Performance: Instant sync when online

**2. IoT & Device Integration**
- Charging Stations: Serial number tracking
- Requirements: Device registration, remote diagnostics, usage analytics, maintenance scheduling

### 4.3 Integration Architecture Requirements

#### **API Gateway & Management**
- Centralized API management and documentation
- Rate limiting and throttling
- Authentication and authorization (OAuth 2.0 / JWT)
- Monitoring and analytics
- Version management and deprecation

#### **Data Synchronization Strategy**
- Real-time sync for critical operations
- Batch processing for bulk operations
- Conflict resolution and data integrity
- Audit trails and change tracking
- Backup and disaster recovery

#### **Security & Compliance**
- Data encryption in transit and at rest
- GDPR compliance for customer data
- Partner data isolation and access control
- Security monitoring and threat detection
- Regular security audits and penetration testing

#### **Monitoring & Observability**
- Integration health monitoring
- Performance metrics and alerting
- Error tracking and resolution
- Usage analytics and optimization
- SLA monitoring and reporting

---

## 🎯 Implementation Roadmap

### Phase 1: Foundation (0-3 months)
- System consolidation (ClickUp → Smartsuite migration)
- API optimization (Make.com & Smartsuite)
- Inventory system activation
- Core automation enhancement

### Phase 2: Platform Development (3-6 months)
- Unified portal development
- Mobile application deployment
- Partner integration platform
- Advanced analytics implementation

### Phase 3: Scale & Optimize (6-12 months)
- 10x partner onboarding capability
- Predictive analytics and AI
- Advanced automation and optimization
- Performance monitoring and optimization

### Success Metrics
- **Technical**: 99.9% uptime, <1 second response times
- **Operational**: 95% automation coverage, 50% manual work reduction
- **Business**: 10x partner growth, 200% order volume increase
- **Quality**: >4.5/5.0 customer satisfaction, <5% rework rate 