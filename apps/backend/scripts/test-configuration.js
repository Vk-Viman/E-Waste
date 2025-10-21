/**
 * Configuration Feature Test Script
 * Author: IT23227118 - Viman Kavinda
 * 
 * This script tests all configuration endpoints to verify the implementation
 * Run this after starting the backend server
 */

const API_BASE = 'http://localhost:5000/api';

// You need to set this to a valid admin session cookie
const SESSION_COOKIE = 'connect.sid=your-session-id-here';

async function getCsrfToken() {
  const res = await fetch(`${API_BASE.replace('/api', '')}/csrf-token`, {
    headers: { Cookie: SESSION_COOKIE },
  });
  const data = await res.json();
  return data.csrfToken;
}

async function testGetConfiguration() {
  console.log('\n📥 Testing GET /api/configuration...');
  const res = await fetch(`${API_BASE}/configuration`, {
    headers: { Cookie: SESSION_COOKIE },
  });
  const data = await res.json();
  console.log('Status:', res.status);
  console.log('Data:', JSON.stringify(data, null, 2));
  return data;
}

async function testUpdateConfiguration() {
  console.log('\n📤 Testing PUT /api/configuration...');
  const csrfToken = await getCsrfToken();
  
  const payload = {
    activeBillingModel: 'Weight-Based',
    billingModels: [
      { name: 'Flat Fee', rate: 10 },
      { name: 'Weight-Based', rate: 0.5 },
    ],
    wasteCategories: [
      { key: 'plastic', label: 'Plastic' },
      { key: 'paper', label: 'Paper' },
      { key: 'e-waste', label: 'Electronic Waste' },
    ],
    collectionRules: {
      frequency: 'weekly',
      timeSlot: '08:00-12:00',
      maxBinsPerCollection: 2,
    },
  };

  const res = await fetch(`${API_BASE}/configuration`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
      Cookie: SESSION_COOKIE,
    },
    body: JSON.stringify(payload),
  });
  
  const data = await res.json();
  console.log('Status:', res.status);
  console.log('Data:', JSON.stringify(data, null, 2));
  
  // Check notifications
  if (data.notifications && data.notifications.success) {
    console.log('\n✅ Module Notifications:');
    data.notifications.notifications.forEach(notif => {
      console.log(`  - ${notif.module}: ${notif.message}`);
    });
  }
  
  return data;
}

async function testAddCategory() {
  console.log('\n📤 Testing POST /api/configuration/categories...');
  const csrfToken = await getCsrfToken();
  
  const payload = {
    key: 'glass',
    label: 'Glass Waste',
    description: 'Bottles, jars, and other glass items',
  };

  const res = await fetch(`${API_BASE}/configuration/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
      Cookie: SESSION_COOKIE,
    },
    body: JSON.stringify(payload),
  });
  
  const data = await res.json();
  console.log('Status:', res.status);
  console.log('Data:', JSON.stringify(data, null, 2));
  return data;
}

async function testGetCategories() {
  console.log('\n📥 Testing GET /api/configuration/categories...');
  const res = await fetch(`${API_BASE}/configuration/categories`, {
    headers: { Cookie: SESSION_COOKIE },
  });
  const data = await res.json();
  console.log('Status:', res.status);
  console.log('Categories:', data.length);
  data.forEach(cat => {
    console.log(`  - ${cat.key} → ${cat.label}`);
  });
  return data;
}

async function runAllTests() {
  console.log('🧪 Configuration Feature Test Suite');
  console.log('=====================================');
  console.log('⚠️  Make sure you:');
  console.log('   1. Started the backend server (npm run dev in apps/backend)');
  console.log('   2. Updated SESSION_COOKIE with a valid admin session');
  console.log('   3. Have MongoDB running and connected');
  console.log('');

  try {
    // Test 1: Get current configuration
    await testGetConfiguration();
    
    // Test 2: Update configuration (triggers notifications)
    await testUpdateConfiguration();
    
    // Test 3: Verify changes were saved
    await testGetConfiguration();
    
    // Test 4: Add a new category
    await testAddCategory();
    
    // Test 5: List all categories
    await testGetCategories();
    
    console.log('\n✅ All tests completed!');
    console.log('Check backend console for module notification logs.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Make sure SESSION_COOKIE is valid and backend is running.');
  }
}

// Run if executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests };
