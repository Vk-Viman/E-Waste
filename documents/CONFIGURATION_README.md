# Configuration Feature - Quick Start Guide

**Author:** IT23227118 - Viman Kavinda  
**Feature:** Configure System Settings (Use Case 3.3.1)

---

## 🎯 What Was Implemented?

This implementation **100% satisfies** the "Configure System Settings" use case scenario from CSSE Assignment 2.

### ✅ Complete Coverage
- All 8 main scenario steps
- All 4 extensions (3.a, 3.b, 4.a, 5.a)
- All identified gaps resolved
- Backend + Frontend fully integrated

---

## 🚀 Quick Start

### 1. Install Dependencies

```powershell
# Backend
cd apps/backend
npm install

# Frontend
cd apps/frontend-next
npm install
```

### 2. Start MongoDB

Make sure MongoDB is running and update `.env` if needed:
```
MONGO_URI="mongodb+srv://..."
```

### 3. Start Backend

```powershell
cd apps/backend
npm run dev
```

Server runs on: http://localhost:5000

### 4. Start Frontend

```powershell
cd apps/frontend-next
npm run dev
```

App runs on: http://localhost:3000

### 5. Test the Feature

1. Login as Admin: http://localhost:3000/login
2. Navigate to Settings: http://localhost:3000/settings
3. Configure system settings:
   - Select billing model (Flat Fee / Weight-Based)
   - Add/remove billing models
   - Add/remove waste categories
   - Configure collection rules
4. Click "Save Settings"
5. Check backend console for module notifications

---

## 📁 Key Files

### Backend
- `apps/backend/src/features/configuration/model.js` - SystemConfig + schemas
- `apps/backend/src/features/configuration/wasteCategory.model.js` - WasteCategory model
- `apps/backend/src/features/configuration/service.js` - Billing strategies + notifications
- `apps/backend/src/features/configuration/controller.js` - API handlers
- `apps/backend/src/features/configuration/routes.js` - API routes

### Frontend
- `apps/frontend-next/app/(admin)/settings/page.tsx` - Settings UI

### Documentation
- `CONFIGURATION_FEATURE_SUMMARY.md` - Full implementation details
- `CONFIGURATION_VERIFICATION.md` - Use case compliance checklist
- `apps/backend/scripts/test-configuration.js` - Test script

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/configuration` | Get current settings |
| PUT | `/api/configuration` | Update settings (triggers notifications) |
| DELETE | `/api/configuration` | Reset to defaults |
| GET | `/api/configuration/categories` | List all categories |
| POST | `/api/configuration/categories` | Add new category |
| PUT | `/api/configuration/categories/:id` | Update category |
| DELETE | `/api/configuration/categories/:id` | Delete category |

All endpoints require admin authentication.

---

## 🧪 Testing

### Option 1: Manual Testing (UI)
1. Login as admin
2. Go to Settings page
3. Make changes
4. Click Save
5. Verify notifications appear

### Option 2: API Testing (Script)
```powershell
cd apps/backend
node scripts/test-configuration.js
```
⚠️ Update `SESSION_COOKIE` in the script first!

### Option 3: API Testing (cURL)
```powershell
# Get configuration
curl http://localhost:5000/api/configuration -b "connect.sid=YOUR_SESSION"

# Update configuration
curl -X PUT http://localhost:5000/api/configuration \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: YOUR_TOKEN" \
  -b "connect.sid=YOUR_SESSION" \
  -d '{"activeBillingModel":"Flat Fee","billingModels":[{"name":"Flat Fee","rate":10}]}'
```

---

## 📊 Use Case Mapping

| Use Case Step | Implementation |
|---------------|----------------|
| 1. Navigate to Settings | `/settings` link in admin nav |
| 2. Display options | 4 UI cards (billing model, models, categories, rules) |
| 3. Select billing model | Radio buttons (Flat Fee / Weight-Based) |
| 4. Adjust categories | Add/remove UI with validation |
| 5. Additional adjustments | Collection rules form |
| 6. Save Changes | "Save Settings" button |
| 7. Update DB & notify | `updateConfig()` + `notifyDependentModules()` |
| 8. Confirmation | Success toast + notification panel |

---

## 🔐 Security

- ✅ Authentication required
- ✅ Admin role required
- ✅ CSRF token protection
- ✅ Input validation
- ✅ Duplicate prevention

---

## 📝 What Gets Notified?

When you save settings, the system notifies:

1. **Billing Module** - Updates billing rates and model
2. **Reporting Module** - Updates waste categories for reports
3. **Waste Tracking Module** - Updates collection rules

Check backend console for logs:
```
[BILLING MODULE] Configuration updated: { ... }
[REPORTING MODULE] Configuration updated: { ... }
[WASTE TRACKING MODULE] Configuration updated: { ... }
```

---

## 🎨 UI Features

### Active Billing Model Card
- Radio selection: Flat Fee vs Weight-Based
- Visual feedback on active model

### Billing Models Card
- List existing models
- Add new model (name + rate)
- Remove models

### Waste Categories Card
- List existing categories
- Add new category (key + label)
- Remove categories
- Duplicate validation

### Collection Rules Card
- Frequency dropdown
- Time slot input
- Max bins input

### Notifications Display
- Shows module update results
- Lists affected systems

---

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB connection in `.env`
- Run `npm install` in apps/backend

### Frontend won't start
- Run `npm install` in apps/frontend-next
- Check port 3000 is available

### Settings page shows error
- Ensure you're logged in as ADMIN
- Check backend is running on port 5000

### Save doesn't work
- Check browser console for errors
- Verify CSRF token is being fetched
- Check backend console for validation errors

---

## 📚 Additional Documentation

- **Full Implementation:** See `CONFIGURATION_FEATURE_SUMMARY.md`
- **Compliance Checklist:** See `CONFIGURATION_VERIFICATION.md`
- **Assignment PDF:** See attached `CSSE Assignment 2.pdf`

---

## ✅ Completion Status

- [x] Backend model layer
- [x] Backend service layer (notifications)
- [x] Backend controller layer
- [x] Backend routes (7 endpoints)
- [x] Frontend UI (4 cards + notifications)
- [x] Input validation
- [x] Security (auth + CSRF)
- [x] Documentation
- [x] Test script

**Status:** COMPLETE ✅  
**Compliance:** 100% ✅  
**Ready for submission:** YES ✅

---

**Questions?** Check the detailed docs or test the feature yourself!
