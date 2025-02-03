import { DatabaseError } from '../errors';
import { DataSource, DataSourceOptions } from "typeorm";
import { createClient } from "redis";

const getDataSourceConfig = (): DataSourceOptions => {
  const baseConfig = {
    synchronize: true,
    dropSchema: true,
    logging: false,
    entities: ["src/entities/**/*.ts"],
    migrations: ["src/migrations/**/*.ts"],
    subscribers: ["src/subscribers/**/*.ts"],
  };

  // Return data source object that uses SQLite DB when specified
  if (process.env.DB_TYPE === "sqlite") {
    return {
      ...baseConfig,
      type: "sqlite",
      database: ":memory:",
      extra: {
        pragma: "foreign_keys=ON",
      },
    };
  }

  // Return data source object that uses PostgreSQL DB by default
  return {
    ...baseConfig,
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };
};

const AppDataSource = new DataSource(getDataSourceConfig());

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database connected successfully!");
  } catch (error) {
    throw new DatabaseError("Database connection failed", {
      field: "database_initialization",
      error: error instanceof Error ? error.message: "Unknown error",
    });
  }
};

// Export both as named exports and default export
export { AppDataSource, redisClient };
export default AppDataSource; // Adding default export