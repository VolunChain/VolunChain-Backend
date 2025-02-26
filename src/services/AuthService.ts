import jwt from 'jsonwebtoken';
import { User } from '../entities/User';
import AppDataSource from '../config/ormconfig';
import { Repository } from 'prisma';

const SECRET_KEY = process.env.JWT_SECRET || 'defaultSecret';

class AuthService {
  private userRepo: Repository<User>;

  constructor() {
    this.userRepo = AppDataSource.getRepository(User);
  }

  async authenticate(walletAddress: string): Promise<string> {
    const user = await this.userRepo.findOne({ where: { walletAddress } });

    if (!user) {
      throw new Error('User not found');
    }

    return jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
  }
}

export default AuthService;