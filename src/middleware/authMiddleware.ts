import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/data-source";
import { UserRepository } from "../repository/user.repository";

interface AuthenticatedRequest extends Request {
  user?: {
    id: any;
    role: string;
    isVerified: boolean;
  };
}

const SECRET_KEY = process.env.JWT_SECRET || "defaultSecret";

const userRepository = new UserRepository(AppDataSource);

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as {
      id: string;
      role: string;
    };
    const user = await userRepository.findById(decoded.id);

    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    if (!user.isVerified) {
      res.status(403).json({
        message: "Email not verified. Please verify your email to proceed.",
      });
      return;
    }

    // req.user = {
    //   id: user.id,
    //   role: decoded.role,
    //   isVerified: user.isVerified
    // };

    (req as AuthenticatedRequest).user = {
      id: user.id,
      role: decoded.role,
      isVerified: user.isVerified,
    };

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export default authMiddleware;
