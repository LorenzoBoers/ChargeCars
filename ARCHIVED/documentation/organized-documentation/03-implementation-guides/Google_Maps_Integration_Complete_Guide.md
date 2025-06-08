# ChargeCars V2 - Google Maps Integration Complete Guide
**Complete Implementation Guide voor Kaarten & Address Verification**  
*Created: 1 juni 2025*

---

## 🎯 **INTEGRATION OVERVIEW**

### **Scope & Requirements**
- **Frontend Maps**: Interactive kaarten in alle portals voor team tracking, route planning
- **Address Verification**: Real-time Nederlandse adres validatie voor order creation
- **Geocoding Services**: Conversie van adressen naar coördinaten voor route optimization
- **API Integration**: Backend address validation voor job creation workflows

### **Business Value**
- **Reduced Data Entry Errors**: 60% reductie in adres fouten
- **Enhanced Route Planning**: Geoptimaliseerde routes voor technician teams
- **Improved Customer Experience**: Accurate address validation bij order placement
- **Operational Efficiency**: Real-time team tracking en progress monitoring

---

## 🗝️ **API SETUP & CONFIGURATION**

### **Google Cloud Platform Setup**

#### **1. Enable Required APIs**
```javascript
// Required Google APIs:
const requiredAPIs = [
  'Maps JavaScript API',           // Frontend map display
  'Geocoding API',                // Address to coordinates conversion
  'Places API',                   // Address autocomplete & validation
  'Maps Static API',              // Static map images for reports
  'Distance Matrix API',          // Route optimization calculations
  'Directions API'                // Turn-by-turn navigation
];
```

#### **2. API Key Configuration**
```javascript
// Environment Variables Setup:
GOOGLE_MAPS_API_KEY_FRONTEND=AIzaSyB...    // Restricted to domain
GOOGLE_MAPS_API_KEY_BACKEND=AIzaSyC...     // Restricted to server IP
GOOGLE_MAPS_API_KEY_MOBILE=AIzaSyD...      // Restricted to mobile apps

// API Key Restrictions:
// Frontend Key: Restricted to *.chargecars.nl, *.laderthuis.nl
// Backend Key: Restricted to server IP addresses only
// Mobile Key: Restricted to mobile app bundle IDs
```

#### **3. Rate Limits & Billing**
```javascript
// Production Rate Limits:
const rateLimits = {
  geocoding: '50 requests/second',
  places: '100 requests/second', 
  maps: 'Unlimited (pay per load)',
  directions: '50 requests/second'
};

// Monthly Usage Estimates:
const monthlyUsage = {
  geocoding: '10,000 requests',      // Address validation
  places: '15,000 requests',         // Autocomplete
  mapLoads: '50,000 loads',          // Frontend usage
  directions: '5,000 requests'       // Route planning
};
```

---

## 🏠 **ADDRESS VERIFICATION IMPLEMENTATION**

### **Dutch Address Validation System**

#### **Primary: BAG (Basisregistratie Adressen en Gebouwen)**
```javascript
// Xano Function: validateDutchAddress
function validateDutchAddress(postalCode, houseNumber, houseNumberAddition = '') {
  // Primary validation using Dutch BAG database
  const bagQuery = `${postalCode} ${houseNumber}${houseNumberAddition}`;
  
  const bagResponse = fetch(`https://api.pdok.nl/bzk/locatieserver/search/v3_1/suggest?q=${encodeURIComponent(bagQuery)}&fq=type:adres`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  });
  
  if (bagResponse.response && bagResponse.response.docs.length > 0) {
    const address = bagResponse.response.docs[0];
    
    return {
      source: 'BAG',
      valid: true,
      formatted_address: address.weergavenaam,
      street: address.straatnaam,
      house_number: address.huis_nlt,
      postal_code: address.postcode,
      city: address.woonplaatsnaam,
      province: address.provincienaam,
      municipality: address.gemeentenaam,
      coordinates: {
        latitude: parseFloat(address.centroide_ll.split(' ')[1]),
        longitude: parseFloat(address.centroide_ll.split(' ')[0])
      },
      bag_id: address.id,
      confidence: 'high'
    };
  }
  
  // Fallback to Google if BAG fails
  return validateWithGoogle(postalCode, houseNumber, houseNumberAddition);
}

// Fallback: Google Geocoding API
function validateWithGoogle(postalCode, houseNumber, houseNumberAddition = '') {
  const googleQuery = `${houseNumber}${houseNumberAddition} ${postalCode}, Netherlands`;
  
  const googleResponse = fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(googleQuery)}&key=${GOOGLE_MAPS_API_KEY_BACKEND}&region=nl&components=country:NL`);
  
  if (googleResponse.results && googleResponse.results.length > 0) {
    const result = googleResponse.results[0];
    
    return {
      source: 'Google',
      valid: true,
      formatted_address: result.formatted_address,
      coordinates: {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng
      },
      confidence: result.geometry.location_type === 'ROOFTOP' ? 'high' : 'medium',
      google_place_id: result.place_id
    };
  }
  
  return { valid: false, error: 'Address not found' };
}
```

#### **Address Validation API Endpoint**
```javascript
// POST /api/address/validate
{
  "postal_code": "1012 AB",
  "house_number": "123",
  "house_number_addition": "A",
  "city": "Amsterdam"  // Optional for verification
}

// Response:
{
  "valid": true,
  "source": "BAG",
  "formatted_address": "Keizersgracht 123A, 1012 AB Amsterdam",
  "coordinates": {
    "latitude": 52.3676,
    "longitude": 4.9041
  },
  "components": {
    "street": "Keizersgracht",
    "house_number": "123",
    "house_number_addition": "A",
    "postal_code": "1012 AB",
    "city": "Amsterdam",
    "province": "Noord-Holland",
    "municipality": "Amsterdam"
  },
  "confidence": "high",
  "validation_id": "val_550e8400-e29b-41d4-a716-446655440000"
}
```

### **Database Integration**

#### **Enhanced Address Storage**
```sql
-- addresses table schema enhancement
ALTER TABLE address ADD COLUMN validation_source VARCHAR(20);  -- 'BAG', 'Google', 'Manual'
ALTER TABLE address ADD COLUMN validation_confidence VARCHAR(20); -- 'high', 'medium', 'low'
ALTER TABLE address ADD COLUMN bag_id VARCHAR(100);
ALTER TABLE address ADD COLUMN google_place_id VARCHAR(100);
ALTER TABLE address ADD COLUMN validation_id UUID;
ALTER TABLE address ADD COLUMN validated_at TIMESTAMP;

-- address_validations log table
CREATE TABLE address_validations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    address_id UUID REFERENCES addresses(id),
    input_data JSONB,
    validation_source VARCHAR(20),
    validation_result JSONB,
    confidence_score VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🗺️ **FRONTEND MAPS IMPLEMENTATION**

### **React Google Maps Integration**

#### **Core Setup**
```typescript
// Install dependencies
npm install @googlemaps/react-wrapper @googlemaps/js-api-loader

// GoogleMaps Provider Component
interface GoogleMapsProviderProps {
  children: React.ReactNode;
  apiKey: string;
}

const GoogleMapsProvider: React.FC<GoogleMapsProviderProps> = ({ children, apiKey }) => {
  return (
    <Wrapper 
      apiKey={apiKey}
      version="beta"
      libraries={['places', 'geometry', 'drawing']}
      language="nl"
      region="NL"
    >
      {children}
    </Wrapper>
  );
};
```

#### **Interactive Map Component**
```typescript
// TeamTrackingMap Component
interface TeamTrackingMapProps {
  teams: TeamLocation[];
  visits: VisitLocation[];
  entityContext: EntityContext;
  onTeamSelect: (teamId: string) => void;
  onVisitSelect: (visitId: string) => void;
}

const TeamTrackingMap: React.FC<TeamTrackingMapProps> = ({
  teams, visits, entityContext, onTeamSelect, onVisitSelect
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  const mapOptions: google.maps.MapOptions = {
    center: { lat: 52.1326, lng: 5.2913 }, // Center of Netherlands
    zoom: 7,
    styles: getEntityMapStyle(entityContext.activeEntity),
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true
  };

  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    const newMarkers: google.maps.Marker[] = [];

    // Add team markers
    teams.forEach(team => {
      const marker = new google.maps.Marker({
        position: { lat: team.latitude, lng: team.longitude },
        map: map,
        title: `Team ${team.name}`,
        icon: {
          url: getTeamMarkerIcon(team.status, entityContext.branding.primaryColor),
          scaledSize: new google.maps.Size(40, 40)
        }
      });

      marker.addListener('click', () => onTeamSelect(team.id));
      newMarkers.push(marker);
    });

    // Add visit markers
    visits.forEach(visit => {
      const marker = new google.maps.Marker({
        position: { lat: visit.latitude, lng: visit.longitude },
        map: map,
        title: visit.customer_name,
        icon: {
          url: getVisitMarkerIcon(visit.status),
          scaledSize: new google.maps.Size(30, 30)
        }
      });

      marker.addListener('click', () => onVisitSelect(visit.id));
      newMarkers.push(marker);
    });

    setMarkers(newMarkers);
  }, [map, teams, visits, entityContext]);

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden">
      <Map
        options={mapOptions}
        onLoad={setMap}
        className="h-full w-full"
      />
    </div>
  );
};
```

#### **Address Autocomplete Component**
```typescript
// AddressAutocomplete Component
interface AddressAutocompleteProps {
  onAddressSelect: (address: ValidatedAddress) => void;
  placeholder?: string;
  required?: boolean;
  entityContext: EntityContext;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  onAddressSelect, placeholder, required, entityContext
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!window.google) return;

    const autocomplete = new google.maps.places.Autocomplete(
      inputRef.current as HTMLInputElement,
      {
        componentRestrictions: { country: 'nl' },
        fields: ['address_components', 'formatted_address', 'geometry', 'place_id'],
        types: ['address']
      }
    );

    autocomplete.addListener('place_changed', async () => {
      const place = autocomplete.getPlace();
      
      if (!place.geometry || !place.formatted_address) return;

      setIsLoading(true);
      
      // Validate the selected address
      const validationResult = await validateAddress({
        formatted_address: place.formatted_address,
        google_place_id: place.place_id,
        coordinates: {
          latitude: place.geometry.location?.lat() || 0,
          longitude: place.geometry.location?.lng() || 0
        }
      });

      if (validationResult.valid) {
        onAddressSelect(validationResult);
      }
      
      setIsLoading(false);
    });

    autocompleteRef.current = autocomplete;

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onAddressSelect]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder || "Voer adres in..."}
        required={required}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        style={{ borderColor: entityContext.branding.primaryColor }}
      />
      
      {isLoading && (
        <div className="absolute right-3 top-3">
          <Spinner size="sm" />
        </div>
      )}
    </div>
  );
};
```

### **Entity-Specific Map Styling**
```typescript
// Entity-specific map styles
const getEntityMapStyle = (entityId: string): google.maps.MapTypeStyle[] => {
  const baseStyle: google.maps.MapTypeStyle[] = [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'transit',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ];

  const entityColors = {
    chargecars: '#0066CC',
    laderthuis: '#FF6B35', 
    meterkastthuis: '#8B5CF6',
    zaptecshop: '#10B981',
    ratioshop: '#F59E0B'
  };

  const primaryColor = entityColors[entityId as keyof typeof entityColors] || '#0066CC';

  return [
    ...baseStyle,
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{ color: primaryColor }]
    }
  ];
};

// Custom marker icons per entity
const getTeamMarkerIcon = (status: string, primaryColor: string): string => {
  const statusIcons = {
    'active': '🚐',
    'travelling': '🚗',
    'on_site': '🔧',
    'break': '☕',
    'offline': '🔴'
  };

  // Generate SVG marker with entity color
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="18" fill="${primaryColor}" stroke="white" stroke-width="2"/>
      <text x="20" y="28" text-anchor="middle" font-size="16">${statusIcons[status as keyof typeof statusIcons] || '📍'}</text>
    </svg>
  `)}`;
};
```

---

## 📱 **MOBILE MAPS INTEGRATION**

### **Progressive Web App Maps**
```typescript
// Mobile-optimized map component
const MobileTeamMap: React.FC<MobileMapProps> = ({ currentLocation, visits }) => {
  const [userLocation, setUserLocation] = useState<GeolocationPosition | null>(null);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation(position),
        (error) => console.error('Location access denied:', error),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const mobileMapOptions: google.maps.MapOptions = {
    center: userLocation 
      ? { lat: userLocation.coords.latitude, lng: userLocation.coords.longitude }
      : { lat: 52.1326, lng: 5.2913 },
    zoom: 12,
    disableDefaultUI: true,
    gestureHandling: 'greedy',
    styles: getMobileMapStyle()
  };

  return (
    <div className="h-screen w-full">
      <Map options={mobileMapOptions} className="h-full w-full">
        {userLocation && (
          <UserLocationMarker 
            position={{
              lat: userLocation.coords.latitude,
              lng: userLocation.coords.longitude
            }}
          />
        )}
        
        {visits.map(visit => (
          <VisitMarker
            key={visit.id}
            visit={visit}
            onSelect={() => navigateToVisit(visit)}
          />
        ))}
      </Map>
      
      <FloatingActionButton 
        onClick={() => centerOnUserLocation()}
        icon="📍"
        className="absolute bottom-4 right-4"
      />
    </div>
  );
};
```

---

## 🔧 **API INTEGRATION FOR JOB CREATION**

### **Enhanced Order Creation with Address Validation**
```typescript
// POST /api/orders - Enhanced with address validation
interface CreateOrderRequest {
  customer_organization_id: string;
  primary_contact_id: string;
  business_entity_id: string;
  installation_address: {
    postal_code: string;
    house_number: string;
    house_number_addition?: string;
    street?: string;
    city?: string;
  };
  line_items: LineItemRequest[];
}

// Xano Function: createOrderWithAddressValidation
async function createOrderWithAddressValidation(orderData) {
  // 1. Validate installation address
  const addressValidation = await validateDutchAddress(
    orderData.installation_address.postal_code,
    orderData.installation_address.house_number,
    orderData.installation_address.house_number_addition
  );

  if (!addressValidation.valid) {
    return {
      success: false,
      error: 'Invalid installation address',
      details: addressValidation.error
    };
  }

  // 2. Create normalized address record
  const addressRecord = await createAddress({
    street: addressValidation.street,
    house_number: addressValidation.house_number,
    house_number_addition: addressValidation.house_number_addition,
    postal_code: addressValidation.postal_code,
    city: addressValidation.city,
    province: addressValidation.province,
    country: 'NL',
    coordinates: addressValidation.coordinates,
    address_type: 'installation',
    validated_at: new Date(),
    validation_source: addressValidation.source,
    is_validated: true,
    bag_id: addressValidation.bag_id,
    google_place_id: addressValidation.google_place_id
  });

  // 3. Create order with validated address
  const order = await createOrder({
    ...orderData,
    installation_address_id: addressRecord.id,
    status: 'draft'
  });

  // 4. Log validation for audit trail
  await createAddressValidation({
    address_id: addressRecord.id,
    input_data: orderData.installation_address,
    validation_source: addressValidation.source,
    validation_result: addressValidation,
    confidence_score: addressValidation.confidence
  });

  return {
    success: true,
    order_id: order.id,
    validated_address: addressValidation,
    address_confidence: addressValidation.confidence
  };
}
```

### **Route Optimization for Team Assignment**
```typescript
// Calculate optimal team assignment based on location
async function calculateOptimalTeamAssignment(orderIds: string[], date: string) {
  const orders = await getOrdersWithAddresses(orderIds);
  const availableTeams = await getAvailableTeams(date);

  // Use Google Distance Matrix API for travel time calculations
  const distanceMatrix = await calculateDistanceMatrix(
    availableTeams.map(team => team.base_location),
    orders.map(order => order.installation_address.coordinates)
  );

  const assignments = optimizeTeamAssignments(distanceMatrix, orders, availableTeams);

  return assignments;
}

// Google Distance Matrix API integration
async function calculateDistanceMatrix(origins: Coordinate[], destinations: Coordinate[]) {
  const originString = origins.map(coord => `${coord.latitude},${coord.longitude}`).join('|');
  const destinationString = destinations.map(coord => `${coord.latitude},${coord.longitude}`).join('|');

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originString}&destinations=${destinationString}&key=${GOOGLE_MAPS_API_KEY_BACKEND}&units=metric&departure_time=now&traffic_model=best_guess`
  );

  return response.json();
}
```

---

## 📊 **PERFORMANCE OPTIMIZATION**

### **Caching Strategy**
```typescript
// Address validation caching
interface AddressCache {
  key: string; // `${postal_code}_${house_number}_${addition}`
  result: ValidatedAddress;
  expires_at: Date;
  hit_count: number;
}

// Redis cache implementation
const CACHE_TTL = 30 * 24 * 60 * 60; // 30 days for validated addresses

async function getCachedAddressValidation(postalCode: string, houseNumber: string, addition: string = '') {
  const cacheKey = `addr_${postalCode}_${houseNumber}_${addition}`.toLowerCase();
  
  const cached = await redis.get(cacheKey);
  if (cached) {
    const result = JSON.parse(cached);
    
    // Update hit count
    await redis.hincrby('addr_stats', cacheKey, 1);
    
    return result;
  }
  
  return null;
}

async function setCachedAddressValidation(postalCode: string, houseNumber: string, addition: string, result: ValidatedAddress) {
  const cacheKey = `addr_${postalCode}_${houseNumber}_${addition}`.toLowerCase();
  
  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
  await redis.hset('addr_stats', cacheKey, 1);
}
```

### **Rate Limiting & Error Handling**
```typescript
// API rate limiting implementation
class GoogleMapsRateLimiter {
  private requestQueue: Array<() => Promise<any>> = [];
  private processing = false;
  private readonly maxRequestsPerSecond = 50;

  async makeRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.requestQueue.length === 0) return;

    this.processing = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        await request();
        
        // Rate limiting delay
        await new Promise(resolve => 
          setTimeout(resolve, 1000 / this.maxRequestsPerSecond)
        );
      }
    }

    this.processing = false;
  }
}
```

---

## 🔒 **SECURITY & COMPLIANCE**

### **API Key Security**
```typescript
// Environment-based API key management
const getGoogleMapsConfig = () => {
  const environment = process.env.NODE_ENV;
  
  switch (environment) {
    case 'production':
      return {
        apiKey: process.env.GOOGLE_MAPS_API_KEY_PROD,
        restrictedDomains: ['chargecars.nl', 'laderthuis.nl', 'meterkastthuis.nl'],
        rateLimits: { requests: 10000, per: 'day' }
      };
    
    case 'staging':
      return {
        apiKey: process.env.GOOGLE_MAPS_API_KEY_STAGING,
        restrictedDomains: ['staging.chargecars.nl'],
        rateLimits: { requests: 1000, per: 'day' }
      };
    
    default:
      return {
        apiKey: process.env.GOOGLE_MAPS_API_KEY_DEV,
        restrictedDomains: ['localhost', '127.0.0.1'],
        rateLimits: { requests: 100, per: 'day' }
      };
  }
};
```

### **Data Privacy Compliance**
```typescript
// GDPR-compliant location data handling
interface LocationDataHandler {
  // Only store coordinates when necessary for business operations
  storeCoordinates: boolean;
  
  // Anonymize location data after 90 days
  anonymizeAfterDays: 90;
  
  // User consent tracking
  trackingConsent: 'explicit' | 'implicit' | 'none';
  
  // Data retention policy
  retentionPolicy: {
    addresses: '7 years',      // Business records
    coordinates: '90 days',    // Operational data
    validations: '30 days'     // Audit trail
  };
}
```

---

## 📋 **IMPLEMENTATION CHECKLIST**

### **Backend API Setup**
- [ ] Google Cloud Platform project setup
- [ ] API keys generated with proper restrictions
- [ ] BAG API integration for Dutch addresses
- [ ] Address validation endpoints created
- [ ] Geocoding service implementation
- [ ] Rate limiting and caching implementation
- [ ] Error handling and fallback systems

### **Frontend Implementation**
- [ ] Google Maps React wrapper setup
- [ ] Interactive team tracking maps
- [ ] Address autocomplete components
- [ ] Entity-specific map styling
- [ ] Mobile-responsive map interfaces
- [ ] Real-time marker updates
- [ ] Route planning interfaces

### **Database Integration**
- [ ] Address table enhancements
- [ ] Validation logging system
- [ ] Coordinate storage optimization
- [ ] Index creation for performance
- [ ] Data migration for existing addresses

### **Testing & Validation**
- [ ] Address validation accuracy testing
- [ ] Map performance testing
- [ ] Mobile responsiveness verification
- [ ] API rate limit testing
- [ ] Error scenario testing
- [ ] Cross-browser compatibility

### **Production Deployment**
- [ ] Environment-specific API keys
- [ ] Monitoring and alerting setup
- [ ] Performance baseline establishment
- [ ] Security audit completion
- [ ] Documentation finalization
- [ ] Team training completion

---

## 🎯 **SUCCESS METRICS**

### **Technical Performance**
- **Address Validation Accuracy**: >98% for Dutch addresses
- **Map Load Time**: <2 seconds on mobile
- **API Response Time**: <200ms for address validation
- **Cache Hit Rate**: >80% for address lookups

### **Business Impact**
- **Data Quality**: 60% reduction in address errors
- **Operational Efficiency**: 25% improvement in route planning
- **User Experience**: <3 second address entry time
- **Cost Optimization**: 40% reduction in manual address corrections

### **User Adoption**
- **Team Usage**: >90% of technicians use mobile maps daily
- **Address Autocomplete**: >95% usage rate in order forms
- **Customer Satisfaction**: 4.8+ rating for accurate service delivery

---

**This comprehensive guide provides all necessary components for successful Google Maps integration across the ChargeCars V2 platform, ensuring accurate address handling and enhanced operational efficiency through interactive mapping capabilities.**

---

*Google Maps Integration Guide | ChargeCars V2 Technical Team | 1 juni 2025* 