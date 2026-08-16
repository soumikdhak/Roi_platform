import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import type { Request, Response } from "express";
import { generateInvestmentCode } from "../utils/genarateinvestmentCode.js";
import investmentService from "../services/investment.service.js";
import { investmentStatus } from "../constants/investmentStatus.js";
import type { IInvestmentpayload } from "../interfaces/IInvestmentPayload.interface.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import type { ISortOptions } from "../interfaces/ISortOptions.interface.js";


const craeteInvestment = asyncHandler(async(req:Request, res:Response)=>{
    const {amount, planDetails, endDate, dailyROIPercent} = req.body;
    const investmentCode =await generateInvestmentCode();

    const validate = [amount, planDetails, endDate, dailyROIPercent]
    
    investmentService.validateField(validate,amount);

    await investmentService.checkDuplicateInvestment(investmentCode);

    const refUser:string = req.user?.userCode;

    await investmentService.checkUserWalletBalance(refUser, amount);

    const investmentPayload:IInvestmentpayload = {
        refUserCode:refUser,
        investmentCode:investmentCode,
        amount,
        planDetails,
        startDate:investmentService.getTodayDateString(),
        endDate,
        dailyROIPercent,
        status:investmentStatus.Active.code
    }

    const newInvestment = await investmentService.createInvestmentandUpdateUserBalance(investmentPayload,amount);

    return res
    .status(201)
    .json(
        new ApiResponce(201, newInvestment, "Investment created successfully")
    )

});

const ShowallLoggedInUserInvestment = asyncHandler(async(req:Request, res:Response)=>{
    const userCode = req.user?.userCode as string;
    const {sort} = req.query;

    if(!userCode) throw new ApiError(401,"Unauthorized request");

    let sortOptions:ISortOptions = {
        createdAt:sort === 'oldest' ? 1 : -1,
    }

    const investments = await investmentService.getAllinvestmentofLoggedInUser(userCode, sortOptions);

    const count =await investmentService.countAllInvestments(userCode);

    return res
    .status(200)
    .json(
        new ApiResponce(200, {investments:investments, count:count}, "All listed Investments")
    )

})

export {
    craeteInvestment,
    ShowallLoggedInUserInvestment
}