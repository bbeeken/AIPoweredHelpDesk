import dotenv from 'dotenv';

dotenv.config();

export const config = {
  db: {
    server: process.env.DB_SERVER || 'localhost',
    name: process.env.DB_NAME || 'HelpDeskDB',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change_me',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'change_me_refresh',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173'
  }
};
