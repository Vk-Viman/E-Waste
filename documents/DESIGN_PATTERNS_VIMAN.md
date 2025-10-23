# DESIGN PATTERNS - IT23227118 (Viman)
## Configuration Feature Architecture

---

## 📐 Design Patterns Overview

**Total Design Patterns Used: 5**

1. **Strategy Pattern** (Behavioral)
2. **MVC Pattern** (Architectural)
3. **Repository Pattern** (Structural)
4. **Factory Pattern** (Creational)
5. **Observer Pattern** (Behavioral)

---

## 1️⃣ STRATEGY PATTERN (Behavioral)

### 📍 **Location:** `apps/backend/src/features/configuration/service.js`

### **Purpose:**
Define a family of billing calculation algorithms, encapsulate each one, and make them interchangeable.

### **Implementation:**

```javascript
// STRATEGY INTERFACE: calculate({ weightKg?: number }): number

// Strategy 1: Flat Fee Billing
class FlatFeeStrategy {
  constructor(rate = 0) {
    this.rate = typeof rate === 'number' ? rate : 0;
  }
  
  calculate(_ctx = {}) {
    return this.rate;  // Fixed rate regardless of weight
  }
}

// Strategy 2: Weight-Based Billing
class WeightBasedStrategy {
  constructor(ratePerKg = 0) {
    this.ratePerKg = typeof ratePerKg === 'number' ? ratePerKg : 0;
  }
  
  calculate(ctx = {}) {
    const weight = typeof ctx.weightKg === 'number' ? ctx.weightKg : 0;
    return this.ratePerKg * weight;  // Rate × weight
  }
}

// Context: Selects appropriate strategy at runtime
function selectBillingStrategy(systemConfig) {
  const model = systemConfig?.billingModels[0];
  const name = String(model?.name || '').toLowerCase();
  const rate = model?.rate || 0;
  
  // Factory method to create strategy
  if (name.includes('weight')) {
    return new WeightBasedStrategy(rate);
  }
  return new FlatFeeStrategy(rate);
}
```

### **Where It's Used:**
- **File:** `service.js` (Lines 23-62)
- **Classes:** `FlatFeeStrategy`, `WeightBasedStrategy`
- **Factory Function:** `selectBillingStrategy()`

### **Benefits:**
✅ Easy to add new billing strategies (e.g., `TieredPricingStrategy`, `SubscriptionStrategy`)  
✅ Strategies are interchangeable at runtime  
✅ Encapsulates algorithm variations  
✅ Follows Open/Closed Principle (SOLID)

### **UML Diagram:**
```
┌─────────────────────┐
│  SystemConfig       │
│  (Context)          │
└──────────┬──────────┘
           │ uses
           ▼
┌─────────────────────┐
│  <<interface>>      │
│  BillingStrategy    │
│  + calculate(ctx)   │
└──────────┬──────────┘
           △
           │ implements
     ┌─────┴─────┐
     │           │
┌────┴────┐ ┌───┴─────────┐
│FlatFee  │ │WeightBased  │
│Strategy │ │Strategy     │
└─────────┘ └─────────────┘
```

---

## 2️⃣ MVC PATTERN (Architectural)

### 📍 **Location:** `apps/backend/src/features/configuration/`

### **Purpose:**
Separate business logic, data management, and presentation concerns.

### **Implementation:**

#### **MODEL (Data Layer)**
**File:** `model.js`, `wasteCategory.model.js`

```javascript
// SystemConfig Model - Data structure and validation
const SystemConfigSchema = new mongoose.Schema({
  activeBillingModel: { type: String, default: '' },
  billingModels: { type: [BillingModelSchema], default: [] },
  wasteCategories: { type: [WasteCategorySchema], default: [] },
  collectionRules: { type: CollectionRuleSchema, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('SystemConfig', SystemConfigSchema);
```

#### **VIEW (Presentation Layer)**
**File:** Frontend - `app/(admin)/settings/page.tsx`

```typescript
// React component that displays configuration
export default function SettingsPage() {
  return (
    <div>
      <h1>System Settings</h1>
      {/* Displays billing models, categories, collection rules */}
    </div>
  );
}
```

#### **CONTROLLER (Business Logic Layer)**
**File:** `controller.js`

```javascript
// Controller handles requests and coordinates Model/Service
async function updateConfig(req, res) {
  const update = req.body;
  
  // Validation logic
  // ...
  
  // Update model
  const cfg = await SystemConfig.findOne();
  Object.assign(cfg, update);
  await cfg.save();
  
  // Trigger notifications (service layer)
  const notifications = await notifyDependentModules(cfg);
  
  // Send response (view layer)
  res.json({ config: cfg, notifications });
}
```

### **MVC Flow:**
```
┌────────┐      ┌────────────┐      ┌─────────┐      ┌──────────┐
│ Client │─────▶│ Controller │─────▶│ Service │─────▶│  Model   │
│  (Web) │      │ (routes.js)│      │(service)│      │(database)│
└────────┘      └────────────┘      └─────────┘      └──────────┘
     ▲                 │                                     │
     │                 ▼                                     │
     │          ┌──────────┐                                │
     └──────────│ Response │◀───────────────────────────────┘
                └──────────┘
```

### **Where It's Used:**
- **Model:** `model.js` (Lines 1-54), `wasteCategory.model.js`
- **View:** `app/(admin)/settings/page.tsx`
- **Controller:** `controller.js` (Lines 1-256)

### **Benefits:**
✅ Separation of concerns  
✅ Easier to test each layer independently  
✅ Can change UI without affecting business logic  
✅ Multiple views can use same controller/model

---

## 3️⃣ REPOSITORY PATTERN (Structural)

### 📍 **Location:** `apps/backend/src/features/configuration/controller.js`

### **Purpose:**
Abstract data access logic and provide a collection-like interface for accessing domain objects.

### **Implementation:**

```javascript
// Repository-like data access methods

// Get single configuration
async function getConfig(_req, res) {
  // Abstract: "Find or create configuration"
  const cfg = (await SystemConfig.findOne()) || (await SystemConfig.create({}));
  res.json(cfg);
}

// Update configuration
async function updateConfig(req, res) {
  // Abstract: "Find and update configuration"
  const cfg = await SystemConfig.findOne();
  Object.assign(cfg, req.body);
  await cfg.save();
  res.json({ config: cfg });
}

// Delete configuration
async function deleteConfig(_req, res) {
  // Abstract: "Remove all configurations"
  await SystemConfig.deleteMany({});
  res.status(204).send();
}

// Category repository methods
async function getAllCategories(_req, res) {
  const categories = await WasteCategory.find();
  res.json(categories);
}

async function addCategory(req, res) {
  const category = await WasteCategory.create(req.body);
  res.status(201).json(category);
}
```

### **Repository Interface:**
```
┌─────────────────────────┐
│  ConfigurationRepository│
├─────────────────────────┤
│ + findOne()             │
│ + create()              │
│ + update()              │
│ + delete()              │
│ + findCategories()      │
│ + addCategory()         │
└─────────────────────────┘
```

### **Where It's Used:**
- **File:** `controller.js`
- **Methods:** `getConfig`, `updateConfig`, `deleteConfig`, `getAllCategories`, `addCategory`, `updateCategory`, `deleteCategory`

### **Benefits:**
✅ Centralizes data access logic  
✅ Easy to switch database (MongoDB → PostgreSQL)  
✅ Testable (can mock repository)  
✅ Consistent data access interface

---

## 4️⃣ FACTORY PATTERN (Creational)

### 📍 **Location:** `apps/backend/src/features/configuration/service.js`

### **Purpose:**
Create objects without specifying exact class to instantiate.

### **Implementation:**

```javascript
// Factory Method: Creates appropriate strategy based on config
function selectBillingStrategy(systemConfig) {
  const model = systemConfig?.billingModels[0];
  const name = String(model?.name || '').toLowerCase();
  const rate = model?.rate || 0;
  
  // FACTORY LOGIC: Decides which concrete class to instantiate
  if (name === 'weight' || name === 'weight-based' || name === 'weightbased') {
    return new WeightBasedStrategy(rate);  // Create WeightBased
  }
  
  // Default factory product
  return new FlatFeeStrategy(rate);  // Create FlatFee
}

// Usage:
const strategy = selectBillingStrategy(config);
const charge = strategy.calculate({ weightKg: 10 });
```

### **Factory Pattern Structure:**
```
┌──────────────────────────┐
│  selectBillingStrategy() │  ◀─── Factory Method
│  (Factory)               │
└────────────┬─────────────┘
             │ creates
    ┌────────┴────────┐
    │                 │
┌───▼────┐    ┌──────▼──────┐
│FlatFee │    │WeightBased  │
│Strategy│    │Strategy     │
└────────┘    └─────────────┘
```

### **Where It's Used:**
- **File:** `service.js` (Lines 52-62)
- **Function:** `selectBillingStrategy()`

### **Benefits:**
✅ Client doesn't need to know concrete class names  
✅ Easy to add new billing strategies  
✅ Encapsulates object creation logic  
✅ Supports runtime decision making

---

## 5️⃣ OBSERVER PATTERN (Behavioral)

### 📍 **Location:** `apps/backend/src/features/configuration/service.js`

### **Purpose:**
Notify dependent modules when configuration changes (loose coupling).

### **Implementation:**

```javascript
// Subject: System Configuration
// Observers: Billing Module, Reporting Module, Waste Tracking Module

async function notifyDependentModules(updatedConfig, changeType = 'settings_updated') {
  const notifications = [];

  // Notify Observer 1: Billing Module
  if (updatedConfig.activeBillingModel || updatedConfig.billingModels) {
    notifications.push({
      module: 'Billing',
      event: 'billing_config_changed',
      timestamp: new Date(),
      data: {
        activeBillingModel: updatedConfig.activeBillingModel,
        billingModels: updatedConfig.billingModels,
      },
    });
  }

  // Notify Observer 2: Reporting Module
  notifications.push({
    module: 'Reporting',
    event: 'system_config_changed',
    timestamp: new Date(),
    data: { changeType },
  });

  // Notify Observer 3: Waste Tracking Module
  if (updatedConfig.wasteCategories) {
    notifications.push({
      module: 'Waste Tracking',
      event: 'categories_updated',
      timestamp: new Date(),
      data: {
        categories: updatedConfig.wasteCategories,
      },
    });
  }

  return {
    success: true,
    notifications,
    notifiedAt: new Date(),
  };
}

// Triggered automatically when config updates
const result = await notifyDependentModules(config);
```

### **Observer Pattern Structure:**
```
┌──────────────────┐
│ SystemConfig     │  ◀─── Subject
│ (Subject)        │
└────────┬─────────┘
         │ notifies
    ┌────┴────┬────────────┬─────────────┐
    │         │            │             │
┌───▼──┐ ┌───▼────┐ ┌────▼─────┐ ┌─────▼────────┐
│Billing│ │Reporting│ │Waste     │ │Collection    │
│Module │ │Module   │ │Tracking  │ │Module        │
└───────┘ └─────────┘ └──────────┘ └──────────────┘
   ▲           ▲            ▲             ▲
   └───────────┴────────────┴─────────────┘
              Observers
```

### **Where It's Used:**
- **File:** `service.js` (Lines 72-139)
- **Function:** `notifyDependentModules()`
- **Called from:** `controller.js` `updateConfig()` function

### **Benefits:**
✅ Loose coupling between modules  
✅ Easy to add new observers  
✅ Automatic synchronization  
✅ Follows Single Responsibility (each module handles its own notifications)

---

## 📊 Design Patterns Summary Table

| Pattern | Type | Location | Purpose | Benefits |
|---------|------|----------|---------|----------|
| **Strategy** | Behavioral | `service.js` | Billing algorithm selection | Interchangeable algorithms |
| **MVC** | Architectural | All files | Separation of concerns | Maintainable architecture |
| **Repository** | Structural | `controller.js` | Data access abstraction | Database independence |
| **Factory** | Creational | `service.js` | Strategy creation | Encapsulated object creation |
| **Observer** | Behavioral | `service.js` | Module notifications | Loose coupling |

---

## 🗂️ File-to-Pattern Mapping

### **service.js**
- ✅ Strategy Pattern (Lines 23-41)
- ✅ Factory Pattern (Lines 52-62)
- ✅ Observer Pattern (Lines 72-139)

### **controller.js**
- ✅ MVC Pattern - Controller Layer (Lines 1-256)
- ✅ Repository Pattern (All CRUD methods)

### **model.js**
- ✅ MVC Pattern - Model Layer (Lines 1-54)

### **routes.js**
- ✅ MVC Pattern - Route Configuration (Lines 1-306)

### **wasteCategory.model.js**
- ✅ MVC Pattern - Model Layer (Lines 1-14)

---

## 🎯 Pattern Relationships

### **How Patterns Work Together:**

```
┌─────────────────────────────────────────────────────────┐
│                     MVC ARCHITECTURE                     │
│  ┌──────────┐    ┌────────────┐    ┌───────────┐       │
│  │  Model   │◀───│ Controller │◀───│   View    │       │
│  │ (Data)   │    │ (Logic)    │    │   (UI)    │       │
│  └──────────┘    └─────┬──────┘    └───────────┘       │
│                        │                                 │
│       ┌────────────────┴────────────────┐               │
│       │                                 │               │
│  ┌────▼─────┐                   ┌──────▼────┐          │
│  │ FACTORY  │                   │ OBSERVER  │          │
│  │ Pattern  │                   │ Pattern   │          │
│  │          │                   │           │          │
│  │ Creates: │                   │ Notifies: │          │
│  │ Strategy │                   │ Modules   │          │
│  └────┬─────┘                   └───────────┘          │
│       │                                                 │
│  ┌────▼──────────┐                                     │
│  │   STRATEGY    │                                     │
│  │   Pattern     │                                     │
│  │               │                                     │
│  │ FlatFee vs    │                                     │
│  │ WeightBased   │                                     │
│  └───────────────┘                                     │
│                                                         │
│  Data Access: REPOSITORY Pattern                       │
└─────────────────────────────────────────────────────────┘
```

---

## 💡 Design Pattern Benefits for Viman's Feature

### **1. Maintainability**
- Easy to add new billing strategies without changing existing code
- Clear separation between data, logic, and presentation

### **2. Testability**
- Each pattern component can be tested independently
- Mock strategies, repositories for unit testing

### **3. Scalability**
- Add new observers without modifying notification logic
- Add new billing algorithms without touching controller

### **4. Flexibility**
- Switch billing strategies at runtime
- Change database without affecting business logic

### **5. SOLID Compliance**
- Strategy Pattern → Open/Closed Principle
- Repository Pattern → Dependency Inversion
- Observer Pattern → Single Responsibility

---

## 🔍 Pattern Code Examples

### **Example 1: Using Strategy Pattern**
```javascript
// Before: Hard-coded billing calculation
function calculateBilling(config, weight) {
  if (config.type === 'flat') {
    return config.rate;
  } else if (config.type === 'weight') {
    return config.rate * weight;
  }
  // Hard to extend!
}

// After: Strategy Pattern
const strategy = selectBillingStrategy(config);
const charge = strategy.calculate({ weightKg: weight });
// Easy to add new strategies!
```

### **Example 2: Using Observer Pattern**
```javascript
// When configuration updates:
async function updateConfig(req, res) {
  const cfg = await SystemConfig.findOne();
  Object.assign(cfg, req.body);
  await cfg.save();
  
  // Automatically notify all observers
  const notifications = await notifyDependentModules(cfg);
  
  res.json({ config: cfg, notifications });
}
```

---

## 📚 Design Pattern Resources

### **Gang of Four (GoF) Patterns Used:**
1. ✅ **Strategy** - Behavioral Pattern
2. ✅ **Factory Method** - Creational Pattern
3. ✅ **Observer** - Behavioral Pattern

### **Architectural Patterns:**
4. ✅ **MVC** - Model-View-Controller
5. ✅ **Repository** - Data Access Layer

---

## ✅ Verification Checklist

- [x] Strategy Pattern implemented with 2+ strategies
- [x] Factory Pattern creates strategies dynamically
- [x] Observer Pattern notifies 3+ modules
- [x] MVC Pattern separates concerns across 3 layers
- [x] Repository Pattern abstracts data access
- [x] All patterns documented with code examples
- [x] UML diagrams provided
- [x] Benefits clearly explained

---

**Created:** December 2024  
**Feature:** IT23227118 - Configure System Settings  
**Developer:** Viman Kavinda  
**Status:** ✅ 5 Design Patterns Implemented
