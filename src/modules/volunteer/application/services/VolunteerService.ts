import { Volunteer } from "../../domain/entities/volunteer.entity";
import { VolunteerPrismaRepository } from "../../repositories/implementations/volunteer-prisma.repository";
import { CreateVolunteerUseCase } from "../../use-cases/create-volunteer.use-case";
import { GetVolunteersByProjectUseCase } from "../../use-cases/get-volunteers-by-project.use-case";
import {
  CreateVolunteerDTO,
  UpdateVolunteerDTO,
} from "../../dto/volunteer.dto";

export default class VolunteerService {
  private volunteerRepository: VolunteerPrismaRepository;
  private createVolunteerUseCase: CreateVolunteerUseCase;
  private getVolunteersByProjectUseCase: GetVolunteersByProjectUseCase;

  constructor() {
    this.volunteerRepository = new VolunteerPrismaRepository();
    this.createVolunteerUseCase = new CreateVolunteerUseCase(
      this.volunteerRepository
    );
    this.getVolunteersByProjectUseCase = new GetVolunteersByProjectUseCase(
      this.volunteerRepository
    );
  }

  async createVolunteer(volunteerData: CreateVolunteerDTO): Promise<Volunteer> {
    return this.createVolunteerUseCase.execute(volunteerData);
  }

  async getVolunteerById(id: string): Promise<Volunteer | null> {
    return this.volunteerRepository.findById(id);
  }

  async getVolunteersByProjectId(projectId: string, page = 1, pageSize = 10) {
    return this.getVolunteersByProjectUseCase.execute(
      projectId,
      page,
      pageSize
    );
  }

  async updateVolunteer(
    id: string,
    updateData: UpdateVolunteerDTO
  ): Promise<Volunteer> {
    // Fetch existing volunteer
    const existingVolunteer = await this.getVolunteerById(id);

    if (!existingVolunteer) {
      throw new Error("Volunteer not found");
    }

    // Update the volunteer using domain entity method
    existingVolunteer.update(updateData);

    // Persist the updated volunteer
    return this.volunteerRepository.update(existingVolunteer);
  }

  async deleteVolunteer(id: string): Promise<void> {
    await this.volunteerRepository.delete(id);
  }
}
