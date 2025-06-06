import "dotenv/config";
import "reflect-metadata";
import express from "express";
import { prisma, dbMonitor } from "./config/prisma";
import { SwaggerConfig } from "./config/swagger.config";
import { redisClient } from "./config/redis";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler";
import { dbPerformanceMiddleware } from "./middlewares/dbPerformanceMiddleware";
import authRoutes from "./routes/authRoutes";
import router from "./routes/nftRoutes";
import userRoutes from "./routes/userRoutes";
import metricsRoutes from "./modules/metrics/routes/metrics.routes";
import { setupRateLimiting } from "./middleware/rateLimitMiddleware";
import { cronManager } from "./utils/cron";
import certificateRoutes from "./routes/certificatesRoutes";
import volunteerRoutes from "./routes/VolunteerRoutes";
import projectRoutes from "./routes/ProjectRoutes";
import organizationRoutes from "./routes/OrganizationRoutes";
import testRoutes from "./routes/testRoutes";

const app = express();
const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || "development";

console.info("Starting VolunChain API...");

// Middleware for parsing JSON requests
app.use(express.json());

// Database performance monitoring
app.use(dbPerformanceMiddleware);

//Rate limiting
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

// Authentication routes
app.use("/auth", authRoutes);

// This is for NFT
app.use("/nft", router);

app.use("/users", userRoutes);

// Metrics routes
app.use("/metrics", metricsRoutes);

// Other routes
app.use("/certificate", certificateRoutes);
app.use("/projects", projectRoutes);
app.use("/volunteers", volunteerRoutes);
app.use("/organizations", organizationRoutes);

// Test routes
app.use("/test", testRoutes);

// Initialize the database and start the server
prisma
  .$connect()
  .then(() => {
    console.log("Database connected successfully!");

    // initialize Redis
    initializeRedis()
      .then(() => {
        // Inicializar tareas programadas
        cronManager.initCronJobs();

        app.listen(PORT, () => {
          console.log(`Server is running on http://localhost:${PORT}`);
          if (ENV === "development") {
            console.log(
              `📚 Swagger docs available at http://localhost:${PORT}/api/docs`
            );
          }
        });
      })
      .catch((error) => {
        console.error(
          "Server failed to start due to Redis initialization error:",
          error
        );
      });
  })
  .catch((error: Error) => {
    console.error("Error during database initialization:", error);
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
