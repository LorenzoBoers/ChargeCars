# ChargeCars V2 - Frontend Generation Guide for TaskMaster AI
**Last Updated**: 2025-06-02
**Status**: Template

## Project Overview

You are building a modern React frontend for ChargeCars V2, a comprehensive platform for managing electric vehicle charging point installations in the Netherlands. The backend is already built in Xano with REST APIs.

## Technology Stack

- **Framework**: React 18 with TypeScript
- **UI Library**: Material-UI (MUI) v5
- **State Management**: Redux Toolkit with RTK Query
- **Routing**: React Router v6
- **Forms**: React Hook Form with Yup validation
- **Charts**: Recharts
- **Maps**: Google Maps React
- **Date/Time**: date-fns
- **HTTP Client**: Axios with interceptors
- **Authentication**: JWT with refresh tokens

## Design Requirements

### Theme & Branding
```typescript
const theme = {
  primary: "#1976d2",      // ChargeCars Blue
  secondary: "#f50057",    // Accent Pink
  success: "#4caf50",      // Green
  warning: "#ff9800",      // Orange
  error: "#f44336",        // Red
  background: "#f5f5f5",   // Light Gray
  surface: "#ffffff",      // White
  text: {
    primary: "#212121",
    secondary: "#757575"
  }
}
```

### Layout Structure
1. **App Shell**
   - Responsive sidebar navigation
   - Top app bar with user menu
   - Breadcrumb navigation
   - Footer with version info

2. **Dashboard**
   - KPI cards (Orders, Revenue, SLA, Teams)
   - Order status chart
   - Recent activities feed
   - Quick actions menu

3. **Responsive Design**
   - Mobile-first approach
   - Breakpoints: 320px, 768px, 1024px, 1440px
   - Collapsible sidebar on mobile
   - Touch-optimized controls

## Core Components to Generate

### 1. Authentication Components
```typescript
// LoginPage.tsx
- Email/password form
- Remember me checkbox
- Forgot password link
- Error handling
- Redirect after login

// ProtectedRoute.tsx
- Check authentication
- Redirect to login
- Role-based access
```

### 2. Order Management
```typescript
// OrderList.tsx
- Data table with sorting/filtering
- Status badges
- Quick actions menu
- Bulk operations
- Export functionality

// OrderDetails.tsx
- Order information cards
- Status timeline
- Customer details
- Installation address with map
- Line items table
- Communication thread
- Action buttons

// CreateOrderForm.tsx
- Multi-step wizard
- Customer selection/creation
- Address validation
- Product selection
- Date picker
- Summary review
```

### 3. Status Management
```typescript
// StatusChangeDialog.tsx
- Current status display
- New status selection
- Reason input
- Confirmation step

// StatusTimeline.tsx
- Visual timeline
- User avatars
- Timestamps
- Transition reasons
```

### 4. Partner Integration
```typescript
// PartnerOrderReceiver.tsx
- Live order feed
- Auto-refresh
- Quick approval actions
- Error handling

// PartnerDashboard.tsx
- Integration health status
- Recent orders
- Error logs
- Configuration
```

### 5. Communication Hub
```typescript
// MessageComposer.tsx
- Channel selection (email/SMS/WhatsApp)
- Template picker
- Variable substitution
- Preview mode
- Send confirmation

// ConversationThread.tsx
- Message bubbles
- Timestamps
- Read receipts
- Attachment viewer
- Reply interface
```

### 6. Maps & Location
```typescript
// AddressValidator.tsx
- Postal code input
- House number input
- Auto-complete
- Map preview
- Validation status

// TechnicianMap.tsx
- Real-time locations
- Route display
- Order pins
- Info windows
- Route optimization
```

### 7. Reporting
```typescript
// DashboardWidgets.tsx
- KPI cards
- Line charts
- Bar charts
- Pie charts
- Data tables

// ReportBuilder.tsx
- Date range picker
- Filter controls
- Export options
- Chart/table toggle
```

## API Integration Pattern

```typescript
// api/baseApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Order', 'Quote', 'User', 'Status'],
  endpoints: () => ({}),
});

// api/orderApi.ts
export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<OrderList, OrderFilters>({
      query: (filters) => ({
        url: '/orders',
        params: filters,
      }),
      providesTags: ['Order'],
    }),
    createOrder: builder.mutation<Order, CreateOrderDto>({
      query: (order) => ({
        url: '/orders',
        method: 'POST',
        body: order,
      }),
      invalidatesTags: ['Order'],
    }),
  }),
});
```

## State Management Structure

```typescript
// store/index.ts
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    ui: uiSlice.reducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

// store/authSlice.ts
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});
```

## Routing Structure

```typescript
// App.tsx
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
    <Route index element={<Dashboard />} />
    <Route path="orders">
      <Route index element={<OrderList />} />
      <Route path="new" element={<CreateOrder />} />
      <Route path=":orderId" element={<OrderDetails />} />
    </Route>
    <Route path="quotes">
      <Route index element={<QuoteList />} />
      <Route path="new" element={<CreateQuote />} />
      <Route path=":quoteId" element={<QuoteDetails />} />
    </Route>
    <Route path="partners">
      <Route index element={<PartnerList />} />
      <Route path=":partnerId" element={<PartnerDashboard />} />
    </Route>
    <Route path="communications" element={<CommunicationHub />} />
    <Route path="reports" element={<Reports />} />
    <Route path="settings" element={<Settings />} />
  </Route>
</Routes>
```

## Form Validation Patterns

```typescript
// schemas/orderSchema.ts
export const createOrderSchema = yup.object({
  customer_organization_id: yup.string().uuid().required('Customer is required'),
  primary_contact_id: yup.string().uuid().required('Contact is required'),
  order_type: yup.string().oneOf(['installation', 'service', 'upgrade', 'removal']).required(),
  business_entity: yup.string().oneOf(['chargecars', 'laderthuis', 'meterkastthuis', 'zaptecshop', 'ratioshop']).required(),
  installation_address: yup.object({
    postal_code: yup.string().matches(/^\d{4}\s?[A-Z]{2}$/i, 'Invalid Dutch postal code').required(),
    house_number: yup.number().positive().required(),
  }),
});
```

## Error Handling

```typescript
// utils/errorHandler.ts
export const handleApiError = (error: any): string => {
  if (error.data?.error?.message) {
    return error.data.error.message;
  }
  if (error.status === 401) {
    return 'Session expired. Please login again.';
  }
  if (error.status === 403) {
    return 'You do not have permission to perform this action.';
  }
  if (error.status === 404) {
    return 'The requested resource was not found.';
  }
  return 'An unexpected error occurred. Please try again.';
};
```

## Accessibility Requirements

1. **WCAG 2.1 AA Compliance**
   - Proper heading hierarchy
   - Alt text for images
   - ARIA labels for interactive elements
   - Keyboard navigation support
   - Focus indicators

2. **Dutch Language Support**
   - i18n setup with Dutch as primary
   - English as secondary language
   - Number formatting (1.234,56)
   - Date formatting (DD-MM-YYYY)

## Performance Requirements

1. **Initial Load**: < 3 seconds on 3G
2. **Time to Interactive**: < 5 seconds
3. **Bundle Size**: < 500KB gzipped
4. **Lazy Loading**: Route-based code splitting
5. **Image Optimization**: WebP with fallbacks

## Testing  Approach

```typescript
// __tests__/OrderList.test.tsx
describe('OrderList', () => {
  it('should display orders from API', async () => {
    render(<OrderList />);
    await waitFor(() => {
      expect(screen.getByText('CC-2025-00001')).toBeInTheDocument();
    });
  });
  
  it('should filter orders by status', async () => {
    render(<OrderList />);
    fireEvent.change(screen.getByLabelText('Status'), {
      target: { value: 'completed' }
    });
    await waitFor(() => {
      expect(screen.queryByText('new')).not.toBeInTheDocument();
    });
  });
});
```

## Environment Configuration

```env
REACT_APP_API_URL=https://api.chargecars.nl/v2
REACT_APP_GOOGLE_MAPS_KEY=your_key_here
REACT_APP_SENTRY_DSN=your_dsn_here
REACT_APP_VERSION=$npm_package_version
```

## Deployment Requirements

1. **Build Process**
   - TypeScript compilation
   - Bundle optimization
   - Environment variable injection
   - Source map generation

2. **Docker Container**
   ```dockerfile
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=builder /app/build /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/conf.d/default.conf
   ```

## Key Business Logic to Implement

1. **Order Number Format**: `{entity_prefix}-{year}-{sequence}`
2. **Status Transitions**: Validate allowed transitions
3. **SLA Calculations**: Business hours only (9-17 CET)
4. **Multi-Entity**: Filter UI by selected business entity
5. **Partner Permissions**: Restrict data access by partner

## Important Notes for TaskMaster

1. Use the API endpoints exactly as documented in `/01-backend/api-specifications/endpoints-catalog.md`
2. Follow the business rules in `/02-documentation/business-requirements/current-requirements.md`
3. Match the database schema from `/01-backend/database-schema/current-schema.md`
4. Implement all workflows from `/02-documentation/workflows/business-processes.md`
5. Create reusable components for common patterns
6. Include loading states and error boundaries
7. Implement proper TypeScript types for all API responses
8. Add JSDoc comments for complex business logic
9. Create a comprehensive README with setup instructions
10. Include Storybook stories for key components

---

**Generate the frontend following these specifications exactly. Start with the authentication flow, then build the order management system, followed by the other modules in sequence.** 