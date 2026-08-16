import { Investment } from "../models/investment.model.js";
import { ROIHistory } from "../models/RoiHistory.model.js"
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { investmentStatus } from "../constants/investmentStatus.js";
import type { IRoiPayload } from "../interfaces/IRoiPayload.interface.js";
import type { IUser } from "../interfaces/IUser.interface.js";
import type { ISortOptions } from "../interfaces/ISortOptions.interface.js";
import type { IQuery } from "../interfaces/query.interface.js";

const findDailyRoiExists = async(investmentCode:string, today:string) => {
    const dailyROI =await ROIHistory.findOne({investmentCode:investmentCode,today});

    return dailyROI;
};

const getAllActiveInvestment = async () => {
    const activeInvestments = await Investment.find({status:
"Active"});

return activeInvestments;
}

const createRoiandUpdateBalance = async (payload:IRoiPayload) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const roi = await ROIHistory.create([payload],{session});

        const user = await User.findOneAndUpdate({userCode:payload.userCode},{$inc:{walletBalance:payload.amount, totalROIEarned:payload.amount}},{returnDocument:'after',session});

        await session.commitTransaction();

        return {
            status: roi[0]!.status, 
            totalROIEarned:user?user.totalROIEarned:"user not found",
            investmentCode:roi[0]!.investmentCode,
            amount:roi[0]!.amount
        }
    } catch (error) {
        await session.abortTransaction();
        throw error;
    }finally {
        session.endSession();
    }
}

const markInvestmentComplete = async (investmentCode:string) => {
    const investment = await Investment.findOneAndUpdate({investmentCode},{$set:{status:investmentStatus.Completed.code}},{new:true});

    return investment;
}

const sortRoiHistoryofLoggedInUser = async(query:IQuery,sortOptions:ISortOptions,skip:number,limit:number) => {
    const roi = await ROIHistory.find(query)
        .skip(skip)
        .limit(limit)
        .sort(sortOptions)
        .select("-__v -_id");

    const count = await ROIHistory.countDocuments(query);

    return {ROI:roi, count:count};
};

const roiHistoryRepository = {
    findDailyRoiExists,
    getAllActiveInvestment,
    createRoiandUpdateBalance,
    markInvestmentComplete,
    sortRoiHistoryofLoggedInUser,
}

export default roiHistoryRepository;