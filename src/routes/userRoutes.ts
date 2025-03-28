import { Router } from "express";
import UserController from "../controllers/UserController";

const userController = new UserController();
const router = Router();

router.post("/users", async (req, res) => userController.createUser(req, res));
router.get("/users/:id", async (req, res) =>
  userController.getUserById(req, res)
);
router.get("/users/:email", async (req, res) =>
  userController.getUserByEmail(req, res)
);

export default router;
