import express from "express"
import { validateToken } from "../middleware/validateTokenHandler"
import { createUser, login, logout, refresh } from "../controllers/authController";

const authRouter = express.Router();

authRouter.route("/register").post(createUser);
authRouter.route("/login").post(login);
authRouter.route("/refresh").post(refresh);
authRouter.route("/logout").post(logout);

export { authRouter }