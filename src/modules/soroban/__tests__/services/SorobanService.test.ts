import { describe, it, expect } from "@jest/globals";
import { SorobanService } from "../../application/services/SorobanService";

describe("SorobanService", () => {
  it("should create a SorobanService instance", () => {
    const service = new SorobanService();
    expect(service).toBeDefined();
  });
});
