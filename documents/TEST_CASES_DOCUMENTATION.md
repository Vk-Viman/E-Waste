# TEST CASES DOCUMENTATION - IT23227118 (Viman)
## Configuration Feature - Complete Test Coverage

---

## 📊 Test Suite Overview

### Total Test Cases: **40 tests**
- **Core Functionality Tests:** 6 tests (configuration.test.js)
- **Boundary & Error Tests:** 34 tests (configuration.boundary.test.js)

### Test Pass Rate: **40/40 (100%)**

---

## 📝 CORE FUNCTIONALITY TESTS (6 Tests)

**File:** `apps/backend/tests/configuration.test.js`

### TEST 1: Authentication & Authorization Guards
**Purpose:** Verify endpoint security with JWT and role-based access control

**What it tests:**
- ❌ Returns 401 Unauthorized when JWT token is missing
- ❌ Returns 403 Forbidden when user has 'USER' role (not admin)
- ✅ Returns 200 OK when user has 'ADMIN' role

**Security Rule:** Only admins can access system configuration

---

### TEST 2: GET and PUT Operations with Data Persistence
**Purpose:** Verify configuration can be retrieved and updated with persistence

**What it tests:**
- ✅ GET creates default configuration if none exists (upsert behavior)
- ✅ PUT successfully updates all configuration fields
- ✅ Configuration changes are persisted in database
- ✅ Subsequent GET returns the updated values
- ✅ Response includes notifications object

**Business Logic:** System auto-initializes with empty config on first access

**Test Data:**
```javascript
{
  activeBillingModel: 'Weight-Based',
  billingModels: [
    { name: 'Flat Fee', rate: 10 },
    { name: 'Weight-Based', rate: 0.5 }
  ],
  wasteCategories: [
    { key: 'plastic', label: 'Plastic' },
    { key: 'organic', label: 'Organic' }
  ],
  collectionRules: {
    frequency: 'weekly',
    timeSlot: '08:00-12:00',
    maxBinsPerCollection: 2
  }
}
```

---

### TEST 3: DELETE Operation and Auto-Recreation
**Purpose:** Verify configuration can be deleted and auto-recreates

**What it tests:**
- ✅ Configuration can be successfully deleted (204 No Content)
- ✅ After deletion, GET auto-creates new default configuration
- ✅ New configuration has proper structure

**Business Logic:** System never stays without a configuration

---

### TEST 4: Business Logic Validation - Active Billing Model Existence
**Purpose:** Verify activeBillingModel must exist in billingModels array

**What it tests:**
- ❌ System rejects activeBillingModel if it doesn't match any model name
- ❌ Returns 422 Unprocessable Entity (validation error)
- ✅ Error message explains the validation rule

**Business Rule:** Can only activate billing models that are defined in the system

**Test Scenario:**
```javascript
// INVALID - activeBillingModel doesn't exist
{
  activeBillingModel: 'Non-Existent Model',
  billingModels: [{ name: 'Flat Fee', rate: 10 }]
}
// Expected: 422 error
```

---

### TEST 5: Business Logic Validation - Duplicate Category Keys
**Purpose:** Verify waste category keys must be unique

**What it tests:**
- ❌ System detects duplicate category keys in wasteCategories array
- ❌ Returns 422 Unprocessable Entity
- ✅ Error message identifies the duplicate key issue

**Business Rule:** Each waste category must have unique identifier

**Test Scenario:**
```javascript
// INVALID - duplicate 'plastic' key
{
  wasteCategories: [
    { key: 'plastic', label: 'Plastic' },
    { key: 'plastic', label: 'Plastic Duplicate' }
  ]
}
// Expected: 422 error
```

---

### TEST 6: Notification System Integration
**Purpose:** Verify configuration updates trigger notifications to dependent modules

**What it tests:**
- ✅ Successful config update returns notifications object
- ✅ Notifications object has success flag = true
- ✅ Notifications include messages for: Billing, Reporting, Waste Tracking

**Integration Point:** Configuration changes notify other system modules to stay synchronized

---

## 🔍 BOUNDARY & ERROR TESTS (34 Tests)

**File:** `apps/backend/tests/configuration.boundary.test.js`

---

## Category 1: Boundary Tests - Billing Models (5 Tests)

### TEST 7: Minimum Billing Rate (0)
- **Boundary:** rate = 0
- **Expected:** ✅ Accept (free tier scenario)
- **Validates:** Minimum value acceptance

### TEST 8: Negative Billing Rate Rejection
- **Boundary:** rate = -10
- **Expected:** ❌ 400 Bad Request
- **Validates:** Negative values are rejected

### TEST 9: Very Large Billing Rate
- **Boundary:** rate = 999999.99
- **Expected:** ✅ Accept (premium tier)
- **Validates:** Large number handling

### TEST 10: Empty Billing Models Array
- **Boundary:** billingModels = []
- **Expected:** ✅ Accept (initialization state)
- **Validates:** Empty array handling

### TEST 11: Maximum Number of Billing Models
- **Stress Test:** 100 billing models
- **Expected:** ✅ Accept all 100 models
- **Validates:** System performance with large datasets

---

## Category 2: Boundary Tests - Waste Categories (5 Tests)

### TEST 12: Single Character Category Key
- **Boundary:** key = 'a' (1 character)
- **Expected:** ✅ Accept
- **Validates:** Minimum string length

### TEST 13: Very Long Category Key
- **Boundary:** key = 'a' × 100 (100 characters)
- **Expected:** ✅ Accept
- **Validates:** Maximum string length handling

### TEST 14: Empty Category Key Rejection
- **Boundary:** key = '' (empty string)
- **Expected:** ❌ 400 Bad Request
- **Validates:** Required field enforcement

### TEST 15: Maximum Number of Categories
- **Stress Test:** 50 waste categories
- **Expected:** ✅ Accept all 50 categories
- **Validates:** Large array handling

### TEST 16: Category Key with Spaces
- **Edge Case:** key = 'invalid key' (spaces)
- **Expected:** ✅ Accept (trimmed by schema)
- **Validates:** Whitespace handling

---

## Category 3: Boundary Tests - Collection Rules (3 Tests)

### TEST 17: Minimum maxBinsPerCollection
- **Boundary:** maxBinsPerCollection = 1
- **Expected:** ✅ Accept
- **Validates:** Minimum value

### TEST 18: Large maxBinsPerCollection
- **Boundary:** maxBinsPerCollection = 1000
- **Expected:** ✅ Accept
- **Validates:** Large capacity handling

### TEST 19: All Valid Frequency Values
- **Values Tested:** 'daily', 'weekly', 'biweekly', 'monthly'
- **Expected:** ✅ Accept all valid enums
- **Validates:** Enum validation

---

## Category 4: Error Tests - Missing Required Fields (4 Tests)

### TEST 20: Billing Model Missing Name
- **Error:** billingModel without 'name' field
- **Expected:** ❌ 400 Bad Request
- **Validates:** Required field enforcement

### TEST 21: Billing Model Missing Rate
- **Error:** billingModel without 'rate' field
- **Expected:** ❌ 400 Bad Request
- **Validates:** Required field enforcement

### TEST 22: Category Missing Key
- **Error:** wasteCategory without 'key' field
- **Expected:** ❌ 400 Bad Request
- **Validates:** Required field enforcement

### TEST 23: Category Missing Label
- **Error:** wasteCategory without 'label' field
- **Expected:** ❌ 400 Bad Request
- **Validates:** Required field enforcement

---

## Category 5: Error Tests - Invalid Data Types (5 Tests)

### TEST 24: Non-Numeric Billing Rate
- **Error:** rate = 'invalid' (string instead of number)
- **Expected:** ❌ 400 Bad Request
- **Validates:** Type validation

### TEST 25: Non-String Category Key
- **Error:** key = 123 (number instead of string)
- **Expected:** ❌ 400 Bad Request
- **Validates:** Type validation

### TEST 26: Non-Number maxBinsPerCollection
- **Error:** maxBinsPerCollection = 'invalid' (string)
- **Expected:** ❌ 400 Bad Request
- **Validates:** Type validation

### TEST 27: Non-Array Billing Models
- **Error:** billingModels = 'not-an-array' (string)
- **Expected:** ❌ 400 Bad Request
- **Validates:** Array type enforcement

### TEST 28: Non-Array Waste Categories
- **Error:** wasteCategories = 'not-an-array' (string)
- **Expected:** ❌ 400 Bad Request
- **Validates:** Array type enforcement

---

## Category 6: Error Tests - Malformed Requests (3 Tests)

### TEST 29: Empty Request Body
- **Input:** {} (empty object)
- **Expected:** ✅ 200 OK (creates empty config)
- **Validates:** Graceful handling of empty updates

### TEST 30: Invalid JSON
- **Input:** 'invalid-json' (malformed string)
- **Expected:** ❌ 400 Bad Request
- **Validates:** JSON parsing error handling

### TEST 31: Extra Unknown Fields
- **Input:** Valid data + unknownField
- **Expected:** ✅ 200 OK (Mongoose ignores unknown fields)
- **Validates:** Schema strictness

---

## Category 7: Error Tests - Category Management (5 Tests)

### TEST 32: Duplicate Category Key
- **Scenario:** Add category with existing key
- **Expected:** ❌ 422 Unprocessable Entity
- **Validates:** Unique key constraint

### TEST 33: Add Category Missing Required Fields
- **Error:** POST without key or label
- **Expected:** ❌ 400 Bad Request
- **Validates:** Creation validation

### TEST 34: Update Non-Existent Category
- **Error:** PUT to fake ObjectId
- **Expected:** ❌ 404 Not Found
- **Validates:** Resource existence check

### TEST 35: Delete Non-Existent Category
- **Error:** DELETE fake ObjectId
- **Expected:** ❌ 404 Not Found
- **Validates:** Resource existence check

### TEST 36: Invalid ObjectId Format
- **Error:** PUT to 'invalid-id'
- **Expected:** ❌ 400 Bad Request
- **Validates:** ID format validation

---

## Category 8: Edge Cases - Active Billing Model (3 Tests)

### TEST 37: Empty Active Model with No Models
- **Scenario:** activeBillingModel = '', billingModels = []
- **Expected:** ✅ 200 OK
- **Validates:** Valid empty state

### TEST 38: Active Model Not in Models List
- **Scenario:** activeBillingModel doesn't match any model
- **Expected:** ❌ 422 Unprocessable Entity
- **Validates:** Referential integrity

### TEST 39: Active Model with Special Characters
- **Scenario:** model name = 'Premium-Plus+'
- **Expected:** ✅ 200 OK
- **Validates:** Special character support

---

## Category 9: Stress Tests (1 Test)

### TEST 40: Maximum Data in Single Request
- **Stress Load:**
  - 50 billing models with rate = 9999.99
  - 50 waste categories
  - maxBinsPerCollection = 1000
- **Expected:** ✅ 200 OK
- **Validates:** System performance under maximum load

**Test Data Size:**
```javascript
{
  billingModels: 50 items,
  wasteCategories: 50 items,
  collectionRules: { maxBinsPerCollection: 1000 }
}
```

---

## 🎯 Test Coverage Summary

### By Category:
| Category | Tests | Pass Rate |
|----------|-------|-----------|
| Authentication & Authorization | 1 | 1/1 (100%) |
| CRUD Operations | 2 | 2/2 (100%) |
| Business Logic Validation | 2 | 2/2 (100%) |
| Notification System | 1 | 1/1 (100%) |
| Boundary - Billing Models | 5 | 5/5 (100%) |
| Boundary - Waste Categories | 5 | 5/5 (100%) |
| Boundary - Collection Rules | 3 | 3/3 (100%) |
| Error - Missing Fields | 4 | 4/4 (100%) |
| Error - Invalid Types | 5 | 5/5 (100%) |
| Error - Malformed Requests | 3 | 3/3 (100%) |
| Error - Category Management | 5 | 5/5 (100%) |
| Edge Cases | 3 | 3/3 (100%) |
| Stress Tests | 1 | 1/1 (100%) |
| **TOTAL** | **40** | **40/40 (100%)** |

---

## 🔧 How to Run Tests

### Run All Configuration Tests:
```bash
cd apps/backend
npm test -- configuration
```

### Run Only Core Tests:
```bash
npm test -- configuration.test.js
```

### Run Only Boundary Tests:
```bash
npm test -- configuration.boundary.test.js
```

### Run Tests with Coverage:
```bash
npm test -- --coverage configuration
```

---

## 📈 Test Quality Metrics

### Coverage Types:
✅ **Positive Test Cases:** 18 tests (valid inputs accepted)
✅ **Negative Test Cases:** 22 tests (invalid inputs rejected)
✅ **Boundary Values:** 13 tests (min/max limits)
✅ **Edge Cases:** 6 tests (special scenarios)
✅ **Stress Tests:** 1 test (maximum load)

### HTTP Status Codes Tested:
- **200 OK:** Successful operations
- **204 No Content:** Successful deletion
- **400 Bad Request:** Invalid input/type errors
- **401 Unauthorized:** Missing authentication
- **403 Forbidden:** Insufficient permissions
- **404 Not Found:** Resource not found
- **422 Unprocessable Entity:** Business logic violations

---

## 📚 Test Documentation Structure

Each test includes:
1. **Test Number:** Sequential identifier (TEST 1-40)
2. **Purpose:** What the test validates
3. **What it tests:** Detailed test steps
4. **Expected Results:** Success/failure criteria
5. **Business Rules:** Why this validation exists
6. **Test Data:** Sample input (where applicable)

---

## ✅ Test Assertions

### Common Assertions Used:
```javascript
// Status code validation
expect(res.status).toBe(200);

// Data structure validation
expect(res.body).toHaveProperty('_id');
expect(Array.isArray(res.body.billingModels)).toBe(true);

// Array length validation
expect(res.body.config.billingModels).toHaveLength(2);

// Object matching
expect(res.body.config.billingModels[0]).toMatchObject({ 
  name: 'Flat Fee', 
  rate: 10 
});

// Array containing validation (order-independent)
expect(res.body.config.wasteCategories).toEqual(
  expect.arrayContaining([
    expect.objectContaining({ key: 'plastic' })
  ])
);

// Error message validation
expect(res.body.error.message).toContain('must exist');
```

---

## 🎓 For Assignment Presentation

### Key Points to Highlight:

1. **Comprehensive Coverage:** 40 tests covering all scenarios
2. **100% Pass Rate:** All tests passing successfully
3. **Multiple Test Types:** Positive, negative, boundary, edge, stress
4. **Real-World Scenarios:** Tests based on actual use cases
5. **Security Testing:** Authentication and authorization
6. **Performance Testing:** Stress tests with maximum data
7. **Error Handling:** Proper validation and error messages
8. **Integration Testing:** Notification system integration

### Test Demonstration Strategy:
1. Show test file structure with comments
2. Run tests and show 40/40 passing
3. Explain 2-3 complex test cases in detail
4. Demonstrate boundary value testing methodology
5. Show error handling and validation

---

**Created:** December 2024  
**Feature:** IT23227118 - Configure System Settings  
**Developer:** Viman Kavinda  
**Status:** ✅ 40/40 tests passing (100%)
