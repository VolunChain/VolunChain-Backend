import { IProjectRepository } from "../repositories/IProjectRepository";
import { ProjectEntity } from "../../domain/entities/project.entity";
import { UpdateProjectDto } from "../../presentation/dto/UpdateProjectDto";

export class UpdateProjectUseCase {
  constructor(private projectRepository: IProjectRepository) {}

  async execute(id: string, dto: UpdateProjectDto): Promise<ProjectEntity> {
    const project = await this.projectRepository.findById(id);

    if (!project) {
      throw new Error("Project not found");
    }

    project.update(dto);
    return this.projectRepository.update(project);
  }
}
