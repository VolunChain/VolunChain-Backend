import { Volunteer } from "../domain/volunteer.entity";
import { IVolunteerRepository } from "../repositories/interfaces/volunteer-repository.interface";

export class GetVolunteersByProjectUseCase {
  constructor(private volunteerRepository: IVolunteerRepository) {}

  async execute(
    projectId: string,
    page = 1,
    pageSize = 10
  ): Promise<{
    volunteers: Volunteer[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const volunteers = await this.volunteerRepository.findByProjectId(
      projectId,
      page,
      pageSize
    );

    const total = await this.volunteerRepository.count(projectId);

    return {
      volunteers,
      total,
      page,
      pageSize,
    };
  }
}
