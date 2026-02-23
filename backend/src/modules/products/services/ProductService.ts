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

    async delete(id: string) {
        const product = await this.findById(id);
        await productRepository.remove(product);
    }
}
