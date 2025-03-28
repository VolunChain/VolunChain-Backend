export interface CreateVolunteerDTO {
  name: string;
  description: string;
  requirements: string;
  incentive?: string;
  projectId: string;
}

export interface UpdateVolunteerDTO {
  name?: string;
  description?: string;
  requirements?: string;
  incentive?: string;
}

export interface VolunteerResponseDTO {
  id: string;
  name: string;
  description: string;
  requirements: string;
  incentive?: string | null;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}
