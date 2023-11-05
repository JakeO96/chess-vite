import { Request, Response } from 'express';
import { HttpStatusCode } from '../constants'
import asyncHandler from 'express-async-handler'
import User from "../models/userModel";
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

//@desc Create a User
//@route POST /api/auth/register
//@access public
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, username, password } = req.body;
  if ( !email || !username || !password ) {
    res.status(HttpStatusCode.VALIDATION_ERROR);
    throw new Error("Missing required fields")
  }
  const userAlreadyExists = await User.findOne({ email });
  if (userAlreadyExists) {
    res.status(HttpStatusCode.VALIDATION_ERROR);
    throw new Error("User already exists")
  }

  const saltRounds = process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS, 10) : 10;
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = new User({
      email: email,
      username: username,
      password: hashedPassword,
    });
    await user.save();
    res.status(HttpStatusCode.RECORD_CREATED).json({success: true});
  } catch (error) {
    res.status(HttpStatusCode.SERVER_ERROR);
    throw new Error(`Problem storing password ${error}`);
  }
});

//@desc Log a User in
//@route POST /api/auth/login
//@access public
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  const user = await User.findOne({ email });

  if(user && (await bcrypt.compare(password, user.password))) {
    const secret = process.env.JWT_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if(secret && refreshSecret) {
      const sessionId = uuidv4();
      const accessToken = jwt.sign(
        {
          user: {
            email: user.email,
            username: user.username,
            id: user._id,
            sessionId: sessionId,
          },
        }, 
        secret,
        {expiresIn: "15m"}
      );

      const refreshToken = jwt.sign(
        {
          user: {
            id: user._id,
          },
        }, 
        refreshSecret,
        {expiresIn: "7d"}
      );

      // Store the refresh token in the database
      user.refreshTokens.push(refreshToken);
      user.session = {
        sessionId,
        current: true,
        startTime: new Date(),
        endTime: null,
      };
      await user.save();

      // Set the JWT and refresh token in HttpOnly cookies
      res.cookie('token', accessToken, { httpOnly: true, sameSite:  "none", secure: true});
      res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: "none", secure: true});

      res.status(HttpStatusCode.SUCCESS).json({success: true, username: user.username});
    }
    else {
      res.status(HttpStatusCode.SERVER_ERROR);
      throw new Error("There was a problem processing your request");
    }
  }
  else {
    res.status(HttpStatusCode.UNAUTHORIZED);
    throw new Error("Invalid credentials");
  }
});

//@desc Log a User out
//@route POST /api/auth/logout
//@access public
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token: string = req.cookies.refreshToken;
  
  // Get the user from the database
  const user = await User.findOne({ 'refreshTokens': token });
  console.log(`in authCOntroller logout function the user fetched from DB is ${user}`)

  if(user) {
    // Add the token to the invalidatedTokens array in the database
    user.invalidatedTokens.push(token);
    // Remove the token from the refreshTokens array in the database
    user.refreshTokens = user.refreshTokens.filter(rt => rt !== token);
    user.session.endTime = new Date();
    await user.save();

    // Clear the token from the cookie
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    
    res.status(HttpStatusCode.SUCCESS).json({ success: true });
  }
  else {
    res.status(HttpStatusCode.UNAUTHORIZED);
    throw new Error("User not authorized");
  }
});

//@desc Refresh an access token
//@route POST /api/auth/refresh
//@access public
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  if(refreshSecret && refreshToken) {
    jwt.verify(refreshToken, refreshSecret, async (err: Error | null, decoded: any) => {
      if(err) {
        res.status(HttpStatusCode.UNAUTHORIZED);
        throw new Error("User not authorized");
      }
      if(decoded) {
        const payload = decoded as JwtPayload;
        const secret = process.env.JWT_SECRET;
        if(secret){
          const user = await User.findById(payload.user.id);
          // Check if the refresh token exists in the database
          if(user && user.refreshTokens.includes(refreshToken)) {
            const accessToken = jwt.sign(
              {
                user: {
                  email: user.email,
                  username: user.username,
                  id: user._id,
                },
              }, 
              secret,
              {expiresIn: "15m"}
            );
            
            // Generate a new refresh token
            const newRefreshToken = jwt.sign(
              {
                user: {
                  id: user._id,
                },
              }, 
              refreshSecret,
              {expiresIn: "7d"}
            );
            
            // Replace the old refresh token with the new one in the database
            user.refreshTokens = user.refreshTokens.map(rt => rt === refreshToken ? newRefreshToken : rt);
            await user.save();
            
            // Set the JWT and refresh token in HttpOnly cookies
            res.cookie('token', accessToken, { httpOnly: true, sameSite:  "none", secure: true});
            res.cookie('refreshToken', newRefreshToken, { httpOnly: true, sameSite:  "none", secure: true});
            
            res.status(HttpStatusCode.SUCCESS).json({ accessToken, refreshToken: newRefreshToken });
          }
          else {
            res.status(HttpStatusCode.UNAUTHORIZED);
            throw new Error("User not authorized");
          }
        }
        else {
          res.status(HttpStatusCode.SERVER_ERROR);
          throw new Error("There was a problem processing your request");
        }
      }
    });
  }
  else {
    res.status(HttpStatusCode.UNAUTHORIZED);
    throw new Error("User not authorized");
  }
});