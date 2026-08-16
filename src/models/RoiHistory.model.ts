import mongoose from "mongoose";
import { Schema } from "mongoose"; 
import type { IRoiHistory } from "../interfaces/IRoiHistory.interface.js";

const roiHistorySchema = new Schema<IRoiHistory>({
    userCode: {
        type: String,
        required: true,
        index: true
    },
    investmentCode: {
        type: String,
        required: true,
        index: true
    },
    roiCode:{
        type:String,
        required:true,
        index:true
    },
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: "Credited"
    }
},
    {
        timestamps: true
    }
);

roiHistorySchema.index({ investmentCode: 1, date: 1 }, { unique: true });
roiHistorySchema.index({ userCode: 1, date: 1 });

export const ROIHistory = mongoose.model<IRoiHistory>("ROIHistory",roiHistorySchema);