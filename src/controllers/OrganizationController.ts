import { Request, Response } from "express";
import { OrganizationService } from "../modules/organization/application/services/OrganizationService";
import { asyncHandler } from "../utils/asyncHandler";

class OrganizationController {
  private organizationService: OrganizationService;

  constructor() {
    this.organizationService = new OrganizationService();
  }

  createOrganization = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { name, email, password, category, wallet } = req.body;
      const organization = await this.organizationService.createOrganization(
        name,
        email,
        password,
        category,
        wallet
      );
      res.status(201).json(organization);
    }
  );

  getOrganizationById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const organization =
        await this.organizationService.getOrganizationById(id);

      if (!organization) {
        res.status(404).json({ error: "Organization not found" });
        return;
      }

      res.status(200).json(organization);
    }
  );

  getOrganizationByEmail = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { email } = req.params;
      const organization =
        await this.organizationService.getOrganizationByEmail(email);

      if (!organization) {
        res.status(404).json({ error: "Organization not found" });
        return;
      }

      res.status(200).json(organization);
    }
  );

  updateOrganization = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const updateData = req.body;

      const organization = await this.organizationService.updateOrganization(
        id,
        updateData
      );
      res.status(200).json(organization);
    }
  );

  deleteOrganization = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      await this.organizationService.deleteOrganization(id);
      res.status(204).send();
    }
  );

  getAllOrganizations = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const organizations =
        await this.organizationService.getAllOrganizations();
      res.status(200).json(organizations);
    }
  );
}

export default new OrganizationController();
