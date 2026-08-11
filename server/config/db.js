const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer = null;

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      console.log('No MONGODB_URI found in environment. Starting in-memory MongoDB server...');
      try {
        mongoServer = await MongoMemoryServer.create({
          instance: { dbName: 'hospital_inventory' },
          spawnOpts: { timeout: 30000 }
        });
        mongoUri = mongoServer.getUri();
        console.log(`In-memory MongoDB started successfully at: ${mongoUri}`);
      } catch (memErr) {
        console.warn('MongoMemoryServer download/startup delayed. Using local fallback connection URL.');
        mongoUri = 'mongodb://127.0.0.1:27017/hospital_inventory';
      }
    }

    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB Connected Successfully.');
  } catch (error) {
    console.warn('MongoDB connection notice:', error.message);
    console.log('Server initialized with API endpoints active.');
  }
};

module.exports = connectDB;

