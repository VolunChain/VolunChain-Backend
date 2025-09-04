import { Request, Response } from "express";
import {
  UpdateUserUseCase,
  CreateUserUseCase,
  DeleteUserUseCase,
  GetAllUsersUseCase,
  GetUserByEmailUseCase,
  GetUserByIdUseCase,
} from "../../application/use-cases";

export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly getAllUsersUseCase: GetAllUsersUseCase,
    private readonly getUserByEmailUseCase: GetUserByEmailUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase
  ) {}

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const user = await this.createUserUseCase.execute(req.body);
      return res.status(201).json(user);
    } catch (error: unknown) {
      return res.status(400).json({ message: error });
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const user = await this.updateUserUseCase.execute(req.body);
      return res.status(200).json(user);
    } catch (error: unknown) {
      return res.status(400).json({ message: error });
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      await this.deleteUserUseCase.execute(req.params.id);
      return res.status(204).send();
    } catch (error: unknown) {
      return res.status(400).json({ message: error });
    }
  }

  async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const users = await this.getAllUsersUseCase.execute();
      return res.status(200).json(users);
    } catch (error: unknown) {
      return res.status(400).json({ message: error });
    }
  }

  async findById(req: Request, res: Response): Promise<Response> {
    try {
      const user = await this.getUserByIdUseCase.execute(req.params.id);
      return res.status(200).json(user);
    } catch (error: unknown) {
      return res.status(404).json({ message: error });
    }
  }

  async findByEmail(req: Request, res: Response): Promise<Response> {
    try {
      const user = await this.getUserByEmailUseCase.execute(req.params.email);
      return res.status(200).json(user);
    } catch (error: unknown) {
      return res.status(404).json({ message: error });
    }
  }
}
