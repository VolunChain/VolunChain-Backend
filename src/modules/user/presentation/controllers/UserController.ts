import { Request, Response } from "express";
import { CreateUserUseCase } from "../../use-cases/userUseCase";
import { GetUserByIdUseCase } from "../../use-cases/userUseCase";
import { GetUserByEmailUseCase } from "../../use-cases/userUseCase";
import { UpdateUserUseCase } from "../../use-cases/userUseCase";
import { DeleteUserUseCase } from "../../use-cases/userUseCase";
import { PrismaUserRepository } from "../../repositories/PrismaUserRepository";
import { CreateUserDto } from "../../dto/CreateUserDto";
import { UpdateUserDto } from "../../dto/UpdateUserDto";

export default class UserController {
  private userRepository: PrismaUserRepository;
  private createUserUseCase: CreateUserUseCase;
  private getUserByIdUseCase: GetUserByIdUseCase;
  private getUserByEmailUseCase: GetUserByEmailUseCase;
  private updateUserUseCase: UpdateUserUseCase;
  private deleteUserUseCase: DeleteUserUseCase;

  constructor() {
    this.userRepository = new PrismaUserRepository();
    this.createUserUseCase = new CreateUserUseCase(this.userRepository);
    this.getUserByIdUseCase = new GetUserByIdUseCase(this.userRepository);
    this.getUserByEmailUseCase = new GetUserByEmailUseCase(this.userRepository);
    this.updateUserUseCase = new UpdateUserUseCase(this.userRepository);
    this.deleteUserUseCase = new DeleteUserUseCase(this.userRepository);
  }

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userDto = new CreateUserDto();
      Object.assign(userDto, req.body);

      const user = await this.createUserUseCase.execute(userDto);
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
      const user = await this.getUserByIdUseCase.execute(id);
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
      const { email } = req.query;
      if (!email) {
        res.status(400).json({ error: "Email is required" });
        return;
      }
      const user = await this.getUserByEmailUseCase.execute(email as string);
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

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userDto = new UpdateUserDto();
      Object.assign(userDto, req.body);
      userDto.id = id;

      await this.updateUserUseCase.execute(userDto);
      res.status(200).json({ message: "User updated successfully" });
    } catch (error: unknown) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.deleteUserUseCase.execute(id);
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error: unknown) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
