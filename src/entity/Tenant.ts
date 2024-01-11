import {
   Entity,
   PrimaryGeneratedColumn,
   Column,
   UpdateDateColumn,
   CreateDateColumn,
} from "typeorm";

@Entity({ name: "teants" })
export class Teant {
   @PrimaryGeneratedColumn()
   id: number;

   @Column("varchar", { length: 100 })
   name: string;

   @Column("varchar", { length: 255 })
   address: string;

   @UpdateDateColumn()
   updatedAt: number;

   @CreateDateColumn()
   createdAt: number;
}
