# ChargeCars V2 - Permission & Pricing System Design (Simplified)
**Created**: June 3, 2025  
**Status**: Revised Design  
**Impact**: High - Core pricing and permission architecture

---

## 🎯 **SIMPLIFIED DESIGN OVERVIEW**

### Core Changes from Original Design:
1. **Removed**: `billing_split` - Not needed, line items belong to one organization
2. **Removed**: `requires_approval_from` - Always uses `billing_contact_id`
3. **Renamed**: `financial_contact_id` → `billing_contact_id` (more specific)
4. **Added**: Smart pricing system with `pricing_agreement` table

---

## 💰 **PRICING STRATEGY**

### Pricing Hierarchy (Applied in Order):
1. **Customer-Specific Agreement** (highest priority)
2. **Organization Type Agreement** (dealer, partner, etc.)
3. **Category-Based Pricing** (per product category)
4. **Volume Discounts** (quantity-based)
5. **Article List Price** (default fallback)

### Article Pricing Fields:
- `list_price`: Standard consumer price
- `cost_price`: Internal cost (for margin calculation)
- `recommended_price`: Manufacturer's recommended price

### How Pricing Works:

```javascript
// Pseudo-code for price determination
function getLineItemPrice(article, organization, quantity) {
  // 1. Find applicable pricing agreements
  const agreements = db.query(`
    SELECT * FROM pricing_agreement
    WHERE organization_id = @org_id
      AND is_active = true
      AND valid_from <= NOW()
      AND (valid_until IS NULL OR valid_until >= NOW())
      AND (applies_to_articles IS NULL OR @article_id = ANY(applies_to_articles))
      AND (applies_to_categories IS NULL OR @category = ANY(applies_to_categories))
    ORDER BY priority DESC, created_at DESC
    LIMIT 1
  `, { org_id: organization.id, article_id: article.id, category: article.category });

  if (agreements.length > 0) {
    const agreement = agreements[0];
    
    // 2. Check for fixed price
    if (agreement.fixed_prices && agreement.fixed_prices[article.id]) {
      return agreement.fixed_prices[article.id];
    }
    
    // 3. Apply percentage discount/markup
    let price = article.list_price;
    if (agreement.discount_percentage) {
      price = price * (1 - agreement.discount_percentage / 100);
    }
    if (agreement.markup_percentage) {
      price = price * (1 + agreement.markup_percentage / 100);
    }
    
    // 4. Apply volume discounts
    if (agreement.volume_discounts) {
      const tier = agreement.volume_discounts.find(t => 
        quantity >= t.min_quantity && 
        (!t.max_quantity || quantity <= t.max_quantity)
      );
      if (tier) {
        price = price * (1 - tier.discount_percentage / 100);
      }
    }
    
    return price;
  }
  
  // 5. Default to list price
  return article.list_price;
}
```

---

## 📊 **PRICING AGREEMENT TABLE STRUCTURE**

### pricing_agreement (Table ID: 117)
```sql
- id (uuid)
- agreement_name (text)
- organization_id (uuid) -- Who gets these prices
- root_organization_id (uuid) -- Who provides these prices
- agreement_type (enum: customer_specific, dealer_standard, partner_wholesale, internal_cost, promotional)
- pricing_rules (json) -- Flexible configuration
- applies_to_articles (uuid[]) -- Specific articles (null = all)
- applies_to_categories (text[]) -- Categories (null = all)
- discount_percentage (decimal) -- Global discount
- markup_percentage (decimal) -- Global markup
- fixed_prices (json) -- {"article_id": price}
- volume_discounts (json) -- [{"min_quantity": 10, "discount_percentage": 5}]
- is_active (boolean)
- valid_from (date)
- valid_until (date)
- priority (int) -- Higher = more priority
```

### Example pricing_rules JSON:
```json
{
  "base_discount": 15,
  "category_overrides": {
    "installation_service": {
      "discount": 10,
      "min_margin": 20
    },
    "wallbox": {
      "discount": 20,
      "max_discount": 25
    }
  },
  "brand_discounts": {
    "Zaptec": 5,
    "Alfen": 3
  },
  "payment_terms": "net_60",
  "free_shipping_threshold": 1000,
  "special_conditions": "Prices valid for minimum 10 units per year"
}
```

### Example volume_discounts JSON:
```json
[
  {
    "min_quantity": 10,
    "max_quantity": 49,
    "discount_percentage": 5
  },
  {
    "min_quantity": 50,
    "max_quantity": 99,
    "discount_percentage": 10
  },
  {
    "min_quantity": 100,
    "discount_percentage": 15
  }
]
```

---

## 🔄 **SIMPLIFIED BILLING FLOW**

### Line Item Assignment:
1. **Default**: Line items inherit `billing_organization_id` from order's `default_billing_target`
2. **Override**: Can manually set different `billing_organization_id` per line item
3. **Contact**: Each organization has a `financial_contact_id`, line items get assigned `billing_contact_id`
4. **Price**: System finds best applicable pricing agreement
5. **Approval**: `billing_contact_id` must approve their line items

### Order Billing Configuration:
```javascript
order.default_billing_target options:
- 'customer': Bill to customer organization
- 'root': Bill to root organization (controls workflow)
- 'dealer': Bill to dealer in related_organizations
- 'split': Each line item individually assigned
```

---

## 📋 **COMMON SCENARIOS**

### 1. Direct Customer Order
- Root Organization = Customer Organization
- All line items → Customer
- Uses customer pricing agreement (if exists) or list price

### 2. Dealer Order for Customer
- Root Organization = Dealer
- Customer Organization = End Customer
- Hardware → Dealer (wholesale pricing)
- Installation → Customer (retail pricing)

### 3. Partner Referral
- Root Organization = ChargeCars
- Partner Organization = Referral Partner
- All items → Customer
- Partner gets commission (tracked separately)

### 4. Internal Project
- Root Organization = ChargeCars Entity
- Uses internal cost pricing
- Special approval workflow

---

## 🚀 **IMPLEMENTATION BENEFITS**

1. **Flexible Pricing**: Supports any pricing model
2. **No Hardcoding**: All pricing rules in database
3. **Audit Trail**: Complete history of which prices were used
4. **Performance**: Pricing cached per agreement
5. **Multi-Entity**: Each business entity can have own pricing

---

## ✅ **NEXT STEPS**

1. **Create Pricing Functions**:
   - `getApplicablePricingAgreement()`
   - `calculateLineItemPrice()`
   - `applyVolumeDiscounts()`

2. **API Endpoints**:
   - `POST /pricing-agreements` - Create agreement
   - `GET /organizations/{id}/pricing` - Get org pricing
   - `POST /line-items/calculate-price` - Price calculation

3. **Data Migration**:
   - Set `billing_contact_id` from organization's `financial_contact_id`
   - Convert `unit_price` to `list_price` in articles
   - Create default pricing agreements

---

## 📊 **PRICING EXAMPLES**

### Example 1: Dealer Pricing
```json
{
  "agreement_name": "Standard Dealer Pricing 2025",
  "organization_id": "dealer-uuid",
  "agreement_type": "dealer_standard",
  "discount_percentage": 25,
  "category_overrides": {
    "installation_service": {
      "discount": 15
    }
  },
  "volume_discounts": [
    {"min_quantity": 50, "discount_percentage": 30}
  ]
}
```

### Example 2: Large Customer
```json
{
  "agreement_name": "ABN AMRO Corporate Pricing",
  "organization_id": "abn-amro-uuid",
  "agreement_type": "customer_specific",
  "fixed_prices": {
    "zaptec-pro-uuid": 1950.00,
    "installation-uuid": 350.00
  },
  "payment_terms": "net_90"
}
``` 