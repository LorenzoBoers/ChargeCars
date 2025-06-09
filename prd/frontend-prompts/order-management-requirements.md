# Order Management Frontend Requirements - Advanced Filtering

**Last Updated**: 2025-01-18
**Status**: Ready for Development
**Priority**: High
**AI Target**: TaskMaster Frontend Generator

## 🎯 **Order Management Interface with Advanced Filtering**

### **Core Filtering UI Components**

Build a sophisticated order management interface with comprehensive filtering capabilities based on [Xano external filtering](https://docs.xano.com/the-function-stack/functions/database-requests/query-all-records/external-filtering-examples).

## 📋 **UI Component Requirements**

### **1. Quick Filter Bar (Always Visible)**

```tsx
interface QuickFilterBarProps {
  filters: OrderFilters;
  onFiltersChange: (filters: Partial<OrderFilters>) => void;
  onClearFilters: () => void;
}

// Required components in quick filter bar:
- Status Multi-Select Dropdown (status_in)
- Order Type Multi-Select Dropdown (order_type_in)  
- Priority Multi-Select Dropdown (priority_in)
- Owner/Assignee Dropdown (owner_id)
- Date Range Picker (created_from/created_to)
- Global Search Input (search)
- "Clear All Filters" button
- "Advanced Filters" toggle button
```

### **2. Advanced Filter Panel (Collapsible)**

```tsx
interface AdvancedFilterPanelProps {
  isOpen: boolean;
  filters: OrderFilters;
  onFiltersChange: (filters: Partial<OrderFilters>) => void;
}

// Required advanced filter components:
- Business Entity Selector (business_entity_id)
- Specific Date Range Pickers:
  * Requested Date Range (requested_date_from/to)
  * Planned Completion Range (planned_completion_from/to)
- Text Search Fields:
  * Order Number Search (order_number_like)
  * Notes Search (notes_contains)
- Boolean Toggle Switches:
  * Show Overdue Orders (overdue)
  * Show Orders with Quotes (has_quotes)
  * Include Deleted Orders (include_deleted)
- Numeric Range Inputs:
  * Total Amount Range (min_total_amount/max_total_amount)
```

### **3. Filter State Management**

```tsx
interface OrderFilters {
  // Pagination
  page?: number;
  per_page?: number;
  
  // Single value filters
  status?: string;
  order_type?: string;
  priority?: string;
  owner_id?: string;
  business_entity_id?: string;
  
  // Multi-value filters (arrays)
  status_in?: string[];
  order_type_in?: string[];
  priority_in?: string[];
  
  // Date ranges (ISO 8601)
  created_from?: string;
  created_to?: string;
  requested_date_from?: string;
  requested_date_to?: string;
  planned_completion_from?: string;
  planned_completion_to?: string;
  
  // Text search
  search?: string;
  order_number_like?: string;
  notes_contains?: string;
  
  // Boolean filters
  overdue?: boolean;
  has_quotes?: boolean;
  include_deleted?: boolean;
  
  // Numeric filters
  min_total_amount?: number;
  max_total_amount?: number;
  
  // Sorting
  sort?: 'created_at' | 'updated_at' | 'order_number' | 'status' | 'priority' | 'requested_date' | 'planned_completion';
  order?: 'asc' | 'desc';
}
```

### **4. Saved Filters Component**

```tsx
interface SavedFiltersProps {
  savedFilters: SavedFilter[];
  currentFilters: OrderFilters;
  onLoadFilter: (filter: SavedFilter) => void;
  onSaveFilter: (name: string, filters: OrderFilters) => void;
  onDeleteFilter: (filterId: string) => void;
}

interface SavedFilter {
  id: string;
  name: string;
  filters: OrderFilters;
  created_at: string;
  is_shared: boolean;
}

// Required features:
- Save current filter combination with custom name
- Quick load saved filters dropdown
- Delete saved filters
- Share filter URL functionality
- Visual indicator when current filters match saved filter
```

## 🎨 **UI/UX Guidelines**

### **Filter Visual Design**

1. **Quick Filter Bar**
   - Horizontal layout, sticky at top of order list
   - Clean, compact design with clear visual hierarchy
   - Multi-select dropdowns with count badges (e.g., "Status (3)")
   - Global search with magnifying glass icon
   - Clear visual indication when filters are active

2. **Advanced Filter Panel**
   - Slides down/collapsible design
   - Organized in logical groups (Dates, Text, Boolean, Numeric)
   - Each section clearly labeled and separated
   - "Apply Filters" and "Reset" buttons at bottom

3. **Filter State Indicators**
   - Active filter count badge in top bar
   - Color-coded filter pills showing current filters
   - "X" buttons on filter pills for quick removal
   - Clear visual distinction between single and multi-value filters

### **Responsive Behavior**

- **Desktop**: Full horizontal filter bar + collapsible advanced panel
- **Tablet**: Condensed filter bar with dropdown for advanced options
- **Mobile**: Bottom sheet or modal for filter options

## 📊 **Data Integration**

### **API Integration Pattern**

```tsx
// URL parameter mapping for filters
const buildFilterParams = (filters: OrderFilters): URLSearchParams => {
  const params = new URLSearchParams();
  
  // Single values
  if (filters.status) params.set('status', filters.status);
  if (filters.priority) params.set('priority', filters.priority);
  
  // Arrays (comma-separated)
  if (filters.status_in?.length) {
    params.set('status_in', filters.status_in.join(','));
  }
  
  // Date ranges
  if (filters.created_from) params.set('created_from', filters.created_from);
  if (filters.created_to) params.set('created_to', filters.created_to);
  
  // Booleans
  if (filters.overdue !== undefined) params.set('overdue', filters.overdue.toString());
  
  // Sorting
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.order) params.set('order', filters.order);
  
  return params;
};

// Real-time filter application
const useOrderFilters = () => {
  const [filters, setFilters] = useState<OrderFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const applyFilters = useCallback(async (newFilters: Partial<OrderFilters>) => {
    setIsLoading(true);
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    // Update URL without page refresh
    const params = buildFilterParams(updatedFilters);
    window.history.replaceState({}, '', `?${params.toString()}`);
    
    // Fetch filtered data
    await fetchOrders(updatedFilters);
    setIsLoading(false);
  }, [filters]);
  
  return { filters, applyFilters, isLoading };
};
```

### **Performance Optimizations**

- **Debounced Search**: 300ms delay for text inputs
- **Intelligent Caching**: Cache filter results for common combinations
- **Progressive Loading**: Load order list incrementally with filters
- **URL State Sync**: Sync filter state with URL for shareable links

## 🧪 **Filter Examples & Use Cases**

### **Common Filter Scenarios**

```tsx
// Scenario 1: Show overdue high-priority orders
const overdueHighPriorityFilter = {
  priority: 'high',
  overdue: true,
  sort: 'planned_completion',
  order: 'asc'
};

// Scenario 2: Multi-status search for specific timeframe  
const recentActiveOrdersFilter = {
  status_in: ['pending', 'in_progress', 'review'],
  created_from: '2025-01-01',
  created_to: '2025-01-31',
  sort: 'created_at',
  order: 'desc'
};

// Scenario 3: Complex text search with conditions
const complexSearchFilter = {
  search: 'laadpaal',
  min_total_amount: 1000,
  has_quotes: true,
  order_type_in: ['installation', 'maintenance']
};
```

### **Filter URL Examples**

```bash
# Basic filtering
/orders?status=pending&priority=high

# Complex multi-filter
/orders?status_in=pending,in_progress&created_from=2025-01-01&overdue=true&sort=created_at&order=desc

# Text search with conditions  
/orders?search=laadpaal&min_total_amount=1000&has_quotes=true
```

## 🎯 **User Experience Features**

### **Smart Filter Suggestions**

- **Auto-complete**: Suggest values based on existing data
- **Filter Counts**: Show result counts for each filter option
- **Related Filters**: Suggest related filters based on current selection
- **Recent Filters**: Quick access to recently used filter combinations

### **Filter Validation & Feedback**

- **Real-time Validation**: Validate filter inputs as user types
- **Error States**: Clear error messages for invalid filter combinations
- **Empty States**: Helpful messaging when filters return no results
- **Loading States**: Progressive loading indicators during filter application

### **Accessibility Features**

- **Keyboard Navigation**: Full keyboard support for all filter controls
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Focus Management**: Logical tab order through filter components
- **Color Independence**: Don't rely solely on color for filter states

## 📱 **Component Library Integration**

Use modern component library (Shadcn/UI recommended) with:

- **Multi-Select Combobox**: For status_in, order_type_in filters
- **Date Range Picker**: For date range filters  
- **Toggle Switches**: For boolean filters
- **Number Input with Range**: For numeric filters
- **Command Palette**: For quick filter search/application
- **Badge/Chip Components**: For active filter display

## 🔧 **Implementation Checklist**

### **Core Filtering Components**
- [ ] Quick Filter Bar with multi-select dropdowns
- [ ] Advanced Filter Panel (collapsible)
- [ ] Global search input with debouncing
- [ ] Date range picker components
- [ ] Boolean toggle switches
- [ ] Numeric range inputs

### **Filter State Management**
- [ ] URL parameter sync
- [ ] Filter state persistence
- [ ] Real-time filter application
- [ ] Loading states and error handling

### **Advanced Features**  
- [ ] Saved filters functionality
- [ ] Filter sharing via URL
- [ ] Filter result count indicators
- [ ] Smart filter suggestions
- [ ] Responsive design for mobile/tablet

### **Performance & UX**
- [ ] Debounced search inputs
- [ ] Intelligent result caching
- [ ] Progressive loading
- [ ] Accessibility compliance
- [ ] Cross-browser testing 