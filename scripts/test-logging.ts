#!/usr/bin/env ts-node

import "dotenv/config";
import express from "express";
import { traceIdMiddleware } from "../src/middlewares/traceId.middleware";
import { requestLoggerMiddleware } from "../src/middlewares/requestLogger.middleware";
import {
  globalLogger,
  createLogger,
} from "../src/modules/shared/application/services/LoggerService";
import fs from "fs";
import path from "path";

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const app = express();
const PORT = 3001; // Use different port to avoid conflicts

// Create a logger for this test
const testLogger = createLogger("LOGGING_TEST");

// Middleware setup
app.use(express.json());
app.use(traceIdMiddleware);
app.use(requestLoggerMiddleware);

// Test routes
app.get("/", (req, res) => {
  testLogger.info("Health check endpoint accessed", req);
  res.json({
    message: "Winston logging test server is running!",
    traceId: req.traceId,
    timestamp: new Date().toISOString(),
  });
});

app.post("/test-log", (req, res) => {
  testLogger.info("Test log endpoint accessed", req, {
    requestBody: req.body,
    customData: "This is a test log entry",
  });

  res.json({
    message: "Log entry created successfully",
    traceId: req.traceId,
    loggedData: req.body,
  });
});

app.get("/test-error", (req, res) => {
  const testError = new Error("This is a test error for logging");
  testLogger.error("Test error occurred", testError, req, {
    errorContext: "Intentional test error",
    additionalInfo: "This error was generated for testing purposes",
  });

  res.status(500).json({
    error: "Test error generated",
    traceId: req.traceId,
    message: "Check the logs for error details",
  });
});

app.post("/test-sensitive-data", (req, res) => {
  // This will test our data sanitization
  testLogger.info("Testing sensitive data sanitization", req);

  res.json({
    message: "Sensitive data logged (check logs for sanitization)",
    traceId: req.traceId,
  });
});

// Start the test server
app.listen(PORT, () => {
  globalLogger.info(
    `Winston logging test server started on port ${PORT}`,
    undefined,
    {
      environment: process.env.NODE_ENV || "development",
      testMode: true,
    }
  );

  console.log(`\n🚀 Winston Logging Test Server Started!`);
  console.log(`📍 Server running at: http://localhost:${PORT}`);
  console.log(`📁 Logs directory: ${logsDir}`);
  console.log(`\n📋 Test Endpoints:`);
  console.log(`   GET  /                    - Health check with trace ID`);
  console.log(`   POST /test-log           - Test structured logging`);
  console.log(`   GET  /test-error         - Test error logging`);
  console.log(`   POST /test-sensitive-data - Test data sanitization`);
  console.log(`\n📊 Example requests:`);
  console.log(`   curl http://localhost:${PORT}/`);
  console.log(
    `   curl -X POST http://localhost:${PORT}/test-log -H "Content-Type: application/json" -d '{"username":"test","password":"secret123","data":"normal"}'`
  );
  console.log(`   curl http://localhost:${PORT}/test-error`);
  console.log(`\n📝 Check the logs directory for output files:`);
  console.log(`   - logs/combined.log (all logs)`);
  console.log(`   - logs/error.log (errors only)`);
  console.log(`\nPress Ctrl+C to stop the server\n`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  globalLogger.info("Shutting down Winston logging test server");
  console.log("\n👋 Winston logging test server stopped");
  process.exit(0);
});
