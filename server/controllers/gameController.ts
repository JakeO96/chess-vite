import { Request, Response } from 'express'
import { HttpStatusCode } from '../constants'
import asyncHandler from 'express-async-handler'
import Game from '../models/gameModel'
import User from '../models/userModel'
import type { ActiveUser } from '../models/userModel'
import { Player } from '../../shared/game-utils'

interface RequestWithUser extends Request {
  user?: ActiveUser;
}

//@desc Create a Game record
//@route POST /api/game/create-game
//@access private
const createGame = asyncHandler( async (req: RequestWithUser, res: Response) => {
  console.log("createGame ine express-api firing")
  const startGameData = req.body;
  if ( !startGameData.challenger || !startGameData.opponent ) {
    res.status(HttpStatusCode.VALIDATION_ERROR);
    throw new Error("Missing required fields");
  }
  
  const deserializedOpponent = Player.fromJSON(startGameData.opponent);
  const deserializedChallenger = Player.fromJSON(startGameData.challenger);

  const opponent = await User.findOne({ username: deserializedOpponent.name });
  if (!opponent) {
    res.status(HttpStatusCode.VALIDATION_ERROR);
    throw new Error("Some user does not exist");
  }

  const challenger = await User.findOne({ username: deserializedChallenger.name});
  if (!challenger){
    res.status(HttpStatusCode.VALIDATION_ERROR);
    throw new Error("Some user does not exist");
  }

  const game = new Game({
    challengerId: challenger._id,
    opponentId: opponent._id,
    moves: [],
  });

  await game.save();

  await User.findByIdAndUpdate(challenger._id, { $push: { games: game._id } });
  await User.findByIdAndUpdate(opponent._id, { $push: { games: game._id } });
  
  res.status(HttpStatusCode.RECORD_CREATED).json({gameId: game._id});
})

//@desc Get all Game records for a User
//@route GET /api/game/create-game
//@access private
const getAllGames = asyncHandler( async (req: RequestWithUser, res: Response) => {
  if(req.user) {
    const users = await Game.find({player_id: req.user.id});
    if (users) {
      res.status(HttpStatusCode.SUCCESS).json(users);
    }
    else {
      res.status(HttpStatusCode.NOT_FOUND);
      throw new Error("User not found");
    }
  }
})

//@desc Get a single Game record
//@route GET /api/game/:id
//@access public
const getGame = asyncHandler( async (req: Request, res: Response) => {
  const game = await Game.findById(req.params.id);
  if(game) {
    res.status(HttpStatusCode.SUCCESS).json(game);
  } 
  else {
    res.status(HttpStatusCode.NOT_FOUND);
    throw new Error("Game not found");
  }
});

//@desc Delete a Game record
//@route DELETE /api/game/:id
//@access privtae
const deleteGame = asyncHandler( async (req: RequestWithUser, res: Response) => {
  const game= await Game.findById(req.params.id);
  if (game){
    if(req.user && req.user.id) {
      if(game.playerId.toString() === req.user.id) {
        await Game.deleteOne({_id: req.params.id});
        res.status(HttpStatusCode.SUCCESS).json({message: "User successfully deleted"});
      }
      else {
        res.status(HttpStatusCode.FORBIDDEN)
        throw new Error("Forbidden action")
      }
    }
  }
  else {
    res.status(HttpStatusCode.NOT_FOUND);
    throw new Error("User not found");
  }
});

export { createGame, getAllGames, getGame, deleteGame }