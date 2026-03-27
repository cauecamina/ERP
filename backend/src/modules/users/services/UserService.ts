import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/UserRepository";
import { CustomError } from "../../../middlewares/errorMiddleware";

export class UserService {
    async register({ name, email, password, role }: any) {
        const userExists = await userRepository.findOneBy({ email });

        if (userExists) {
            throw new CustomError("User already exists", 400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = userRepository.create({
            name,
            email,
            password: hashedPassword,
            role,
        });

        await userRepository.save(user);

        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async login({ email, password }: any) {
        const user = await userRepository.findOne({
            where: { email },
            select: ["id", "name", "email", "password", "role"],
        });

        if (!user) {
            throw new CustomError("Email or password invalid", 401);
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            throw new CustomError("Email or password invalid", 401);
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || "default",
            { expiresIn: "1d" }
        );

        const { password: _, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            token,
        };
    }
}
