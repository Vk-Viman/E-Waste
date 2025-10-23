/**
 * Seed script to create sample bins with coordinates for testing route optimization
 * 
 * Usage: node scripts/seed-bins.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const BinSchema = new mongoose.Schema(
  {
    binId: { type: String, required: true, unique: true, index: true },
    location: { type: String },
    category: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    areaId: { type: String, index: true },
  },
  { timestamps: true }
);

const Bin = mongoose.model('Bin', BinSchema);

// Sample bins around Colombo, Sri Lanka area
const sampleBins = [
  {
    binId: 'BIN-001',
    location: 'Galle Face',
    category: 'general',
    latitude: 6.9271,
    longitude: 79.8612,
    areaId: 'COLOMBO-CENTRAL'
  },
  {
    binId: 'BIN-002',
    location: 'Independence Square',
    category: 'recyclable',
    latitude: 6.9034,
    longitude: 79.8685,
    areaId: 'COLOMBO-CENTRAL'
  },
  {
    binId: 'BIN-003',
    location: 'Viharamahadevi Park',
    category: 'organic',
    latitude: 6.9147,
    longitude: 79.8608,
    areaId: 'COLOMBO-CENTRAL'
  },
  {
    binId: 'BIN-004',
    location: 'Town Hall',
    category: 'general',
    latitude: 6.9120,
    longitude: 79.8653,
    areaId: 'COLOMBO-CENTRAL'
  },
  {
    binId: 'BIN-005',
    location: 'Colombo Fort',
    category: 'recyclable',
    latitude: 6.9344,
    longitude: 79.8428,
    areaId: 'COLOMBO-CENTRAL'
  },
  {
    binId: 'BIN-006',
    location: 'Dehiwala Zoo',
    category: 'organic',
    latitude: 6.8566,
    longitude: 79.8779,
    areaId: 'DEHIWALA'
  },
  {
    binId: 'BIN-007',
    location: 'Mount Lavinia Beach',
    category: 'general',
    latitude: 6.8335,
    longitude: 79.8630,
    areaId: 'DEHIWALA'
  },
  {
    binId: 'BIN-008',
    location: 'Bambalapitiya',
    category: 'recyclable',
    latitude: 6.8930,
    longitude: 79.8547,
    areaId: 'COLOMBO-CENTRAL'
  }
];

async function seedBins() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ecocollect';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing bins (optional - comment out if you want to keep existing data)
    // await Bin.deleteMany({});
    // console.log('Cleared existing bins');

    // Insert sample bins
    for (const binData of sampleBins) {
      await Bin.findOneAndUpdate(
        { binId: binData.binId },
        binData,
        { upsert: true, new: true }
      );
      console.log(`✓ Created/Updated bin: ${binData.binId} at ${binData.location}`);
    }

    console.log('\n✅ Successfully seeded', sampleBins.length, 'bins!');
    console.log('\nYou can now test the route optimization feature:');
    console.log('1. Start the backend server');
    console.log('2. Navigate to the Routes page as a Manager');
    console.log('3. Click "Generate Optimized Routes" to see the optimized path');
    console.log('4. Use area ID "COLOMBO-CENTRAL" or "DEHIWALA" to filter by area');

  } catch (error) {
    console.error('Error seeding bins:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the seed function
seedBins();
