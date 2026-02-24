import { Request, Response } from "express";
import { ClientService } from "../services/ClientService";

const clientService = new ClientService();

export class ClientController {
    async create(req: Request, res: Response) {
        const data = {
            ...req.body,
            active: req.body.active === "true" || req.body.active === true,
            avatar: req.file ? req.file.filename : undefined
        };
        const client = await clientService.create(data);
        return res.status(201).json(client);
    }

    async list(req: Request, res: Response) {
        const clients = await clientService.list();
        return res.json(clients);
    }

    async show(req: Request, res: Response) {
        const client = await clientService.findById(req.params.id);
        return res.json(client);
    }

    async update(req: Request, res: Response) {
        const data = {
            ...req.body,
            active: req.body.active === "true" || req.body.active === true,
            avatar: req.file ? req.file.filename : req.body.avatar
        };
        const client = await clientService.update(req.params.id, data);
        return res.json(client);
    }

    async getHistory(req: Request, res: Response) {
        const history = await clientService.getHistory(req.params.id);
        return res.json(history);
    }

    async delete(req: Request, res: Response) {
        await clientService.delete(req.params.id);
        return res.status(204).send();
    }

    async bulkCreate(req: Request, res: Response) {
        const clients = await clientService.bulkCreate(req.body);
        return res.status(201).json(clients);
    }
}
