import "express-async-errors";
import express from "express";
import cors from "cors";
import { errorMiddleware } from "./middlewares/errorMiddleware";
import { userRoutes } from "./modules/users/routes/user.routes";
import { clientRoutes } from "./modules/clients/routes/client.routes";
import { productRoutes } from "./modules/products/routes/product.routes";
import { orderRoutes } from "./modules/orders/routes/order.routes";
import { receivableRoutes } from "./modules/accounts-receivable/routes/receivable.routes";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/users", userRoutes);
app.use("/clients", clientRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/receivables", receivableRoutes);

// Error Middleware
app.use(errorMiddleware);

export { app };
