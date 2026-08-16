import dotenv from 'dotenv'
import type { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from 'jsonwebtoken';
import userService from '../services/user.service.js';
import type { IAccesstoken } from '../interfaces/accessToken.interface.js';

dotenv.config({ path: '../../.env' });

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET ;

if (!ACCESS_TOKEN_SECRET) {
    throw new Error("Missing ACCESS_TOKEN_SECRET in environment");
}

const accessTokenSecret:string = ACCESS_TOKEN_SECRET;

export const verifyJWT = asyncHandler(async(req:Request, res:Response, next:NextFunction) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");

    if(!token) throw new ApiError(401,"Unauthorized Request");

    const decodeToken = jwt.verify(token,accessTokenSecret) as IAccesstoken;

    const user = await userService.findUserwithEmailOrUsercode(decodeToken.userCode);

    if(!user) throw new ApiError(401,'Invalid accesstoken');

    req.user = user;

    next();

})