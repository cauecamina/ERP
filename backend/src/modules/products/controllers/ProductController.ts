import { Request, Response } from "express";
import { ProductService } from "../services/ProductService";

const productService = new ProductService();

export class ProductController {
    async create(req: Request, res: Response) {
        const data = {
            ...req.body,
            image: req.file ? req.file.filename : undefined
        };
        const product = await productService.create(data);
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
        const data = {
            ...req.body,
            image: req.file ? req.file.filename : req.body.image
        };
        const product = await productService.update(req.params.id, data);
        return res.json(product);
    }

    async delete(req: Request, res: Response) {
        await productService.delete(req.params.id);
        return res.status(204).send();
    }
}
