import { Request, Response } from 'express';
import { HttpStatusCode } from '../constants';
import asyncHandler from 'express-async-handler';
import User from "../models/userModel";
import bcrypt from 'bcrypt';
import type { ActiveUser } from '../models/userModel';
import mongoose from 'mongoose';

interface RequestWithUser extends Request {
  user?: ActiveUser;
}

//@desc Get a single User record
//@route GET /api/user/:id
//@access public
export const getAllUsers = asyncHandler( async (req: Request, res: Response) => {
  const users = await User.find({});
  if (users) {
    res.status(HttpStatusCode.SUCCESS).json(users);
  }
  else {
    res.status(HttpStatusCode.NOT_FOUND);
    throw new Error("User not found");
  }
});

//@desc Get all currently logged in users
//@route GET /api/user/logged-in
//@access public
export const getLoggedInUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await User.find({ 'session.current': true });
  if (users) {
    const usernames = users.map(user => user.username);
    res.status(HttpStatusCode.SUCCESS).json(usernames);
  } 
  else {
    res.status(HttpStatusCode.NOT_FOUND);
    throw new Error("No users are currently logged in");
  }
});

/** 
//@desc Get a single User record by id
//@route GET /api/user/:id
//@access public
export const getUser = asyncHandler( async (req: Request, res: Response) => {
  const userId = req.params.id;
  console.log(`in getUser#######: userId is ${userId}`)
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(HttpStatusCode.VALIDATION_ERROR);
    throw new Error("Invalid user ID");
  }
  const user = await User.findById(req.params.id);
  if(user) {
    res.status(HttpStatusCode.SUCCESS).json(user);
  } 
  else {
    res.status(HttpStatusCode.NOT_FOUND);
    throw new Error("User not found");
  }
});
*/

//@desc Check if a field value already exists on a user
//@route get /api/user/exists/:fieldName/:value
//@access public
export const fieldExists = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findOne({ [req.params.fieldName]: req.params.value});
  if (user) {
    res.status(HttpStatusCode.SUCCESS).json({ exists: true });
  } 
  else {
    res.status(HttpStatusCode.SUCCESS).json({ exists: false });
  }
});

//@desc Update a User record
//@route PUT /api/user/:id
//@access public
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, username, password } = req.body;
  const user = await User.findById(req.params.id);
  if (user) {
    const saltRounds = process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS, 10) : 10;
    try {
      console.log(`In updateUser, the old hashedpassword is ${user.password}`);
      console.log(`In updateUser, the new password is ${password}`);
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedUpdatedPassword = await bcrypt.hash(password, salt);
      console.log(`In updateUser, the new hashed password is ${hashedUpdatedPassword}`);
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { email, username, password: hashedUpdatedPassword },
        { new: true }
      )
      if(updatedUser) {
        res.status(HttpStatusCode.SUCCESS).json({ id: updatedUser._id, email: updatedUser.email, username: updatedUser.username })
      }
      else {
        res.status(HttpStatusCode.SERVER_ERROR);
        throw new Error("Problem updating user");
      }
    }
    catch (error) {
      res.status(HttpStatusCode.SERVER_ERROR);
      throw new Error(`Problem updating user: ${error}`);
    }
  }
  else{
    res.status(HttpStatusCode.NOT_FOUND);
    throw new Error("User not found");
  }
});

//@desc Delete a User record
//@route DELETE /api/user/:id
//@access public
export const deleteUser = asyncHandler( async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);

  if (user){
    await User.deleteOne({_id: req.params.id});
    res.status(HttpStatusCode.SUCCESS).json({message: "User successfully deleted"});
  }
  else {
    res.status(HttpStatusCode.NOT_FOUND);
    throw new Error("User not found");
  }
});

//@desc The current user's info
//@route GET /api/auth/current-user
//@access private
export const currentUser = asyncHandler(async (req: RequestWithUser, res: Response) => {
  res.status(HttpStatusCode.SUCCESS).json(req.user); 

});
