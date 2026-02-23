import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { v4 as uuid } from "uuid";
import { Order } from "../../orders/entities/Order";

@Entity("accounts_receivable")
export class AccountReceivable {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    order_id!: string;

    @ManyToOne(() => Order)
    @JoinColumn({ name: "order_id" })
    order!: Order;

    @Column()
    due_date!: Date;

    @Column("decimal", { precision: 10, scale: 2 })
    amount!: number;

    @Column({ default: "open" })
    status!: "open" | "paid";

    @CreateDateColumn()
    created_at!: Date;

    constructor() {
        if (!this.id) {
            this.id = uuid();
        }
    }
}
