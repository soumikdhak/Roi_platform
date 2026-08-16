
export interface IUser{
    fullName:string,
    email:string,
    userCode:string,
    mobileNumber:string,
    password:string,
    referralCode:string,
    referredBy:string
    walletBalance:number,
    totalROIEarned:number,
    accountStatus:string
    totalLevelIncomeEarned:number,
    refreshToken:string,
    createdAt:Date,
    updatedAt:Date,
    isPasswordCorrect(password:string):Boolean
}