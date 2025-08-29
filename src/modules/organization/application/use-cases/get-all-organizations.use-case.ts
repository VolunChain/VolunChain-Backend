import { OrganizationEntity } from "../../domain/entities/organization.entity";
import { IOrganizationRepository } from "../repository/organization.repository";

interface GetAllOrganizationsOptions {
  page: number;
  limit: number;
  search?: string;
}

export class GetAllOrganizationsUseCase {
  constructor(
    private readonly organizationRepository: IOrganizationRepository
  ) {}

  async execute(
    options: GetAllOrganizationsOptions
  ): Promise<OrganizationEntity[]> {
    return await this.organizationRepository.findAll({
      page: options.page,
      limit: options.limit,
      search: options.search,
    });
  }
}
