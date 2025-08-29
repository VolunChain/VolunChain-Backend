import { OrganizationEntity } from "../../domain/entities/organization.entity";
import { IOrganizationRepository } from "../repository/organization.repository";
import { OrganizationNotFoundException } from "../../domain/exceptions/organization-not-found.exception";

export class GetOrganizationByIdUseCase {
  constructor(
    private readonly organizationRepository: IOrganizationRepository
  ) {}

  async execute(id: string): Promise<OrganizationEntity> {
    const organization = await this.organizationRepository.findById(id);

    if (!organization) {
      throw new OrganizationNotFoundException(id);
    }

    return organization;
  }
}
