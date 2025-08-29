import { Request, Response } from "express";
import { asyncHandler } from "../../../shared/infrastructure/utils/async-handler";
import { CreateOrganizationUseCase } from "../../application/use-cases/create-organization.use-case";
import { GetOrganizationByIdUseCase } from "../../application/use-cases/get-organization-by-id.use-case";
import { UpdateOrganizationUseCase } from "../../application/use-cases/update-organization.use-case";
import { DeleteOrganizationUseCase } from "../../application/use-cases/delete-organization.use-case";
import { GetAllOrganizationsUseCase } from "../../application/use-cases/get-all-organizations.use-case";
import { CreateOrganizationDto, UpdateOrganizationDto } from "../dto";

import { OrganizationNotFoundException } from "../../domain/exceptions/organization-not-found.exception";
import { PaginationQueryDto } from "@/shared/dto/base.dto";

export class OrganizationController {
  constructor(
    private readonly createOrganizationUseCase: CreateOrganizationUseCase,
    private readonly getOrganizationByIdUseCase: GetOrganizationByIdUseCase,
    private readonly updateOrganizationUseCase: UpdateOrganizationUseCase,
    private readonly deleteOrganizationUseCase: DeleteOrganizationUseCase,
    private readonly getAllOrganizationsUseCase: GetAllOrganizationsUseCase
  ) {}

  createOrganization = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const organizationInformation: CreateOrganizationDto = req.body;

      const organization = await this.createOrganizationUseCase.execute(
        organizationInformation
      );

      res.status(201).json({
        success: true,
        data: organization,
        message: "Organization created successfully",
      });
    }
  );

  getOrganizationById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;

      try {
        const organization = await this.getOrganizationByIdUseCase.execute(id);

        res.status(200).json({
          success: true,
          data: organization,
        });
      } catch (error: unknown) {
        if (error instanceof OrganizationNotFoundException) {
          res.status(404).json({
            success: false,
            error: error.message,
          });
          return;
        }
        throw error;
      }
    }
  );

  updateOrganization = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const { ...organizationInformation }: UpdateOrganizationDto = req.body;

      try {
        const organization = await this.updateOrganizationUseCase.execute(
          id,
          organizationInformation
        );

        res.status(200).json({
          success: true,
          data: organization,
          message: "Organization updated successfully",
        });
      } catch (error: unknown) {
        if (error instanceof OrganizationNotFoundException) {
          res.status(404).json({
            success: false,
            error: error.message,
          });
          return;
        }
        throw error;
      }
    }
  );

  deleteOrganization = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;

      try {
        await this.deleteOrganizationUseCase.execute(id);

        res.status(204).send();
      } catch (error: unknown) {
        if (error instanceof OrganizationNotFoundException) {
          res.status(404).json({
            success: false,
            error: error.message,
          });
          return;
        }
        throw error;
      }
    }
  );

  getAllOrganizations = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { page, limit, search }: PaginationQueryDto = req.query;

      const organizations = await this.getAllOrganizationsUseCase.execute({
        page: page || 1,
        limit: limit || 10,
        search,
      });

      res.status(200).json({
        success: true,
        data: organizations,
        pagination: {
          page: page || 1,
          limit: limit || 10,
          total: organizations.length,
        },
      });
    }
  );
}
