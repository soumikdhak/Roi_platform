import mongoose from "mongoose";
import { Schema } from "mongoose";
import type{ IReferralSchema } from "../interfaces/IReferralIncome.interface.js";

const referralSchema = new Schema<IReferralSchema>({
    toUser: {
        type:String,
        required:true,
        index:true,
        trim:true
    },
    fromUser: {
        type:String,
        required:true,
        index:true,
        trim:true
    },
    roiCode:{
        type:String,
        required:true,
        index:true,
        trim:true
    },
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: String,
        required: true,
    },
    level: {
        type: Number,
        required: true
    }
},
    {
        timestamps: true
    }
);

referralSchema.index({ roiCode: 1, toUser: 1 }, { unique: true });
referralSchema.index({ toUser: 1, date: 1 });

export const ReferralIncome = mongoose.model<IReferralSchema>("ReferralIncome",referralSchema);