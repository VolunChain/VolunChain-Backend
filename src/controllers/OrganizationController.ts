import { Request, Response } from "express";
import { OrganizationService } from "../services/OrganizationService";
import { asyncHandler } from "../utils/asyncHandler";
import { CreateOrganizationDto, UpdateOrganizationDto } from "../dtos/organization.dto";

class OrganizationController {
  private organizationService: OrganizationService;

  constructor() {
    this.organizationService = new OrganizationService();
  }

  createOrganization = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const organization = await this.organizationService.createOrganization(req.body as CreateOrganizationDto);
      res.status(201).json(organization);
    }
  );

  getOrganizationById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const organization = await this.organizationService.getOrganizationById(id);

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
      const organization = await this.organizationService.getOrganizationByEmail(email);

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
      const organization = await this.organizationService.updateOrganization(
        id,
        req.body as UpdateOrganizationDto
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
      const organizations = await this.organizationService.getAllOrganizations();
      res.status(200).json(organizations);
    }
  );
}

export default new OrganizationController();
