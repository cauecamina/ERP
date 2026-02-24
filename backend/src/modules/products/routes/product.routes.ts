import { Router } from "express";
import { ProductController } from "../controllers/ProductController";
import { authMiddleware } from "../../../middlewares/authMiddleware";
import multer from "multer";
import uploadConfig from "../../../config/upload";

const productRoutes = Router();
const productController = new ProductController();
const upload = multer(uploadConfig);

productRoutes.use(authMiddleware);

productRoutes.get("/", productController.list);
productRoutes.get("/:id", productController.show);
productRoutes.post("/", upload.single("image"), productController.create);
productRoutes.put("/:id", upload.single("image"), productController.update);
productRoutes.delete("/:id", productController.delete);

export { productRoutes };
