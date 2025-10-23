# Billing Models Connection - How It Works

**Author:** IT23227118 - Viman Kavinda  
**Date:** October 18, 2025

---

## 🔗 Connection Between Active Billing Model & Billing Models

The system now has a **dynamic connection** between the "Active Billing Model" selector and the "Billing Models" list.

---

## 📊 How It Works

### 1. **Billing Models List (Source of Truth)**

You define billing models with:
- **Name** (e.g., "Flat Fee", "Weight-Based", "Premium Plan")
- **Rate** (e.g., $10, $0.5/kg)

Example:
```json
[
  { "name": "Flat Fee", "rate": 10 },
  { "name": "Weight-Based", "rate": 0.5 },
  { "name": "Premium Service", "rate": 25 }
]
```

### 2. **Active Billing Model (Selection)**

You select **one** of the defined models to be active system-wide.

The active model appears as:
- Radio button selection in "Active Billing Model" card
- "✓ Active" badge in "Billing Models" list
- Highlighted with blue border/background

---

## 🎯 User Flow

### Step 1: Add Billing Models

1. Scroll to "Billing Models" card
2. Enter model name (e.g., "Flat Fee")
3. Enter rate (e.g., 10)
4. Click "Add Billing Model"

**Result:**
- Model appears in the list
- If it's the **first model**, it auto-activates
- Model appears as an option in "Active Billing Model" card above

### Step 2: Select Active Model

1. Scroll to "Active Billing Model" card
2. Click on any defined model
3. See "Active" badge appear

**Result:**
- Selected model highlighted with blue border
- Info banner shows: "Flat Fee at $10 is currently active system-wide"
- "✓ Active" badge appears in Billing Models list

### Step 3: Add More Models

1. Add "Weight-Based" with rate 0.5
2. Add "Premium Service" with rate 25

**Result:**
- All 3 models appear in both cards
- Active model remains selected
- You can switch between them

### Step 4: Remove a Model

**Case A: Removing Non-Active Model**
- Click "Remove" on "Premium Service"
- Model removed from both cards
- Active model unchanged

**Case B: Removing Active Model**
- Click "Remove" on "Flat Fee" (currently active)
- System auto-switches to the first remaining model
- "Weight-Based" becomes active

**Case C: Removing Last Active Model**
- If only 1 model left and it's active
- "Remove" button is **disabled**
- Tooltip: "Cannot remove the only active model"

---

## 🔒 Validation Rules

### Frontend Validation

1. **No Duplicates**: Cannot add two models with same name
2. **Required Fields**: Name and rate are required
3. **Positive Rates**: Rate must be ≥ 0
4. **Auto-Activation**: First model added is auto-selected
5. **Smart Removal**: Removing active model auto-switches to next available

### Backend Validation

1. **Active Model Must Exist**: 
   ```javascript
   if (activeBillingModel not in billingModels.map(bm => bm.name)) {
     throw Error("Active billing model must exist in billing models list");
   }
   ```

2. **Duplicate Categories**: Validates waste category keys

---

## 💡 Visual Indicators

### In "Active Billing Model" Card

```
┌─────────────────────────────────────────────┐
│  ⦿ Flat Fee         $10        [Active]    │  ← Blue border, blue background
├─────────────────────────────────────────────┤
│  ○ Weight-Based     $0.5/kg                 │  ← Gray border
└─────────────────────────────────────────────┘

ℹ️  Flat Fee at $10 is currently active system-wide
```

### In "Billing Models" Card

```
┌─────────────────────────────────────────────┐
│  Flat Fee · $10    [✓ Active]    [Remove]  │  ← Blue border, blue background
├─────────────────────────────────────────────┤
│  Weight-Based · $0.5              [Remove]  │  ← Gray border
└─────────────────────────────────────────────┘
```

---

## 🧪 Testing the Connection

### Test 1: Empty State
1. Reset configuration (delete all models)
2. Go to Active Billing Model card
3. **Expected**: Warning message "⚠️ No billing models defined yet"

### Test 2: Add First Model
1. Add "Flat Fee" at $10
2. Check Active Billing Model card
3. **Expected**: "Flat Fee" auto-selected and shown

### Test 3: Add Second Model
1. Add "Weight-Based" at $0.5
2. Check Active Billing Model card
3. **Expected**: Both models appear, "Flat Fee" still active

### Test 4: Switch Active Model
1. Click "Weight-Based" in Active Billing Model card
2. Check Billing Models list
3. **Expected**: "✓ Active" badge moves to "Weight-Based"

### Test 5: Remove Non-Active
1. Remove "Flat Fee"
2. Check Active Billing Model card
3. **Expected**: Only "Weight-Based" remains, still active

### Test 6: Try Remove Last Active
1. Click "Remove" on last remaining model
2. **Expected**: Button disabled, tooltip shows warning

### Test 7: Save & Reload
1. Save settings
2. Refresh page
3. **Expected**: Active model persists, connection maintained

---

## 📝 Code Examples

### Frontend: Auto-Select First Model

```typescript
function addBilling() {
  const name = bmName.trim();
  const rateNum = Number(bmRate);
  
  // ... validation ...
  
  setBillingModels((prev) => [...prev, { name, rate: rateNum }]);
  
  // Auto-select if first model
  if (billingModels.length === 0) {
    setActiveBillingModel(name);
  }
  
  setBmName('');
  setBmRate('');
}
```

### Frontend: Smart Removal

```typescript
function removeBilling(index: number) {
  const modelToRemove = billingModels[index];
  
  // If removing active model, switch to next available
  if (modelToRemove.name === activeBillingModel) {
    const remaining = billingModels.filter((_, i) => i !== index);
    setActiveBillingModel(remaining.length > 0 ? remaining[0].name : '');
  }
  
  setBillingModels((prev) => prev.filter((_, i) => i !== index));
}
```

### Backend: Validation

```javascript
async function updateConfig(req, res) {
  const update = req.body || {};
  
  // Validate active model exists
  if (update.activeBillingModel && Array.isArray(update.billingModels)) {
    const modelExists = update.billingModels.some(
      bm => bm.name === update.activeBillingModel
    );
    if (!modelExists && update.billingModels.length > 0) {
      throw httpError(422, 
        `Active billing model '${update.activeBillingModel}' must exist in billing models list`
      );
    }
  }
  
  // ... save and notify ...
}
```

---

## 🎨 UI Benefits

### Before (Disconnected)
- ❌ Could select "Flat Fee" even if not defined
- ❌ No visual link between sections
- ❌ Unclear which rate applies
- ❌ Could delete all models and leave system broken

### After (Connected)
- ✅ Only defined models are selectable
- ✅ Clear visual connection (badges, highlights)
- ✅ Shows exact rate for each option
- ✅ Prevents invalid states (always 1+ model if active)
- ✅ Auto-management (auto-select, auto-switch)

---

## 🔄 State Synchronization

Both cards stay in sync:

| Action | Active Model Card | Billing Models Card |
|--------|-------------------|---------------------|
| Add model | New option appears | New row appears |
| Remove model | Option disappears | Row disappears |
| Select active | Highlight changes | Badge moves |
| Save changes | Persists selection | Persists list |

---

## 📚 Summary

The connection ensures:
1. **Data Integrity**: Active model always exists in the list
2. **User Experience**: Clear, intuitive visual feedback
3. **Flexibility**: Admin can define custom models with any name/rate
4. **Safety**: Prevents invalid configurations
5. **Convenience**: Auto-management reduces manual steps

**Result:** Seamless, connected workflow for configuring billing! ✅

---

**End of Connection Guide**
