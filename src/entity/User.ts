import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Cookie } from "./cookie";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid", {
    name: "ID",
  })
  id: string;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  role: string;

  @OneToMany(() => Cookie, (Cookie) => Cookie.id, {
    onDelete: "CASCADE",
  })
  cookies: Cookie[];
}
