import { IProjectRepository } from "../repositories/IProjectRepository";
import { ProjectEntity } from "../../domain/entities/project.entity";

export class ListProjectsUseCase {
  constructor(private projectRepository: IProjectRepository) {}

  async execute(organizationId?: string): Promise<ProjectEntity[]> {
    if (organizationId) {
      return this.projectRepository.findByOrganizationId(organizationId);
    }
    return this.projectRepository.findAll();
  }
}
