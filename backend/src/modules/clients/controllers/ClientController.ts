import { Request, Response } from "express";
import { ClientService } from "../services/ClientService";

const clientService = new ClientService();

export class ClientController {
    async create(req: Request, res: Response) {
        const client = await clientService.create(req.body);
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
        const client = await clientService.update(req.params.id, req.body);
        return res.json(client);
    }

    async delete(req: Request, res: Response) {
        await clientService.delete(req.params.id);
        return res.status(204).send();
    }
}
