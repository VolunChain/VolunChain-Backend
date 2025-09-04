import { compareSync, hashSync } from "bcryptjs";

export class BcryptAdapter {
  generateHash(password: string): string {
    return hashSync(password);
  }

  compareHash(password: string, hashed: string): boolean {
    return compareSync(password, hashed);
  }
}
