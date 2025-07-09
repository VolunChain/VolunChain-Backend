import "dotenv/config";
import "reflect-metadata";
import express from "express";
import { prisma, dbMonitor } from "./config/prisma";
import { SwaggerConfig } from "./config/swagger.config";
import { redisClient } from "./config/redis";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler";
import { dbPerformanceMiddleware } from "./middlewares/dbPerformanceMiddleware";
import { setupRateLimiting } from "./middleware/rateLimitMiddleware";
import { cronManager } from "./utils/cron";
import apiRouter from "./routes";
import { traceIdMiddleware } from "./middlewares/traceId.middleware";
import { requestLoggerMiddleware } from "./middlewares/requestLogger.middleware";
import authRoutes from "./routes/authRoutes";
import router from "./routes/nftRoutes";
import userRoutes from "./routes/userRoutes";
import metricsRoutes from "./modules/metrics/routes/metrics.routes";
import certificateRoutes from "./routes/certificatesRoutes";
import volunteerRoutes from "./routes/VolunteerRoutes";
import projectRoutes from "./routes/ProjectRoutes";
import organizationRoutes from "./routes/OrganizationRoutes";
import messageRoutes from "./modules/messaging/routes/messaging.routes";
import testRoutes from "./routes/testRoutes";
import { globalLogger } from "./modules/shared/application/services/LoggerService";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || "development";

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

globalLogger.info("Starting VolunChain API...", undefined, {
  environment: ENV,
  port: PORT,
  nodeVersion: process.version,
});

// Trace ID middleware (must be first to ensure all requests have trace IDs)
app.use(traceIdMiddleware);

// Request logging middleware (after trace ID)
app.use(requestLoggerMiddleware);

// Middleware for parsing JSON requests
app.use(express.json());

// Database performance monitoring
app.use(dbPerformanceMiddleware);

// Rate limiting
setupRateLimiting(app);

app.use(cors());

// Setup Swagger only for development environment
if (ENV === "development") {
  SwaggerConfig.setup(app);
}

// Health check route
app.get("/", (req, res) => {
  res.send("VolunChain API is running!");
});

// Error handler middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    errorHandler(err, req, res, next);
  }
);

// Health check route
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

// API Routes with versioning
app.use("/api", apiRouter);

// Authentication routes
app.use("/auth", authRoutes);

// NFT routes
app.use("/nft", router);

// User routes
app.use("/users", userRoutes);

// Metrics routes
app.use("/metrics", metricsRoutes);

// Other routes
app.use("/certificate", certificateRoutes);
app.use("/projects", projectRoutes);
app.use("/volunteers", volunteerRoutes);
app.use("/organizations", organizationRoutes);
router.use("/messages", messageRoutes);

// Test routes
app.use("/test", testRoutes);

// Initialize the database and start the server
prisma
  .$connect()
  .then(() => {
    globalLogger.info("Database connected successfully!");

    // initialize Redis
    initializeRedis()
      .then(() => {
        globalLogger.info("Redis connected successfully!");

        // Initialize scheduled tasks
        cronManager.initCronJobs();
        globalLogger.info("Cron jobs initialized successfully!");

        app.listen(PORT, () => {
          globalLogger.info(
            `Server is running on http://localhost:${PORT}`,
            undefined,
            {
              port: PORT,
              environment: ENV,
            }
          );

          if (ENV === "development") {
            globalLogger.info(
              `📚 Swagger docs available at http://localhost:${PORT}/api/docs`
            );
          }
        });
      })
      .catch((error) => {
        globalLogger.error(
          "Server failed to start due to Redis initialization error",
          error
        );
        process.exit(1);
      });
  })
  .catch((error: Error) => {
    globalLogger.error("Error during database initialization", error);
    process.exit(1);
  });

// Function to initialize Redis
const initializeRedis = async () => {
  try {
    await redisClient.connect();
    console.log("Redis connected successfully!");
  } catch (error) {
    console.error("Error during Redis initialization:", error);
  }
};

export default app;
