import type { IReferralLevelPayload } from "../interfaces/referralLevelPayload.interface.js";
import { ReferralIncome } from "../models/referralIncome.model.js";
import { ROIHistory } from "../models/RoiHistory.model.js";
import mongoose from 'mongoose';
import { User } from "../models/user.model.js";
import type { IQuery } from "../interfaces/query.interface.js";
import type { ISortOptions } from "../interfaces/ISortOptions.interface.js";
import { count } from "node:console";

const findDailyReferralIncomeExists = async(roiCode:string, today:string) => {
    const dailyROI =await ReferralIncome.findOne({roiCode:roiCode,today});

    return dailyROI;
};

const getAllCreaditedRoiandfetchReferralTreeOfRoiUser = async (today:string) => {
  const pipeline = [
    {
      $match: {
        status: "Credited",
        date:today
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userCode",
        foreignField: "userCode",
        as: "user",
        pipeline: [
          {
            $graphLookup: {
              from: "users",
              startWith: "$referredBy",
              connectFromField: "referredBy",
              connectToField: "userCode",
              as: "referralTree",
              depthField: "level",
            },
          },
          {
            $set: {
              referralTree: {
                $sortArray: {
                  input: "$referralTree",
                  sortBy: {
                    level: 1,
                  },
                },
              },
            },
          }
        ],
      },
    },
    { $unwind: "$user" },
    {
      $set: {
        fullName: "$user.fullName",
        referralTree: "$user.referralTree",
      },
    },
    {
      $project: {
        roiCode: 1,
        amount: 1,
        userCode: 1,
        date: 1,
        status:1,
        fullName: 1,
        referralTree: {
                fullName: 1,
                userCode: 1,
                email: 1,
                level: 1,
              },
        _id:0
      },
    },
  ];

  const creditedRoi = ROIHistory.aggregate(pipeline);

  return creditedRoi;
};

const createReferrelLevelIncomeandUpdateBalance = async (payload:IReferralLevelPayload) => {
    const session =await mongoose.startSession();

    session.startTransaction();

    try {
        const referrelLevelIncome = await ReferralIncome.create([payload],{session});

        const user = await User.findOneAndUpdate({userCode:payload.toUser},{$inc:{walletBalance:payload.amount, totalLevelIncomeEarned:payload.amount}},{returnDocument:'after',session});

        await session.commitTransaction();

        return {
            referrelLevelIncome:user?user.totalLevelIncomeEarned:"user not found!",
            roiCode:referrelLevelIncome[0]?.roiCode,
            amount:referrelLevelIncome[0]?.amount,
            level:referrelLevelIncome[0]?.level,
            toUser:referrelLevelIncome[0]?.toUser,
            fromUser:referrelLevelIncome[0]?.fromUser
        }
    } catch (error) {
        console.error(`Error:${error}`);
        await session.abortTransaction();
        throw error;
    }finally{
        session.endSession();
    }
}

const sortRliHistoryAndcountDocsofLoggedInUser = async (query:IQuery,sortOptions:ISortOptions,skip:number,limit:number) => {
    const rli = await ReferralIncome.find(query).sort(sortOptions).skip(skip).limit(limit).select("-__v -_id");
    const count = await ReferralIncome.countDocuments(query);
    return { RLI: rli, count: count };
}

const referralLevelIncomeRepository = {
    getAllCreaditedRoiandfetchReferralTreeOfRoiUser,
    findDailyReferralIncomeExists,
    createReferrelLevelIncomeandUpdateBalance,
    sortRliHistoryAndcountDocsofLoggedInUser
}

export default referralLevelIncomeRepository;
