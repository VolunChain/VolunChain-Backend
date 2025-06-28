import { describe, it, expect } from "@jest/globals";
import { LoggerService } from "../../application/services/LoggerService";

describe("LoggerService", () => {
  it("should create a logger instance", () => {
    const logger = new LoggerService("TEST");
    expect(logger).toBeDefined();
    expect(logger.child("CHILD")).toBeInstanceOf(LoggerService);
  });
});
