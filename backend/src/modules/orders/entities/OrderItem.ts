import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { v4 as uuid } from "uuid";
import { Order } from "./Order";
import { Product } from "../../products/entities/Product";

@Entity("order_items")
export class OrderItem {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    order_id!: string;

    @ManyToOne(() => Order)
    @JoinColumn({ name: "order_id" })
    order!: Order;

    @Column()
    product_id!: string;

    @ManyToOne(() => Product)
    @JoinColumn({ name: "product_id" })
    product!: Product;

    @Column()
    quantity!: number;

    @Column("decimal", { precision: 10, scale: 2 })
    unit_price!: number;

    constructor() {
        if (!this.id) {
            this.id = uuid();
        }
    }
}
