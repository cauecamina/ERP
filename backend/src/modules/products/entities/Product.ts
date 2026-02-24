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

    @Column("decimal", { precision: 10, scale: 2, default: 0 })
    min_stock!: number;

    @Column({ nullable: true })
    sku?: string;

    @Column({ nullable: true })
    ean?: string;

    @Column({ default: "un" })
    unit!: string;

    @Column({ nullable: true })
    ncm?: string;

    @Column({ nullable: true })
    family?: string;

    @Column({ default: "simple" })
    type!: "simple" | "kit" | "variation";

    @Column("text", { nullable: true })
    observations?: string;

    @Column({ default: true })
    active!: boolean;

    @Column({ default: true })
    show_image!: boolean;

    @Column({ nullable: true })
    image?: string;

    @CreateDateColumn()
    created_at!: Date;

    constructor() {
        if (!this.id) {
            this.id = uuid();
        }
    }
}
