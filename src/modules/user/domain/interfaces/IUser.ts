export interface IUser {
  id: string;
  name: string;
  lastName: string;
  email: string;
  password: string;
  wallet: string;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
}