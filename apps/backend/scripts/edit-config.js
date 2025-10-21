/**
 * Script to manually edit the system configuration
 * Usage: node scripts/edit-config.js
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

async function editConfig() {
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

    // CUSTOMIZE THIS SECTION WITH YOUR DESIRED CHANGES
    // ===================================================
    
    const updates = {
      billingModels: [
        { name: 'Weight-Based', rate: 0.5 }, // $0.50 per kg
        { name: 'Flat Fee', rate: 15 }       // $15 flat
      ],
      wasteCategories: [
        { key: 'plastic', label: 'Plastic Waste' },
        { key: 'paper', label: 'Paper & Cardboard' },
        { key: 'glass', label: 'Glass Bottles' },
        { key: 'metal', label: 'Metal Cans' },
        { key: 'organic', label: 'Organic/Compost' },
        { key: 'electronic', label: 'E-Waste' }
      ]
    };

    // Update or create the config
    const config = await SystemConfig.findOneAndUpdate(
      {},
      updates,
      { new: true, upsert: true }
    );

    console.log('✅ Configuration updated successfully:');
    console.log(JSON.stringify(config, null, 2));

    await mongoose.connection.close();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

editConfig();
