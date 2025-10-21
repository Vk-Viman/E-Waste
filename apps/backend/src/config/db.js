// Database config (Mongoose) with retry on transient DNS/SRV failures
const mongoose = require('mongoose');

mongoose.set('strictQuery', true);

// Optional: use an in-memory MongoDB for local development/testing when
// USE_IN_MEMORY_MONGO=true. Lazy-load the dependency so production builds
// don't require it unless explicitly enabled.
const useInMemoryMongo = process.env.USE_IN_MEMORY_MONGO === 'true';
let mongoServer;

async function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function connectDB({ retries = Infinity, delayMs = 3000 } = {}) {
  // Prefer explicit environment variable; fall back to localhost for development
  let uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    uri = 'mongodb://127.0.0.1:27017/ecocollect_dev';
    console.warn('MONGO_URI not set — falling back to local MongoDB at', uri, "(set MONGO_URI in .env to override)");
  }
  const dbName = process.env.MONGO_DB_NAME || 'EcoCollectDB';

  const opts = {
    dbName,
    serverSelectionTimeoutMS: 5000,
    family: 4, // prefer IPv4 to avoid some Windows DNS issues
  };

  while (true) {
    try {
      // If requested, start an in-memory Mongo and use its URI
      if (useInMemoryMongo && !mongoServer) {
        // eslint-disable-next-line global-require
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongoServer = await MongoMemoryServer.create();
        uri = mongoServer.getUri();
        console.warn('Using in-memory MongoDB instance for development/tests');
      }
      await mongoose.connect(uri, opts);
      console.log('MongoDB connected');
      return mongoose.connection;
    } catch (err) {
      const code = err && (err.code || err.name);
      const transient =
        code === 'ENOTFOUND' ||
        code === 'ETIMEDOUT' ||
        code === 'MongoServerSelectionError' ||
        /querySrv/i.test(String(err.message || ''));
      if (!transient || retries === 0) {
        console.error('MongoDB connection error (fatal):', err.message || err);
        throw err;
      }
      if (retries !== Infinity) retries -= 1;
      console.warn('MongoDB connection failed, retrying in', delayMs, 'ms... Reason:', err.message);
      await sleep(delayMs);
    }
  }
}

module.exports = connectDB;
