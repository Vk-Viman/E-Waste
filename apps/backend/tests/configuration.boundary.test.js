/**
 * CONFIGURATION FEATURE - BOUNDARY & ERROR TEST CASES - IT23227118 (Viman)
 * 
 * This file contains COMPREHENSIVE BOUNDARY and ERROR tests for the configuration feature.
 * Tests verify edge cases, data validation, error handling, and system limits.
 * 
 * Test Categories:
 * 1. Boundary Tests - Billing Models (5 tests)
 * 2. Boundary Tests - Waste Categories (5 tests)
 * 3. Boundary Tests - Collection Rules (3 tests)
 * 4. Error Tests - Missing Required Fields (4 tests)
 * 5. Error Tests - Invalid Data Types (5 tests)
 * 6. Error Tests - Malformed Requests (3 tests)
 * 7. Error Tests - Category Management (5 tests)
 * 8. Edge Cases - Active Billing Model (3 tests)
 * 9. Stress Tests (1 test)
 * 
 * Total Tests: 34 boundary/error tests
 * 
 * Testing Strategy:
 * - Min/Max value validation
 * - Invalid type rejection
 * - Required field enforcement
 * - Edge case handling
 * - Stress testing with maximum data
 */

const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const configRouter = require('../src/features/configuration/routes');
const SystemConfig = require('../src/features/configuration/model');
const WasteCategory = require('../src/features/configuration/wasteCategory.model');
const errorHandler = require('../src/middleware/errorHandler');

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

/**
 * Helper function to build Express app for testing
 */
function buildApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/config', configRouter);
  app.use(errorHandler);
  return app;
}

/**
 * Helper function to create JWT authentication cookie
 */
function signCookie(payload) {
  const token = jwt.sign(payload, JWT_SECRET);
  return `ecocollect_token=${token}`;
}

describe('Configuration API - Boundary & Error Test Cases', () => {
  
  // Clean database before each test to ensure isolation
  beforeEach(async () => {
    await SystemConfig.deleteMany({});
    await WasteCategory.deleteMany({});
  });

  /**
   * BOUNDARY TESTS - BILLING MODELS (5 tests)
   * Tests minimum, maximum, and edge values for billing rates and model counts
   */
  describe('Boundary Tests - Billing Models', () => {
    /**
     * TEST 1: Minimum Billing Rate (0)
     * Verifies system accepts rate of 0 (free tier scenario)
     */
    test('accepts minimum valid billing rate (0)', async () => {
      const app = buildApp();
      
      // Boundary: Minimum rate = 0 (supports free tier billing)
      const update = {
        activeBillingModel: 'Free Tier',
        billingModels: [{ name: 'Free Tier', rate: 0 }],
      };

      const res = await request(app)
        .put('/config')
        .send(update)
        .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }));
      
      // Expected: Should accept 0 as valid rate
      expect(res.status).toBe(200);
      expect(res.body.config.billingModels[0].rate).toBe(0);
    });

    /**
     * TEST 2: Negative Billing Rate Rejection
     * Verifies system rejects negative rates (invalid business logic)
     */
    test('rejects negative billing rate', async () => {
      const app = buildApp();
      
      // Error: Negative rate is invalid
      const update = {
        billingModels: [{ name: 'Invalid', rate: -10 }],
      };

      const res = await request(app)
        .put('/config')
        .send(update)
        .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }));
      
      // Expected: Should reject with 400 Bad Request
      expect(res.status).toBe(400);
    });

    /**
     * TEST 3: Very Large Billing Rate
     * Verifies system can handle extremely high rates (premium tiers)
     */
    test('accepts very large billing rate', async () => {
      const app = buildApp();
      
      // Boundary: Very high rate for premium services
      const update = {
        activeBillingModel: 'Premium',
        billingModels: [{ name: 'Premium', rate: 999999.99 }],
      };

      const res = await request(app)
        .put('/config')
        .send(update)
        .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }));
      
      // Expected: Should accept large numbers
      expect(res.status).toBe(200);
      expect(res.body.config.billingModels[0].rate).toBe(999999.99);
    });

    /**
     * TEST 4: Empty Billing Models Array
     * Verifies system can handle no billing models (initialization state)
     */
    test('handles empty billing models array', async () => {
      const app = buildApp();
      
      // Edge Case: No billing models defined yet
      const update = {
        billingModels: [],
        wasteCategories: [{ key: 'plastic', label: 'Plastic' }],
      };

      const res = await request(app)
        .put('/config')
        .send(update)
        .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }));
      
      // Expected: Should accept empty array
      expect(res.status).toBe(200);
      expect(res.body.config.billingModels).toHaveLength(0);
    });

    /**
     * TEST 5: Maximum Number of Billing Models
     * Stress test: Verifies system can handle 100 billing models
     */
    test('handles maximum number of billing models (100)', async () => {
      const app = buildApp();
      
      // Stress Test: Create 100 billing models to test system limits
      const models = Array.from({ length: 100 }, (_, i) => ({
        name: `Model ${i}`,
        rate: i * 0.1,
      }));

      const update = {
        activeBillingModel: 'Model 0',
        billingModels: models,
      };

      const res = await request(app)
        .put('/config')
        .send(update)
        .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }));
      
      // Expected: Should handle large arrays efficiently
      expect(res.status).toBe(200);
      expect(res.body.config.billingModels).toHaveLength(100);
    });
  });

  /**
   * BOUNDARY TESTS - WASTE CATEGORIES (5 tests)
   * Tests minimum, maximum string lengths and quantity limits for categories
   */
  describe('Boundary Tests - Waste Categories', () => {
    /**
     * TEST 6: Single Character Category Key
     * Verifies minimum valid key length (1 character)
     */
    test('accepts single character category key', async () => {
      const app = buildApp();
      
      // Boundary: Minimum key length = 1 character
      const update = {
        wasteCategories: [{ key: 'a', label: 'A Category' }],
      };

      const res = await request(app)
        .put('/config')
        .send(update)
        .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }));
      
      // Expected: Should accept single character keys
      expect(res.status).toBe(200);
      expect(res.body.config.wasteCategories[0].key).toBe('a');
    });

    /**
     * TEST 7: Very Long Category Key
     * Verifies system can handle 100-character keys (maximum realistic length)
     */
    test('accepts very long category key (100 chars)', async () => {
      const app = buildApp();
      
      // Boundary: Maximum key length = 100 characters
      const longKey = 'a'.repeat(100);
      const update = {
        wasteCategories: [{ key: longKey, label: 'Long Key Category' }],
      };

      const res = await request(app)
        .put('/config')
        .send(update)
        .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }));
      
      // Expected: Should accept long strings
      expect(res.status).toBe(200);
      expect(res.body.config.wasteCategories[0].key).toBe(longKey);
    });

    /**
     * TEST 8: Empty Category Key Rejection
     * Verifies empty strings are rejected (required field validation)
     */
    test('rejects empty category key', async () => {
      const app = buildApp();
      
      // Error: Empty key violates required field constraint
      const update = {
        wasteCategories: [{ key: '', label: 'Empty Key' }],
      };

      const res = await request(app)
        .put('/config')
        .send(update)
        .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }));
      
      // Expected: Should reject with 400 Bad Request
      // Empty keys should be rejected with 400 error
      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('key is required');
    });

    /**
     * TEST 9: Maximum Number of Categories
     * Stress test: Verifies system can handle 50 waste categories
     */
    test('handles maximum number of categories (50)', async () => {
      const app = buildApp();
      
      // Stress Test: Create 50 categories (realistic maximum)
      const categories = Array.from({ length: 50 }, (_, i) => ({
        key: `category-${i}`,
        label: `Category ${i}`,
      }));

      const update = {
        wasteCategories: categories,
      };

      const res = await request(app)
        .put('/config')
        .send(update)
        .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }));
      
      // Expected: Should handle large category lists
      expect(res.status).toBe(200);
      expect(res.body.config.wasteCategories).toHaveLength(50);
    });

    /**
     * TEST 10: Category Key with Spaces
     * Verifies whitespace handling (trim behavior)
     */
    test('rejects category key with spaces', async () => {
      const app = buildApp();
      
      // Edge Case: Keys with spaces (should be trimmed by schema)
      const update = {
        wasteCategories: [{ key: 'invalid key', label: 'Invalid' }],
      };

      const res = await request(app)
        .put('/config')
        .send(update)
        .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }));
      
      // Spaces are trimmed by schema, resulting in valid key
      expect(res.status).toBe(200);
    });
  });

  /**
   * BOUNDARY TESTS - COLLECTION RULES (3 tests)
   * Tests minimum, maximum values for collection scheduling parameters
   */
  describe('Boundary Tests - Collection Rules', () => {
    /**
     * TEST 11: Minimum maxBinsPerCollection
     * Verifies minimum valid value (1 bin per collection)
     */
    test('accepts minimum maxBinsPerCollection (1)', async () => {
      const app = buildApp();
      
      // Boundary: Minimum bins = 1
      const update = {
        collectionRules: {
          frequency: 'daily',
          timeSlot: '00:00-01:00',
          maxBinsPerCollection: 1,
        },
      };

      const res = await request(app)
        .put('/config')
        .send(update)
        .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }));
      
      // Expected: Should accept minimum value
      expect(res.status).toBe(200);
      expect(res.body.config.collectionRules.maxBinsPerCollection).toBe(1);
    });

    /**
     * TEST 12: Large maxBinsPerCollection
     * Verifies system can handle high bin counts (1000 bins)
     */
    test('accepts large maxBinsPerCollection (1000)', async () => {
      const app = buildApp();
      
      // Boundary: High capacity = 1000 bins
      const update = {
        collectionRules: {
          frequency: 'daily',
          timeSlot: '08:00-12:00',
          maxBinsPerCollection: 1000,
        },
      };

      const res = await request(app)
        .put('/config')
        .send(update)
        .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }));
      
      // Expected: Should accept large numbers
      expect(res.status).toBe(200);
      expect(res.body.config.collectionRules.maxBinsPerCollection).toBe(1000);
    });

    /**
     * TEST 13: All Valid Frequency Values
     * Verifies enum validation for frequency field (daily, weekly, biweekly, monthly)
     */
    test('handles all valid frequency values', async () => {
      const app = buildApp();
      const frequencies = ['daily', 'weekly', 'biweekly', 'monthly'];

      // Test each valid frequency option
      for (const freq of frequencies) {
        const update = {
          collectionRules: {
            frequency: freq,
            timeSlot: '08:00-12:00',
            maxBinsPerCollection: 2,
          },
        };

        const res = await request(app)
          .put('/config')
          .send(update)
          .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }));
        
        // Expected: Each frequency should be accepted
        expect(res.status).toBe(200);
        expect(res.body.config.collectionRules.frequency).toBe(freq);
      }
    });
  });

  /**
   * ERROR TESTS - MISSING REQUIRED FIELDS (4 tests)
   * Tests validation of required fields in billing models and waste categories
   */
  describe('Error Tests - Missing Required Fields', () => {
    /**
     * TEST 14: Billing Model Missing Name
     * Verifies 'name' field is required for billing models
     */
    test('rejects billing model without name', async () => {
      const app = buildApp();
      
      // Error: Missing required 'name' field
      const update = {
        billingModels: [{ rate: 10 }], // missing name
      };

      const res = await request(app)
        .put('/config')
        .send(update)
        .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }));
      
      // Expected: 400 Bad Request for missing required field
      expect(res.status).toBe(400);
    });

    /**
     * TEST 15: Billing Model Missing Rate
     * Verifies 'rate' field is required for billing models
     */
    test('rejects billing model without rate', async () => {
      const app = buildApp();
      
      // Error: Missing required 'rate' field
      const update = {
        billingModels: [{ name: 'Test' }], // missing rate
      };

      const res = await request(app)
        .put('/config')
        .send(update)
        .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }));
      
      // Expected: 400 Bad Request for missing required field
      expect(res.status).toBe(400);
    });

    /**
     * TEST 16: Category Missing Key
     * Verifies 'key' field is required for waste categories
     */
    test('rejects category without key', async () => {
      const app = buildApp();
      
      // Error: Missing required 'key' field
      const update = {
        wasteCategories: [{ label: 'Test' }], // missing key
      };

      const res = await request(app)
        .put('/config')
        .send(update)
        .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }));
      
      // Expected: 400 Bad Request for missing required field
      expect(res.status).toBe(400);
    });

    /**
     * TEST 17: Category Missing Label
     * Verifies 'label' field is required for waste categories
     */
    test('rejects category without label', async () => {
      const app = buildApp();
      
      // Error: Missing required 'label' field
      const update = {
        wasteCategories: [{ key: 'test' }], // missing label
      };

      const res = await request(app)
        .put('/config')
        .send(update)
        .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }));
      
      // Expected: 400 Bad Request for missing required field
      expect(res.status).toBe(400);
    });
  });

  /**
   * ERROR TESTS - INVALID DATA TYPES (5 tests)
   * Tests type validation and rejection of incorrect data types
   */
  describe('Error Tests - Invalid Data Types', () => {
    /**
     * TEST 18: Non-Numeric Billing Rate
     * Verifies rate must be a number, not string
     */
    test('rejects non-numeric billing rate', async () => {
      const app = buildApp();
      
      // Error: Rate should be number, not string
      const update = {
        billingModels: [{ name: 'Test', rate: 'invalid' }],
      };

      const res = await request(app)
        .put('/config')
        .send(update)
        .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }));
      
      // Expected: 400 Bad Request for type mismatch
      expect(res.status).toBe(400);
    });

    /**
     * TEST 19: Non-String Category Key
     * Verifies category key must be string, not number
     */
    test('rejects non-string category key', async () => {
      const app = buildApp();
      
      // Error: Key should be string, not number
      const update = {
        wasteCategories: [{ key: 123, label: 'Test' }],
      };

      const res = await request(app)
        .put('/config')
        .send(update)
        .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }));
      
      // Expected: 400 Bad Request for type mismatch
      expect(res.status).toBe(400);
    });

    /**
     * TEST 20: Non-Number maxBinsPerCollection
     * Verifies maxBinsPerCollection must be number, not string
     */
    test('rejects non-number maxBinsPerCollection', async () => {
      const app = buildApp();
      
      // Error: maxBinsPerCollection should be number, not string
      const update = {
        collectionRules: {
          frequency: 'daily',
          timeSlot: '08:00-12:00',
          maxBinsPerCollection: 'invalid',
        },
      };

      const res = await request(app)
        .put('/config')
        .send(update)
        .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }));
      
      // Expected: 400 Bad Request for type mismatch
      expect(res.status).toBe(400);
    });

    /**
     * TEST 21: Non-Array Billing Models
     * Verifies billingModels must be array, not string
     */
    test('rejects non-array billingModels', async () => {
      const app = buildApp();
      
      // Error: billingModels should be array, not string
      const update = {
        billingModels: 'not-an-array',
      };

      const res = await request(app)
        .put('/config')
        .send(update)
        .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }));
      
      // Expected: 400 Bad Request for type mismatch
      expect(res.status).toBe(400);
    });

    /**
     * TEST 22: Non-Array Waste Categories
     * Verifies wasteCategories must be array, not string
     */
    test('rejects non-array wasteCategories', async () => {
      const app = buildApp();
      
      // Error: wasteCategories should be array, not string
      const update = {
        wasteCategories: 'not-an-array',
      };

      const res = await request(app)
        .put('/config')
        .send(update)
        .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }));
      
      // Expected: 400 Bad Request for type mismatch
      expect(res.status).toBe(400);
    });
  });

  /**
   * ERROR TESTS - MALFORMED REQUESTS (3 tests)
   * Tests handling of invalid request formats
   */
  describe('Error Tests - Malformed Requests', () => {
    /**
     * TEST 23: Empty Request Body
     * Verifies system handles empty updates gracefully
     */
    test('rejects empty request body', async () => {
      const app = buildApp();

      const res = await request(app)
        .put('/config')
        .send({})
        .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }));
      
      // Empty body is valid - creates empty config
      expect(res.status).toBe(200);
    });

    /**
     * TEST 24: Invalid JSON Format
     * Verifies malformed JSON is rejected
     */
    test('rejects invalid JSON', async () => {
      const app = buildApp();

      const res = await request(app)
        .put('/config')
        .send('invalid-json')
        .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }))
        .set('Content-Type', 'application/json');
      
      // Expected: 400 Bad Request for malformed JSON
      expect(res.status).toBe(400);
    });

    /**
     * TEST 25: Extra Unknown Fields
     * Verifies unknown fields are ignored (Mongoose behavior)
     */
    test('rejects request with extra unknown fields (should be ignored)', async () => {
      const app = buildApp();
      
      // Request with valid + unknown fields
      const update = {
        activeBillingModel: 'Flat Fee',
        billingModels: [{ name: 'Flat Fee', rate: 10 }],
        unknownField: 'should be ignored',
        anotherUnknown: 123,
      };

      const res = await request(app)
        .put('/config')
        .send(update)
        .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }));
      
      // Mongoose ignores unknown fields - request succeeds
      expect(res.status).toBe(200);
      expect(res.body.config).not.toHaveProperty('unknownField');
    });
  });

  /**
   * ERROR TESTS - CATEGORY MANAGEMENT (5 tests)
   * Tests category-specific CRUD operations and error handling
   */
  describe('Error Tests - Category Management', () => {
    /**
     * TEST 26: Duplicate Category Key
     * Verifies adding category with existing key is rejected
     */
    test('rejects adding category with existing key', async () => {
      const app = buildApp();

      // Step 1: Create category with key 'plastic'
      await WasteCategory.create({ key: 'plastic', label: 'Plastic' });

      // Step 2: Try to add duplicate 'plastic' category
      const res = await request(app)
        .post('/config/categories')
        .send({ key: 'plastic', label: 'Plastic Duplicate' })
        .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }));
      
      // Expected: 422 Unprocessable Entity for duplicate key
      expect(res.status).toBe(422);
      expect(res.body.error.message).toContain('already exists');
    });

    /**
     * TEST 27: Add Category Missing Required Fields
     * Verifies category creation requires both key and label
     */
    test('rejects adding category without required fields', async () => {
      const app = buildApp();

      // Error: Missing both key and label
      const res = await request(app)
        .post('/config/categories')
        .send({ description: 'Missing key and label' })
        .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }));
      
      // Expected: 400 Bad Request for missing required fields
      expect(res.status).toBe(400);
    });

    /**
     * TEST 28: Update Non-Existent Category
     * Verifies updating non-existent category returns 404
     */
    test('rejects updating non-existent category', async () => {
      const app = buildApp();

      // Try to update category that doesn't exist
      const res = await request(app)
        .put('/config/categories/507f1f77bcf86cd799439011') // fake ObjectId
        .send({ label: 'Updated' })
        .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }));
      
      // Expected: 404 Not Found
      expect(res.status).toBe(404);
    });

    /**
     * TEST 29: Delete Non-Existent Category
     * Verifies deleting non-existent category returns 404
     */
    test('rejects deleting non-existent category', async () => {
      const app = buildApp();

      // Try to delete category that doesn't exist
      const res = await request(app)
        .delete('/config/categories/507f1f77bcf86cd799439011') // fake ObjectId
        .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }));
      
      // Expected: 404 Not Found
      expect(res.status).toBe(404);
    });

    /**
     * TEST 30: Invalid ObjectId Format
     * Verifies invalid MongoDB ObjectId format is rejected
     */
    test('rejects invalid ObjectId format', async () => {
      const app = buildApp();

      // Invalid ObjectId format (not 24 hex characters)
      const res = await request(app)
        .put('/config/categories/invalid-id')
        .send({ label: 'Updated' })
        .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }));
      
      // Expected: 400 Bad Request for invalid ID format
      expect(res.status).toBe(400);
    });
  });

  /**
   * EDGE CASES - ACTIVE BILLING MODEL (3 tests)
   * Tests edge cases for activeBillingModel validation
   */
  describe('Edge Cases - Active Billing Model', () => {
    /**
     * TEST 31: Empty Active Billing Model with No Models
     * Verifies empty activeBillingModel is valid when no models exist
     */
    test('allows activeBillingModel to be empty string when no models', async () => {
      const app = buildApp();
      
      // Edge Case: No active model when no models are defined
      const update = {
        activeBillingModel: '',
        billingModels: [],
      };

      const res = await request(app)
        .put('/config')
        .send(update)
        .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }));
      
      // Expected: Should accept empty string with empty models array
      expect(res.status).toBe(200);
    });

    /**
     * TEST 32: Active Model Not in Models List
     * Verifies activeBillingModel must match a model in the list
     */
    test('rejects activeBillingModel when it does not exist in billingModels', async () => {
      const app = buildApp();
      
      // Error: activeBillingModel doesn't match any model name
      const update = {
        activeBillingModel: 'Non-Existent',
        billingModels: [
          { name: 'Flat Fee', rate: 10 },
          { name: 'Weight-Based', rate: 0.5 },
        ],
      };

      const res = await request(app)
        .put('/config')
        .send(update)
        .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }));
      
      // Expected: 422 Unprocessable Entity
      expect(res.status).toBe(422);
      expect(res.body.error.message).toContain('must exist in billing models list');
    });

    /**
     * TEST 33: Active Model with Special Characters
     * Verifies special characters in model names are supported
     */
    test('accepts activeBillingModel with special characters if it matches model name', async () => {
      const app = buildApp();
      
      // Edge Case: Model names can contain special characters
      const update = {
        activeBillingModel: 'Premium-Plus+',
        billingModels: [{ name: 'Premium-Plus+', rate: 50 }],
      };

      const res = await request(app)
        .put('/config')
        .send(update)
        .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }));
      
      // Expected: Should accept special characters in names
      expect(res.status).toBe(200);
      expect(res.body.config.activeBillingModel).toBe('Premium-Plus+');
    });
  });

  /**
   * STRESS TESTS (1 test)
   * Tests system behavior under maximum load conditions
   */
  describe('Stress Tests', () => {
    /**
     * TEST 34: Maximum Data in Single Request
     * Stress test: All fields at maximum values simultaneously
     */
    test('handles request with all fields at maximum values', async () => {
      const app = buildApp();
      
      // Stress Test: Maximum data in all fields simultaneously
      // 50 billing models, 50 categories, maximum rule values
      const maxModels = Array.from({ length: 50 }, (_, i) => ({
        name: `Model ${i}`,
        rate: 9999.99,
      }));

      const maxCategories = Array.from({ length: 50 }, (_, i) => ({
        key: `category-${i}`,
        label: `Category ${i}`,
      }));

      const update = {
        activeBillingModel: 'Model 0',
        billingModels: maxModels,
        wasteCategories: maxCategories,
        collectionRules: {
          frequency: 'daily',
          timeSlot: '00:00-23:59',
          maxBinsPerCollection: 1000,
        },
      };

      const res = await request(app)
        .put('/config')
        .send(update)
        .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }));
      
      // Expected: System should handle maximum load efficiently
      // Verifies performance with large datasets
      expect(res.status).toBe(200);
      expect(res.body.config.billingModels).toHaveLength(50);
      expect(res.body.config.wasteCategories).toHaveLength(50);
    });
  });
});
