import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest, DecodedUser } from "../types/auth.types";

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Access token required",
      });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as DecodedUser;

    req.user = decoded;
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export const requireUserProfile = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.profileType !== "user") {
    res.status(403).json({
      success: false,
      message: "User profile required for this action",
    });
    return;
  }
  next();
};

export const requireOrganizationProfile = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.profileType !== "organization") {
    res.status(403).json({
      success: false,
      message: "Organization profile required for this action",
    });
    return;
  }
  next();
};

export default {
  authMiddleware,
  requireUserProfile,
  requireOrganizationProfile,
};
