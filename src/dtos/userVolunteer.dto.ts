import { IsUUID, IsNotEmpty } from 'class-validator';

export class AddUserToVolunteerDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID()
  @IsNotEmpty()
  volunteerId: string;
}

export class GetVolunteersByUserIdDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}

export class GetUsersByVolunteerIdDto {
  @IsUUID()
  @IsNotEmpty()
  volunteerId: string;
} 