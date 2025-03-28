export interface IVolunteerProps {
  id?: string;
  name: string;
  description: string;
  requirements: string;
  incentive?: string | null;
  projectId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IVolunteerUpdateProps {
  name?: string;
  description?: string;
  requirements?: string;
  incentive?: string | null;
}
