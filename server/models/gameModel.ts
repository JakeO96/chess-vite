import mongoose, { Schema } from "mongoose";
import { Document } from "mongoose";

export interface IGame extends Document {
  playerId: Schema.Types.ObjectId;
  opponentId: Schema.Types.ObjectId;
  moves: string[];
}


const gameSchema = new mongoose.Schema(
  {
    challengerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true],
      ref: "User",
    },
    opponentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true],
      ref: "User",
    },
    moves: {
      type: [String],
      required: [true],
    },
  }, 
  {
    timestamps: true,
  }
);

export default mongoose.model<IGame>('Game', gameSchema);