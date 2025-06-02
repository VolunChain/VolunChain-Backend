import { Router } from 'express';
import UserController from '../controllers/UserController';
import { validateDto } from '../middleware/validation.middleware';
import { CreateUserDto, GetUserByEmailDto } from '../dtos/user.dto';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Protected routes
router.post('/', authenticateToken, validateDto(CreateUserDto), UserController.createUser);
router.get('/:id', authenticateToken, UserController.getUserById);
router.get('/email', authenticateToken, validateDto(GetUserByEmailDto), UserController.getUserByEmail);

export default router;
