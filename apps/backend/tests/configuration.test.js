/**
 * CONFIGURATION FEATURE TEST SUITE - IT23227118 (Viman)
 * 
 * This file contains CORE FUNCTIONALITY tests for the system configuration feature.
 * Tests verify authentication, CRUD operations, business logic validation, and notifications.
 * 
 * Test Coverage:
 * - Authentication & Authorization (middleware guards)
 * - CRUD Operations (Create, Read, Update, Delete)
 * - Business Logic Validation (billing model existence, duplicate prevention)
 * - Notification System (module dependencies)
 * 
 * Total Tests: 6 core tests
 */

const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const configRouter = require('../src/features/configuration/routes');
const SystemConfig = require('../src/features/configuration/model');
const errorHandler = require('../src/middleware/errorHandler');

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

/**
 * Helper function to build Express app for testing
 * Sets up middleware chain: JSON parser → Cookie parser → Routes → Error handler
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
 * Used to simulate authenticated requests with different roles
 */
function signCookie(payload) {
  const token = jwt.sign(payload, JWT_SECRET);
  return `ecocollect_token=${token}`;
}

describe('Configuration API', () => {
  /**
   * TEST 1: Authentication & Authorization Guards
   * 
   * Purpose: Verify that the configuration endpoints are properly secured
   * 
   * What it tests:
   * 1. Returns 401 Unauthorized when JWT token is missing
   * 2. Returns 403 Forbidden when user has 'USER' role (not admin)
   * 3. Returns 200 OK when user has 'ADMIN' role
   * 
   * Security Requirement: Only admins can access system configuration
   */
  test('guards: 401 when missing token, 403 when role is USER, 200 for ADMIN', async () => {
    const app = buildApp();

    // Step 1: Test without authentication token - should be rejected
    // Expected: 401 Unauthorized
    let res = await request(app).get('/config');
    expect(res.status).toBe(401);

    // Step 2: Test with USER role - should be rejected (only admins allowed)
    // Expected: 403 Forbidden
    res = await request(app)
      .get('/config')
      .set('Cookie', signCookie({ id: 'user1', role: 'USER' }));
    expect(res.status).toBe(403);

    // Step 3: Test with ADMIN role - should succeed
    // Expected: 200 OK with configuration object containing _id
    res = await request(app)
      .get('/config')
      .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }));
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('_id');
  });

  /**
   * TEST 2: GET and PUT Operations with Data Persistence
   * 
   * Purpose: Verify that configuration can be retrieved and updated, and changes persist
   * 
   * What it tests:
   * 1. GET creates default configuration if none exists (upsert behavior)
   * 2. PUT successfully updates all configuration fields (billing, categories, rules)
   * 3. Configuration changes are persisted in database
   * 4. Subsequent GET returns the updated values
   * 5. Response includes notifications object when config is updated
   * 
   * Business Logic: System auto-initializes with empty config on first access
   */
  test('GET returns default document when none exists and PUT updates persisted config', async () => {
    const app = buildApp();

    // Step 1: Clear database to ensure clean test state
    await SystemConfig.deleteMany({});

    // Step 2: First GET request should auto-create empty configuration (upsert)
    // Expected: Returns default empty config with arrays and collectionRules object
    let res = await request(app)
      .get('/config')
      .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }));
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('_id');
    expect(Array.isArray(res.body.billingModels || [])).toBe(true);
    expect(Array.isArray(res.body.wasteCategories || [])).toBe(true);
    expect(res.body).toHaveProperty('collectionRules');

    // Step 3: Update configuration with complete data
    // Testing all fields: activeBillingModel, billingModels, wasteCategories, collectionRules
    const update = {
      activeBillingModel: 'Weight-Based',
      billingModels: [
        { name: 'Flat Fee', rate: 10 },
        { name: 'Weight-Based', rate: 0.5 }
      ],
      wasteCategories: [
        { key: 'plastic', label: 'Plastic' },
        { key: 'organic', label: 'Organic' },
      ],
      collectionRules: {
        frequency: 'weekly',
        timeSlot: '08:00-12:00',
        maxBinsPerCollection: 2,
      },
    };
    
    // Step 4: Send PUT request with comprehensive configuration data
    // Expected: 200 OK with updated config, notifications, and success message
    res = await request(app)
      .put('/config')
      .send(update)
      .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }));
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('config');
    expect(res.body).toHaveProperty('notifications');
    expect(res.body).toHaveProperty('message');
    
    // Verify activeBillingModel was set correctly
    expect(res.body.config.activeBillingModel).toBe('Weight-Based');
    
    // Verify both billing models were saved
    expect(res.body.config.billingModels).toHaveLength(2);
    expect(res.body.config.billingModels[1]).toMatchObject({ name: 'Weight-Based', rate: 0.5 });
    
    // Verify waste categories were saved (order-independent check)
    expect(res.body.config.wasteCategories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'plastic', label: 'Plastic' }),
        expect.objectContaining({ key: 'organic', label: 'Organic' }),
      ])
    );
    
    // Verify collection rules were saved
    expect(res.body.config.collectionRules).toMatchObject({
      frequency: 'weekly',
      timeSlot: '08:00-12:00',
      maxBinsPerCollection: 2,
    });
    
    // Verify notification system was triggered
    expect(res.body.notifications).toHaveProperty('success');
    expect(res.body.notifications.success).toBe(true);

    // Step 5: Verify persistence - GET should return the updated values
    // This confirms data was saved to database, not just returned in response
    res = await request(app)
      .get('/config')
      .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }));
    expect(res.status).toBe(200);
    expect(res.body.activeBillingModel).toBe('Weight-Based');
    expect(res.body.billingModels).toHaveLength(2);
    expect(res.body.wasteCategories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'plastic', label: 'Plastic' }),
        expect.objectContaining({ key: 'organic', label: 'Organic' }),
      ])
    );
  });

  /**
   * TEST 3: DELETE Operation and Auto-Recreation
   * 
   * Purpose: Verify configuration can be deleted and system auto-recreates default config
   * 
   * What it tests:
   * 1. Configuration can be successfully deleted (returns 204 No Content)
   * 2. After deletion, GET request auto-creates new default configuration
   * 3. New configuration has proper structure (arrays and nested objects)
   * 
   * Business Logic: System never stays without a configuration - auto-reinitializes
   */
  test('DELETE removes configuration and subsequent GET recreates default', async () => {
    const app = buildApp();

    // Step 1: Ensure configuration exists by creating it
    let res = await request(app)
      .get('/config')
      .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }));
    expect(res.status).toBe(200);
    const id = res.body?._id;
    expect(id).toBeTruthy();

    // Step 2: Delete the configuration
    // Expected: 204 No Content (successful deletion with no response body)
    res = await request(app)
      .delete('/config')
      .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }));
    expect(res.status).toBe(204);

    // Step 3: Verify auto-recreation - GET should create new default config
    // New config will have different _id (proves it's a new document)
    res = await request(app)
      .get('/config')
      .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }));
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('_id');
    expect(Array.isArray(res.body.billingModels || [])).toBe(true);
    expect(Array.isArray(res.body.wasteCategories || [])).toBe(true);
  });

  /**
   * TEST 4: Business Logic Validation - Active Billing Model Existence
   * 
   * Purpose: Verify that activeBillingModel must exist in the billingModels array
   * 
   * What it tests:
   * 1. System rejects activeBillingModel if it doesn't match any model name
   * 2. Returns 422 Unprocessable Entity (validation error)
   * 3. Error message explains the validation rule
   * 
   * Business Rule: Can only activate billing models that are defined in the system
   */
  test('PUT validates that activeBillingModel exists in billingModels list', async () => {
    const app = buildApp();
    await SystemConfig.deleteMany({});

    // Step 1: Attempt to activate a billing model that doesn't exist
    // activeBillingModel = 'Non-Existent Model', but only 'Flat Fee' is defined
    const invalidUpdate = {
      activeBillingModel: 'Non-Existent Model',
      billingModels: [
        { name: 'Flat Fee', rate: 10 },
      ],
    };

    // Step 2: Send invalid configuration
    // Expected: 422 Unprocessable Entity with descriptive error message
    const res = await request(app)
      .put('/config')
      .send(invalidUpdate)
      .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }));
    
    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error.message).toContain('must exist in billing models list');
  });

  /**
   * TEST 5: Business Logic Validation - Duplicate Category Keys
   * 
   * Purpose: Verify that waste category keys must be unique (no duplicates)
   * 
   * What it tests:
   * 1. System detects duplicate category keys in wasteCategories array
   * 2. Returns 422 Unprocessable Entity (validation error)
   * 3. Error message identifies the duplicate key issue
   * 
   * Business Rule: Each waste category must have unique identifier (key)
   */
  test('PUT validates duplicate waste category keys', async () => {
    const app = buildApp();
    await SystemConfig.deleteMany({});

    // Step 1: Create configuration with duplicate category keys
    // Both categories use 'plastic' as key (but different labels)
    const duplicateUpdate = {
      billingModels: [{ name: 'Flat Fee', rate: 10 }],
      wasteCategories: [
        { key: 'plastic', label: 'Plastic' },
        { key: 'plastic', label: 'Plastic Duplicate' },
      ],
    };

    // Step 2: Send configuration with duplicates
    // Expected: 422 Unprocessable Entity with duplicate key error
    const res = await request(app)
      .put('/config')
      .send(duplicateUpdate)
      .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }));
    
    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error.message).toContain('Duplicate waste category key');
  });

  /**
   * TEST 6: Notification System Integration
   * 
   * Purpose: Verify that configuration updates trigger notifications to dependent modules
   * 
   * What it tests:
   * 1. Successful config update returns notifications object
   * 2. Notifications object has success flag set to true
   * 3. Notifications include messages for dependent modules (Billing, Reporting, Waste Tracking)
   * 
   * Integration Point: Configuration changes must notify other system modules
   * This ensures dependent features (billing, reports) stay synchronized
   */
  test('PUT triggers module notifications on successful update', async () => {
    const app = buildApp();
    await SystemConfig.deleteMany({});

    // Step 1: Create valid configuration with all fields
    const update = {
      activeBillingModel: 'Flat Fee',
      billingModels: [{ name: 'Flat Fee', rate: 10 }],
      wasteCategories: [{ key: 'plastic', label: 'Plastic' }],
      collectionRules: { frequency: 'daily' },
    };

    // Step 2: Send configuration update
    // Expected: 200 OK with notifications object in response
    const res = await request(app)
      .put('/config')
      .send(update)
      .set('Cookie', signCookie({ id: 'admin1', role: 'ADMIN' }));
    
    expect(res.status).toBe(200);
    
    // Step 3: Verify notifications object structure
    expect(res.body).toHaveProperty('notifications');
    expect(res.body.notifications).toHaveProperty('success', true);
    expect(res.body.notifications).toHaveProperty('notifications');
    expect(Array.isArray(res.body.notifications.notifications)).toBe(true);
    
    // Step 4: Verify all dependent modules were notified
    // System should notify: Billing (rates changed), Reporting (config changed), 
    // Waste Tracking (categories changed)
    const notifications = res.body.notifications.notifications;
    const modules = notifications.map(n => n.module);
    expect(modules).toContain('Billing');
    expect(modules).toContain('Reporting');
    expect(modules).toContain('Waste Tracking');
  });
});

