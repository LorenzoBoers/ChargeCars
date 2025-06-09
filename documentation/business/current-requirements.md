# ChargeCars V2 - Business Requirements
**Last Updated**: 2025-06-02
**Status**: Draft

## Executive Summary

ChargeCars V2 is a comprehensive platform for managing electric vehicle charging point installations across multiple business entities in the Netherlands. The system handles the complete lifecycle from partner orders through installation to invoicing.

## Business Context

### Operating Entities
1. **ChargeCars B.V.** - Primary operating company
2. **LaderThuis.nl B.V.** - Consumer-focused brand
3. **MeterKastThuis.nl B.V.** - Electrical infrastructure specialist
4. **ZaptecShop.nl B.V.** - Zaptec products specialist
5. **RatioShop.nl B.V.** - Ratio products specialist

### Key Stakeholders
- **Partners**: Car dealerships, lease companies, energy providers
- **Customers**: End consumers and businesses
- **Installation Teams**: Field technicians and contractors
- **Administrative Staff**: Order processing and support teams
- **Management**: Business owners and operations managers

## Core Business Requirements

### 1. Multi-Entity Operations
- **BR-001**: System must support operations for 5 distinct legal entities
- **BR-002**: Each entity must have separate order sequences (CC-2025-00001)
- **BR-003**: Each entity must have independent communication channels
- **BR-004**: Financial reporting must be segregated by entity
- **BR-005**: Partner relationships can be entity-specific

### 2. Order Management
- **BR-010**: Orders must flow from partners via API or manual entry
- **BR-011**: Each order requires unique sequential numbering per entity
- **BR-012**: Orders must track through defined status workflow
- **BR-013**: Partner reference IDs must be preserved throughout lifecycle
- **BR-014**: Installation addresses must be validated against Dutch postal database

### 3. Status Tracking & SLA
- **BR-020**: Universal status engine for all entity types (orders, quotes, visits)
- **BR-021**: Complete audit trail of all status changes
- **BR-022**: SLA monitoring with automatic overdue detection
- **BR-023**: Status changes must trigger appropriate notifications
- **BR-024**: Milestone tracking for key business events

### 4. Partner Integration
- **BR-030**: REST API for partner order submission
- **BR-031**: Webhook notifications for status updates
- **BR-032**: Partner-specific field and status mapping
- **BR-033**: Rate limiting and error handling per partner
- **BR-034**: Preserve all partner reference numbers

### 5. Communication Management
- **BR-040**: Multi-channel support (email, SMS, WhatsApp)
- **BR-041**: Thread-based conversation tracking
- **BR-042**: Automatic routing based on business entity
- **BR-043**: Template management for standard communications
- **BR-044**: Attachment handling for all channels

### 6. Installation Planning
- **BR-050**: Visit scheduling with technician assignment
- **BR-051**: Route optimization for daily planning
- **BR-052**: Real-time location tracking for field teams
- **BR-053**: Photo documentation of installations
- **BR-054**: Digital completion forms and signatures

### 7. Financial Processing
- **BR-060**: Quote generation with approval workflow
- **BR-061**: Invoice creation from completed orders
- **BR-062**: Payment tracking and reconciliation
- **BR-063**: Partner commission calculations
- **BR-064**: VAT handling per business entity

### 8. Compliance & Security
- **BR-070**: GDPR-compliant data handling
- **BR-071**: Audit logging for all data changes
- **BR-072**: Role-based access control
- **BR-073**: Data encryption for sensitive information
- **BR-074**: Regular data backup and recovery

## Workflow Requirements

### Order Intake Workflow
1. Partner submits order via API
2. System validates customer and address data
3. Order created with unique number
4. Initial status set to "new"
5. Notification sent to operations team
6. Customer confirmation email sent

### Installation Workflow
1. Order reviewed and approved
2. Installation visit scheduled
3. Technician assigned based on location
4. Customer notified of appointment
5. Installation completed with photos
6. Digital signature collected
7. Status updated to "completed"

### Invoicing Workflow
1. Completed orders reviewed
2. Invoice generated with sequential number
3. Invoice sent to customer
4. Payment tracked and recorded
5. Partner commission calculated
6. Financial reports updated

## Integration Requirements

### PostcodeAPI (Dutch Address Validation)
- Validate all Dutch addresses
- Store validated coordinates
- Cache results for performance

### Google Maps API
- Geocoding for non-Dutch addresses
- Route optimization for technicians
- Real-time traffic data

### Partner APIs
- Standardized REST endpoints
- OAuth2 authentication
- Webhook event notifications
- Rate limiting per partner

### Communication Providers
- SendGrid for email
- MessageBird for SMS
- WhatsApp Business API
- Unified message tracking

## Performance Requirements

- **PR-001**: API response time < 500ms for 95% of requests
- **PR-002**: Support 1000+ concurrent users
- **PR-003**: Handle 10,000+ orders per month
- **PR-004**: 99.9% uptime SLA
- **PR-005**: Real-time status updates < 2 seconds

## Security Requirements

- **SR-001**: All API endpoints require authentication
- **SR-002**: Partner API keys with scope limitations
- **SR-003**: Encryption at rest for sensitive data
- **SR-004**: Regular security audits
- **SR-005**: GDPR compliance for EU operations

## Reporting Requirements

### Operational Reports
- Daily order intake summary
- Installation completion rates
- SLA compliance dashboard
- Technician productivity metrics

### Financial Reports
- Revenue by business entity
- Partner commission statements
- Invoice aging reports
- Payment reconciliation

### Management Reports
- KPI dashboard
- Trend analysis
- Partner performance metrics
- Customer satisfaction scores

## User Roles

### System Administrator
- Full system access
- User management
- System configuration
- Security settings

### Operations Manager
- Order management
- Team scheduling
- Report access
- Workflow configuration

### Customer Service
- Order viewing
- Communication management
- Basic status updates
- Customer data access

### Field Technician
- Mobile app access
- Visit management
- Photo uploads
- Status updates

### Partner Portal
- Order submission
- Status tracking
- Report viewing
- API access

## Future Considerations

1. **Mobile Application**: Native apps for iOS/Android
2. **Customer Portal**: Self-service for end customers
3. **Inventory Management**: Stock tracking integration
4. **Advanced Analytics**: Predictive maintenance and demand forecasting
5. **International Expansion**: Multi-country support

## Success Metrics

- **Order Processing Time**: < 24 hours from receipt to scheduling
- **Installation Success Rate**: > 95% first-time completion
- **Customer Satisfaction**: > 4.5/5 rating
- **SLA Compliance**: > 98% on-time delivery
- **System Uptime**: > 99.9% availability

## Dependencies

- Xano backend platform
- Dutch postal code database access
- Payment processor integration
- Communication service providers
- Map service providers

## Constraints

- Must comply with Dutch business regulations
- Limited to Netherlands operations initially
- Dependent on partner API availability
- Subject to GDPR requirements
- Budget constraints for third-party services

---

**Note**: This document serves as the foundation for all technical implementation decisions. Any changes must be reviewed and approved by all stakeholders. 