import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { OrganizationService } from "../../application/services/OrganizationService";

describe("OrganizationService", () => {
  let organizationService: OrganizationService;

  beforeEach(() => {
    organizationService = new OrganizationService();
  });

  it("should be defined", () => {
    expect(organizationService).toBeDefined();
  });
});
