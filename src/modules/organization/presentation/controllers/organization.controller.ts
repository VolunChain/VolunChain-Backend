import { Request, Response } from "express";
import { asyncHandler } from "../../../shared/infrastructure/utils/async-handler";
import { CreateOrganizationUseCase } from "../../application/use-cases/create-organization.usecase";
import { GetOrganizationByIdUseCase } from "../../application/use-cases/get-organization-by-id.usecase";
import { UpdateOrganizationUseCase } from "../../application/use-cases/update-organization.usecase";
import { DeleteOrganizationUseCase } from "../../application/use-cases/delete-organization.usecase";
import { GetAllOrganizationsUseCase } from "../../application/use-cases/get-all-organizations.usecase";
import { CreateOrganizationDto } from "../dto/create-organization.dto";
import { UpdateOrganizationDto } from "../dto/update-organization.dto";
import { OrganizationNotFoundException } from "../../domain/exceptions/organization-not-found.exception";
import { PaginationQueryDto, UuidParamsDto } from "@/shared/dto/base.dto";

export class OrganizationController {
  constructor(
    private readonly createOrganizationUseCase: CreateOrganizationUseCase,
    private readonly getOrganizationByIdUseCase: GetOrganizationByIdUseCase,
    private readonly updateOrganizationUseCase: UpdateOrganizationUseCase,
    private readonly deleteOrganizationUseCase: DeleteOrganizationUseCase,
    private readonly getAllOrganizationsUseCase: GetAllOrganizationsUseCase
  ) {}

  createOrganization = asyncHandler(
    async (
      req: Request<object, object, CreateOrganizationDto>,
      res: Response
    ): Promise<void> => {
      const organization = await this.createOrganizationUseCase.execute(
        req.body
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
    async (
      req: Request<UuidParamsDto, object, UpdateOrganizationDto>,
      res: Response
    ): Promise<void> => {
      const { id } = req.params;

      try {
        const organization = await this.updateOrganizationUseCase.execute(
          id,
          req.body
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
    async (req: Request<UuidParamsDto>, res: Response): Promise<void> => {
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
    async (
      req: Request<object, object, object, PaginationQueryDto>,
      res: Response
    ): Promise<void> => {
      const { page, limit, search } = req.query;

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
