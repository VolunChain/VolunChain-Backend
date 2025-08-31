import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";
import { IJWTPayload } from "../interfaces/auth.interface";

export class JWTService {
  private static readonly SECRET_KEY =
    process.env.JWT_SECRET ||
    "volunchain-super-secret-key-change-in-production";
  private static readonly DEFAULT_EXPIRATION = "24h";
  private static readonly REFRESH_EXPIRATION = "7d";

  /**
   * Generates a JWT token for authentication
   * @param payload - The payload to encode in the token
   * @param expiresIn - Token expiration time (default: 24h)
   * @returns JWT token string
   */
  static generateToken(
    payload: Omit<IJWTPayload, "iat" | "exp">,
    expiresIn: string = this.DEFAULT_EXPIRATION
  ): string {
    try {
      const options: SignOptions = {
        expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
        issuer: "volunchain-api",
        audience: "volunchain-users",
      };

      return jwt.sign(payload, this.SECRET_KEY, options);
    } catch (error) {
      throw new Error(
        `Failed to generate JWT token: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Generates a refresh token
   * @param payload - The payload to encode in the token
   * @returns Refresh token string
   */
  static generateRefreshToken(
    payload: Omit<IJWTPayload, "iat" | "exp">
  ): string {
    return this.generateToken(payload, this.REFRESH_EXPIRATION);
  }

  /**
   * Verifies and decodes a JWT token
   * @param token - The JWT token to verify
   * @returns Decoded payload
   */
  static verifyToken(token: string): IJWTPayload {
    try {
      const options: VerifyOptions = {
        issuer: "volunchain-api",
        audience: "volunchain-users",
      };

      const decoded = jwt.verify(
        token,
        this.SECRET_KEY,
        options
      ) as IJWTPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Token has expired");
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid token");
      } else {
        throw new Error(
          `Token verification failed: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }
  }

  /**
   * Decodes a JWT token without verification (for debugging purposes)
   * @param token - The JWT token to decode
   * @returns Decoded payload
   */
  static decodeToken(token: string): IJWTPayload | null {
    try {
      return jwt.decode(token) as IJWTPayload;
    } catch {
      return null;
    }
  }

  /**
   * Checks if a token is expired
   * @param token - The JWT token to check
   * @returns boolean indicating if token is expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as IJWTPayload;
      if (!decoded || !decoded.exp) {
        return true;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  }

  /**
   * Extracts token from Authorization header
   * @param authHeader - Authorization header value
   * @returns Token string or null
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return null;
    }

    return parts[1];
  }

  /**
   * Gets token expiration time in seconds
   * @param token - The JWT token
   * @returns Expiration time in seconds or null
   */
  static getTokenExpiration(token: string): number | null {
    try {
      const decoded = jwt.decode(token) as IJWTPayload;
      return decoded?.exp || null;
    } catch {
      return null;
    }
  }

  /**
   * Gets time until token expires in seconds
   * @param token - The JWT token
   * @returns Time until expiration in seconds or null
   */
  static getTimeUntilExpiration(token: string): number | null {
    const expiration = this.getTokenExpiration(token);
    if (!expiration) {
      return null;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return Math.max(0, expiration - currentTime);
  }
}
