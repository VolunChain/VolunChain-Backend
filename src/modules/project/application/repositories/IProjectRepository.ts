import { IProject, ProjectEntity } from "../../domain/entities/project.entity";

export interface IProjectRepository {
  findById(id: string): Promise<ProjectEntity | null>;
  findAll(): Promise<ProjectEntity[]>;
  findByOrganizationId(organizationId: string): Promise<ProjectEntity[]>;
  save(project: IProject): Promise<ProjectEntity>;
  update(project: ProjectEntity): Promise<ProjectEntity>;
  delete(id: string): Promise<void>;
}
