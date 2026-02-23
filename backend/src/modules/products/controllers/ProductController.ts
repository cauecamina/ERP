import { Request, Response } from "express";
import { ProductService } from "../services/ProductService";

const productService = new ProductService();

export class ProductController {
    async create(req: Request, res: Response) {
        const product = await productService.create(req.body);
        return res.status(201).json(product);
    }

    async list(req: Request, res: Response) {
        const products = await productService.list();
        return res.json(products);
    }

    async show(req: Request, res: Response) {
        const product = await productService.findById(req.params.id);
        return res.json(product);
    }

    async update(req: Request, res: Response) {
        const product = await productService.update(req.params.id, req.body);
        return res.json(product);
    }

    async delete(req: Request, res: Response) {
        await productService.delete(req.params.id);
        return res.status(204).send();
    }
}
