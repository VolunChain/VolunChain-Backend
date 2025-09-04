import { IProjectRepository } from "../repositories/IProjectRepository";
import { Project, ProjectStatus } from "../domain/Project";
import { CreateProjectDto } from "../dto/CreateProjectDto";
import { ValidationException } from "../../../shared/exceptions/DomainExceptions";
import { validate } from "class-validator";

export class CreateProjectUseCase {
  constructor(private projectRepository: IProjectRepository) {}

  async execute(dto: CreateProjectDto): Promise<Project> {
    // Validate DTO
    const validationErrors = await validate(dto);
    if (validationErrors.length > 0) {
      const errorMessages = validationErrors.map(error => 
        Object.values(error.constraints || {}).join(', ')
      ).join('; ');
      throw new ValidationException(`Validation failed: ${errorMessages}`);
    }

    const project = Project.create({
      title: dto.title,
      description: dto.description,
      organizationId: dto.organizationId,
      status: dto.status || ProjectStatus.DRAFT,
    });

    return this.projectRepository.save(project);
  }
}
