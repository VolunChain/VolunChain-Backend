import { UpdateOrganizationDto } from "../../presentation/dto/update-organization.dto";
import { OrganizationEntity } from "../../domain/entities/organization.entity";
import { IOrganizationRepository } from "../repository/organization.repository";
import { OrganizationNotFoundException } from "../../domain/exceptions/organization-not-found.exception";

export class UpdateOrganizationUseCase {
  constructor(
    private readonly organizationRepository: IOrganizationRepository
  ) {}

  async execute(
    id: string,
    dto: UpdateOrganizationDto
  ): Promise<OrganizationEntity> {
    const existingOrganization = await this.organizationRepository.findById(id);

    if (!existingOrganization) {
      throw new OrganizationNotFoundException(id);
    }

    const updatedOrganization = existingOrganization.update(dto);

    return await this.organizationRepository.update(id, updatedOrganization);
  }
}
