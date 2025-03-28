import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: string;
      };
    }
  }
}

// This is needed to make the file a module
export {};
