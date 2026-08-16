import { User } from "../models/user.model.js";
import type { IUserPayload } from "../interfaces/IUserPayload.interface.js";
import { ApiError } from "../utils/ApiError.js";
import type { ClientSession } from "mongoose";
import { ROIHistory } from "../models/RoiHistory.model.js";
import { ReferralIncome } from "../models/referralIncome.model.js";

const findUser = async (userCodeorEmail: string) => {
  const user = await User.findOne({
    $or: [{ userCode: userCodeorEmail }, { email: userCodeorEmail }],
  });

  return user;
};

const createUser = async (userPayload: IUserPayload) => {
  const newUser = await User.create(userPayload);

  return newUser;
};

const userWithoutPasswordandToken = async (userCodeorEmail: string) => {
  const user = await User.findOne({
    $or: [{ userCode: userCodeorEmail }, { email: userCodeorEmail }],
  }).select("-password -refreshToken");

  return user;
};

const unsetRefreshToken = async (userCode: string) => {
  const user = await User.findOneAndUpdate(
    { userCode },
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      returnDocument: "after",
    },
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

const fetchDirectreferral = async (userCode: string) => {
  const result = await User.aggregate([
    {
      $match: {
        userCode: userCode,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "referredBy",
        foreignField: "userCode",
        as: "referrer",
      },
    },
    {
      $unwind: {
        path: "$referrer",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        fullName: 1,
        email: 1,
        userCode: 1,
        referredBy: 1,
        referrerName: "$referrer.fullName",
        referrerEmail: "$referrer.email",
        referrerUserCode: "$referrer.userCode",
      },
    },
  ]);

  return result;
};

const referrelTreeofLoggedInUser = async (userCode: string) => {
  const pipeline = [
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
    },
    {
      $project: {
        referralTree: {
          fullName: 1,
          userCode: 1,
          email: 1,
          level: 1,
        },
        fullName: 1,
        userCode: 1,
        _id: 0,
      },
    },
    {
      $match: {
        userCode: userCode,
      },
    },
  ];

  const result = User.aggregate(pipeline);

  return result;
};

const updateUserbalance = async (
  userCode: string,
  amount: number,
  session: ClientSession,
) => {
  const user = await User.findOneAndUpdate(
    { userCode, walletBalance: { $gte: amount } },
    { $inc: { walletBalance: -amount } },
    { returnDocument: "after", session },
  );

  return user;
};

const dashBoardApi = async (userCode: string) => {
  const pipeline =[
  {
    $match: {
      userCode: userCode
    }
  },
  {
    $lookup: {
      from: "investments",
      localField: "userCode",
      foreignField: "refUserCode",
      pipeline: [
        {
          $match: {
            status: "Active"
          }
        }
      ],
      as: "activeInvestment"
    }
  },
  {
    $set: {
      activeInvestments: { $size: "$activeInvestment" }
    }
  },
  {
    $addFields: {
      totalInvestments: {
        $sum: "$activeInvestment.amount"
      }
    }
  },
  {
    $project: {
      _id: 0,
      fullName: 1,
      email: 1,
      userCode: 1,
      totalLevelIncomeEarned: 1,
      totalROIEarned: 1,
      walletBalance: 1,
      activeInvestments: 1,
      accountStatus: 1,
      totalInvestments: 1,
      referralCode:1
    }
  }
];

  const user = await User.aggregate(pipeline);

  return user[0];
};

const extractUserCodefromReferrelCode = async(referralCode:string) => {
  const user = await User.findOne({referralCode},{userCode:1, _id:0});

  return user?.userCode;
}

const roiData = async (userCode:string,date:string) => {
  
  const rois = await ROIHistory.aggregate([
    {
      $match: {
        userCode: userCode,
        date: date,
      },
    },
  ]);

  
  return rois;
}

const rliData = async (toUser:string,date:string) => {
  
    const rlis = await ReferralIncome.aggregate([
    {
      $match: {
        toUser: toUser,
        date: date,
      },
    },
  ]);
  
    return rlis;
}

const userRepository = {
  findUser,
  createUser,
  userWithoutPasswordandToken,
  unsetRefreshToken,
  fetchDirectreferral,
  referrelTreeofLoggedInUser,
  updateUserbalance,
  dashBoardApi,
  extractUserCodefromReferrelCode,
  roiData,
  rliData
};

export default userRepository;
