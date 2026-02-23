import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";
import { v4 as uuid } from "uuid";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    name!: string;

    @Column({ unique: true })
    email!: string;

    @Column({ select: false })
    password!: string;

    @Column()
    role!: "admin" | "user";

    @CreateDateColumn()
    created_at!: Date;

    constructor() {
        if (!this.id) {
            this.id = uuid();
        }
    }
}
