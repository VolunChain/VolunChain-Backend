import { BaseEntity } from "../../../shared/domain/entities/base.entity";
import { ProjectStatus } from "../enum/ProjectStatus.enum";
import { UserVolunteer } from "@/modules/user/domain/entities/user-volunteer.entity";
import { ProjectExceptions } from "../exceptions/project.exceptions";

export interface IProjectProps {
  id: string;
  name: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  organizationId: string;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
  volunteers?: UserVolunteer[] | UserVolunteer | undefined;
}

export class ProjectEntity extends BaseEntity {
  name: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  organizationId: string;
  status: ProjectStatus;
  volunteers?: UserVolunteer[] | UserVolunteer | undefined;

  constructor(props: IProjectProps) {
    super();
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.location = props.location;
    this.startDate = props.startDate;
    this.endDate = props.endDate;
    this.organizationId = props.organizationId;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
    this.status = props.status;
    this.volunteers = props.volunteers;
  }

  public static create(
    id: string,
    name: string,
    description: string,
    location: string,
    startDate: Date,
    endDate: Date,
    organizationId: string,
    status: ProjectStatus = ProjectStatus.DRAFT,
    volunteers?: UserVolunteer[] | UserVolunteer
  ): ProjectEntity {
    // Validate required fields
    if (!name || name.trim().length === 0) {
      throw new ProjectExceptions(
        "name",
        "Project name is required and cannot be empty"
      );
    }
    if (!description || description.trim().length === 0) {
      throw new ProjectExceptions(
        "description",
        "Project description is required and cannot be empty"
      );
    }
    if (!location || location.trim().length === 0) {
      throw new ProjectExceptions(
        "location",
        "Project location is required and cannot be empty"
      );
    }
    if (
      !startDate ||
      !(startDate instanceof Date) ||
      isNaN(startDate.getTime())
    ) {
      throw new ProjectExceptions("date", "Valid start date is required");
    }
    if (!endDate || !(endDate instanceof Date) || isNaN(endDate.getTime())) {
      throw new ProjectExceptions("date", "Valid end date is required");
    }
    if (endDate <= startDate) {
      throw new ProjectExceptions("date", "End date must be after start date");
    }
    if (!organizationId || organizationId.trim().length === 0) {
      throw new ProjectExceptions(
        "organization",
        "Organization ID is required and cannot be empty"
      );
    }

    return new ProjectEntity({
      id,
      name,
      location,
      description,
      startDate,
      endDate,
      organizationId,
      volunteers,
      status,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Domain methods
  public activate(): void {
    if (this.status !== ProjectStatus.DRAFT) {
      throw new Error("Only draft projects can be activated");
    }
    this.status = ProjectStatus.ACTIVE;
  }

  public update(
    props: Partial<Omit<ProjectEntity, "id" | "createdAt" | "updatedAt">>
  ): void {
    Object.assign(this, {
      ...props,
      updatedAt: new Date(),
    });
  }

  public complete(): void {
    if (this.status !== ProjectStatus.ACTIVE) {
      throw new Error("Only active projects can be completed");
    }
    this.status = ProjectStatus.COMPLETED;
  }

  public cancel(): void {
    if (this.status === ProjectStatus.COMPLETED) {
      throw new Error("Completed projects cannot be cancelled");
    }
    this.status = ProjectStatus.CANCELLED;
  }

  public isActive(): boolean {
    return this.status === ProjectStatus.ACTIVE;
  }

  public isCompleted(): boolean {
    return this.status === ProjectStatus.COMPLETED;
  }
}
