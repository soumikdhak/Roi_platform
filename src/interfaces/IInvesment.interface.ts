export interface IInvestment{
    refUserCode:string,
    investmentCode:string,
    amount:number,
    planDetails:string,
    startDate:string,
    endDate:string,
    dailyROIPercent:number,
    status:string,
    createdAt:Date,
    updatedAt:Date
}