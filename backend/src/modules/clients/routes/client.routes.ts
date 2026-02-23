import { Router } from "express";
import { ClientController } from "../controllers/ClientController";
import { authMiddleware } from "../../../middlewares/authMiddleware";

const clientRoutes = Router();
const clientController = new ClientController();

clientRoutes.use(authMiddleware);

clientRoutes.post("/", clientController.create);
clientRoutes.get("/", clientController.list);
clientRoutes.get("/:id", clientController.show);
clientRoutes.put("/:id", clientController.update);
clientRoutes.delete("/:id", clientController.delete);

export { clientRoutes };
