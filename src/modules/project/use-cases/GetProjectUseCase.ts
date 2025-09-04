import { IProjectRepository } from "../repositories/IProjectRepository";
import { Project } from "../domain/Project";
import { NotFoundException } from "../../../shared/exceptions/DomainExceptions";

export class GetProjectUseCase {
  constructor(private projectRepository: IProjectRepository) {}

  async execute(id: string): Promise<Project> {
    const project = await this.projectRepository.findById(id);

    if (!project) {
      throw new NotFoundException("Project not found");
    }

    return project;
  }
}
