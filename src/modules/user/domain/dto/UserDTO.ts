// UserDTO represents the data structure returned by the repository
export interface UserDTO {
  id: string;
  name: string;
  lastName?: string;
  email: string;
  wallet: string;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// CreateUserData represents the data needed to create a user
export interface CreateUserData {
  name: string;
  lastName?: string;
  email: string;
  password: string;
  wallet: string;
  isVerified?: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
}

// UpdateUserData represents the data that can be updated for a user
export interface UpdateUserData {
  name?: string;
  lastName?: string;
  email?: string;
  password?: string;
  wallet?: string;
  isVerified?: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
}
