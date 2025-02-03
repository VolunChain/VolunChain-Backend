import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Define the interface for the authenticated request
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

const SECRET_KEY = process.env.JWT_SECRET || 'defaultSecret';

const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response, 
  next: NextFunction
): void => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { id: number; role: string };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export default authMiddleware;