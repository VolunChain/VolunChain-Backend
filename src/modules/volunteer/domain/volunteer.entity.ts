import { IVolunteerProps, IVolunteerUpdateProps } from "./volunteer.interface";

export class Volunteer {
  private _id: string;
  private _name: string;
  private _description: string;
  private _requirements: string;
  private _incentive?: string | null;
  private _projectId: string;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: IVolunteerProps) {
    this._id = props.id || crypto.randomUUID();
    this._name = props.name;
    this._description = props.description;
    this._requirements = props.requirements;
    this._incentive = props.incentive;
    this._projectId = props.projectId;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  // Getters
  get id(): string {
    return this._id;
  }
  get name(): string {
    return this._name;
  }
  get description(): string {
    return this._description;
  }
  get requirements(): string {
    return this._requirements;
  }
  get incentive(): string | null | undefined {
    return this._incentive;
  }
  get projectId(): string {
    return this._projectId;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Update method for domain logic
  // update(props: IVolunteerUpdateProps): void {
  //   if (props.name) this._name = props.name;
  //   if (props.description) this._description = props.description;
  //   if (props.requirements) this._requirements = props.requirements;
  //   if (props.incentive !== undefined) this._incentive = props.incentive;

  //   this._updatedAt = new Date();
  // }

  update(props: IVolunteerUpdateProps): void {
    if (props.name !== undefined) {
      if (!props.name.trim()) throw new Error("Name is required");
      this._name = props.name;
    }

    if (props.description !== undefined) {
      if (!props.description.trim()) throw new Error("Description is required");
      this._description = props.description;
    }

    if (props.requirements !== undefined) {
      if (!props.requirements.trim())
        throw new Error("Requirements are required");
      this._requirements = props.requirements;
    }

    if (props.incentive !== undefined) {
      this._incentive = props.incentive;
    }

    this._updatedAt = new Date();
  }

  // Validation method
  validate(): boolean {
    if (!this._name || this._name.trim() === "") {
      throw new Error("Name is required");
    }
    if (!this._description || this._description.trim() === "") {
      throw new Error("Description is required");
    }
    if (!this._requirements || this._requirements.trim() === "") {
      throw new Error("Requirements are required");
    }
    if (!this._projectId) {
      throw new Error("Project ID is required");
    }
    return true;
  }

  // Static method to create a new Volunteer
  static create(props: IVolunteerProps): Volunteer {
    const volunteer = new Volunteer(props);
    volunteer.validate();
    return volunteer;
  }

  // Converts entity to plain object for persistence
  toObject(): IVolunteerProps {
    return {
      id: this._id,
      name: this._name,
      description: this._description,
      requirements: this._requirements,
      incentive: this._incentive,
      projectId: this._projectId,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
