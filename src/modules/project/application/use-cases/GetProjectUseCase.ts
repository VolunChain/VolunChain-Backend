import { IProjectRepository } from "../repositories/IProjectRepository";
import { ProjectEntity } from "../../domain/entities/project.entity";

export class GetProjectUseCase {
  constructor(private projectRepository: IProjectRepository) {}

  async execute(id: string): Promise<ProjectEntity> {
    const project = await this.projectRepository.findById(id);

    if (!project) {
      throw new Error("Project not found");
    }

    return project;
  }
}
