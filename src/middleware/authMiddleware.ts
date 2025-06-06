import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
// import { AppDataSource } from "../config/data-source";
// import { UserRepository } from "../repository/user.repository";
import { PrismaUserRepository } from "../modules/user/repositories/PrismaUserRepository";
import { AuthenticatedRequest, DecodedUser, toAuthenticatedUser } from "../types/auth.types";

const SECRET_KEY = process.env.JWT_SECRET || "defaultSecret";

const userRepository = new PrismaUserRepository();

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
    const user = await userRepository.findById(`${decoded.id}`);

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
      email: user.email,
      role: decoded.role,
      isVerified: user.isVerified,
    };

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

const requireVerifiedEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    
    if (!authenticatedReq.user) {
      res.status(401).json({ message: 'Unauthorized - Authentication required' });
      return;
    }

    const isVerified = await userRepository.isUserVerified(authenticatedReq.user.id.toString());
    
    if (!isVerified) {
      res.status(403).json({ 
        message: 'Forbidden - Email verification required',
        verificationNeeded: true
      });
      return;
    }

    // Add verification status to user object
    authenticatedReq.user.isVerified = true;

    next();
  } catch (error) {
    // Use basic console.error here to avoid circular dependencies
    console.error('Error checking email verification status:', error);
    res.status(500).json({
      message: 'Internal server error',
      ...(req.traceId && { traceId: req.traceId })
    });
  }
}

export default {
  requireVerifiedEmail,
  authMiddleware
};
