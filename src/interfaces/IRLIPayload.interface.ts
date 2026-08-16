export interface reffer {
    fullName:string,
    userCode:string,
    email:string,
    level:number
} 

export interface IRIPayload{
    userCode:string,
    roiCode:string,
    amount:number,
    date:Date,
    status:string,
    fullName:string,
    referralTree: reffer[]
}