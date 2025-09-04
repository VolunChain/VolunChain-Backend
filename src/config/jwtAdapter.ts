import jwt from "jsonwebtoken";
import { env } from "./env";

const JWT_SEED = env.JWT_SECRET;

export class JwtAdapter {
  static async generateToken(
    payload: object,
    durationInHours: number = 2
  ): Promise<string | null> {
    return new Promise((resolve) => {
      jwt.sign(
        payload,
        JWT_SEED,
        {
          expiresIn: `${durationInHours}h`,
        },
        (error, token) => {
          if (error) return resolve(null);

          return resolve(token!);
        }
      );
    });
  }

  static validateToken<T>(token: string): Promise<T | null> {
    return new Promise((resolve) => {
      jwt.verify(token, JWT_SEED, (error: unknown, decoded: unknown) => {
        if (error) return resolve(null);

        resolve(decoded as T);
      });
    });
  }
}
