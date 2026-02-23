import { Request, Response } from "express";
import { UserService } from "../services/UserService";

const userService = new UserService();

export class UserController {
    async register(req: Request, res: Response) {
        const { name, email, password, role } = req.body;
        const user = await userService.register({ name, email, password, role });
        return res.status(201).json(user);
    }

    async login(req: Request, res: Response) {
        const { email, password } = req.body;
        const data = await userService.login({ email, password });
        return res.json(data);
    }
}
