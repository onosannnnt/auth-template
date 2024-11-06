import "reflect-metadata";
import { DataSource } from "typeorm";
import { db_host, db_name, db_password, db_port, db_user } from "./config/env";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: db_host,
  port: db_port,
  username: db_user,
  password: db_password,
  database: db_name,
  // on Prooduction, Turn this off
  synchronize: true,
  logging: false,
  entities: ["src/entity/**/*.ts"],
  // on Production, create migration when database change like column
  migrations: [],
  subscribers: [],
});
