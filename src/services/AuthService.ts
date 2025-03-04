import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma";

const SECRET_KEY = process.env.JWT_SECRET || "defaultSecret";

class AuthService {
  async authenticate(walletAddress: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { wallet: walletAddress },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: "1h" });
  }
}

export default AuthService;
