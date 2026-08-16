import type { ISortOptions } from "../interfaces/ISortOptions.interface.js";
import roiHistoryService from "../services/roiHistory.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import type { Response, Request } from "express";
import type { IQuery } from "../interfaces/query.interface.js";

const generateDailyRoi = asyncHandler(async(req:Request,res:Response) => {
    const rois = await roiHistoryService.processAllDailyRoi();

    return res.status(200).json(
        new ApiResponce(200, rois, "Daily ROI processing completed")
    );
});

const fetchRoiHistoryofLoggedInUser = asyncHandler(async(req:Request,res:Response) => {
    const userCode = req.user?.userCode;

    if(!userCode) throw new ApiError(401,"Unauthorized request");

    const {sort, page=1, limit=10, date, investmentCode} = req.query;

    let sortOptions:ISortOptions = {
        createdAt:sort === 'oldest' ? 1 : -1,
    };

    const query:IQuery = {
        userCode,
    };

    if(typeof date === "string" && date.trim()!=="") query.date = String(date);

    if(typeof investmentCode === "string" && investmentCode.trim()!=="") query.investmentCode = String(investmentCode);

    const skip = (Number(page)-1) * Number(limit);

    const roi = await roiHistoryService.sortRoiHistoryofLoggedInUser(query,sortOptions,skip,Number(limit));

    const totalPages = Math.ceil(roi.count/Number(limit));

    return res.status(200).json(
        new ApiResponce(200, {roiHistory:roi.ROI, pagination:{page:Number(page),limit:Number(limit),count:roi.ROI.length,Total:roi.count,totalPages:totalPages}}, "Filtered Rois")
    );
})

export {
    generateDailyRoi,
    fetchRoiHistoryofLoggedInUser
}