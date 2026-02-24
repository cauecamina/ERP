import { Router } from "express";
import { ClientController } from "../controllers/ClientController";
import { authMiddleware } from "../../../middlewares/authMiddleware";
import multer from "multer";
import uploadConfig from "../../../config/upload";

const clientRoutes = Router();
const clientController = new ClientController();
const upload = multer(uploadConfig);

clientRoutes.use(authMiddleware);

clientRoutes.get("/", clientController.list);
clientRoutes.get("/:id", clientController.show);
clientRoutes.post("/", upload.single("avatar"), clientController.create);
clientRoutes.put("/:id", upload.single("avatar"), clientController.update);
clientRoutes.delete("/:id", clientController.delete);

export { clientRoutes };
