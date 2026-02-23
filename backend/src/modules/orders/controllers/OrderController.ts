import { Request, Response } from "express";
import { OrderService } from "../services/OrderService";

const orderService = new OrderService();

export class OrderController {
    async create(req: Request, res: Response) {
        const { client_id, items } = req.body;
        const order = await orderService.create(client_id, items);
        return res.status(201).json(order);
    }

    async list(req: Request, res: Response) {
        const orders = await orderService.list();
        return res.json(orders);
    }
}
