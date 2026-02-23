import { Router } from "express";
import { AccountReceivableController } from "../controllers/AccountReceivableController";
import { authMiddleware } from "../../../middlewares/authMiddleware";

const receivableRoutes = Router();
const receivableController = new AccountReceivableController();

receivableRoutes.use(authMiddleware);

receivableRoutes.get("/", receivableController.list);
receivableRoutes.patch("/:id/pay", receivableController.pay);

export { receivableRoutes };
