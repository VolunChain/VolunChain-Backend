import { Router } from "express";
import { UserController } from "./user.controller";

const router = Router();

router.post("", UserController.createUser);
router.get("", UserController.getUsers);
router.get("/:id", UserController.getUserById);
router.get("/email/:email", UserController.getUserByEmail);
router.put("", UserController.updateUser);
router.delete("/:id", UserController.deleteUser);

export default router;
