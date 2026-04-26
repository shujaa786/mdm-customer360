export const ENV = {
  STAGING: 'STAGING',
  PROD: 'PROD'
};

export function getEnv() {
  const rawEnv = process.env.NEXT_PUBLIC_ENV || process.env.NEXT_PUBLIC_APP_ENV || 'STAGING';

  if (rawEnv === 'PROD' || rawEnv === 'production') {
    return ENV.PROD;
  }

  if (rawEnv === 'STAGING' || rawEnv === 'development') {
    return ENV.STAGING;
  }

  throw new Error(`Unsupported NEXT_PUBLIC_ENV "${rawEnv}". Use STAGING or PROD.`);
}

export function getApiBaseUrl() {
  const env = getEnv();

  return env === ENV.PROD
    ? process.env.NEXT_PUBLIC_API_URL_PROD
    : process.env.NEXT_PUBLIC_API_URL_STAGING;
}

export function getSocketUrl() {
  const env = getEnv();

  return env === ENV.PROD
    ? process.env.NEXT_PUBLIC_SOCKET_URL_PROD
    : process.env.NEXT_PUBLIC_SOCKET_URL_STAGING;
}
