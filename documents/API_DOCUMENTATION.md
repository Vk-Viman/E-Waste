# API Documentation Guide

**Author:** IT23227118 - Viman Kavinda  
**Date:** October 18, 2025  
**Status:** ✅ Complete & Accessible

---

## 🌐 Accessing API Documentation

### Swagger UI (Interactive)

**URL:** http://localhost:5000/api-docs

1. Start the backend server:
   ```powershell
   cd apps/backend
   npm run dev
   ```

2. Open browser and navigate to: **http://localhost:5000/api-docs**

3. You'll see an interactive API documentation with:
   - All endpoints listed by feature
   - Request/response schemas
   - Try-it-out functionality
   - Example requests and responses

---

## 📚 Configuration API Documentation

### Overview

The Configuration API manages system-wide settings including:
- Active billing model selection
- Billing model rates
- Waste categories
- Collection rules (frequency, time slots, max bins)

**Base Path:** `/api/configuration`  
**Authentication:** Required (Admin only)  
**CSRF Protection:** Required for mutations (PUT, POST, DELETE)

---

## 📋 Endpoints

### 1. Get System Configuration

```http
GET /api/configuration
```

**Description:** Retrieves the current system configuration. If no configuration exists, creates and returns a default empty configuration.

**Authentication:** Required (Admin role)

**Response:** `200 OK`
```json
{
  "_id": "665f1e9a2c0fe7e8f1234567",
  "activeBillingModel": "Weight-Based",
  "billingModels": [
    {
      "name": "Flat Fee",
      "rate": 10
    },
    {
      "name": "Weight-Based",
      "rate": 0.5
    }
  ],
  "wasteCategories": [
    {
      "key": "plastic",
      "label": "Plastic Waste"
    },
    {
      "key": "paper",
      "label": "Paper Waste"
    },
    {
      "key": "e-waste",
      "label": "Electronic Waste"
    }
  ],
  "collectionRules": {
    "frequency": "weekly",
    "timeSlot": "08:00-12:00",
    "maxBinsPerCollection": 2
  },
  "createdAt": "2025-10-18T10:30:00.000Z",
  "updatedAt": "2025-10-18T14:45:00.000Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Missing authentication
- `403 Forbidden` - Non-admin user

---

### 2. Update System Configuration

```http
PUT /api/configuration
```

**Description:** Updates the system configuration and notifies dependent modules (Billing, Reporting, Waste Tracking).

**Authentication:** Required (Admin role)  
**CSRF Token:** Required in `X-CSRF-Token` header

**Request Body:**
```json
{
  "activeBillingModel": "Weight-Based",
  "billingModels": [
    {
      "name": "Flat Fee",
      "rate": 10
    },
    {
      "name": "Weight-Based",
      "rate": 0.5
    }
  ],
  "wasteCategories": [
    {
      "key": "plastic",
      "label": "Plastic Waste"
    },
    {
      "key": "e-waste",
      "label": "Electronic Waste"
    }
  ],
  "collectionRules": {
    "frequency": "weekly",
    "timeSlot": "08:00-12:00",
    "maxBinsPerCollection": 2
  }
}
```

**Response:** `200 OK`
```json
{
  "config": {
    "_id": "665f1e9a2c0fe7e8f1234567",
    "activeBillingModel": "Weight-Based",
    "billingModels": [...],
    "wasteCategories": [...],
    "collectionRules": {...},
    "updatedAt": "2025-10-18T14:45:00.000Z"
  },
  "notifications": {
    "success": true,
    "notifications": [
      {
        "module": "Billing",
        "status": "notified",
        "message": "Billing model updated to: Weight-Based",
        "timestamp": "2025-10-18T14:45:00.000Z"
      },
      {
        "module": "Reporting",
        "status": "notified",
        "message": "Waste categories updated: 2 categories active",
        "timestamp": "2025-10-18T14:45:00.000Z"
      },
      {
        "module": "Waste Tracking",
        "status": "notified",
        "message": "Collection rules updated: weekly frequency",
        "timestamp": "2025-10-18T14:45:00.000Z"
      }
    ]
  },
  "message": "Settings updated successfully"
}
```

**Validation Rules:**
1. `activeBillingModel` must exist in `billingModels` array
2. Waste category keys must be unique (no duplicates)
3. All rates must be non-negative numbers

**Error Responses:**

**422 Unprocessable Entity** - Validation errors
```json
{
  "error": "Active billing model 'Premium' must exist in billing models list"
}
```

```json
{
  "error": "Duplicate waste category key: 'plastic'"
}
```

**401 Unauthorized** - Missing authentication  
**403 Forbidden** - Non-admin user

---

### 3. Reset Configuration to Defaults

```http
DELETE /api/configuration
```

**Description:** Deletes the current configuration. Next GET request will create a new default configuration.

**Authentication:** Required (Admin role)  
**CSRF Token:** Required in `X-CSRF-Token` header

**Response:** `204 No Content`

**Error Responses:**
- `401 Unauthorized` - Missing authentication
- `403 Forbidden` - Non-admin user

---

### 4. Get All Waste Categories

```http
GET /api/configuration/categories
```

**Description:** Retrieves all active waste categories from the centralized category store.

**Authentication:** Required (Admin role)

**Response:** `200 OK`
```json
[
  {
    "_id": "665f1e9a2c0fe7e8f1234567",
    "key": "plastic",
    "label": "Plastic Waste",
    "description": "Plastic bottles, containers, packaging",
    "isActive": true,
    "createdAt": "2025-10-18T10:00:00.000Z",
    "updatedAt": "2025-10-18T10:00:00.000Z"
  },
  {
    "_id": "665f1e9a2c0fe7e8f1234568",
    "key": "e-waste",
    "label": "Electronic Waste",
    "description": "Computers, phones, etc.",
    "isActive": true,
    "createdAt": "2025-10-18T11:00:00.000Z",
    "updatedAt": "2025-10-18T11:00:00.000Z"
  }
]
```

**Error Responses:**
- `401 Unauthorized` - Missing authentication
- `403 Forbidden` - Non-admin user

---

### 5. Add New Waste Category

```http
POST /api/configuration/categories
```

**Description:** Adds a new waste category to the system and updates the main configuration.

**Authentication:** Required (Admin role)  
**CSRF Token:** Required in `X-CSRF-Token` header

**Request Body:**
```json
{
  "key": "e-waste",
  "label": "Electronic Waste",
  "description": "Computers, phones, etc." // optional
}
```

**Validation Rules:**
- `key` is required, must be unique, lowercase, alphanumeric + hyphens only
- `label` is required
- Duplicate keys are rejected

**Response:** `201 Created`
```json
{
  "category": {
    "_id": "665f1e9a2c0fe7e8f1234568",
    "key": "e-waste",
    "label": "Electronic Waste",
    "description": "Computers, phones, etc.",
    "isActive": true,
    "createdAt": "2025-10-18T11:00:00.000Z",
    "updatedAt": "2025-10-18T11:00:00.000Z"
  },
  "message": "Category 'Electronic Waste' added successfully"
}
```

**Error Responses:**

**400 Bad Request**
```json
{
  "error": "Category key and label are required"
}
```

**422 Unprocessable Entity**
```json
{
  "error": "Category with key 'e-waste' already exists"
}
```

**401 Unauthorized** - Missing authentication  
**403 Forbidden** - Non-admin user

---

### 6. Update Waste Category

```http
PUT /api/configuration/categories/:id
```

**Description:** Updates an existing waste category and syncs with main configuration.

**Authentication:** Required (Admin role)  
**CSRF Token:** Required in `X-CSRF-Token` header

**Path Parameters:**
- `id` - MongoDB ObjectId of the category

**Request Body:**
```json
{
  "label": "Electronic & Electrical Waste",
  "description": "Updated description",
  "isActive": true
}
```

**Response:** `200 OK`
```json
{
  "category": {
    "_id": "665f1e9a2c0fe7e8f1234568",
    "key": "e-waste",
    "label": "Electronic & Electrical Waste",
    "description": "Updated description",
    "isActive": true,
    "updatedAt": "2025-10-18T15:00:00.000Z"
  },
  "message": "Category updated successfully"
}
```

**Error Responses:**
- `404 Not Found` - Category ID doesn't exist
- `401 Unauthorized` - Missing authentication
- `403 Forbidden` - Non-admin user

---

### 7. Delete Waste Category

```http
DELETE /api/configuration/categories/:id
```

**Description:** Deletes a waste category and removes it from main configuration.

**Authentication:** Required (Admin role)  
**CSRF Token:** Required in `X-CSRF-Token` header

**Path Parameters:**
- `id` - MongoDB ObjectId of the category

**Response:** `200 OK`
```json
{
  "message": "Category 'Electronic Waste' deleted successfully"
}
```

**Error Responses:**
- `404 Not Found` - Category ID doesn't exist
- `401 Unauthorized` - Missing authentication
- `403 Forbidden` - Non-admin user

---

## 🔐 Authentication & Security

### Cookie-Based Authentication

All endpoints require authentication via session cookie:

```http
Cookie: connect.sid=s%3A...
```

**How to get a session cookie:**
1. POST to `/api/auth/login` with email/password
2. Cookie is automatically set in response
3. Include cookie in subsequent requests

### CSRF Protection

Mutation endpoints (PUT, POST, DELETE) require CSRF token:

**1. Get CSRF Token:**
```http
GET /csrf-token
```
Response:
```json
{
  "csrfToken": "xyz123..."
}
```

**2. Include in Request:**
```http
X-CSRF-Token: xyz123...
```

### Role-Based Access

All configuration endpoints require **ADMIN** role.

**Authorization Flow:**
1. `protect` middleware validates session cookie
2. `adminOnly` middleware checks user role
3. Returns 403 if role is not ADMIN

---

## 📊 Data Models

### SystemConfig Schema

```typescript
{
  _id: ObjectId,
  activeBillingModel: string,           // Must match a name in billingModels
  billingModels: [
    {
      name: string,                      // e.g., "Flat Fee", "Weight-Based"
      rate: number                       // Non-negative
    }
  ],
  wasteCategories: [
    {
      key: string,                       // Unique, lowercase
      label: string
    }
  ],
  collectionRules: {
    frequency: string,                   // "daily", "weekly", "biweekly", "monthly"
    timeSlot: string,                    // e.g., "08:00-12:00"
    maxBinsPerCollection: number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### WasteCategory Schema

```typescript
{
  _id: ObjectId,
  key: string,                          // Unique, lowercase, alphanumeric+hyphens
  label: string,
  description: string,                  // Optional
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🧪 Example cURL Commands

### Get Configuration
```bash
curl http://localhost:5000/api/configuration \
  -b "connect.sid=YOUR_SESSION_COOKIE"
```

### Update Configuration
```bash
curl -X PUT http://localhost:5000/api/configuration \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: YOUR_CSRF_TOKEN" \
  -b "connect.sid=YOUR_SESSION_COOKIE" \
  -d '{
    "activeBillingModel": "Weight-Based",
    "billingModels": [
      {"name": "Flat Fee", "rate": 10},
      {"name": "Weight-Based", "rate": 0.5}
    ],
    "wasteCategories": [
      {"key": "plastic", "label": "Plastic"}
    ],
    "collectionRules": {
      "frequency": "weekly",
      "timeSlot": "08:00-12:00",
      "maxBinsPerCollection": 2
    }
  }'
```

### Add Category
```bash
curl -X POST http://localhost:5000/api/configuration/categories \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: YOUR_CSRF_TOKEN" \
  -b "connect.sid=YOUR_SESSION_COOKIE" \
  -d '{
    "key": "e-waste",
    "label": "Electronic Waste",
    "description": "Computers, phones, etc."
  }'
```

### Delete Configuration
```bash
curl -X DELETE http://localhost:5000/api/configuration \
  -H "X-CSRF-Token: YOUR_CSRF_TOKEN" \
  -b "connect.sid=YOUR_SESSION_COOKIE"
```

---

## 📝 Postman Collection

### Import Instructions

1. Open Postman
2. Click "Import"
3. Create new collection: "EcoCollect - Configuration API"
4. Add requests for each endpoint above
5. Set up environment variables:
   - `BASE_URL`: http://localhost:5000
   - `CSRF_TOKEN`: (get from /csrf-token)
   - `SESSION_COOKIE`: (get from /auth/login)

---

## 🎯 Testing the API

### Using Swagger UI

1. Go to http://localhost:5000/api-docs
2. Click "Authorize" button
3. Login via `/api/auth/login` endpoint first
4. Use "Try it out" on any endpoint
5. View request/response in real-time

### Using the Test Script

```powershell
cd apps/backend
node scripts/test-configuration.js
```

(Update `SESSION_COOKIE` in the script first)

---

## 📚 Additional Resources

- **Full Implementation:** `CONFIGURATION_FEATURE_SUMMARY.md`
- **Connection Guide:** `BILLING_MODELS_CONNECTION.md`
- **Test Coverage:** `TEST_AND_API_DOCS_SUMMARY.md`
- **Quick Start:** `CONFIGURATION_README.md`

---

## ✅ Documentation Status

- ✅ Swagger annotations complete in all route files
- ✅ Interactive Swagger UI available at /api-docs
- ✅ All 7 endpoints documented
- ✅ Request/response schemas defined
- ✅ Error responses documented
- ✅ Authentication/security explained
- ✅ Example cURL commands provided
- ✅ Data models specified

---

**API Documentation is complete and accessible via Swagger UI!** 🎉

**Access it now:** http://localhost:5000/api-docs (after starting the backend)

---

**End of API Documentation Guide**
