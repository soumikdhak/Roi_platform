import { roiHistoryStatus } from "../constants/roiHistoryStatus.js";
import referralLevelIncomeRepository from "../repositories/referralLevelIncome.repository.js";
import type { IReferralLevelPayload } from "../interfaces/referralLevelPayload.interface.js";
import type { IRIPayload } from "../interfaces/IRLIPayload.interface.js";
import type { IQuery } from "../interfaces/query.interface.js";
import type { ISortOptions } from "../interfaces/ISortOptions.interface.js";

const getTodayDateString = (): string => {
    return new Date().toISOString().split("T")[0] as string; // "2026-07-31"
};

const createRLI = async (payload:IReferralLevelPayload) => {
    const rli = await referralLevelIncomeRepository.createReferrelLevelIncomeandUpdateBalance(payload);

    return rli;
}

const processReferralLevelIncome = async (roi: IRIPayload) => {
  if (roi.status !== roiHistoryStatus.Credited.code) {
    return { skipped: true, message: "Roi not active" };
  }

  const today = getTodayDateString();

  const existsTodaysRLI =
    await referralLevelIncomeRepository.findDailyReferralIncomeExists(
      roi.roiCode,
      today,
    );

  if (existsTodaysRLI) return { skipped: true, message: "RLI already exists!" };

  const rlis = [];
  const referrelTree = roi.referralTree;
  let referrelLevel = Number(process.env.REFERREL_LEVEL);
  let level = referrelLevel;

  if(referrelTree.length===0) return {Skipped:true, message:"This user don't have any referral"}
  for (let referrel = 0; referrel < referrelLevel; referrel++) {
    if (referrelTree.length > referrel) {
      try {
        const amount = Math.ceil((roi.amount * level) / 100);

        const payload: IReferralLevelPayload = {
          toUser: referrelTree[referrel]!?.userCode,
          fromUser: roi.userCode,
          roiCode: roi.roiCode,
          amount,
          date: today,
          level: referrelTree[referrel]!?.level,
        };

        const rli = await createRLI(payload);

        level--;

        rlis.push(rli);
      } catch (error) {
        rlis.push({
          roiCode: roi.roiCode,
          error: (error as Error).message,
        });
      }
    }
  }

  return {skipped:false, rlis:rlis};
};

const processAllReferralLevelIncome = async () => {

    const today =getTodayDateString();
    const creditedRois = await referralLevelIncomeRepository.getAllCreaditedRoiandfetchReferralTreeOfRoiUser(today);

    const results = [];

    for(const roi of creditedRois){
        try {
            const result = await processReferralLevelIncome(roi);

            results.push(result);
        } catch (error) {
            results.push({
                roiCode:roi.roiCode,
                error:(error as Error).message
            });
        }
    }

    return results;
}

const sortRliHistoryAndcountDocsofLoggedInUser = async(query:IQuery,sortOptions:ISortOptions,skip:number,limit:number) => {
    const rli =await referralLevelIncomeRepository.sortRliHistoryAndcountDocsofLoggedInUser(query,sortOptions,skip,limit);

    return rli;
}

const referrelLevelIncomeService = {
    getTodayDateString,
    processAllReferralLevelIncome,
    sortRliHistoryAndcountDocsofLoggedInUser
}

export default referrelLevelIncomeService;