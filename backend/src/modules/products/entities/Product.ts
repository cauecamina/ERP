import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";
import { v4 as uuid } from "uuid";

@Entity("products")
export class Product {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    name!: string;

    @Column("decimal", { precision: 10, scale: 2 })
    price!: number;

    @Column()
    stock!: number;

    @CreateDateColumn()
    created_at!: Date;

    constructor() {
        if (!this.id) {
            this.id = uuid();
        }
    }
}
