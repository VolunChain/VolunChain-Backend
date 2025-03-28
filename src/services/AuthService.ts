// import jwt from "jsonwebtoken";
// import { prisma } from "../config/prisma";

// const SECRET_KEY = process.env.JWT_SECRET || "defaultSecret";

// class AuthService {
//   async authenticate(walletAddress: string): Promise<string> {
//     const user = await prisma.user.findUnique({
//       where: { wallet: walletAddress },
//     });

//     if (!user) {
//       throw new Error("User not found");
//     }

//     return jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: "1h" });
//   }
// }

// export default AuthService;

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { sendVerificationEmail } from "../utils/email.utils";

const SECRET_KEY = process.env.JWT_SECRET || "defaultSecret";
const EMAIL_SECRET = process.env.EMAIL_SECRET || "emailSecret";

class AuthService {
  async register(
    name: string,
    email: string,
    password: string,
    wallet: string
  ) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error("Email already in use");

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = jwt.sign({ email }, EMAIL_SECRET, {
      expiresIn: "1d",
    });

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        wallet,
        isVerified: false,
        verificationToken,
      },
    });

    await sendVerificationEmail(user.email, verificationToken);

    return { message: "Registration successful. Please verify your email." };
  }

  async verifyEmail(token: string) {
    try {
      const decoded = jwt.verify(token, EMAIL_SECRET) as { email: string };
      const user = await prisma.user.findUnique({
        where: { email: decoded.email },
      });

      if (!user) throw new Error("User not found");
      if (user.isVerified) return { message: "Email already verified" };

      await prisma.user.update({
        where: { email: decoded.email },
        data: { isVerified: true, verificationToken: null },
      });

      return { message: "Email successfully verified" };
    } catch (error) {
      throw new Error("Invalid or expired verification token");
    }
  }

  async resendVerificationEmail(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("User not found");
    if (user.isVerified) return { message: "Email already verified" };

    const newToken = jwt.sign({ email }, EMAIL_SECRET, { expiresIn: "1d" });
    await prisma.user.update({
      where: { email },
      data: { verificationToken: newToken },
    });

    await sendVerificationEmail(email, newToken);

    return { message: "Verification email resent" };
  }

  async authenticate(walletAddress: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { wallet: walletAddress },
    });

    if (!user) throw new Error("User not found");
    if (!user.isVerified) throw new Error("Email not verified");

    return jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: "1h" });
  }
}

export default AuthService;
