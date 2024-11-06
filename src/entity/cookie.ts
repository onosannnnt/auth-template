import { Entity, Column, PrimaryColumn, ManyToOne } from "typeorm";
import { User } from "./User";

@Entity()
export class Cookie {
  @PrimaryColumn()
  id: string;

  @Column({ default: new Date() })
  createdAt: Date;

  @Column({ default: new Date(new Date().setDate(new Date().getDate() + 3)) })
  expiredAt: Date;

  @ManyToOne(() => User, (User) => User.id, {
    onDelete: "CASCADE",
  })
  user: User;
}
