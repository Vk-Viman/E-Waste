/**
 * Script to reset/delete the system configuration from MongoDB
 * Usage: node scripts/reset-config.js
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

async function resetConfig() {
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

    // Delete all configs
    const result = await SystemConfig.deleteMany({});
    console.log(`🗑️  Deleted ${result.deletedCount} configuration(s)`);

    // Optionally create a default config
    const defaultConfig = await SystemConfig.create({
      billingModels: [
        { name: 'Flat Fee', rate: 10 }
      ],
      wasteCategories: [
        { key: 'plastic', label: 'Plastic' },
        { key: 'paper', label: 'Paper' },
        { key: 'glass', label: 'Glass' },
        { key: 'metal', label: 'Metal' },
        { key: 'organic', label: 'Organic' }
      ]
    });

    console.log('✅ Created default configuration:');
    console.log(JSON.stringify(defaultConfig, null, 2));

    await mongoose.connection.close();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetConfig();
