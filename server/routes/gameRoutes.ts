import express from "express"
import { createGame, deleteGame, getAllGames, getGame } from "../controllers/gameController";
import { validateToken } from "../middleware/validateTokenHandler";

const gameRouter = express.Router();

gameRouter.use(validateToken);
gameRouter.route("/create-game").post(createGame);
gameRouter.route("/get-all-games").get(getAllGames);
gameRouter.route("/:id").get(getGame);
gameRouter.route("/:id").delete(deleteGame);

export { gameRouter };