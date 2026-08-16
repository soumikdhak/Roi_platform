import { investmentStatus } from "../constants/investmentStatus.js";
import type { IInvestment } from "../interfaces/IInvesment.interface.js";
import type { IRoiPayload } from "../interfaces/IRoiPayload.interface.js";
import type { ISortOptions } from "../interfaces/ISortOptions.interface.js";
import type { IQuery } from "../interfaces/query.interface.js";
import roiHistoryRepository from "../repositories/roiHistory.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { generateRoiCode } from "../utils/generateRoiCode.js";

const getTodayDateString = (): string => {
    return new Date().toISOString().split("T")[0] as string; // "2026-07-31"
};

const processDailyRoi = async (investment:IInvestment) => {

    if (investment.status !== investmentStatus.Active.code) {
        return { skipped: true, message: "Investment not active" };
    }

    const today = getTodayDateString();
    const endDate = investment.endDate

    if(today>endDate) {
        await roiHistoryRepository.markInvestmentComplete(investment.investmentCode);
        return {skipped: true, message: "Investment Expired"}
    }

    const existTodaysRoi = await roiHistoryRepository.findDailyRoiExists(investment.investmentCode,today);

    if(existTodaysRoi) {
        return {skipped:true, message:'Roi already exists!'}
    }

    const roiAmount = Math.ceil(investment.amount * (investment.dailyROIPercent/100));
    const roiCode =await generateRoiCode();

    const payload:IRoiPayload = {
        userCode:investment.refUserCode,
        investmentCode:investment.investmentCode,
        roiCode,
        amount:roiAmount,
        date:today,
    }

    const roi = await roiHistoryRepository.createRoiandUpdateBalance(payload);

    if(today===endDate) await roiHistoryRepository.markInvestmentComplete(investment.investmentCode);

    return {skipped:false,ROI:roi};
}

const processAllDailyRoi = async () => {
    const activeInvestments = await roiHistoryRepository.getAllActiveInvestment();

    const results = [];

    for(const investment of activeInvestments){
        try {
            const result = await processDailyRoi(investment);
            results.push(result); 
        } catch (error) {
            results.push({
                roiCode:investment.investmentCode,
                error:(error as Error).message
            });
        }
    }

    return results;
}

const sortRoiHistoryofLoggedInUser = async(query:IQuery,sortOptions:ISortOptions,skip:number,limit:number) => {
    const roi =await roiHistoryRepository.sortRoiHistoryofLoggedInUser(query,sortOptions,skip,limit);

    return roi;
}

const roiHistoryService = {
    getTodayDateString,
    processDailyRoi,
    processAllDailyRoi,
    sortRoiHistoryofLoggedInUser,
}

export default roiHistoryService;