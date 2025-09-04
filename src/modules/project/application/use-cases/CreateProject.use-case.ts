import { IProjectRepository } from "../repositories/IProjectRepository";
import { ProjectEntity } from "../../domain/entities/project.entity";
import { ProjectStatus } from "../../domain/enum/ProjectStatus.enum";
import { UserVolunteer } from "@/modules/user/domain/entities/user-volunteer.entity";

export interface PropsCreateProject {
  id: string;
  name: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  organizationId: string;
  status?: ProjectStatus;
  volunteers?: UserVolunteer[] | UserVolunteer;
}

export class CreateProjectUseCase {
  constructor(private projectRepository: IProjectRepository) {}

  async execute(props: PropsCreateProject): Promise<ProjectEntity> {
    const project = ProjectEntity.create(
      props.id,
      props.name,
      props.description,
      props.location,
      props.startDate,
      props.endDate,
      props.organizationId,
      props.status || ProjectStatus.DRAFT,
      props.volunteers
        ? Array.isArray(props.volunteers)
          ? props.volunteers
          : [props.volunteers]
        : []
    );

    return this.projectRepository.save(project);
  }
}
