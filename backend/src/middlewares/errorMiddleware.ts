import { Request, Response, NextFunction } from "express";

export interface AppError {
    message: string;
    statusCode: number;
}

export class CustomError extends Error implements AppError {
    constructor(public message: string, public statusCode: number = 400) {
        super(message);
    }
}

export const errorMiddleware = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const statusCode = err instanceof CustomError ? err.statusCode : 500;
    const message = err.message || "Internal Server Error";

    return res.status(statusCode).json({
        status: "error",
        message,
    });
};
