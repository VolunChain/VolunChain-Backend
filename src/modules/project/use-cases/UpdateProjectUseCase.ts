import { IProjectRepository } from "../repositories/IProjectRepository";
import { Project } from "../domain/Project";
import { UpdateProjectDto } from "../dto/UpdateProjectDto";
import { NotFoundException, ValidationException } from "../../../shared/exceptions/DomainExceptions";
import { validate } from "class-validator";

export class UpdateProjectUseCase {
  constructor(private projectRepository: IProjectRepository) {}

  async execute(id: string, dto: UpdateProjectDto): Promise<Project> {
    // Validate DTO
    const validationErrors = await validate(dto);
    if (validationErrors.length > 0) {
      const errorMessages = validationErrors.map(error => 
        Object.values(error.constraints || {}).join(', ')
      ).join('; ');
      throw new ValidationException(`Validation failed: ${errorMessages}`);
    }

    const project = await this.projectRepository.findById(id);

    if (!project) {
      throw new NotFoundException("Project not found");
    }

    project.update(dto);
    return this.projectRepository.update(project);
  }
}
