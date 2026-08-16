import type { IInvestmentpayload } from "../interfaces/IInvestmentPayload.interface.js";
import type { ISortOptions } from "../interfaces/ISortOptions.interface.js";
import { Investment } from "../models/investment.model.js";
import type { ClientSession } from "mongoose";

const findInvestment = async (investmentCode:string) => {
    const investment =await Investment.findOne({investmentCode:investmentCode});

    return investment;
}

const createInvestment = async (payload:IInvestmentpayload, session: ClientSession)=>{
    const investment =await Investment.create([payload],{session});

    return investment;
}

const getAllinvestmentofLoggedInUser = async (userCode:string,sortOptions:ISortOptions) => {
    const investments =await Investment.find({refUserCode:userCode})
    .sort(sortOptions);

    return investments;
} 

const countAllInvestments = async(userCode:string) => {
    const count:number =await Investment.countDocuments({refUserCode:userCode});

    return count;
}


const investmentRepository = {
    findInvestment,
    createInvestment,
    getAllinvestmentofLoggedInUser,
    countAllInvestments
}

export default investmentRepository;