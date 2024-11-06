import { AppDataSource } from "./data-source";
import * as express from "express";
import * as cookieParser from "cookie-parser";
import userRouter from "./routers/user";
import { db_host, port } from "./config/env";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/user", userRouter);

AppDataSource.initialize()
  .then(async () => {
    app.listen(port, () => {
      console.log(`Database connected to ${db_host}`);
      console.log(`Server started at http://localhost:${port}`);
    });
  })
  .catch((error) => console.log(error));
