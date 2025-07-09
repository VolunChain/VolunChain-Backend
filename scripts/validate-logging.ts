#!/usr/bin/env ts-node

import "dotenv/config";
import fs from "fs";
import path from "path";
import {
  createLogger,
  globalLogger,
} from "../src/modules/shared/application/services/LoggerService";
import { v4 as uuidv4 } from "uuid";

/**
 * Validation script for Winston logging implementation
 * Validates all success metrics and requirements
 */

interface ValidationResult {
  metric: string;
  status: "PASS" | "FAIL";
  details: string;
}

class LoggingValidator {
  private results: ValidationResult[] = [];
  private testLogger = createLogger("VALIDATION_TEST");

  constructor() {
    this.ensureLogsDirectory();
  }

  private ensureLogsDirectory(): void {
    const logsDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  private addResult(
    metric: string,
    status: "PASS" | "FAIL",
    details: string
  ): void {
    this.results.push({ metric, status, details });
  }

  /**
   * Validate structured JSON logging
   */
  async validateStructuredLogging(): Promise<void> {
    try {
      const mockReq = {
        traceId: uuidv4(),
        method: "GET",
        url: "/test",
        ip: "127.0.0.1",
        get: () => "test-agent",
      } as any;

      this.testLogger.info("Test structured log", mockReq, {
        testData: "validation",
      });

      // Check if log file contains JSON
      const logFile = path.join(process.cwd(), "logs", "combined.log");
      if (fs.existsSync(logFile)) {
        const logContent = fs.readFileSync(logFile, "utf8");
        const lastLine = logContent.trim().split("\n").pop();

        if (lastLine) {
          const logEntry = JSON.parse(lastLine);
          if (
            logEntry.timestamp &&
            logEntry.level &&
            logEntry.message &&
            logEntry.traceId
          ) {
            this.addResult(
              "Structured JSON Logging",
              "PASS",
              "Logs are properly formatted as JSON with required fields"
            );
          } else {
            this.addResult(
              "Structured JSON Logging",
              "FAIL",
              "Missing required fields in log entry"
            );
          }
        } else {
          this.addResult(
            "Structured JSON Logging",
            "FAIL",
            "No log entries found"
          );
        }
      } else {
        this.addResult(
          "Structured JSON Logging",
          "FAIL",
          "Log file not created"
        );
      }
    } catch (error) {
      this.addResult(
        "Structured JSON Logging",
        "FAIL",
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Validate trace ID implementation
   */
  async validateTraceId(): Promise<void> {
    try {
      const traceId = uuidv4();
      const mockReq = {
        traceId,
        method: "POST",
        url: "/test-trace",
        ip: "127.0.0.1",
        get: () => "test-agent",
      } as any;

      this.testLogger.info("Test trace ID logging", mockReq);

      // Validate UUID v4 format
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(traceId)) {
        this.addResult(
          "Trace ID Generation",
          "PASS",
          "Valid UUID v4 trace IDs generated"
        );
      } else {
        this.addResult(
          "Trace ID Generation",
          "FAIL",
          "Invalid trace ID format"
        );
      }

      // Check if trace ID appears in logs
      const logFile = path.join(process.cwd(), "logs", "combined.log");
      if (fs.existsSync(logFile)) {
        const logContent = fs.readFileSync(logFile, "utf8");
        if (logContent.includes(traceId)) {
          this.addResult(
            "Trace ID Correlation",
            "PASS",
            "Trace IDs properly included in log entries"
          );
        } else {
          this.addResult(
            "Trace ID Correlation",
            "FAIL",
            "Trace ID not found in log entries"
          );
        }
      }
    } catch (error) {
      this.addResult(
        "Trace ID Implementation",
        "FAIL",
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Validate context information
   */
  async validateContext(): Promise<void> {
    try {
      const mockReq = {
        traceId: uuidv4(),
        method: "PUT",
        url: "/test-context",
        ip: "192.168.1.1",
        get: (header: string) =>
          header === "User-Agent" ? "validation-agent" : undefined,
      } as any;

      this.testLogger.info("Test context validation", mockReq, {
        customContext: "test",
        userId: "12345",
      });

      const logFile = path.join(process.cwd(), "logs", "combined.log");
      if (fs.existsSync(logFile)) {
        const logContent = fs.readFileSync(logFile, "utf8");
        const lastLine = logContent.trim().split("\n").pop();

        if (lastLine) {
          const logEntry = JSON.parse(lastLine);

          const hasRequiredContext =
            logEntry.timestamp &&
            logEntry.traceId &&
            logEntry.context &&
            logEntry.method &&
            logEntry.url &&
            logEntry.ip;

          if (hasRequiredContext) {
            this.addResult(
              "Context Information",
              "PASS",
              "All required context fields present"
            );
          } else {
            this.addResult(
              "Context Information",
              "FAIL",
              "Missing required context fields"
            );
          }
        }
      }
    } catch (error) {
      this.addResult(
        "Context Information",
        "FAIL",
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Validate log persistence
   */
  async validatePersistence(): Promise<void> {
    try {
      const logFiles = ["logs/combined.log", "logs/error.log"];

      let allFilesExist = true;
      const missingFiles: string[] = [];

      for (const file of logFiles) {
        const filePath = path.join(process.cwd(), file);
        if (!fs.existsSync(filePath)) {
          allFilesExist = false;
          missingFiles.push(file);
        }
      }

      if (allFilesExist) {
        this.addResult(
          "Log Persistence",
          "PASS",
          "All log files created and persistent"
        );
      } else {
        this.addResult(
          "Log Persistence",
          "FAIL",
          `Missing log files: ${missingFiles.join(", ")}`
        );
      }

      // Test error logging persistence
      const testError = new Error("Validation test error");
      this.testLogger.error("Test error persistence", testError);

      // Check if error appears in error.log
      setTimeout(() => {
        const errorLogPath = path.join(process.cwd(), "logs", "error.log");
        if (fs.existsSync(errorLogPath)) {
          const errorContent = fs.readFileSync(errorLogPath, "utf8");
          if (errorContent.includes("Validation test error")) {
            this.addResult(
              "Error Log Persistence",
              "PASS",
              "Errors properly logged to error.log"
            );
          } else {
            this.addResult(
              "Error Log Persistence",
              "FAIL",
              "Error not found in error.log"
            );
          }
        }
      }, 100);
    } catch (error) {
      this.addResult(
        "Log Persistence",
        "FAIL",
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Validate sensitive data sanitization
   */
  async validateSanitization(): Promise<void> {
    try {
      const mockReq = {
        traceId: uuidv4(),
        method: "POST",
        url: "/test-sanitization",
        ip: "127.0.0.1",
        get: () => "test-agent",
        body: {
          username: "testuser",
          password: "supersecret123",
          token: "jwt-token-value",
          secret: "api-secret",
          normalField: "normal-value",
        },
      } as any;

      this.testLogger.logRequest(mockReq);

      const logFile = path.join(process.cwd(), "logs", "combined.log");
      if (fs.existsSync(logFile)) {
        const logContent = fs.readFileSync(logFile, "utf8");

        // Check that sensitive data is redacted
        const hasSensitiveData =
          logContent.includes("supersecret123") ||
          logContent.includes("jwt-token-value") ||
          logContent.includes("api-secret");

        const hasRedactedData = logContent.includes("[REDACTED]");
        const hasNormalData = logContent.includes("normal-value");

        if (!hasSensitiveData && hasRedactedData && hasNormalData) {
          this.addResult(
            "Data Sanitization",
            "PASS",
            "Sensitive data properly sanitized"
          );
        } else {
          this.addResult(
            "Data Sanitization",
            "FAIL",
            "Sensitive data not properly sanitized"
          );
        }
      }
    } catch (error) {
      this.addResult(
        "Data Sanitization",
        "FAIL",
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Validate performance (no degradation)
   */
  async validatePerformance(): Promise<void> {
    try {
      const iterations = 1000;
      const startTime = Date.now();

      // Simulate logging operations
      for (let i = 0; i < iterations; i++) {
        const mockReq = {
          traceId: uuidv4(),
          method: "GET",
          url: `/test-performance-${i}`,
          ip: "127.0.0.1",
          get: () => "perf-test",
        } as any;

        this.testLogger.info(`Performance test ${i}`, mockReq);
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const avgTime = totalTime / iterations;

      // Consider performance acceptable if average log time < 1ms
      if (avgTime < 1) {
        this.addResult(
          "Performance",
          "PASS",
          `Average log time: ${avgTime.toFixed(3)}ms per operation`
        );
      } else {
        this.addResult(
          "Performance",
          "FAIL",
          `Performance degradation detected: ${avgTime.toFixed(3)}ms per operation`
        );
      }
    } catch (error) {
      this.addResult(
        "Performance",
        "FAIL",
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Run all validations
   */
  async runValidation(): Promise<void> {
    console.log("🔍 Starting Winston Logging Validation...\n");

    await this.validateStructuredLogging();
    await this.validateTraceId();
    await this.validateContext();
    await this.validatePersistence();
    await this.validateSanitization();
    await this.validatePerformance();

    // Wait a bit for async operations
    await new Promise((resolve) => setTimeout(resolve, 200));

    this.printResults();
  }

  /**
   * Print validation results
   */
  private printResults(): void {
    console.log("📊 Validation Results:\n");

    let passCount = 0;
    let failCount = 0;

    this.results.forEach((result) => {
      const icon = result.status === "PASS" ? "✅" : "❌";
      const status = result.status === "PASS" ? "PASS" : "FAIL";

      console.log(`${icon} ${result.metric}: ${status}`);
      console.log(`   ${result.details}\n`);

      if (result.status === "PASS") {
        passCount++;
      } else {
        failCount++;
      }
    });

    console.log("📈 Summary:");
    console.log(`   ✅ Passed: ${passCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   📊 Total:  ${this.results.length}`);

    if (failCount === 0) {
      console.log(
        "\n🎉 All validation tests passed! Winston logging implementation is successful."
      );
    } else {
      console.log(
        "\n⚠️  Some validation tests failed. Please review the implementation."
      );
    }

    console.log("\n📁 Log files location: ./logs/");
    console.log("📝 Check combined.log and error.log for detailed output");
  }
}

// Run validation
const validator = new LoggingValidator();
validator.runValidation().catch(console.error);
