# ChargeCars V2 - Database Structure Overview

*Gegenereerd op: 31 mei 2025*  
*Xano Workspace: ChargeCars V2*  
*Totaal aantal tabellen: 23*

## 📋 Database Architectuur Overzicht

De ChargeCars V2 database is opgebouwd rondom een modulaire architectuur die verschillende business processen ondersteunt:

- **🏢 Organisatie & Contacten** - Klant en partner management
- **📦 Product & Inventory** - Wallboxes, services en packages
- **📋 Intake & Forms** - Lead capture en configuratie systeem
- **📊 Orders & Quotes** - Sales en project management
- **🔧 Operations** - Installatie teams, planning en werkbonnen
- **💰 Financieel** - Commissies en betalingen
- **📈 Analytics** - Performance tracking en AI/ML data

---

## 🏢 ORGANISATIE & CONTACTEN

### organizations (ID: 35)
**Doel:** HubSpot-style organisatie management voor klanten, partners en interne entiteiten  
**Functie:** Centraal register van alle bedrijven en personen waarmee ChargeCars zaken doet. Ondersteunt hiërarchische structuren (bijv. OEM → dealer → klant) en multi-entity business model (ChargeCars, LaderThuis, MeterKastThuis, etc.). Bevat partner tier management en commissie percentages.

### contacts (ID: 36)
**Doel:** Contacten behorend tot organisaties met hiërarchische toegangscontrole  
**Functie:** Personen binnen organisaties met rol-gebaseerde toegang. Ondersteunt verschillende contacttypen (klant, technicus, account manager, partner contact) en koppelt aan organisaties voor context en permissies.

### user_accounts (ID: 49) 🔐
**Doel:** Gebruikersauthenticatie accounts gekoppeld aan contacten  
**Functie:** Veilige login functionaliteit met wachtwoorden en sessie management. Koppelt aan contact records voor personalisatie en toegangsrechten. Ondersteunt verschillende access levels (klant portal, technicus app, admin dashboard).

---

## 📦 PRODUCTEN & INVENTORY

### articles (ID: 38)
**Doel:** Producten, services en packages  
**Functie:** Master product catalog met wallboxes, installatieservices, accessoires en bundel packages. Bevat rijke content voor webshop presentatie (HTML content, afbeeldingen, specificaties), SEO optimalisatie, en business rules (installatie complexiteit, tijd estimates). Ondersteunt multi-entity product scope.

### article_components (ID: 41)
**Doel:** Package inhoud en component relaties  
**Functie:** Many-to-many relatie die packages "explodeert" naar individuele componenten. Maakt flexibele bundeling mogelijk met custom pricing per component binnen packages. Essentieel voor accurate voorraad tracking, installatie planning en transparante pricing naar klanten.

---

## 📋 INTAKE & FORMS SYSTEEM

### intake_forms (ID: 42)
**Doel:** Configureerbare intake formulieren met custom fields  
**Functie:** Multistep form builder voor lead capture en product configuratie. Ondersteunt conditional logic, HTML grid selectors, real-time pricing, en partner-specifieke styling. Vormt de basis voor de publieke configurator en partner onboarding flows.

### form_submissions (ID: 43)
**Doel:** Klant formulier inzendingen met custom field data  
**Functie:** Opslag van alle form interactions met progress tracking, auto-save functionaliteit, en conversion analytics. Bevat UTM tracking voor marketing attribution en device info voor UX optimalisatie. Centrale hub voor lead-to-order conversie.

### form_field_templates (ID: 55)
**Doel:** Herbruikbare field templates voor form builder  
**Functie:** Component library voor snelle form creation. Bevat voorgedefinieerde HTML templates, CSS styling, en business logic voor verschillende field types (wallbox selectors, installatie opties, klantgegevens). Maakt consistentie en snelle deployment mogelijk.

### form_analytics (ID: 56)
**Doel:** Form performance en gebruikersgedrag tracking  
**Functie:** Gedetailleerde analytics voor form optimalisatie. Tracked user journeys, drop-off points, field interaction times, en conversion funnels. Voorziet business intelligence voor marketing en UX teams om conversion rates te verbeteren.

### submission_files (ID: 45)
**Doel:** Bestanden geüpload door intake formulieren met categorisatie  
**Functie:** File management voor klant uploads (meterkast foto's, situatie tekeningen, documenten). Organiseert bestanden per submission met metadata voor eenvoudige retrieval tijdens offerte en installatie processen.

### submission_line_items (ID: 44)
**Doel:** Line items van intake forms voor order conversie  
**Functie:** Automatisch gegenereerde producten en services op basis van form keuzes. Vormt de brug tussen intake en official quotes/orders. Bevat dynamic pricing calculations en configuratie details voor naadloze conversie.

---

## 📊 SALES & PROJECT MANAGEMENT

### orders (ID: 37)
**Doel:** Klant orders en projecten (dossiers)  
**Functie:** Centrale project management hub voor alle ChargeCars werkzaamheden. Tracked complete customer journey van intake tot installatie. Ondersteunt dual approval workflow (klant + partner), multi-entity business flows, en integration met financial systems. Bevat project status engine en priority management.

### quotes (ID: 39)
**Doel:** Offertes en aanbiedingen voor orders  
**Functie:** Dual quote systeem dat verschillende versies genereert voor klanten en partners. Ondersteunt shared line items met verschillende markup/discount structures. Bevat approval workflows, validity periods, en automatische order conversie bij acceptatie.

### line_items (ID: 40)
**Doel:** Individuele line items voor quotes en orders met flexibele facturatie  
**Functie:** Granulaire pricing components met support voor verschillende billing types (fixed, hourly, material, markup). Maakt complexe pricing scenarios mogelijk en accurate cost tracking. Essentieel voor partner commission calculations en financial reporting.

### order_status_history (ID: 52)
**Doel:** Order status transities met timestamps voor KPI tracking  
**Functie:** Audit trail van alle order wijzigingen voor performance monitoring. Berekent dwell times per status voor bottleneck analysis. Ondersteunt First Time Right (FTR) calculations en SLA monitoring. Fundament voor operational excellence KPIs.

---

## 🔧 OPERATIONS & INSTALLATIES

### visits (ID: 46)
**Doel:** Geplande bezoeken met team assignment en tijdslot management  
**Functie:** Scheduling layer die orders verbindt met field execution. Ondersteunt verschillende visit types (survey, installation, maintenance) met geographic planning en capacity management. Bevat customer satisfaction tracking en quality scoring.

### work_orders (ID: 60) 🆕
**Doel:** Unified werkbonnen met geïntegreerde LMRA veiligheidscheck als workflow fase  
**Functie:** Complete digitale werkbon voor monteurs met LMRA assessment, materialen verificatie, zegel registratie en klant handtekeningen. Status-driven workflow van aankomst tot voltooiing. Ondersteunt PDF generatie en billing integration. LMRA veiligheidscheck is geïntegreerd als verplichte fase, geen aparte tabel.

### installation_teams (ID: 51)
**Doel:** Installatie teams met skills, capacity en current vehicle assignment  
**Functie:** Team resource management met skill certifications, daily capacity limits, en preferred vehicle types. Dynamic vehicle assignment via team_vehicle_assignments. Ondersteunt geographic regions en home base optimization voor dispatch planning.

### installation_performance (ID: 53)
**Doel:** AI/ML data voor voorspellende tijd- en resource planning  
**Functie:** Machine learning dataset met actual vs estimated performance metrics. Tracks installation times, complexity factors, en efficiency scores per team. Enables predictive scheduling en automated time estimates voor nieuwe jobs.

### service_regions (ID: 50)
**Doel:** Geographic coverage areas voor efficiënte routing en capacity planning  
**Functie:** Geographic intelligence voor efficiënte routing en capacity planning. Definieert coverage areas met postal code mapping, travel time calculations, en regional capacity. Ondersteunt de "zelfde postcode ±30km" business rule voor job bundling.

### vehicles (ID: 57) 🆕
**Doel:** Fleet voertuigen met blackbox tracking en equipment management  
**Functie:** Vehicle master register met GPS tracking capabilities, equipment lists, en maintenance scheduling. Integreert met blackbox providers voor real-time location data en fuel monitoring.

### vehicle_tracking (ID: 58) 🆕
**Doel:** Real-time GPS en telemetrie data van voertuig blackboxes  
**Functie:** Live tracking data voor dispatch optimization, route efficiency, en theft prevention. Bevat speed, fuel level, engine status, en reverse geocoded addresses voor operational intelligence.

### team_vehicle_assignments (ID: 59) 🆕
**Doel:** Flexibele toewijzing van teams aan voertuigen met assignment history  
**Functie:** Dynamic vehicle-team assignments met historical tracking. Ondersteunt vehicle swapping, maintenance replacements, en capacity adjustments. Tracks mileage en fuel usage per assignment voor cost allocation.

---

## 💰 FINANCIEEL & COMMISSIES

### partner_commissions (ID: 54)
**Doel:** Partner commissie tracking en betalingen  
**Functie:** Automated commission calculation voor verschillende partnership models (lead transfer, automotive integration, referrals). Tracks commission rates, payment status, en invoice references. Integreert met MoneyBird voor financial processing en partner statements.

---

## ✅ APPROVALS & COMPLIANCE

### sign_offs (ID: 47)
**Doel:** Digitale handtekeningen en goedkeuringen voor orders  
**Functie:** Digital signature capture voor customer and partner approvals. Ondersteunt multi-party approval workflows waar zowel klant als partner moeten tekenen. Bevat legal compliance features en audit trails voor contractuele zekerheid.

### sign_off_line_items (ID: 48)
**Doel:** Junction tabel die sign-offs koppelt aan meerdere line items  
**Functie:** Many-to-many relatie tussen signatures en specifieke line items. Maakt granulaire approval mogelijk waar verschillende onderdelen van een order afzonderlijk goedgekeurd kunnen worden. Ondersteunt change order management.

---

## 📊 BUSINESS INTELLIGENCE

### Database Tags
- **intake_forms**: 4 tabellen - Complete form lifecycle management
- **operations**: 7 tabellen - Field operations en vehicle management
- **Geen tags**: 12 tabellen - Core business operations

### Relationele Integriteit
- **organizations** (35) → Central hub voor alle business relationships
- **articles** (38) → Product master feeding alle sales processes (inclusief zegels)
- **orders** (37) → Project management connecting intake to delivery
- **visits** (46) → Operational execution layer
- **work_orders** (60) → Field execution met LMRA integration

### Scalability Features
- **Multi-entity support** in organizations, articles, intake_forms
- **Unified work order system** met LMRA als geïntegreerde fase
- **Real-time vehicle tracking** voor operational efficiency
- **Zegels als articles** voor inventory management en traceability

---

*Dit overzicht toont een goed gestructureerde database die de complete ChargeCars business flow ondersteunt van lead capture tot installatie en payment processing.* 