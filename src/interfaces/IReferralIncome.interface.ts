
export interface IReferralSchema{
    toUser:string,
    fromUser:string,
    roiCode:string
    amount:number,
    date:string,
    level:number,
    createdAt:Date,
    updatedAt:Date
}