import "dotenv/config";
import "reflect-metadata";
import express from "express";
import { prisma } from "./config/prisma";
import { SwaggerConfig } from "./config/swagger.config";
import { redisClient } from "./config/redis";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./modules/user/user.route";

const app = express();
const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || "development";

console.info("Starting VolunChain API...");

// Middleware for parsing JSON requests
app.use(express.json());
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

app.use("/users", userRoutes);

// Initialize the database and start the server
prisma
  .$connect()
  .then(() => {
    console.log("Database connected successfully!");

    // initialize Redis
    initializeRedis()
      .then(() => {
        app.listen(PORT, () => {
          console.log(`Server is running on http://localhost:${PORT}`);
          if (ENV === "development") {
            console.log(
              `📚 Swagger docs available at http://localhost:${PORT}/api/docs`
            );
          }
        });
      })
      .catch((error: any) => {
        console.error(
          "Server failed to start due to Redis initialization error:",
          error
        );
      });
  })
  .catch((error: any) => {
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
