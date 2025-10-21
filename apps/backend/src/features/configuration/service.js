/**
 * SOLID PRINCIPLES APPLIED:
 * 
 * S - Single Responsibility Principle:
 *     Each strategy class has ONE responsibility - calculating billing for its specific method
 * 
 * O - Open/Closed Principle:
 *     Open for extension (can add new strategies like TieredPricingStrategy)
 *     Closed for modification (existing strategies don't need to change)
 * 
 * L - Liskov Substitution Principle:
 *     Both FlatFeeStrategy and WeightBasedStrategy can substitute each other
 *     They both implement the same calculate() interface
 * 
 * D - Dependency Inversion Principle:
 *     High-level code depends on calculate() abstraction, not concrete classes
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * DESIGN PATTERN: STRATEGY PATTERN (Behavioral Pattern)
 * ═══════════════════════════════════════════════════════════════
 * 
 * Purpose: Define a family of billing algorithms, encapsulate each one,
 *          and make them interchangeable at runtime.
 * 
 * Components:
 * - Strategy Interface: calculate({ weightKg?: number }): number
 * - Concrete Strategy 1: FlatFeeStrategy
 * - Concrete Strategy 2: WeightBasedStrategy
 * - Context: selectBillingStrategy() - chooses strategy at runtime
 * 
 * Benefits:
 * ✓ Easy to add new billing strategies without modifying existing code
 * ✓ Strategies are interchangeable (Liskov Substitution)
 * ✓ Encapsulates algorithm variations
 * ✓ Runtime algorithm selection based on configuration
 * ═══════════════════════════════════════════════════════════════
 */

// Billing Strategy Pattern for computing charges
// Interface: strategy.calculate({ weightKg?: number }): number

// DESIGN PATTERN: STRATEGY PATTERN - Concrete Strategy #1
// SOLID: S (Single Responsibility) - Only calculates flat fee billing
class FlatFeeStrategy {
  constructor(rate = 0) {
    this.rate = typeof rate === 'number' ? rate : 0;
  }
  calculate(_ctx = {}) {
    return this.rate;
  }
}

// DESIGN PATTERN: STRATEGY PATTERN - Concrete Strategy #2
// SOLID: S (Single Responsibility) - Only calculates weight-based billing
class WeightBasedStrategy {
  constructor(ratePerKg = 0) {
    this.ratePerKg = typeof ratePerKg === 'number' ? ratePerKg : 0;
  }
  calculate(ctx = {}) {
    const weight = typeof ctx.weightKg === 'number' ? ctx.weightKg : 0;
    return this.ratePerKg * weight;
  }
}

/**
 * ═══════════════════════════════════════════════════════════════
 * DESIGN PATTERN: FACTORY PATTERN (Creational Pattern)
 * ═══════════════════════════════════════════════════════════════
 * 
 * Purpose: Create strategy objects without specifying their exact class.
 *          Encapsulates object creation logic.
 * 
 * Factory Method: selectBillingStrategy(systemConfig)
 * Products: FlatFeeStrategy, WeightBasedStrategy
 * 
 * Benefits:
 * ✓ Client doesn't need to know concrete strategy class names
 * ✓ Easy to add new strategies (just add another if condition)
 * ✓ Centralizes strategy creation logic
 * ✓ Runtime decision based on configuration
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * SOLID: O (Open/Closed) - Open for extension, closed for modification
 * Can add new strategies here without modifying existing strategy classes
 * 
 * SOLID: D (Dependency Inversion) - Returns abstraction (strategy interface)
 * Client code depends on calculate() method, not concrete implementations
 */
// DESIGN PATTERN: FACTORY METHOD - Creates appropriate strategy at runtime
// Select strategy from configuration document
// We treat the first billingModels[0] as the active model
function selectBillingStrategy(systemConfig) {
  const model = Array.isArray(systemConfig?.billingModels) ? systemConfig.billingModels[0] : null;
  const name = String(model?.name || '').toLowerCase();
  const rate = typeof model?.rate === 'number' ? model.rate : 0;
  if (name === 'weight' || name === 'weight-based' || name === 'weightbased') {
    return new WeightBasedStrategy(rate);
  }
  // default to flat
  return new FlatFeeStrategy(rate);
}

/**
 * ═══════════════════════════════════════════════════════════════
 * DESIGN PATTERN: OBSERVER PATTERN (Behavioral Pattern)
 * ═══════════════════════════════════════════════════════════════
 * 
 * Purpose: Notify dependent modules when system configuration changes.
 *          Establishes one-to-many dependency between objects.
 * 
 * Subject: SystemConfig (configuration data)
 * Observers: Billing Module, Reporting Module, Waste Tracking Module
 * 
 * When configuration changes, all dependent modules are automatically
 * notified so they can update their state accordingly.
 * 
 * Benefits:
 * ✓ Loose coupling between configuration and dependent modules
 * ✓ Easy to add new observer modules without changing notification logic
 * ✓ Automatic synchronization across system
 * ✓ Each module handles its own update logic independently
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * SOLID: S (Single Responsibility) - Only responsible for notifying modules
 * SOLID: O (Open/Closed) - Can add new modules without modifying existing notifications
 * 
 * DESIGN PATTERN: OBSERVER - Notifies all observers when subject (config) changes
 * Notification service for dependent modules
 * Notifies Billing, Reporting, and Waste Tracking when system settings change
 */
async function notifyDependentModules(updatedConfig, changeType = 'settings_updated') {
  const notifications = [];

  try {
    // SOLID: O (Open/Closed) - Each module notification is independent
    // Can add new modules here without affecting existing ones
    
    // OBSERVER PATTERN: Notify Observer #1 - Billing Module
    // Notify Billing Module
    if (updatedConfig.activeBillingModel || updatedConfig.billingModels) {
      notifications.push({
        module: 'Billing',
        status: 'notified',
        message: `Billing model updated to: ${updatedConfig.activeBillingModel || 'default'}`,
        timestamp: new Date(),
      });
      // In production, this would trigger a real event/webhook
      console.log('[BILLING MODULE] Configuration updated:', {
        billingModel: updatedConfig.activeBillingModel,
        rates: updatedConfig.billingModels,
      });
    }

    // OBSERVER PATTERN: Notify Observer #2 - Reporting Module
    // Notify Reporting Module
    if (updatedConfig.wasteCategories) {
      notifications.push({
        module: 'Reporting',
        status: 'notified',
        message: `Waste categories updated: ${updatedConfig.wasteCategories.length} categories active`,
        timestamp: new Date(),
      });
      console.log('[REPORTING MODULE] Configuration updated:', {
        categories: updatedConfig.wasteCategories.map(c => c.key),
      });
    }

    // OBSERVER PATTERN: Notify Observer #3 - Waste Tracking Module
    // Notify Waste Tracking Module
    if (updatedConfig.collectionRules) {
      notifications.push({
        module: 'Waste Tracking',
        status: 'notified',
        message: `Collection rules updated: ${updatedConfig.collectionRules.frequency || 'default'} frequency`,
        timestamp: new Date(),
      });
      console.log('[WASTE TRACKING MODULE] Configuration updated:', {
        rules: updatedConfig.collectionRules,
      });
    }

    return {
      success: true,
      notifications,
      changeType,
    };
  } catch (error) {
    console.error('[NOTIFICATION SERVICE] Error notifying modules:', error);
    return {
      success: false,
      error: error.message,
      notifications,
    };
  }
}

module.exports = { 
  FlatFeeStrategy, 
  WeightBasedStrategy, 
  selectBillingStrategy,
  notifyDependentModules 
};
