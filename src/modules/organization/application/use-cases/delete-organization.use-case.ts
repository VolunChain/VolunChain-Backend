import { IOrganizationRepository } from "../repository/organization.repository";
import { OrganizationNotFoundException } from "../../domain/exceptions/organization-not-found.exception";

export class DeleteOrganizationUseCase {
  constructor(
    private readonly organizationRepository: IOrganizationRepository
  ) {}

  async execute(id: string): Promise<void> {
    const organization = await this.organizationRepository.findById(id);

    if (!organization) {
      throw new OrganizationNotFoundException(id);
    }

    await this.organizationRepository.delete(id);
  }
}
