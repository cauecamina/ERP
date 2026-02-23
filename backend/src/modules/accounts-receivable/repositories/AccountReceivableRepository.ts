import { AppDataSource } from "../../../database/data-source";
import { AccountReceivable } from "../entities/AccountReceivable";

export const accountReceivableRepository = AppDataSource.getRepository(AccountReceivable);
