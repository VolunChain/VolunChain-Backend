import { Request, Response } from "express";
import { UserService } from "./UserService";

const userService = new UserService();

export class UserController {
  static async createUser(req: Request, res: Response) {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: error });
    }
  }

  static async getUserById(req: Request, res: Response) {
    try {
      const user = await userService.getUserById(req.params.id);
      res.status(200).json(user);
    } catch (error) {
      res.status(404).json({ error: error });
    }
  }

  static async getUserByEmail(req: Request, res: Response) {
    try {
      const user = await userService.getUserByEmail(req.params.email);
      res.status(200).json(user);
    } catch (error) {
      res.status(404).json({ error: error });
    }
  }

  static async getUsers(req: Request, res: Response) {
    try {
      const { page, pageSize } = req.query;
      const users = await userService.getUsers(
        Number(page) || 1,
        Number(pageSize) || 10
      );
      res.status(200).json(users);
    } catch (error) {
      res.status(400).json({ error: error });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      await userService.deleteUser(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error });
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      await userService.updateUser(req.body);
      res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
      res.status(400).json({ error: error });
    }
  }
}
