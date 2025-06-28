import { Entity } from "@/entities/Entity"

export interface IProject {
  id: string
  title: string
  description: string
  organizationId: string
  status: ProjectStatus
  createdAt: Date
  updatedAt: Date
}

export enum ProjectStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export class Project extends Entity<IProject> {
  private constructor(props: IProject) {
    super(props)
  }

  public static create(props: Omit<IProject, "id" | "createdAt" | "updatedAt">): Project {
    return new Project({
      ...props,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  public update(props: Partial<Omit<IProject, "id" | "createdAt" | "updatedAt">>): void {
    Object.assign(this.props, {
      ...props,
      updatedAt: new Date(),
    })
  }

  public get id(): string {
    return this.props.id
  }

  public get title(): string {
    return this.props.title
  }

  public get description(): string {
    return this.props.description
  }

  public get organizationId(): string {
    return this.props.organizationId
  }

  public get status(): ProjectStatus {
    return this.props.status
  }
}
