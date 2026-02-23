import { accountReceivableRepository } from "../repositories/AccountReceivableRepository";
import { CustomError } from "../../../middlewares/errorMiddleware";

export class AccountReceivableService {
    async list() {
        return await accountReceivableRepository.find({ relations: ["order", "order.client"] });
    }

    async markAsPaid(id: string) {
        const receivable = await accountReceivableRepository.findOneBy({ id });
        if (!receivable) throw new CustomError("Receivable not found", 404);

        receivable.status = "paid";
        await accountReceivableRepository.save(receivable);
        return receivable;
    }
}
