# ChargeCars V2 - Order Management System

[![Status](https://img.shields.io/badge/status-development-yellow)](https://github.com/chargecars/chargecars-v2)
[![Backend](https://img.shields.io/badge/backend-Xano-blue)](https://xano.com)
[![Frontend](https://img.shields.io/badge/frontend-React-61dafb)](https://reactjs.org)
[![License](https://img.shields.io/badge/license-proprietary-red)](LICENSE)

A comprehensive charge point installation and management platform for electric vehicle charging infrastructure in the Netherlands.

## 🚀 Overview

ChargeCars V2 is an enterprise-grade order management system designed to streamline the entire process of electric vehicle charger installations - from initial customer inquiry to final installation and billing.

### Key Features 

- 📋 **Order Management** - Complete lifecycle management from lead to installation
- 🤝 **Partner Integration** - Seamless API integration with automotive partners
- 📊 **Multi-Entity Support** - Manage multiple business entities from one platform
- 📱 **Omnichannel Communication** - Email, WhatsApp, and internal messaging
- 📍 **Smart Routing** - AI-powered installation team routing and scheduling
- 💰 **Financial Management** - Automated invoicing, payments, and commissions
- 📈 **Real-time Analytics** - Comprehensive dashboards and reporting

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React SPA    │────▶│   REST APIs    │────▶│   PostgreSQL    │
│   (Frontend)   │     │    (Xano)      │     │   (Database)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                        │
         └───────────────────────┴────────────────────────┘
                            WebSockets
                         (Real-time Updates)
```

## 📁 Project Structure

```
chargecars-v2/
├── backend/          # Xano backend configuration
│   ├── api-specs/    # OpenAPI specifications
│   ├── database/     # Database schema and migrations
│   ├── integrations/ # External service integrations
│   └── xano-config/  # Xano-specific configurations
│
├── frontend/         # React application
│   ├── components/   # React components
│   ├── pages/        # Next.js pages
│   ├── public/       # Static assets (including logo)
│   └── package.json  # Dependencies
│
├── prd/              # Product Requirements Documents
│   ├── unified-prd.md              # Complete system PRD
│   ├── order-management-features.md # Order management specs
│   └── frontend-prompts/           # AI generation prompts
│
├── documentation/    # All project documentation
│   ├── api/          # API documentation
│   ├── business/     # Business requirements & insights
│   ├── frontend/     # Frontend documentation
│   ├── status/       # Project status & logs
│   ├── technical/    # Technical specifications
│   └── workflows/    # Business process workflows
│
├── tools/            # Development tools
│   ├── scripts/      # Utility scripts
│   └── migrations/   # Data migration tools
│
└── tests/            # Test suites
    ├── api/          # API tests
    └── integration/  # Integration tests
```

## 🛠️ Technology Stack

### Backend
- **Platform**: [Xano](https://xano.com) - No-code backend
- **Database**: PostgreSQL (57 tables, 99% health score)
- **APIs**: RESTful with OpenAPI 3.0
- **Authentication**: JWT-based with refresh tokens

### Frontend
- **Framework**: Next.js 14+ with TypeScript
- **UI Library**: NextUI + TailwindCSS
- **State Management**: React Context + Hooks
- **Routing**: Next.js Pages Router
- **Build Tool**: Next.js

### Integrations
- **Automation**: Make.com (37 scenarios, 45k+ operations)
- **Maps**: Google Maps API & PostcodeAPI.nu
- **Communication**: WhatsApp Business API
- **Email**: SendGrid
- **Partners**: Custom REST APIs (50five, Alva, Eneco, Groendus, Essent)

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Xano account with access to ChargeCars V2 workspace
- Git for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/chargecars/chargecars-v2.git
   cd chargecars-v2
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   # Visit http://localhost:3000
   ```

### Configuration

See [documentation/technical/](documentation/technical/) for detailed configuration options.

## 📖 Documentation

- **[PRDs](prd/)** - Product Requirements Documents
- **[API Documentation](documentation/api/)** - Complete API reference
- **[Business Requirements](documentation/business/)** - Business logic and rules
- **[Technical Specs](documentation/technical/)** - Architecture and implementation details
- **[Workflows](documentation/workflows/)** - Business process documentation

## 🧪 Testing

```bash
# Run API tests
cd tests/api
npm test

# Run integration tests
cd tests/integration
npm test
```

## 🤝 Contributing

1. Review contribution guidelines
2. Check [documentation/workflows/](documentation/workflows/)
3. Follow the established coding standards
4. Submit PR with comprehensive description

## 📊 Business Entities

The platform manages multiple business entities:

| Entity | Domain | Focus |
|--------|--------|-------|
| ChargeCars B.V. | chargecars.nl | Primary platform |
| LaderThuis B.V. | laderthuis.nl | Home installations |
| MeterKastThuis B.V. | meterkastthuis.nl | Electrical upgrades |
| ZaptecShop B.V. | zaptecshop.nl | Zaptec products |
| RatioShop B.V. | ratioshop.nl | Ratio chargers |

## 📄 License

This is proprietary software. All rights reserved by ChargeCars B.V.

## 🔗 Links

- **Production**: https://app.chargecars.nl (coming soon)
- **Staging**: https://staging.chargecars.nl (coming soon)
- **API Docs**: https://api.chargecars.nl/docs

## 📞 Support

For support, email support@chargecars.nl or join our Slack channel.

---

**© 2025 ChargeCars B.V.** - Building the future of EV charging infrastructure 🚗⚡ 