/**
 * Centralized environment configuration.
 * Resolves environment-specific variables once at startup.
 */
class AppConfig {
  constructor() {
    const rawEnv = (process.env.APP_ENV || process.env.NODE_ENV || 'STAGING').toUpperCase();
    this.isProd = rawEnv === 'PROD' || rawEnv === 'PRODUCTION';
    this.env = this.isProd ? 'PROD' : 'STAGING';

    this.port = this._resolvePort();
    this.mongoUri = this._resolveMongoUri();
    this.frontendOrigin = this._resolveFrontendOrigin();
    this.ingestMaxFileMb = parseInt(process.env.INGEST_MAX_FILE_MB, 10) || 5;
    this.ingestCsvPath = process.env.INGEST_CSV_PATH || null;
  }

  _resolvePort() {
    const envPort = this.isProd
      ? process.env.PORT_PROD || process.env.PORT_PRODUCTION
      : process.env.PORT_STAGING || process.env.PORT_DEV;
    return envPort || process.env.PORT || 5000;
  }

  _resolveMongoUri() {
    const uri = this.isProd
      ? process.env.MONGO_URI_PROD || process.env.MONGO_URI_PRODUCTION
      : process.env.MONGO_URI_STAGING || process.env.MONGO_URI_DEV;
    return uri || process.env.MONGO_URI || null;
  }

  _resolveFrontendOrigin() {
    const origin = this.isProd
      ? process.env.FRONTEND_URL_PROD || process.env.FRONTEND_URL_PRODUCTION
      : process.env.FRONTEND_URL_STAGING || process.env.FRONTEND_URL_DEV;
    return origin || '*';
  }
}

// Singleton — resolved once at process start
const appConfig = new AppConfig();

module.exports = appConfig;
