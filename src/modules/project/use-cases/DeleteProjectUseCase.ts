import { IProjectRepository } from "../repositories/IProjectRepository";
import { NotFoundException } from "../../../shared/exceptions/DomainExceptions";

export class DeleteProjectUseCase {
  constructor(private projectRepository: IProjectRepository) {}

  async execute(id: string): Promise<void> {
    const project = await this.projectRepository.findById(id);

    if (!project) {
      throw new NotFoundException("Project not found");
    }

    await this.projectRepository.delete(id);
  }
}
