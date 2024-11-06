import { Router, Request, Response } from "express";
import { auth } from "../controllers/auth";
import { middleware } from "../middleware/auth";

const router = Router();
const AuthController = new auth();
const MiddlewareController = new middleware();

router.get("/", (req: Request, res: Response) => {
  res.send("Hello from user route");
});
router.post("/register", AuthController.register);
router.get("/me", MiddlewareController.isExist, AuthController.me);
router.post("/login", AuthController.login);
router.post("/logout", MiddlewareController.isExist, AuthController.logout);

export default router;
