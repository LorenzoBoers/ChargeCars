# ChargeCars - Nieuwe Database Architectuur
**HubSpot-Style Organization-Contact Model voor Schaalbaarheid & Flexibiliteit**

---

## 🎯 **Architectuur Filosofie**

### **Core Principle: Organization-Centric Design**
Net zoals HubSpot gebruiken we **Organizations** als primaire entiteiten met **Contacts** die daaraan gekoppeld zijn. Dit lost de complexe facturering en communicatie-uitdagingen op.

### **Voordelen van deze Aanpak:**
1. **Flexibele Facturering**: Line items kunnen aan elke organisatie worden toegewezen
2. **Consistente Communicatie**: Alle communicatie gelinkt aan contacts, gegroepeerd per organisatie
3. **Schaalbare Partner Management**: 10x groei mogelijk met automatisering
4. **Eenduidige Data**: Single source of truth voor alle relaties

---

## 📊 **DATABASE SCHEMA OVERZICHT**

### **🏢 Core Entities (HubSpot-Style)**

#### **1. organizations**
```sql
CREATE TABLE organization (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                    VARCHAR(255) NOT NULL,
    legal_name              VARCHAR(255),
    organization_type       organization_type_enum NOT NULL,
    parent_organization_id  UUID REFERENCES organizations(id),
    
    -- Contact Information
    primary_address_id      UUID REFERENCES addresses(id),
    billing_address_id      UUID REFERENCES addresses(id),
    website                 VARCHAR(255),
    phone                   VARCHAR(50),
    email                   VARCHAR(255),
    
    -- Business Details
    chamber_of_commerce     VARCHAR(50),
    vat_number             VARCHAR(50),
    tax_number             VARCHAR(50),
    
    -- ChargeCars Specific
    business_entity        business_entity_enum NOT NULL, -- ChargeCars, LaderThuis.nl, etc.
    partner_tier           partner_tier_enum,
    partner_status         partner_status_enum,
    commission_rate        DECIMAL(5,2),
    
    -- Operational
    service_regions        JSONB, -- Geographic coverage areas
    specializations        JSONB, -- Product/service focus areas
    onboarding_status      onboarding_status_enum,
    
    -- Metadata
    created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by             UUID REFERENCES contacts(id),
    updated_by             UUID REFERENCES contacts(id),
    is_active              BOOLEAN DEFAULT true
);

-- Enums
CREATE TYPE organization_type_enum AS ENUM (
    'customer_individual',      -- Particuliere klant
    'customer_business',        -- Zakelijke klant
    'partner_automotive',       -- Automotive dealer/OEM
    'partner_energy',          -- Energie maatschappij
    'partner_installer',       -- Installatie partner
    'supplier',                -- Leverancier
    'internal'                 -- ChargeCars entiteit
);

CREATE TYPE business_entity_enum AS ENUM (
    'chargecars',              -- B2B partner installations
    'laderthuis',              -- Consumer direct sales
    'meterkastthuis',          -- Electrical panel replacement
    'zaptecshop',              -- B2B wholesale
    'ratioshop'                -- B2B wholesale
);

CREATE TYPE partner_tier_enum AS ENUM (
    'platinum', 'gold', 'silver', 'bronze', 'starter'
);
```

#### **2. contacts**
```sql
CREATE TABLE contact (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id        UUID NOT NULL REFERENCES organizations(id),
    
    -- Personal Information
    first_name             VARCHAR(100) NOT NULL,
    last_name              VARCHAR(100) NOT NULL,
    email                  VARCHAR(255) UNIQUE NOT NULL,
    phone                  VARCHAR(50),
    mobile                 VARCHAR(50),
    
    -- Role & Permissions
    contact_type           contact_type_enum NOT NULL,
    job_title              VARCHAR(100),
    department             VARCHAR(100),
    is_primary_contact     BOOLEAN DEFAULT false,
    is_billing_contact     BOOLEAN DEFAULT false,
    is_technical_contact   BOOLEAN DEFAULT false,
    
    -- Hierarchical Access Control
    access_level           access_level_enum NOT NULL,
    access_scope_organization_id UUID REFERENCES organizations(id), -- Which org hierarchy they can access
    
    -- Portal Access
    has_portal_access      BOOLEAN DEFAULT false,
    portal_role            portal_role_enum,
    last_login             TIMESTAMP,
    
    -- Address (optional, can inherit from organization)
    address_id             UUID REFERENCES addresses(id),
    
    -- Communication Preferences
    communication_preferences JSONB,
    language_preference    VARCHAR(5) DEFAULT 'nl',
    
    -- Metadata
    created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active              BOOLEAN DEFAULT true,
    last_interaction       TIMESTAMP
);

CREATE TYPE contact_type_enum AS ENUM (
    'customer',                -- Eindklant contact
    'partner_manager',         -- Partner account manager
    'partner_technical',       -- Partner technisch contact
    'partner_billing',         -- Partner financieel contact
    'partner_sales_agent',     -- Partner sales agent (dealer level)
    'internal_sales',          -- ChargeCars sales
    'internal_operations',     -- ChargeCars operations
    'internal_technical',      -- ChargeCars technical
    'supplier_contact'         -- Leverancier contact
);

CREATE TYPE access_level_enum AS ENUM (
    'global_admin',            -- ChargeCars: alle data
    'internal_user',           -- ChargeCars: beperkte toegang
    'partner_admin',           -- Partner: hele organisatie hiërarchie
    'sub_partner_admin',       -- Sub-partner: eigen tak + onderliggende
    'location_admin',          -- Locatie: alleen eigen locatie
    'sales_agent',             -- Sales: alleen eigen toegewezen orders
    'read_only'                -- Alleen lezen, geen wijzigingen
);

CREATE TYPE portal_role_enum AS ENUM (
    'partner_manager',         -- Volledige partner management
    'dealer_manager',          -- Dealer locatie management
    'sales_representative',    -- Sales agent
    'technical_contact',       -- Technische ondersteuning
    'billing_contact',         -- Financiële contactpersoon
    'view_only'                -- Alleen bekijken
);
```

### **🛒 Order & Quote Management**

#### **3. orders (dossiers)**
```sql
CREATE TABLE order (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number           VARCHAR(50) UNIQUE NOT NULL,
    
    -- Primary Relationships
    customer_organization_id UUID NOT NULL REFERENCES organizations(id),
    partner_organization_id  UUID REFERENCES organizations(id),
    primary_contact_id      UUID NOT NULL REFERENCES contacts(id),
    
    -- Order Details
    order_type             order_type_enum NOT NULL,
    business_entity        business_entity_enum NOT NULL,
    order_status           order_status_enum NOT NULL,
    
    -- Installation Details
    installation_address_id UUID REFERENCES addresses(id),
    installation_type      installation_type_enum,
    complexity_score       INTEGER, -- 1-10 voor AI planning
    
    -- Financial
    total_amount           DECIMAL(10,2),
    total_cost             DECIMAL(10,2),
    margin_percentage      DECIMAL(5,2),
    payment_terms          payment_terms_enum,
    
    -- Planning
    requested_date         DATE,
    planned_start_date     DATE,
    planned_completion_date DATE,
    actual_completion_date DATE,
    
    -- Metadata
    created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by             UUID REFERENCES contacts(id),
    notes                  TEXT
);

CREATE TYPE order_type_enum AS ENUM (
    'installation',            -- Reguliere installatie
    'maintenance',             -- Onderhoud
    'webshop',                -- Webshop verkoop
    'accessories',            -- Losse accessoires
    'consultation'            -- Advies/consultancy
);

CREATE TYPE order_status_enum AS ENUM (
    'intake_completed',        -- Intake afgerond, pakket geselecteerd
    'quote_draft',            -- Account manager werkt aan offerte
    'quote_ready',            -- Offerte klaar voor review
    'quote_sent',             -- Offerte verzonden naar klant
    'quote_approved',         -- Offerte goedgekeurd
    'planning',               -- In planning fase
    'scheduled',              -- Ingepland
    'in_progress',            -- Wordt uitgevoerd
    'completed',              -- Voltooid
    'cancelled'               -- Geannuleerd
);
```

#### **4. quotes (offertes)**
```sql
CREATE TABLE quote (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_number           VARCHAR(50) UNIQUE NOT NULL,
    order_id               UUID NOT NULL REFERENCES orders(id),
    
    -- Quote Details
    quote_version          INTEGER DEFAULT 1,
    quote_status           quote_status_enum NOT NULL,
    valid_until            DATE NOT NULL,
    
    -- Financial
    total_amount           DECIMAL(10,2) NOT NULL,
    total_cost             DECIMAL(10,2),
    margin_percentage      DECIMAL(5,2),
    
    -- Approval Tracking
    requires_customer_approval      BOOLEAN DEFAULT true,
    requires_partner_approval       BOOLEAN DEFAULT false,
    customer_approved_at           TIMESTAMP,
    customer_approved_by           UUID REFERENCES contacts(id),
    partner_approved_at            TIMESTAMP,
    partner_approved_by            UUID REFERENCES contacts(id),
    
    -- Metadata
    created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by             UUID REFERENCES contacts(id)
);
```

### **🧾 Flexibele Line Items & Billing**

#### **5. line_items**
```sql
CREATE TABLE line_item (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id               UUID NOT NULL REFERENCES orders(id),
    quote_id               UUID REFERENCES quotes(id),
    
    -- Product/Service Details
    article_id             UUID REFERENCES articles(id),
    composite_article_id   UUID REFERENCES composite_articles(id),
    description            TEXT NOT NULL,
    
    -- Quantities & Pricing
    quantity               DECIMAL(10,3) NOT NULL,
    unit_price             DECIMAL(10,2) NOT NULL,
    cost_price             DECIMAL(10,2),
    total_amount           DECIMAL(10,2) NOT NULL,
    
    -- Flexible Billing Assignment (Organization OR Contact for individuals)
    billing_organization_id UUID REFERENCES organizations(id),
    billing_contact_id     UUID REFERENCES contacts(id),
    billing_type           billing_type_enum NOT NULL,
    
    -- Constraint: Either billing_organization_id OR billing_contact_id must be set
    CONSTRAINT check_billing_assignment CHECK (
        (billing_organization_id IS NOT NULL AND billing_contact_id IS NULL) OR
        (billing_organization_id IS NULL AND billing_contact_id IS NOT NULL)
    ),
    
    -- Visit Association (optional)
    visit_id               UUID REFERENCES visits(id),
    requires_installation  BOOLEAN DEFAULT false,
    
    -- Line Item Status
    line_item_status       line_item_status_enum NOT NULL,
    
    -- Package Association (if line item originated from package explosion)
    parent_line_item_id    UUID REFERENCES line_items(id), -- Reference to package line item
    is_package_component   BOOLEAN DEFAULT false, -- True if exploded from package
    package_price_locked   BOOLEAN DEFAULT false, -- True if part of fixed-price package
    
    -- Metadata
    created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    line_order             INTEGER -- Voor sortering
);

CREATE TYPE billing_type_enum AS ENUM (
    'customer_pays',           -- Klant betaalt (organization or individual)
    'partner_pays',            -- Partner betaalt
    'internal_cost',           -- Interne kosten
    'commission_fee',          -- Commissie fee
    'shared_cost',             -- Gedeelde kosten
    'individual_consumer'      -- Particuliere consument (direct billing to contact)
);

CREATE TYPE line_item_status_enum AS ENUM (
    'draft',                   -- Concept
    'quoted',                  -- In offerte
    'approved',                -- Goedgekeurd
    'ordered',                 -- Besteld
    'delivered',               -- Geleverd
    'installed',               -- Geïnstalleerd
    'invoiced',                -- Gefactureerd
    'completed'                -- Voltooid
);
```

#### **6. sign_offs (One sign-off for multiple line items)**
```sql
CREATE TABLE sign_off (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id               UUID NOT NULL REFERENCES orders(id),
    
    -- Who needs to sign off (Organization OR Contact for individuals)
    required_organization_id UUID REFERENCES organizations(id),
    required_contact_id     UUID REFERENCES contacts(id),
    sign_off_type          sign_off_type_enum NOT NULL,
    
    -- Sign-off Details
    is_signed              BOOLEAN DEFAULT false,
    signed_at              TIMESTAMP,
    signed_by              UUID REFERENCES contacts(id),
    signature_method       signature_method_enum,
    signature_data         JSONB, -- Digital signature blob/reference
    
    -- Optional Comments
    sign_off_notes         TEXT,
    rejection_reason       TEXT,
    
    -- Constraint: Either required_organization_id OR required_contact_id must be set
    CONSTRAINT check_sign_off_assignment CHECK (
        (required_organization_id IS NOT NULL AND required_contact_id IS NULL) OR
        (required_organization_id IS NULL AND required_contact_id IS NOT NULL)
    ),
    
    -- Metadata
    created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Junction table: Which line items are covered by which sign-offs
CREATE TABLE sign_off_line_item (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sign_off_id            UUID NOT NULL REFERENCES sign_offs(id) ON DELETE CASCADE,
    line_item_id           UUID NOT NULL REFERENCES line_items(id) ON DELETE CASCADE,
    
    -- Metadata
    created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique combination
    UNIQUE(sign_off_id, line_item_id)
);

CREATE TYPE sign_off_type_enum AS ENUM (
    'customer_approval',       -- Klant goedkeuring
    'partner_approval',        -- Partner goedkeuring
    'technical_approval',      -- Technische goedkeuring
    'financial_approval',      -- Financiële goedkeuring
    'delivery_confirmation',   -- Ontvangst bevestiging
    'installation_confirmation' -- Installatie bevestiging
);
```

### **📦 Package & Pricing Management**

#### **7. articles**
```sql
CREATE TABLE article (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_number         VARCHAR(100) UNIQUE NOT NULL,
    name                   VARCHAR(255) NOT NULL,
    description            TEXT,
    
    -- Product Details
    article_type           article_type_enum NOT NULL,
    category               VARCHAR(100),
    brand                  VARCHAR(100),
    model                  VARCHAR(100),
    
    -- Inventory Tracking
    requires_serial_number BOOLEAN DEFAULT false,
    requires_batch_tracking BOOLEAN DEFAULT false,
    track_warranty         BOOLEAN DEFAULT false,
    warranty_months        INTEGER,
    
    -- Specifications
    specifications         JSONB,
    installation_complexity INTEGER, -- 1-10 score
    installation_time_minutes INTEGER,
    
    -- Package Details (only for article_type = 'package')
    is_explodable          BOOLEAN DEFAULT false, -- True for packages
    fixed_package_price    DECIMAL(10,2), -- Fixed price for packages
    auto_explode           BOOLEAN DEFAULT true, -- Auto-expand to components when added to quote
    
    -- Status
    is_active              BOOLEAN DEFAULT true,
    is_sellable            BOOLEAN DEFAULT true,
    is_purchasable         BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE article_type_enum AS ENUM (
    'charging_station',        -- Laadstation
    'charging_cable',          -- Laadkabel
    'mounting_pole',           -- Laadpaal
    'electrical_component',    -- Elektrisch component
    'service_labor',           -- Service/arbeid
    'shipping',                -- Verzending
    'consultation',            -- Advies
    'accessory',               -- Accessoire
    'package'                  -- Pakket (kan worden geëxplodeerd naar componenten)
);
```

#### **8. article_components (package contents)**
```sql
CREATE TABLE article_component (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_article_id      UUID NOT NULL REFERENCES articles(id), -- Package article
    component_article_id   UUID NOT NULL REFERENCES articles(id), -- Component article
    
    -- Component Configuration
    default_quantity       DECIMAL(10,3) NOT NULL,
    min_quantity           DECIMAL(10,3) DEFAULT 0,
    max_quantity           DECIMAL(10,3),
    is_optional            BOOLEAN DEFAULT false,
    is_configurable        BOOLEAN DEFAULT true,
    
    -- Field Service Instructions
    installation_sequence  INTEGER, -- Order of installation
    special_instructions   TEXT,
    requires_specialist    BOOLEAN DEFAULT false,
    
    -- Display & Grouping
    sort_order             INTEGER,
    component_group        VARCHAR(100), -- E.g., "Hardware", "Installation", "Accessories"
    
    -- Metadata
    created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT check_not_self_reference CHECK (parent_article_id != component_article_id),
    CONSTRAINT unique_parent_component UNIQUE(parent_article_id, component_article_id)
);
```

#### **10. price_agreements**
```sql
CREATE TABLE price_agreements (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Agreement Scope
    organization_id        UUID REFERENCES organizations(id), -- NULL = default pricing
    article_id             UUID REFERENCES articles(id),
    composite_article_id   UUID REFERENCES composite_articles(id),
    
    -- Pricing Details
    price_type             price_type_enum NOT NULL,
    unit_price             DECIMAL(10,2),
    cost_price             DECIMAL(10,2),
    margin_percentage      DECIMAL(5,2),
    
    -- Agreement Terms
    valid_from             DATE NOT NULL,
    valid_until            DATE,
    min_quantity           DECIMAL(10,3),
    max_quantity           DECIMAL(10,3),
    
    -- Pricing Rules
    quantity_breaks        JSONB, -- Volume discounts
    seasonal_adjustments   JSONB, -- Seasonal pricing
    regional_adjustments   JSONB, -- Regional pricing
    
    -- Status
    is_active              BOOLEAN DEFAULT true,
    priority               INTEGER DEFAULT 0, -- Higher priority wins
    
    -- Metadata
    created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by             UUID REFERENCES contacts(id)
);

CREATE TYPE price_type_enum AS ENUM (
    'standard',                -- Standaard prijs
    'partner_cost',            -- Partner inkoopprijs
    'partner_sell',            -- Partner verkoopprijs
    'customer_special',        -- Klant speciale prijs
    'volume_discount',         -- Volume korting
    'promotional'              -- Promotie prijs
);
```

### **📅 Planning & Execution**

#### **11. visits (bezoeken)**
```sql
CREATE TABLE visit (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_number           VARCHAR(50) UNIQUE NOT NULL,
    order_id               UUID NOT NULL REFERENCES orders(id),
    
    -- Visit Details
    visit_type             visit_type_enum NOT NULL,
    visit_status           visit_status_enum NOT NULL,
    sequence_number        INTEGER, -- Voor meerdere bezoeken per order
    
    -- Scheduling
    scheduled_date         DATE,
    scheduled_time_slot    time_slot_enum,
    estimated_duration     INTEGER, -- Minutes
    actual_start_time      TIMESTAMP,
    actual_end_time        TIMESTAMP,
    
    -- Team Assignment
    assigned_team_id       UUID REFERENCES teams(id),
    primary_technician_id  UUID REFERENCES contacts(id),
    secondary_technician_id UUID REFERENCES contacts(id),
    
    -- Location
    visit_address_id       UUID NOT NULL REFERENCES addresses(id),
    access_instructions    TEXT,
    special_requirements   TEXT,
    
    -- Geographic Planning
    postal_code            VARCHAR(10),
    region_code            VARCHAR(10),
    travel_distance_km     DECIMAL(6,2),
    
    -- Completion Details
    completion_notes       TEXT,
    customer_satisfaction  INTEGER, -- 1-5 rating
    quality_score          INTEGER, -- 1-10 internal rating
    
    -- Metadata
    created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE visit_type_enum AS ENUM (
    'survey',                  -- Opname bezoek
    'installation',            -- Installatie bezoek
    'maintenance',             -- Onderhoud bezoek
    'repair',                  -- Reparatie bezoek
    'upgrade',                 -- Upgrade bezoek
    'inspection'               -- Inspectie bezoek
);

CREATE TYPE time_slot_enum AS ENUM (
    'morning',                 -- Ochtend (08:00-12:00)
    'afternoon',               -- Middag (12:00-17:00)
    'full_day'                 -- Hele dag (08:00-17:00)
);
```

### **📋 Intake & Forms Management**

#### **11. intake_forms**
```sql
CREATE TABLE intake_form (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_name              VARCHAR(255) NOT NULL,
    form_version           VARCHAR(50) NOT NULL,
    
    -- Form Configuration
    form_type              form_type_enum NOT NULL,
    is_active              BOOLEAN DEFAULT true,
    is_default             BOOLEAN DEFAULT false,
    
    -- Partner/Organization Specific
    organization_id        UUID REFERENCES organizations(id), -- NULL = global form
    business_entity        business_entity_enum, -- Which ChargeCars entity
    
    -- Custom Fields Configuration (JSON schema)
    custom_fields_schema   JSONB NOT NULL, -- Field definitions, validation rules, UI config
    
    -- Integration
    fillout_form_id        VARCHAR(100), -- External Fillout form ID
    webhook_url            VARCHAR(500), -- For form submissions
    
    -- Workflow
    auto_create_order      BOOLEAN DEFAULT true,
    default_order_status   order_status_enum DEFAULT 'intake_completed',
    
    -- Metadata
    created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by             UUID REFERENCES contacts(id),
    
    -- Ensure unique active default per organization/entity
    CONSTRAINT unique_default_form UNIQUE(organization_id, business_entity, is_default) 
    WHERE is_default = true
);

CREATE TYPE form_type_enum AS ENUM (
    'customer_intake',         -- Klant intake formulier
    'partner_onboarding',      -- Partner onboarding
    'product_configuration',   -- Product configuratie
    'site_survey',            -- Locatie opname
    'maintenance_request',     -- Onderhoud aanvraag
    'lead_capture',           -- Lead vastleggen
    'quote_request'           -- Offerte aanvraag
);
```

#### **12. form_submissions**
```sql
CREATE TABLE form_submission (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intake_form_id         UUID NOT NULL REFERENCES intake_forms(id),
    submission_number      VARCHAR(50) UNIQUE NOT NULL, -- Human readable ID
    
    -- Submission Details
    custom_fields_data     JSONB NOT NULL, -- All custom form field values
    submitted_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Contact Information (extracted from custom fields or separate)
    submitter_email        VARCHAR(255),
    submitter_phone        VARCHAR(50),
    submitter_name         VARCHAR(255),
    contact_id             UUID REFERENCES contacts(id), -- If known contact
    
    -- Address Information (if provided)
    installation_address   JSONB, -- Address details from form
    billing_address        JSONB, -- Billing address if different
    
    -- Source Tracking
    source_url             VARCHAR(500),
    source_partner_id      UUID REFERENCES organizations(id),
    utm_parameters         JSONB,
    session_id             VARCHAR(100),
    referrer               VARCHAR(500),
    
    -- Processing Status
    processing_status      submission_status_enum NOT NULL DEFAULT 'pending',
    processed_at           TIMESTAMP,
    processed_by           UUID REFERENCES contacts(id),
    processing_notes       TEXT,
    
    -- Auto-created Records
    created_order_id       UUID REFERENCES orders(id),
    created_organization_id UUID REFERENCES organizations(id), -- If new customer org created
    created_contact_id     UUID REFERENCES contacts(id), -- If new contact created
    
    -- Validation & Quality
    is_valid               BOOLEAN DEFAULT true,
    validation_errors      JSONB,
    data_quality_score     INTEGER, -- 1-100
    
    -- Integration
    fillout_submission_id  VARCHAR(100), -- External submission ID
    
    -- Totals (calculated from line items)
    total_estimated_amount DECIMAL(10,2),
    total_estimated_cost   DECIMAL(10,2),
    
    -- Metadata
    ip_address             INET,
    user_agent             TEXT,
    created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE submission_status_enum AS ENUM (
    'pending',                 -- Nog niet verwerkt
    'processing',              -- Wordt verwerkt
    'completed',               -- Succesvol verwerkt
    'failed',                  -- Verwerking gefaald
    'duplicate',               -- Duplicate submission
    'invalid',                 -- Ongeldige data
    'manual_review',           -- Handmatige review vereist
    'converted_to_order'       -- Successfully converted to order
);
```

#### **13. submission_line_items**
```sql
CREATE TABLE submission_line_item (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_submission_id     UUID NOT NULL REFERENCES form_submissions(id) ON DELETE CASCADE,
    
    -- Product/Service Details
    article_id             UUID REFERENCES articles(id), -- If known article
    package_id             UUID REFERENCES articles(id), -- If package selected
    description            TEXT NOT NULL,
    
    -- Customer Selections/Preferences
    quantity               DECIMAL(10,3) NOT NULL DEFAULT 1,
    estimated_unit_price   DECIMAL(10,2),
    estimated_total_price  DECIMAL(10,2),
    
    -- Configuration Details (from form)
    configuration_data     JSONB, -- Product specific config from form
    customer_preferences   JSONB, -- Customer specific preferences
    
    -- Derived from Form Fields
    category               VARCHAR(100), -- E.g., "charging_station", "installation", "accessories"
    priority               INTEGER DEFAULT 1, -- Customer priority
    is_required            BOOLEAN DEFAULT true,
    is_optional_upgrade    BOOLEAN DEFAULT false,
    
    -- Status
    item_status            submission_item_status_enum DEFAULT 'selected',
    
    -- Metadata
    line_order             INTEGER, -- Display order
    created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE submission_item_status_enum AS ENUM (
    'selected',                -- Customer selected this
    'recommended',             -- System recommended
    'optional',                -- Optional upgrade
    'removed',                 -- Removed during processing
    'converted'                -- Converted to order line item
);
```

#### **14. submission_files**
```sql
CREATE TABLE submission_file (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_submission_id     UUID NOT NULL REFERENCES form_submissions(id) ON DELETE CASCADE,
    
    -- File Details
    file_name              VARCHAR(255) NOT NULL,
    original_file_name     VARCHAR(255) NOT NULL,
    file_size_bytes        BIGINT NOT NULL,
    mime_type              VARCHAR(100) NOT NULL,
    file_extension         VARCHAR(10),
    
    -- File Storage
    storage_provider       storage_provider_enum NOT NULL,
    storage_path           VARCHAR(500) NOT NULL, -- Path in storage system
    storage_url            VARCHAR(500), -- Public URL if applicable
    
    -- File Classification
    file_category          file_category_enum NOT NULL,
    subject                VARCHAR(255) NOT NULL, -- What's shown in the image/document
    extra_description      TEXT, -- Additional explanation if needed
    
    -- Image Specific (if applicable)
    image_width            INTEGER,
    image_height           INTEGER,
    thumbnail_path         VARCHAR(500),
    
    -- Form Context
    form_field_name        VARCHAR(100), -- Which form field this file came from
    upload_context         JSONB, -- Additional context about upload
    
    -- Processing Status
    is_processed           BOOLEAN DEFAULT false,
    processing_status      file_processing_status_enum DEFAULT 'pending',
    processing_notes       TEXT,
    
    -- Quality & Analysis
    is_valid_image         BOOLEAN,
    contains_sensitive_data BOOLEAN DEFAULT false,
    auto_extracted_text    TEXT, -- OCR results if applicable
    ai_analysis_results    JSONB, -- AI analysis of image content
    
    -- Access Control
    is_public              BOOLEAN DEFAULT false,
    requires_authentication BOOLEAN DEFAULT true,
    
    -- Metadata
    uploaded_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at           TIMESTAMP,
    created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE storage_provider_enum AS ENUM (
    'aws_s3',                  -- Amazon S3
    'azure_blob',              -- Azure Blob Storage
    'google_cloud',            -- Google Cloud Storage
    'local_filesystem',        -- Local server storage
    'xano_files'               -- Xano file storage
);

CREATE TYPE file_category_enum AS ENUM (
    'electrical_panel',        -- Foto van meterkast
    'installation_location',   -- Locatie waar geladen wordt
    'existing_wiring',         -- Bestaande bedrading
    'property_exterior',       -- Buitenkant pand
    'parking_area',            -- Parkeerplaats
    'identification_document', -- ID/passport
    'utility_bill',            -- Energierekening
    'building_permit',         -- Bouwvergunning
    'electrical_diagram',      -- Elektrisch schema
    'site_survey',             -- Locatie opname
    'damage_report',           -- Schade rapport
    'completion_photo',        -- Voltooiing foto
    'other_document',          -- Overig document
    'signature'                -- Handtekening
);

CREATE TYPE file_processing_status_enum AS ENUM (
    'pending',                 -- Wacht op verwerking
    'processing',              -- Wordt verwerkt
    'completed',               -- Verwerking voltooid
    'failed',                  -- Verwerking gefaald
    'virus_detected',          -- Virus gedetecteerd
    'inappropriate_content',   -- Ongepaste inhoud
    'corrupted',               -- Bestand beschadigd
    'too_large',               -- Te groot bestand
    'unsupported_format'       -- Niet ondersteund formaat
);
```

---

## 🏢 **HIERARCHICAL ACCESS CONTROL**

### **Organization Hierarchy Voorbeeld:**
```
ChargeCars (internal)
├── Volvo (Partner - Automotive)
│   ├── Van Mossel Groep (Sub-partner - Conglomeraat)
│   │   ├── Van Mossel Volvo Amsterdam (Dealer Locatie)
│   │   │   ├── Sales Agent 1
│   │   │   └── Sales Agent 2  
│   │   └── Van Mossel Volvo Utrecht (Dealer Locatie)
│   │       ├── Sales Agent 3
│   │       └── Sales Agent 4
│   └── Stern Groep (Sub-partner - Conglomeraat)
│       ├── Stern Volvo Rotterdam (Dealer Locatie)
│       └── Stern Volvo Den Haag (Dealer Locatie)
└── Eneco (Partner - Energy)
    ├── Eneco Zakelijk (Sub-partner)
    └── Eneco Retail (Sub-partner)
```

### **Access Level Permissions:**

#### **Global Admin (ChargeCars)**
```sql
-- Ziet alle orders van alle organisaties
SELECT * FROM orders; -- Geen filtering nodig
```

#### **Partner Admin (Volvo Manager)**
```sql
-- Ziet alle orders binnen hele Volvo hiërarchie
WITH org_hierarchy AS (
    SELECT id FROM organizations 
    WHERE id = @volvo_org_id
    UNION ALL
    SELECT o.id FROM organizations o
    JOIN org_hierarchy oh ON o.parent_organization_id = oh.id
)
SELECT o.* FROM orders o
JOIN org_hierarchy oh ON (
    o.customer_organization_id = oh.id OR 
    o.partner_organization_id = oh.id
);
```

#### **Sub-Partner Admin (Van Mossel Groep Manager)**
```sql
-- Ziet orders van Van Mossel en alle onderliggende dealers
WITH sub_hierarchy AS (
    SELECT id FROM organizations 
    WHERE id = @van_mossel_org_id
    UNION ALL
    SELECT o.id FROM organizations o
    JOIN sub_hierarchy sh ON o.parent_organization_id = sh.id
)
SELECT o.* FROM orders o
JOIN sub_hierarchy sh ON o.customer_organization_id = sh.id;
```

#### **Location Admin (Dealer Manager)**
```sql
-- Ziet alleen orders van eigen dealer locatie
SELECT o.* FROM orders o
WHERE o.customer_organization_id = @dealer_location_org_id;
```

#### **Sales Agent**
```sql
-- Ziet alleen eigen toegewezen orders
SELECT o.* FROM orders o
WHERE o.primary_contact_id = @sales_agent_contact_id;
```

### **Portal Access Setup Examples:**

#### **Volvo Hiërarchie Setup:**
```sql
-- Volvo Partner Organization
INSERT INTO organizations (name, organization_type, parent_organization_id)
VALUES ('Volvo Cars Nederland', 'partner_automotive', NULL);

-- Van Mossel Conglomeraat
INSERT INTO organizations (name, organization_type, parent_organization_id)
VALUES ('Van Mossel Groep', 'partner_automotive', @volvo_org_id);

-- Individual Dealers
INSERT INTO organizations (name, organization_type, parent_organization_id)
VALUES 
('Van Mossel Volvo Amsterdam', 'partner_automotive', @van_mossel_org_id),
('Van Mossel Volvo Utrecht', 'partner_automotive', @van_mossel_org_id);

-- Contacts met hiërarchische toegang
INSERT INTO contacts (
    organization_id, 
    first_name, 
    last_name, 
    email,
    access_level,
    access_scope_organization_id,
    has_portal_access,
    portal_role
) VALUES 
-- Volvo Manager: ziet hele Volvo hiërarchie
(@volvo_org_id, 'Jan', 'Jansen', 'j.jansen@volvo.com', 'partner_admin', @volvo_org_id, true, 'partner_manager'),

-- Van Mossel Manager: ziet Van Mossel + onderliggende dealers
(@van_mossel_org_id, 'Piet', 'Peters', 'p.peters@vanmossel.com', 'sub_partner_admin', @van_mossel_org_id, true, 'dealer_manager'),

-- Dealer Manager: alleen eigen locatie
(@dealer_amsterdam_org_id, 'Marie', 'Martens', 'm.martens@vanmossel.com', 'location_admin', @dealer_amsterdam_org_id, true, 'dealer_manager'),

-- Sales Agent: alleen eigen orders
(@dealer_amsterdam_org_id, 'Tom', 'Timmermans', 't.timmermans@vanmossel.com', 'sales_agent', @dealer_amsterdam_org_id, true, 'sales_representative');
```

### **Access Control Helper Functions:**
```sql
-- Function: Get all organizations user can access
CREATE OR REPLACE FUNCTION get_accessible_organizations(user_contact_id UUID)
RETURNS TABLE(organization_id UUID) AS $$
DECLARE
    user_access_level access_level_enum;
    user_scope_org_id UUID;
BEGIN
    SELECT access_level, access_scope_organization_id 
    INTO user_access_level, user_scope_org_id
    FROM contacts WHERE id = user_contact_id;
    
    CASE user_access_level
        WHEN 'global_admin', 'internal_user' THEN
            -- ChargeCars users: alle organisaties
            RETURN QUERY SELECT o.id FROM organizations o;
            
        WHEN 'partner_admin', 'sub_partner_admin' THEN
            -- Partner/Sub-partner: eigen hiërarchie
            RETURN QUERY 
            WITH RECURSIVE org_tree AS (
                SELECT id FROM organizations WHERE id = user_scope_org_id
                UNION ALL
                SELECT o.id FROM organizations o
                JOIN org_tree ot ON o.parent_organization_id = ot.id
            )
            SELECT id FROM org_tree;
            
        WHEN 'location_admin' THEN
            -- Locatie admin: alleen eigen organisatie
            RETURN QUERY SELECT user_scope_org_id;
            
        WHEN 'sales_agent' THEN
            -- Sales agent: alleen waar ze contact bij zijn
            RETURN QUERY 
            SELECT DISTINCT o.customer_organization_id 
            FROM orders o WHERE o.primary_contact_id = user_contact_id;
    END CASE;
END;
$$ LANGUAGE plpgsql;
```

---

## 📦 **PACKAGE WORKFLOW EXPLANATION**

### **Packages als Normale Artikelen met Explode Functionaliteit:**

1. **Package Setup (Artikelen Database):**
   ```sql
   -- Maak package artikel aan
   INSERT INTO articles (article_number, name, article_type, is_explodable, fixed_package_price, auto_explode)
   VALUES ('PKG-001', 'Standaard Wallbox Pakket', 'package', true, 1299.00, true);
   
   -- Definieer package componenten
   INSERT INTO article_components (parent_article_id, component_article_id, default_quantity, installation_sequence)
   VALUES 
   (@package_id, @wallbox_id, 1, 1),
   (@package_id, @kabel_id, 1, 2),
   (@package_id, @installatie_service_id, 1, 3);
   ```

2. **Quote Creation - Package toevoegen:**
   ```sql
   -- Account manager voegt package toe als line item
   INSERT INTO line_items (order_id, quote_id, article_id, quantity, unit_price)
   VALUES (@order_id, @quote_id, @package_id, 1, 1299.00);
   ```

3. **Auto-Explode naar Componenten:**
   ```sql
   -- System explodeert automatisch package naar componenten (als auto_explode = true)
   INSERT INTO line_items (
       order_id, 
       quote_id,
       article_id, 
       quantity,
       unit_price,
       parent_line_item_id,
       is_package_component,
       package_price_locked,
       billing_organization_id
   )
   SELECT 
       @order_id,
       @quote_id,
       ac.component_article_id,
       ac.default_quantity,
       0.00, -- Component items hebben geen eigen prijs
       @package_line_item_id,
       true,
       true,
       @customer_org_id
   FROM article_components ac
   WHERE ac.parent_article_id = @package_id;
   ```

4. **Account Manager Configuration:**
   ```sql
   -- Account manager past component quantities aan
   UPDATE line_items 
   SET quantity = 2 -- Van 1 naar 2 wallboxes
   WHERE parent_line_item_id = @package_line_item_id 
   AND article_id = @wallbox_id;
   
   -- Voeg extra component toe
   INSERT INTO line_items (quote_id, article_id, quantity, parent_line_item_id, is_package_component)
   VALUES (@quote_id, @extra_kabel_id, 1, @package_line_item_id, true);
   
   -- Package line item prijs blijft €1299
   ```

### **Field Service View:**
```sql
-- Field service ziet alle individuele componenten met instructies
SELECT 
    li.quantity,
    a.name,
    a.article_number,
    ac.installation_sequence,
    ac.special_instructions,
    ac.component_group
FROM line_items li
JOIN articles a ON li.article_id = a.id
LEFT JOIN article_components ac ON a.id = ac.component_article_id
WHERE li.visit_id = @visit_id 
AND li.is_package_component = true
ORDER BY ac.installation_sequence;
```

### **Voordelen van Package-as-Article Approach:**
- **🔄 Standard Workflow**: Packages zijn gewoon artikelen, geen speciale behandeling
- **📋 Inventory Management**: Alle componenten zichtbaar voor planning & stock
- **🔧 Field Service Ready**: Monteurs zien exacte componenten met instructies  
- **💰 Flexible Billing**: Package op factuur, componenten voor operationeel overzicht
- **📊 Reporting**: Duidelijk onderscheid package verkoop vs component usage

---

## 🔗 **RELATIONSHIP MAPPING**

### **Key Relationships:**
```
Organizations (1) → (M) Contacts
Organizations (1) → (M) Orders [as customer or partner]
Orders (1) → (M) Quotes
Orders (1) → (M) Line Items  
Orders (1) → (M) Visits
Orders (1) → (M) Sign-offs
Sign-offs (1) → (M) Line Items [via sign_off_line_items junction table]
Articles (1) → (M) Article Components [package definitions]
Articles (1) → (M) Line Items [packages and components both as line items]
Line Items (1) → (M) Line Items [package → component hierarchy via parent_line_item_id]
Articles (1) → (M) Price Agreements

-- NEW: Intake Forms Integration
Intake Forms (1) → (M) Form Submissions
Form Submissions (1) → (M) Submission Line Items
Form Submissions (1) → (M) Submission Files
Form Submissions (1) → (1) Orders [via created_order_id after conversion]
Submission Line Items → Line Items [conversion during order creation]
```

### **Flexible Billing Flow:**
```
Order → Line Items → Billing (Organizations OR Contacts)
Line Items → Sign-offs (grouped approval for multiple items)
Organizations/Contacts → Invoicing (multiple billing entities per order)
```

### **Individual Consumer Billing:**
```
Consumer Contact (no organization) → Line Items (billing_contact_id)
Individual Sign-offs → Contact approval (required_contact_id)
Direct invoicing → Contact billing details
```

### **Intake → Order Conversion Flow:**
```
Form Submission → Submission Line Items → Processing → Order Creation → Quote Line Items
             ↘ Submission Files → File Processing → Order Attachments
```

---

## 📈 **MIGRATION STRATEGY VAN HUIDIGE SMARTSUITE**

### **Phase 1: Core Data Migration**
1. **Organisaties** → `organization` (391 records)
2. **Eindklanten** → Extract contacts → `organization` + `contact` (6,959)
3. **Producten** → `article` (product catalog)

### **Phase 2: Operational Data**
4. **Orders** → `order` (5,576 records)
5. **Offertes** → `quote` (5,321 records)
6. **Bezoeken** → `visit` (5,197 records)

### **Phase 3: Line Items & New Features**
7. Create `line_item` from current order data
8. Build `composite_articles` and `price_agreements`
9. Implement `line_item_sign_offs` workflow

---

## 🎯 **VOORDELEN VAN NIEUWE ARCHITECTUUR**

### **1. Flexibele Facturering**
- Line items kunnen aan elke organisatie worden toegewezen
- Meerdere facturen per order mogelijk
- Automatische commissie berekening

### **2. Schaalbare Sign-off Workflow**
- Sign-offs per line item in plaats van per offerte
- Flexibel: nieuwe items kunnen altijd worden toegevoegd
- Digital signature support

### **3. Intelligente Pakket Management**
- **Vaste pakketprijzen** ongeacht inhoud aanpassingen
- Configureerbare standaard artikelen per pakket
- Flexibele line item aanpassingen binnen pakket
- Stock management per individueel artikel

### **4. HubSpot-Style CRM**
- Alle communicatie gelinkt aan contacts
- Organisatie hiërarchie support
- Partner portal ready

### **5. AI-Ready Planning**
- Complexity scoring voor predictive planning
- Geographic optimization support
- Performance metrics per technician

### **6. Hierarchical Partner Management**
- **Multi-level Access Control**: Sales agents → Dealer managers → Conglomerates → Partners
- **Herbruikbare Structuur**: Werkt voor automotive, energy, of andere hiërarchieën  
- **Flexible Portal Roles**: Van view-only tot full management rechten
- **Audit Trail**: Wie heeft welke data wanneer bekeken/gewijzigd

---

## ✅ **AANGEPASTE ARCHITECTUUR - ALLE REQUIREMENTS GEÏMPLEMENTEERD**

### **Opgeloste Issues:**

1. **✅ Individual Consumer Billing**
   - Line items kunnen naar Organizations ÓF Contacts
   - Billing type 'individual_consumer' toegevoegd
   - Database constraints zorgen voor correcte toewijzing

2. **✅ Sign-offs: One-to-Many (1 sign-off → meerdere line items)**
   - `sign_off` table met `sign_off_line_item` junction table
   - Klant kan alle installatie items in 1 keer goedkeuren
   - Flexibel systeem voor verschillende approval workflows

3. **✅ Fixed Package Pricing System**
   - `fixed_package_price` in composite_articles
   - `package_price_locked` in line_items  
   - Standaard artikelen kopiëren naar line items
   - Line items aanpasbaar, totaalprijs blijft vast

### **Implementatie Voordelen:**
- **Particuliere Klanten**: Direct billing zonder organisatie
- **Efficiënte Approvals**: Bulk goedkeuring van gerelateerde items
- **Pakket Flexibiliteit**: Aanpassingen mogelijk, prijs gegarandeerd
- **Schaalbare Architectuur**: Ondersteunt 10x groei naar 3,910+ partners

Zijn er nog andere aspecten die aangepast moeten worden? 

## 📝 **INTAKE FORMS - PRACTICAL EXAMPLES**

### **Custom Fields Schema Example:**
```json
{
  "fields": [
    {
      "name": "customer_type",
      "type": "select",
      "label": "Type klant",
      "required": true,
      "options": [
        {"value": "private", "label": "Particulier"},
        {"value": "business", "label": "Zakelijk"},
        {"value": "fleet", "label": "Wagenpark"}
      ]
    },
    {
      "name": "installation_address",
      "type": "address",
      "label": "Installatie adres",
      "required": true,
      "validation": {
        "postal_code_required": true,
        "dutch_postal_code": true
      }
    },
    {
      "name": "electrical_panel_photos",
      "type": "file_upload",
      "label": "Foto's meterkast",
      "required": true,
      "accept": "image/*",
      "max_files": 5,
      "file_category": "electrical_panel"
    },
    {
      "name": "charging_needs",
      "type": "checkbox_group",
      "label": "Laadbehoeften",
      "options": [
        {"value": "home_charging", "label": "Thuis laden", "default_selected": true},
        {"value": "guest_charging", "label": "Gasten kunnen laden"},
        {"value": "solar_integration", "label": "Koppeling met zonnepanelen"}
      ]
    },
    {
      "name": "preferred_package",
      "type": "package_selector",
      "label": "Gewenst pakket",
      "required": true,
      "packages": ["PKG-001", "PKG-002", "PKG-003"],
      "show_pricing": true
    }
  ],
  "conditional_logic": [
    {
      "if": {"customer_type": "business"},
      "then": {"show_fields": ["company_details", "vat_number"]}
    }
  ]
}
```

### **Complete Intake Submission Example:**

#### **1. Form Submission with Custom Fields:**
```sql
INSERT INTO form_submissions (
    intake_form_id,
    submission_number,
    custom_fields_data,
    submitter_email,
    submitter_name,
    installation_address,
    source_partner_id,
    utm_parameters
) VALUES (
    @intake_form_id,
    'SUB-2024-001234',
    '{
        "customer_type": "private",
        "installation_address": {
            "street": "Hoofdstraat 123",
            "postal_code": "1234AB",
            "city": "Amsterdam"
        },
        "charging_needs": ["home_charging", "solar_integration"],
        "preferred_package": "PKG-001",
        "current_ev": "Tesla Model 3",
        "installation_urgency": "within_month",
        "special_requirements": "Instalatie tegen garagemuur"
    }',
    'j.jansen@email.com',
    'Jan Jansen',
    '{"street": "Hoofdstraat 123", "postal_code": "1234AB", "city": "Amsterdam"}',
    @volvo_partner_id,
    '{"utm_source": "google", "utm_campaign": "ev_charging_2024"}'
);
```

#### **2. Auto-Generated Line Items from Form:**
```sql
-- Based on preferred_package "PKG-001" and charging_needs selections
INSERT INTO submission_line_items (
    form_submission_id,
    article_id,
    description,
    quantity,
    estimated_unit_price,
    configuration_data,
    category,
    is_required
) VALUES
-- Main package
(@submission_id, 'PKG-001', 'Standaard Wallbox Pakket', 1, 1299.00, 
 '{"package_variant": "standard", "selected_from_form": true}', 'package', true),

-- Solar integration add-on (from charging_needs)
(@submission_id, 'ADD-SOLAR-001', 'Zonnepanelen koppeling', 1, 299.00,
 '{"integration_type": "smart_charging", "auto_added": true}', 'addon', false),

-- Installation service
(@submission_id, 'SRV-INST-001', 'Installatie service', 1, 350.00,
 '{"complexity": "standard", "location": "garage_wall"}', 'service', true);
```

#### **3. File Uploads:**
```sql
INSERT INTO submission_files (
    form_submission_id,
    file_name,
    original_file_name,
    file_size_bytes,
    mime_type,
    storage_provider,
    storage_path,
    file_category,
    subject,
    form_field_name
) VALUES
(@submission_id, 'elec_panel_001.jpg', 'IMG_20240315_143022.jpg', 2048576, 'image/jpeg',
 'xano_files', '/uploads/submissions/2024/03/elec_panel_001.jpg', 'electrical_panel',
 'Hoofdschakelaar en groepenkast', 'electrical_panel_photos'),

(@submission_id, 'elec_panel_002.jpg', 'IMG_20240315_143055.jpg', 1875432, 'image/jpeg',
 'xano_files', '/uploads/submissions/2024/03/elec_panel_002.jpg', 'electrical_panel',
 'Meterkast binnenkant met ruimte voor laadpaal', 'electrical_panel_photos');
```

### **Conversion to Order Process:**

#### **1. Auto-Create Customer Organization & Contact:**
```sql
-- Create customer organization (for private customers)
INSERT INTO organizations (name, organization_type, business_entity)
VALUES ('Jan Jansen (Particulier)', 'customer_individual', 'chargecars');

-- Create contact
INSERT INTO contacts (organization_id, first_name, last_name, email, contact_type)
VALUES (@customer_org_id, 'Jan', 'Jansen', 'j.jansen@email.com', 'customer');
```

#### **2. Create Order from Submission:**
```sql
INSERT INTO orders (
    customer_organization_id,
    partner_organization_id,
    primary_contact_id,
    order_type,
    business_entity,
    order_status,
    installation_address_id,
    total_amount,
    created_from_submission_id
) VALUES (
    @customer_org_id,
    @volvo_partner_id,
    @customer_contact_id,
    'installation',
    'chargecars',
    'intake_completed',
    @installation_address_id,
    1948.00, -- Total from submission line items
    @submission_id
);
```

#### **3. Convert Submission Line Items to Order Line Items:**
```sql
INSERT INTO line_items (
    order_id,
    article_id,
    description,
    quantity,
    unit_price,
    total_amount,
    billing_organization_id,
    line_item_status,
    source_submission_line_item_id
)
SELECT 
    @order_id,
    sli.article_id,
    sli.description,
    sli.quantity,
    sli.estimated_unit_price,
    sli.estimated_total_price,
    @customer_org_id,
    'quoted',
    sli.id
FROM submission_line_items sli
WHERE sli.form_submission_id = @submission_id
AND sli.item_status = 'selected';
```

#### **4. Update Submission Status:**
```sql
UPDATE form_submissions 
SET 
    processing_status = 'converted_to_order',
    processed_at = NOW(),
    processed_by = @system_user_id,
    created_order_id = @order_id,
    created_organization_id = @customer_org_id,
    created_contact_id = @customer_contact_id
WHERE id = @submission_id;
```

### **Benefits of This Approach:**

1. **🎯 Flexible Custom Fields**: JSON schema allows any form configuration
2. **📁 Proper File Management**: Separate table with categorization and metadata
3. **🛒 Line Items Ready**: Direct conversion to order line items
4. **🔄 Seamless Workflow**: Intake → Order → Quote → Installation
5. **📊 Complete Audit Trail**: Track submission → order conversion
6. **🤖 AI-Ready**: File analysis and auto-categorization support
7. **🔒 Security**: Proper file validation and access control

This architecture provides the foundation for a fully automated intake → order conversion process! 🚀

--- 