import { Request, Response } from "express";
import { AccountReceivableService } from "../services/AccountReceivableService";

const receivableService = new AccountReceivableService();

export class AccountReceivableController {
    async list(req: Request, res: Response) {
        const receivables = await receivableService.list();
        return res.json(receivables);
    }

    async pay(req: Request, res: Response) {
        const receivable = await receivableService.markAsPaid(req.params.id);
        return res.json(receivable);
    }
}
