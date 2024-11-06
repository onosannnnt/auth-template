import { StatusCodes } from "./../enum/statusCode";
import { cookiesConfig, jwtSecret } from "./../config/auth";
import { Response } from "express";
import { Request } from "express";
import { AppDataSource } from "../data-source";
import { User } from "./../entity/User";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { salt } from "../config/auth";
import { Cookie } from "../entity/cookie";
import * as jwt from "jsonwebtoken";

export class auth {
  private userRepository: Repository<User>;
  private cookieRepository: Repository<Cookie>;
  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.cookieRepository = AppDataSource.getRepository(Cookie);
  }

  //   register = async (req: Request, res: Response) => {
  register = async (req: Request, res: Response) => {
    const { email, password, firstname, lastname, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }
    if ((await this.userRepository.find(email)).length !== 0) {
      return res.status(StatusCodes.conflict).send({
        error: "This email is already use",
      });
    }
    try {
      const user = new User();
      user.email = email;
      user.password = await bcrypt.hash(password, salt);
      user.firstname = firstname;
      user.lastname = lastname;
      user.role = role;
      const payload = {
        id: user.id,
      };
      const token = jwt.sign(payload, jwtSecret, { algorithm: "HS256" });
      const cookie = new Cookie();
      cookie.id = token;
      cookie.user = user;
      await this.userRepository.save(user);
      await this.cookieRepository.save(cookie);
      return res
        .status(201)
        .cookie("token", token, cookiesConfig)
        .send({ message: "สร้างบัญชีผู้ใช้สำเร็จ" });
    } catch (error) {
      return res.status(StatusCodes.serverError).send({
        error: error.message,
      });
    }
  };
  me = async (req: Request, res: Response) => {
    const token = req.cookies.token;
    try {
      const response = await this.cookieRepository
        .createQueryBuilder("cookie")
        .leftJoinAndSelect("cookie.user", "user")
        .select("cookie")
        .addSelect("user.id")
        .addSelect("user.email")
        .addSelect("user.firstname")
        .addSelect("user.lastname")
        .addSelect("user.role")
        .where("cookie.id = :token", { token })
        .getOne();
      return res.status(StatusCodes.ok).send(response);
    } catch (error) {
      return res.status(StatusCodes.serverError).send({
        message: error.message,
      });
    }
  };
  login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
      if (!email || !password) {
        return res.status(StatusCodes.badRequest).send({
          message: "Please enter email and password",
        });
      }
      const user = await this.userRepository
        .createQueryBuilder("user")
        .where("user.email = :email", { email })
        .getOne();
      if (!user) {
        return res
          .status(StatusCodes.notFound)
          .send({ message: "email or password in invalid" });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res
          .status(StatusCodes.notFound)
          .send({ message: "email or password in invalid" });
      }
      const payload = {
        id: user.id,
      };
      const token = jwt.sign(payload, jwtSecret, { algorithm: "HS256" });
      const cookie = new Cookie();
      cookie.id = token;
      cookie.user = user;
      await this.cookieRepository.delete({
        user: user,
      });
      await this.cookieRepository.save(cookie);
      return res
        .status(StatusCodes.ok)
        .cookie("token", token, cookiesConfig)
        .send({ message: "Login success" });
    } catch (error) {
      return res.status(StatusCodes.serverError).send({
        message: error.message,
      });
    }
  };
  logout = async (req: Request, res: Response) => {
    try {
      const token = req.cookies.token;
      await this.cookieRepository.delete(token);
      console.log();
      return res
        .status(StatusCodes.ok)
        .clearCookie("token")
        .send({ message: "Logout success" });
    } catch (error) {
      return res.status(StatusCodes.serverError).send({
        message: error.message,
      });
    }
  };
}
