const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer = null;

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      console.log('No MONGODB_URI found in environment. Starting in-memory MongoDB server...');
      mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      console.log(`In-memory MongoDB started at: ${mongoUri}`);
    }

    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected Successfully.');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
