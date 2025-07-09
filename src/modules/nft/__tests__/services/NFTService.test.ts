import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import NFTService from "../../application/services/NFTService";

describe("NFTService", () => {
  let nftService: typeof NFTService;

  beforeEach(() => {
    nftService = NFTService;
  });

  it("should be defined", () => {
    expect(nftService).toBeDefined();
  });
});
