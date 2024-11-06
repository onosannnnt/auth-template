import * as dotenv from "dotenv";

dotenv.config();

//application setting
export const port = Number(process.env.PORT);

// database setting
export const db_host = process.env.HOST;
export const db_port = Number(process.env.DB_PORT);
export const db_user = process.env.DB_USER;
export const db_password = process.env.DB_PASSWORD;
export const db_name = process.env.DB_NAME;
