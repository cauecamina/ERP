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

    @Column({ nullable: true })
    fantasy_name?: string;

    @Column({ nullable: true })
    contact_name?: string;

    @Column({ nullable: true })
    ddd?: string;

    @Column()
    phone!: string;

    @Column()
    email!: string;

    @Column({ nullable: true })
    street?: string;

    @Column({ nullable: true })
    number?: string;

    @Column({ nullable: true })
    neighborhood?: string;

    @Column({ nullable: true })
    complement?: string;

    @Column({ nullable: true })
    city?: string;

    @Column({ nullable: true })
    state?: string;

    @Column({ nullable: true })
    zip_code?: string;

    @Column({ default: true })
    active!: boolean;

    @Column({ nullable: true })
    avatar?: string;

    @CreateDateColumn()
    created_at!: Date;

    constructor() {
        if (!this.id) {
            this.id = uuid();
        }
    }
}
