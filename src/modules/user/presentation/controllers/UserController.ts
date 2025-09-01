import { Request, Response } from "express";
import { CreateUserUseCase, GetUserByIdUseCase, GetUserByEmailUseCase, UpdateUserUseCase, DeleteUserUseCase } from "../../use-cases/userUseCase";
import { CreateUserDto } from "../../dto/CreateUserDto";
import { UpdateUserDto } from "../../dto/UpdateUserDto";
import { container, USER_REPOSITORY } from "../../../../shared/infrastructure/container";
import { IUserRepository } from "../../domain/interfaces/IUserRepository";

export default class UserController {
  private userRepository: IUserRepository;

  constructor() {
    this.userRepository = container[USER_REPOSITORY] as IUserRepository;
  }

  async createUser(req: Request, res: Response) {
    try {
      const createUserDto = new CreateUserDto();
      Object.assign(createUserDto, req.body);

      const createUserUseCase = new CreateUserUseCase(this.userRepository);
      const user = await createUserUseCase.execute(createUserDto);

      res.status(201).json(user);
    } catch (error: any) {
      if (error.message?.includes("already exists")) {
        res.status(409).json({ error: error.message });
      } else if (error.message?.includes("validation")) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const getUserByIdUseCase = new GetUserByIdUseCase(this.userRepository);
      const user = await getUserByIdUseCase.execute(id);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json(user);
    } catch (error: any) {
      if (error.message?.includes("not found")) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  async getUserByEmail(req: Request, res: Response) {
    try {
      const { email } = req.query;
      
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: "Email is required" });
      }

      const getUserByEmailUseCase = new GetUserByEmailUseCase(this.userRepository);
      const user = await getUserByEmailUseCase.execute(email);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json(user);
    } catch (error: any) {
      if (error.message?.includes("not found")) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateUserDto = new UpdateUserDto();
      Object.assign(updateUserDto, req.body);

      const updateUserUseCase = new UpdateUserUseCase(this.userRepository);
      const user = await updateUserUseCase.execute(id, updateUserDto);

      res.status(200).json({ message: "User updated successfully", user });
    } catch (error: any) {
      if (error.message?.includes("not found")) {
        res.status(404).json({ error: error.message });
      } else if (error.message?.includes("already exists")) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const deleteUserUseCase = new DeleteUserUseCase(this.userRepository);
      await deleteUserUseCase.execute(id);

      res.status(200).json({ message: "User deleted successfully" });
    } catch (error: any) {
      if (error.message?.includes("not found")) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
}
