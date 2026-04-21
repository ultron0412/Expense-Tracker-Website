const dotenv = require("dotenv");

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";
const insecureJwtSecrets = new Set([
  "dev-insecure-secret-change-me",
  "expense-tracker-secret-key-fixed-2024",
  "replace_with_a_long_secure_secret",
  "changeme",
  "secret",
]);

const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET || (isTest ? "test-secret-key" : ""),
  clientOrigins: (process.env.CLIENT_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 300),
};

if (!config.mongoUri) {
  throw new Error("MONGO_URI is missing in environment variables");
}

if (!config.jwtSecret) {
  throw new Error("JWT_SECRET is missing in environment variables");
}

if (isProduction && config.jwtSecret.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters in production");
}

if (isProduction && insecureJwtSecrets.has(config.jwtSecret)) {
  throw new Error("JWT_SECRET uses an insecure value in production");
}

module.exports = config;
