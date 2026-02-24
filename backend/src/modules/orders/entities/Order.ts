import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { v4 as uuid } from "uuid";
import { Client } from "../../clients/entities/Client";
import { OrderItem } from "./OrderItem";

@Entity("orders")
export class Order {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    client_id!: string;

    @ManyToOne(() => Client)
    @JoinColumn({ name: "client_id" })
    client!: Client;

    @Column("decimal", { precision: 10, scale: 2 })
    total_value!: number;

    @Column("decimal", { precision: 10, scale: 2, default: 0 })
    discount_value!: number;

    @Column({
        type: "enum",
        enum: ["pending", "picking", "to_invoice", "invoiced", "delivery", "delivered", "canceled"],
        default: "pending"
    })
    status!: "pending" | "picking" | "to_invoice" | "invoiced" | "delivery" | "delivered" | "canceled";

    @Column({ nullable: true })
    vendedor?: string;

    @Column({ type: "date", nullable: true })
    billing_preview_date?: Date;

    @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
    items!: OrderItem[];

    @CreateDateColumn()
    created_at!: Date;

    constructor() {
        if (!this.id) {
            this.id = uuid();
        }
    }
}
