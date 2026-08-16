import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt'
import type { IUser } from "../interfaces/IUser.interface.js";

export const userSchema = new Schema<IUser>({
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    userCode:{
        type:String,
        required:true,
        index:true
    },
    mobileNumber: {
        type: String,
    },
    password: {
        type: String,
        required: true
    },
    referralCode: {
        type: String,
        unique: true,
        required:true
    },
    referredBy: {
        type: String
    },
    walletBalance: {
        type: Number,
        default:0
    },
    totalROIEarned: {
        type: Number
    },
    accountStatus: {
        type: String,
        default: 'Active',
        required: true
    },
    totalLevelIncomeEarned: {
        type: Number
    },
    refreshToken: {
        type: String
    }
},
    {
        timestamps: true
    }
);

userSchema.pre("save", async function () {
    if (!this?.isModified('password')) return;

    this.password = await bcrypt.hash(this?.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password: string) {    
    return await bcrypt.compare(password, this.password);
};

export const User = mongoose.model<IUser>("User", userSchema);