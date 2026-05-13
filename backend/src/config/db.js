const mongoose = require('mongoose');
const appConfig = require('./env');

/**
 * Connects to MongoDB using the resolved URI from AppConfig.
 * Throws if no URI is configured.
 */
const connectDB = async () => {
  if (!appConfig.mongoUri) {
    throw new Error(
      'MongoDB URI is missing. Set MONGO_URI_DEV/MONGO_URI_PROD or MONGO_URI in your environment.'
    );
  }

  await mongoose.connect(appConfig.mongoUri);
  console.log(`[DB] MongoDB connected (${appConfig.env})`);
};

module.exports = connectDB;
