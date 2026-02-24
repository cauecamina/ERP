import { accountReceivableRepository } from "../repositories/AccountReceivableRepository";
import { CustomError } from "../../../middlewares/errorMiddleware";
import { AppDataSource } from "../../../database/data-source";
import { Order } from "../../orders/entities/Order";

export class AccountReceivableService {
    async list() {
        return await accountReceivableRepository.find({ relations: ["order", "order.client"] });
    }

    async markAsPaid(id: string) {
        const receivable = await accountReceivableRepository.findOne({
            where: { id },
            relations: ["order"]
        });
        if (!receivable) throw new CustomError("Receivable not found", 404);

        receivable.status = "paid";
        receivable.paid_at = new Date();
        await accountReceivableRepository.save(receivable);

        // Sync with order
        if (receivable.order) {
            receivable.order.status = "invoiced";
            await AppDataSource.getRepository(Order).save(receivable.order);
        }

        return receivable;
    }
}
