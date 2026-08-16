import { User } from "../models/user.model.js";

export const generateUserCode = async ():Promise<string> => {
    const latestUser = await User.findOne().sort({ createdAt: -1 });

    if(!latestUser) return "0001"

    const code:string = "000"+String(Number(latestUser.userCode)+1);

    return code;
} 
