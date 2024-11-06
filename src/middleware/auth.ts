import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { Repository } from "typeorm";
import * as jwt from "jsonwebtoken";
import { User } from "../entity/User";
import { ROLE_TYPE, USER_ID } from "../config/constance";
import { Cookie } from "../entity/cookie";
import { StatusCodes } from "../enum/statusCode";

export class middleware {
  private cookieRepository: Repository<Cookie>;
  private userRepository: Repository<User>;
  private loginMessage = "Please login first";
  constructor() {
    this.cookieRepository = AppDataSource.getRepository(Cookie);
    this.userRepository = AppDataSource.getRepository(User);
  }

  isExist = async (req: Request, res: Response, next: NextFunction) => {
    const token = String(req.cookies.token);
    if (!token) {
      return res.status(401).send({ message: "Please login first" });
    }
    try {
      const payload = await jwt.verify(token, process.env.JWT_SECRET);
      const now = new Date();
      const user = await this.userRepository.findOne({
        where: { id: payload.id },
      });
      const cookie = await this.cookieRepository
        .createQueryBuilder("cookie")
        .leftJoinAndSelect("cookie.user", "user")
        .where("cookie.id = :id", { id: token })
        .andWhere("cookie.createdAt <= :time", { time: now })
        .andWhere("cookie.expiredAt >= :time", { time: now })
        .getOne();
      if (!cookie && !user) {
        return res
          .status(StatusCodes.notFound)
          .send({ message: "Session expire" });
      }
      req[USER_ID] = user.id;
      req[ROLE_TYPE] = user.role;
      next();
    } catch (error) {
      return res
        .status(StatusCodes.unAuthorized)
        .send({ message: this.loginMessage, error: error.message });
    }
  };

  isAdmin = (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req[ROLE_TYPE] !== "admin") {
        return res
          .status(StatusCodes.forbidden)
          .json({ message: "You have not grant accress" });
      }
      next();
    } catch (error) {
      return res
        .status(StatusCodes.unAuthorized)
        .send({ message: this.loginMessage });
    }
  };
}
