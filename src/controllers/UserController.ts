import { UserService } from "../services/UserService";
import { Request, Response } from "express";
import { CreateUserDto, GetUserByIdDto, GetUserByEmailDto } from "../dtos/user.dto";
import { validateDto } from "../middleware/validation.middleware";

class UserController {
  private userService = new UserService();

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.userService.createUser(req.body as CreateUserDto);
      res.status(201).json(user);
    } catch (error: unknown) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.status(200).json(user);
    } catch (error: unknown) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getUserByEmail(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.userService.getUserByEmail(req.body.email);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.status(200).json(user);
    } catch (error: unknown) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

const userController = new UserController();

export default {
  createUser: [validateDto(CreateUserDto), userController.createUser.bind(userController)],
  getUserById: userController.getUserById.bind(userController),
  getUserByEmail: [validateDto(GetUserByEmailDto), userController.getUserByEmail.bind(userController)]
};
