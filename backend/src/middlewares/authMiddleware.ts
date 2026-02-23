import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { CustomError } from "./errorMiddleware";

interface TokenPayload {
    id: string;
    role: string;
    iat: number;
    exp: number;
}

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { authorization } = req.headers;

    if (!authorization) {
        throw new CustomError("Token not provided", 401);
    }

    const token = authorization.replace("Bearer", "").trim();

    try {
        const data = jwt.verify(token, process.env.JWT_SECRET || "default");
        const { id, role } = data as TokenPayload;

        req.user = { id, role };

        return next();
    } catch {
        throw new CustomError("Invalid token", 401);
    }
};
