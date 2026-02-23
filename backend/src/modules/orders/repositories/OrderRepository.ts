import { AppDataSource } from "../../../database/data-source";
import { Order } from "../entities/Order";
import { OrderItem } from "../entities/OrderItem";

export const orderRepository = AppDataSource.getRepository(Order);
export const orderItemRepository = AppDataSource.getRepository(OrderItem);
