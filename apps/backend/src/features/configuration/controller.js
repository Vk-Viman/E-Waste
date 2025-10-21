/**
 * ═══════════════════════════════════════════════════════════════
 * DESIGN PATTERN: MVC PATTERN (Architectural Pattern)
 * ═══════════════════════════════════════════════════════════════
 * 
 * This file implements the CONTROLLER layer of MVC architecture
 * 
 * Model: SystemConfig, WasteCategory (data structures in model.js)
 * View: React components in frontend (app/(admin)/settings/page.tsx)
 * Controller: This file - handles requests, coordinates business logic
 * 
 * Benefits:
 * ✓ Separation of concerns (data, logic, presentation)
 * ✓ Each layer can be tested independently
 * ✓ Can change UI without affecting business logic
 * ✓ Multiple views can use same controller
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * DESIGN PATTERN: REPOSITORY PATTERN (Structural Pattern)
 * ═══════════════════════════════════════════════════════════════
 * 
 * This file implements repository-like data access methods
 * 
 * Purpose: Abstract data access logic and provide collection-like
 *          interface for accessing domain objects
 * 
 * Repository Methods:
 * - getConfig()        → Find or create configuration
 * - updateConfig()     → Update configuration
 * - deleteConfig()     → Remove configuration
 * - getAllCategories() → List all categories
 * - addCategory()      → Create new category
 * - updateCategory()   → Update existing category
 * - deleteCategory()   → Remove category
 * 
 * Benefits:
 * ✓ Centralizes data access logic
 * ✓ Easy to switch database (MongoDB → PostgreSQL)
 * ✓ Testable (can mock repository methods)
 * ✓ Consistent interface for data operations
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * SOLID PRINCIPLES APPLIED IN THIS FILE:
 * 
 * S - Single Responsibility Principle:
 *     Each function has ONE job (getConfig, updateConfig, deleteConfig, etc.)
 *     7 separate functions, each handling a specific operation
 * 
 * I - Interface Segregation Principle:
 *     Functions only use what they need from req/res (_req when not needed)
 *     Separate endpoints for config vs category operations
 * 
 * D - Dependency Inversion Principle:
 *     Depends on Model abstraction (SystemConfig, WasteCategory)
 *     Depends on service abstraction (notifyDependentModules)
 *     Not directly coupled to database implementation
 */

const SystemConfig = require('./model');
const WasteCategory = require('./wasteCategory.model');
const { httpError } = require('../../utils/httpError');
const { notifyDependentModules } = require('./service'); // SOLID: D (Dependency on abstraction)

/**
 * ═══════════════════════════════════════════════════════════════
 * REPOSITORY PATTERN: Data Access Methods
 * ═══════════════════════════════════════════════════════════════
 */

// MVC: CONTROLLER METHOD
// REPOSITORY PATTERN: Read operation - Find or create configuration
// SOLID: S (Single Responsibility) - Only responsible for getting configuration
// SOLID: I (Interface Segregation) - Only uses 'res', not 'req' (hence _req)
async function getConfig(_req, res) {
  const cfg = (await SystemConfig.findOne()) || (await SystemConfig.create({}));
  res.json(cfg);
}

// MVC: CONTROLLER METHOD
// REPOSITORY PATTERN: Update operation - Modify configuration
// OBSERVER PATTERN: Triggers notifications to dependent modules after update
// SOLID: S (Single Responsibility) - Only responsible for updating configuration
// SOLID: D (Dependency Inversion) - Uses notifyDependentModules abstraction
async function updateConfig(req, res) {
  const update = req.body || {};
  
  // Validate billing models
  if (Array.isArray(update.billingModels)) {
    for (const model of update.billingModels) {
      if (!model || typeof model !== 'object') {
        throw httpError(400, 'Each billing model must be an object');
      }
      if (!model.name || typeof model.name !== 'string' || !model.name.trim()) {
        throw httpError(400, 'Billing model name is required and must be a non-empty string');
      }
      if (model.rate === undefined || model.rate === null) {
        throw httpError(400, 'Billing model rate is required');
      }
      if (typeof model.rate !== 'number' || isNaN(model.rate)) {
        throw httpError(400, 'Billing model rate must be a valid number');
      }
      if (model.rate < 0) {
        throw httpError(400, 'Billing model rate cannot be negative');
      }
    }
  } else if (update.billingModels !== undefined && !Array.isArray(update.billingModels)) {
    throw httpError(400, 'Billing models must be an array');
  }
  
  // Validate waste categories
  if (Array.isArray(update.wasteCategories)) {
    // First validate all categories before filtering
    for (const category of update.wasteCategories) {
      if (!category || typeof category !== 'object') {
        throw httpError(400, 'Each waste category must be an object');
      }
      if (!category.key || typeof category.key !== 'string' || !category.key.trim()) {
        throw httpError(400, 'Waste category key is required and must be a non-empty string');
      }
      if (!category.label || typeof category.label !== 'string' || !category.label.trim()) {
        throw httpError(400, 'Waste category label is required and must be a non-empty string');
      }
    }
    
    // Then filter out any empty keys (shouldn't happen after validation above)
    update.wasteCategories = update.wasteCategories.filter(c => c && c.key && String(c.key).trim());
    
    // Validate duplicate category keys
    const keys = update.wasteCategories.map((c) => String(c?.key || '').trim()).filter(Boolean);
    const dup = keys.find((k, i) => keys.indexOf(k) !== i);
    if (dup) {
      throw httpError(422, `Duplicate waste category key: '${dup}'`);
    }
  } else if (update.wasteCategories !== undefined && !Array.isArray(update.wasteCategories)) {
    throw httpError(400, 'Waste categories must be an array');
  }
  
  // Validate collection rules
  if (update.collectionRules !== undefined) {
    if (typeof update.collectionRules !== 'object' || Array.isArray(update.collectionRules)) {
      throw httpError(400, 'Collection rules must be an object');
    }
    if (update.collectionRules.maxBinsPerCollection !== undefined) {
      if (typeof update.collectionRules.maxBinsPerCollection !== 'number' || 
          isNaN(update.collectionRules.maxBinsPerCollection)) {
        throw httpError(400, 'maxBinsPerCollection must be a valid number');
      }
    }
  }
  
  // Validate active billing model exists in billing models list
  if (update.activeBillingModel && Array.isArray(update.billingModels)) {
    const modelExists = update.billingModels.some(
      bm => String(bm?.name || '').trim() === String(update.activeBillingModel).trim()
    );
    if (!modelExists && update.billingModels.length > 0) {
      throw httpError(422, `Active billing model '${update.activeBillingModel}' must exist in billing models list`);
    }
  }
  
  try {
    const cfg = await SystemConfig.findOneAndUpdate({}, update, { 
      new: true, 
      upsert: true,
      runValidators: true 
    });
    
    // OBSERVER PATTERN: Notify all dependent modules about the configuration change
    // Notify dependent modules (Billing, Reporting, Waste Tracking)
    const notificationResult = await notifyDependentModules(cfg, 'settings_updated');
    
    res.json({
      config: cfg,
      notifications: notificationResult,
      message: 'Settings updated successfully',
    });
  } catch (err) {
    // Convert Mongoose validation/cast errors to 400
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      throw httpError(400, `Validation error: ${err.message}`);
    }
    throw err;
  }
}

// MVC: CONTROLLER METHOD
// REPOSITORY PATTERN: Delete operation - Remove configuration
// SOLID: S (Single Responsibility) - Only responsible for deleting configuration
// SOLID: I (Interface Segregation) - Only uses 'res', not 'req' (hence _req)
async function deleteConfig(_req, res) {
  // We keep only one SystemConfig document; delete all to reset
  await SystemConfig.deleteMany({});
  res.status(204).send();
}

/**
 * ═══════════════════════════════════════════════════════════════
 * REPOSITORY PATTERN: Category Repository Methods
 * Separate collection management for waste categories
 * ═══════════════════════════════════════════════════════════════
 */

// SOLID: I (Interface Segregation) - Separate category operations from config operations
// Waste Category Management

// MVC: CONTROLLER METHOD
// REPOSITORY PATTERN: List operation - Get all categories
// SOLID: S (Single Responsibility) - Only responsible for getting all categories
async function getAllCategories(_req, res) {
  const categories = await WasteCategory.find({ isActive: true }).sort({ createdAt: -1 });
  res.json(categories);
}

// MVC: CONTROLLER METHOD
// REPOSITORY PATTERN: Create operation - Add new category
// SOLID: S (Single Responsibility) - Only responsible for adding a category
async function addCategory(req, res) {
  const { key, label, description } = req.body;
  
  if (!key || !label) {
    throw httpError(400, 'Category key and label are required');
  }

  // Check if category already exists
  const existing = await WasteCategory.findOne({ key: key.toLowerCase() });
  if (existing) {
    throw httpError(422, `Category with key '${key}' already exists`);
  }

  const category = await WasteCategory.create({ key, label, description });
  
  // Update SystemConfig with new category
  const cfg = await SystemConfig.findOne();
  if (cfg) {
    cfg.wasteCategories.push({ key: category.key, label: category.label });
    await cfg.save();
    await notifyDependentModules(cfg, 'category_added');
  }

  res.status(201).json({
    category,
    message: `Category '${label}' added successfully`,
  });
}

// MVC: CONTROLLER METHOD
// REPOSITORY PATTERN: Update operation - Modify existing category
// SOLID: S (Single Responsibility) - Only responsible for updating a category
async function updateCategory(req, res) {
  const { id } = req.params;
  const { label, description, isActive } = req.body;

  // Validate ObjectId format
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    throw httpError(400, 'Invalid category ID format');
  }

  try {
    const category = await WasteCategory.findByIdAndUpdate(
      id,
      { label, description, isActive },
      { new: true, runValidators: true }
    );

    if (!category) {
      throw httpError(404, 'Category not found');
    }

    // Update SystemConfig
    const cfg = await SystemConfig.findOne();
    if (cfg) {
      const catIndex = cfg.wasteCategories.findIndex(c => c.key === category.key);
      if (catIndex !== -1) {
        cfg.wasteCategories[catIndex].label = category.label;
        await cfg.save();
        await notifyDependentModules(cfg, 'category_updated');
      }
    }

    res.json({
      category,
      message: 'Category updated successfully',
    });
  } catch (err) {
    // Convert Mongoose validation/cast errors to 400
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      throw httpError(400, `Validation error: ${err.message}`);
    }
    throw err;
  }
}

// MVC: CONTROLLER METHOD
// REPOSITORY PATTERN: Delete operation - Remove category
// SOLID: S (Single Responsibility) - Only responsible for deleting a category
async function deleteCategory(req, res) {
  const { id } = req.params;

  const category = await WasteCategory.findByIdAndDelete(id);
  if (!category) {
    throw httpError(404, 'Category not found');
  }

  // Remove from SystemConfig
  const cfg = await SystemConfig.findOne();
  if (cfg) {
    cfg.wasteCategories = cfg.wasteCategories.filter(c => c.key !== category.key);
    await cfg.save();
    await notifyDependentModules(cfg, 'category_deleted');
  }

  res.json({
    message: `Category '${category.label}' deleted successfully`,
  });
}

module.exports = { 
  getConfig, 
  updateConfig, 
  deleteConfig,
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
};
