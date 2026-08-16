import { Investment } from "../models/investment.model.js";

export const generateInvestmentCode = async ():Promise<string> => {
    const latestInvestment = await Investment.findOne().sort({ createdAt: -1 });

    if(!latestInvestment) return "0001"

    const code:string = "000"+String(Number(latestInvestment.investmentCode)+1);

    return code;
} 
