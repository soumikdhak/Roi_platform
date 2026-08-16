import type { Interface } from "node:readline";
import type { IUserPayload } from "../interfaces/IUserPayload.interface.js";
import userRepository from "../repositories/user.repository.js"
import { ApiError } from "../utils/ApiError.js";
import { getLastSevenDaysDate } from "../utils/getLastSevenDaysDate.js";
import type { chartdata } from "../types/chartData.js";

const userExists = async(userCodeorEmail:string)=>{
    const user =await userRepository.findUser(userCodeorEmail);

    if(user) throw new ApiError(409,"User with this email already exists!");
}

const validateField = (validate:string[],mobileNumber?:string)=> {
    const validateField = validate.every(
        field => typeof field === "string" && field.trim() !== ""
    );

    if(mobileNumber && mobileNumber?.length !== 10) throw new ApiError(400,"please enter a valid mobile number");

    if(!validateField) throw new ApiError(400,"All required fields must be provided!");
}

const findUserwithEmailOrUsercode = async(userCodeorEmail:string)=>{
    const user =await userRepository.findUser(userCodeorEmail);

    if(!user) throw new ApiError(404,"User not found!");

    return user;
}

const createUser = async(userPayload:IUserPayload) => {
    const newUser =await userRepository.createUser(userPayload);

    if (!newUser) throw new ApiError(500, "Error while creating user");

    return newUser;
}

const userWithoutPasswordandToken = async(userCodeorEmail:string)=>{
    const user =await userRepository.userWithoutPasswordandToken(userCodeorEmail);

    if(!user) throw new ApiError(404,"User not found!");

    return user;
}

const unsetRefreshToken = async(userCode:string)=>{
    await userRepository.unsetRefreshToken(userCode);
}

const fetchDirectReferral = async(userCode:string) =>{

    const referralData = await userRepository.fetchDirectreferral(userCode);

    if (referralData.length === 0) {
        throw new ApiError(404, "User not found");
    }
    
    const user = referralData[0];

    if (!user.referredBy) {
        return {
            message: "No Referral Found"
        };
    }

    const fetchreferredUserDetails = {
        referredUserFullName:user.referrerName,
        referredUserEmail:user.referrerEmail,
        referredUserUserCode:user.referrerUserCode
    };

    return fetchreferredUserDetails;
}

const referrelTreeofLoggedInUser = async (userCode:string) => {
    const tree = await userRepository.referrelTreeofLoggedInUser(userCode);

    if (tree.length === 0) {
        throw new ApiError(404, "Tree not found");
    }

    const user = tree[0];

    if(user.referralTree.length === 0) {
        return `${user.fullName} is referred by no one.`
    }

    return user;
}

const dashBoardApi = async (userCode:string) => {
    const user = await userRepository.dashBoardApi(userCode);

    if(!user) throw new ApiError(404,"User not found!");

    return user;
}

const extractUserCodefromReferrelCode = async(referralCode:string) => {
  const userCode = await userRepository.extractUserCodefromReferrelCode(referralCode);

  if(!userCode) return ''

  return userCode;
}

const validateUserRefreshToken = (refreshToken:string,userRefreshToken:string )=> {
    if(refreshToken !== userRefreshToken) throw new ApiError(401,'"Refresh token is expired or used');
}

const chartDataofLoggedInUser = async (userCode: string) => {
    const lastSevendaysdate = getLastSevenDaysDate();

    const chartdata: chartdata[] = await Promise.all(
        lastSevendaysdate.map(async (date) => {
            const roiData = await userRepository.roiData(userCode,date);
            const rliData = await userRepository.rliData(userCode,date);

            const merged = [...roiData, ...rliData];

            let totalAmount = 0;
            merged.forEach((docs) => {
                totalAmount += docs.amount;
            });

            const onlyday = date.split('-')[2];

            return { date:typeof onlyday === 'string'?onlyday:'', totalAmount };
        })
    );

    return chartdata;
};

const userService = {
    userExists,
    findUserwithEmailOrUsercode,
    createUser,
    userWithoutPasswordandToken,
    unsetRefreshToken,
    fetchDirectReferral,
    referrelTreeofLoggedInUser,
    dashBoardApi,
    extractUserCodefromReferrelCode,
    validateField,
    validateUserRefreshToken,
    chartDataofLoggedInUser
}

export default userService;