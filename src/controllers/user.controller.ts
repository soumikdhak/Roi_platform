import userService from "../services/user.service.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import type { Request, Response } from "express";
import { generateUserCode } from "../utils/genarateUserCode.js";
import { generatereferralCode } from "../utils/genarateReferralCode.js";
import { status } from "../constants/accountStatus.js";
import type { IUserPayload } from "../interfaces/IUserPayload.interface.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateAccess&RefreshToken.js";
import { User } from "../models/user.model.js";
import jwt from 'jsonwebtoken';
import type { IRefreshtoken } from "../interfaces/refreshToken.interface.js";

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!REFRESH_TOKEN_SECRET ) {
    throw new Error("Missing REFRESH_TOKEN_SECRET in environment");
}

const refreshTokenSecret: string = REFRESH_TOKEN_SECRET;

const registerUser = asyncHandler(async(req:Request,res:Response) => {
    const { fullName, email, mobileNumber, password} = req.body;

    const referrelCode = req.body?.referrelCode || '';

    const validate = [fullName, email, password];

    userService.validateField(validate,mobileNumber);
    
    await userService.userExists(email);

    const userCode = await generateUserCode();
    const referralCode = generatereferralCode();
    const referredBy = await userService.extractUserCodefromReferrelCode(referrelCode);

    const userPayload:IUserPayload = {
        fullName,
        email,
        mobileNumber,
        password,
        userCode,
        referralCode,
        referredBy,
        accountStatus:status.Active.code
    }

    const newUser = await userService.createUser(userPayload);

    const accessToken = generateAccessToken({
        userCode:newUser.userCode,
        email:newUser.email,
        fullName:newUser.fullName
    });
    const refreshToken = generateRefreshToken({
        userCode:newUser.userCode
    });

    newUser.refreshToken=refreshToken;
    await newUser.save();

    const createdUser = await userService.userWithoutPasswordandToken(newUser.userCode);    

    const options = {
        httpOnly: true,
        secure: true
    }
    
    return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponce(201, createdUser, "User registered Successfully")
    )

});

const loginUser =  asyncHandler(async (req:Request,res:Response) => {
    const {email,password} = req.body;

    const validate = [ email, password ];

    userService.validateField(validate);

    const user = await userService.findUserwithEmailOrUsercode(email);

    const isPasswordValid = await user.isPasswordCorrect(password); 

    if(!isPasswordValid) throw new ApiError(401,"Invalid user credential!");

    const accessToken = generateAccessToken({
        userCode:user.userCode,
        email:user.email,
        fullName:user.fullName
    });
    const refreshToken = generateRefreshToken({
        userCode:user.userCode
    });

    user.refreshToken=refreshToken;
    await user.save();

    const loggedInUser = await userService.userWithoutPasswordandToken(user.userCode);

    const options = {
        httpOnly: true,
        secure: true
    }
    
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponce(200, loggedInUser, "User Logged in Successfully")
    )
});

const logout =  asyncHandler(async(req:Request,res:Response) => {
    const userCode = req.user?.userCode;

    if (!userCode) {
        throw new ApiError(401, "Unauthorized Request");
    }

    await userService.unsetRefreshToken(userCode);

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponce(200,{},"User Logout SuccessFully!"))
});

const refreshAccessToken =  asyncHandler(async(req:Request,res:Response) => {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if(!refreshToken) throw new ApiError(401,'Unauthorized Request!');

    const decodeToken = jwt.verify(refreshToken,refreshTokenSecret) as IRefreshtoken;

    const user = await userService.findUserwithEmailOrUsercode(decodeToken.userCode);

    userService.validateUserRefreshToken(refreshToken,user.refreshToken);

    const accessToken = generateAccessToken({
        userCode:user.userCode,
        email:user.email,
        fullName:user.fullName
    });

    const newRefreshToken = generateRefreshToken({
        userCode:user.userCode
    });

    user.refreshToken = newRefreshToken;
    await user.save();

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
        new ApiResponce(
            200, 
            {accessToken, refreshToken: newRefreshToken},
            "Access token refreshed"
        )
    )
});

const fetchDirectReferral = asyncHandler(async(req:Request,res:Response)=>{
    const userCode = req.user?.userCode;

    if (!userCode) {
        throw new ApiError(401, "Unauthorized Request");
    }

    const referredUserDetails =await userService.fetchDirectReferral(userCode);

    return res
    .status(200)
    .json(new ApiResponce(200,referredUserDetails,"Fetch referred User"));
});

const fetchReferralTree = asyncHandler(async(req:Request,res:Response)=>{
    const userCode = req.user?.userCode;

    if (!userCode) {
        throw new ApiError(401, "Unauthorized Request");
    }

    const referrelTree = await userService.referrelTreeofLoggedInUser(userCode);

    return res
    .status(200)
    .json(new ApiResponce(200,referrelTree,"Fetch referral tree"));
});

const dashBoardApiofLoggedinUser = asyncHandler(async(req:Request,res:Response)=>{
    const userCode = req.user?.userCode;

    if (!userCode) {
        throw new ApiError(401, "Unauthorized Request");
    }

    const user = await userService.dashBoardApi(userCode);


    return res
    .status(200)
    .json(new ApiResponce(200,user,"Fetch User's dashboard data"));
});

const chartApiofLoggedInUser = async (req:Request,res:Response)=> {
    const userCode = req.user?.userCode;

    if (!userCode) {
        throw new ApiError(401, "Unauthorized Request");
    }

    const chartData = await userService.chartDataofLoggedInUser(userCode);

    return res
    .status(200)
    .json(new ApiResponce(200,chartData,"Fetch User's Chart data"));
}

export {
    registerUser,
    loginUser,
    logout,
    refreshAccessToken,
    fetchDirectReferral,
    fetchReferralTree,
    dashBoardApiofLoggedinUser,
    chartApiofLoggedInUser
}