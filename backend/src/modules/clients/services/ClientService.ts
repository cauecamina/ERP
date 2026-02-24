import { clientRepository } from "../repositories/ClientRepository";
import { CustomError } from "../../../middlewares/errorMiddleware";

export class ClientService {
    async create(data: any) {
        const client = clientRepository.create(data);
        await clientRepository.save(client);
        return client;
    }

    async list() {
        return await clientRepository.find();
    }

    async findById(id: string) {
        const client = await clientRepository.findOneBy({ id });
        if (!client) throw new CustomError("Client not found", 404);
        return client;
    }

    async update(id: string, data: any) {
        const client = await this.findById(id);
        Object.assign(client, data);
        await clientRepository.save(client);
        return client;
    }

    async getHistory(id: string) {
        const { orderRepository } = require("../../orders/repositories/OrderRepository");
        return await orderRepository.find({
            where: { client_id: id },
            relations: ["items", "items.product"],
            order: {
                created_at: "DESC"
            }
        });
    }

    async delete(id: string) {
        const client = await this.findById(id);
        await clientRepository.remove(client);
    }

    async bulkCreate(data: any[]) {
        const clients = clientRepository.create(data);
        await clientRepository.save(clients);
        return clients;
    }
}
