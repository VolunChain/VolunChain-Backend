import {
  Router,
  Request,
  Response,
  RequestHandler,
  NextFunction,
} from "express";
import UserController from "../controllers/UserController";
import { authMiddleware } from "../middleware/authMiddleware";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

const userController = new UserController();
const router = Router();

type AuthenticatedHandler = (
  req: AuthenticatedRequest,
  res: Response
) => Promise<void>;

const wrapHandler = (handler: AuthenticatedHandler): RequestHandler => {
  return ((req: Request, res: Response, next: NextFunction) => {
    handler(req as AuthenticatedRequest, res).catch(next);
  }) as unknown as RequestHandler;
};

// Public routes
router.post(
  "/users",
  wrapHandler(userController.createUser.bind(userController))
);
router.get(
  "/users/:id",
  wrapHandler(userController.getUserById.bind(userController))
);
router.get(
  "/users/:email",
  wrapHandler(userController.getUserByEmail.bind(userController))
);

// Protected routes
router.put(
  "/users/:id",
  authMiddleware,
  wrapHandler(userController.updateUser.bind(userController))
);

export default router;
