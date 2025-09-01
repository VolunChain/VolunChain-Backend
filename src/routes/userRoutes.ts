import {
  Router,
  Request,
  Response,
  RequestHandler,
  NextFunction,
} from "express";
import UserController from "../modules/user/presentation/controllers/UserController";
import UserVolunteerController from "../modules/user/presentation/controllers/userVolunteer.controller";
import { authMiddleware } from "../middleware/authMiddleware";
import { AuthenticatedRequest } from "../types/auth.types";

const userController = new UserController();
const userVolunteerController = new UserVolunteerController();
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

// User-Volunteer routes
router.post(
  "/users/:userId/volunteers/:volunteerId",
  authMiddleware,
  wrapHandler(
    userVolunteerController.addUserToVolunteer.bind(userVolunteerController)
  )
);

router.get(
  "/users/:userId/volunteers",
  authMiddleware,
  wrapHandler(
    userVolunteerController.getVolunteersByUserId.bind(userVolunteerController)
  )
);

router.get(
  "/volunteers/:volunteerId/users",
  authMiddleware,
  wrapHandler(
    userVolunteerController.getUsersByVolunteerId.bind(userVolunteerController)
  )
);

router.delete(
  "/users/:userId/volunteers/:volunteerId",
  authMiddleware,
  wrapHandler(
    userVolunteerController.removeUserFromVolunteer.bind(
      userVolunteerController
    )
  )
);

export default router;
