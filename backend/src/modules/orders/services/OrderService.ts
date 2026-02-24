import { AppDataSource } from "../../../database/data-source";
import { Order } from "../entities/Order";
import { OrderItem } from "../entities/OrderItem";
import { productRepository } from "../../products/repositories/ProductRepository";
import { orderRepository } from "../repositories/OrderRepository";
import { accountReceivableRepository } from "../../accounts-receivable/repositories/AccountReceivableRepository";
import { CustomError } from "../../../middlewares/errorMiddleware";

export class OrderService {
    async create(
        client_id: string,
        items: { product_id: string; quantity: number }[],
        additionalData: {
            vendedor?: string,
            discount_value?: number,
            billing_preview_date?: string
        } = {}
    ) {
        return await AppDataSource.transaction(async (manager) => {
            let total_value = 0;
            const orderItems: OrderItem[] = [];

            for (const item of items) {
                const product = await manager.findOneBy(productRepository.target, { id: item.product_id });

                if (!product) {
                    throw new CustomError(`Product ${item.product_id} not found`, 404);
                }

                if (product.stock < item.quantity) {
                    throw new CustomError(`Insufficient stock for product ${product.name}`, 400);
                }

                // Calculate total
                const unit_price = Number(product.price);
                total_value += unit_price * item.quantity;

                // Decrease stock
                product.stock -= item.quantity;
                await manager.save(product);

                // Create order item
                const orderItem = manager.create(OrderItem, {
                    product_id: product.id,
                    quantity: item.quantity,
                    unit_price,
                });
                orderItems.push(orderItem);
            }

            // Create order
            const order = manager.create(Order, {
                client_id,
                total_value: total_value - (Number(additionalData.discount_value) || 0),
                discount_value: Number(additionalData.discount_value) || 0,
                vendedor: additionalData.vendedor,
                billing_preview_date: additionalData.billing_preview_date ? new Date(additionalData.billing_preview_date) : undefined,
                items: orderItems,
            });

            await manager.save(order);

            // Create account receivable
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 30); // Default 30 days

            const receivable = manager.create(accountReceivableRepository.target, {
                order_id: order.id,
                amount: total_value,
                due_date: dueDate,
                status: "open",
            });

            await manager.save(receivable);

            return order;
        });
    }

    async list() {
        return await orderRepository.find({ relations: ["client", "items", "items.product"] });
    }

    async updateStatus(id: string, status: "pending" | "picking" | "to_invoice" | "invoiced" | "delivery" | "delivered" | "canceled") {
        const order = await orderRepository.findOneBy({ id });
        if (!order) throw new CustomError("Order not found", 404);

        order.status = status;
        await orderRepository.save(order);
        return order;
    }
}
