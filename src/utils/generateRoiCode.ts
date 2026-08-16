import { ROIHistory } from '../models/RoiHistory.model.js';

export const generateRoiCode = async ():Promise<string> => {
    const latestROI = await ROIHistory.findOne().sort({ createdAt: -1 });

    if(!latestROI) return "0001"

    const code:string = "000"+String(Number(latestROI.roiCode)+1);

    return code;
}; 