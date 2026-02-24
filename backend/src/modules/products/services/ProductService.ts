import { productRepository } from "../repositories/ProductRepository";
import { CustomError } from "../../../middlewares/errorMiddleware";

export class ProductService {
    async create(data: any) {
        const product = productRepository.create(data);
        await productRepository.save(product);
        return product;
    }

    async list() {
        return await productRepository.find();
    }

    async findById(id: string) {
        const product = await productRepository.findOneBy({ id });
        if (!product) throw new CustomError("Product not found", 404);
        return product;
    }

    async update(id: string, data: any) {
        const product = await this.findById(id);
        Object.assign(product, data);
        await productRepository.save(product);
        return product;
    }

    async getHistory(id: string) {
        const { orderItemRepository } = require("../../orders/repositories/OrderRepository");
        return await orderItemRepository.find({
            where: { product_id: id },
            relations: ["order", "order.client"],
            order: {
                order: {
                    created_at: "DESC"
                }
            }
        });
    }

    async delete(id: string) {
        const product = await this.findById(id);

        // Check for sales history before deleting
        const { orderItemRepository } = require("../../orders/repositories/OrderRepository");
        const hasHistory = await orderItemRepository.findOneBy({ product_id: id });

        if (hasHistory) {
            throw new CustomError("Não é possível excluir um produto com histórico de vendas. Desative-o em vez disso.", 400);
        }

        await productRepository.remove(product);
    }

    async bulkCreate(data: any[]) {
        const products = productRepository.create(data);
        await productRepository.save(products);
        return products;
    }
}
