import mongoose from "mongoose";
import { Schema } from "mongoose";
import type { IInvestment } from "../interfaces/IInvesment.interface.js";

const investmentSchema = new Schema<IInvestment>({
    refUserCode: {
        type: String,
    },
    investmentCode:{
        type:String,
        require:true,
        unique:true
    },
    amount: {
        type: Number,
        required: true,
        index: true
    },
    planDetails: {
        type: String,
        required: true,
        trim: true
    },
    startDate: {
        type: String,
        required: true,
    },
    endDate: {
        type: String,
        required: true,
    },
    dailyROIPercent: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        default: 'Active',
        required: true
    }
},
    {
        timestamps: true
    }
);

export const Investment = mongoose.model<IInvestment>("Investment",investmentSchema);