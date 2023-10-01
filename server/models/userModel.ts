import mongoose, { Schema } from "mongoose";
import { Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  username: string;
  password: string;
  games: Array<Schema.Types.ObjectId>;
  refreshTokens: string[];
  invalidatedTokens: string[];
  session: {
    sessionId: string;
    current: boolean;
    startTime: Date;
    endTime: Date | null;
  };
}
export interface ActiveUser extends IUser {
  id?: object | string
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "add email"],
      unique: [true, "email already in use"]
    },
    username: {
      type: String,
      required: [true, "add username"],
    },
    password: {
      type: String,
      required: [true, "add password"]
    },
    games: [{
      type: Schema.Types.ObjectId,
      ref: 'Game',
    }],
    refreshTokens: {
      type: [String]
    },
    invalidatedTokens: {
      type: [String]
    },
    session: {
      sessionId: {
        type: String,
        default: null,
      },
      current: {
        type: Boolean,
        default: false,
      },
      startTime: {
        type: Date,
        default: null,
      },
      endTime: {
        type: Date,
        default: null,
      },
    },
  }, 
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>('User', userSchema);
