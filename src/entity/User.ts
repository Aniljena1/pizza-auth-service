import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Teant } from "./Tenant";

@Entity()
export class User {
   @PrimaryGeneratedColumn()
   id: number;

   @Column()
   firstname: string;

   @Column()
   lastname: string;

   @Column({ unique: true })
   email: string;

   @Column({ select: false })
   password: string;

   @Column()
   role: string;

   @ManyToOne(() => Teant)
   tenant: Teant;
}
