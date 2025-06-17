# ChargeCars Frontend

Frontend applicatie voor het ChargeCars platform, gebouwd met Next.js, TypeScript en NextUI.

## 📋 Inhoudsopgave

- [Overzicht](#overzicht)
- [Installatie](#installatie)
- [Ontwikkeling](#ontwikkeling)
- [Componenten](#componenten)
- [Documentatie](#documentatie)
- [Backend Integratie](#backend-integratie)

## 🚀 Overzicht

ChargeCars is een platform voor het beheren van laadpaal installaties, onderhoud en service. De frontend applicatie biedt een gebruiksvriendelijke interface voor het beheren van orders, klanten, partners en meer.

Belangrijkste features:
- Order management
- Klantbeheer
- Partner management
- Rapportages en dashboards
- Gebruikersbeheer en authenticatie

## 💻 Installatie

### Vereisten

- Node.js 16+
- npm of yarn

### Setup

```bash
# Clone de repository
git clone https://github.com/chargecars/frontend.git
cd frontend

# Installeer dependencies
npm install
# of
yarn install

# Start de development server
npm run dev
# of
yarn dev
```

De applicatie is nu beschikbaar op `http://localhost:3000`.

## 🛠️ Ontwikkeling

### Mappenstructuur

```
frontend/
├── components/
│   ├── ui/           # Herbruikbare UI componenten
│   ├── features/     # Feature-specifieke componenten
│   └── layouts/      # Layout componenten
├── pages/            # Next.js pagina's
├── lib/
│   ├── api/         # API client functies
│   ├── hooks/       # Custom React hooks
│   └── utils/       # Utility functies
├── styles/
│   └── globals.css  # Globale CSS
├── public/
│   └── images/      # Statische afbeeldingen
└── documentation/   # Project documentatie
```

### Scripts

```bash
# Development
npm run dev         # Start development server

# Type checking
npm run type-check  # Controleer TypeScript types

# Linting
npm run lint        # Run ESLint

# Building
npm run build       # Bouw voor productie
npm start           # Start productieserver
```

## 🧩 Componenten

De applicatie gebruikt een componentenbibliotheek gebaseerd op NextUI. Zie [documentatie/components.md](./documentation/components.md) voor een volledig overzicht van alle beschikbare componenten.

### UI Componenten

Basis UI componenten zoals:
- Button
- StatusBadge
- Card
- Input
- etc.

### Feature Componenten

Feature-specifieke componenten zoals:
- OrderCard
- OrderGrid
- OrdersTable
- OrderFilters
- DashboardStats
- etc.

## 📚 Documentatie

Uitgebreide documentatie is beschikbaar in de `documentation` map:

- [Code Guidelines](./documentation/code-guidelines.md)
- [Component Library](./documentation/components.md)
- [Design System](./documentation/design-system.md)
- [API Integration](./documentation/api-integration.md)

## 🔄 Backend Integratie

De frontend communiceert met de backend API via de functies in `lib/api`. Alle API endpoints zijn gedocumenteerd in `human-todo.md`.

### Benodigde Backend Endpoints

Zie [human-todo.md](./human-todo.md) voor een overzicht van alle benodigde backend endpoints.

## 📝 Licentie

Copyright © 2023 ChargeCars B.V. Alle rechten voorbehouden. 