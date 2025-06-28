import { CreateUserDto } from "../modules/user/dto/CreateUserDto";
import { UserService } from "../modules/user/application/services/UserService";
import { Response } from "express";
import { UpdateUserDto } from "../modules/user/dto/UpdateUserDto";
import { AuthenticatedRequest } from "../types/auth.types";

class UserController {
  private userService = new UserService();

  async createUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userDto = new CreateUserDto();
      Object.assign(userDto, req.body);

      const user = await this.userService.createUser(userDto);
      res.status(201).json(user);
    } catch (error: unknown) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getUserById(req: AuthenticatedRequest, res: Response): Promise<void> {
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

  async getUserByEmail(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { email } = req.query;
      if (!email) {
        res.status(400).json({ error: "Email is required" });
        return;
      }
      const user = await this.userService.getUserByEmail(email as string);
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

  async updateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userDto = new UpdateUserDto();
      Object.assign(userDto, req.body);
      userDto.id = id;

      await this.userService.updateUser(userDto);
      res.status(200).json({ message: "User updated successfully" });
    } catch (error: unknown) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export default UserController;
