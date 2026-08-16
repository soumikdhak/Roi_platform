import type { ISortOptions } from "../interfaces/ISortOptions.interface.js";
import type { IQuery } from "../interfaces/query.interface.js";
import referrelLevelIncomeService from "../services/referralLevelIncome.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import type { Request, Response } from "express";

const referrellevelIncome = asyncHandler(async (req:Request, res:Response) => {
    const rli = await referrelLevelIncomeService.processAllReferralLevelIncome();

    return res.status(200).json(
            new ApiResponce(200, rli, "Daily ROI processing completed")
    );
});

const fetchRliHistoryOfLoggedInUser = async (req:Request, res:Response) => {
    const toUser = req.user?.userCode;
    //console.log(toUser);
    
    if(!toUser) throw new ApiError(401,"Unauthorized request");

    const {sort, page=1, limit=10, date, roiCode} = req.query;

    let sortOptions:ISortOptions = {
        createdAt:sort === 'oldest' ? 1 : -1,
    };

    const query:IQuery = {
        toUser,
    };

    if(date) query.date = String(date);

    if(roiCode) query.roiCode = String(roiCode);

    const skip = (Number(page)-1) * Number(limit);

    const rli = await referrelLevelIncomeService.sortRliHistoryAndcountDocsofLoggedInUser(query,sortOptions,skip,Number(limit));

    const totalPages = Math.ceil(rli?.count/Number(limit));

    return res.status(200).json(
        new ApiResponce(200, {referralIncomes:rli.RLI, pagination:{page:Number(page),limit:Number(limit),count:rli.RLI.length,Total:rli?.count,totalPages:totalPages}}, "Filtered Rois")
    );

}

export {
    referrellevelIncome,
    fetchRliHistoryOfLoggedInUser
}