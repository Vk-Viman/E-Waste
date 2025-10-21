/**
 * ═══════════════════════════════════════════════════════════════
 * DESIGN PATTERN: MVC PATTERN - MODEL LAYER
 * ═══════════════════════════════════════════════════════════════
 * 
 * This file implements the MODEL layer of MVC architecture
 * 
 * Model: Defines data structure, validation rules, and database schema
 * View: React components (app/(admin)/settings/page.tsx)
 * Controller: controller.js (business logic and request handling)
 * 
 * Benefits:
 * ✓ Data structure is independent of business logic
 * ✓ Validation rules are centralized in schema
 * ✓ Easy to migrate to different database
 * ✓ Schema serves as documentation for data structure
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * SOLID PRINCIPLES APPLIED IN THIS FILE:
 * 
 * S - Single Responsibility Principle:
 *     Each schema represents ONE entity (BillingModel, WasteCategory, CollectionRule, SystemConfig)
 *     Clear separation of concerns
 * 
 * L - Liskov Substitution Principle:
 *     All schemas follow Mongoose Schema contract
 *     Can be used anywhere a Mongoose schema is expected
 * 
 * D - Dependency Inversion Principle:
 *     Controller depends on Model abstraction, not database directly
 *     Business logic is database-agnostic
 */

const mongoose = require('mongoose');

// MVC: MODEL - Sub-schema for billing model data structure
// SOLID: S (Single Responsibility) - Only defines billing model structure
const BillingModelSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    rate: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

// MVC: MODEL - Sub-schema for waste category data structure
// SOLID: S (Single Responsibility) - Only defines waste category structure
const WasteCategorySchema = new mongoose.Schema(
  {
    key: { type: String, trim: true, required: true },
    label: { type: String, trim: true, required: true },
  },
  { _id: false }
);

// MVC: MODEL - Sub-schema for collection rule data structure
// SOLID: S (Single Responsibility) - Only defines collection rule structure
const CollectionRuleSchema = new mongoose.Schema(
  {
    frequency: { type: String, trim: true, default: 'weekly' }, // e.g., 'daily', 'weekly', 'biweekly'
    timeSlot: { type: String, trim: true, default: '08:00-12:00' },
    maxBinsPerCollection: { type: Number, default: 1 },
  },
  { _id: false }
);

// MVC: MODEL - Main schema for system configuration
// SOLID: S (Single Responsibility) - Main system configuration schema
// SOLID: L (Liskov Substitution) - Follows Mongoose schema contract
const SystemConfigSchema = new mongoose.Schema(
  {
    // Active billing model (must match a name in billingModels array)
    activeBillingModel: { 
      type: String,
      default: ''
    },
    billingModels: { type: [BillingModelSchema], default: [] },
    wasteCategories: { type: [WasteCategorySchema], default: [] },
    collectionRules: { type: CollectionRuleSchema, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SystemConfig', SystemConfigSchema);
