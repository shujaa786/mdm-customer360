const mongoose = require('mongoose');

const connectDB = async () => {
  const rawEnv = (process.env.APP_ENV || process.env.NODE_ENV || 'STAGING').toUpperCase();
  const isProd = rawEnv === 'PROD' || rawEnv === 'PRODUCTION';

  const mongoUri = isProd
    ? (process.env.MONGO_URI_PROD || process.env.MONGO_URI_PRODUCTION)
    : (process.env.MONGO_URI_STAGING || process.env.MONGO_URI_DEV);

  const finalMongoUri = mongoUri || process.env.MONGO_URI;

  if (!finalMongoUri) {
    throw new Error('MongoDB URI is missing. Set MONGO_URI_DEV/MONGO_URI_PROD or MONGO_URI');
  }

  await mongoose.connect(finalMongoUri);
  console.log('MongoDB connected');
};

module.exports = connectDB;