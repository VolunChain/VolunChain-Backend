import { get } from "env-var";

// Use 'get' directly instead of 'env.get'
export const env = {
  NODE_ENV: get("NODE_ENV").default("development").asString(),
  PORT: get("PORT").default("3000").asPortNumber(),
  LOG_LEVEL: get("LOG_LEVEL").default("debug").asString(),

  // Database
  DATABASE_URL: get("DATABASE_URL").required().asUrlString(),

  // JWT / Security
  JWT_SECRET: get("JWT_SECRET").required().asString(),

  // Supabase
  SUPABASE_URL: get("SUPABASE_URL").required().asUrlString(),
  SUPABASE_ANON_KEY: get("SUPABASE_ANON_KEY").required().asString(),

  // Redis
  REDIS_URL: get("REDIS_URL").default("redis://localhost:6379").asString(),

  // Stellar / Horizon
  HORIZON_URL: get("HORIZON_URL")
    .default("https://horizon-testnet.stellar.org")
    .asUrlString(),
  STELLAR_NETWORK: get("STELLAR_NETWORK").default("testnet").asString(),

  // Email
  EMAIL_SERVICE: get("EMAIL_SERVICE").default("gmail").asString(),
  EMAIL_USER: get("EMAIL_USER").required().asString(),
  EMAIL_PASSWORD: get("EMAIL_PASSWORD").required().asString(),
  BASE_URL: get("BASE_URL").default("http://localhost:3000").asUrlString(),

  // Soroban
  SOROBAN_RPC_URL: get("SOROBAN_RPC_URL").required().asUrlString(),
  SOROBAN_SERVER_SECRET: get("SOROBAN_SERVER_SECRET").required().asString(),
};
