import type { IInvestmentpayload } from "../interfaces/IInvestmentPayload.interface.js";
import type { ISortOptions } from "../interfaces/ISortOptions.interface.js";
import investmentRepository from "../repositories/investment.repository.js";
import userRepository from "../repositories/user.repository.js";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { validate } from "node-cron";

const getTodayDateString = (): string => {
    return new Date().toISOString().split("T")[0] as string; // "2026-07-31"
};

const validateField = (
    validate: (string | number | undefined | null)[],amount:number
) => {
    const isValid = validate.every(field => {
        if (field === undefined || field === null) {
            return false;
        }

        if (typeof field === "string") {
            return field.trim() !== "";
        }

        return true;
    });

    if (!isValid) {
        throw new ApiError(
            400,
            "All required fields must be provided!"
        );
    }

    if(amount && amount <= 0)  {
      throw new ApiError(
          400,
          "All required fields must be provided!"
      );
    }
};

const checkDuplicateInvestment = async (investmentCode: string) => {
  const duplicate = await investmentRepository.findInvestment(investmentCode);

  if(duplicate) throw new ApiError(409,'Duplicate Investment');

  return false;
};

const createInvestmentandUpdateUserBalance = async (
    payload: IInvestmentpayload,
    amount: number,
) => {
    const session = await mongoose.startSession();

    try {
      let investment;
      let balance;
    
      await session.withTransaction(async () => {
    
        const user = await userRepository.updateUserbalance(
          payload.refUserCode,
          amount,
          session
        );

        if (!user) {
            throw new ApiError(404, "Referrer user not found");
        }

        investment = await investmentRepository.createInvestment(payload, session); 

        balance = user?.walletBalance;
      });
    
      return {
        investment,
        balance: balance,
      };
    } finally {
      await session.endSession();
    }
};

const getAllinvestmentofLoggedInUser = async (
  userCode: string,
  sortOptions: ISortOptions,
) => {
  const investments = await investmentRepository.getAllinvestmentofLoggedInUser(
    userCode,
    sortOptions,
  );

  return investments;
};

const countAllInvestments = async (userCode: string) => {
  const count: number =
    await investmentRepository.countAllInvestments(userCode);

  return count;
};

const checkUserWalletBalance = async (userCode: string, amount: number) => {
  const user = await userRepository.findUser(userCode);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const walletBalance: number = Number(user?.walletBalance);

  if (amount > walletBalance) throw new ApiError(400,"Your balance is less than your amount");

  return true;
};

const investmentService = {
  checkDuplicateInvestment,
  createInvestmentandUpdateUserBalance,
  getAllinvestmentofLoggedInUser,
  countAllInvestments,
  checkUserWalletBalance,
  getTodayDateString,
  validateField
};

export default investmentService;
