require('dotenv').config();

/**
 * Get environment variable with optional default value
 * @param {string} name - Environment variable name
 * @param {string} defaultValue - Default value (optional)
 * @returns {string} Environment variable value
 */
const getEnvVar = (name, defaultValue = null) => {
  const value = process.env[name];
  if (value === undefined || value === null) {
    if (defaultValue !== null) {
      console.warn(`[WARN] ${name} is not set. Using default value.`);
      return defaultValue;
    }
    throw new Error(`[ERROR] Required environment variable ${name} is not set.`);
  }
  return value;
};

/**
 * Validate production configuration
 */
const validateProductionConfig = () => {
  if (process.env.NODE_ENV === 'production') {
    const criticalVars = ['JWT_SECRET', 'DB_PASSWORD'];
    for (const varName of criticalVars) {
      const value = process.env[varName];
      if (!value || 
          value.includes('CHANGE_ME') || 
          value.includes('default') || 
          value.includes('dev-') ||
          value.length < 32) {
        throw new Error(`[ERROR] ${varName} is not securely configured for production.`);
      }
    }
  }
};

// Configuration object
const config = {
  // Server settings
  server: {
    port: parseInt(getEnvVar('PORT', '3000'), 10),
    env: getEnvVar('NODE_ENV', 'development')
  },

  // Database settings
  database: {
    host: getEnvVar('DB_HOST', 'localhost'),
    port: parseInt(getEnvVar('DB_PORT', '3306'), 10),
    user: getEnvVar('DB_USER', 'root'),
    password: getEnvVar('DB_PASSWORD'),  // 보안: 기본값 제거, 필수 환경변수
    name: getEnvVar('DB_NAME', 'safety_experience'),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  },

  // JWT settings
  jwt: {
    secret: getEnvVar('JWT_SECRET'),
    expiresIn: getEnvVar('JWT_EXPIRES_IN', '24h'),
    refreshExpiresIn: getEnvVar('JWT_REFRESH_EXPIRES_IN', '7d')
  },

  // Face recognition service
  faceRecognition: {
    url: getEnvVar('FACE_RECOGNITION_URL', 'http://localhost:5000')
  },

  // CORS settings
  cors: {
    origin: process.env.NODE_ENV === 'development'
      ? ['http://localhost:3001', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175']
      : getEnvVar('CORS_ORIGIN', 'http://localhost:3001')
  }
};

// Run production validation
validateProductionConfig();

module.exports = config;
