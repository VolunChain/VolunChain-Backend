import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { DecodedUser, AuthenticatedUser, toAuthenticatedUser } from '../types/auth.types';

// Extender la interfaz Request para incluir el campo user y traceId
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      traceId?: string;
    }
  }
}

/**
 * Middleware que permite el acceso a la ruta incluso si el usuario no está autenticado,
 * pero si proporciona un token válido, los detalles del usuario se adjuntan a la solicitud.
 */
export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Extraer el token del encabezado de autorización
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    // Sin encabezado de autorización, continuar como invitado
    return next();
  }
  
  // Formato: "Bearer TOKEN"
  const tokenParts = authHeader.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    // Formato de token no válido, continuar como invitado
    return next();
  }
  
  const token = tokenParts[1];
  
  try {
    // Verificar el token si existe
    const secret = process.env.JWT_SECRET || 'default_secret';
    const decoded = jwt.verify(token, secret) as DecodedUser;

    // Convertir DecodedUser a AuthenticatedUser y adjuntar a la solicitud
    req.user = toAuthenticatedUser(decoded);
  } catch (error) {
    // Error al verificar el token, continuar como invitado
    // Note: We don't import logger here to avoid circular dependencies
    // This is optional auth middleware, so we continue silently
  }
  
  // Siempre continuar, ya sea autenticado o como invitado
  next();
}; 