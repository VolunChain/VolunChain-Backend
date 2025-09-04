//Import envs
import "dotenv/config";
import "reflect-metadata";

//Import express
import { Application } from "express";
import { Server } from "./Server";

//Import Prisma config
import { prisma, dbMonitor } from "./config/prisma";

//Import Swagger config
import { SwaggerConfig } from "./config/swagger.config";
import { requestLoggerMiddleware } from "./middlewares/requestLogger.middleware";
import { Logger } from "./utils/logger";

//Import redis client
import { redisClient } from "./config/redis";

//Import middlewares
import { errorHandler } from "./middlewares/errorHandler";
import { dbPerformanceMiddleware } from "./middlewares/dbPerformanceMiddleware";
import { rateLimiterMiddleware } from "@/middlewares/rateLimit.middleware";
import { traceIdMiddleware } from "./middlewares/traceId.middleware";

//Import cron manager
import { cronManager } from "./utils/cron";

// Import routes (you'll need to create this)
import { AppRoutes } from "./routes";

import fs from "fs";
import path from "path";

const globalLogger = new Logger("VolunChain");
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const ENV = process.env.NODE_ENV || "development";

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

globalLogger.info("Starting VolunChain API...", {
  environment: ENV,
  port: PORT,
  nodeVersion: process.version,
});

// Health check route function
const setupHealthRoute = (app: Application) => {
  app.get("/health", async (req, res) => {
    type ServiceStatus = {
      status: string;
      responseTime?: string;
      metrics?: {
        averageQueryTime?: number;
        activeConnections?: number;
      };
    };

    type HealthStatus = {
      status: string;
      responseTime?: string;
      services: Record<string, ServiceStatus>;
    };

    const healthStatus: HealthStatus = {
      status: "ok",
      services: {},
    };
    const startTime = Date.now();

    // Checking database
    try {
      const start_time = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const response_time = Date.now() - start_time;
      healthStatus.services.database = {
        status: "connected",
        responseTime: `${response_time}ms`,
        metrics: {
          averageQueryTime: dbMonitor.getAverageQueryTime(),
        },
      };
    } catch (err) {
      healthStatus.status = "unhealthy";
      healthStatus.services.database = { status: "disconnected" };
      console.error("Database connection failed:", err);
    }

    // Checking cache
    try {
      const start_time = Date.now();
      const redisPing = await redisClient.ping();
      const redis_response_time = Date.now() - start_time;
      healthStatus.services.cache = {
        status: redisPing === "PONG" ? "connected" : "disconnected",
        responseTime: `${redis_response_time}ms`,
      };
    } catch (err) {
      healthStatus.status = "unhealthy";
      healthStatus.services.cache = { status: "disconnected" };
      console.error("Redis connection failed:", err);
    }

    const total_responseTime = Date.now() - startTime;
    healthStatus.responseTime = `${total_responseTime}ms`;

    const httpStatus = healthStatus.status === "ok" ? 200 : 503;
    res.status(httpStatus).json(healthStatus);
  });
};

// Middleware setup functions
const setupTraceId = (app: Application) => {
  app.use(traceIdMiddleware);
};

const setupRequestLogger = (app: Application) => {
  app.use(requestLoggerMiddleware);
};

const setupDbPerformance = (app: Application) => {
  app.use(dbPerformanceMiddleware);
};

const setupRateLimit = (app: Application) => {
  app.use(rateLimiterMiddleware);
};

const setupSwagger = (app: Application) => {
  if (ENV === "development") {
    SwaggerConfig.setup(app);
    globalLogger.info(
      `📚 Swagger docs available at http://localhost:${PORT}/api/docs`
    );
  }
};

// Function to initialize Redis
const initializeRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    globalLogger.info("Redis connected successfully!");
  } catch (error) {
    globalLogger.error("Error during Redis initialization:", error ?? "error");
    throw error;
  }
};

// Initialize server function
const initializeServer = async (): Promise<void> => {
  try {
    // Connect to database
    await prisma.$connect();
    globalLogger.info("Database connected successfully!");

    // Initialize Redis
    await initializeRedis();

    // Initialize scheduled tasks
    cronManager.initCronJobs();
    globalLogger.info("Cron jobs initialized successfully!");

    // Create server instance with middlewares in order
    const server = new Server({
      port: PORT,
      environment: ENV,
      routes: AppRoutes.routes,
      middlewares: [
        setupTraceId, // Must be first
        setupRequestLogger, // After trace ID
        setupDbPerformance, // Database monitoring
        setupRateLimit, // Rate limiting
        setupSwagger, // Swagger docs (dev only)
        setupHealthRoute, // Health check endpoint
      ],
      errorHandlers: [errorHandler],
      enableCors: true,
    });

    // Start the server with error handler
    await server.start();
  } catch (error: unknown) {
    globalLogger.error("Server failed to start", error ?? "error");
    process.exit(1);
  }
};

// Start the application
initializeServer().catch((error) => {
  globalLogger.error("Failed to initialize server", error);
  process.exit(1);
});

export default initializeServer;
