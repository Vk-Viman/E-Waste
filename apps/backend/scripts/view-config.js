/**
 * Script to view the current system configuration from MongoDB
 * Usage: node scripts/view-config.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const SystemConfigSchema = new mongoose.Schema(
  {
    billingModels: [{ name: String, rate: Number }],
    wasteCategories: [{ key: String, label: String }],
  },
  { timestamps: true }
);

const SystemConfig = mongoose.model('SystemConfig', SystemConfigSchema);

async function viewConfig() {
  try {
    // Connect to MongoDB
    const uri = process.env.MONGO_URI;
    const dbName = process.env.MONGO_DB_NAME || 'EcoCollectDB';
    
    console.log('Connecting to MongoDB...');
    const opts = {
      dbName,
      serverSelectionTimeoutMS: 5000,
      family: 4, // prefer IPv4 to avoid Windows DNS SRV hiccups
    };
    await mongoose.connect(uri, opts);
    console.log('✅ Connected to MongoDB\n');

    // Fetch all configs
    const configs = await SystemConfig.find();
    
    if (configs.length === 0) {
      console.log('❌ No configuration found in database');
    } else {
      console.log('📊 System Configuration(s):\n');
      configs.forEach((config, index) => {
        console.log(`Config #${index + 1}:`);
        console.log(`  ID: ${config._id}`);
        console.log(`  Created: ${config.createdAt}`);
        console.log(`  Updated: ${config.updatedAt}`);
        console.log('\n  Billing Models:');
        config.billingModels?.forEach(bm => {
          console.log(`    - ${bm.name}: $${bm.rate}`);
        });
        console.log('\n  Waste Categories:');
        config.wasteCategories?.forEach(wc => {
          console.log(`    - ${wc.key}: ${wc.label}`);
        });
        console.log('\n' + '='.repeat(50) + '\n');
      });
    }

    await mongoose.connection.close();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

viewConfig();
