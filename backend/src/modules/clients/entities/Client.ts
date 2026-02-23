import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";
import { v4 as uuid } from "uuid";

@Entity("clients")
export class Client {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    name!: string;

    @Column({ unique: true })
    cpf_cnpj!: string;

    @Column()
    email!: string;

    @Column()
    phone!: string;

    @CreateDateColumn()
    created_at!: Date;

    constructor() {
        if (!this.id) {
            this.id = uuid();
        }
    }
}
