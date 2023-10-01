import express from "express";
import { getAllUsers, fieldExists, updateUser, deleteUser, currentUser, getLoggedInUsers } from "../controllers/userController";
import { validateToken } from "../middleware/validateTokenHandler";

const userRouter = express.Router();
userRouter.route("/").get(getAllUsers);
userRouter.get("/current-user", validateToken, currentUser);  
userRouter.get("/logged-in", validateToken, getLoggedInUsers)
userRouter.route("/exists/:fieldName/:value").get(fieldExists);
//userRouter.route("/:id").get(getUser);
userRouter.route("/:id").put(updateUser);
userRouter.route("/:id").delete(deleteUser);

export {userRouter}