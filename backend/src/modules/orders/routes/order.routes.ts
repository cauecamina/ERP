import { Router } from "express";
import { OrderController } from "../controllers/OrderController";
import { authMiddleware } from "../../../middlewares/authMiddleware";

const orderRoutes = Router();
const orderController = new OrderController();

orderRoutes.use(authMiddleware);

orderRoutes.post("/", orderController.create);
orderRoutes.get("/", orderController.list);
orderRoutes.patch("/:id/status", orderController.updateStatus);

export { orderRoutes };
