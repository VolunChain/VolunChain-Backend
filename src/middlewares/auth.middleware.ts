import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Definir interfaz para la información del usuario decodificada
interface DecodedUser {
  id: string;
  email: string;
  [key: string]: unknown;
}

// Extender la interfaz Request para incluir el campo user
declare module "express" {
  interface Request {
    user?: DecodedUser;
  }
}

/**
 * Middleware que permite el acceso a la ruta incluso si el usuario no está autenticado,
 * pero si proporciona un token válido, los detalles del usuario se adjuntan a la solicitud.
 */
export const optionalAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Extraer el token del encabezado de autorización
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    // Sin encabezado de autorización, continuar como invitado
    return next();
  }

  // Formato: "Bearer TOKEN"
  const tokenParts = authHeader.split(" ");
  if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
    // Formato de token no válido, continuar como invitado
    return next();
  }

  const token = tokenParts[1];

  try {
    // Verificar el token si existe
    const secret = process.env.JWT_SECRET || "default_secret";
    const decoded = jwt.verify(token, secret) as DecodedUser;

    // Adjuntar información del usuario decodificada a la solicitud
    req.user = decoded;
  } catch (error) {
    // Error al verificar el token, continuar como invitado
    console.error("Token verification failed:", error);
  }

  // Siempre continuar, ya sea autenticado o como invitado
  next();
};
