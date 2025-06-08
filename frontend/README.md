# ChargeCars Frontend - Order Management System

A modern, dark-themed React order management interface built with NextUI and Tailwind CSS, designed specifically for ChargeCars' charging station installations business.

## 🎨 **ChargeCars Branding**

### **Color Palette**
- **Primary Blue**: `#0ea5e9` - Professional charging technology brand
- **Electric Green**: `#22c55e` - Sustainable energy accent  
- **Dark Background**: `#0a0a0a` - Modern dark interface
- **Content Areas**: `#111111`, `#1a1a1a`, `#222222` - Layered depth

### **Design Philosophy**
- **Professional & Technical**: Reflecting ChargeCars' expertise in electrical installations
- **Sustainable Focus**: Green accents emphasizing clean energy
- **Efficiency-Driven**: Clean layouts for operational workflows
- **Dark Theme**: Reduces eye strain for extended use

## 🚀 **Quick Start**

### 1. Install Dependencies

```bash
npm install
```

### 2. Required Dependencies

The component uses these key dependencies:
- **NextUI v2.6.11**: Modern React UI library with dark theme
- **Heroicons v2.1.1**: Beautiful hand-crafted SVG icons
- **Tailwind CSS v3.4.0**: Utility-first CSS framework
- **Framer Motion v11.5.6**: Animation library (required by NextUI)

### 3. Development Server

```bash
npm run dev
```

Open [http://localhost:3000/orders](http://localhost:3000/orders) to view the order management interface.

## 📱 **Component Features**

### ✅ **Sidebar Navigation**
- Dashboard, Orders, Quotes, Installations, Customers, Communication, Analytics, Settings
- ChargeCars logo with electric bolt icon
- User profile section
- Active state highlighting

### ✅ **Metrics Dashboard**
- **Total Orders**: 3,905 (+12%)
- **Active Orders**: 247 (+5%) 
- **Monthly Revenue**: €2.4M (+18%)
- **Completion Rate**: 94% (-2%)
- Color-coded trend indicators

### ✅ **Advanced Filtering**
- Search by name/reference number
- Filter dropdowns for Status, Owner, Organization
- "More Filters" expandable options

### ✅ **Modern Data Table**
- Order status with color-coded chips
- Customer and organization information
- Order values in ChargeCars styling
- Owner assignments with avatars
- Quick action buttons (view, edit, schedule, contact)

### ✅ **Status Management**
- **Nieuwe lead** (New lead) - Primary blue
- **In behandeling** (In progress) - Warning orange
- **Planning** (Scheduled) - Secondary purple  
- **Geïnstalleerd** (Installed) - Success green
- **Wacht op onderdelen** (Waiting for parts) - Default gray

### ✅ **Professional UX**
- Hover effects and smooth transitions
- Responsive design for different screen sizes
- Pagination with ChargeCars styling
- Consistent spacing and typography

## 🛠️ **Technical Stack**

### **Frontend Framework**
```json
{
  "framework": "Next.js 14",
  "ui-library": "NextUI 2.6.11", 
  "styling": "Tailwind CSS 3.4",
  "icons": "Heroicons 2.1.1",
  "animations": "Framer Motion 11.5.6"
}
```

### **File Structure**
```
03-frontend/
├── components/
│   └── OrderManagement.tsx    # Main order management component
├── pages/
│   ├── _app.tsx              # Next.js app with NextUI provider
│   └── orders.tsx            # Orders page
├── styles/
│   └── globals.css           # Global styles with ChargeCars theme
├── tailwind.config.js        # ChargeCars color palette config
├── postcss.config.js         # PostCSS configuration
└── package.json              # Dependencies
```

## 🎯 **Usage Examples**

### **Basic Implementation**
```tsx
import OrderManagement from '../components/OrderManagement'

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-black">
      <OrderManagement />
    </div>
  )
}
```

### **Custom Styling**
```tsx
// Use ChargeCars brand colors in your components
<Button color="primary">        {/* #0ea5e9 */}
<Button color="secondary">      {/* #22c55e */}
<Card className="bg-content1">  {/* #111111 */}
```

## 🔧 **Customization**

### **Brand Colors**
Update `tailwind.config.js` to modify the ChargeCars color palette:

```js
colors: {
  chargecars: {
    500: '#0ea5e9', // Primary brand blue
    // ... other shades
  },
  electric: {
    500: '#22c55e', // Electric green
    // ... other shades  
  }
}
```

### **Dark Theme**
The component is built for dark mode by default. Light mode support can be added by extending the NextUI theme configuration.

## 📋 **Features Roadmap**

### **Current (Static Data)**
- ✅ Modern dark-themed interface
- ✅ ChargeCars branding integration
- ✅ Responsive order table
- ✅ Status filtering and search
- ✅ Professional UX/UI

### **Future Enhancements**
- 🔄 Dynamic data loading from ChargeCars API
- 🔄 Real-time order status updates
- 🔄 Advanced filtering and sorting
- 🔄 Bulk actions for orders
- 🔄 Export functionality
- 🔄 Mobile-optimized views

## 🎨 **ChargeCars Brand Alignment**

This interface reflects ChargeCars' position as:
- **Technical Experts**: Clean, professional interface design
- **Efficiency Leaders**: Streamlined workflows and clear data presentation  
- **Sustainable Focus**: Green accent colors and electric bolt iconography
- **Customer-Centric**: Easy-to-use order management tools

The dark theme reduces eye strain during extended use while the blue/green color palette maintains the technical yet sustainable brand identity that ChargeCars represents in the electric vehicle charging market.

## 🚀 **Deployment**

### **Build for Production**
```bash
npm run build
npm run start
```

### **Static Export**
```bash
npm run build
npm run export
```

## 📝 **License**

Built for ChargeCars.nl - Professional charging station installation services.

---

**🔗 Ready to integrate with your existing ChargeCars backend APIs!** 